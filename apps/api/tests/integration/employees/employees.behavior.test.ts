import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { createApp } from "../../../src/app.js";
import { signJwt } from "../../../src/shared/auth/jwt.js";

const organizationId = "seed-org-acme";
const authToken = signJwt({
  id: "test-hr-manager",
  email: "hr.manager@acme.example",
  role: "HR_MANAGER",
  organizationId
});

function authorizationHeader() {
  return {
    authorization: `Bearer ${authToken}`
  };
}

type EmployeeListResponse = {
  employees: Array<{
    id: string;
    organizationId: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    country?: string;
    department?: string;
    role?: string;
    level?: string;
    salary?: {
      amount: number;
      currency: string;
    };
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

describe("employee listing behavior", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("paginates employees", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees?page=2&pageSize=25",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<EmployeeListResponse>>();
    const data = body.data;

    expect(body).toMatchObject({
      success: true,
      message: "Request completed successfully"
    });
    expect(data.employees).toHaveLength(25);
    expect(data.pagination).toMatchObject({
      page: 2,
      pageSize: 25
    });
    expect(data.pagination.total).toBeGreaterThanOrEqual(25);
    expect(data.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("searches employees by employee code or name", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees?search=ACME-00042",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<EmployeeListResponse>>();
    const data = body.data;

    expect(data.employees.length).toBeGreaterThan(0);
    expect(data.employees).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          employeeCode: "ACME-00042"
        })
      ])
    );
  });

  it("filters employees by country, department, role, and level", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees?country=US&department=Engineering&role=Engineer&level=Senior",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<EmployeeListResponse>>();
    const data = body.data;

    expect(data.employees.length).toBeGreaterThan(0);
    expect(data.employees).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          country: "US",
          department: "Engineering",
          role: "Engineer",
          level: "Senior"
        })
      ])
    );
    expect(
      data.employees.every(
        (employee) =>
          employee.country === "US" &&
          employee.department === "Engineering" &&
          employee.role === "Engineer" &&
          employee.level === "Senior"
      )
    ).toBe(true);
  });

  it("sorts employees by salary", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees?sortBy=salary&sortDirection=desc&pageSize=10",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<EmployeeListResponse>>();
    const salaries = body.data.employees.map((employee) => employee.salary?.amount ?? 0);

    expect(salaries.length).toBeGreaterThan(1);
    expect(salaries).toEqual([...salaries].sort((a, b) => b - a));
  });

  it("scopes employee results to the authenticated user's organization", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/employees?pageSize=50",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<EmployeeListResponse>>();
    const data = body.data;

    expect(data.employees.length).toBeGreaterThan(0);
    expect(
      data.employees.every((employee) => employee.organizationId === organizationId)
    ).toBe(true);
  });
});
