import type { FastifyInstance } from "fastify";

export async function employeeRoutes(app: FastifyInstance) {
  app.get(
    "/employees",
    {
      preHandler: app.authenticate
    },
    async (request) => ({
      employees: [],
      requestContext: request.requestContext
    })
  );
}
