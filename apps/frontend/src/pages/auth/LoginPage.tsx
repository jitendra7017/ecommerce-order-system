import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/features/auth/authService";
import { cartService } from "@/features/cart/cartService";
import { guestCartService } from "@/features/cart/guestCartService";
import { loginSchema } from "@/features/auth/schemas";
import type { LoginRequest } from "@/features/auth/types";
import { setToken } from "@/shared/auth/tokenStorage";
import { decodeJwtClaims } from "@/shared/auth/session";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const fromPath = typeof location.state === "object" && location.state !== null ? (location.state as { from?: string }).from : undefined;
  const nextPath = fromPath && fromPath.startsWith("/") ? fromPath : "/products";

  const onSubmit = async (values: LoginRequest) => {
    try {
      const { token } = await authService.login(values);
      setToken(token);

      const claims = decodeJwtClaims(token);
      if (claims?.role === "customer") {
        const guestItems = guestCartService.listItems();
        await Promise.all(guestItems.map((item) => cartService.add({ productId: item.productId, quantity: item.quantity })));
        if (guestItems.length > 0) {
          guestCartService.clear();
        }
      }

      if (claims?.role === "admin") {
        window.open("/admin", "_blank", "noopener,noreferrer");
      }

      navigate(nextPath, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError("root", { message });
    }
  };

  return (
    <section className="auth-wrap">
      <form onSubmit={handleSubmit(onSubmit)} aria-label="login-form" noValidate className="panel auth-panel">
        <p className="auth-kicker">Welcome back</p>
        <h2 className="panel-title auth-title">Login</h2>
        <p className="auth-subtitle">Sign in to continue shopping and track your orders.</p>

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" className="input" {...register("email")} />
          {errors.email?.message ? <p className="form-error">{errors.email.message}</p> : null}
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" className="input" {...register("password")} />
          {errors.password?.message ? <p className="form-error">{errors.password.message}</p> : null}
        </div>

        {errors.root?.message ? <p className="form-error">{errors.root.message}</p> : null}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary auth-submit">
          Sign in
        </button>

        <p className="auth-footer-note">
          New here?{" "}
          <Link to="/auth/register" state={{ from: nextPath }} className="auth-text-link">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}

