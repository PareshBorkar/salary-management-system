import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

import { healthRoutes } from "../../../src/modules/health/health.routes.js";

vi.mock("../../../src/modules/health/health.service.js", () => ({
  getHealth: vi.fn()
}));

const { getHealth } = await import("../../../src/modules/health/health.service.js");
const getHealthMock = vi.mocked(getHealth);

describe("healthRoutes", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
    getHealthMock.mockReset();
  });

  it("returns basic health", async () => {
    getHealthMock.mockResolvedValue({
      status: "ok",
      service: "salary-management-api",
      environment: "test",
      uptimeSeconds: 10
    });
    app = await createHealthTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/v1/health"
    });

    expect(response.statusCode).toBe(200);
    expect(getHealthMock).toHaveBeenCalledWith({
      checkDependencies: false
    });
    expect(response.json()).toEqual({
      status: "ok",
      service: "salary-management-api",
      environment: "test",
      uptimeSeconds: 10
    });
  });

  it("returns degraded health with 503 when dependency checks fail", async () => {
    getHealthMock.mockResolvedValue({
      status: "degraded",
      service: "salary-management-api",
      environment: "test",
      uptimeSeconds: 10,
      checks: [
        { name: "database", status: "error" },
        { name: "redis", status: "ok" }
      ]
    });
    app = await createHealthTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/v1/health?checkDependencies=true"
    });

    expect(response.statusCode).toBe(503);
    expect(getHealthMock).toHaveBeenCalledWith({
      checkDependencies: true
    });
    expect(response.json()).toMatchObject({
      status: "degraded",
      checks: [
        { name: "database", status: "error" },
        { name: "redis", status: "ok" }
      ]
    });
  });
});

async function createHealthTestApp() {
  const app = Fastify({ logger: false });

  await app.register(healthRoutes, { prefix: "/v1" });

  return app;
}
