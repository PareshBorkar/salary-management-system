import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { sendError } from "../../shared/http/errors.js";
import { getHealth } from "./health.service.js";

const healthQuerySchema = z.object({
  checkDependencies: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
});

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (request, reply) => {
    const parsed = healthQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return sendError(reply, 400);
    }

    const health = await getHealth({
      checkDependencies: parsed.data.checkDependencies
    });

    if (health.status === "degraded") {
      return reply.code(503).send(health);
    }

    return reply.send(health);
  });
}
