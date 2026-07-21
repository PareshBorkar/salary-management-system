/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getEmployeeSalary,
  getEmployeeSalaryHistory,
  updateEmployeeSalary,
  type EmployeeSalaryResponse,
  type EmployeeSalaryHistoryResponse,
  type UpdateEmployeeSalaryResponse
} from "../../../src/api/employees.api";
import { getTaxSlabs, type TaxSlabsResponse } from "../../../src/api/taxSlabs.api";
import { clearEmployeeSalaryHistoryCache } from "../../../src/hooks/useEmployeeSalaryHistory";
import { clearLocalCurrencyCache } from "../../../src/hooks/useLocalCurrency";
import {
  EmployeeProfile,
  type EmployeeProfileData
} from "../../../src/pages/Employees/EmployeeProfile";

vi.mock("../../../src/api/employees.api", async () => {
  return {
    getEmployeeSalary: vi.fn(),
    getEmployeeSalaryHistory: vi.fn(),
    updateEmployeeSalary: vi.fn()
  };
});

vi.mock("../../../src/api/taxSlabs.api", async () => {
  return {
    getTaxSlabs: vi.fn()
  };
});

const getEmployeeSalaryMock = vi.mocked(getEmployeeSalary);
const getEmployeeSalaryHistoryMock = vi.mocked(getEmployeeSalaryHistory);
const updateEmployeeSalaryMock = vi.mocked(updateEmployeeSalary);
const getTaxSlabsMock = vi.mocked(getTaxSlabs);

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

function updatedSalaryHistoryResponse(): EmployeeSalaryHistoryResponse {
  return {
    employee: {
      id: "employee-1",
      employeeCode: "ACME-00042",
      firstName: "Aditi",
      lastName: "Sharma"
    },
    salaryHistory: [
      {
        id: "history-2",
        previousAmount: 128000,
        newAmount: 132000,
        currency: "USD",
        effectiveDate: "2026-04-01T00:00:00.000Z",
        reason: "MERIT",
        notes: null,
        updatedById: "hr-manager-1",
        changedBy: {
          id: "hr-manager-1",
          email: "hr.manager@acme.example"
        },
        createdAt: "2026-04-01T00:00:00.000Z"
      },
      ...salaryHistoryResponse().salaryHistory
    ]
  };
}

const salaryUpdateResponse: UpdateEmployeeSalaryResponse = {
  salary: {
    amount: 132000,
    currency: "USD",
    effectiveFrom: "2026-04-01T00:00:00.000Z"
  },
  salaryHistory: {
    id: "history-2",
    previousAmount: 128000,
    newAmount: 132000,
    currency: "USD",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    reason: "MERIT",
    updatedById: "hr-manager-1",
    changedBy: {
      id: "hr-manager-1",
      email: "hr.manager@acme.example"
    }
  }
};

const salaryDetailsResponse: EmployeeSalaryResponse = {
  employee: {
    id: "employee-1",
    employeeCode: "ACME-00042",
    firstName: "Aditi",
    lastName: "Sharma"
  },
  salary: {
    id: "salary-1",
    amount: 132000,
    currency: "USD",
    effectiveFrom: "2026-04-01T00:00:00.000Z",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z"
  }
};

const taxSlabsResponse: TaxSlabsResponse = {
  country: "IN",
  currency: "INR",
  regime: "NEW",
  assessmentYear: "2026-27",
  slabs: [
    {
      minIncome: 0,
      maxIncome: 400_000,
      taxRatePercent: 0
    },
    {
      minIncome: 400_001,
      maxIncome: 800_000,
      taxRatePercent: 5
    },
    {
      minIncome: 800_001,
      maxIncome: 1_200_000,
      taxRatePercent: 10
    },
    {
      minIncome: 1_200_001,
      maxIncome: 1_600_000,
      taxRatePercent: 15
    },
    {
      minIncome: 1_600_001,
      maxIncome: 2_000_000,
      taxRatePercent: 20
    },
    {
      minIncome: 2_000_001,
      maxIncome: 2_400_000,
      taxRatePercent: 25
    },
    {
      minIncome: 2_400_001,
      maxIncome: null,
      taxRatePercent: 30
    }
  ],
  calculation: {
    taxableIncome: 10_624_000,
    taxAmount: 2_767_200
  }
};

