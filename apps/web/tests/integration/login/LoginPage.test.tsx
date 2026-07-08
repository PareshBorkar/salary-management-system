/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { login } from "../../../src/api/login.api";
import {
  clearSessionUserDetails,
  clearSessionToken,
  getSessionUserDetails,
  getSessionToken
} from "../../../src/api/session";
import { LoginPage } from "../../../src/pages/Login/LoginPage";

vi.mock("../../../src/api/login.api", () => ({
  login: vi.fn()
}));

const loginMock = vi.mocked(login);

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    clearSessionToken();
    clearSessionUserDetails();
    loginMock.mockReset();
  });

  it("renders the login form", () => {
    const html = renderToString(
      <StaticRouter location="/login">
        <LoginPage />
      </StaticRouter>
    );

    expect(html).toContain("Welcome back");
    expect(html).toContain("Sign in to continue to your account");
    expect(html).toContain("Email address");
    expect(html).toContain("Password");
    expect(html).toContain("Remember me");
    expect(html).toContain("Forgot password?");
    expect(html).toContain("Sign In");
  });

  it("stores user display details after a successful login", async () => {
    loginMock.mockResolvedValue({
      token: "valid-token",
      user: {
        id: "user-1",
        email: "priya.nair@example.com",
        firstName: "Priya",
        lastName: "Nair",
        role: "HR_MANAGER",
        organizationId: "org-1",
        organizationName: "Northstar Systems"
      }
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByPlaceholderText("Enter your email"),
      "priya.nair@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password123!"
    );
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(getSessionToken()).toBe("valid-token"));
    expect(getSessionUserDetails()).toMatchObject({
      firstName: "Priya",
      lastName: "Nair",
      organizationName: "Northstar Systems"
    });
  });
});
