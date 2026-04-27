import { describe, expect, it } from "vitest";
import {
  calculateGrandTotal,
  calculateLineSubtotal,
  mapCartResponseToViewModel,
} from "./cartUtils";

describe("cartUtils", () => {
  it("calculates line subtotal", () => {
    expect(calculateLineSubtotal(3, 19.99)).toBe(59.97);
  });

  it("calculates grand total", () => {
    expect(
      calculateGrandTotal([
        { quantity: 2, unitPrice: 10 },
        { quantity: 1, unitPrice: 5.5 },
      ]),
    ).toBe(25.5);
  });

  it("maps API response to cart view model", () => {
    const vm = mapCartResponseToViewModel({
      items: [
        {
          id: 1,
          cartId: 7,
          productId: 9,
          quantity: 2,
          cart: { id: 7, userId: 1, createdAt: "2026-01-01T00:00:00.000Z" },
          product: {
            id: 9,
            name: "Phone",
            description: null,
            price: 100,
            stock: 3,
            categoryId: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        },
      ],
      total: 0,
    });

    expect(vm.items[0]).toMatchObject({
      productId: 9,
      name: "Phone",
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
      stock: 3,
    });
    expect(vm.total).toBe(200);
  });
});
