import AddIcon from "@mui/icons-material/Add";
import { useEffect } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import { clearEmployeeSalaryHistoryCache } from "../../hooks/useEmployeeSalaryHistory";
import { clearLocalCurrencyCache } from "../../hooks/useLocalCurrency";
import { useEmployeesTable } from "../../hooks/useEmployeesTable";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeePagination } from "./EmployeePagination";
import { EmployeeTable } from "./EmployeeTable";

export function EmployeesPage() {
  const table = useEmployeesTable();

  useEffect(() => {
    clearEmployeeSalaryHistoryCache();
    clearLocalCurrencyCache();
  }, []);

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h1">Employees</Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Employee
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden"
        }}
      >
        <EmployeeFilters
          searchInput={table.searchInput}
          country={table.country}
          department={table.department}
          role={table.role}
          level={table.level}
          onSearchChange={table.setSearchInput}
          onCountryChange={table.setCountry}
          onDepartmentChange={table.setDepartment}
          onRoleChange={table.setRole}
          onLevelChange={table.setLevel}
        />

        {table.errorMessage ? (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error">{table.errorMessage}</Alert>
          </Box>
        ) : null}

        <EmployeeTable
          employees={table.employees}
          isLoading={table.isLoading}
          sortBy={table.sortBy}
          sortDirection={table.sortDirection}
          onSort={table.handleSort}
        />

        <EmployeePagination
          total={table.total}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Paper>
    </Stack>
  );
}
