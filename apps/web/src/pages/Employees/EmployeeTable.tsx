import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from "@mui/material";

import type { Employee } from "./employees.api";
import { formatCountry } from "./employeeOptions";
import type {
  EmployeeSortBy,
  EmployeeSortDirection
} from "../../hooks/useEmployeesTable";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

type EmployeeTableProps = {
  employees: Employee[];
  isLoading: boolean;
  sortBy: EmployeeSortBy;
  sortDirection: EmployeeSortDirection;
  onSort: (sortBy: EmployeeSortBy) => void;
};

export function EmployeeTable({
  employees,
  isLoading,
  sortBy,
  sortDirection,
  onSort
}: EmployeeTableProps) {
  return (
    <TableContainer sx={{ minHeight: 480 }}>
      <Table size="small" aria-label="Employees table">
        <TableHead>
          <TableRow>
            <SortableHeader
              active={sortBy === "employeeCode"}
              direction={sortDirection}
              onClick={() => onSort("employeeCode")}
            >
              Employee ID
            </SortableHeader>
            <SortableHeader
              active={sortBy === "firstName"}
              direction={sortDirection}
              onClick={() => onSort("firstName")}
            >
              Name
            </SortableHeader>
            <SortableHeader
              active={sortBy === "department"}
              direction={sortDirection}
              onClick={() => onSort("department")}
            >
              Department
            </SortableHeader>
            <TableCell>Designation</TableCell>
            <SortableHeader
              active={sortBy === "country"}
              direction={sortDirection}
              onClick={() => onSort("country")}
            >
              Location
            </SortableHeader>
            <SortableHeader
              active={sortBy === "salary"}
              direction={sortDirection}
              onClick={() => onSort("salary")}
              align="right"
            >
              Annual Salary
            </SortableHeader>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Stack spacing={1.5} alignItems="center" sx={{ py: 8 }}>
                  <CircularProgress size={28} />
                  <Typography color="text.secondary">Loading employees...</Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : employees.length ? (
            employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>{employee.employeeCode}</TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography fontWeight={700}>
                      {employee.firstName} {employee.lastName}
                    </Typography>
                    {employee.email ? (
                      <Typography variant="caption" color="text.secondary">
                        {employee.email}
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>{employee.department ?? "-"}</TableCell>
                <TableCell>{employee.title ?? employee.role ?? "-"}</TableCell>
                <TableCell>{formatCountry(employee.country)}</TableCell>
                <TableCell align="right">
                  {employee.salary
                    ? currencyFormatter.format(employee.salary.amount)
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      aria-label={`Actions for ${employee.employeeCode}`}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <Stack spacing={1} alignItems="center" sx={{ py: 8 }}>
                  <Typography fontWeight={700}>No employees found</Typography>
                  <Typography color="text.secondary">
                    Try adjusting the search or filters.
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type SortableHeaderProps = {
  active: boolean;
  direction: EmployeeSortDirection;
  children: string;
  onClick: () => void;
  align?: "left" | "right";
};

function SortableHeader({
  active,
  direction,
  children,
  onClick,
  align = "left"
}: SortableHeaderProps) {
  return (
    <TableCell align={align} sortDirection={active ? direction : false}>
      <TableSortLabel
        active={active}
        direction={active ? direction : "asc"}
        onClick={onClick}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );
}
