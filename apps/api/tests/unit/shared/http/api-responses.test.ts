import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import {
  createSuccessResponse,
  sendSuccess
} from "../../../../src/shared/http/responses.js";

describe("createSuccessResponse", () => {
  it("standardizes successful API responses", () => {
    expect(createSuccessResponse({ id: "employee-1" })).toEqual({
      success: true,
      message: "Request completed successfully",
      data: {
        id: "employee-1"
      }
    });
  });

  it("allows route-specific success messages", () => {
    expect(createSuccessResponse({ id: "employee-1" }, "Employee updated")).toEqual({
      success: true,
      message: "Employee updated",
      data: {
        id: "employee-1"
      }
    });
  });
});

describe("common API success responses", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("sends the standardized response body and status code", async () => {
    app = Fastify({ logger: false });
    app.post("/created", async (request, reply) =>
      sendSuccess(reply, { id: "employee-1" }, "Employee created", 201)
    );

    const response = await app.inject({
      method: "POST",
      url: "/created"
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      success: true,
      message: "Employee created",
      data: {
        id: "employee-1"
      }
    });
  });
});
