import { pool } from "./db.js";

export async function ensureStreamEnabled(streamId: string) {
    const [rows]: any = await pool.query(
        `SELECT stream_id
     FROM ledger_stream
     WHERE stream_id = ?
     AND enabled = TRUE
     LIMIT 1`,
        [streamId]
    );

    if (rows.length === 0) {
        throw new Error(`Stream not enabled: ${streamId}`);
    }
}