import type { ApiResponse } from "@repo/api-contracts";
import type { Order } from "@repo/types";
import { api } from "./client";
import type { ProductListResponse } from "@/features/products/types";

export const authApi = {
  register: (email: string, password: string) => api.post("/auth/register", { email, password }),
  login: (email: string, password: string) => api.post<ApiResponse<{ token: string }>>("/auth/login", { email, password }),
};

export const productApi = {
  list: (params: { page?: number; limit?: number; search?: string; categoryId?: number }) =>
    api.get<ApiResponse<ProductListResponse>>("/products", { params }),
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId: number, quantity: number) => api.post("/cart", { productId, quantity }),
  update: (productId: number, quantity: number) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: number) => api.delete(`/cart/${productId}`),
};

export const orderApi = {
  place: () => api.post("/orders"),
  list: () => api.get<ApiResponse<Order[]>>("/orders"),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
};
