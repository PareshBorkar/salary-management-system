import {
  findEmployeeSalaryDetails,
  findEmployeeSalaryHistory,
  persistEmployeeSalaryUpdate
} from "./salaries.repository.js";

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

export type GetEmployeeSalaryHistoryInput = {
  organizationId: string;
  employeeId: string;
};

export type GetEmployeeSalaryDetailsInput = {
  organizationId: string;
  employeeId: string;
};

export async function getEmployeeSalaryDetails(input: GetEmployeeSalaryDetailsInput) {
  const employee = await findEmployeeSalaryDetails(input);

  if (!employee) {
    return null;
  }

  return {
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName
    },
    salary: employee.salary
      ? {
          id: employee.salary.id,
          amount: employee.salary.amount.toNumber(),
          currency: employee.salary.currency,
          effectiveFrom: employee.salary.effectiveFrom.toISOString(),
          createdAt: employee.salary.createdAt.toISOString(),
          updatedAt: employee.salary.updatedAt.toISOString()
        }
      : null
  };
}

export async function getEmployeeSalaryHistory(input: GetEmployeeSalaryHistoryInput) {
  const result = await findEmployeeSalaryHistory(input);

  if (!result) {
    return null;
  }

  return {
    employee: result.employee,
    salaryHistory: result.salaryHistory.map((salaryHistory) => ({
      id: salaryHistory.id,
      previousAmount: salaryHistory.previousAmount.toNumber(),
      newAmount: salaryHistory.newAmount.toNumber(),
      currency: salaryHistory.currency,
      effectiveDate: salaryHistory.effectiveDate.toISOString(),
      reason: salaryHistory.reason,
      notes: salaryHistory.notes,
      updatedById: salaryHistory.updatedById,
      changedBy: salaryHistory.updatedBy
        ? {
            id: salaryHistory.updatedBy.id,
            email: salaryHistory.updatedBy.email
          }
        : null,
      createdAt: salaryHistory.createdAt.toISOString()
    }))
  };
}
