import { apiClient } from "../../api";
import { type ApiSuccessResponse, unwrapApiResponse } from "../../api/responses";

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
  const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>(
    "/auth/login",
    credentials
  );

  return unwrapApiResponse(response.data);
}
