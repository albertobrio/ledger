import fs from "fs/promises";
import path from "path";

export async function anchorDigest(digest: {
    streamId: string;
    date: string;
    merkleRoot: string;
    blockCount: number;
    signature: string;
}) {
    const folder = process.env.ANCHOR_PATH || "anchors";

    await fs.mkdir(folder, { recursive: true });

    const safeStreamId = digest.streamId.replace(/[^a-zA-Z0-9_-]/g, "_");

    const fileName = `${digest.date}_${safeStreamId}.json`;
    const filePath = path.join(folder, fileName);

    const content = {
        ...digest,
        anchoredUtc: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(content, null, 2), {
        flag: "wx"
    });

    return {
        filePath
    };
}