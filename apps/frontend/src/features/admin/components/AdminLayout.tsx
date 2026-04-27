import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSession } from "@/shared/auth/session";
import { clearToken } from "@/shared/auth/tokenStorage";

export function AdminLayout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const fullName = [session?.claims.firstName, session?.claims.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = fullName || "admin";
  const badgeText = session?.claims.firstName?.trim().charAt(0).toUpperCase() || "A";

  const onLogout = () => {
    clearToken();
    queryClient.clear();
    navigate("/auth/login", { replace: true, state: { from: location.pathname } });
  };

  return (
    <div className="admin-shell">
      <header className="panel">
        <div className="admin-header-top">
          <h1 className="panel-title admin-title">Admin Panel</h1>
          <div className="admin-header-actions">
            <details className="profile-menu">
              <summary
                className="profile-badge"
                aria-label="Profile menu"
                data-testid="profile-menu-trigger"
              >
                <span aria-hidden="true">{badgeText}</span>
              </summary>
              <div className="profile-menu-card">
                <p className="profile-menu-label">Signed in as {displayName}</p>
                <button type="button" className="btn btn-secondary" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </details>
          </div>
        </div>
        <p className="muted admin-subtitle">Manage catalog, categories, and inventory.</p>
      </header>

      <nav aria-label="Admin navigation" className="app-nav">
        <NavLink
          to="/admin/products"
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
        >
          Categories
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
