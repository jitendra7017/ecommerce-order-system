import { useState } from "react";
import { authApi } from "../api/endpoints";
import { setToken } from "../shared/auth/tokenStorage";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authApi.register(email, password);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.data.data.token);
    } finally {
      setLoading(false);
    }
  };

  return { loading, register, login };
};
