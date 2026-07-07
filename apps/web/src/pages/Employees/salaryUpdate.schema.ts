import type { SalaryChangeReason } from "../../api/employees.api";

export type SalaryUpdateFormValues = {
  amount: string;
  reason: string;
  effectiveDate: string;
};

export type SalaryUpdateValidationErrors = {
  amount?: string;
  reason?: string;
  effectiveDate?: string;
};

export const salaryChangeReasons: Array<{
  value: SalaryChangeReason;
  label: string;
}> = [
  { value: "MERIT", label: "Merit" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "CORRECTION", label: "Correction" }
];

export function validateSalaryUpdate(values: SalaryUpdateFormValues) {
  const errors: SalaryUpdateValidationErrors = {};
  const amount = Number(values.amount);

  if (!values.amount.trim()) {
    errors.amount = "Salary is required.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Salary must be greater than 0.";
  }

  if (!values.reason) {
    errors.reason = "Reason is required.";
  }

  if (!values.effectiveDate) {
    errors.effectiveDate = "Effective date is required.";
  } else if (Number.isNaN(new Date(values.effectiveDate).getTime())) {
    errors.effectiveDate = "Effective date must be valid.";
  }

  return errors;
}
