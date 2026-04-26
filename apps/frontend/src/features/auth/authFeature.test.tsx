import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RequireAuth } from "@/shared/auth/guards/RequireAuth";
import { RequireAdmin } from "@/shared/auth/guards/RequireAdmin";
import { RequireCustomer } from "@/shared/auth/guards/RequireCustomer";
import { RequireGuestOrCustomer } from "@/shared/auth/guards/RequireGuestOrCustomer";
import { authService } from "@/features/auth/authService";
import { makeJwt } from "@/test/jwt";

vi.mock("@/features/auth/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe("auth feature", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("handles login success for customer", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: makeJwt({ id: 1, role: "customer" }),
    });

    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/products" element={<div>Products page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText("Products page")).toBeInTheDocument());
  });

  it("handles login failure", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });

  it("enforces registration validation", async () => {
    render(
      <MemoryRouter initialEntries={["/auth/register"]}>
        <Routes>
          <Route path="/auth/register" element={<RegisterPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "B" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("redirects to login after successful registration", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      id: 7,
      email: "new@shop.com",
      role: "customer",
    });

    render(
      <MemoryRouter initialEntries={["/auth/register"]}>
        <Routes>
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@shop.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "New" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "User" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText("Login page")).toBeInTheDocument());
  });

  it("enforces route guard behavior for unauthenticated users", () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/cart" element={<div>Cart page</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("enforces role-aware behavior for admin routes", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "customer" }));

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<div>Admin page</div>} />
          </Route>
          <Route path="/products" element={<div>Products page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Products page")).toBeInTheDocument();
  });

  it("enforces role-aware behavior for customer routes", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));

    render(
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route element={<RequireCustomer />}>
            <Route path="/products" element={<div>Products page</div>} />
          </Route>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin page")).toBeInTheDocument();
  });

  it("blocks admin users from guest/customer product routes", () => {
    localStorage.setItem("token", makeJwt({ id: 1, role: "admin" }));

    render(
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route element={<RequireGuestOrCustomer />}>
            <Route path="/products" element={<div>Products page</div>} />
          </Route>
          <Route path="/admin" element={<div>Admin page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin page")).toBeInTheDocument();
  });

  it("opens /admin in a new tab for admin login", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: makeJwt({ id: 99, role: "admin" }),
    });

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/products" element={<div>Products page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@shop.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("/admin", "_blank", "noopener,noreferrer");
      expect(screen.getByText("Products page")).toBeInTheDocument();
    });
  });
});

