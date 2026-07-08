import CloseIcon from "@mui/icons-material/Close";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";

import type { EmployeeSalaryHistoryResponse } from "../../api/employees.api";
import { useEmployeeSalaryHistory } from "../../hooks/useEmployeeSalaryHistory";
import { useLocalCurrency } from "../../hooks/useLocalCurrency";
import { formatCountry } from "./employeeOptions";
import { SalaryUpdateForm } from "./SalaryUpdateForm";

type EmployeeProfileTab = "overview" | "salary-details" | "salary-history";

type SalaryHistoryEntry = {
  id: string;
  previousAmount: number;
  newAmount: number;
  currency: string;
  effectiveDate: string;
  reason: string;
  changedBy: {
    name: string;
    email: string;
  };
};

export type EmployeeProfileData = {
  id?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  title: string | null;
  country: string | null;
  department: string | null;
  role: string | null;
  level: string | null;
  phone?: string | null;
  employmentType?: string | null;
  reportsTo?: string | null;
  hiredAt?: string | null;
  status?: string | null;
  avatarUrl?: string | null;
  salary: {
    amount: number;
    currency: string;
    effectiveFrom: string;
  } | null;
  compensationSummary?: {
    totalCash: number;
    totalFixed: number;
    variableTarget: number;
    benefitsAnnual: number;
    currency: string;
  } | null;
  salaryHistory: SalaryHistoryEntry[];
};

