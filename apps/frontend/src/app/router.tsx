import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { ProductListPage } from "../pages/ProductListPage";
import { CartPage } from "../pages/CartPage";
import { OrderHistoryPage } from "../pages/OrderHistoryPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { RequireAdmin } from "../shared/auth/guards/RequireAdmin";
import { RequireCustomer } from "../shared/auth/guards/RequireCustomer";
import { RequireGuestOrCustomer } from "../shared/auth/guards/RequireGuestOrCustomer";
import { AdminLayout } from "../features/admin/components/AdminLayout";
import { AppShell } from "./layout/AppShell";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/products" replace /> },
  {
    element: <AppShell />,
    children: [
      { path: "/auth/login", element: <LoginPage /> },
      { path: "/auth/register", element: <RegisterPage /> },
      {
        element: <RequireGuestOrCustomer />,
        children: [{ path: "/products", element: <ProductListPage /> }],
      },
      {
        element: <RequireCustomer />,
        children: [
          { path: "/cart", element: <CartPage /> },
          { path: "/orders", element: <OrderHistoryPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/products" replace /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
