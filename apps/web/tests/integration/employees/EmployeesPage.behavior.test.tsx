/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EmployeesPage } from "../../../src/pages/Employees/EmployeesPage";
import {
  listEmployees,
  type Employee,
  type EmployeeListResponse
} from "../../../src/pages/Employees/employees.api";

vi.mock("../../../src/pages/Employees/employees.api", async () => {
  return {
    listEmployees: vi.fn()
  };
});

const listEmployeesMock = vi.mocked(listEmployees);

const employee: Employee = {
  id: "employee-1",
  employeeCode: "ACME-00001",
  firstName: "Aditi",
  lastName: "Sharma",
  email: "aditi.sharma@acme.example",
  title: "Senior Engineer",
  country: "IN",
  department: "Engineering",
  role: "Engineer",
  level: "Senior",
  salary: {
    amount: 128000,
    currency: "USD"
  }
};

function employeeResponse(overrides?: Partial<EmployeeListResponse>): EmployeeListResponse {
  return {
    employees: [employee],
    pagination: {
      page: 1,
      pageSize: 25,
      total: 1,
      totalPages: 1
    },
    ...overrides
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function latestRequest() {
  const calls = listEmployeesMock.mock.calls;

  return calls[calls.length - 1]?.[0];
}

describe("EmployeesPage", () => {
  beforeEach(() => {
    listEmployeesMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the loading state", () => {
    const request = deferred<EmployeeListResponse>();
    listEmployeesMock.mockReturnValue(request.promise);

    render(<EmployeesPage />);

    expect(screen.getByText("Loading employees...")).toBeTruthy();
  });

  it("renders the error state", async () => {
    listEmployeesMock.mockRejectedValue(new Error("Request failed"));

    render(<EmployeesPage />);

    expect(await screen.findByText("Unable to load employees. Please try again.")).toBeTruthy();
  });

  it("renders the empty state", async () => {
    listEmployeesMock.mockResolvedValue(
      employeeResponse({
        employees: [],
        pagination: {
          page: 1,
          pageSize: 25,
          total: 0,
          totalPages: 0
        }
      })
    );

    render(<EmployeesPage />);

    expect(await screen.findByText("No employees found")).toBeTruthy();
    expect(screen.getByText("Try adjusting the search or filters.")).toBeTruthy();
  });

  it("renders employee rows", async () => {
    listEmployeesMock.mockResolvedValue(employeeResponse());

    render(<EmployeesPage />);

    expect(await screen.findByText("Aditi Sharma")).toBeTruthy();
    expect(screen.getByText("ACME-00001")).toBeTruthy();
    expect(screen.getByText("aditi.sharma@acme.example")).toBeTruthy();
    expect(screen.getByText("Engineering")).toBeTruthy();
    expect(screen.getByText("Senior Engineer")).toBeTruthy();
    expect(screen.getByText("India")).toBeTruthy();
    expect(screen.getByText("$128,000")).toBeTruthy();
  });

  it("requests the next page when pagination changes", async () => {
    listEmployeesMock.mockResolvedValue(
      employeeResponse({
        pagination: {
          page: 1,
          pageSize: 25,
          total: 100,
          totalPages: 4
        }
      })
    );

    render(<EmployeesPage />);

    await screen.findByText("Aditi Sharma");
    await userEvent.click(screen.getByLabelText("Go to next page"));

    await waitFor(() => expect(latestRequest()).toMatchObject({ page: 2, pageSize: 25 }));
  });

  it("searches employees with a debounced query", async () => {
    listEmployeesMock.mockResolvedValue(employeeResponse());

    render(<EmployeesPage />);

    await screen.findByText("Aditi Sharma");
    fireEvent.change(screen.getByPlaceholderText("Search by name, email, employee ID..."), {
      target: { value: "Aditi" }
    });
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    await waitFor(() => expect(latestRequest()).toMatchObject({ page: 1, search: "Aditi" }));
  });

  it("requests filtered employees", async () => {
    listEmployeesMock.mockResolvedValue(employeeResponse());

    render(<EmployeesPage />);

    await screen.findByText("Aditi Sharma");
    await userEvent.click(screen.getByRole("combobox", { name: "Country" }));
    await userEvent.click(await screen.findByRole("option", { name: "India" }));

    await waitFor(() => expect(latestRequest()).toMatchObject({ page: 1, country: "IN" }));
  });

  it("requests sorted employees", async () => {
    listEmployeesMock.mockResolvedValue(employeeResponse());

    render(<EmployeesPage />);

    await screen.findByText("Aditi Sharma");
    await userEvent.click(within(screen.getByRole("columnheader", { name: /Annual Salary/i })).getByRole("button"));

    await waitFor(() =>
      expect(latestRequest()).toMatchObject({
        page: 1,
        sortBy: "salary",
        sortDirection: "asc"
      })
    );

    await userEvent.click(within(screen.getByRole("columnheader", { name: /Annual Salary/i })).getByRole("button"));

    await waitFor(() =>
      expect(latestRequest()).toMatchObject({
        page: 1,
        sortBy: "salary",
        sortDirection: "desc"
      })
    );
  });
});
