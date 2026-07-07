/* @vitest-environment jsdom */
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SalaryUpdateForm } from "../../../src/pages/Employees/SalaryUpdateForm";
import {
  updateEmployeeSalary,
  type UpdateEmployeeSalaryResponse
} from "../../../src/pages/Employees/employees.api";

vi.mock("../../../src/pages/Employees/employees.api", async () => {
  return {
    updateEmployeeSalary: vi.fn()
  };
});

const updateEmployeeSalaryMock = vi.mocked(updateEmployeeSalary);

const successfulResponse: UpdateEmployeeSalaryResponse = {
  salary: {
    amount: 125000,
    currency: "USD",
    effectiveFrom: "2026-03-01T00:00:00.000Z"
  },
  salaryHistory: {
    id: "history-1",
    previousAmount: 90000,
    newAmount: 125000,
    currency: "USD",
    effectiveDate: "2026-03-01T00:00:00.000Z",
    reason: "MERIT",
    updatedById: "hr-manager-1",
    changedBy: {
      id: "hr-manager-1",
      email: "hr.manager@acme.example"
    }
  }
};

function createApiError(message: string, status = 500) {
  return new AxiosError(
    message,
    undefined,
    {
      headers: {},
      method: "patch",
      url: "/employees/employee-1/salary"
    } as InternalAxiosRequestConfig,
    undefined,
    {
      data: {
        success: false,
        message,
        code: "REQUEST_FAILED",
        statusCode: status
      },
      status,
      statusText: "Error",
      headers: {},
      config: {
        headers: {},
        method: "patch",
        url: "/employees/employee-1/salary"
      } as InternalAxiosRequestConfig
    }
  );
}

describe("SalaryUpdateForm", () => {
  beforeEach(() => {
    updateEmployeeSalaryMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("validates required fields", async () => {
    render(<SalaryUpdateForm employeeId="employee-1" />);

    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(screen.getByText("Salary is required.")).toBeTruthy();
    expect(screen.getByText("Reason is required.")).toBeTruthy();
    expect(screen.getByText("Effective date is required.")).toBeTruthy();
    expect(updateEmployeeSalaryMock).not.toHaveBeenCalled();
  });

  it("validates salary amount", async () => {
    render(<SalaryUpdateForm employeeId="employee-1" />);

    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "0"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(screen.getByText("Salary must be greater than 0.")).toBeTruthy();
    expect(updateEmployeeSalaryMock).not.toHaveBeenCalled();
  });

  it("validates effective date", async () => {
    render(<SalaryUpdateForm employeeId="employee-1" />);

    fireEvent.change(screen.getByRole("textbox", { name: "Effective From" }), {
      target: { value: "invalid-date" }
    });
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(screen.getByText("Salary is required.")).toBeTruthy();
    expect(screen.getByText("Effective date must be valid.")).toBeTruthy();
    expect(updateEmployeeSalaryMock).not.toHaveBeenCalled();
  });

  it("validates reason", async () => {
    render(<SalaryUpdateForm employeeId="employee-1" />);

    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "125000"
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Effective From" }), {
      target: { value: "2026-03-01" }
    });
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(screen.getByText("Reason is required.")).toBeTruthy();
    expect(updateEmployeeSalaryMock).not.toHaveBeenCalled();
  });

  it("handles successful salary update", async () => {
    const onSuccess = vi.fn();
    updateEmployeeSalaryMock.mockResolvedValue(successfulResponse);

    render(<SalaryUpdateForm employeeId="employee-1" onSuccess={onSuccess} />);

    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "125000"
    );
    await userEvent.click(screen.getByRole("combobox", { name: /Reason/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Merit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Effective From" }), {
      target: { value: "2026-03-01" }
    });
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    await waitFor(() =>
      expect(updateEmployeeSalaryMock).toHaveBeenCalledWith("employee-1", {
        amount: 125000,
        reason: "MERIT",
        effectiveDate: "2026-03-01"
      })
    );
    expect(await screen.findByText("Salary updated successfully.")).toBeTruthy();
    expect(onSuccess).toHaveBeenCalledWith(successfulResponse);
  });

  it("handles salary update errors", async () => {
    updateEmployeeSalaryMock.mockRejectedValue(new Error("Request failed"));

    render(<SalaryUpdateForm employeeId="employee-1" />);

    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "125000"
    );
    await userEvent.click(screen.getByRole("combobox", { name: /Reason/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Merit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Effective From" }), {
      target: { value: "2026-03-01" }
    });
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(
      await screen.findByText("Unable to update salary. Please try again.")
    ).toBeTruthy();
  });

  it("renders API error messages for salary update failures", async () => {
    updateEmployeeSalaryMock.mockRejectedValue(
      createApiError("Salary update requires a valid effective date.", 400)
    );

    render(<SalaryUpdateForm employeeId="employee-1" />);

    await userEvent.type(
      screen.getByRole("spinbutton", { name: /Annual Base Salary/ }),
      "125000"
    );
    await userEvent.click(screen.getByRole("combobox", { name: /Reason/ }));
    await userEvent.click(await screen.findByRole("option", { name: "Merit" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Effective From" }), {
      target: { value: "2026-03-01" }
    });
    await userEvent.click(screen.getByRole("button", { name: "Save & Update" }));

    expect(
      await screen.findByText("Salary update requires a valid effective date.")
    ).toBeTruthy();
  });
});
