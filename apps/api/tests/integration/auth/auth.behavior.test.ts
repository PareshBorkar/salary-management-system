import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { createApp } from "../../../src/app.js";

const validCredentials = {
  email: "hr.manager@acme.example",
  password: "Password123!"
};

type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
    organizationName: string;
  };
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
      url: "/v1/auth/login",
      payload: validCredentials
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<LoginResponse>>();

    expect(body).toMatchObject({
      success: true,
      message: "Request completed successfully"
    });
    expect(body.data.token).toEqual(expect.any(String));
    expect(body.data.token.split(".")).toHaveLength(3);
    expect(body.data.user).toMatchObject({
      email: validCredentials.email,
      firstName: "ACME",
      lastName: "HR Manager",
      role: "HR_MANAGER",
      organizationName: "ACME"
    });
    expect(body.data.user.id).toEqual(expect.any(String));
    expect(body.data.user.organizationId).toEqual(expect.any(String));
  });

  it("rejects invalid login credentials", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email: validCredentials.email,
        password: "wrong-password"
      }
    });

    expect(response.statusCode).toBe(401);

    const body = response.json<{
      success: false;
      message: string;
      token?: string;
    }>();

    expect(body).toMatchObject({
      success: false,
      message: expect.any(String)
    });
    expect(body.token).toBeUndefined();
  });

  it("rejects unauthenticated requests to protected routes", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees"
    });

    expect(response.statusCode).toBe(401);
  });
});
