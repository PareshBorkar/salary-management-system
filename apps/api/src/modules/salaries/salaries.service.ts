import { persistEmployeeSalaryUpdate } from "./salaries.repository.js";

export type UpdateEmployeeSalaryInput = {
  organizationId: string;
  employeeId: string;
  amount: number;
  effectiveDate: Date;
  reason: "MERIT" | "PROMOTION" | "ADJUSTMENT" | "CORRECTION";
  updatedById: string;
};

export async function updateEmployeeSalary(input: UpdateEmployeeSalaryInput) {
  return persistEmployeeSalaryUpdate(input);
}
