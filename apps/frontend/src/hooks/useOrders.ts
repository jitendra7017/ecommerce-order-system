import { useEffect, useState } from "react";
import type { Order } from "@repo/types";
import { orderApi } from "../api/endpoints";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = async () => {
    const res = await orderApi.list();
    setOrders(res.data.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { orders, refresh };
};
