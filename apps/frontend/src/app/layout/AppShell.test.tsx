import { describe, expect, it, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "./AppShell";
import { makeJwt } from "@/test/jwt";

function renderShell(initialPath = "/products") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/products" element={<div>Products page</div>} />
            <Route path="/auth/login" element={<div>Login page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows Login/Register when unauthenticated", () => {
    renderShell();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });

  it("logs out by clearing token and navigating to /auth/login", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "customer" }));
    renderShell();

    fireEvent.click(screen.getByTestId("profile-menu-trigger"));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("highlights the active navigation link", () => {
    renderShell("/products");
    expect(screen.getByRole("link", { name: /products/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /cart/i })).not.toHaveAttribute("aria-current");
  });
});

