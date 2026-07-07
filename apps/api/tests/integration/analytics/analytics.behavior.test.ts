import { afterEach, beforeAll, describe, expect, it } from "vitest";
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
const departments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Operations",
  "Product",
  "Sales",
  "Support"
];
const countries = ["US", "IN", "GB", "DE", "CA", "AU", "SG"];
const titles = [
  "Associate",
  "Specialist",
  "Senior Specialist",
  "Lead",
  "Manager",
  "Senior Manager",
  "Director"
];
const seededEmployeeCount = 100;

function authorizationHeader() {
  return {
    authorization: `Bearer ${authToken}`
  };
}

type CompensationAnalyticsResponse = {
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  countByCountry: Array<{
    country: string;
    count: number;
  }>;
  averageByDepartment: Array<{
    department: string;
    averageSalary: number;
  }>;
  salaryBands: Array<{
    label: string;
    min: number;
    max: number | null;
    count: number;
  }>;
};

type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

describe("compensation analytics behavior", () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    await resetSeedAnalyticsData();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("returns total payroll, average salary, and median salary", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/compensation",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<CompensationAnalyticsResponse>>();
    const data = body.data;
    const salaries = Array.from({ length: seededEmployeeCount }, (_, index) =>
      seededSalary(index + 1)
    ).sort((a, b) => a - b);
    const expectedTotalPayroll = salaries.reduce((total, salary) => total + salary, 0);
    const expectedAverageSalary = expectedTotalPayroll / salaries.length;
    const expectedMedianSalary = (salaries[49]! + salaries[50]!) / 2;

    expect(body).toMatchObject({
      success: true,
      message: "Request completed successfully"
    });
    expect(data.totalPayroll).toBe(expectedTotalPayroll);
    expect(data.averageSalary).toBeCloseTo(expectedAverageSalary, 2);
    expect(data.medianSalary).toBe(expectedMedianSalary);
  });

  it("returns employee count by country", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/compensation",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<CompensationAnalyticsResponse>>();
    const data = body.data;

    expect(data.countByCountry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          country: "US",
          count: expect.any(Number)
        })
      ])
    );
    expect(sortCountryCounts(data.countByCountry)).toEqual(
      sortCountryCounts(expectedCountryCounts())
    );
  });

  it("returns average salary by department", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/compensation",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<CompensationAnalyticsResponse>>();
    const data = body.data;

    expect(data.averageByDepartment).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          department: "Engineering",
          averageSalary: expect.any(Number)
        })
      ])
    );

    expect(data.averageByDepartment).toHaveLength(departments.length);
    for (const expectedDepartmentAverage of expectedDepartmentAverages()) {
      const actualDepartmentAverage = data.averageByDepartment.find(
        (item) => item.department === expectedDepartmentAverage.department
      );

      expect(actualDepartmentAverage?.averageSalary).toBeCloseTo(
        expectedDepartmentAverage.averageSalary,
        2
      );
    }
  });

  it("returns salary bands", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/compensation",
      headers: authorizationHeader()
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<ApiSuccessResponse<CompensationAnalyticsResponse>>();
    const data = body.data;

    expect(data.salaryBands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "$50k-$75k",
          min: 50_000,
          max: 75_000,
          count: expect.any(Number)
        }),
        expect.objectContaining({
          label: "$100k-$150k",
          min: 100_000,
          max: 150_000,
          count: expect.any(Number)
        })
      ])
    );
    const salaryBandCount = data.salaryBands.reduce(
      (total, item) => total + item.count,
      0
    );

    expect(data.salaryBands).toEqual(expectedSalaryBands());
    expect(salaryBandCount).toBe(seededEmployeeCount);
  });

  it("requires authentication", async () => {
    app = await createApp({ logger: false });

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/compensation"
    });

    expect(response.statusCode).toBe(401);
  });
});

function seededSalary(index: number) {
  const departmentBand = (index % departments.length) * 4_500;
  const levelBand = (index % titles.length) * 7_500;
  const variance = (index % 31) * 650;

  return 45_000 + departmentBand + levelBand + variance;
}

async function resetSeedAnalyticsData() {
  const employeeIds = Array.from({ length: seededEmployeeCount }, (_, offset) =>
    seededEmployeeId(offset + 1)
  );

  await prisma.$transaction([
    prisma.salaryHistory.deleteMany({
      where: {
        organizationId,
        employeeId: {
          notIn: employeeIds
        }
      }
    }),
    prisma.salary.deleteMany({
      where: {
        organizationId,
        employeeId: {
          notIn: employeeIds
        }
      }
    }),
    prisma.employee.deleteMany({
      where: {
        organizationId,
        id: {
          notIn: employeeIds
        }
      }
    }),
    ...employeeIds.map((employeeId, offset) => {
      const index = offset + 1;

      return prisma.employee.update({
        where: { id: employeeId },
        data: {
          country: countries[index % countries.length],
          department: departments[index % departments.length]
        }
      });
    }),
    ...employeeIds.map((employeeId, offset) => {
      const index = offset + 1;

      return prisma.salary.upsert({
        where: {
          organizationId_employeeId: {
            organizationId,
            employeeId
          }
        },
        update: {
          amount: seededSalary(index).toFixed(2),
          currency: "USD",
          effectiveFrom: new Date("2026-01-01")
        },
        create: {
          id: `seed-salary-${String(index).padStart(5, "0")}`,
          organizationId,
          employeeId,
          amount: seededSalary(index).toFixed(2),
          currency: "USD",
          effectiveFrom: new Date("2026-01-01")
        }
      });
    })
  ]);
}

function seededEmployeeId(index: number) {
  return `seed-employee-${String(index).padStart(5, "0")}`;
}

function expectedCountryCounts() {
  return countries.map((country, countryIndex) => ({
    country,
    count: Array.from({ length: seededEmployeeCount }, (_, offset) => offset + 1).filter(
      (index) => countries[index % countries.length] === countries[countryIndex]
    ).length
  }));
}

function sortCountryCounts(items: CompensationAnalyticsResponse["countByCountry"]) {
  return [...items].sort((first, second) => first.country.localeCompare(second.country));
}

function expectedDepartmentAverages() {
  return departments.map((department) => {
    const salaries = Array.from(
      { length: seededEmployeeCount },
      (_, offset) => offset + 1
    )
      .filter((index) => departments[index % departments.length] === department)
      .map((index) => seededSalary(index));

    return {
      department,
      averageSalary:
        salaries.reduce((total, salary) => total + salary, 0) / salaries.length
    };
  });
}

function expectedSalaryBands() {
  const salaries = Array.from({ length: seededEmployeeCount }, (_, offset) =>
    seededSalary(offset + 1)
  );

  return [
    {
      label: "Under $50k",
      min: 0,
      max: 50_000,
      count: salaries.filter((salary) => salary >= 0 && salary < 50_000).length
    },
    {
      label: "$50k-$75k",
      min: 50_000,
      max: 75_000,
      count: salaries.filter((salary) => salary >= 50_000 && salary < 75_000).length
    },
    {
      label: "$75k-$100k",
      min: 75_000,
      max: 100_000,
      count: salaries.filter((salary) => salary >= 75_000 && salary < 100_000).length
    },
    {
      label: "$100k-$150k",
      min: 100_000,
      max: 150_000,
      count: salaries.filter((salary) => salary >= 100_000 && salary < 150_000).length
    },
    {
      label: "$150k+",
      min: 150_000,
      max: null,
      count: salaries.filter((salary) => salary >= 150_000).length
    }
  ];
}
