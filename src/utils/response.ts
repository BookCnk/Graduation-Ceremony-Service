import type { ApiSuccessResponse, ApiErrorResponse } from "@/types/response";
export const success = <T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> => ({
  status: "success",
  data,
  message,
});

export const error = (message: string, code?: number): ApiErrorResponse => ({
  status: "error",
  message,
  code,
});
