import type { FastifyInstance } from "fastify";

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
        return reply.code(401).send({ error: "Authentication required" });
      }

      const parsedParams = salaryUpdateParamsSchema.safeParse(request.params);
      const parsedBody = salaryUpdateBodySchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.code(400).send({ error: "Invalid salary update request" });
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
        return reply.code(404).send({ error: "Employee not found" });
      }

      return reply.send(result);
    }
  );
}
