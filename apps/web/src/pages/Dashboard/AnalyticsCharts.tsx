import type { ReactNode } from "react";
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import { formatCurrency } from "../Employees/SalaryDisplay";
import type { CompensationAnalytics } from "./dashboard.api";

type AnalyticsChartsProps = {
  analytics: CompensationAnalytics;
  totalEmployees: number;
};

const chartPalette = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"];

export function AnalyticsCharts({ analytics, totalEmployees }: AnalyticsChartsProps) {
  const maxDepartmentAverage = Math.max(
    ...analytics.averageByDepartment.map((item) => item.averageSalary),
    1
  );
  const countryPayrollItems = buildCountryPayrollItems(analytics);
  const maxCountryPayroll = Math.max(
    ...countryPayrollItems.map((item) => item.totalPayroll),
    1
  );
  const maxSalaryBandCount = Math.max(
    ...analytics.salaryBands.map((item) => item.count),
    1
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <PayrollByCountryCard
          title="Payroll by Country"
          maxPayroll={maxCountryPayroll}
          totalEmployees={totalEmployees}
          items={countryPayrollItems}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <AverageSalaryByDepartmentCard
          title="Average Salary by Department"
          maxAverage={maxDepartmentAverage}
          items={analytics.averageByDepartment.map((item) => ({
            label: item.department,
            averageSalary: item.averageSalary
          }))}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <SalaryBandsCard
          title="Salary Bands"
          maxCount={maxSalaryBandCount}
          items={analytics.salaryBands}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <RoleLevelDistributionCard
          title="Role and Level Distribution"
          roles={analytics.distributionByRole ?? []}
          levels={analytics.distributionByLevel ?? []}
        />
      </Grid>
    </Grid>
  );
}

function PayrollByCountryCard({
  title,
  maxPayroll,
  totalEmployees,
  items
}: {
  title: string;
  items: Array<{
    label: string;
    count: number;
    totalPayroll: number;
  }>;
  maxPayroll: number;
  totalEmployees: number;
}) {
  const gradient = buildDonutGradient(items.map((item) => item.totalPayroll));

  return (
    <DashboardPanel title={title} action="This Month">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Box
          aria-label="Countries distribution"
          sx={{
            aspectRatio: "1 / 1",
            background: gradient,
            borderRadius: "50%",
            flex: "0 0 auto",
            maxWidth: 180,
            mx: { xs: "auto", sm: 0 },
            position: "relative",
            width: "42%"
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "50%",
              inset: "26%",
              position: "absolute"
            }}
          />
        </Box>
        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
          {items.map((item, index) => (
            <CountryRow
              key={item.label}
              label={item.label}
              count={item.count}
              percentage={totalEmployees ? (item.count / totalEmployees) * 100 : 0}
              payroll={item.totalPayroll}
              progress={(item.totalPayroll / maxPayroll) * 100}
              color={chartPalette[index % chartPalette.length] ?? "#64748b"}
            />
          ))}
        </Stack>
      </Stack>
    </DashboardPanel>
  );
}

function AverageSalaryByDepartmentCard({
  title,
  maxAverage,
  items
}: {
  title: string;
  maxAverage: number;
  items: Array<{
    label: string;
    averageSalary: number;
  }>;
}) {
  return (
    <DashboardPanel title={title} action="This Month">
      <Stack spacing={1.5}>
        {items.map((item, index) => (
          <Box key={item.label}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    bgcolor: chartPalette[index % chartPalette.length],
                    borderRadius: "50%",
                    height: 8,
                    width: 8
                  }}
                />
                <Typography fontWeight={700} noWrap>
                  {item.label}
                </Typography>
              </Stack>
              <Typography color="text.secondary" noWrap>
                {formatCurrency(item.averageSalary, "USD")}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(item.averageSalary / maxAverage) * 100}
              sx={{
                bgcolor: "#eef2f7",
                borderRadius: 1,
                height: 7,
                mt: 0.75,
                "& .MuiLinearProgress-bar": {
                  bgcolor: chartPalette[index % chartPalette.length],
                  borderRadius: 1
                }
              }}
            />
          </Box>
        ))}
      </Stack>
    </DashboardPanel>
  );
}

