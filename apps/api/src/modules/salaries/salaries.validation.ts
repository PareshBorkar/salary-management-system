import { z } from "zod";

export const salaryUpdateParamsSchema = z.object({
  employeeId: z.string().trim().min(1)
});

export const salaryDetailsParamsSchema = salaryUpdateParamsSchema;

export const salaryHistoryParamsSchema = salaryUpdateParamsSchema;

export const salaryUpdateBodySchema = z.object({
  amount: z
    .number({
      required_error: "Salary amount is required",
      invalid_type_error: "Salary amount must be a number"
    })
    .finite()
    .positive("Salary amount must be positive"),
  reason: z.enum(["MERIT", "PROMOTION", "ADJUSTMENT", "CORRECTION"], {
    required_error: "Salary change reason is required",
    invalid_type_error: "Salary change reason is required"
  }),
  effectiveDate: z
    .string({
      required_error: "Effective date is required",
      invalid_type_error: "Effective date is required"
    })
    .trim()
    .min(1, "Effective date is required")
    .pipe(z.coerce.date())
});
