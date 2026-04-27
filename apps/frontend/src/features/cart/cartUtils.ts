import type { CartGetResponse, CartItemWithIncludes } from "./types";

export type CartLineItem = {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  stock: number;
};

export type CartViewModel = {
  items: CartLineItem[];
  total: number;
};

export function calculateLineSubtotal(quantity: number, unitPrice: number): number {
  return Number((quantity * unitPrice).toFixed(2));
}

export function calculateGrandTotal(items: Array<{ quantity: number; unitPrice: number }>): number {
  const sum = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  return Number(sum.toFixed(2));
}

function toLineItem(item: CartItemWithIncludes): CartLineItem {
  const unitPrice = Number(item.product.price);
  return {
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice,
    subtotal: calculateLineSubtotal(item.quantity, unitPrice),
    stock: item.product.stock,
  };
}

export function mapCartResponseToViewModel(payload: CartGetResponse): CartViewModel {
  const items = payload.items.map(toLineItem);
  return {
    items,
    total: calculateGrandTotal(
      items.map((i) => ({ quantity: i.quantity, unitPrice: i.unitPrice })),
    ),
  };
}
