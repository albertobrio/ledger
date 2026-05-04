import Fastify from "fastify";
import { default as rateLimit } from "@fastify/rate-limit";

import { routes } from "./routes.js";
import { apiKeyAuth } from "./auth.js";
import { auditResponse } from "./audit.js";
import { startScheduler } from "./scheduler.js";

const app = Fastify({ logger: true });

await app.register(rateLimit as any, {
    max: 100,
    timeWindow: "1 minute"
});

app.addHook("onRequest", apiKeyAuth);
app.addHook("onResponse", auditResponse);

await app.register(routes);

startScheduler(app);

try {
    await app.listen({
        port: Number(process.env.PORT ?? 3000),
        host: "0.0.0.0"
    });

    console.log("Ledger running");
} catch (err) {
    app.log.error(err);
    process.exit(1);
}