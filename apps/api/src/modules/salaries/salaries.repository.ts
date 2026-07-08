import { prisma } from "../../shared/database/prisma.js";

export type PersistEmployeeSalaryUpdateInput = {
  organizationId: string;
  employeeId: string;
  amount: number;
  effectiveDate: Date;
  reason: "MERIT" | "PROMOTION" | "ADJUSTMENT" | "CORRECTION";
  updatedById: string;
};

export async function persistEmployeeSalaryUpdate(
  input: PersistEmployeeSalaryUpdateInput
) {
  return prisma.$transaction(async (transaction) => {
    const employee = await transaction.employee.findFirst({
      where: {
        id: input.employeeId,
        organizationId: input.organizationId
      },
      include: {
        salary: true
      }
    });

    if (!employee) {
      return null;
    }

    const updatedBy = await transaction.user.findFirst({
      where: {
        id: input.updatedById,
        organizationId: input.organizationId
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!updatedBy) {
      return null;
    }

    const previousAmount = employee.salary?.amount.toNumber() ?? 0;
    const salary = await transaction.salary.upsert({
      where: {
        organizationId_employeeId: {
          organizationId: input.organizationId,
          employeeId: input.employeeId
        }
      },
      update: {
        amount: input.amount.toFixed(2),
        currency: employee.salary?.currency ?? "USD",
        effectiveFrom: input.effectiveDate
      },
      create: {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        amount: input.amount.toFixed(2),
        currency: "USD",
        effectiveFrom: input.effectiveDate
      }
    });

    const salaryHistory = await transaction.salaryHistory.create({
      data: {
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        previousAmount: previousAmount.toFixed(2),
        newAmount: input.amount.toFixed(2),
        currency: salary.currency,
        effectiveDate: input.effectiveDate,
        reason: input.reason,
        updatedById: updatedBy.id
      }
    });

    return {
      salary,
      salaryHistory,
      updatedBy
    };
  });
}

export type GetEmployeeSalaryHistoryInput = {
  organizationId: string;
  employeeId: string;
};

export type GetEmployeeSalaryDetailsInput = {
  organizationId: string;
  employeeId: string;
};

export async function findEmployeeSalaryDetails(input: GetEmployeeSalaryDetailsInput) {
  return prisma.employee.findFirst({
    where: {
      id: input.employeeId,
      organizationId: input.organizationId
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      salary: {
        select: {
          id: true,
          amount: true,
          currency: true,
          effectiveFrom: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
}

export async function findEmployeeSalaryHistory(input: GetEmployeeSalaryHistoryInput) {
  const employee = await prisma.employee.findFirst({
    where: {
      id: input.employeeId,
      organizationId: input.organizationId
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true
    }
  });

  if (!employee) {
    return null;
  }

  const salaryHistory = await prisma.salaryHistory.findMany({
    where: {
      employeeId: input.employeeId,
      organizationId: input.organizationId
    },
    orderBy: [
      {
        effectiveDate: "desc"
      },
      {
        createdAt: "desc"
      }
    ],
    include: {
      updatedBy: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  return {
    employee,
    salaryHistory
  };
}
