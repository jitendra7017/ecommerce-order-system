import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { OrderHistoryPage } from "@/pages/OrderHistoryPage";
import { orderService } from "./orderService";

vi.mock("./orderService", () => ({
  orderService: { list: vi.fn() },
}));

function renderHistory() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Order history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    vi.mocked(orderService.list).mockImplementation(() => new Promise(() => {}));
    renderHistory();
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.mocked(orderService.list).mockRejectedValue(new Error("Internal server error"));
    renderHistory();
    expect(await screen.findByText("Internal server error")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    vi.mocked(orderService.list).mockResolvedValue({ items: [], page: 1, limit: 10, total: 0 });
    renderHistory();
    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();
  });

  it("lists orders with status and total", async () => {
    vi.mocked(orderService.list).mockResolvedValue({
      items: [
        {
          id: 10,
          userId: 1,
          status: "placed",
          totalAmount: 250,
          createdAt: "2026-01-01T00:00:00.000Z",
          items: [{ id: 1, orderId: 10, productId: 101, quantity: 2, unitPrice: 125 }],
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    });

    renderHistory();
    expect(await screen.findByText(/order #10/i)).toBeInTheDocument();
    expect(screen.getByText(/status: placed/i)).toBeInTheDocument();
    expect(screen.getByText(/placed at:/i)).toBeInTheDocument();
    expect(screen.getByText(/total: \$250/i)).toBeInTheDocument();
  });

  it("expands and collapses order items", async () => {
    vi.mocked(orderService.list).mockResolvedValue({
      items: [
        {
          id: 10,
          userId: 1,
          status: "placed",
          totalAmount: 250,
          createdAt: "2026-01-01T00:00:00.000Z",
          items: [{ id: 1, orderId: 10, productId: 101, quantity: 2, unitPrice: 125 }],
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    });

    renderHistory();
    await screen.findByText(/order #10/i);

    const toggleButton = screen.getByRole("button", { name: /view items for order 10/i });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);
    expect(screen.getByText(/product 101/i)).toBeInTheDocument();
    expect(screen.getByText(/qty 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide items for order 10/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /hide items for order 10/i }));
    expect(screen.queryByText(/product 101/i)).not.toBeInTheDocument();
  });

  it("supports pagination navigation", async () => {
    vi.mocked(orderService.list)
      .mockResolvedValueOnce({
        items: [
          {
            id: 11,
            userId: 1,
            status: "placed",
            totalAmount: 125,
            createdAt: "2026-01-02T00:00:00.000Z",
            items: [{ id: 2, orderId: 11, productId: 111, quantity: 1, unitPrice: 125 }],
          },
        ],
        page: 1,
        limit: 10,
        total: 11,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 10,
            userId: 1,
            status: "placed",
            totalAmount: 250,
            createdAt: "2026-01-01T00:00:00.000Z",
            items: [{ id: 1, orderId: 10, productId: 101, quantity: 2, unitPrice: 125 }],
          },
        ],
        page: 2,
        limit: 10,
        total: 11,
      });

    renderHistory();
    await screen.findByText(/order #11/i);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText(/order #10/i)).toBeInTheDocument();

    expect(orderService.list).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
  });
});
