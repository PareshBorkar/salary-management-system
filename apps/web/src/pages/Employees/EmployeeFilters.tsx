import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, MenuItem, Select, Stack, TextField } from "@mui/material";

import { countries, departments, formatCountry, levels, roles } from "./employeeOptions";

type EmployeeFiltersProps = {
  searchInput: string;
  country: string;
  department: string;
  role: string;
  level: string;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onLevelChange: (value: string) => void;
};

export function EmployeeFilters({
  searchInput,
  country,
  department,
  role,
  level,
  onSearchChange,
  onCountryChange,
  onDepartmentChange,
  onRoleChange,
  onLevelChange
}: EmployeeFiltersProps) {
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, email, employee ID..."
        value={searchInput}
        onChange={(event) => onSearchChange(event.target.value)}
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
        <FilterSelect
          label="Country"
          value={country}
          options={countries}
          onChange={onCountryChange}
        />
        <FilterSelect
          label="Department"
          value={department}
          options={departments}
          onChange={onDepartmentChange}
        />
        <FilterSelect label="Role" value={role} options={roles} onChange={onRoleChange} />
        <FilterSelect
          label="Level"
          value={level}
          options={levels}
          onChange={onLevelChange}
        />
      </Stack>
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
