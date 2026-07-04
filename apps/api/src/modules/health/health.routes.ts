import type { FastifyInstance } from "fastify";

import { env } from "../../shared/config/env.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime())
  }));
}
