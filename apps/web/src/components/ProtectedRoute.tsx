import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const token = localStorage.getItem("salary-management-token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
