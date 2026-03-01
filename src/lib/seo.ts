import type { LocaleKey } from "./locales";
import { LOCALES } from "./locales";

export const siteOrigin = () => import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321";

export const absoluteUrl = (path: string): string => {
  const origin = siteOrigin().replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

export const hreflangFromLocale = (locale: LocaleKey) => {
  const [lang, region] = locale.split("-");
  return `${lang}-${region.toUpperCase()}`;
};

export const defaultHreflangs = (resolver: (locale: LocaleKey) => string) =>
  LOCALES.map((locale) => ({
    hrefLang: hreflangFromLocale(locale.key),
    href: absoluteUrl(resolver(locale.key)),
  }));
