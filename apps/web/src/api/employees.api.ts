import { apiClient } from "./client";
import { type ApiSuccessResponse, unwrapApiResponse } from "./responses";

export type Employee = {
  id: string;
  organizationId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  country: string | null;
  department: string | null;
  role: string | null;
  level: string | null;
  status?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  hiredAt?: string | null;
  salary: {
    amount: number;
    currency: string;
    effectiveFrom?: string;
  } | null;
};

export type EmployeeListRequest = {
  page: number;
  pageSize: number;
  search?: string;
  country?: string;
  department?: string;
  role?: string;
  level?: string;
  sortBy:
    "employeeCode" | "firstName" | "country" | "department" | "role" | "level" | "salary";
  sortDirection: "asc" | "desc";
};

export type EmployeeListResponse = {
  employees: Employee[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type SalaryChangeReason = "MERIT" | "PROMOTION" | "ADJUSTMENT" | "CORRECTION";

export type CreateEmployeeRequest = {
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  country?: string;
  department?: string;
  role?: string;
  level?: string;
};

export type UpdateEmployeeSalaryRequest = {
  amount: number;
  reason: SalaryChangeReason;
  effectiveDate: string;
};

export type UpdateEmployeeSalaryResponse = {
  salary: {
    amount: number;
    currency: string;
    effectiveFrom: string;
  };
  salaryHistory: {
    id: string;
    previousAmount: number;
    newAmount: number;
    currency: string;
    effectiveDate: string;
    reason: SalaryChangeReason;
    updatedById: string | null;
    changedBy: {
      id: string;
      email: string;
    };
  };
};

export type EmployeeSalaryHistoryResponse = {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  };
  salaryHistory: Array<{
    id: string;
    previousAmount: number;
    newAmount: number;
    currency: string;
    effectiveDate: string;
    reason: SalaryChangeReason | "HIRE";
    notes: string | null;
    updatedById: string | null;
    changedBy: {
      id: string;
      email: string;
    } | null;
    createdAt: string;
  }>;
};

export async function listEmployees(params: EmployeeListRequest, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeListResponse>>(
    "/employees",
    {
      signal,
      params
    }
  );

  return unwrapApiResponse(response.data);
}

export async function createEmployee(payload: CreateEmployeeRequest) {
  const response = await apiClient.post<ApiSuccessResponse<Employee>>(
    "/employees",
    payload
  );

  return unwrapApiResponse(response.data);
}

export async function getEmployeeSalaryHistory(employeeId: string, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccessResponse<EmployeeSalaryHistoryResponse>>(
    `/employees/${employeeId}/salary/history`,
    {
      signal
    }
  );

  return unwrapApiResponse(response.data);
}

export async function updateEmployeeSalary(
  employeeId: string,
  payload: UpdateEmployeeSalaryRequest
) {
  const response = await apiClient.patch<
    ApiSuccessResponse<UpdateEmployeeSalaryResponse>
  >(`/employees/${employeeId}/salary`, payload);

  return unwrapApiResponse(response.data);
}
