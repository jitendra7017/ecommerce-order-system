import { http } from "@/shared/api/httpClient";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/envelope";
import { parseAxiosError } from "@/shared/api/errors";
import type { CancelOrderResponse, OrderListQuery, OrderListResponse, PlaceOrderResponse } from "./types";

export const orderService = {
  async list(query: OrderListQuery): Promise<OrderListResponse> {
    try {
      const res = await http.get<ApiResponse<OrderListResponse>>("/orders", { params: query });
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async place(): Promise<PlaceOrderResponse> {
    try {
      const res = await http.post<ApiResponse<PlaceOrderResponse>>("/orders");
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },

  async cancel(id: number): Promise<CancelOrderResponse> {
    try {
      const res = await http.post<ApiResponse<CancelOrderResponse>>(`/orders/${id}/cancel`);
      return unwrapApiResponse(res.data);
    } catch (err) {
      throw parseAxiosError(err);
    }
  },
};

