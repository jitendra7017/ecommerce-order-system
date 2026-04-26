import type { USER_ROLES } from "@repo/constants";
import type { MessageKey } from "../i18n/translate.js";
import type { SupportedLanguage } from "../i18n/messages.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: (typeof USER_ROLES)[keyof typeof USER_ROLES];
      };
      language?: SupportedLanguage;
      t: (key: MessageKey) => string;
    }
  }
}

export {};
