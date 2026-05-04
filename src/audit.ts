import { pool } from "./db.js";

export async function auditResponse(req: any, reply: any) {
    try {
        await pool.query(
            `INSERT INTO ledger_api_audit
       (request_id, method, url, ip, status_code, created_utc)
       VALUES (?, ?, ?, ?, ?, NOW(6))`,
            [
                req.id,
                req.method,
                req.url,
                req.ip,
                reply.statusCode
            ]
        );
    } catch (err) {
        req.log.error({ err }, "Failed to write API audit");
    }
}