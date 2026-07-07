/* @vitest-environment jsdom */
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../../src/api";
import {
  clearSessionToken,
  getSessionToken,
  sessionExpiredEventName,
  setSessionToken
} from "../../../src/api/session";

function unauthorizedError(url: string) {
  return new AxiosError(
    "Unauthorized",
    undefined,
    {
      headers: {},
      method: "get",
      url
    } as InternalAxiosRequestConfig,
    undefined,
    {
      data: {
        success: false,
        message: "Invalid or expired token",
        code: "UNAUTHORIZED",
        statusCode: 401
      },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {
        headers: {},
        method: "get",
        url
      } as InternalAxiosRequestConfig
    }
  );
}

describe("api client unauthorized handling", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
    setSessionToken("valid-token");
  });

  afterEach(() => {
    clearSessionToken();
    vi.unstubAllGlobals();
  });

  it("clears the active session and emits a session-expired event for protected 401 responses", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    const rejected = (
      apiClient.interceptors.response as typeof apiClient.interceptors.response & {
        handlers: Array<{ rejected?: (error: unknown) => Promise<never> }>;
      }
    ).handlers[0]?.rejected;

    expect(rejected).toBeTruthy();

    await expect(rejected?.(unauthorizedError("/employees"))).rejects.toBeInstanceOf(
      AxiosError
    );

    expect(getSessionToken()).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0]?.[0].type).toBe(sessionExpiredEventName);
  });

  it("does not clear the session for login-specific 401 responses", async () => {
    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
    const rejected = (
      apiClient.interceptors.response as typeof apiClient.interceptors.response & {
        handlers: Array<{ rejected?: (error: unknown) => Promise<never> }>;
      }
    ).handlers[0]?.rejected;

    await expect(rejected?.(unauthorizedError("/auth/login"))).rejects.toBeInstanceOf(
      AxiosError
    );

    expect(getSessionToken()).toBe("valid-token");
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});
