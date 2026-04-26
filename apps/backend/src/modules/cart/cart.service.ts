import { calculateTotal } from "@repo/utils";
import { AppError, ERROR_CODE } from "@repo/errors";
import { cartRepository } from "./cart.repository.js";
import { prisma } from "../../lib/prisma.js";

export const cartService = {
  async add(userId: number, productId: number, quantity: number) {
    const product = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR);
    }
    if (quantity <= 0) {
      throw new AppError(ERROR_CODE.VALIDATION_ERROR);
    }
    return cartRepository.upsertItem(userId, productId, quantity);
  },
  async update(userId: number, productId: number, quantity: number) {
    return cartRepository.updateItem(userId, productId, quantity);
  },
  async remove(userId: number, productId: number) {
    return cartRepository.removeItem(userId, productId);
  },
  async get(userId: number) {
    const items = await cartRepository.getItems(userId);
    const total = calculateTotal(items.map((item) => ({ quantity: item.quantity, unitPrice: Number(item.product.price) })));
    return { items, total };
  },
};
