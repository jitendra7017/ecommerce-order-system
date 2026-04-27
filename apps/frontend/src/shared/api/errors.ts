import type { AxiosError } from "axios";
import { ApiError, type ApiResponse } from "./envelope";

function isApiResponseShape(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === "boolean" && typeof v.message === "string" && "data" in v;
}

export function parseAxiosError(error: unknown): ApiError {
  const maybeAxios = error as AxiosError | undefined;

  const status =
    typeof maybeAxios?.response?.status === "number" ? maybeAxios.response.status : undefined;

  const data = maybeAxios?.response?.data;
  if (isApiResponseShape(data)) {
    return new ApiError(data.message, status);
  }

  if (typeof maybeAxios?.message === "string" && maybeAxios.message.length > 0) {
    return new ApiError(maybeAxios.message, status);
  }

  return new ApiError("Request failed", status);
}
