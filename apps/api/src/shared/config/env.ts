import "dotenv/config";

import { z } from "zod";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const envSchema = z.object({
  APP_NAME: z.string().default("salary-management-api"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(PORT),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_BUCKET_CAPACITY: z.coerce.number().positive().default(1_000),
  RATE_LIMIT_REFILL_TOKENS: z.coerce.number().positive().default(1_000),
  RATE_LIMIT_REFILL_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  JWT_SECRET: z.string().min(16).optional()
});

export const env = envSchema.parse(process.env);

export type Env = typeof env;
