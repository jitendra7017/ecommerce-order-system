import type { Product } from "@repo/types";

export type CartRow = { id: number; userId: number; createdAt: string };

export type CartItemRow = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
};

export type CartItemWithIncludes = CartItemRow & {
  product: Product;
  cart: CartRow;
};

export type CartGetResponse = { items: CartItemWithIncludes[]; total: number };

export type AddToCartRequest = { productId: number; quantity: number };
export type UpdateCartItemRequest = { quantity: number };
