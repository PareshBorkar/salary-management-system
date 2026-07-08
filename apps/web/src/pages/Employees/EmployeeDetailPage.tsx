import { Alert, Stack } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";

import { EmployeeProfile, type EmployeeProfileData } from "./EmployeeProfile";
import type { Employee } from "../../api/employees.api";

type EmployeeDetailLocationState = {
  employee?: Employee;
};

export function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const location = useLocation();
  const employee = (location.state as EmployeeDetailLocationState | null)?.employee;

  if (!employee) {
    return (
      <Stack spacing={2}>
        <Alert severity="info">
          Employee details for {employeeId ?? "this employee"} are not loaded.{" "}
          <Link to="/employees">Back to employees</Link>
        </Alert>
      </Stack>
    );
  }

  return <EmployeeProfile employee={toEmployeeProfileData(employee)} />;
}

function toEmployeeProfileData(employee: Employee): EmployeeProfileData {
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    title: employee.title,
    country: employee.country,
    department: employee.department,
    role: employee.role,
    level: employee.level,
    status: "Active",
    salary: employee.salary
      ? {
          amount: employee.salary.amount,
          currency: employee.salary.currency,
          effectiveFrom: employee.salary.effectiveFrom ?? new Date().toISOString()
        }
      : null,
    salaryHistory: []
  };
}
