import type { ReactNode } from "react";
import { Box, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";

import { formatCurrency } from "../Employees/SalaryDisplay";
import type { CompensationAnalytics } from "../../api/dashboard.api";

type AnalyticsChartsProps = {
  analytics: CompensationAnalytics;
  totalEmployees: number;
};

const chartPalette = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"];
const panelMinHeight = 344;

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
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, minmax(0, 1fr))"
        }
      }}
    >
      <Box>
        <PayrollByCountryCard
          title="Payroll by Country"
          description="Payroll concentration and headcount across active employee locations."
          maxPayroll={maxCountryPayroll}
          totalEmployees={totalEmployees}
          items={countryPayrollItems}
        />
      </Box>
      <Box>
        <AverageSalaryByDepartmentCard
          title="Average Salary by Department"
          description="Department-level average salary compared against the highest department average."
          maxAverage={maxDepartmentAverage}
          items={analytics.averageByDepartment.map((item) => ({
            label: item.department,
            averageSalary: item.averageSalary
          }))}
        />
      </Box>
      <Box>
        <SalaryBandsCard
          title="Salary Bands"
          description="Employee distribution across salary ranges for compensation planning."
          maxCount={maxSalaryBandCount}
          items={analytics.salaryBands}
        />
      </Box>
      <Box>
        <RoleLevelDistributionCard
          title="Role and Level Distribution"
          description="Headcount mix by role and seniority level."
          roles={analytics.distributionByRole ?? []}
          levels={analytics.distributionByLevel ?? []}
        />
      </Box>
    </Box>
  );
}

function PayrollByCountryCard({
  title,
  description,
  maxPayroll,
  totalEmployees,
  items
}: {
  title: string;
  description: string;
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
    <DashboardPanel title={title} description={description} meta="Current payroll">
      {items.length === 0 ? (
        <EmptyChartState message="No country payroll data yet." />
      ) : null}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ display: items.length ? "flex" : "none" }}
      >
        <Box
          aria-label="Countries distribution"
          sx={{
            aspectRatio: "1 / 1",
            background: gradient,
            borderRadius: "50%",
            flex: "0 0 auto",
            maxWidth: 188,
            mx: { xs: "auto", sm: 0 },
            position: "relative",
            width: { xs: 184, sm: "38%" },
            boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.06)"
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "50%",
              boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.08)",
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
  description,
  maxAverage,
  items
}: {
  title: string;
  description: string;
  maxAverage: number;
  items: Array<{
    label: string;
    averageSalary: number;
  }>;
}) {
  return (
    <DashboardPanel title={title} description={description} meta="USD average">
      {items.length === 0 ? (
        <EmptyChartState message="No department salary averages yet." />
      ) : null}
      <Stack spacing={1.75} sx={{ display: items.length ? "flex" : "none" }}>
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
              <Typography color="text.secondary" fontWeight={700} noWrap>
                {formatCurrency(item.averageSalary, "USD")}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(item.averageSalary / maxAverage) * 100}
              sx={{
                bgcolor: "#eef2f7",
                borderRadius: 999,
                height: 8,
                mt: 0.9,
                "& .MuiLinearProgress-bar": {
                  bgcolor: chartPalette[index % chartPalette.length],
                  borderRadius: 999
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
  description,
  maxCount,
  items
}: {
  title: string;
  description: string;
  maxCount: number;
  items: Array<{
    label: string;
    count: number;
  }>;
}) {
  return (
    <DashboardPanel title={title} description={description} meta="Employee count">
      {items.length === 0 ? <EmptyChartState message="No salary band data yet." /> : null}
      <Box
        aria-label="Salary bands chart"
        sx={{
          alignItems: "end",
          display: items.length ? "grid" : "none",
          gap: { xs: 1, sm: 1.5 },
          gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(56px, 1fr))`,
          minHeight: 224,
          pt: 1
        }}
      >
        {items.map((item, index) => (
          <Stack
            key={item.label}
            spacing={1}
            alignItems="center"
            justifyContent="end"
            sx={{ minWidth: 0 }}
          >
            <Typography fontWeight={800}>{item.count}</Typography>
            <Box
              sx={{
                bgcolor: chartPalette[index % chartPalette.length],
                borderRadius: "8px 8px 3px 3px",
                height: `${Math.max((item.count / maxCount) * 156, 14)}px`,
                minHeight: 14,
                width: "100%",
                boxShadow: "inset 0 -1px 0 rgba(15, 23, 42, 0.12)"
              }}
            />
            <Typography variant="caption" fontWeight={700} textAlign="center">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Box>
    </DashboardPanel>
  );
}

function RoleLevelDistributionCard({
  title,
  description,
  roles,
  levels
}: {
  title: string;
  description: string;
  roles: Array<{
    role: string;
    count: number;
  }>;
  levels: Array<{
    level: string;
    count: number;
  }>;
}) {
  const hasItems = roles.length > 0 || levels.length > 0;

  return (
    <DashboardPanel title={title} description={description} meta="Headcount">
      {!hasItems ? (
        <EmptyChartState message="No role or level distribution data yet." />
      ) : null}
      <Grid container spacing={2.25} sx={{ display: hasItems ? "flex" : "none" }}>
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
      <Typography fontWeight={800} color="text.primary">
        {title}
      </Typography>
      {items.length === 0 ? (
        <EmptyChartState message="No data available." compact />
      ) : null}
      {items.map((item, index) => (
        <Box key={item.label}>
          <Stack direction="row" justifyContent="space-between" spacing={1.5}>
            <Typography fontWeight={700} noWrap>
              {item.label}
            </Typography>
            <Typography color="text.secondary" fontWeight={700}>
              {item.count}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={total ? (item.count / total) * 100 : 0}
            sx={{
              bgcolor: "#eef2f7",
              borderRadius: 999,
              height: 8,
              mt: 0.75,
              "& .MuiLinearProgress-bar": {
                bgcolor: chartPalette[index % chartPalette.length],
                borderRadius: 999
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
  description,
  meta,
  children
}: {
  title: string;
  description: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "rgba(148, 163, 184, 0.28)",
        borderRadius: 2,
        boxShadow: "0 14px 38px rgba(15, 23, 42, 0.05)",
        height: "100%",
        minHeight: panelMinHeight,
        p: { xs: 2, sm: 2.5 }
      }}
    >
      <Stack spacing={2.5} sx={{ height: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="h2" sx={{ fontSize: "1rem" }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            sx={{
              bgcolor: "#f8fafc",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 999,
              color: "text.secondary",
              flex: "0 0 auto",
              fontWeight: 700,
              px: 1.25,
              py: 0.4
            }}
          >
            {meta}
          </Typography>
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
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: color, borderRadius: "50%", height: 9, width: 9 }} />
        <Typography fontWeight={700} noWrap sx={{ flex: 1 }}>
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
          borderRadius: 999,
          height: 8,
          mt: 0.75,
          "& .MuiLinearProgress-bar": {
            bgcolor: color,
            borderRadius: 999
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

function EmptyChartState({
  message,
  compact = false
}: {
  message: string;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        alignItems: "center",
        bgcolor: "#f8fafc",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        justifyContent: "center",
        minHeight: compact ? 88 : 196,
        px: 2,
        textAlign: "center"
      }}
    >
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
