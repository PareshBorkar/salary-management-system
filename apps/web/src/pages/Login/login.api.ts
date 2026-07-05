import { apiClient } from "../../api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
};

export async function login(credentials: LoginRequest) {
  const response = await apiClient.post<LoginResponse>("/auth/login", credentials);

  return response.data;
}
