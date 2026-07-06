import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";

import { env } from "./shared/config/env.js";
import { loggerOptions } from "./shared/logger/logger.js";
import { registerAuthentication } from "./shared/auth/authenticate.js";
import { prisma } from "./shared/database/prisma.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { employeeRoutes } from "./modules/employees/employees.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { salaryRoutes } from "./modules/salaries/salaries.routes.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";

type CreateAppOptions = {
  logger?: FastifyServerOptions["logger"];
};

export async function createApp(
  options: CreateAppOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? loggerOptions
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGIN
  });

  await registerAuthentication(app);

  await app.register(healthRoutes, { prefix: "/v1" });
  await app.register(authRoutes, { prefix: "/v1" });
  await app.register(employeeRoutes, { prefix: "/v1" });
  await app.register(salaryRoutes, { prefix: "/v1" });
  await app.register(analyticsRoutes, { prefix: "/v1" });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
