import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { registerAuthentication } from "../../../src/shared/auth/authenticate.js";
import { registerErrorHandlers } from "../../../src/shared/http/errors.js";
import {
  MemoryTokenBucketStore,
  registerRateLimiting
} from "../../../src/shared/middleware/rate-limit.middleware.js";

describe("rate limiting behavior", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("allows requests within the global token bucket and blocks excessive requests", async () => {
    app = await createRateLimitTestApp({
      global: {
        capacity: 2,
        refillTokens: 1,
        refillIntervalMs: 60_000
      }
    });

    const firstResponse = await app.inject({ method: "GET", url: "/v1/ping" });
    const secondResponse = await app.inject({ method: "GET", url: "/v1/ping" });
    const blockedResponse = await app.inject({ method: "GET", url: "/v1/ping" });

    expect(firstResponse.statusCode).toBe(200);
    expect(secondResponse.statusCode).toBe(200);
    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.json()).toEqual({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
      statusCode: 429
    });
  });

  it("does not apply the global rate limit to health checks", async () => {
    app = await createRateLimitTestApp({
      global: {
        capacity: 1,
        refillTokens: 1,
        refillIntervalMs: 60_000
      }
    });

    const firstResponse = await app.inject({ method: "GET", url: "/v1/health" });
    const secondResponse = await app.inject({ method: "GET", url: "/v1/health" });

    expect(firstResponse.statusCode).toBe(200);
    expect(secondResponse.statusCode).toBe(200);
  });

  it("uses a stricter login token bucket keyed by IP and normalized email", async () => {
    app = await createRateLimitTestApp({
      global: {
        capacity: 100,
        refillTokens: 100,
        refillIntervalMs: 60_000
      },
      login: {
        capacity: 1,
        refillTokens: 1,
        refillIntervalMs: 60_000
      }
    });

    const firstResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email: "HR.Manager@Acme.Example",
        password: "Password123!"
      }
    });
    const blockedResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email: "hr.manager@acme.example",
        password: "Password123!"
      }
    });

    expect(firstResponse.statusCode).toBe(200);
    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.json()).toMatchObject({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
      statusCode: 429
    });
  });

  it("uses a stricter salary update token bucket keyed by organization and user", async () => {
    app = await createRateLimitTestApp({
      global: {
        capacity: 100,
        refillTokens: 100,
        refillIntervalMs: 60_000
      },
      salaryUpdate: {
        capacity: 1,
        refillTokens: 1,
        refillIntervalMs: 60_000
      }
    });

    const firstResponse = await app.inject({
      method: "PATCH",
      url: "/v1/employees/employee-1/salary"
    });
    const blockedResponse = await app.inject({
      method: "PATCH",
      url: "/v1/employees/employee-2/salary"
    });

    expect(firstResponse.statusCode).toBe(200);
    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.json()).toMatchObject({
      success: false,
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
      statusCode: 429
    });
  });
});

async function createRateLimitTestApp(
  rateLimit: NonNullable<Parameters<typeof registerRateLimiting>[1]>
) {
  const app = Fastify({ logger: false });

  registerErrorHandlers(app);
  await registerAuthentication(app);
  await registerRateLimiting(app, {
    enabled: true,
    store: new MemoryTokenBucketStore(),
    ...rateLimit
  });

  app.get("/v1/ping", async () => ({ ok: true }));
  app.get("/v1/health", async () => ({ status: "ok" }));
  app.post(
    "/v1/auth/login",
    {
      preHandler: app.rateLimit.login
    },
    async () => ({ ok: true })
  );
  app.patch(
    "/v1/employees/:employeeId/salary",
    {
      preHandler: [
        async (request) => {
          request.requestContext = {
            userId: "user-1",
            organizationId: "org-1",
            role: "HR_MANAGER"
          };
        },
        app.rateLimit.salaryUpdate
      ]
    },
    async () => ({ ok: true })
  );

  return app;
}
