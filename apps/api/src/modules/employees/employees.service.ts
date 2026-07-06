import { findEmployeeSalaryRecords } from "./employees.repository.js";

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
  const { total, employees } = await findEmployeeSalaryRecords(query);

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
