import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { RequireAdmin } from "@/shared/auth/guards/RequireAdmin";
import { adminService } from "./adminService";
import { makeJwt } from "@/test/jwt";
import { ToastProvider } from "@/shared/ui/toast/ToastProvider";

vi.mock("./adminService", () => ({
  adminService: {
    listCategories: vi.fn(),
    createCategory: vi.fn(),
  },
}));

function renderAdminCategories() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/admin/categories"]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("AdminCategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));
    vi.mocked(adminService.listCategories).mockResolvedValue([
      { id: 1, name: "Electronics", createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
    vi.mocked(adminService.createCategory).mockResolvedValue({
      id: 2,
      name: "Accessories",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("renders categories and supports create with validation", async () => {
    renderAdminCategories();
    expect(await screen.findByText("Electronics")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "A" } });
    fireEvent.click(screen.getByRole("button", { name: /save category/i }));
    await waitFor(() => expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Accessories" } });
    fireEvent.click(screen.getByRole("button", { name: /save category/i }));
    await waitFor(() =>
      expect(adminService.createCategory).toHaveBeenCalledWith({ name: "Accessories" }),
    );
    expect(screen.getByText(/category created/i)).toBeInTheDocument();
  });

  it("paginates categories list", async () => {
    vi.mocked(adminService.listCategories).mockResolvedValue([
      { id: 1, name: "Category 1", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 2, name: "Category 2", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 3, name: "Category 3", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 4, name: "Category 4", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 5, name: "Category 5", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 6, name: "Category 6", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 7, name: "Category 7", createdAt: "2026-01-01T00:00:00.000Z" },
    ]);

    renderAdminCategories();
    expect(await screen.findByText("Category 1")).toBeInTheDocument();
    expect(screen.queryByText("Category 7")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Category 7")).toBeInTheDocument();
    expect(screen.queryByText("Category 1")).not.toBeInTheDocument();
  });
});
