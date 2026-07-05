import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
