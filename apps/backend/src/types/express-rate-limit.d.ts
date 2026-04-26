declare module "express-rate-limit" {
  import type { RequestHandler } from "express";

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    standardHeaders?: boolean | "draft-6" | "draft-7";
    legacyHeaders?: boolean;
    message?: unknown;
    [key: string]: unknown;
  }

  export default function rateLimit(options?: RateLimitOptions): RequestHandler;
}
