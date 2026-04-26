import type { JwtExpiresIn } from "@repo/auth";

export interface BackendEnv {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: JwtExpiresIn;
  port: number;
  corsAllowedOrigins: string[];
  authRateLimitWindowMs: number;
  authRateLimitMax: number;
}

const getRequiredEnv = (source: NodeJS.ProcessEnv, key: string): string => {
  const value = source[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnv = (source: NodeJS.ProcessEnv, key: string): string | undefined => {
  const value = source[key];
  return value && value.trim().length > 0 ? value : undefined;
};

const toPort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return parsed;
};

const toPositiveInt = (value: string | undefined, fallback: number, key: string): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${key} value: ${value}`);
  }
  return parsed;
};

const toAllowedOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const loadBackendEnv = (source: NodeJS.ProcessEnv): BackendEnv => ({
  databaseUrl: getRequiredEnv(source, "DATABASE_URL"),
  jwtSecret: getRequiredEnv(source, "JWT_SECRET"),
  jwtExpiresIn: (source.JWT_EXPIRES_IN ?? "7d") as JwtExpiresIn,
  port: toPort(getOptionalEnv(source, "PORT"), 4000),
  corsAllowedOrigins: toAllowedOrigins(getOptionalEnv(source, "CORS_ALLOWED_ORIGINS")),
  authRateLimitWindowMs: toPositiveInt(getOptionalEnv(source, "AUTH_RATE_LIMIT_WINDOW_MS"), 15 * 60 * 1000, "AUTH_RATE_LIMIT_WINDOW_MS"),
  authRateLimitMax: toPositiveInt(getOptionalEnv(source, "AUTH_RATE_LIMIT_MAX"), 50, "AUTH_RATE_LIMIT_MAX"),
});
