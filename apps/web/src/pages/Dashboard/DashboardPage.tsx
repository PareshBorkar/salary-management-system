import { useEffect, useMemo, useState, type ReactNode } from "react";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import StackedBarChartOutlinedIcon from "@mui/icons-material/StackedBarChartOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import { formatCurrency } from "../Employees/SalaryDisplay";
import { getCompensationAnalytics, type CompensationAnalytics } from "./dashboard.api";

type DashboardState = {
  analytics: CompensationAnalytics | null;
  isLoading: boolean;
  errorMessage: string | null;
};

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  accent: string;
  iconBackground: string;
};

const chartPalette = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#64748b"];

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    analytics: null,
    isLoading: true,
    errorMessage: null
  });

  useEffect(() => {
    const abortController = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: true,
      errorMessage: null
    }));

    getCompensationAnalytics(abortController.signal)
      .then((analytics) => {
        setState({
          analytics,
          isLoading: false,
          errorMessage: null
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          analytics: null,
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? "Unable to load dashboard analytics. Please try again."
              : "Unable to load dashboard analytics. Please try again."
        });
      });

    return () => abortController.abort();
  }, []);

  if (state.isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h1">Dashboard</Typography>
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={20} aria-label="Loading dashboard analytics" />
            <Typography>Loading dashboard analytics...</Typography>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  if (state.errorMessage) {
    return (
      <Stack spacing={2}>
        <Typography variant="h1">Dashboard</Typography>
        <Alert severity="error">{state.errorMessage}</Alert>
      </Stack>
    );
  }

  if (!state.analytics || isEmptyAnalytics(state.analytics)) {
    return (
      <Stack spacing={2}>
        <Typography variant="h1">Dashboard</Typography>
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 3 }}>
          <Typography variant="h2">No dashboard analytics yet</Typography>
          <Typography color="text.secondary">
            Add employee salary records to see compensation analytics.
          </Typography>
        </Paper>
      </Stack>
    );
  }

  return <DashboardAnalytics analytics={state.analytics} />;
}

function DashboardAnalytics({ analytics }: { analytics: CompensationAnalytics }) {
  const totalEmployees = useMemo(
    () => analytics.countByCountry.reduce((total, item) => total + item.count, 0),
    [analytics.countByCountry]
  );
  const maxDepartmentAverage = Math.max(
    ...analytics.averageByDepartment.map((item) => item.averageSalary),
    1
  );

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <Typography variant="h1">Welcome back, HR Manager</Typography>
          <Typography color="text.secondary">
            Here's what's happening with compensation at ACME.
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CalendarTodayOutlinedIcon fontSize="small" />}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          May 1 - May 31, 2024
        </Button>
      </Stack>

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
            value={formatCurrency(analytics.totalPayroll, "USD")}
            helper="+4.3% vs last month"
            icon={<PaidOutlinedIcon fontSize="small" />}
            accent="#059669"
            iconBackground="#dff7eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Average Salary"
            value={formatCurrency(analytics.averageSalary, "USD")}
            helper="+3.1% vs last month"
            icon={<ShowChartOutlinedIcon fontSize="small" />}
            accent="#7c3aed"
            iconBackground="#efe7ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            label="Median Salary"
            value={formatCurrency(analytics.medianSalary, "USD")}
            helper="+1.9% vs last month"
            icon={<StackedBarChartOutlinedIcon fontSize="small" />}
            accent="#dc2626"
            iconBackground="#fee2e2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CountriesCard
            title="Countries"
            totalEmployees={totalEmployees}
            items={analytics.countByCountry.map((item) => ({
              label: item.country,
              count: item.count
            }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DepartmentsCard
            title="Departments"
            maxAverage={maxDepartmentAverage}
            items={analytics.averageByDepartment.map((item) => ({
              label: item.department,
              averageSalary: item.averageSalary
            }))}
          />
        </Grid>
      </Grid>
    </Stack>
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

function CountriesCard({
  title,
  totalEmployees,
  items
}: {
  title: string;
  items: Array<{
    label: string;
    count: number;
  }>;
  totalEmployees: number;
}) {
  const gradient = buildDonutGradient(items.map((item) => item.count));

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
              color={chartPalette[index % chartPalette.length] ?? "#64748b"}
            />
          ))}
        </Stack>
      </Stack>
    </DashboardPanel>
  );
}

function DepartmentsCard({
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
  color
}: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ bgcolor: color, borderRadius: "50%", height: 8, width: 8 }} />
      <Typography fontWeight={700} sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography fontWeight={700}>{percentage.toFixed(0)}%</Typography>
      <Typography color="text.secondary" sx={{ minWidth: 86, textAlign: "right" }}>
        {count} employees
      </Typography>
    </Stack>
  );
}

function isEmptyAnalytics(analytics: CompensationAnalytics) {
  return (
    analytics.totalPayroll === 0 &&
    analytics.averageSalary === 0 &&
    analytics.medianSalary === 0 &&
    analytics.countByCountry.length === 0 &&
    analytics.averageByDepartment.length === 0
  );
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

const numberFormatter = new Intl.NumberFormat("en-US");
