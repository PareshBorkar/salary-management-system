import type { ReactNode } from "react";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";

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
  helper: string;
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
    <Grid container spacing={1.5}>
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          label="Total Employees"
          value={numberFormatter.format(totalEmployees)}
          helper="+2.5% vs last month"
          icon={<GroupsOutlinedIcon fontSize="small" />}
          accent="#2563eb"
          iconBackground="#e8f0ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          label="Total Payroll"
          value={formatCurrency(totalPayroll, "USD")}
          helper="+4.3% vs last month"
          icon={<PaidOutlinedIcon fontSize="small" />}
          accent="#059669"
          iconBackground="#dff7eb"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          label="Average Salary"
          value={formatCurrency(averageSalary, "USD")}
          helper="+3.1% vs last month"
          icon={<ShowChartOutlinedIcon fontSize="small" />}
          accent="#7c3aed"
          iconBackground="#efe7ff"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          label="Median Salary"
          value={formatCurrency(medianSalary, "USD")}
          helper="+1.9% vs last month"
          icon={<StackedBarChartOutlinedIcon fontSize="small" />}
          accent="#dc2626"
          iconBackground="#fee2e2"
        />
      </Grid>
    </Grid>
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
        </Box>
      </Stack>
      <Typography variant="caption" sx={{ color: "#059669", mt: 1.25, display: "block" }}>
        {helper}
      </Typography>
      <MoreVertIcon
        aria-hidden="true"
        sx={{
          color: "text.secondary",
          fontSize: 18,
          position: "absolute",
          right: 12,
          top: 12
        }}
      />
    </Paper>
  );
}
