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
  const result = await persistEmployeeSalaryUpdate(input);

  if (!result) {
    return null;
  }

  return {
    salary: {
      amount: result.salary.amount.toNumber(),
      currency: result.salary.currency,
      effectiveFrom: result.salary.effectiveFrom.toISOString()
    },
    salaryHistory: {
      id: result.salaryHistory.id,
      previousAmount: result.salaryHistory.previousAmount.toNumber(),
      newAmount: result.salaryHistory.newAmount.toNumber(),
      currency: result.salaryHistory.currency,
      effectiveDate: result.salaryHistory.effectiveDate.toISOString(),
      reason: result.salaryHistory.reason,
      updatedById: result.salaryHistory.updatedById,
      changedBy: {
        id: result.updatedBy.id,
        email: result.updatedBy.email
      }
    }
  };
}
