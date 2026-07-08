import { useCallback, useState } from "react";

import {
  createEmployee,
  type CreateEmployeeRequest,
  type Employee
} from "../api/employees.api";
import { getApiErrorMessage } from "../api/responses";

export function useCreateEmployee() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function mutate(payload: CreateEmployeeRequest): Promise<Employee | null> {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      return await createEmployee(payload);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to add employee. Please try again.")
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  const reset = useCallback(function reset() {
    setErrorMessage(null);
  }, []);

  return {
    mutate,
    reset,
    isSubmitting,
    errorMessage
  };
}
