import type { CartItem, Order, Product } from "@repo/types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export interface ProductListResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export interface CreateOrderResponse {
  order: Order;
}
