import { http } from "@/shared/api/httpClient";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/envelope";
import { parseAxiosError } from "@/shared/api/errors";
import type { Product } from "@repo/types";
import type { ProductListQuery, ProductListResponse, UpsertProductRequest } from "./types";

export const productService = {
  async list(query: ProductListQuery): Promise<ProductListResponse> {
    try {
      const res = await http.get<ApiResponse<ProductListResponse>>("/products", { params: query });
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async create(payload: UpsertProductRequest): Promise<Product> {
    try {
      const res = await http.post<ApiResponse<Product>>("/products", payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async update(id: number, payload: UpsertProductRequest): Promise<Product> {
    try {
      const res = await http.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async remove(id: number): Promise<null> {
    try {
      const res = await http.delete<ApiResponse<null>>(`/products/${id}`);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};
