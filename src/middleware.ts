import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LOCALE, isLocale, type LocaleKey } from "@/lib/locales";

const LOCALE_COOKIE = "lc_locale";

const COUNTRY_TO_LOCALE: Record<string, LocaleKey> = {
  // English (UK style)
  GB: "en-gb",
  IE: "en-gb",

  // English (US style)
  US: "en-us",
  AU: "en-us",
  NZ: "en-us",
  IN: "en-us",
  ZA: "en-us",

  // French-speaking
  FR: "fr-fr",
  BE: "fr-fr",
  CH: "fr-fr",
  LU: "fr-fr",
  MC: "fr-fr",
  CA: "fr-fr",

  // Portuguese (Brazil)
  BR: "pt-br",

  // Portuguese (Portugal)
  PT: "pt-pt",
  AO: "pt-pt",
  MZ: "pt-pt",
  CV: "pt-pt",
  GW: "pt-pt",
  ST: "pt-pt",
  TL: "pt-pt",
};

const EXEMPT_PREFIXES = ["/api", "/_astro", "/_vercel", "/og", "/studio"];
const EXEMPT_EXACT = new Set(["/robots.txt", "/llms.txt", "/sitemap.xml", "/favicon.ico"]);
const FILE_EXTENSION_RE = /\.[a-z0-9]+$/i;

const EXACT_ALIASES = new Set([
  "/",
  "/about",
  "/privacy",
  "/writing",
  "/launch",
  "/launch/archive",
  "/newsletter/thanks",
  "/newsletter/unsubscribed",
]);

const getFirstPathSegment = (pathname: string): string => pathname.split("/").filter(Boolean)[0] || "";

const parseAcceptLanguage = (header: string | null): LocaleKey | null => {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((raw) => {
      const [langRaw, ...params] = raw.trim().toLowerCase().split(";");
      const qParam = params.find((item) => item.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] || "1") : 1;
      return { lang: langRaw, q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const entry of ranked) {
    const lang = entry.lang;
    if (lang.startsWith("pt-br")) return "pt-br";
    if (lang.startsWith("pt")) return "pt-pt";
    if (lang.startsWith("fr")) return "fr-fr";
    if (lang.startsWith("en-gb") || lang.startsWith("en-ie")) return "en-gb";
    if (lang.startsWith("en")) return "en-us";
  }

  return null;
};

const detectLocale = (request: Request, localeCookie: string | undefined): LocaleKey => {
  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie as LocaleKey;
  }

  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() || "";
  const byCountry = COUNTRY_TO_LOCALE[country];
  if (byCountry) {
    return byCountry;
  }

  const byLanguage = parseAcceptLanguage(request.headers.get("accept-language"));
  if (byLanguage) {
    return byLanguage;
  }

  return DEFAULT_LOCALE;
};

const shouldBypass = (pathname: string, method: string): boolean => {
  if (!(method === "GET" || method === "HEAD")) return true;
  if (EXEMPT_EXACT.has(pathname)) return true;
  if (FILE_EXTENSION_RE.test(pathname)) return true;
  return EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const resolveAliasPath = (pathname: string, locale: LocaleKey): string | null => {
  if (EXACT_ALIASES.has(pathname)) {
    if (pathname === "/") return `/${locale}`;
    return `/${locale}${pathname}`;
  }

  // Writing detail alias: /writing/:slug -> /:locale/writing/:slug
  if (pathname.startsWith("/writing/")) {
    return `/${locale}${pathname}`;
  }

  return null;
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies } = context;
  const pathname = url.pathname;

  if (shouldBypass(pathname, request.method)) {
    return next();
  }

  const first = getFirstPathSegment(pathname).toLowerCase();

  // Persist explicit locale from any locale-prefixed route
  if (isLocale(first)) {
    cookies.set(LOCALE_COOKIE, first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: url.protocol === "https:",
      httpOnly: false,
    });
    return next();
  }

  const cookieLocale = cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
  const locale = detectLocale(request, cookieLocale);
  const targetPath = resolveAliasPath(pathname, locale);

  if (!targetPath) {
    return next();
  }

  cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: url.protocol === "https:",
    httpOnly: false,
  });

  const redirectTarget = `${targetPath}${url.search}`;
  return context.redirect(redirectTarget, 302);
});
