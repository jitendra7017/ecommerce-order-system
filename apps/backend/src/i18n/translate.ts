import { defaultLanguage, messages, type SupportedLanguage } from "./messages.js";

export type MessageKey = `${keyof (typeof messages)["en"]}.${string}`;

const resolveNested = (obj: Record<string, unknown>, path: string): string | null => {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) return null;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : null;
};

export const translate = (lang: string | undefined, key: MessageKey): string => {
  const safeLang: SupportedLanguage =
    lang && lang in messages ? (lang as SupportedLanguage) : defaultLanguage;
  return resolveNested(messages[safeLang] as unknown as Record<string, unknown>, key) ?? key;
};
