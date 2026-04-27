import { prisma } from "../../lib/prisma.js";

export const cartRepository = {
  async getOrCreateCart(userId: number) {
    return prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  getItems(userId: number) {
    return prisma.cartItem.findMany({
      where: { cart: { userId }, product: { deletedAt: null } },
      include: { product: true, cart: true },
    });
  },

  async upsertItem(userId: number, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  async updateItem(userId: number, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  },

  async removeItem(userId: number, productId: number) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } });
  },

  clearByCartId(cartId: number) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
