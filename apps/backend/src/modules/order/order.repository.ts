import { ORDER_STATUS } from "@repo/constants";
import { AppError, ERROR_CODE } from "@repo/errors";
import { prisma } from "../../lib/prisma.js";
import type { LockedProductRow } from "./order.types.js";

type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;
type TransactionCartItem = { productId: number; quantity: number };

export const orderRepository = {
  getUserCart: (userId: number) =>
    prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    }),
  getOrdersByUser: (userId: number, page: number, limit: number) =>
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  countOrdersByUser: (userId: number) =>
    prisma.order.count({
      where: { userId, deletedAt: null },
    }),
  createOrderWithTransaction: async (userId: number) =>
    prisma.$transaction(async (tx: TransactionClient) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) throw new AppError(ERROR_CODE.CART_EMPTY);

      const cartItems = cart.items as TransactionCartItem[];
      const productIds = cartItems.map((item: TransactionCartItem) => item.productId);
      const lockedRows = (await tx.$queryRawUnsafe(
        `SELECT id, stock, price FROM Product WHERE id IN (${productIds.join(",")}) AND deletedAt IS NULL FOR UPDATE`,
      )) as LockedProductRow[];

      const productById = new Map(lockedRows.map((row) => [row.id, row]));
      for (const item of cartItems) {
        const product = productById.get(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new AppError(ERROR_CODE.INSUFFICIENT_STOCK, { productId: item.productId });
        }
      }

      const totalAmount = cartItems.reduce((sum: number, item: TransactionCartItem) => {
        const product = productById.get(item.productId)!;
        return sum + item.quantity * Number(product.price);
      }, 0);

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item: TransactionCartItem) => {
          const product = productById.get(item.productId)!;
          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(product.price),
          };
        }),
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
    }),
  cancelOrderWithTransaction: async (userId: number, orderId: number) =>
    prisma.$transaction(async (tx: TransactionClient) => {
      const order = await tx.order.findFirst({ where: { id: orderId, userId, deletedAt: null }, include: { items: true } });
      if (!order) throw new AppError(ERROR_CODE.ORDER_NOT_FOUND);
      if (order.status === ORDER_STATUS.CANCELLED) throw new AppError(ERROR_CODE.ORDER_ALREADY_CANCELLED);

      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }

      return tx.order.update({ where: { id: orderId }, data: { status: ORDER_STATUS.CANCELLED }, include: { items: true } });
    }),
};
