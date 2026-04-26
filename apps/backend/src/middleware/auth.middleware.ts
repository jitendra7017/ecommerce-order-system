import type { NextFunction, Request, Response } from "express";
import { extractBearerToken } from "@repo/auth";
import { AppError, ERROR_CODE } from "@repo/errors";
import { USER_ROLES } from "@repo/constants";
import { decodeAccessToken } from "../lib/jwt.js";
import { authRepository } from "../modules/auth/auth.repository.js";

type JwtPayload = { id: number; role: (typeof USER_ROLES)[keyof typeof USER_ROLES] };
type JwtPayloadWithName = JwtPayload & { firstName?: string; lastName?: string };

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.header("Authorization"));
  if (!token) {
    return next(new AppError(ERROR_CODE.UNAUTHORIZED));
  }

  try {
    const claims = decodeAccessToken(token) as JwtPayloadWithName;
    const user = await authRepository.findById(claims.id);
    if (!user) {
      return next(new AppError(ERROR_CODE.UNAUTHORIZED));
    }
    req.user = claims;
    return next();
  } catch {
    return next(new AppError(ERROR_CODE.UNAUTHORIZED));
  }
};

export const roleGuard =
  (role: (typeof USER_ROLES)[keyof typeof USER_ROLES]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return next(new AppError(ERROR_CODE.FORBIDDEN));
    }
    return next();
  };
