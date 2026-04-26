import type { Order } from "@repo/types";

export type OrderListQuery = {
  page?: number;
  limit?: number;
};

export type OrderListResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
};
export type PlaceOrderResponse = Order | null;
export type CancelOrderResponse = Order;

