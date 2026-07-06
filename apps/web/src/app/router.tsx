import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { EmployeesPage } from "../pages/Employees/EmployeesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/employees",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <EmployeesPage />
        </AppLayout>
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
