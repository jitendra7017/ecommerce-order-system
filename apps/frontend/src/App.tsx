import { Link, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { ProductListPage } from "./pages/ProductListPage";
import { CartPage } from "./pages/CartPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";

export const App = () => (
  <div style={{ fontFamily: "sans-serif", padding: 16 }}>
    <h1>E-commerce Order System</h1>
    <nav style={{ display: "flex", gap: 12 }}>
      <Link to="/">Auth</Link>
      <Link to="/products">Products</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/orders">Orders</Link>
    </nav>
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrderHistoryPage />} />
    </Routes>
  </div>
);
