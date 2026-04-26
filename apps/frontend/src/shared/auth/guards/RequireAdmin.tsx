import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../session";

export function RequireAdmin() {
  const session = getSession();

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  if (session.claims.role !== "admin") {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}

