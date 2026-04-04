import type { LocaleKey } from "./locales";
import { LOCALES } from "./locales";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");
const withProtocol = (value: string) =>
  /^[a-z][a-z0-9+\-.]*:\/\//i.test(value) ? value : `https://${value}`;

const parseConfiguredOrigin = (value: string | undefined): string | null => {
  const configured = (value || "").trim();
  if (!configured) {
    return null;
  }

  try {
    const parsed = new URL(withProtocol(configured));
    if (LOCAL_HOSTS.has(parsed.hostname)) {
      return null;
    }
    return normalizeOrigin(parsed.origin);
  } catch {
    return null;
  }
};

const requestHeaderOrigin = (headers?: Headers): string | null => {
  if (!headers) {
    return null;
  }

  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headers.get("host")?.split(",")[0]?.trim();
  if (!host) {
    return null;
  }

  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || "https";
  return parseConfiguredOrigin(`${protocol}://${host}`);
};

export const siteOrigin = (requestUrl?: URL, requestHeaders?: Headers): string => {
  const vercelProductionOrigin = parseConfiguredOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProductionOrigin) {
    return vercelProductionOrigin;
  }

  const vercelDeploymentOrigin = parseConfiguredOrigin(process.env.VERCEL_URL);
  if (vercelDeploymentOrigin) {
    return vercelDeploymentOrigin;
  }

  const requestOrigin = requestHeaderOrigin(requestHeaders);
  if (requestOrigin) {
    return requestOrigin;
  }

  const configured = parseConfiguredOrigin(import.meta.env.PUBLIC_SITE_URL);
  if (configured) {
    return configured;
  }

  if (requestUrl && !LOCAL_HOSTS.has(requestUrl.hostname)) {
    return normalizeOrigin(requestUrl.origin);
  }

  return "http://localhost:4321";
};

export const absoluteUrl = (path: string, requestUrl?: URL, requestHeaders?: Headers): string => {
  const origin = siteOrigin(requestUrl, requestHeaders);
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
