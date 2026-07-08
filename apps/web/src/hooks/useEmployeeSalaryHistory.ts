import { useState } from "react";

import {
  getEmployeeSalaryHistory,
  type EmployeeSalaryHistoryResponse
} from "../api/employees.api";
import { getApiErrorMessage } from "../api/responses";

const employeeSalaryHistoryCache = new Map<string, EmployeeSalaryHistoryResponse>();

export function clearEmployeeSalaryHistoryCache() {
  employeeSalaryHistoryCache.clear();
}

export function useEmployeeSalaryHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadEmployeeSalaryHistory(employeeId: string) {
    const cachedHistory = employeeSalaryHistoryCache.get(employeeId);

    if (cachedHistory) {
      setErrorMessage(null);
      return cachedHistory;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getEmployeeSalaryHistory(employeeId);
      employeeSalaryHistoryCache.set(employeeId, result);
      return result;
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to load salary history. Please try again.")
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    errorMessage,
    loadEmployeeSalaryHistory
  };
}
