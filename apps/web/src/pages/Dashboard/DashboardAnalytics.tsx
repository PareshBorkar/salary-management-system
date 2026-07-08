import { useMemo } from "react";
import { Stack, Typography } from "@mui/material";

import type { CompensationAnalytics } from "../../api/dashboard.api";
import { getSessionOrganizationName, getSessionUserDisplayName } from "../../api/session";
import { AnalyticsCards } from "./AnalyticsCards";
import { AnalyticsCharts } from "./AnalyticsCharts";

export function DashboardAnalytics({ analytics }: { analytics: CompensationAnalytics }) {
  const totalEmployees = useMemo(
    () => analytics.countByCountry.reduce((total, item) => total + item.count, 0),
    [analytics.countByCountry]
  );
  const organizationName = getSessionOrganizationName();
  const userDisplayName = getSessionUserDisplayName();

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <Typography variant="h1">Welcome back, {userDisplayName}</Typography>
          <Typography color="text.secondary">
            Here's what's happening with compensation at {organizationName}.
          </Typography>
        </Stack>
      </Stack>

      <AnalyticsCards
        totalEmployees={totalEmployees}
        totalPayroll={analytics.totalPayroll}
        averageSalary={analytics.averageSalary}
        medianSalary={analytics.medianSalary}
      />

      <AnalyticsCharts analytics={analytics} totalEmployees={totalEmployees} />
    </Stack>
  );
}
