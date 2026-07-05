import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";

import { LoginPage } from "../../../src/pages/Login/LoginPage";

describe("LoginPage", () => {
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
});
