import { renderToString } from "react-dom/server";
import { Navigate } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppLayout } from "../../../src/components/AppLayout";
import { ProtectedRoute } from "../../../src/components/ProtectedRoute";
import { DashboardPage } from "../../../src/pages/Dashboard/DashboardPage";

const tokenKey = "salary-management-token";

function stubLocalStorage(token: string | null) {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((key: string) => (key === tokenKey ? token : null)),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  });
}

describe("protected app layout behavior", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects protected routes to login when unauthenticated", () => {
    stubLocalStorage(null);

    const element = ProtectedRoute({
      children: <DashboardPage />
    });

    expect(element).toMatchObject({
      type: Navigate,
      props: {
        to: "/login",
        replace: true
      }
    });
  });

  it("allows authenticated access to protected content", () => {
    stubLocalStorage("valid-token");

    const html = renderToString(
      <StaticRouter location="/">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </StaticRouter>
    );

    expect(html).toContain("Home Page");
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
    expect(html).toContain("Home Page");
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
});
