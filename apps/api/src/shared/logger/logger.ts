import type { FastifyServerOptions } from "fastify";

import { env } from "../config/env.js";

export const loggerOptions = {
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "accessToken",
      "refreshToken"
    ],
    censor: "[redacted]"
  }
} satisfies FastifyServerOptions["logger"];
