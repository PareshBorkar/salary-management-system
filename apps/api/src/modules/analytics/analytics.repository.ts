import { prisma } from "../../shared/database/prisma.js";

export type CompensationAnalyticsRecord = {
  country: string | null;
  department: string | null;
  salaryAmount: number;
};

export type CompensationAnalyticsQueryResult = {
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
  salaryBandCounts: {
    under50k: number;
    from50kTo75k: number;
    from75kTo100k: number;
    from100kTo150k: number;
    from150k: number;
  };
};

type NumericValue =
  number | bigint | string | { toNumber: () => number } | null | undefined;

type PayrollSummaryRow = {
  total_payroll: NumericValue;
  average_salary: NumericValue;
  median_salary: NumericValue;
};

type CountryCountRow = {
  country: string;
  count: NumericValue;
};

type DepartmentAverageRow = {
  department: string;
  average_salary: NumericValue;
};

type SalaryBandCountRow = {
  under_50k: NumericValue;
  from_50k_to_75k: NumericValue;
  from_75k_to_100k: NumericValue;
  from_100k_to_150k: NumericValue;
  from_150k: NumericValue;
};

export async function findCompensationAnalytics(
  organizationId: string
): Promise<CompensationAnalyticsQueryResult> {
  const [summaryRows, countryRows, departmentRows, salaryBandRows] =
    await prisma.$transaction([
      prisma.$queryRaw<PayrollSummaryRow[]>`
        SELECT
          COALESCE(SUM("amount"), 0)::double precision AS "total_payroll",
          COALESCE(AVG("amount"), 0)::double precision AS "average_salary",
          COALESCE(
            percentile_cont(0.5) WITHIN GROUP (ORDER BY "amount"),
            0
          )::double precision AS "median_salary"
        FROM "salary"
        WHERE "organization_id" = ${organizationId}
      `,
      prisma.$queryRaw<CountryCountRow[]>`
        SELECT
          COALESCE(e."country", 'Unassigned') AS "country",
          COUNT(*)::integer AS "count"
        FROM "salary" s
        INNER JOIN "employees" e
          ON e."id" = s."employee_id"
          AND e."organization_id" = s."organization_id"
        WHERE s."organization_id" = ${organizationId}
        GROUP BY COALESCE(e."country", 'Unassigned')
        ORDER BY COALESCE(e."country", 'Unassigned') ASC
      `,
      prisma.$queryRaw<DepartmentAverageRow[]>`
        SELECT
          COALESCE(e."department", 'Unassigned') AS "department",
          AVG(s."amount")::double precision AS "average_salary"
        FROM "salary" s
        INNER JOIN "employees" e
          ON e."id" = s."employee_id"
          AND e."organization_id" = s."organization_id"
        WHERE s."organization_id" = ${organizationId}
        GROUP BY COALESCE(e."department", 'Unassigned')
        ORDER BY COALESCE(e."department", 'Unassigned') ASC
      `,
      prisma.$queryRaw<SalaryBandCountRow[]>`
        SELECT
          COUNT(*) FILTER (WHERE "amount" >= 0 AND "amount" < 50000)::integer
            AS "under_50k",
          COUNT(*) FILTER (WHERE "amount" >= 50000 AND "amount" < 75000)::integer
            AS "from_50k_to_75k",
          COUNT(*) FILTER (WHERE "amount" >= 75000 AND "amount" < 100000)::integer
            AS "from_75k_to_100k",
          COUNT(*) FILTER (WHERE "amount" >= 100000 AND "amount" < 150000)::integer
            AS "from_100k_to_150k",
          COUNT(*) FILTER (WHERE "amount" >= 150000)::integer
            AS "from_150k"
        FROM "salary"
        WHERE "organization_id" = ${organizationId}
      `
    ]);

  const summary = summaryRows[0];
  const salaryBandCounts = salaryBandRows[0];

  return {
    totalPayroll: toNumber(summary?.total_payroll),
    averageSalary: toNumber(summary?.average_salary),
    medianSalary: toNumber(summary?.median_salary),
    countByCountry: countryRows.map((row) => ({
      country: row.country,
      count: toNumber(row.count)
    })),
    averageByDepartment: departmentRows.map((row) => ({
      department: row.department,
      averageSalary: toNumber(row.average_salary)
    })),
    salaryBandCounts: {
      under50k: toNumber(salaryBandCounts?.under_50k),
      from50kTo75k: toNumber(salaryBandCounts?.from_50k_to_75k),
      from75kTo100k: toNumber(salaryBandCounts?.from_75k_to_100k),
      from100kTo150k: toNumber(salaryBandCounts?.from_100k_to_150k),
      from150k: toNumber(salaryBandCounts?.from_150k)
    }
  };
}

function toNumber(value: NumericValue) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value.toNumber();
}
