import type { FastifyInstance } from "fastify";

import { getCompensationAnalytics } from "./analytics.service.js";

export async function analyticsRoutes(app: FastifyInstance) {
  app.get(
    "/analytics/compensation",
    {
      preHandler: app.authenticate
    },
    async (request, reply) => {
      if (!request.requestContext) {
        return reply.code(401).send({ error: "Authentication required" });
      }

      return getCompensationAnalytics(request.requestContext.organizationId);
    }
  );
}
