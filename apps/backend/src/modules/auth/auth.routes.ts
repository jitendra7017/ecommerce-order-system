import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.types.js";
import { validate } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/async-handler.js";

const limiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again later.",
    data: null,
  },
});
export const authRouter = Router();

authRouter.post("/register", limiter, validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", limiter, validate(loginSchema), asyncHandler(authController.login));
