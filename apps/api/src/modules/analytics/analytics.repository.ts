import { prisma } from "../../shared/database/prisma.js";

export type CompensationAnalyticsRecord = {
  country: string | null;
  department: string | null;
  salaryAmount: number;
};

export async function findCompensationAnalyticsRecords(
  organizationId: string
): Promise<CompensationAnalyticsRecord[]> {
  const employees = await prisma.employee.findMany({
    where: {
      organizationId,
      salary: {
        isNot: null
      }
    },
    select: {
      country: true,
      department: true,
      salary: {
        select: {
          amount: true
        }
      }
    }
  });

  return employees.flatMap((employee) =>
    employee.salary
      ? [
          {
            country: employee.country,
            department: employee.department,
            salaryAmount: employee.salary.amount.toNumber()
          }
        ]
      : []
  );
}