describe("EmployeeProfile", () => {
  beforeEach(() => {
    clearEmployeeSalaryHistoryCache();
    clearLocalCurrencyCache();
    getEmployeeSalaryMock.mockReset();
    getEmployeeSalaryHistoryMock.mockReset();
    updateEmployeeSalaryMock.mockReset();
    getTaxSlabsMock.mockReset();
    getEmployeeSalaryMock.mockResolvedValue(salaryDetailsResponse);
    getEmployeeSalaryHistoryMock.mockResolvedValue(salaryHistoryResponse());
    updateEmployeeSalaryMock.mockResolvedValue(salaryUpdateResponse);
    getTaxSlabsMock.mockResolvedValue(taxSlabsResponse);
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

  it("shows India tax slabs tab and calculation for Indian employees", async () => {
    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("tab", { name: "Tax Slabs" }));

    await waitFor(() =>
      expect(getTaxSlabsMock).toHaveBeenCalledWith(
        {
          country: "IN",
          regime: "NEW",
          assessmentYear: "2026-27",
          amount: 10_624_000
        },
        expect.any(AbortSignal)
      )
    );
    expect(await screen.findByText("India Tax Slabs")).toBeTruthy();
    expect(screen.getByText("Taxable Income")).toBeTruthy();
    expect(screen.getByText("₹10,624,000")).toBeTruthy();
    expect(screen.getByText("Estimated Slab Tax")).toBeTruthy();
    expect(screen.getByText("₹2,767,200")).toBeTruthy();
    expect(screen.getByText("₹2,400,001+")).toBeTruthy();
    expect(screen.getByText("30%")).toBeTruthy();
  });

  it("does not show tax slabs tab for non-Indian employees", () => {
    render(<EmployeeProfile employee={{ ...employee, country: "US" }} />);

    expect(screen.queryByRole("tab", { name: "Tax Slabs" })).toBeNull();
    expect(getTaxSlabsMock).not.toHaveBeenCalled();
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
    expect(dialogQueries.getByLabelText("Effective From")).toBeTruthy();
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

  it("closes the update salary popup after saving", async () => {
    getEmployeeSalaryHistoryMock.mockResolvedValueOnce(updatedSalaryHistoryResponse());

    render(<EmployeeProfile employee={employee} />);

    await userEvent.click(screen.getByRole("button", { name: "Update Salary" }));

    const dialog = screen.getByRole("dialog");
    const dialogQueries = within(dialog);

    await userEvent.type(
      dialogQueries.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "132000"
    );
    await userEvent.click(dialogQueries.getByRole("combobox", { name: /Reason/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Merit" }));
    await userEvent.type(dialogQueries.getByLabelText("Effective From"), "2026-04-01");
    await userEvent.click(dialogQueries.getByRole("button", { name: "Save & Update" }));

    await waitFor(() =>
      expect(updateEmployeeSalaryMock).toHaveBeenCalledWith("employee-1", {
        amount: 132000,
        reason: "MERIT",
        effectiveDate: "2026-04-01"
      })
    );
    await waitFor(() => expect(getEmployeeSalaryMock).toHaveBeenCalledWith("employee-1"));
    await waitFor(() =>
      expect(getEmployeeSalaryHistoryMock).toHaveBeenCalledWith("employee-1")
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getAllByText("$132,000").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("tab", { name: "Salary History" }));

    expect(screen.getByText("$128,000 to $132,000 - Merit")).toBeTruthy();
    expect(getEmployeeSalaryHistoryMock).toHaveBeenCalledTimes(1);
  });
});
