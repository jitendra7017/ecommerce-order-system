import type { NextFunction, Request, Response } from "express";
import { defaultLanguage, type SupportedLanguage } from "../i18n/messages.js";
import { translate, type MessageKey } from "../i18n/translate.js";

const pickLanguage = (headerValue?: string): SupportedLanguage => {
  if (!headerValue) return defaultLanguage;
  const normalized = headerValue.split(",")[0]?.trim().toLowerCase();
  if (normalized.startsWith("hi")) return "hi";
  return "en";
};

export const i18nMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const language = pickLanguage(req.header("accept-language"));
  req.language = language;
  req.t = (key: MessageKey) => translate(language, key);
  next();
};
