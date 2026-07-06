import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { listEmployeeSalaryRecords } from "./employees.service.js";

const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
  sortBy: z
    .enum([
      "employeeCode",
      "firstName",
      "lastName",
      "country",
      "department",
      "role",
      "level",
      "salary"
    ])
    .default("employeeCode"),
  sortDirection: z.enum(["asc", "desc"]).default("asc")
});

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
