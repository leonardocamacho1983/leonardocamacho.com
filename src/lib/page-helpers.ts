import type { AstroCookies } from "astro";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizedPath,
  routeFromPath,
  type LocaleKey,
} from "./locales";
import type { LocaleLinkDTO } from "./types";

export const getLocaleOrDefault = (rawLocale: string | undefined): LocaleKey => {
  if (!rawLocale) {
    return DEFAULT_LOCALE;
  }

  const normalized = rawLocale.toLowerCase();
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
};

export const isPreviewRequest = (cookies: AstroCookies): boolean =>
  cookies.get("sanity-preview")?.value === "true";

export const localeLinksForPath = (
  pathname: string,
  locale: LocaleKey,
  postTranslations?: Array<{ locale: LocaleKey; slug: string }>,
): LocaleLinkDTO[] => {
  const route = routeFromPath(pathname);

  if (route !== "post") {
    return LOCALES.map((item) => ({
      locale: item.key,
      label: item.label,
      flag: item.flag,
      href: localizedPath(item.key, route),
      available: true,
    }));
  }

  const translationsByLocale = new Map(postTranslations?.map((item) => [item.locale, item.slug]) || []);
  const fallbackSegments = pathname.split("/").filter(Boolean);
  const fallbackSlug = fallbackSegments.at(-1) || "";

  return LOCALES.map((item) => {
    const translationSlug = translationsByLocale.get(item.key) || (item.key === locale ? fallbackSlug : "");
    return {
      locale: item.key,
      label: item.label,
      flag: item.flag,
      href: translationSlug
        ? localizedPath(item.key, "post", translationSlug)
        : localizedPath(item.key, "writing"),
      available: Boolean(translationSlug),
    };
  });
};
