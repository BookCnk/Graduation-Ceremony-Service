export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  code?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
