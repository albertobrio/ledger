import { pool } from "./db.js";
import { sha256, sign } from "./crypto.js";
import { ensureStreamEnabled } from "./tenant.js";

export function canonicalJson(value: any): string {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map(canonicalJson).join(",")}]`;
    }

    const keys = Object.keys(value).sort();

    return `{${keys
        .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
        .join(",")}}`;
}

export async function appendEntry(streamId: string, eventType: string, payload: any) {
    const conn = await pool.getConnection();
    await ensureStreamEnabled(streamId);
    try {
        await conn.beginTransaction();

        const [rows]: any = await conn.query(
            `SELECT * 
       FROM ledger_entry 
       WHERE stream_id = ? 
       ORDER BY sequence_number DESC 
       LIMIT 1 
       FOR UPDATE`,
            [streamId]
        );

        const last = rows[0];

        const sequence = (last?.sequence_number ?? 0) + 1;
        const previousHash = last?.current_hash ?? "GENESIS";

        const payloadJson = canonicalJson(payload);

        const material = `${sequence}|${streamId}|${eventType}|${payloadJson}|${previousHash}`;
        const currentHash = sha256(material);
        const signature = sign(currentHash);

        await conn.query(
            `INSERT INTO ledger_entry 
  (sequence_number, stream_id, event_type, payload_json, previous_hash, current_hash, signature_base64, created_utc)
  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(6))`,
            [sequence, streamId, eventType, payloadJson, previousHash, currentHash, signature]
        );

        await conn.commit();

        return {
            sequence,
            streamId,
            eventType,
            currentHash,
            previousHash,
            signature
        };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}