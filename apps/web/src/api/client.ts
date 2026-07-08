import axios, { AxiosError } from "axios";

import {
  clearSessionToken,
  clearSessionUserDetails,
  getSessionToken,
  notifySessionExpired
} from "./session";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getSessionToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      error.config?.url !== "/auth/login"
    ) {
      clearSessionToken();
      clearSessionUserDetails();
      notifySessionExpired();
    }

    return Promise.reject(error);
  }
);
