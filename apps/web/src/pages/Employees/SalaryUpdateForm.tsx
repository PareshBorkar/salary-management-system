import { type FormEvent, useState } from "react";
import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";

import { useUpdateEmployeeSalary } from "../../hooks/useUpdateEmployeeSalary";
import type {
  SalaryChangeReason,
  UpdateEmployeeSalaryResponse
} from "../../api/employees.api";
import {
  salaryChangeReasons,
  validateSalaryUpdate,
  type SalaryUpdateValidationErrors
} from "./salaryUpdate.schema";

type SalaryUpdateFormProps = {
  employeeId: string;
  employeeLabel?: string;
  currency?: string;
  onSuccess?: (response: UpdateEmployeeSalaryResponse) => void;
  onCancel?: () => void;
};

export function SalaryUpdateForm({
  employeeId,
  employeeLabel,
  currency = "USD",
  onSuccess,
  onCancel
}: SalaryUpdateFormProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [errors, setErrors] = useState<SalaryUpdateValidationErrors>({});
  const { mutate, isSubmitting, successMessage, errorMessage } =
    useUpdateEmployeeSalary();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateSalaryUpdate({
      amount,
      reason,
      effectiveDate
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    const response = await mutate(employeeId, {
      amount: Number(amount),
      reason: reason as SalaryChangeReason,
      effectiveDate
    });

    if (response) {
      onSuccess?.(response);
    }
  }

  return (
    <Stack component="form" sx={{ pt: 2 }} spacing={2} onSubmit={handleSubmit} noValidate>
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
