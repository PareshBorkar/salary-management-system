import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { EmployeeDetailPage } from "../pages/Employees/EmployeeDetailPage";
import { EmployeesPage } from "../pages/Employees/EmployeesPage";

function protectedAppPage(page: ReactNode) {
  return (
    <ProtectedRoute>
      <AppLayout>{page}</AppLayout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: protectedAppPage(<DashboardPage />)
  },
  {
    path: "/employees",
    element: protectedAppPage(<EmployeesPage />)
  },
  {
    path: "/employees/:employeeId",
    element: protectedAppPage(<EmployeeDetailPage />)
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
