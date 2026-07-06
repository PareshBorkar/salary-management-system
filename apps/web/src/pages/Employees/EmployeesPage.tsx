import { Paper, Stack, Typography } from "@mui/material";

export function EmployeesPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h1">Employees</Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Typography color="text.secondary">
          Employee salary records will appear here.
        </Typography>
      </Paper>
    </Stack>
  );
}
