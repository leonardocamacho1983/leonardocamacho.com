import type { LocaleKey } from "./locales";
import { LOCALES } from "./locales";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

const parseConfiguredOrigin = (value: string | undefined): string | null => {
  const configured = (value || "").trim();
  if (!configured) {
    return null;
  }

  try {
    const parsed = new URL(configured);
    if (LOCAL_HOSTS.has(parsed.hostname)) {
      return null;
    }
    return normalizeOrigin(parsed.origin);
  } catch {
    return null;
  }
};

export const siteOrigin = (requestUrl?: URL): string => {
  const configured = parseConfiguredOrigin(import.meta.env.PUBLIC_SITE_URL);
  if (configured) {
    return configured;
  }

  if (requestUrl && !LOCAL_HOSTS.has(requestUrl.hostname)) {
    return normalizeOrigin(requestUrl.origin);
  }

  return "http://localhost:4321";
};

export const absoluteUrl = (path: string, requestUrl?: URL): string => {
  const origin = siteOrigin(requestUrl);
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

export const hreflangFromLocale = (locale: LocaleKey) => {
  const [lang, region] = locale.split("-");
  return `${lang}-${region.toUpperCase()}`;
};

export const defaultHreflangs = (resolver: (locale: LocaleKey) => string, requestUrl?: URL) =>
  LOCALES.map((locale) => ({
    hrefLang: hreflangFromLocale(locale.key),
    href: absoluteUrl(resolver(locale.key), requestUrl),
  }));
