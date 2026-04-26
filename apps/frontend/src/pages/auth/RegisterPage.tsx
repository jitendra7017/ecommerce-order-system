import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/features/auth/authService";
import { registerSchema } from "@/features/auth/schemas";
import type { RegisterRequest } from "@/features/auth/types";
import { useToast } from "@/shared/ui/toast/ToastProvider";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const fromPath = typeof location.state === "object" && location.state !== null ? (location.state as { from?: string }).from : undefined;
  const nextPath = fromPath && fromPath.startsWith("/") ? fromPath : "/products";

  const onSubmit = async (values: RegisterRequest) => {
    try {
      await authService.register(values);
      toast.success("Account created successfully. Please sign in to continue.");
      navigate("/auth/login", { replace: true, state: { from: nextPath } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError("root", { message });
    }
  };

  return (
    <section className="auth-wrap">
      <form onSubmit={handleSubmit(onSubmit)} aria-label="register-form" noValidate className="panel auth-panel">
        <p className="auth-kicker">Get started</p>
        <h2 className="panel-title auth-title">Create your account</h2>
        <p className="auth-subtitle">Join to place orders faster and track delivery status in one place.</p>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="register-first-name">First name</label>
            <input id="register-first-name" type="text" className="input" {...register("firstName")} />
            {errors.firstName?.message ? <p className="form-error">{errors.firstName.message}</p> : null}
          </div>

          <div className="form-field">
            <label htmlFor="register-last-name">Last name</label>
            <input id="register-last-name" type="text" className="input" {...register("lastName")} />
            {errors.lastName?.message ? <p className="form-error">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input id="register-email" type="email" className="input" {...register("email")} />
          {errors.email?.message ? <p className="form-error">{errors.email.message}</p> : null}
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" type="password" className="input" {...register("password")} />
          {errors.password?.message ? <p className="form-error">{errors.password.message}</p> : null}
        </div>

        {errors.root?.message ? <p className="form-error">{errors.root.message}</p> : null}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary auth-submit">
          Create account
        </button>

        <p className="auth-footer-note">
          Already have an account?{" "}
          <Link to="/auth/login" state={{ from: nextPath }} className="auth-text-link">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}

