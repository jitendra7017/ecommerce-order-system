import { getToken } from "./tokenStorage";

export type SessionClaims = {
  id: number;
  role: "admin" | "customer";
  firstName?: string;
  lastName?: string;
};

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

export function decodeJwtClaims(token: string): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as Partial<SessionClaims>;
    if (typeof payload.id !== "number") return null;
    if (payload.role !== "admin" && payload.role !== "customer") return null;
    return {
      id: payload.id,
      role: payload.role,
      firstName: typeof payload.firstName === "string" ? payload.firstName : undefined,
      lastName: typeof payload.lastName === "string" ? payload.lastName : undefined,
    };
  } catch {
    return null;
  }
}

export function getSession(): { token: string; claims: SessionClaims } | null {
  const token = getToken();
  if (!token) return null;
  const claims = decodeJwtClaims(token);
  if (!claims) return null;
  return { token, claims };
}

