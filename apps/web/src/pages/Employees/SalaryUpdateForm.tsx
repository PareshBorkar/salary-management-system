import { type FormEvent, useState } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";

import {
  updateEmployeeSalary,
  type SalaryChangeReason,
  type UpdateEmployeeSalaryResponse
} from "./employees.api";

const salaryChangeReasons: Array<{ value: SalaryChangeReason; label: string }> = [
  { value: "MERIT", label: "Merit" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "CORRECTION", label: "Correction" }
];

type SalaryUpdateFormProps = {
  employeeId: string;
  employeeLabel?: string;
  currency?: string;
  onSuccess?: (response: UpdateEmployeeSalaryResponse) => void;
  onCancel?: () => void;
};

type ValidationErrors = {
  amount?: string;
  reason?: string;
  effectiveDate?: string;
};

export function SalaryUpdateForm({
  employeeId,
  employeeLabel,
  currency = "USD",
  onSuccess,
  onCancel
}: SalaryUpdateFormProps) {
  const [amount, setAmount] = useState("");
  const [variableTarget, setVariableTarget] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validationErrors = validateSalaryUpdate({
      amount,
      reason,
      effectiveDate
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await updateEmployeeSalary(employeeId, {
        amount: Number(amount),
        reason: reason as SalaryChangeReason,
        effectiveDate
      });

      setSuccessMessage("Salary updated successfully.");
      onSuccess?.(response);
    } catch {
      setErrorMessage("Unable to update salary. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField select label="Employee" value={employeeId} disabled size="small">
        <MenuItem value={employeeId}>{employeeLabel ?? employeeId}</MenuItem>
      </TextField>

      <TextField
        label="Effective From"
        placeholder="YYYY-MM-DD"
        value={effectiveDate}
        onChange={(event) => setEffectiveDate(event.target.value)}
        error={Boolean(errors.effectiveDate)}
        helperText={errors.effectiveDate}
        size="small"
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 120px" },
          gap: 1
        }}
      >
        <TextField
          label="Annual Base Salary"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          error={Boolean(errors.amount)}
          helperText={errors.amount}
          inputProps={{ min: 1, step: 0.01 }}
          required
          size="small"
        />
        <TextField select label="Currency" value={currency} disabled size="small">
          <MenuItem value={currency}>{currency}</MenuItem>
        </TextField>
      </Box>

      <TextField
        label="Variable (Target)"
        type="number"
        value={variableTarget}
        onChange={(event) => setVariableTarget(event.target.value)}
        inputProps={{ min: 0, step: 0.01 }}
        size="small"
      />

      <TextField
        select
        label="Reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={Boolean(errors.reason)}
        helperText={errors.reason}
        required
        size="small"
      >
        {salaryChangeReasons.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        multiline
        minRows={3}
        size="small"
      />

      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save & Update"}
        </Button>
      </Stack>
    </Stack>
  );
}

function validateSalaryUpdate(input: {
  amount: string;
  reason: string;
  effectiveDate: string;
}) {
  const errors: ValidationErrors = {};
  const amount = Number(input.amount);

  if (!input.amount.trim()) {
    errors.amount = "Salary is required.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Salary must be greater than 0.";
  }

  if (!input.reason) {
    errors.reason = "Reason is required.";
  }

  if (!input.effectiveDate) {
    errors.effectiveDate = "Effective date is required.";
  } else if (Number.isNaN(new Date(input.effectiveDate).getTime())) {
    errors.effectiveDate = "Effective date must be valid.";
  }

  return errors;
}
