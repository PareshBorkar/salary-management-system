import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { type FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import type { CreateEmployeeRequest } from "../../api/employees.api";
import { clearEmployeeSalaryHistoryCache } from "../../hooks/useEmployeeSalaryHistory";
import { clearLocalCurrencyCache } from "../../hooks/useLocalCurrency";
import { useCreateEmployee } from "../../hooks/useCreateEmployee";
import { useEmployeesTable } from "../../hooks/useEmployeesTable";
import { countries, departments, levels, roles } from "./employeeOptions";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeePagination } from "./EmployeePagination";
import { EmployeeTable } from "./EmployeeTable";

export function EmployeesPage() {
  const table = useEmployeesTable();
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);

  useEffect(() => {
    clearEmployeeSalaryHistoryCache();
    clearLocalCurrencyCache();
  }, []);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h1">Employees</Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddEmployeeDialogOpen(true)}
          >
            Add Employee
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden"
        }}
      >
        <EmployeeFilters
          searchInput={table.searchInput}
          country={table.country}
          department={table.department}
          role={table.role}
          level={table.level}
          onSearchChange={table.setSearchInput}
          onCountryChange={table.setCountry}
          onDepartmentChange={table.setDepartment}
          onRoleChange={table.setRole}
          onLevelChange={table.setLevel}
        />

        {table.errorMessage ? (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error">{table.errorMessage}</Alert>
          </Box>
        ) : null}

        <EmployeeTable
          employees={table.employees}
          isLoading={table.isLoading}
          sortBy={table.sortBy}
          sortDirection={table.sortDirection}
          onSort={table.handleSort}
        />

        <EmployeePagination
          total={table.total}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Paper>

      <AddEmployeeDialog
        open={isAddEmployeeDialogOpen}
        onClose={() => setIsAddEmployeeDialogOpen(false)}
        onCreated={table.refreshEmployees}
      />
    </Stack>
  );
}

type AddEmployeeForm = {
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  country: string;
  role: string;
  level: string;
};

const emptyAddEmployeeForm: AddEmployeeForm = {
  email: "",
  firstName: "",
  lastName: "",
  title: "",
  department: "",
  country: "",
  role: "",
  level: ""
};

function AddEmployeeDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<AddEmployeeForm>(emptyAddEmployeeForm);
  const { mutate, reset, isSubmitting, errorMessage } = useCreateEmployee();
  const isAddDisabled = isSubmitting || !form.firstName.trim() || !form.lastName.trim();

  useEffect(() => {
    if (open) {
      setForm(emptyAddEmployeeForm);
      reset();
    }
  }, [open, reset]);

  function updateField(field: keyof AddEmployeeForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateEmployeeRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim()
    };
    const optionalFields: Array<
      keyof Omit<CreateEmployeeRequest, "firstName" | "lastName">
    > = ["email", "title", "department", "country", "role", "level"];

    optionalFields.forEach((field) => {
      const value = form[field].trim();

      if (value) {
        payload[field] = value;
      }
    });

    const employee = await mutate(payload);

    if (employee) {
      onCreated();
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "1rem",
          fontWeight: 800
        }}
      >
        Add Employee
        <IconButton aria-label="Close add employee" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2.5 }}>
        <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5
            }}
          >
            <TextField
              label="Email"
              type="email"
              size="small"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <TextField
              label="First Name"
              size="small"
              required
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
            />
            <TextField
              label="Last Name"
              size="small"
              required
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
            />
          </Box>

          <TextField
            label="Title"
            size="small"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5
            }}
          >
            <TextField
              select
              label="Department"
              value={form.department}
              size="small"
              onChange={(event) => updateField("department", event.target.value)}
            >
              {departments.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Country"
              value={form.country}
              size="small"
              onChange={(event) => updateField("country", event.target.value)}
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Role"
              value={form.role}
              size="small"
              onChange={(event) => updateField("role", event.target.value)}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Level"
              value={form.level}
              size="small"
              onChange={(event) => updateField("level", event.target.value)}
            >
              {levels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button type="button" variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isAddDisabled}>
              Add Employee
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
