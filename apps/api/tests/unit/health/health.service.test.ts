import { describe, expect, it } from "vitest";

import {
  getHealth,
  type DependencyCheck
} from "../../../src/modules/health/health.service.js";

describe("getHealth", () => {
  it("returns basic API health without dependency checks", async () => {
    const health = await getHealth();

    expect(health).toMatchObject({
      status: "ok",
      service: expect.any(String),
      environment: expect.any(String),
      uptimeSeconds: expect.any(Number)
    });
    expect(health.checks).toBeUndefined();
  });

  it("includes dependency checks when requested", async () => {
    const health = await getHealth({
      checkDependencies: true,
      checkDatabase: async () => okCheck("database"),
      checkRedis: async () => okCheck("redis")
    });

    expect(health.status).toBe("ok");
    expect(health.checks).toEqual([
      { name: "database", status: "ok" },
      { name: "redis", status: "ok" }
    ]);
  });

  it("marks health as degraded when a dependency check fails", async () => {
    const health = await getHealth({
      checkDependencies: true,
      checkDatabase: async () => ({ name: "database", status: "error" }),
      checkRedis: async () => ({ name: "redis", status: "ok" })
    });

    expect(health.status).toBe("degraded");
    expect(health.checks).toEqual([
      { name: "database", status: "error" },
      { name: "redis", status: "ok" }
    ]);
  });
});

function okCheck(name: DependencyCheck["name"]): DependencyCheck {
  return {
    name,
    status: "ok"
  };
}
