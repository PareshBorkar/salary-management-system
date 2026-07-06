import { findCompensationAnalyticsRecords } from "./analytics.repository.js";

type CompensationAnalyticsRecord = {
  country: string | null;
  department: string | null;
  salaryAmount: number;
};

type SalaryBand = {
  label: string;
  min: number;
  max: number | null;
};

type CompensationAnalytics = {
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

const salaryBands: SalaryBand[] = [
  { label: "Under $50k", min: 0, max: 50_000 },
  { label: "$50k-$75k", min: 50_000, max: 75_000 },
  { label: "$75k-$100k", min: 75_000, max: 100_000 },
  { label: "$100k-$150k", min: 100_000, max: 150_000 },
  { label: "$150k+", min: 150_000, max: null }
];

export async function getCompensationAnalytics(organizationId: string) {
  const records = await findCompensationAnalyticsRecords(organizationId);

  return calculateCompensationAnalytics(records);
}

export function calculateCompensationAnalytics(
  records: CompensationAnalyticsRecord[]
): CompensationAnalytics {
  const salaries = records.map((record) => record.salaryAmount).sort((a, b) => a - b);
  const totalPayroll = salaries.reduce((total, salary) => total + salary, 0);
  const averageSalary = salaries.length ? totalPayroll / salaries.length : 0;
  const medianSalary = calculateMedian(salaries);

  const countryCounts = new Map<string, number>();
  const departmentTotals = new Map<string, { total: number; count: number }>();

  for (const record of records) {
    const country = record.country ?? "Unassigned";
    const department = record.department ?? "Unassigned";

    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);

    const departmentTotal = departmentTotals.get(department) ?? { total: 0, count: 0 };
    departmentTotal.total += record.salaryAmount;
    departmentTotal.count += 1;
    departmentTotals.set(department, departmentTotal);
  }

  return {
    totalPayroll,
    averageSalary,
    medianSalary,
    countByCountry: Array.from(countryCounts.entries())
      .sort(([firstCountry], [secondCountry]) =>
        firstCountry.localeCompare(secondCountry)
      )
      .map(([country, count]) => ({
        country,
        count
      })),
    averageByDepartment: Array.from(departmentTotals.entries())
      .sort(([firstDepartment], [secondDepartment]) =>
        firstDepartment.localeCompare(secondDepartment)
      )
      .map(([department, value]) => ({
        department,
        averageSalary: value.count ? value.total / value.count : 0
      })),
    salaryBands: salaryBands.map((band) => ({
      label: band.label,
      min: band.min,
      max: band.max,
      count: records.filter((record) => isSalaryInBand(record.salaryAmount, band)).length
    }))
  };
}

function calculateMedian(sortedSalaries: number[]) {
  if (!sortedSalaries.length) {
    return 0;
  }

  const midpoint = Math.floor(sortedSalaries.length / 2);

  if (sortedSalaries.length % 2 === 1) {
    return sortedSalaries[midpoint] ?? 0;
  }

  return ((sortedSalaries[midpoint - 1] ?? 0) + (sortedSalaries[midpoint] ?? 0)) / 2;
}

function isSalaryInBand(salary: number, band: SalaryBand) {
  if (band.max === null) {
    return salary >= band.min;
  }

  return salary >= band.min && salary < band.max;
}
