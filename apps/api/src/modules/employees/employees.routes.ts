import type { FastifyInstance } from "fastify";

import { sendError } from "../../shared/http/errors.js";
import { sendSuccess } from "../../shared/http/responses.js";
import { listEmployeeSalaryRecords } from "./employees.service.js";
import { employeeListQuerySchema } from "./employees.validation.js";

export async function employeeRoutes(app: FastifyInstance) {
  app.get(
    "/employees",
    {
      preHandler: app.authenticate
    },
    async (request, reply) => {
      if (!request.requestContext) {
        return sendError(reply, 401);
      }

      const parsed = employeeListQuerySchema.safeParse(request.query);

      if (!parsed.success) {
        return sendError(reply, 400);
      }

      const employees = await listEmployeeSalaryRecords({
        organizationId: request.requestContext.organizationId,
        ...parsed.data
      });

      return sendSuccess(reply, employees);
    }
  );
}
