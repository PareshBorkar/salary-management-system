import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import {
  createErrorResponse,
  registerErrorHandlers,
  sendError
} from "../../../../src/shared/http/errors.js";

describe("createErrorResponse", () => {
  it.each([
    [400, "BAD_REQUEST", "Bad request"],
    [401, "UNAUTHORIZED", "Authentication required"],
    [403, "FORBIDDEN", "Forbidden"],
    [404, "NOT_FOUND", "Not found"],
    [429, "RATE_LIMITED", "Too many requests"],
    [500, "INTERNAL_SERVER_ERROR", "Internal server error"]
  ] as const)("standardizes %s responses", (statusCode, code, defaultMessage) => {
    expect(createErrorResponse(statusCode)).toEqual({
      success: false,
      message: defaultMessage,
      code,
      statusCode
    });
  });

  it("allows route-specific messages", () => {
    expect(createErrorResponse(404, "Employee not found")).toEqual({
      success: false,
      message: "Employee not found",
      code: "NOT_FOUND",
      statusCode: 404
    });
  });
});

describe("common API error responses", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("standardizes validation error responses", async () => {
    app = createErrorTestApp();
    app.post(
      "/validation",
      {
        schema: {
          body: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string" }
            }
          }
        }
      },
      async () => ({ ok: true })
    );

    const response = await app.inject({
      method: "POST",
      url: "/validation",
      payload: {}
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      message: expect.any(String),
      code: "BAD_REQUEST",
      statusCode: 400
    });
  });

  it("standardizes unauthorized access responses", async () => {
    app = createErrorTestApp();
    app.get("/unauthorized", async (request, reply) => sendError(reply, 401));

    const response = await app.inject({
      method: "GET",
      url: "/unauthorized"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      success: false,
      message: "Authentication required",
      code: "UNAUTHORIZED",
      statusCode: 401
    });
  });

  it("standardizes forbidden access responses", async () => {
    app = createErrorTestApp();
    app.get("/forbidden", async (request, reply) => sendError(reply, 403, "Forbidden"));

    const response = await app.inject({
      method: "GET",
      url: "/forbidden"
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      success: false,
      message: "Forbidden",
      code: "FORBIDDEN",
      statusCode: 403
    });
  });

  it("standardizes not found responses", async () => {
    app = createErrorTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/missing"
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      success: false,
      message: "Not found",
      code: "NOT_FOUND",
      statusCode: 404
    });
  });

  it("standardizes rate limit responses", async () => {
    app = createErrorTestApp();
    app.get("/rate-limited", async (request, reply) =>
      sendError(reply.header("Retry-After", 60), 429, "Too many requests")
    );

    const response = await app.inject({
      method: "GET",
      url: "/rate-limited"
    });

    expect(response.statusCode).toBe(429);
    expect(response.headers["retry-after"]).toBe("60");
    expect(response.json()).toEqual({
      success: false,
      message: "Too many requests",
      code: "RATE_LIMITED",
      statusCode: 429
    });
  });

  it("standardizes server error responses without exposing internals", async () => {
    app = createErrorTestApp();
    app.get("/server-error", async () => {
      throw new Error("Database password leaked in stack trace");
    });

    const response = await app.inject({
      method: "GET",
      url: "/server-error"
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500
    });
  });
});

function createErrorTestApp() {
  const app = Fastify({ logger: false });

  registerErrorHandlers(app);

  return app;
}
