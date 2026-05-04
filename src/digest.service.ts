import { pool } from "./db.js";
import { sign } from "./crypto.js";
import { buildMerkleRoot } from "./merkle.js";

export async function createDigestForStreamAndDate(streamId: string, date: string) {
    const [rows]: any = await pool.query(
        `SELECT current_hash 
     FROM ledger_entry 
     WHERE stream_id = ?
     AND DATE(created_utc) = ?
     ORDER BY sequence_number`,
        [streamId, date]
    );

    const hashes = rows.map((r: any) => r.current_hash);
    const merkleRoot = buildMerkleRoot(hashes);
    const signature = sign(merkleRoot);

    await pool.query(
        `INSERT INTO ledger_daily_digest
     (stream_id, digest_date, merkle_root, block_count, signature_base64, created_utc)
     VALUES (?, ?, ?, ?, ?, NOW(6))
     ON DUPLICATE KEY UPDATE
     merkle_root = VALUES(merkle_root),
     block_count = VALUES(block_count),
     signature_base64 = VALUES(signature_base64),
     created_utc = VALUES(created_utc)`,
        [streamId, date, merkleRoot, hashes.length, signature]
    );

    return {
        streamId,
        date,
        merkleRoot,
        blockCount: hashes.length,
        signature
    };
}

export async function getDistinctStreamsForDate(date: string): Promise<string[]> {
    const [rows]: any = await pool.query(
        `SELECT DISTINCT stream_id
     FROM ledger_entry
     WHERE DATE(created_utc) = ?`,
        [date]
    );

    return rows.map((r: any) => r.stream_id);
}