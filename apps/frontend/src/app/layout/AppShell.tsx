import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken } from "@/shared/auth/tokenStorage";
import { getSession } from "@/shared/auth/session";

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const session = getSession();
  const fullName = [session?.claims.firstName, session?.claims.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || (session ? session.claims.role : "");
  const badgeText =
    session?.claims.firstName?.trim().charAt(0).toUpperCase() || (session?.claims.role === "admin" ? "A" : "U");

  const onLogout = async () => {
    clearToken();
    queryClient.clear();
    navigate("/auth/login", { replace: true, state: { from: location.pathname } });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Welcome</p>
          <h1 className="app-title">E-commerce Order System</h1>
        </div>
      </header>

      <nav aria-label="Primary navigation" className="app-nav">
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
          Products
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
          Cart
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
          Orders
        </NavLink>
        <span className="nav-spacer" />
        {session ? (
          <details className="profile-menu">
            <summary className="profile-badge" aria-label="Profile menu" data-testid="profile-menu-trigger">
              <span aria-hidden="true">{badgeText}</span>
            </summary>
            <div className="profile-menu-card">
              <p className="profile-menu-label">Signed in as {displayName}</p>
              <button type="button" onClick={onLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </details>
        ) : (
          <>
            <Link to="/auth/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/auth/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

