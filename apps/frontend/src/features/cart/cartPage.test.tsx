import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartPage } from "@/pages/CartPage";
import { cartService } from "@/features/cart/cartService";
import { orderService } from "@/features/orders/orderService";
import { ToastProvider } from "@/shared/ui/toast/ToastProvider";

vi.mock("@/features/cart/cartService", () => ({
  cartService: { get: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock("@/features/orders/orderService", () => ({
  orderService: { place: vi.fn() },
}));

function renderCart() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/cart"]}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/auth/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const cartResponse = {
  items: [
    {
      id: 1,
      cartId: 4,
      productId: 101,
      quantity: 2,
      cart: { id: 4, userId: 1, createdAt: "2026-01-01T00:00:00.000Z" },
      product: {
        id: 101,
        name: "Phone",
        description: null,
        price: 100,
        stock: 5,
        categoryId: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    },
  ],
  total: 200,
};

describe("CartPage interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "header.eyJpZCI6MSwicm9sZSI6ImN1c3RvbWVyIn0.signature");
    vi.clearAllMocks();
    vi.mocked(cartService.get).mockResolvedValue(cartResponse);
    vi.mocked(cartService.update).mockResolvedValue({
      id: 1,
      cartId: 4,
      productId: 101,
      quantity: 3,
    });
    vi.mocked(cartService.remove).mockResolvedValue(null);
    vi.mocked(orderService.place).mockResolvedValue(null);
  });

  it("renders item, subtotal and grand total", async () => {
    renderCart();
    expect(await screen.findByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: $200")).toBeInTheDocument();
    expect(screen.getByText("Grand total: $200")).toBeInTheDocument();
  });

  it("supports quantity increase/decrease", async () => {
    renderCart();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /increase phone quantity/i }));
    await waitFor(() => expect(cartService.update).toHaveBeenCalledWith(101, { quantity: 3 }));

    fireEvent.click(screen.getByRole("button", { name: /decrease phone quantity/i }));
    await waitFor(() => expect(cartService.update).toHaveBeenCalledWith(101, { quantity: 1 }));
  });

  it("removes item", async () => {
    renderCart();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /remove phone/i }));
    await waitFor(() => expect(cartService.remove).toHaveBeenCalledWith(101));
  });

  it("places order", async () => {
    localStorage.setItem("token", "header.eyJpZCI6MSwicm9sZSI6ImN1c3RvbWVyIn0.signature");
    renderCart();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));
    await waitFor(() => expect(orderService.place).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/order placed/i)).toBeInTheDocument();
  });

  it("redirects guests to login when placing order", async () => {
    localStorage.clear();
    localStorage.setItem(
      "guest_cart_v1",
      JSON.stringify([{ productId: 101, name: "Phone", unitPrice: 100, stock: 5, quantity: 2 }]),
    );
    renderCart();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /place order/i }));

    await waitFor(() => expect(screen.getByText("Login page")).toBeInTheDocument());
    expect(orderService.place).not.toHaveBeenCalled();
  });

  it("handles failed cart updates gracefully", async () => {
    vi.mocked(cartService.update).mockRejectedValue(new Error("Insufficient stock"));
    renderCart();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /increase phone quantity/i }));
    expect(await screen.findByText("Insufficient stock")).toBeInTheDocument();
  });
});
