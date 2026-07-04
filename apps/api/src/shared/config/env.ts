import "dotenv/config";

import { z } from "zod";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const envSchema = z.object({
  APP_NAME: z.string().default("salary-management-api"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(PORT),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16).optional()
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
