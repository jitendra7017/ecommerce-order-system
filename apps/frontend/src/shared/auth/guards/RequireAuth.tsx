import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSession } from "../session";

export function RequireAuth() {
  const session = getSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
