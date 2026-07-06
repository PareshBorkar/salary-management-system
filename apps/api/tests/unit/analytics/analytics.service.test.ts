import { describe, expect, it } from "vitest";

import { calculateCompensationAnalytics } from "../../../src/modules/analytics/analytics.service.js";

describe("calculateCompensationAnalytics", () => {
  it("calculates compensation totals and deterministic groups", () => {
    const result = calculateCompensationAnalytics([
      { country: "US", department: "Sales", salaryAmount: 150_000 },
      { country: "IN", department: "Engineering", salaryAmount: 50_000 },
      { country: "US", department: "Engineering", salaryAmount: 100_000 },
      { country: null, department: null, salaryAmount: 75_000 }
    ]);

    expect(result.totalPayroll).toBe(375_000);
    expect(result.averageSalary).toBe(93_750);
    expect(result.medianSalary).toBe(87_500);
    expect(result.countByCountry).toEqual([
      { country: "IN", count: 1 },
      { country: "Unassigned", count: 1 },
      { country: "US", count: 2 }
    ]);
    expect(result.averageByDepartment).toEqual([
      { department: "Engineering", averageSalary: 75_000 },
      { department: "Sales", averageSalary: 150_000 },
      { department: "Unassigned", averageSalary: 75_000 }
    ]);
    expect(result.salaryBands).toEqual([
      { label: "Under $50k", min: 0, max: 50_000, count: 0 },
      { label: "$50k-$75k", min: 50_000, max: 75_000, count: 1 },
      { label: "$75k-$100k", min: 75_000, max: 100_000, count: 1 },
      { label: "$100k-$150k", min: 100_000, max: 150_000, count: 1 },
      { label: "$150k+", min: 150_000, max: null, count: 1 }
    ]);
  });

  it("returns zero-value analytics for empty input", () => {
    const result = calculateCompensationAnalytics([]);

    expect(result.totalPayroll).toBe(0);
    expect(result.averageSalary).toBe(0);
    expect(result.medianSalary).toBe(0);
    expect(result.countByCountry).toEqual([]);
    expect(result.averageByDepartment).toEqual([]);
    expect(result.salaryBands.map((band) => band.count)).toEqual([0, 0, 0, 0, 0]);
  });
});
