/* @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearSessionToken,
  notifySessionExpired,
  setSessionToken
} from "../../../src/api/session";
import { AppLayout } from "../../../src/components/AppLayout";
import { ProtectedRoute } from "../../../src/components/ProtectedRoute";
import { DashboardPage } from "../../../src/pages/Dashboard/DashboardPage";

function setToken(token: string | null) {
  clearSessionToken();

  if (token) {
    setSessionToken(token);
  }
}

describe("protected app layout behavior", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("redirects protected routes to login when unauthenticated", () => {
    setToken(null);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("allows authenticated access to protected content", () => {
    setToken("valid-token");

    const html = renderToString(
      <StaticRouter location="/">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </StaticRouter>
    );

    expect(html).toContain("Loading dashboard analytics...");
  });

  it("renders the authenticated topbar and sidebar shell", () => {
    const html = renderToString(
      <StaticRouter location="/">
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </StaticRouter>
    );

    expect(html).toContain("Salary Management");
    expect(html).toContain("ACME");
    expect(html).toContain("Dashboard");
    expect(html).toContain("Employees");
    expect(html).toContain("Loading dashboard analytics...");
  });

  it("renders navigation links for primary pages", () => {
    const html = renderToString(
      <StaticRouter location="/">
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </StaticRouter>
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/employees"');
  });

  it("collapses and expands the sidebar navigation", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppLayout>
          <div>Dashboard content</div>
        </AppLayout>
      </MemoryRouter>
    );

    const collapseButton = screen.getByRole("button", {
      name: "Collapse navigation"
    });

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
    expect(screen.getByText("Compensation workspace")).toBeTruthy();

    await userEvent.click(collapseButton);

    expect(
      screen
        .getByRole("button", { name: "Expand navigation" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(screen.queryByText("Compensation workspace")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Expand navigation" }));

    expect(
      screen
        .getByRole("button", { name: "Collapse navigation" })
        .getAttribute("aria-pressed")
    ).toBe("false");
    expect(screen.getByText("Compensation workspace")).toBeTruthy();
  });

  it("redirects to login after a session-expired event clears authentication", async () => {
    setToken("valid-token");

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Secure dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Secure dashboard")).toBeTruthy();

    clearSessionToken();
    notifySessionExpired();

    await waitFor(() => expect(screen.getByText("Login page")).toBeTruthy());
  });
});
