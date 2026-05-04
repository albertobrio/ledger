const PUBLIC_ROUTES = [
    { method: "GET", prefix: "/public-key" },
    { method: "GET", prefix: "/streams/" },
    { method: "POST", prefix: "/verify-proof" }
];

export async function apiKeyAuth(req: any, reply: any) {
    const method = req.method;
    const url = req.url;

    const isPublic = PUBLIC_ROUTES.some(r =>
        method === r.method && url.startsWith(r.prefix)
    );

    if (isPublic) return;

    const expectedApiKey = process.env.API_KEY;

    if (!expectedApiKey) {
        return reply.code(500).send({
            error: "API_KEY not configured"
        });
    }

    const providedApiKey = req.headers["x-api-key"];

    if (providedApiKey !== expectedApiKey) {
        return reply.code(401).send({
            error: "Unauthorized"
        });
    }
}