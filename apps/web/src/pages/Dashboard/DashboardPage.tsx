import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";

import type { CompensationAnalytics } from "../../api/dashboard.api";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { useCompensationAnalytics } from "../../hooks/useCompensationAnalytics";

export function DashboardPage() {
  const { analytics, isLoading, errorMessage } = useCompensationAnalytics();

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <DashboardPageHeader />
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: { xs: 2.5, sm: 3 }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={22} aria-label="Loading dashboard analytics" />
            <Box>
              <Typography fontWeight={700}>Loading dashboard analytics...</Typography>
              <Typography variant="body2" color="text.secondary">
                Preparing compensation metrics and chart data.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  if (errorMessage) {
    return (
      <Stack spacing={2}>
        <DashboardPageHeader />
        <Alert severity="error">{errorMessage}</Alert>
      </Stack>
    );
  }

  if (!analytics || isEmptyAnalytics(analytics)) {
    return (
      <Stack spacing={2}>
        <DashboardPageHeader />
        <Paper
          elevation={0}
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            textAlign: "center"
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Typography variant="h2">No dashboard analytics yet</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
              Add employee salary records to see compensation analytics.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return <DashboardAnalytics analytics={analytics} />;
}

function DashboardPageHeader() {
  return (
    <Stack spacing={0.75}>
      <Typography variant="h1">Dashboard</Typography>
      <Typography color="text.secondary">
        Track salary spend, workforce distribution, and compensation trends.
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
