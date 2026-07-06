/* @vitest-environment jsdom */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardPage } from "../../../src/pages/Dashboard/DashboardPage";
import {
  getCompensationAnalytics,
  type CompensationAnalytics
} from "../../../src/pages/Dashboard/dashboard.api";

vi.mock("../../../src/pages/Dashboard/dashboard.api", async () => {
  return {
    getCompensationAnalytics: vi.fn()
  };
});

const getCompensationAnalyticsMock = vi.mocked(getCompensationAnalytics);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function analyticsResponse(
  overrides?: Partial<CompensationAnalytics>
): CompensationAnalytics {
  return {
    totalPayroll: 1_250_000,
    averageSalary: 125_000,
    medianSalary: 118_000,
    countByCountry: [
      { country: "India", count: 6 },
      { country: "United States", count: 4 }
    ],
    payrollByCountry: [
      { country: "India", totalPayroll: 650_000 },
      { country: "United States", totalPayroll: 600_000 }
    ],
    averageByDepartment: [
      { department: "Engineering", averageSalary: 140_000 },
      { department: "Sales", averageSalary: 105_000 }
    ],
    salaryBands: [
      { label: "Under $50k", min: 0, max: 50_000, count: 0 },
      { label: "$50k-$75k", min: 50_000, max: 75_000, count: 1 },
      { label: "$75k-$100k", min: 75_000, max: 100_000, count: 2 },
      { label: "$100k-$150k", min: 100_000, max: 150_000, count: 5 },
      { label: "$150k+", min: 150_000, max: null, count: 2 }
    ],
    distributionByRole: [
      { role: "Engineer", count: 5 },
      { role: "Manager", count: 3 },
      { role: "Analyst", count: 2 }
    ],
    distributionByLevel: [
      { level: "Senior", count: 4 },
      { level: "Mid", count: 4 },
      { level: "Junior", count: 2 }
    ],
    ...overrides
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    getCompensationAnalyticsMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the loading state", () => {
    const request = deferred<CompensationAnalytics>();
    getCompensationAnalyticsMock.mockReturnValue(request.promise);

    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard analytics...")).toBeTruthy();
    expect(screen.getByLabelText("Loading dashboard analytics")).toBeTruthy();
  });

  it("renders the error state", async () => {
    getCompensationAnalyticsMock.mockRejectedValue(new Error("Request failed"));

    render(<DashboardPage />);

    expect(
      await screen.findByText("Unable to load dashboard analytics. Please try again.")
    ).toBeTruthy();
  });

  it("renders the empty state", async () => {
    getCompensationAnalyticsMock.mockResolvedValue(
      analyticsResponse({
        totalPayroll: 0,
        averageSalary: 0,
        medianSalary: 0,
        countByCountry: [],
        averageByDepartment: [],
        salaryBands: []
      })
    );

    render(<DashboardPage />);

    expect(await screen.findByText("No dashboard analytics yet")).toBeTruthy();
    expect(
      screen.getByText("Add employee salary records to see compensation analytics.")
    ).toBeTruthy();
  });

  it("renders total employees, payroll, salary metrics, countries, and departments", async () => {
    getCompensationAnalyticsMock.mockResolvedValue(analyticsResponse());

    render(<DashboardPage />);

    expect(await screen.findByText("Total Employees")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("$1,250,000")).toBeTruthy();
    expect(screen.getByText("$125,000")).toBeTruthy();
    expect(screen.getByText("$118,000")).toBeTruthy();

    const countries = screen.getByText("Payroll by Country").closest(".MuiPaper-root");
    expect(countries).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("India")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("6 employees")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("$650,000")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("United States")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("4 employees")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("$600,000")).toBeTruthy();

    const departments = screen
      .getByText("Average Salary by Department")
      .closest(".MuiPaper-root");
    expect(departments).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("Engineering")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("$140,000")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("Sales")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("$105,000")).toBeTruthy();
  });

  it("renders chart data for country payroll, department averages, salary bands, roles, and levels", async () => {
    getCompensationAnalyticsMock.mockResolvedValue(analyticsResponse());

    render(<DashboardPage />);

    expect(await screen.findByLabelText("Countries distribution")).toBeTruthy();

    const countryPayroll = screen
      .getByText("Payroll by Country")
      .closest(".MuiPaper-root");
    expect(countryPayroll).toBeTruthy();
    expect(within(countryPayroll as HTMLElement).getByText("$650,000")).toBeTruthy();
    expect(within(countryPayroll as HTMLElement).getByText("$600,000")).toBeTruthy();

    const departmentAverages = screen
      .getByText("Average Salary by Department")
      .closest(".MuiPaper-root");
    expect(departmentAverages).toBeTruthy();
    expect(within(departmentAverages as HTMLElement).getByText("$140,000")).toBeTruthy();
    expect(within(departmentAverages as HTMLElement).getByText("$105,000")).toBeTruthy();

    const salaryBands = screen.getByText("Salary Bands").closest(".MuiPaper-root");
    expect(salaryBands).toBeTruthy();
    expect(
      within(salaryBands as HTMLElement).getByLabelText("Salary bands chart")
    ).toBeTruthy();
    expect(within(salaryBands as HTMLElement).getByText("$50k-$75k")).toBeTruthy();
    expect(within(salaryBands as HTMLElement).getByText("$100k-$150k")).toBeTruthy();
    expect(within(salaryBands as HTMLElement).getByText("$150k+")).toBeTruthy();

    const distribution = screen
      .getByText("Role and Level Distribution")
      .closest(".MuiPaper-root");
    expect(distribution).toBeTruthy();
    expect(
      within(distribution as HTMLElement).getByLabelText("Role distribution chart")
    ).toBeTruthy();
    expect(
      within(distribution as HTMLElement).getByLabelText("Level distribution chart")
    ).toBeTruthy();
    expect(within(distribution as HTMLElement).getByText("Engineer")).toBeTruthy();
    expect(within(distribution as HTMLElement).getByText("Manager")).toBeTruthy();
    expect(within(distribution as HTMLElement).getByText("Senior")).toBeTruthy();
    expect(within(distribution as HTMLElement).getByText("Junior")).toBeTruthy();
  });
});
