import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";

import { createApp } from "../../../src/app.js";
import { signJwt } from "../../../src/shared/auth/jwt.js";
import { prisma } from "../../../src/shared/database/prisma.js";

const organizationId = "salary-test-org-acme";
const otherOrganizationId = "salary-test-org-other";
const userId = "salary-test-hr-manager";
const employeeId = "salary-test-employee-00001";

const authToken = signJwt({
  id: userId,
  email: "salary.test.hr@acme.example",
  role: "HR_MANAGER",
  organizationId
});

const otherOrganizationToken = signJwt({
  id: "salary-test-other-hr-manager",
  email: "salary.test.hr@other.example",
  role: "HR_MANAGER",
  organizationId: otherOrganizationId
});

function authorizationHeader(token = authToken) {
  return {
    authorization: `Bearer ${token}`
  };
}

describe("salary update behavior", () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    await seedSalaryTestData();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  afterAll(async () => {
    await prisma.salaryHistory.deleteMany({
      where: {
        organizationId: {
          in: [organizationId, otherOrganizationId]
        }
      }
    });
    await prisma.salary.deleteMany({
      where: {
        organizationId: {
          in: [organizationId, otherOrganizationId]
        }
      }
    });
    await prisma.employee.deleteMany({
      where: {
        organizationId: {
          in: [organizationId, otherOrganizationId]
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        organizationId: {
          in: [organizationId, otherOrganizationId]
        }
      }
    });
    await prisma.organization.deleteMany({
      where: {
        id: {
          in: [organizationId, otherOrganizationId]
        }
      }
    });
  });

  it("updates salary when amount is positive", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/employees/${employeeId}/salary`,
      headers: authorizationHeader(),
      payload: {
        amount: 125000,
        reason: "MERIT",
        effectiveDate: "2026-03-01"
      }
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      salary: {
        amount: number;
        effectiveFrom: string;
      };
      salaryHistory: {
        previousAmount: number;
        newAmount: number;
        reason: string;
        updatedById: string | null;
      };
    }>();

    expect(body.salary).toMatchObject({
      amount: 125000,
      effectiveFrom: "2026-03-01T00:00:00.000Z"
    });
    expect(body.salaryHistory).toMatchObject({
      previousAmount: 90000,
      newAmount: 125000,
      reason: "MERIT",
      updatedById: userId
    });
  });

  it("rejects non-positive salary amounts", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/employees/${employeeId}/salary`,
      headers: authorizationHeader(),
      payload: {
        amount: 0,
        reason: "MERIT",
        effectiveDate: "2026-03-01"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it("requires a salary change reason", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/employees/${employeeId}/salary`,
      headers: authorizationHeader(),
      payload: {
        amount: 126000,
        effectiveDate: "2026-03-01"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it("requires an effective date", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/employees/${employeeId}/salary`,
      headers: authorizationHeader(),
      payload: {
        amount: 126000,
        reason: "MERIT"
      }
    });

    expect(response.statusCode).toBe(400);
  });

  it("does not update employees outside the authenticated organization", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/employees/${employeeId}/salary`,
      headers: authorizationHeader(otherOrganizationToken),
      payload: {
        amount: 126000,
        reason: "MERIT",
        effectiveDate: "2026-03-01"
      }
    });

    expect(response.statusCode).toBe(404);
  });
});

async function seedSalaryTestData() {
  const passwordHash = await bcrypt.hash("Password123!", 4);

  await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "ACME Salary Test", slug: "acme-salary-test" },
    create: { id: organizationId, name: "ACME Salary Test", slug: "acme-salary-test" }
  });
  await prisma.organization.upsert({
    where: { id: otherOrganizationId },
    update: { name: "Other Salary Test", slug: "other-salary-test" },
    create: {
      id: otherOrganizationId,
      name: "Other Salary Test",
      slug: "other-salary-test"
    }
  });

  await prisma.user.upsert({
    where: { email: "salary.test.hr@acme.example" },
    update: {
      organizationId,
      passwordHash,
      firstName: "Salary",
      lastName: "Tester",
      isActive: true
    },
    create: {
      id: userId,
      organizationId,
      email: "salary.test.hr@acme.example",
      passwordHash,
      firstName: "Salary",
      lastName: "Tester",
      role: "HR_MANAGER"
    }
  });
  await prisma.user.upsert({
    where: { email: "salary.test.hr@other.example" },
    update: {
      organizationId: otherOrganizationId,
      passwordHash,
      firstName: "Other",
      lastName: "Tester",
      isActive: true
    },
    create: {
      id: "salary-test-other-hr-manager",
      organizationId: otherOrganizationId,
      email: "salary.test.hr@other.example",
      passwordHash,
      firstName: "Other",
      lastName: "Tester",
      role: "HR_MANAGER"
    }
  });

  await prisma.employee.upsert({
    where: {
      organizationId_employeeCode: {
        organizationId,
        employeeCode: "SAL-00001"
      }
    },
    update: {
      id: employeeId,
      firstName: "Salary",
      lastName: "Employee",
      department: "Engineering",
      country: "US",
      role: "Engineer",
      level: "Senior"
    },
    create: {
      id: employeeId,
      organizationId,
      employeeCode: "SAL-00001",
      firstName: "Salary",
      lastName: "Employee",
      email: "salary.employee@acme.example",
      department: "Engineering",
      country: "US",
      role: "Engineer",
      level: "Senior"
    }
  });

  await prisma.salary.upsert({
    where: {
      organizationId_employeeId: {
        organizationId,
        employeeId
      }
    },
    update: {
      amount: "90000.00",
      currency: "USD",
      effectiveFrom: new Date("2026-01-01")
    },
    create: {
      organizationId,
      employeeId,
      amount: "90000.00",
      currency: "USD",
      effectiveFrom: new Date("2026-01-01")
    }
  });
}
