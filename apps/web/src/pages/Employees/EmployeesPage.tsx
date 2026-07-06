import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";

import { listEmployees, type Employee, type EmployeeListRequest } from "./employees.api";

type SortBy = EmployeeListRequest["sortBy"];
type SortDirection = EmployeeListRequest["sortDirection"];

const departments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Operations",
  "Product",
  "Sales",
  "Support"
];

const countries = ["US", "IN", "GB", "DE", "CA", "AU", "SG"];
const roles = [
  "Engineer",
  "Analyst",
  "HR Partner",
  "Operations Lead",
  "Product Manager",
  "Account Executive",
  "Support Specialist"
];
const levels = ["Junior", "Mid", "Senior", "Lead", "Principal"];

const countryLabels: Record<string, string> = {
  AU: "Australia",
  CA: "Canada",
  DE: "Germany",
  GB: "United Kingdom",
  IN: "India",
  SG: "Singapore",
  US: "United States"
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("employeeCode");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function loadEmployees() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await listEmployees(
          {
            page: page + 1,
            pageSize,
            search: search || undefined,
            country: country || undefined,
            department: department || undefined,
            role: role || undefined,
            level: level || undefined,
            sortBy,
            sortDirection
          },
          controller.signal
        );

        if (!isActive) {
          return;
        }

        setEmployees(response.employees);
        setTotal(response.pagination.total);
      } catch {
        if (!isActive) {
          return;
        }

        setEmployees([]);
        setTotal(0);
        setErrorMessage("Unable to load employees. Please try again.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [country, department, level, page, pageSize, role, search, sortBy, sortDirection]);

  const activeFilterCount = useMemo(
    () => [country, department, role, level].filter(Boolean).length,
    [country, department, role, level]
  );

  function handleSort(nextSortBy: SortBy) {
    setPage(0);
    setSortDirection((currentDirection) =>
      sortBy === nextSortBy && currentDirection === "asc" ? "desc" : "asc"
    );
    setSortBy(nextSortBy);
  }

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setPage(0);
    setter(value);
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h1">Employees</Typography>
        <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
          <Button variant="outlined" startIcon={<TuneOutlinedIcon />} color="inherit">
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} color="inherit">
            Export
          </Button>
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
        <Stack spacing={2} sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, email, employee ID..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: 520 }}
          />

          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.25}>
            <FilterSelect label="Country" value={country} options={countries} onChange={(value) => handleFilterChange(setCountry, value)} />
            <FilterSelect label="Department" value={department} options={departments} onChange={(value) => handleFilterChange(setDepartment, value)} />
            <FilterSelect label="Role" value={role} options={roles} onChange={(value) => handleFilterChange(setRole, value)} />
            <FilterSelect label="Level" value={level} options={levels} onChange={(value) => handleFilterChange(setLevel, value)} />
          </Stack>
        </Stack>

        {errorMessage ? (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error">{errorMessage}</Alert>
          </Box>
        ) : null}

        <TableContainer sx={{ minHeight: 480 }}>
          <Table size="small" aria-label="Employees table">
            <TableHead>
              <TableRow>
                <SortableHeader active={sortBy === "employeeCode"} direction={sortDirection} onClick={() => handleSort("employeeCode")}>
                  Employee ID
                </SortableHeader>
                <SortableHeader active={sortBy === "firstName"} direction={sortDirection} onClick={() => handleSort("firstName")}>
                  Name
                </SortableHeader>
                <SortableHeader active={sortBy === "department"} direction={sortDirection} onClick={() => handleSort("department")}>
                  Department
                </SortableHeader>
                <TableCell>Designation</TableCell>
                <SortableHeader active={sortBy === "country"} direction={sortDirection} onClick={() => handleSort("country")}>
                  Location
                </SortableHeader>
                <SortableHeader active={sortBy === "salary"} direction={sortDirection} onClick={() => handleSort("salary")} align="right">
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
                      {employee.salary ? currencyFormatter.format(employee.salary.amount) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="More actions">
                        <IconButton size="small" aria-label={`Actions for ${employee.employeeCode}`}>
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

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setPage(0);
            setPageSize(Number(event.target.value));
          }}
        />
      </Paper>
    </Stack>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <Select
      displayEmpty
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputProps={{ "aria-label": label }}
      sx={{ minWidth: { xs: "100%", lg: 180 } }}
    >
      <MenuItem value="">{label}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {label === "Country" ? formatCountry(option) : option}
        </MenuItem>
      ))}
    </Select>
  );
}

type SortableHeaderProps = {
  active: boolean;
  direction: SortDirection;
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
      <TableSortLabel active={active} direction={active ? direction : "asc"} onClick={onClick}>
        {children}
      </TableSortLabel>
    </TableCell>
  );
}

function formatCountry(country: string | null) {
  if (!country) {
    return "-";
  }

  return countryLabels[country] ?? country;
}
