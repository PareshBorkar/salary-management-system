import type { FastifyInstance } from "fastify";

import { sendError } from "../../shared/http/errors.js";
import { sendSuccess } from "../../shared/http/responses.js";
import { getTaxSlabs } from "./tax-slabs.service.js";
import { taxSlabsQuerySchema } from "./tax-slabs.validation.js";

export async function taxSlabRoutes(app: FastifyInstance) {
  app.get(
    "/tax-slabs",
    {
      preHandler: app.authenticate
    },
    async (request, reply) => {
      if (!request.requestContext) {
        return sendError(reply, 401);
      }

      const parsed = taxSlabsQuerySchema.safeParse(request.query);

      if (!parsed.success) {
        return sendError(reply, 400);
      }

      const taxSlabs = getTaxSlabs(parsed.data);

      return sendSuccess(reply, taxSlabs);
    }
  );
}
