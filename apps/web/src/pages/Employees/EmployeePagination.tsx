import { TablePagination } from "@mui/material";

type EmployeePaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function EmployeePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}: EmployeePaginationProps) {
  return (
    <TablePagination
      component="div"
      count={total}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 25, 50, 100]}
      onPageChange={(_, nextPage) => onPageChange(nextPage)}
      onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
    />
  );
}
