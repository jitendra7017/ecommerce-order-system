import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../session";

export function RequireGuestOrCustomer() {
  const session = getSession();

  if (!session) {
    return <Outlet />;
  }

  if (session.claims.role !== "customer") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
