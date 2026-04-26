import { ORDER_STATUS } from "@repo/constants";
import { AppError, ERROR_CODE } from "@repo/errors";
import { toPositiveInt } from "@repo/utils";
import { orderRepository } from "./order.repository.js";

export const orderService = {
  create: (userId: number) => orderRepository.createOrderWithTransaction(userId),
  async list(userId: number, query: { page?: number; limit?: number }) {
    const page = toPositiveInt(query.page, 1);
    const limit = toPositiveInt(query.limit, 10);
    const [items, total] = await Promise.all([
      orderRepository.getOrdersByUser(userId, page, limit),
      orderRepository.countOrdersByUser(userId),
    ]);

    return { items, page, limit, total };
  },
  cancel: async (userId: number, orderId: number) => {
    const order = await orderRepository.cancelOrderWithTransaction(userId, orderId);
    if (order.status !== ORDER_STATUS.CANCELLED) {
      throw new AppError(ERROR_CODE.ORDER_CANCEL_FAILED);
    }
    return order;
  },
};
