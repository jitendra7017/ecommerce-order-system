import { http } from "@/shared/api/httpClient";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/envelope";
import { parseAxiosError } from "@/shared/api/errors";
import type { AddToCartRequest, CartGetResponse, CartItemRow, UpdateCartItemRequest } from "./types";

export const cartService = {
  async get(): Promise<CartGetResponse> {
    try {
      const res = await http.get<ApiResponse<CartGetResponse>>("/cart");
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async add(payload: AddToCartRequest): Promise<CartItemRow> {
    try {
      const res = await http.post<ApiResponse<CartItemRow>>("/cart", payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async update(productId: number, payload: UpdateCartItemRequest): Promise<CartItemRow> {
    try {
      const res = await http.put<ApiResponse<CartItemRow>>(`/cart/${productId}`, payload);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async remove(productId: number): Promise<null> {
    try {
      const res = await http.delete<ApiResponse<null>>(`/cart/${productId}`);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};

