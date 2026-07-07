import type { FastifyInstance } from "fastify";

import { sendError } from "../../shared/http/errors.js";
import { updateEmployeeSalary } from "./salaries.service.js";
import {
  salaryUpdateBodySchema,
  salaryUpdateParamsSchema
} from "./salaries.validation.js";

export async function salaryRoutes(app: FastifyInstance) {
  app.patch(
    "/employees/:employeeId/salary",
    {
      preHandler: app.authenticate
    },
    async (request, reply) => {
      if (!request.requestContext) {
        return sendError(reply, 401);
      }

      const parsedParams = salaryUpdateParamsSchema.safeParse(request.params);
      const parsedBody = salaryUpdateBodySchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return sendError(reply, 400);
      }

      const result = await updateEmployeeSalary({
        organizationId: request.requestContext.organizationId,
        employeeId: parsedParams.data.employeeId,
        amount: parsedBody.data.amount,
        reason: parsedBody.data.reason,
        effectiveDate: parsedBody.data.effectiveDate,
        updatedById: request.requestContext.userId
      });

      if (!result) {
        return sendError(reply, 404, "Employee not found");
      }

      return reply.send(result);
    }
  );
}
