const fs = require("fs");
const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");

fs.writeFileSync(
    "private.pem",
    privateKey.export({ type: "pkcs8", format: "pem" })
);

fs.writeFileSync(
    "public.pem",
    publicKey.export({ type: "spki", format: "pem" })
);

console.log("Chiavi generate:");
console.log("- private.pem");
console.log("- public.pem");