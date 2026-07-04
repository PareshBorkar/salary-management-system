import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
  }
]);
