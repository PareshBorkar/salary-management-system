import { apiClient } from "../../api";

export type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  country: string | null;
  department: string | null;
  role: string | null;
  level: string | null;
  salary: {
    amount: number;
    currency: string;
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
    | "employeeCode"
    | "firstName"
    | "country"
    | "department"
    | "role"
    | "level"
    | "salary";
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

export async function listEmployees(params: EmployeeListRequest, signal?: AbortSignal) {
  const response = await apiClient.get<EmployeeListResponse>("/employees", {
    signal,
    params
  });

  return response.data;
}
