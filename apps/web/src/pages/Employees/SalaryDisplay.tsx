import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Divider, IconButton, Stack, Typography } from "@mui/material";

type DetailRowProps = {
  label: string;
  value: string;
};

export type SalarySummary = {
  totalCash: number;
  totalFixed: number;
  variableTarget: number;
  benefitsAnnual: number;
  currency: string;
};

export type CurrentSalary = {
  amount: number;
  currency: string;
  effectiveFrom: string;
};

export type SalaryHistoryItem = {
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

export function DetailRow({ label, value }: DetailRowProps) {
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

export function CurrentSalaryDisplay({
  salary,
  currency,
  lastUpdatedBy
}: {
  salary: CurrentSalary | null;
  currency: string;
  lastUpdatedBy: string;
}) {
  if (!salary) {
    return <Typography color="text.secondary">No current salary recorded.</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          Annual Base Salary
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: "2rem", fontWeight: 800 }}>
            {formatCurrency(salary.amount, currency)}
          </Typography>
          <IconButton aria-label="View salary details" size="small">
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <DetailRow label="Monthly" value={formatCurrency(salary.amount / 12, currency)} />
      <DetailRow label="Currency" value={currency} />
      <DetailRow label="Effective From" value={formatDate(salary.effectiveFrom)} />
      <DetailRow label="Last Updated By" value={lastUpdatedBy} />
    </Stack>
  );
}

export function CompensationSummaryDisplay({ summary }: { summary: SalarySummary }) {
  return (
    <Stack spacing={1.5}>
      <DetailRow
        label="Total Cash"
        value={formatCurrency(summary.totalCash, summary.currency)}
      />
      <DetailRow
        label="Total Fixed"
        value={formatCurrency(summary.totalFixed, summary.currency)}
      />
      <DetailRow
        label="Variable (Target)"
        value={formatCurrency(summary.variableTarget, summary.currency)}
      />
      <DetailRow
        label="Benefits (Annual)"
        value={formatCurrency(summary.benefitsAnnual, summary.currency)}
      />
    </Stack>
  );
}

export function SalaryHistoryDisplay({ entries }: { entries: SalaryHistoryItem[] }) {
  if (!entries.length) {
    return <Typography color="text.secondary">No salary history recorded.</Typography>;
  }

  return (
    <Stack divider={<Divider flexItem />} spacing={1.5}>
      {entries.map((entry) => (
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
  );
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}
