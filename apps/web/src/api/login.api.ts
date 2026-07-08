import { apiClient } from "./client";
import { type ApiSuccessResponse, unwrapApiResponse } from "./responses";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
    organizationName: string;
  };
};

export async function login(credentials: LoginRequest) {
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    "/auth/login",
    credentials
  );

  return unwrapApiResponse(response.data);
}
