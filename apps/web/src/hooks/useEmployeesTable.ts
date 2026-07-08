import { useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "../api/responses";
import {
  listEmployees,
  type Employee,
  type EmployeeListRequest
} from "../api/employees.api";

export type EmployeeSortBy = EmployeeListRequest["sortBy"];
export type EmployeeSortDirection = EmployeeListRequest["sortDirection"];

export function useEmployeesTable() {
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
  const [sortBy, setSortBy] = useState<EmployeeSortBy>("employeeCode");
  const [sortDirection, setSortDirection] = useState<EmployeeSortDirection>("asc");
  const [refreshKey, setRefreshKey] = useState(0);
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
      } catch (error) {
        if (!isActive) {
          return;
        }

        setEmployees([]);
        setTotal(0);
        setErrorMessage(
          getApiErrorMessage(error, "Unable to load employees. Please try again.")
        );
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
  }, [
    country,
    department,
    level,
    page,
    pageSize,
    refreshKey,
    role,
    search,
    sortBy,
    sortDirection
  ]);

  const activeFilterCount = useMemo(
    () => [country, department, role, level].filter(Boolean).length,
    [country, department, role, level]
  );

  function handleSort(nextSortBy: EmployeeSortBy) {
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

  function handlePageSizeChange(nextPageSize: number) {
    setPage(0);
    setPageSize(nextPageSize);
  }

  function refreshEmployees() {
    setRefreshKey((currentKey) => currentKey + 1);
  }

  return {
    employees,
    total,
    page,
    pageSize,
    searchInput,
    country,
    department,
    role,
    level,
    sortBy,
    sortDirection,
    isLoading,
    errorMessage,
    activeFilterCount,
    setPage,
    setSearchInput,
    setCountry: (value: string) => handleFilterChange(setCountry, value),
    setDepartment: (value: string) => handleFilterChange(setDepartment, value),
    setRole: (value: string) => handleFilterChange(setRole, value),
    setLevel: (value: string) => handleFilterChange(setLevel, value),
    setPageSize: handlePageSizeChange,
    handleSort,
    refreshEmployees
  };
}
