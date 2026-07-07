import { useState } from "react";

import { getApiErrorMessage } from "../api/responses";
import {
  updateEmployeeSalary,
  type UpdateEmployeeSalaryRequest,
  type UpdateEmployeeSalaryResponse
} from "../api/employees.api";

export function useUpdateEmployeeSalary() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function mutate(
    employeeId: string,
    payload: UpdateEmployeeSalaryRequest
  ): Promise<UpdateEmployeeSalaryResponse | null> {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await updateEmployeeSalary(employeeId, payload);
      setSuccessMessage("Salary updated successfully.");
      return response;
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to update salary. Please try again.")
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    mutate,
    isSubmitting,
    successMessage,
    errorMessage
  };
}