export function EmployeeProfile({ employee }: { employee: EmployeeProfileData }) {
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EmployeeProfileTab>("overview");
  const [salaryHistory, setSalaryHistory] = useState(employee.salaryHistory);
  const [hasLoadedSalaryHistory, setHasLoadedSalaryHistory] = useState(false);
  const salaryHistoryLoader = useEmployeeSalaryHistory();
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const employeeId = employee.id ?? employee.employeeCode;
  const salaryCurrency =
    employee.salary?.currency ?? employee.compensationSummary?.currency ?? "USD";
  const compensationSummary =
    employee.compensationSummary ?? defaultCompensationSummary(employee);

  async function loadSalaryHistory() {
    if (!employee.id || salaryHistoryLoader.isLoading || hasLoadedSalaryHistory) {
      return;
    }

    const result = await salaryHistoryLoader.loadEmployeeSalaryHistory(employee.id);

    if (result) {
      setSalaryHistory(mapSalaryHistory(result));
      setHasLoadedSalaryHistory(true);
    }
  }

  function handleTabChange(_: unknown, value: EmployeeProfileTab) {
    setActiveTab(value);

    if (value === "salary-history") {
      void loadSalaryHistory();
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden"
      }}
    >
      <Stack spacing={0}>
        <Stack spacing={2.5} sx={{ px: { xs: 2, md: 3 }, pt: 2.5 }}>
          <Typography variant="caption" color="text.secondary">
            Employees &gt; {employee.employeeCode}
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={employee.avatarUrl ?? undefined}
                alt={employeeName}
                sx={{ width: 72, height: 72, fontSize: 28 }}
              >
                {employee.firstName.at(0)}
                {employee.lastName.at(0)}
              </Avatar>

              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h1" sx={{ fontSize: "1.6rem" }}>
                    {employeeName}
                  </Typography>
                  <Chip
                    size="small"
                    label={employee.status ?? "Active"}
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Typography fontWeight={700}>
                  {employee.title ?? employee.role ?? "-"}
                  {employee.department ? (
                    <Typography component="span" color="text.secondary">
                      {" "}
                      &bull; {employee.department}
                    </Typography>
                  ) : null}
                </Typography>
                <Typography color="text.secondary">
                  {formatCountry(employee.country)}
                  {employee.hiredAt ? ` - Joined on ${formatDate(employee.hiredAt)}` : ""}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              <Button variant="contained" onClick={() => setIsSalaryDialogOpen(true)}>
                Update Salary
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
          <Tabs
            value={activeTab}
            aria-label="Employee detail sections"
            onChange={handleTabChange}
          >
            <Tab value="overview" label="Overview" />
            <Tab value="salary-details" label="Salary Details" />
            <Tab value="salary-history" label="Salary History" />
          </Tabs>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr" },
            gap: 2,
            p: { xs: 2, md: 3 }
          }}
        >
          {activeTab === "overview" ? <OverviewPanel employee={employee} /> : null}
          {activeTab === "salary-details" ? (
            <SalaryDetailsPanel
              employee={employee}
              compensationSummary={compensationSummary}
              salaryCurrency={salaryCurrency}
            />
          ) : null}
          {activeTab === "salary-history" ? (
            <SalaryHistoryPanel
              salaryHistory={salaryHistory}
              salaryCurrency={salaryCurrency}
              isLoading={salaryHistoryLoader.isLoading}
              errorMessage={salaryHistoryLoader.errorMessage}
              onRetry={loadSalaryHistory}
            />
          ) : null}
        </Box>

        <Divider />
      </Stack>

      <Dialog
        open={isSalaryDialogOpen}
        onClose={() => setIsSalaryDialogOpen(false)}
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
          Update Salary
          <IconButton
            aria-label="Close salary update"
            onClick={() => setIsSalaryDialogOpen(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2.5 }}>
          <SalaryUpdateForm
            employeeId={employeeId}
            employeeLabel={`${employeeName} (${employee.employeeCode})`}
            currency={salaryCurrency}
            onCancel={() => setIsSalaryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

function OverviewPanel({ employee }: { employee: EmployeeProfileData }) {
  return (
    <SectionPanel title="Employee Overview">
      <Stack spacing={1.5}>
        <DetailRow label="Employee ID" value={employee.employeeCode} />
        <DetailRow label="Email" value={employee.email ?? "-"} />
        <DetailRow label="Phone" value={employee.phone ?? "-"} />
        <DetailRow
          label="Current Salary"
          value={
            employee.salary
              ? formatCurrency(employee.salary.amount, employee.salary.currency)
              : "-"
          }
        />
        <DetailRow label="Title" value={employee.title ?? employee.role ?? "-"} />
        <DetailRow label="Department" value={employee.department ?? "-"} />
        <DetailRow label="Level" value={employee.level ?? "-"} />
        <DetailRow label="Status" value={employee.status ?? "-"} />
        <DetailRow label="Location" value={formatCountry(employee.country)} />
      </Stack>
    </SectionPanel>
  );
}

function SalaryDetailsPanel({
  employee,
  compensationSummary
}: {
  employee: EmployeeProfileData;
  compensationSummary: NonNullable<EmployeeProfileData["compensationSummary"]>;
  salaryCurrency: string;
}) {
  const localCurrency = getCurrencyForCountry(employee.country);
  const localSalary = useLocalCurrency(
    employee.salary?.amount ?? compensationSummary.totalCash,
    localCurrency
  );

  return (
    <SectionPanel title="Salary Details">
      <Stack spacing={1.5}>
        <DetailRow
          label="Current Salary"
          value={
            employee.salary
              ? formatCurrency(employee.salary.amount, employee.salary.currency)
              : "-"
          }
        />
        <DetailRow
          label="Effective From"
          value={
            employee.salary?.effectiveFrom
              ? formatDate(employee.salary.effectiveFrom)
              : "-"
          }
        />
        <DetailRow
          label="Total Cash"
          value={formatCurrency(
            compensationSummary.totalCash,
            compensationSummary.currency
          )}
        />
        <DetailRow
          label="Total Fixed"
          value={formatCurrency(
            compensationSummary.totalFixed,
            compensationSummary.currency
          )}
        />
        <DetailRow
          label="Local Currency"
          value={formatLocalCurrencyValue(localSalary, localCurrency)}
        />
      </Stack>
    </SectionPanel>
  );
}

function SalaryHistoryPanel({
  salaryHistory,
  salaryCurrency,
  isLoading,
  errorMessage,
  onRetry
}: {
  salaryHistory: SalaryHistoryEntry[];
  salaryCurrency: string;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}) {
  return (
    <SectionPanel title="Salary History">
      {isLoading ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading salary history...</Typography>
        </Stack>
      ) : null}

      {!isLoading && errorMessage ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      ) : null}

      {!isLoading && !errorMessage && salaryHistory.length > 0 ? (
        <Stack spacing={1.5}>
          {salaryHistory.map((entry) => (
            <Stack
              key={entry.id}
              spacing={0.75}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
              >
                <Typography fontWeight={800}>
                  {formatCurrency(entry.newAmount, entry.currency || salaryCurrency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(entry.effectiveDate)}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(entry.previousAmount, entry.currency || salaryCurrency)}{" "}
                to {formatCurrency(entry.newAmount, entry.currency || salaryCurrency)} -{" "}
                {formatReason(entry.reason)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Changed by {entry.changedBy.name} ({entry.changedBy.email})
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        !isLoading &&
        !errorMessage && (
          <Typography color="text.secondary">No salary history available.</Typography>
        )
      )}
    </SectionPanel>
  );
}

function SectionPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <Stack spacing={2}>
        <Typography fontWeight={800}>{title}</Typography>
        {children}
      </Stack>
    </Paper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="baseline"
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={700} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function defaultCompensationSummary(employee: EmployeeProfileData) {
  const amount = employee.salary?.amount ?? 0;
  const currency = employee.salary?.currency ?? "USD";

  return {
    totalCash: amount,
    totalFixed: amount,
    variableTarget: 0,
    benefitsAnnual: 0,
    currency
  };
}

function mapSalaryHistory(response: EmployeeSalaryHistoryResponse): SalaryHistoryEntry[] {
  return response.salaryHistory.map((entry) => ({
    id: entry.id,
    previousAmount: entry.previousAmount,
    newAmount: entry.newAmount,
    currency: entry.currency,
    effectiveDate: entry.effectiveDate,
    reason: entry.reason,
    changedBy: {
      name: entry.changedBy?.email ?? "-",
      email: entry.changedBy?.email ?? "-"
    }
  }));
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatLocalCurrencyValue(
  localSalary: ReturnType<typeof useLocalCurrency>,
  currency: string
) {
  if (localSalary.isLoading) {
    return "Loading...";
  }

  if (localSalary.errorMessage || localSalary.amountLocal === null) {
    return "-";
  }

  return formatCurrency(localSalary.amountLocal, currency);
}

function getCurrencyForCountry(country: string | null) {
  const countryCurrencies: Record<string, string> = {
    AU: "AUD",
    CA: "CAD",
    DE: "EUR",
    GB: "GBP",
    IN: "INR",
    SG: "SGD",
    US: "USD"
  };

  return country ? (countryCurrencies[country] ?? "USD") : "USD";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function formatReason(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
