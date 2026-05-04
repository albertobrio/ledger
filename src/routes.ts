import { appendEntry, canonicalJson } from "./ledger.service.js";
import { pool } from "./db.js";
import { sha256, verify, sign, getPublicKey } from "./crypto.js";
import { buildMerkleRoot, buildMerkleProof, verifyMerkleProof } from "./merkle.js";
import { createDigestForStreamAndDate } from "./digest.service.js";
import { anchorDigest } from "./anchor.service.js";

export async function routes(app: any) {
    app.post("/entries", async (req: any) => {
        const { streamId, eventType, payload } = req.body;

        if (!streamId || !eventType || !payload) {
            return {
                error: "streamId, eventType and payload are required"
            };
        }

        return await appendEntry(streamId, eventType, payload);
    });

    app.get("/public-key", async () => {
        return { publicKey: getPublicKey() };
    });

    app.get("/streams/:streamId/verify", async (req: any) => {
        const { streamId } = req.params;

        const [rows]: any = await pool.query(
            `SELECT * 
       FROM ledger_entry 
       WHERE stream_id = ? 
       ORDER BY sequence_number`,
            [streamId]
        );

        let prev = "GENESIS";

        for (const r of rows) {
            const payloadJson =
                typeof r.payload_json === "string"
                    ? r.payload_json
                    : canonicalJson(r.payload_json);

            const material = `${r.sequence_number}|${r.stream_id}|${r.event_type}|${payloadJson}|${r.previous_hash}`;
            const hash = sha256(material);

            if (r.previous_hash !== prev) {
                return {
                    valid: false,
                    reason: `Invalid previous hash at sequence ${r.sequence_number}`
                };
            }

            if (hash !== r.current_hash) {
                return {
                    valid: false,
                    reason: `Invalid current hash at sequence ${r.sequence_number}`
                };
            }

            if (!verify(hash, r.signature_base64)) {
                return {
                    valid: false,
                    reason: `Invalid signature at sequence ${r.sequence_number}`
                };
            }

            prev = r.current_hash;
        }

        return {
            valid: true,
            entries: rows.length,
            lastHash: prev
        };
    });

    app.post("/streams/:streamId/digests/:date", async (req: any) => {
        const { streamId, date } = req.params;

        const digest = await createDigestForStreamAndDate(streamId, date);
        const anchor = await anchorDigest(digest);

        return {
            ...digest,
            anchor
        };
    });

    app.get("/streams/:streamId/digests/:date", async (req: any) => {
        const { streamId, date } = req.params;

        const [rows]: any = await pool.query(
            `SELECT *
       FROM ledger_daily_digest
       WHERE stream_id = ?
       AND digest_date = ?`,
            [streamId, date]
        );

        if (rows.length === 0) {
            return {
                found: false,
                message: "Digest not found"
            };
        }

        const d = rows[0];

        return {
            found: true,
            streamId: d.stream_id,
            date: d.digest_date,
            merkleRoot: d.merkle_root,
            blockCount: d.block_count,
            signature: d.signature_base64,
            signatureValid: verify(d.merkle_root, d.signature_base64)
        };
    });

    app.get("/streams/:streamId/proof/:sequence", async (req: any) => {
        const { streamId, sequence } = req.params;

        const [targetRows]: any = await pool.query(
            `SELECT *
       FROM ledger_entry
       WHERE stream_id = ?
       AND sequence_number = ?`,
            [streamId, sequence]
        );

        if (targetRows.length === 0) {
            return {
                found: false,
                message: "Entry not found"
            };
        }

        const target = targetRows[0];
        const date = target.created_utc.toISOString().slice(0, 10);

        const [dayRows]: any = await pool.query(
            `SELECT sequence_number, current_hash
       FROM ledger_entry
       WHERE stream_id = ?
       AND DATE(created_utc) = ?
       ORDER BY sequence_number`,
            [streamId, date]
        );

        const hashes = dayRows.map((r: any) => r.current_hash);
        const targetIndex = dayRows.findIndex(
            (r: any) => Number(r.sequence_number) === Number(sequence)
        );

        const merkleRoot = buildMerkleRoot(hashes);
        const proof = buildMerkleProof(hashes, targetIndex);

        return {
            found: true,
            streamId,
            sequence: Number(sequence),
            date,
            leafHash: target.current_hash,
            merkleRoot,
            proof,
            proofValid: verifyMerkleProof(target.current_hash, proof, merkleRoot)
        };
    });

    app.post("/verify-proof", async (req: any) => {
        const { leafHash, proof, merkleRoot } = req.body;

        if (!leafHash || !proof || !merkleRoot) {
            return {
                valid: false,
                reason: "leafHash, proof and merkleRoot are required"
            };
        }

        return {
            valid: verifyMerkleProof(leafHash, proof, merkleRoot)
        };
    });
}