import { AxiosError } from "axios";

export type ApiSuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  code: string;
  statusCode: number;
};

export function unwrapApiResponse<TData>(response: ApiSuccessResponse<TData>) {
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}
