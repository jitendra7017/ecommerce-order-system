import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const AuthPage = () => {
  const { login, register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h2>Auth</h2>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => register(email, password)} disabled={loading}>
        Register
      </button>
      <button onClick={() => login(email, password)} disabled={loading}>
        Login
      </button>
    </div>
  );
};
