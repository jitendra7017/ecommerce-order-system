import { http } from "@/shared/api/httpClient";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/envelope";
import { parseAxiosError } from "@/shared/api/errors";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./types";

export const authService = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const res = await http.post<ApiResponse<RegisterResponse>>("/auth/register", payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await http.post<ApiResponse<LoginResponse>>("/auth/login", payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};

