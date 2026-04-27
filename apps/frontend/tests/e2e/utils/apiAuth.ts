import { request } from "@playwright/test";
import type { ApiResponse, AuthResponse } from "@repo/api-contracts";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:4000/api";

export async function apiRegister(email: string, password: string): Promise<void> {
  const ctx = await request.newContext({ baseURL: API_URL });
  const res = await ctx.post("/auth/register", { data: { email, password } });
  await ctx.dispose();
  if (!res.ok()) {
    throw new Error(`API register failed: ${res.status()} ${res.statusText()}`);
  }
}

export async function apiLogin(email: string, password: string): Promise<string> {
  const ctx = await request.newContext({ baseURL: API_URL });
  const res = await ctx.post("/auth/login", { data: { email, password } });
  const json = (await res.json()) as ApiResponse<AuthResponse>;
  await ctx.dispose();

  if (!res.ok()) {
    throw new Error(`API login failed: ${res.status()} ${res.statusText()}`);
  }

  const token = json?.data?.token;
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("API login response missing data.token");
  }
  return token;
}
