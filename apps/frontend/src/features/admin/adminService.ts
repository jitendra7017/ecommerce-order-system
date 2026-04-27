import { authService } from "@/features/auth/authService";
import { categoryService } from "@/features/categories/categoryService";
import { productService } from "@/features/products/productService";
import type { LoginRequest, LoginResponse } from "@/features/auth/types";
import type { CreateCategoryRequest } from "@/features/categories/types";
import type { UpsertProductRequest } from "@/features/products/types";
import type { Category, Product } from "@repo/types";

/**
 * Backend does not expose separate admin endpoints for auth.
 * Admin-only access is enforced by JWT role claim + backend roleGuard.
 */
export const adminService = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return authService.login(payload);
  },

  createCategory(payload: CreateCategoryRequest): Promise<Category> {
    return categoryService.create(payload);
  },

  listCategories(): Promise<Category[]> {
    return categoryService.list();
  },

  listProducts(params: { page?: number; limit?: number; search?: string; categoryId?: number }) {
    return productService.list(params);
  },

  createProduct(payload: UpsertProductRequest): Promise<Product> {
    return productService.create(payload);
  },

  updateProduct(id: number, payload: UpsertProductRequest): Promise<Product> {
    return productService.update(id, payload);
  },

  deleteProduct(id: number): Promise<null> {
    return productService.remove(id);
  },
};
