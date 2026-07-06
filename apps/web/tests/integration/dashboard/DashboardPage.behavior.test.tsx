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
    expect(metricValue("Total Employees")).toBe("10");
    expect(metricValue("Total Payroll")).toBe("$1,250,000");
    expect(metricValue("Average Salary")).toBe("$125,000");
    expect(metricValue("Median Salary")).toBe("$118,000");

    const countries = screen.getByText("Countries").closest(".MuiPaper-root");
    expect(countries).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("India")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("6 employees")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("United States")).toBeTruthy();
    expect(within(countries as HTMLElement).getByText("4 employees")).toBeTruthy();

    const departments = screen.getByText("Departments").closest(".MuiPaper-root");
    expect(departments).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("Engineering")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("$140,000")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("Sales")).toBeTruthy();
    expect(within(departments as HTMLElement).getByText("$105,000")).toBeTruthy();
  });
});

function metricValue(label: string) {
  const labelElement = screen.getByText(label);
  const card = labelElement.closest(".MuiPaper-root");

  if (!card) {
    throw new Error(`Unable to find metric card for ${label}`);
  }

  return within(card as HTMLElement)
    .getAllByText(/\S+/)
    .at(-1)?.textContent;
}
