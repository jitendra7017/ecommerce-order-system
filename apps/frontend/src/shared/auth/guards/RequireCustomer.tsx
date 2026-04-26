import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSession } from "../session";

export function RequireCustomer() {
  const session = getSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (session.claims.role !== "customer") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
