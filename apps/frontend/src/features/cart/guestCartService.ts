import { calculateGrandTotal, calculateLineSubtotal, type CartViewModel } from "./cartUtils";

const GUEST_CART_KEY = "guest_cart_v1";

export type GuestCartItem = {
  productId: number;
  name: string;
  unitPrice: number;
  stock: number;
  quantity: number;
};

type GuestCartAddPayload = {
  productId: number;
  name: string;
  unitPrice: number;
  stock: number;
};

function readItems(): GuestCartItem[] {
  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is GuestCartItem => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as Partial<GuestCartItem>;
      return (
        typeof candidate.productId === "number" &&
        typeof candidate.name === "string" &&
        typeof candidate.unitPrice === "number" &&
        typeof candidate.stock === "number" &&
        typeof candidate.quantity === "number"
      );
    });
  } catch {
    return [];
  }
}

function writeItems(items: GuestCartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function toViewModel(items: GuestCartItem[]): CartViewModel {
  return {
    items: items.map((item, index) => ({
      id: index + 1,
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: calculateLineSubtotal(item.quantity, item.unitPrice),
      stock: item.stock,
    })),
    total: calculateGrandTotal(
      items.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice })),
    ),
  };
}

export const guestCartService = {
  get(): CartViewModel {
    return toViewModel(readItems());
  },

  add(payload: GuestCartAddPayload): void {
    const items = readItems();
    const existing = items.find((item) => item.productId === payload.productId);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, Math.max(1, payload.stock));
      existing.stock = payload.stock;
      existing.unitPrice = payload.unitPrice;
      existing.name = payload.name;
    } else {
      items.push({
        ...payload,
        quantity: payload.stock > 0 ? 1 : 0,
      });
    }

    writeItems(items.filter((item) => item.quantity > 0));
  },

  update(productId: number, quantity: number): void {
    const items = readItems();
    const next = items
      .map((item) => {
        if (item.productId !== productId) return item;
        return { ...item, quantity: Math.min(Math.max(0, quantity), Math.max(1, item.stock)) };
      })
      .filter((item) => item.quantity > 0);

    writeItems(next);
  },

  remove(productId: number): void {
    const next = readItems().filter((item) => item.productId !== productId);
    writeItems(next);
  },

  listItems(): GuestCartItem[] {
    return readItems();
  },

  clear(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  },
};
