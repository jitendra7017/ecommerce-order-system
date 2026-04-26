import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductListPage } from "@/pages/ProductListPage";
import { productService } from "@/features/products/productService";
import { categoryService } from "@/features/categories/categoryService";
import { cartService } from "@/features/cart/cartService";
import { guestCartService } from "@/features/cart/guestCartService";
import { ToastProvider } from "@/shared/ui/toast/ToastProvider";

vi.mock("@/features/products/productService", () => ({
  productService: { list: vi.fn() },
}));

vi.mock("@/features/categories/categoryService", () => ({
  categoryService: { list: vi.fn() },
}));

vi.mock("@/features/cart/cartService", () => ({
  cartService: { add: vi.fn() },
}));

vi.mock("@/features/cart/guestCartService", () => ({
  guestCartService: { add: vi.fn() },
}));

function renderPage(initialPath = "/products") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/products" element={<ProductListPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("Product listing feature", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(categoryService.list).mockResolvedValue([
      { id: 1, name: "Category A", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 2, name: "Category B", createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
  });

  it("renders loading and products with stock status", async () => {
    // eslint-disable-next-line no-unused-vars
    let resolveList: (...args: [Awaited<ReturnType<typeof productService.list>>]) => void = () => {};
    vi.mocked(productService.list).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    renderPage();
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();

    resolveList({
      items: [
        {
          id: 1,
          name: "Phone",
          description: "Flagship mobile device",
          price: 100,
          stock: 5,
          categoryId: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          name: "Laptop",
          description: null,
          price: 200,
          stock: 0,
          categoryId: 2,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      page: 1,
      limit: 12,
      total: 2,
    });
    expect(await screen.findByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Flagship mobile device")).toBeInTheDocument();
    expect(screen.getByText("In stock (5)")).toBeInTheDocument();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("uses URL query params for search and category filter", async () => {
    vi.mocked(productService.list).mockResolvedValue({ items: [], page: 1, limit: 12, total: 0 });

    renderPage("/products?search=phone&categoryId=2");

    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith({
        search: "phone",
        categoryId: 2,
        page: 1,
        limit: 12,
      }),
    );
  });

  it("updates results on search and category change", async () => {
    vi.mocked(productService.list).mockResolvedValue({ items: [], page: 1, limit: 12, total: 0 });

    renderPage();
    await waitFor(() => expect(productService.list).toHaveBeenCalledTimes(1));

    fireEvent.change(await screen.findByLabelText(/search/i), { target: { value: "phone" } });
    fireEvent.change(await screen.findByLabelText(/category/i), { target: { value: "2" } });

    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith({
        search: "phone",
        categoryId: 2,
        page: 1,
        limit: 12,
      }),
    );
  });

  it("handles add to cart action", async () => {
    localStorage.setItem("token", "header.eyJpZCI6MSwicm9sZSI6ImN1c3RvbWVyIn0.signature");
    vi.mocked(productService.list).mockResolvedValue({
      items: [
        {
          id: 1,
          name: "Phone",
          description: null,
          price: 100,
          stock: 5,
          categoryId: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      page: 1,
      limit: 12,
      total: 1,
    });
    vi.mocked(cartService.add).mockResolvedValue({ id: 1, cartId: 1, productId: 1, quantity: 1 });

    renderPage();
    await screen.findByText("Phone");

    fireEvent.click(screen.getByRole("button", { name: /add phone to cart/i }));

    await waitFor(() => expect(cartService.add).toHaveBeenCalledWith({ productId: 1, quantity: 1 }));
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
  });

  it("adds to guest cart when not signed in", async () => {
    localStorage.clear();
    vi.mocked(productService.list).mockResolvedValue({
      items: [
        {
          id: 7,
          name: "Headphones",
          description: null,
          price: 59,
          stock: 8,
          categoryId: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      page: 1,
      limit: 12,
      total: 1,
    });
    vi.mocked(guestCartService.add).mockResolvedValue(undefined);

    renderPage();
    await screen.findByText("Headphones");

    fireEvent.click(screen.getByRole("button", { name: /add headphones to cart/i }));

    await waitFor(() =>
      expect(guestCartService.add).toHaveBeenCalledWith({
        productId: 7,
        name: "Headphones",
        unitPrice: 59,
        stock: 8,
      }),
    );
    expect(cartService.add).not.toHaveBeenCalled();
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.mocked(productService.list).mockRejectedValue(new Error("Internal server error"));

    renderPage();

    expect(await screen.findByText("Internal server error")).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    vi.mocked(productService.list).mockResolvedValue({ items: [], page: 1, limit: 12, total: 0 });

    renderPage();

    expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
  });

  it("supports pagination navigation", async () => {
    vi.mocked(productService.list)
      .mockResolvedValueOnce({
        items: [
          {
            id: 1,
            name: "Phone",
            description: null,
            price: 100,
            stock: 5,
            categoryId: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        page: 1,
        limit: 12,
        total: 13,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 2,
            name: "Tablet",
            description: null,
            price: 300,
            stock: 3,
            categoryId: 1,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        page: 2,
        limit: 12,
        total: 13,
      });

    renderPage();
    await screen.findByText("Phone");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText("Tablet")).toBeInTheDocument();
    await waitFor(() =>
      expect(productService.list).toHaveBeenCalledWith({
        search: undefined,
        categoryId: undefined,
        page: 2,
        limit: 12,
      }),
    );
  });
});

