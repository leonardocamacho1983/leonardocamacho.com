import crypto from "node:crypto";
import { isLocale, type LocaleKey } from "@/lib/locales";
import { isValidEmail } from "./validation";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24;

export interface NewsletterStatePayload {
  email: string;
  locale: LocaleKey;
  issuedAt: number;
  expiresAt: number;
}

export interface SubscriberUpdateTokenPayload {
  subscriberId: string;
  issuedAt: number;
  expiresAt: number;
}

const getSecret = (): string => import.meta.env.NEWSLETTER_FLOW_SECRET || "";

export const hasNewsletterStateTokenSecret = (): boolean => Boolean(getSecret());

const toBase64Url = (input: string): string => Buffer.from(input, "utf8").toString("base64url");
const fromBase64Url = (input: string): string => Buffer.from(input, "base64url").toString("utf8");

const sign = (encodedPayload: string): string =>
  crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");

export const createNewsletterStateToken = (params: {
  email: string;
  locale: LocaleKey;
  ttlMs?: number;
}): string => {
  const now = Date.now();
  const payload: NewsletterStatePayload = {
    email: params.email,
    locale: params.locale,
    issuedAt: now,
    expiresAt: now + (params.ttlMs || DEFAULT_TTL_MS),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const createSubscriberUpdateToken = (params: {
  subscriberId: string;
  ttlMs?: number;
}): string => {
  const now = Date.now();
  const payload: SubscriberUpdateTokenPayload = {
    subscriberId: params.subscriberId,
    issuedAt: now,
    expiresAt: now + (params.ttlMs || 1000 * 60 * 30),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyNewsletterStateToken = (token: string): NewsletterStatePayload | null => {
  if (!token || !getSecret()) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const signatureMatches = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  if (!signatureMatches) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as NewsletterStatePayload;
    if (!isValidEmail(parsed.email) || !isLocale(parsed.locale)) {
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const verifySubscriberUpdateToken = (
  token: string,
  expectedSubscriberId: string,
): SubscriberUpdateTokenPayload | null => {
  if (!token || !expectedSubscriberId || !getSecret()) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const signatureMatches = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  if (!signatureMatches) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as SubscriberUpdateTokenPayload;
    if (!parsed.subscriberId || parsed.subscriberId !== expectedSubscriberId) {
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};
