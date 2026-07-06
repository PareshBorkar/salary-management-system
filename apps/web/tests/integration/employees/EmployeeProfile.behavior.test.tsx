/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  EmployeeProfile,
  type EmployeeProfileData
} from "../../../src/pages/Employees/EmployeeProfile";

const employee: EmployeeProfileData = {
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

describe("EmployeeProfile", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders employee profile details", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getByText("Aditi Sharma")).toBeTruthy();
    expect(screen.getByText("ACME-00042")).toBeTruthy();
    expect(screen.getByText("aditi.sharma@acme.example")).toBeTruthy();
    expect(screen.getByText(/Engineering/)).toBeTruthy();
    expect(screen.getByText("Full-time")).toBeTruthy();
    expect(screen.getByText("Rohan Mehta")).toBeTruthy();
    expect(screen.getByText("+91 98765 43210")).toBeTruthy();
    expect(screen.getByText(/Senior Engineer/)).toBeTruthy();
    expect(screen.getByText("India")).toBeTruthy();
  });

  it("displays the current salary", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getByText("Current Compensation")).toBeTruthy();
    expect(screen.getAllByText("$128,000").length).toBeGreaterThan(0);
  });

  it("displays salary metadata", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getByText("Currency")).toBeTruthy();
    expect(screen.getByText("USD")).toBeTruthy();
    expect(screen.getByText("Effective From")).toBeTruthy();
    expect(screen.getByText("Mar 1, 2026")).toBeTruthy();
  });

  it("renders the salary history section", () => {
    render(<EmployeeProfile employee={employee} />);

    expect(screen.getAllByText("Salary History").length).toBeGreaterThan(0);
    expect(screen.getByText("$90,000 to $128,000")).toBeTruthy();
    expect(screen.getByText("MERIT effective Mar 1, 2026")).toBeTruthy();
    expect(
      screen.getByText("Changed by ACME HR Manager (hr.manager@acme.example)")
    ).toBeTruthy();
  });
});
