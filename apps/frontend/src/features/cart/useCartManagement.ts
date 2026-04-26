import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService } from "./cartService";
import { guestCartService } from "./guestCartService";
import { orderService } from "@/features/orders/orderService";
import { mapCartResponseToViewModel } from "./cartUtils";
import type { CartGetResponse } from "./types";
import { getSession } from "@/shared/auth/session";

export function useCartManagement() {
  const queryClient = useQueryClient();
  const session = getSession();
  const isGuest = !session;

  const cartQuery = useQuery({
    queryKey: ["cart.get", isGuest ? "guest" : "user"],
    queryFn: async () => (isGuest ? guestCartService.get() : cartService.get()),
    select: (data): ReturnType<typeof guestCartService.get> =>
      isGuest ? (data as ReturnType<typeof guestCartService.get>) : mapCartResponseToViewModel(data as CartGetResponse),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (isGuest) {
        guestCartService.update(productId, quantity);
        return;
      }
      await cartService.update(productId, { quantity });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart.get", isGuest ? "guest" : "user"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (isGuest) {
        guestCartService.remove(productId);
        return;
      }
      await cartService.remove(productId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart.get", isGuest ? "guest" : "user"] });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: () => orderService.place(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart.get"] });
    },
  });

  return {
    isGuest,
    cartQuery,
    updateMutation,
    removeMutation,
    placeOrderMutation,
  };
}

