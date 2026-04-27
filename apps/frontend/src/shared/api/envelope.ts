export type ApiResponse<T> = { success: boolean; message: string; data: T };

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (!payload.success) {
    throw new ApiError(payload.message);
  }
  return payload.data;
}
