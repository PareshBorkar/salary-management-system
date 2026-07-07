import type { FastifyReply, FastifyRequest } from "fastify";
import { describe, expect, it } from "vitest";

import { buildRequestLogContext } from "../../../../src/shared/logger/request-logging.js";

describe("buildRequestLogContext", () => {
  it("includes request metadata and safe user organization context", () => {
    const context = buildRequestLogContext(
      {
        id: "req-123",
        method: "GET",
        url: "/v1/employees?page=1",
        requestContext: {
          userId: "user-1",
          organizationId: "org-1",
          role: "HR_MANAGER"
        }
      } as FastifyRequest,
      {
        statusCode: 200
      } as FastifyReply
    );

    expect(context).toEqual({
      event: "request_completed",
      requestId: "req-123",
      method: "GET",
      path: "/v1/employees",
      statusCode: 200,
      responseTimeMs: 0,
      userId: "user-1",
      organizationId: "org-1",
      role: "HR_MANAGER"
    });
  });

  it("omits user organization context when unauthenticated", () => {
    const context = buildRequestLogContext(
      {
        id: "req-456",
        method: "POST",
        url: "/v1/auth/login",
        requestContext: null
      } as FastifyRequest,
      {
        statusCode: 401
      } as FastifyReply
    );

    expect(context).toEqual({
      event: "request_completed",
      requestId: "req-456",
      method: "POST",
      path: "/v1/auth/login",
      statusCode: 401,
      responseTimeMs: 0
    });
  });
});
