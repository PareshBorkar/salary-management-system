import type { FastifyInstance } from "fastify";

import { sendError } from "../../shared/http/errors.js";
import { getCompensationAnalytics } from "./analytics.service.js";

export async function analyticsRoutes(app: FastifyInstance) {
  app.get(
    "/analytics/compensation",
    {
      preHandler: app.authenticate
    },
    async (request, reply) => {
      if (!request.requestContext) {
        return sendError(reply, 401);
      }

      return getCompensationAnalytics(request.requestContext.organizationId);
    }
  );
}
