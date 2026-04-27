import { beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RequireAdmin } from "@/shared/auth/guards/RequireAdmin";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { makeJwt } from "@/test/jwt";

function renderWithQueryProvider(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("admin shell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects unauthenticated users away from /admin", () => {
    localStorage.removeItem("token");

    renderWithQueryProvider(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<div>Admin Products</div>} />
            </Route>
          </Route>
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects customer users away from /admin", () => {
    localStorage.setItem("token", makeJwt({ id: 11, role: "customer" }));

    renderWithQueryProvider(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<div>Admin Products</div>} />
            </Route>
          </Route>
          <Route path="/products" element={<div>Products Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Products Page")).toBeInTheDocument();
  });

  it("renders admin layout and navigation for admin users", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));

    renderWithQueryProvider(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<div>Admin Products</div>} />
              <Route path="categories" element={<div>Admin Categories</div>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByTestId("profile-menu-trigger")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Products" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByText("Admin Products")).toBeInTheDocument();
  });

  it("highlights active admin navigation link", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));

    renderWithQueryProvider(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<div>Admin Products</div>} />
              <Route path="categories" element={<div>Admin Categories</div>} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Categories" })).not.toHaveAttribute("aria-current");
  });

  it("logs out admin and redirects to login", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));

    renderWithQueryProvider(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="products" element={<div>Admin Products</div>} />
            </Route>
          </Route>
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("profile-menu-trigger"));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
