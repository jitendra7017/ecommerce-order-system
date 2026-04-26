import { useEffect, useState } from "react";
import { cartApi, orderApi } from "../api/endpoints";

export interface CartState {
  items: Array<{ productId: number; quantity: number; product: { name: string; price: number } }>;
  total: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });

  const refresh = async () => {
    const res = await cartApi.get();
    setCart(res.data.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    cart,
    add: async (productId: number, quantity = 1) => {
      await cartApi.add(productId, quantity);
      await refresh();
    },
    update: async (productId: number, quantity: number) => {
      await cartApi.update(productId, quantity);
      await refresh();
    },
    remove: async (productId: number) => {
      await cartApi.remove(productId);
      await refresh();
    },
    placeOrder: async () => {
      await orderApi.place();
      await refresh();
    },
  };
};
