import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { createApp } from "../../../src/app.js";

const validCredentials = {
  email: "hr.manager@acme.example",
  password: "Password123!"
};

describe("authentication behavior", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("returns a JWT and user details for valid login credentials", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: validCredentials
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      token: string;
      user: {
        id: string;
        email: string;
        role: string;
        organizationId: string;
      };
    }>();

    expect(body.token).toEqual(expect.any(String));
    expect(body.token.split(".")).toHaveLength(3);
    expect(body.user).toMatchObject({
      email: validCredentials.email,
      role: "HR_MANAGER"
    });
    expect(body.user.id).toEqual(expect.any(String));
    expect(body.user.organizationId).toEqual(expect.any(String));
  });

  it("rejects invalid login credentials", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: validCredentials.email,
        password: "wrong-password"
      }
    });

    expect(response.statusCode).toBe(401);

    const body = response.json<{ error: string; token?: string }>();

    expect(body.error).toEqual(expect.any(String));
    expect(body.token).toBeUndefined();
  });

  it("rejects unauthenticated requests to protected routes", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/employees"
    });

    expect(response.statusCode).toBe(401);
  });
});
