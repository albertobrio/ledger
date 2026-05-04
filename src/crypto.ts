import crypto from "crypto";
import fs from "fs";

const privateKeyPath = process.env.PRIVATE_KEY_PATH || "private.pem";
const publicKeyPath = process.env.PUBLIC_KEY_PATH || "public.pem";

const privateKey = crypto.createPrivateKey(fs.readFileSync(privateKeyPath));
const publicKey = crypto.createPublicKey(fs.readFileSync(publicKeyPath));

export function sha256(data: string): string {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export function sign(data: string): string {
    const signature = crypto.sign(null, Buffer.from(data), privateKey);
    return signature.toString("base64");
}

export function verify(data: string, signatureBase64: string): boolean {
    return crypto.verify(
        null,
        Buffer.from(data),
        publicKey,
        Buffer.from(signatureBase64, "base64")
    );
}

export function getPublicKey(): string {
    return publicKey.export({ type: "spki", format: "pem" }).toString();
}