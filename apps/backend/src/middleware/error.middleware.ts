import type { NextFunction, Request, Response } from "express";
import { AppError, ERROR_CODE } from "@repo/errors";
import { HTTP_STATUS } from "../constants/http-status.js";
import { errorMap } from "../constants/error-map.js";
import { defaultLanguage } from "../i18n/messages.js";
import { type MessageKey, translate } from "../i18n/translate.js";
import { sendError } from "../lib/http-response.js";

const isPrismaNotFoundError = (err: unknown): err is { code: string } =>
  typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2025";

const resolveMessage = (req: Request, key: MessageKey): string =>
  typeof req.t === "function" ? req.t(key) : translate(defaultLanguage, key);

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Prisma "record not found" (e.g. update/delete by unique key that doesn't exist)
  if (isPrismaNotFoundError(err)) {
    return sendError(res, HTTP_STATUS.NOT_FOUND, resolveMessage(req, "COMMON.NOT_FOUND"));
  }

  if (err instanceof AppError) {
    const mapped = errorMap[err.code];
    return sendError(res, mapped.statusCode, resolveMessage(req, mapped.messageKey));
  }
  const fallback = errorMap[ERROR_CODE.INTERNAL_SERVER_ERROR];
  return sendError(res, fallback.statusCode, resolveMessage(req, fallback.messageKey));
};
