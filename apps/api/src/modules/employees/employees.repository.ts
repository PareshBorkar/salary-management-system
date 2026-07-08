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

export type CreateEmployeeRecordInput = {
  organizationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  department?: string;
  country?: string;
  role?: string;
  level?: string;
  status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  hiredAt?: Date;
};

export type LastEmployeeCodeRecord = {
  employeeCode: string;
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

export async function createEmployeeRecord(input: CreateEmployeeRecordInput) {
  return prisma.employee.create({
    data: input,
    include: {
      salary: true
    }
  });
}

export async function findLastEmployeeCode(
  organizationId: string
): Promise<LastEmployeeCodeRecord | null> {
  return prisma.employee.findFirst({
    where: {
      organizationId
    },
    orderBy: [
      {
        createdAt: "desc"
      },
      {
        id: "desc"
      }
    ],
    select: {
      employeeCode: true
    }
  });
}