function SalaryBandsCard({
  title,
  maxCount,
  items
}: {
  title: string;
  maxCount: number;
  items: Array<{
    label: string;
    count: number;
  }>;
}) {
  return (
    <DashboardPanel title={title} action="All Countries">
      <Box
        aria-label="Salary bands chart"
        sx={{
          alignItems: "end",
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(44px, 1fr))`,
          minHeight: 190
        }}
      >
        {items.map((item, index) => (
          <Stack key={item.label} spacing={1} alignItems="center" justifyContent="end">
            <Box
              sx={{
                bgcolor: chartPalette[index % chartPalette.length],
                borderRadius: "6px 6px 2px 2px",
                height: `${Math.max((item.count / maxCount) * 145, 12)}px`,
                width: "100%"
              }}
            />
            <Typography variant="caption" fontWeight={700} textAlign="center">
              {item.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.count}
            </Typography>
          </Stack>
        ))}
      </Box>
    </DashboardPanel>
  );
}

function RoleLevelDistributionCard({
  title,
  roles,
  levels
}: {
  title: string;
  roles: Array<{
    role: string;
    count: number;
  }>;
  levels: Array<{
    level: string;
    count: number;
  }>;
}) {
  return (
    <DashboardPanel title={title} action="Headcount">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <DistributionList
            title="By Role"
            ariaLabel="Role distribution chart"
            items={roles.map((item) => ({ label: item.role, count: item.count }))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DistributionList
            title="By Level"
            ariaLabel="Level distribution chart"
            items={levels.map((item) => ({ label: item.level, count: item.count }))}
          />
        </Grid>
      </Grid>
    </DashboardPanel>
  );
}

function DistributionList({
  title,
  ariaLabel,
  items
}: {
  title: string;
  ariaLabel: string;
  items: Array<{
    label: string;
    count: number;
  }>;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Stack spacing={1.25} aria-label={ariaLabel}>
      <Typography fontWeight={800}>{title}</Typography>
      {items.map((item, index) => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" spacing={1.5}>
            <Typography fontWeight={700}>{item.label}</Typography>
            <Typography color="text.secondary">{item.count}</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={total ? (item.count / total) * 100 : 0}
            sx={{
              bgcolor: "#eef2f7",
              borderRadius: 1,
              height: 7,
              mt: 0.75,
              "& .MuiLinearProgress-bar": {
                bgcolor: chartPalette[index % chartPalette.length],
                borderRadius: 1
              }
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}

function DashboardPanel({
  title,
  action,
  children
}: {
  title: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h2" sx={{ fontSize: "1rem" }}>
            {title}
          </Typography>
          <Button variant="outlined" color="inherit" size="small">
            {action}
          </Button>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

function CountryRow({
  label,
  count,
  percentage,
  payroll,
  progress,
  color
}: {
  label: string;
  count: number;
  percentage: number;
  payroll: number;
  progress: number;
  color: string;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ bgcolor: color, borderRadius: "50%", height: 8, width: 8 }} />
        <Typography fontWeight={700} sx={{ flex: 1 }}>
          {label}
        </Typography>
        <Typography fontWeight={700}>{percentage.toFixed(0)}%</Typography>
        <Typography color="text.secondary" sx={{ minWidth: 96, textAlign: "right" }}>
          {formatCurrency(payroll, "USD")}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {count} employees
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          bgcolor: "#eef2f7",
          borderRadius: 1,
          height: 6,
          mt: 0.75,
          "& .MuiLinearProgress-bar": {
            bgcolor: color,
            borderRadius: 1
          }
        }}
      />
    </Box>
  );
}

function buildCountryPayrollItems(analytics: CompensationAnalytics) {
  if (analytics.payrollByCountry?.length) {
    return analytics.payrollByCountry.map((item) => {
      const countryCount = analytics.countByCountry.find(
        (country) => country.country === item.country
      );

      return {
        label: item.country,
        count: countryCount?.count ?? 0,
        totalPayroll: item.totalPayroll
      };
    });
  }

  const totalEmployees = analytics.countByCountry.reduce(
    (total, item) => total + item.count,
    0
  );

  return analytics.countByCountry.map((item) => ({
    label: item.country,
    count: item.count,
    totalPayroll: totalEmployees
      ? analytics.totalPayroll * (item.count / totalEmployees)
      : 0
  }));
}

function buildDonutGradient(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (!total) {
    return "#eef2f7";
  }

  let cursor = 0;
  const stops = values.map((value, index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    const color = chartPalette[index % chartPalette.length] ?? "#64748b";

    return `${color} ${start}% ${end}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
