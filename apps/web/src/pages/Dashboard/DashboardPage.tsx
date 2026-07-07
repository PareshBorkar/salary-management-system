import { Alert, CircularProgress, Paper, Stack, Typography } from "@mui/material";

import type { CompensationAnalytics } from "../../api/dashboard.api";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { useCompensationAnalytics } from "../../hooks/useCompensationAnalytics";

export function DashboardPage() {
  const { analytics, isLoading, errorMessage } = useCompensationAnalytics();

  if (isLoading) {
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

  if (errorMessage) {
    return (
      <Stack spacing={2}>
        <Typography variant="h1">Dashboard</Typography>
        <Alert severity="error">{errorMessage}</Alert>
      </Stack>
    );
  }

  if (!analytics || isEmptyAnalytics(analytics)) {
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

  return <DashboardAnalytics analytics={analytics} />;
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
