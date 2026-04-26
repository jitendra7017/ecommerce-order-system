import { hashPassword, verifyPassword } from "@repo/auth";
import type { LoginRequest, RegisterRequest } from "@repo/api-contracts";
import { AppError, ERROR_CODE } from "@repo/errors";
import { issueAccessToken } from "../../lib/jwt.js";
import { authRepository } from "./auth.repository.js";

export const authService = {
  async register(payload: RegisterRequest) {
    const email = payload.email.trim().toLowerCase();
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new AppError(ERROR_CODE.EMAIL_ALREADY_REGISTERED);
    const hash = await hashPassword(payload.password);
    const user = await authRepository.createUser({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email,
      password: hash,
    });
    return { id: user.id, email: user.email, role: user.role };
  },
  async login(payload: LoginRequest) {
    const email = payload.email.trim().toLowerCase();
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError(ERROR_CODE.INVALID_CREDENTIALS);
    const ok = await verifyPassword(payload.password, user.password);
    if (!ok) throw new AppError(ERROR_CODE.INVALID_CREDENTIALS);
    const token = issueAccessToken({
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    return { token };
  },
};
