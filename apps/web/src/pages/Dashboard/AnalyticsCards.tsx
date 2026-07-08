import type { ReactNode } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

import { formatCurrency } from "../Employees/SalaryDisplay";

type AnalyticsCardsProps = {
  totalEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  accent: string;
  iconBackground: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function AnalyticsCards({
  totalEmployees,
  totalPayroll,
  averageSalary,
  medianSalary
}: AnalyticsCardsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))"
        }
      }}
    >
      <Box>
        <MetricCard
          label="Total Employees"
          value={numberFormatter.format(totalEmployees)}
          icon={<GroupsOutlinedIcon fontSize="small" />}
          accent="#2563eb"
          iconBackground="#e8f0ff"
        />
      </Box>
      <Box>
        <MetricCard
          label="Total Payroll"
          value={formatCurrency(totalPayroll, "USD")}
          icon={<PaidOutlinedIcon fontSize="small" />}
          accent="#059669"
          iconBackground="#dff7eb"
        />
      </Box>
      <Box>
        <MetricCard
          label="Average Salary"
          value={formatCurrency(averageSalary, "USD")}
          icon={<ShowChartOutlinedIcon fontSize="small" />}
          accent="#7c3aed"
          iconBackground="#efe7ff"
        />
      </Box>
      <Box>
        <MetricCard
          label="Median Salary"
          value={formatCurrency(medianSalary, "USD")}
          icon={<StackedBarChartOutlinedIcon fontSize="small" />}
          accent="#dc2626"
          iconBackground="#fee2e2"
        />
      </Box>
    </Box>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
  accent,
  iconBackground
}: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        minHeight: 118,
        p: 2,
        position: "relative"
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            alignItems: "center",
            bgcolor: iconBackground,
            borderRadius: 2,
            color: accent,
            display: "flex",
            height: 44,
            justifyContent: "center",
            width: 44
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.65rem", fontWeight: 800, lineHeight: 1.15 }}>
            {value}
          </Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}
