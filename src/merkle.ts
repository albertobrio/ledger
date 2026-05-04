import { sha256 } from "./crypto.js";

export type MerkleProofItem = {
    position: "left" | "right";
    hash: string;
};

export function buildMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return sha256("EMPTY");

    let level = [...hashes];

    while (level.length > 1) {
        const next: string[] = [];

        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] ?? left;
            next.push(sha256(left + right));
        }

        level = next;
    }

    return level[0];
}

export function buildMerkleProof(hashes: string[], targetIndex: number): MerkleProofItem[] {
    if (targetIndex < 0 || targetIndex >= hashes.length) {
        throw new Error("Invalid target index");
    }

    const proof: MerkleProofItem[] = [];
    let index = targetIndex;
    let level = [...hashes];

    while (level.length > 1) {
        const isRightNode = index % 2 === 1;
        const pairIndex = isRightNode ? index - 1 : index + 1;

        const siblingHash = level[pairIndex] ?? level[index];

        proof.push({
            position: isRightNode ? "left" : "right",
            hash: siblingHash
        });

        const next: string[] = [];

        for (let i = 0; i < level.length; i += 2) {
            const left = level[i];
            const right = level[i + 1] ?? left;
            next.push(sha256(left + right));
        }

        index = Math.floor(index / 2);
        level = next;
    }

    return proof;
}

export function verifyMerkleProof(
    leafHash: string,
    proof: MerkleProofItem[],
    expectedRoot: string
): boolean {
    let computed = leafHash;

    for (const item of proof) {
        if (item.position === "left") {
            computed = sha256(item.hash + computed);
        } else {
            computed = sha256(computed + item.hash);
        }
    }

    return computed === expectedRoot;
}