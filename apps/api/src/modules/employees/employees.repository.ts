import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/database/prisma.js";
import type { EmployeeListQuery } from "./employees.service.js";

export type EmployeeSalaryRecord = Prisma.EmployeeGetPayload<{
  include: {
    salary: true;
  };
}>;

export type EmployeeSalaryRecordPage = {
  total: number;
  employees: EmployeeSalaryRecord[];
};

export async function findEmployeeSalaryRecords(
  query: EmployeeListQuery
): Promise<EmployeeSalaryRecordPage> {
  const where: Prisma.EmployeeWhereInput = {
    organizationId: query.organizationId
  };

  if (query.search) {
    where.OR = [
      { employeeCode: { contains: query.search, mode: "insensitive" } },
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } }
    ];
  }

  if (query.country) {
    where.country = query.country;
  }

  if (query.department) {
    where.department = query.department;
  }

  if (query.role) {
    where.role = query.role;
  }

  if (query.level) {
    where.level = query.level;
  }

  const orderBy: Prisma.EmployeeOrderByWithRelationInput =
    query.sortBy === "salary"
      ? { salary: { amount: query.sortDirection } }
      : { [query.sortBy]: query.sortDirection };

  const skip = (query.page - 1) * query.pageSize;

  const [total, employees] = await prisma.$transaction([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy,
      include: {
        salary: true
      }
    })
  ]);

  return {
    total,
    employees
  };
}
