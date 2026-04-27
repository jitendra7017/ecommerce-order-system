import { OrderStatus } from "@prisma/client";
import { ORDER_STATUS } from "@repo/constants";
import { AppError, ERROR_CODE } from "@repo/errors";
import { prisma } from "../../lib/prisma.js";
import {
  computeOrderTotal,
  decrementStockForLines,
  incrementStockForOrderItems,
  indexProductsById,
  lockUserCartRowOrThrow,
  selectLockedProductRows,
  validateStockForCheckout,
} from "./order-transaction.helpers.js";
import type { CheckoutCartLine, OrderTransactionClient } from "./order.types.js";

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

  /**
   * Checkout uses two layers of pessimistic locking: the cart row (serialization / idempotency)
   * and product rows (inventory correctness under concurrency). See helpers for details.
   */
  createOrderWithTransaction: async (userId: number) =>
    prisma.$transaction(async (tx: OrderTransactionClient) => {
      await lockUserCartRowOrThrow(tx, userId);

      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError(ERROR_CODE.CART_EMPTY);
      }

      const lines = cart.items as CheckoutCartLine[];
      const productIds = lines.map((line) => line.productId);

      const lockedRows = await selectLockedProductRows(tx, productIds);
      const productById = indexProductsById(lockedRows);

      validateStockForCheckout(lines, productById);

      const totalAmount = computeOrderTotal(lines, productById);

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: OrderStatus.placed,
        },
      });

      await tx.orderItem.createMany({
        data: lines.map((line) => {
          const product = productById.get(line.productId)!;
          return {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: product.price,
          };
        }),
      });

      await decrementStockForLines(tx, lines);
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
    }),

  cancelOrderWithTransaction: async (userId: number, orderId: number) =>
    prisma.$transaction(async (tx: OrderTransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId, deletedAt: null },
        include: { items: true },
      });
      if (!order) {
        throw new AppError(ERROR_CODE.ORDER_NOT_FOUND);
      }
      if (order.status === ORDER_STATUS.CANCELLED) {
        throw new AppError(ERROR_CODE.ORDER_ALREADY_CANCELLED);
      }

      await incrementStockForOrderItems(tx, order.items);

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled },
        include: { items: true },
      });
    }),
};
