/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getEmployeeSalaryHistory,
  type EmployeeSalaryHistoryResponse
} from "../../../src/api/employees.api";
import { clearEmployeeSalaryHistoryCache } from "../../../src/hooks/useEmployeeSalaryHistory";
import { clearLocalCurrencyCache } from "../../../src/hooks/useLocalCurrency";
import {
  EmployeeProfile,
  type EmployeeProfileData
} from "../../../src/pages/Employees/EmployeeProfile";

vi.mock("../../../src/api/employees.api", async () => {
  return {
    getEmployeeSalaryHistory: vi.fn(),
    updateEmployeeSalary: vi.fn()
  };
});

const getEmployeeSalaryHistoryMock = vi.mocked(getEmployeeSalaryHistory);

const employee: EmployeeProfileData = {
  id: "employee-1",
  employeeCode: "ACME-00042",
  firstName: "Aditi",
  lastName: "Sharma",
  email: "aditi.sharma@acme.example",
  title: "Senior Engineer",
  country: "IN",
  department: "Engineering",
  role: "Engineer",
  level: "Senior",
  phone: "+91 98765 43210",
  employmentType: "Full-time",
  reportsTo: "Rohan Mehta",
  hiredAt: "2021-01-15T00:00:00.000Z",
  status: "Active",
  salary: {
    amount: 128000,
    currency: "USD",
    effectiveFrom: "2026-03-01T00:00:00.000Z"
  },
  salaryHistory: [
    {
      id: "history-1",
      previousAmount: 90000,
      newAmount: 128000,
      currency: "USD",
      effectiveDate: "2026-03-01T00:00:00.000Z",
      reason: "MERIT",
      changedBy: {
        name: "ACME HR Manager",
        email: "hr.manager@acme.example"
      }
    }
  ]
};

function salaryHistoryResponse(): EmployeeSalaryHistoryResponse {
  return {
    employee: {
      id: "employee-1",
      employeeCode: "ACME-00042",
      firstName: "Aditi",
      lastName: "Sharma"
    },
    salaryHistory: [
      {
        id: "history-1",
        previousAmount: 90000,
        newAmount: 128000,
        currency: "USD",
        effectiveDate: "2026-03-01T00:00:00.000Z",
        reason: "MERIT",
        notes: null,
        updatedById: "hr-manager-1",
        changedBy: {
          id: "hr-manager-1",
          email: "hr.manager@acme.example"
        },
        createdAt: "2026-03-01T00:00:00.000Z"
      }
    ]
  };
}

describe("EmployeeProfile", () => {
  beforeEach(() => {
    clearEmployeeSalaryHistoryCache();
    clearLocalCurrencyCache();
    getEmployeeSalaryHistoryMock.mockReset();
    getEmployeeSalaryHistoryMock.mockResolvedValue(salaryHistoryResponse());
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rate: 83 })
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders employee profile details", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getByText("Aditi Sharma")).toBeTruthy();
    expect(screen.getByText("ACME-00042")).toBeTruthy();
    expect(screen.getByText("aditi.sharma@acme.example")).toBeTruthy();
    expect(screen.getAllByText(/Engineering/).length).toBeGreaterThan(0);
    expect(screen.getByText("+91 98765 43210")).toBeTruthy();
    expect(screen.getAllByText(/Senior Engineer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/India/).length).toBeGreaterThan(0);
  });

  it("displays the current salary", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getByText("Employee Overview")).toBeTruthy();
    expect(screen.getAllByText("$128,000").length).toBeGreaterThan(0);
  });

  it("displays salary metadata on the salary details tab", async () => {
    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("tab", { name: "Salary Details" }));

    expect(screen.getAllByText("Salary Details").length).toBeGreaterThan(0);
    expect(screen.getByText("Effective From")).toBeTruthy();
    expect(screen.getByText("Mar 1, 2026")).toBeTruthy();
    expect(screen.getByText("Total Cash")).toBeTruthy();
    expect(await screen.findByText("₹10,624,000")).toBeTruthy();
  });

  it("loads the salary history section when the tab is opened", async () => {
    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("tab", { name: "Salary History" }));

    await waitFor(() =>
      expect(getEmployeeSalaryHistoryMock).toHaveBeenCalledWith("employee-1")
    );
    expect(screen.getAllByText("Salary History").length).toBeGreaterThan(0);
    expect(screen.getByText("$90,000 to $128,000 - Merit")).toBeTruthy();
    expect(
      screen.getByText("Changed by hr.manager@acme.example (hr.manager@acme.example)")
    ).toBeTruthy();
  });

  it("memoizes salary history when reopening the tab", async () => {
    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("tab", { name: "Salary History" }));
    await waitFor(() => expect(getEmployeeSalaryHistoryMock).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.click(screen.getByRole("tab", { name: "Salary History" }));

    expect(getEmployeeSalaryHistoryMock).toHaveBeenCalledTimes(1);
  });

  it("memoizes local currency when reopening the salary details tab", async () => {
    const fetchMock = vi.mocked(fetch);

    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("tab", { name: "Salary Details" }));
    expect(await screen.findByText("₹10,624,000")).toBeTruthy();

    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.click(screen.getByRole("tab", { name: "Salary Details" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("opens the update salary popup", async () => {
    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("button", { name: "Update Salary" }));

    const dialog = screen.getByRole("dialog");
    const dialogQueries = within(dialog);

    expect(dialog).toBeTruthy();
    expect(dialogQueries.getByLabelText("Employee").textContent).toContain(
      "Aditi Sharma (ACME-00042)"
    );
    expect(dialogQueries.getByRole("textbox", { name: "Effective From" })).toBeTruthy();
    expect(
      dialogQueries.getByRole("spinbutton", { name: /Annual Base Salary/ })
    ).toBeTruthy();
    expect(dialogQueries.getByLabelText("Currency").textContent).toContain("USD");
    expect(dialogQueries.getByRole("combobox", { name: /Reason/ })).toBeTruthy();
    expect(await dialogQueries.findByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(
      await dialogQueries.findByRole("button", { name: "Save & Update" })
    ).toBeTruthy();
  });
});
