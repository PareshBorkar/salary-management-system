/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { EmployeeDetailPage } from "../../../src/pages/Employees/EmployeeDetailPage";
import type { Employee } from "../../../src/pages/Employees/employees.api";

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
    currency: "USD",
    effectiveFrom: "2026-03-01T00:00:00.000Z"
  }
};

describe("EmployeeDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the employee profile from navigation state", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/employees/employee-1",
            state: { employee }
          }
        ]}
      >
        <Routes>
          <Route path="/employees/:employeeId" element={<EmployeeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Aditi Sharma")).toBeTruthy();
    expect(screen.getByText("ACME-00001")).toBeTruthy();
    expect(screen.getByText("Current Compensation")).toBeTruthy();
    expect(screen.getAllByText("$128,000").length).toBeGreaterThan(0);
  });
});
