import type { FastifyInstance } from "fastify";

import { sendError } from "../../shared/http/errors.js";
import { sendSuccess } from "../../shared/http/responses.js";
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

      const analytics = await getCompensationAnalytics(
        request.requestContext.organizationId
      );

      return sendSuccess(reply, analytics);
    }
  );
}
