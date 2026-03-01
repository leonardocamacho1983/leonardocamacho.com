import { DEFAULT_LOCALE, isLocale, type LocaleKey } from "@/lib/locales";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const getFormValue = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export const sanitizeText = (value: string, maxLength = 140): string =>
  value.replace(/\s+/g, " ").trim().slice(0, maxLength);

export const sanitizePath = (value: string): string => {
  const clean = sanitizeText(value, 240);
  return clean.startsWith("/") ? clean : "";
};

export const normalizeEmail = (value: string): string => sanitizeText(value.toLowerCase(), 254);

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value);

export const parseLocale = (value: string): LocaleKey => {
  const normalized = value.toLowerCase();
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
};

export const parseConsent = (value: string): boolean => {
  const normalized = value.toLowerCase();
  return normalized === "on" || normalized === "true" || normalized === "yes" || normalized === "1";
};

export const getClientIp = (headers: Headers): string => {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
};

export const isRateLimited = (key: string, maxHits: number, windowMs: number): boolean => {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  if (rateLimitStore.size > 500) {
    for (const [entryKey, entryValue] of rateLimitStore.entries()) {
      if (entryValue.resetAt <= now) {
        rateLimitStore.delete(entryKey);
      }
    }
  }

  return current.count > maxHits;
};

export const sanitizeOptionalNumber = (value: string): string | undefined => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }
  return String(parsed);
};
