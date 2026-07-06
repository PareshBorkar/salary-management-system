import type { FastifyInstance } from "fastify";

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
        return reply.code(401).send({ error: "Authentication required" });
      }

      const parsed = employeeListQuerySchema.safeParse(request.query);

      if (!parsed.success) {
        return reply.code(400).send({ error: "Invalid employee list query" });
      }

      return listEmployeeSalaryRecords({
        organizationId: request.requestContext.organizationId,
        ...parsed.data
      });
    }
  );
}
