import { Prisma } from "@prisma/client";

import {
  createEmployeeRecord,
  findLastEmployeeCode,
  findEmployeeSalaryRecords,
  type EmployeeSalaryRecord
} from "./employees.repository.js";

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

export type CreateEmployeeInput = {
  organizationId: string;
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

export type CreateEmployeeResult =
  | {
      ok: true;
      employee: ReturnType<typeof serializeEmployeeSalaryRecord>;
    }
  | {
      ok: false;
      reason: "DUPLICATE_EMPLOYEE";
    };

export async function listEmployeeSalaryRecords(query: EmployeeListQuery) {
  const { total, employees } = await findEmployeeSalaryRecords(query);

  return {
    employees: employees.map(serializeEmployeeSalaryRecord),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize)
    }
  };
}

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<CreateEmployeeResult> {
  const maxCreateAttempts = 3;

  for (let attempt = 0; attempt < maxCreateAttempts; attempt += 1) {
    try {
      const employeeCode = await generateNextEmployeeCode(input.organizationId);
      const employee = await createEmployeeRecord({
        ...input,
        employeeCode
      });

      return {
        ok: true,
        employee: serializeEmployeeSalaryRecord(employee)
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        if (attempt < maxCreateAttempts - 1) {
          continue;
        }

        return {
          ok: false,
          reason: "DUPLICATE_EMPLOYEE"
        };
      }

      throw error;
    }
  }

  return {
    ok: false,
    reason: "DUPLICATE_EMPLOYEE"
  };
}

async function generateNextEmployeeCode(organizationId: string) {
  const lastEmployee = await findLastEmployeeCode(organizationId);

  if (!lastEmployee) {
    return "EMP-00001";
  }

  const match = /^(.*?)(\d+)$/.exec(lastEmployee.employeeCode);

  if (!match) {
    return `${lastEmployee.employeeCode}-00001`;
  }

  const prefix = match[1] ?? "";
  const numericSuffix = match[2];

  if (!numericSuffix) {
    return `${lastEmployee.employeeCode}-00001`;
  }

  const nextNumber = Number(numericSuffix) + 1;

  return `${prefix}${String(nextNumber).padStart(numericSuffix.length, "0")}`;
}

function serializeEmployeeSalaryRecord(employee: EmployeeSalaryRecord) {
  return {
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
  };
}
