import type { Prisma } from "@prisma/client";

import { prisma } from "../../shared/database/prisma.js";

export type EmployeeListQuery = {
  organizationId: string;
  page: number;
  pageSize: number;
  search?: string;
  country?: string;
  department?: string;
  role?: string;
  level?: string;
  sortBy:
    | "employeeCode"
    | "firstName"
    | "lastName"
    | "country"
    | "department"
    | "role"
    | "level"
    | "salary";
  sortDirection: "asc" | "desc";
};

export async function listEmployeeSalaryRecords(query: EmployeeListQuery) {
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
    employees: employees.map((employee) => ({
      id: employee.id,
      organizationId: employee.organizationId,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      title: employee.title,
      country: employee.country,
      department: employee.department,
      role: employee.role,
      level: employee.level,
      status: employee.status,
      hiredAt: employee.hiredAt?.toISOString() ?? null,
      salary: employee.salary
        ? {
            amount: employee.salary.amount.toNumber(),
            currency: employee.salary.currency,
            effectiveFrom: employee.salary.effectiveFrom.toISOString()
          }
        : null
    })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize)
    }
  };
}
