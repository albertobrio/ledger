import cron from "node-cron";
import { createDigestForStreamAndDate, getDistinctStreamsForDate } from "./digest.service.js";
import { anchorDigest } from "./anchor.service.js";

function yesterdayUtcDate(): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
}

export function startScheduler(app: any) {
    cron.schedule("5 0 * * *", async () => {
        const date = yesterdayUtcDate();

        app.log.info({ date }, "Starting daily digest job");

        const streams = await getDistinctStreamsForDate(date);

        for (const streamId of streams) {
            const digest = await createDigestForStreamAndDate(streamId, date);
            await anchorDigest(digest);
            app.log.info({ streamId, date }, "Daily digest created and anchored");
        }
    });
}