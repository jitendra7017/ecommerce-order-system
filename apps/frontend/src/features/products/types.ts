import type { Product } from "@repo/types";

export type ProductListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
};

export type ProductListResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
};

export type UpsertProductRequest = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
};

