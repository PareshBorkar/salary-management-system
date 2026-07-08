import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";

import { createApp } from "../../../src/app.js";
import { signJwt } from "../../../src/shared/auth/jwt.js";
import { prisma } from "../../../src/shared/database/prisma.js";

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

async function cleanupCreatedEmployee() {
  await prisma.employee.deleteMany({
    where: {
      organizationId,
      email: "neha.patel.test@acme.example"
    }
  });
}

describe("employee listing behavior", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await cleanupCreatedEmployee();

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

  it("creates an employee for the authenticated user's organization", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/v1/employees",
      headers: authorizationHeader(),
      payload: {
        firstName: "Neha",
        lastName: "Patel",
        email: "neha.patel.test@acme.example",
        title: "Compensation Analyst",
        department: "People",
        country: "IN",
        role: "HR",
        level: "Senior"
      }
    });

    expect(response.statusCode).toBe(201);

    const body =
      response.json<ApiSuccessResponse<EmployeeListResponse["employees"][number]>>();

    expect(body).toMatchObject({
      success: true,
      message: "Employee created successfully",
      data: {
        organizationId,
        employeeCode: "ACME-00101",
        firstName: "Neha",
        lastName: "Patel",
        email: "neha.patel.test@acme.example",
        title: "Compensation Analyst",
        department: "People",
        country: "IN",
        role: "HR",
        level: "Senior",
        status: "ACTIVE",
        salary: null
      }
    });
  });

  it("rejects invalid create employee payloads", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "POST",
      url: "/v1/employees",
      headers: authorizationHeader(),
      payload: {
        firstName: "",
        lastName: "Patel"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it("returns conflict when employee code or email already exists", async () => {
    app = await createApp({ logger: false });

    const payload = {
      firstName: "Neha",
      lastName: "Patel",
      email: "neha.patel.test@acme.example"
    };

    const firstResponse = await app.inject({
      method: "POST",
      url: "/v1/employees",
      headers: authorizationHeader(),
      payload
    });
    const secondResponse = await app.inject({
      method: "POST",
      url: "/v1/employees",
      headers: authorizationHeader(),
      payload
    });

    expect(firstResponse.statusCode).toBe(201);
    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.json()).toMatchObject({
      success: false,
      message: "Employee email already exists.",
      code: "CONFLICT"
    });
  });
});
