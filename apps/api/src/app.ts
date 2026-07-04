import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";

import { env } from "./shared/config/env.js";
import { loggerOptions } from "./shared/logger/logger.js";
import { healthRoutes } from "./modules/health/health.routes.js";

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

  await app.register(healthRoutes);

  return app;
}
