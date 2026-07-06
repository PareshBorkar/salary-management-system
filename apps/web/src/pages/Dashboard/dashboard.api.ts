import { apiClient } from "../../api";

export type CompensationAnalytics = {
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  countByCountry: Array<{
    country: string;
    count: number;
  }>;
  payrollByCountry?: Array<{
    country: string;
    totalPayroll: number;
  }>;
  averageByDepartment: Array<{
    department: string;
    averageSalary: number;
  }>;
  salaryBands: Array<{
    label: string;
    min: number;
    max: number | null;
    count: number;
  }>;
  distributionByRole?: Array<{
    role: string;
    count: number;
  }>;
  distributionByLevel?: Array<{
    level: string;
    count: number;
  }>;
};

export async function getCompensationAnalytics(signal?: AbortSignal) {
  const response = await apiClient.get<CompensationAnalytics>("/analytics/compensation", {
    signal
  });

  return response.data;
}
