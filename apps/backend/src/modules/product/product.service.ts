import { AppError, ERROR_CODE } from "@repo/errors";
import { productRepository } from "./product.repository.js";
import { toPositiveInt } from "@repo/utils";

export const productService = {
  create: (payload: { name: string; description?: string; price: number; stock: number; categoryId: number }) =>
    productRepository.create(payload),
  async update(id: number, payload: { name: string; description?: string; price: number; stock: number; categoryId: number }) {
    const product = await productRepository.getActiveById(id);
    if (!product) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR);
    }
    return productRepository.update(id, payload);
  },
  async remove(id: number) {
    const product = await productRepository.getActiveById(id);
    if (!product) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR);
    }
    return productRepository.remove(id);
  },
  async list(query: { page?: number; limit?: number; search?: string; categoryId?: number }) {
    const page = toPositiveInt(query.page, 1);
    const limit = toPositiveInt(query.limit, 10);
    const [items, total] = await Promise.all([
      productRepository.list(page, limit, query.search, query.categoryId ? Number(query.categoryId) : undefined),
      productRepository.count(query.search, query.categoryId ? Number(query.categoryId) : undefined),
    ]);
    return { items, page, limit, total };
  },
};
