import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "@/shared/auth/guards/RequireAdmin";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { adminService } from "./adminService";
import { makeJwt } from "@/test/jwt";
import { ToastProvider } from "@/shared/ui/toast/ToastProvider";

vi.mock("./adminService", () => ({
  adminService: {
    listProducts: vi.fn(),
    listCategories: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

function renderAdminProducts(path = "/admin/products") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin/products" element={<AdminProductsPage />} />
            </Route>
            <Route path="/auth/login" element={<div>Login Page</div>} />
            <Route path="/products" element={<div>Products Page</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const categories = [
  { id: 1, name: "Electronics", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: 2, name: "Accessories", createdAt: "2026-01-01T00:00:00.000Z" },
];

const productsPage = {
  items: [
    {
      id: 10,
      name: "Phone X",
      description: "Flagship",
      price: 699.99,
      stock: 5,
      categoryId: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
};

describe("AdminProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));
    vi.mocked(adminService.listProducts).mockResolvedValue(productsPage);
    vi.mocked(adminService.listCategories).mockResolvedValue(categories);
    vi.mocked(adminService.createProduct).mockResolvedValue(productsPage.items[0]);
    vi.mocked(adminService.updateProduct).mockResolvedValue(productsPage.items[0]);
    vi.mocked(adminService.deleteProduct).mockResolvedValue(null);
  });

  it("blocks non-admin access", () => {
    localStorage.setItem("token", makeJwt({ id: 2, role: "customer" }));
    renderAdminProducts();
    expect(screen.getByText("Products Page")).toBeInTheDocument();
  });

  it("renders products list and category assignment", async () => {
    renderAdminProducts();
    expect(await screen.findByText("Phone X")).toBeInTheDocument();
    expect(screen.getByText("Flagship")).toBeInTheDocument();
    expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
  });

  it("shows loading and error states", async () => {
    vi.mocked(adminService.listProducts).mockImplementation(() => new Promise(() => {}));
    renderAdminProducts();
    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
  });

  it("validates product form and prevents invalid submit", async () => {
    renderAdminProducts();
    await screen.findByText("Phone X");
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "-1" } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument());
    expect(adminService.createProduct).not.toHaveBeenCalled();
  });

  it("prevents submit when price or stock is negative", async () => {
    renderAdminProducts();
    await screen.findByText("Phone X");
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Phone Z" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "-0.01" } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: "-1" } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => {
      expect(screen.getByText(/price must be 0 or greater/i)).toBeInTheDocument();
      expect(screen.getByText(/stock must be 0 or greater/i)).toBeInTheDocument();
    });
    expect(adminService.createProduct).not.toHaveBeenCalled();
  });

  it("allows a price of 0", async () => {
    renderAdminProducts();
    await screen.findByText("Phone X");
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Free Sample" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() =>
      expect(adminService.createProduct).toHaveBeenCalledWith({
        name: "Free Sample",
        description: "",
        price: 0,
        stock: 1,
        categoryId: 1,
      }),
    );
  });

  it("creates, edits and deletes product with success feedback", async () => {
    renderAdminProducts();
    await screen.findByText("Phone X");
    fireEvent.click(screen.getByRole("button", { name: /create product/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Phone Z" } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: "799.99" } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() =>
      expect(adminService.createProduct).toHaveBeenCalledWith({
        name: "Phone Z",
        description: "",
        price: 799.99,
        stock: 7,
        categoryId: 2,
      }),
    );
    expect(screen.getByText(/product created/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit phone x/i }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Phone X2" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(adminService.updateProduct).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /delete phone x/i }));
    await waitFor(() => expect(adminService.deleteProduct).toHaveBeenCalledWith(10));
  });

  it("paginates product listing", async () => {
    vi.mocked(adminService.listProducts).mockImplementation(async (params) => {
      if (params.page === 2) {
        return {
          items: [
            {
              id: 11,
              name: "Tablet Z",
              description: "New tablet",
              price: 499.99,
              stock: 6,
              categoryId: 2,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          page: 2,
          limit: 10,
          total: 11,
        };
      }

      return {
        items: productsPage.items,
        page: 1,
        limit: 10,
        total: 11,
      };
    });

    renderAdminProducts();
    expect(await screen.findByText("Phone X")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(adminService.listProducts).toHaveBeenCalledWith({ page: 2, limit: 10 }));
  });
});

