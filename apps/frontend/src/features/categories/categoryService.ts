import { http } from "@/shared/api/httpClient";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/envelope";
import { parseAxiosError } from "@/shared/api/errors";
import type { Category } from "@repo/types";
import type { CategoryListResponse, CreateCategoryRequest } from "./types";

export const categoryService = {
  async list(): Promise<CategoryListResponse> {
    try {
      const res = await http.get<ApiResponse<CategoryListResponse>>("/categories");
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async create(payload: CreateCategoryRequest): Promise<Category> {
    try {
      const res = await http.post<ApiResponse<Category>>("/categories", payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};
