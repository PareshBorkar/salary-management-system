import { createBrowserRouter, Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { AppLayout } from "../components/AppLayout";
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";

function ProtectedRoute({ children }: PropsWithChildren) {
  const token = localStorage.getItem("salary-management-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

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
    element: (
      <AppLayout>
        <LoginPage />
      </AppLayout>
    )
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
]);
