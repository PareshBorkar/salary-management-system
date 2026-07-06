import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { ReactNode } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";

import { formatCountry } from "./employeeOptions";

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
  const employeeName = `${employee.firstName} ${employee.lastName}`;
  const salaryCurrency =
    employee.salary?.currency ?? employee.compensationSummary?.currency ?? "USD";
  const compensationSummary =
    employee.compensationSummary ?? defaultCompensationSummary(employee);

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
              <Button variant="contained">Update Salary</Button>
              <IconButton aria-label="More employee actions">
                <MoreHorizIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
          <Tabs value="overview" aria-label="Employee detail sections">
            <Tab value="overview" label="Overview" />
            <Tab value="salary-details" label="Salary Details" />
            <Tab value="salary-history" label="Salary History" />
            <Tab value="documents" label="Documents" />
            <Tab value="performance" label="Performance" />
          </Tabs>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr 1fr" },
            gap: 2,
            p: { xs: 2, md: 3 }
          }}
        >
          <Stack spacing={1.5}>
            <DetailRow label="Employee ID" value={employee.employeeCode} />
            <DetailRow label="Email" value={employee.email ?? "-"} />
            <DetailRow label="Phone" value={employee.phone ?? "-"} />
            <DetailRow label="Employment Type" value={employee.employmentType ?? "-"} />
            <DetailRow label="Reports To" value={employee.reportsTo ?? "-"} />
            <DetailRow label="Location" value={formatCountry(employee.country)} />
          </Stack>

          <SectionPanel title="Current Compensation">
            {employee.salary ? (
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Annual Base Salary
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800 }}>
                      {formatCurrency(employee.salary.amount, salaryCurrency)}
                    </Typography>
                    <IconButton aria-label="View salary details" size="small">
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <DetailRow
                  label="Monthly"
                  value={formatCurrency(employee.salary.amount / 12, salaryCurrency)}
                />
                <DetailRow label="Currency" value={salaryCurrency} />
                <DetailRow
                  label="Effective From"
                  value={formatDate(employee.salary.effectiveFrom)}
                />
                <DetailRow label="Last Updated By" value={latestChangedBy(employee)} />
              </Stack>
            ) : (
              <Typography color="text.secondary">No current salary recorded.</Typography>
            )}
          </SectionPanel>

          <SectionPanel title="Compensation Summary">
            <Stack spacing={1.5}>
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
                label="Variable (Target)"
                value={formatCurrency(
                  compensationSummary.variableTarget,
                  compensationSummary.currency
                )}
              />
              <DetailRow
                label="Benefits (Annual)"
                value={formatCurrency(
                  compensationSummary.benefitsAnnual,
                  compensationSummary.currency
                )}
              />
            </Stack>
          </SectionPanel>
        </Box>

        <Divider />

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <SectionPanel title="Salary History">
            {employee.salaryHistory.length ? (
              <Stack divider={<Divider flexItem />} spacing={1.5}>
                {employee.salaryHistory.map((entry) => (
                  <Stack key={entry.id} spacing={0.75}>
                    <Typography fontWeight={700}>
                      {formatCurrency(entry.previousAmount, entry.currency)} to{" "}
                      {formatCurrency(entry.newAmount, entry.currency)}
                    </Typography>
                    <Typography color="text.secondary">
                      {entry.reason} effective {formatDate(entry.effectiveDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Changed by {entry.changedBy.name} ({entry.changedBy.email})
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No salary history recorded.</Typography>
            )}
          </SectionPanel>
        </Box>
      </Stack>
    </Paper>
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

function latestChangedBy(employee: EmployeeProfileData) {
  return employee.salaryHistory[0]?.changedBy.name ?? "-";
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}
