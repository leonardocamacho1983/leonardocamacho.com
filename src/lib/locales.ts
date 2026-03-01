export const LOCALES = [
  { key: "en-us", label: "English (US)", flag: "🇺🇸" },
  { key: "en-gb", label: "English (UK)", flag: "🇬🇧" },
  { key: "pt-br", label: "Português (BR)", flag: "🇧🇷" },
  { key: "pt-pt", label: "Português (PT)", flag: "🇵🇹" },
  { key: "fr-fr", label: "Français (FR)", flag: "🇫🇷" },
] as const;

export type LocaleKey = (typeof LOCALES)[number]["key"];

export const DEFAULT_LOCALE: LocaleKey = "en-us";

export const isLocale = (value: string): value is LocaleKey =>
  LOCALES.some((locale) => locale.key === value);

export const localeFromParam = (value: string | undefined): LocaleKey | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  return isLocale(normalized) ? normalized : null;
};

export const getLocaleMeta = (locale: LocaleKey) =>
  LOCALES.find((item) => item.key === locale) || LOCALES[0];

export const localizedPath = (
  locale: LocaleKey,
  route: "home" | "about" | "writing" | "post" | "privacy",
  slug?: string,
) => {
  if (route === "home") {
    return `/${locale}`;
  }

  if (route === "about") {
    return `/${locale}/about`;
  }

  if (route === "writing") {
    return `/${locale}/writing`;
  }

  if (route === "privacy") {
    return `/${locale}/privacy`;
  }

  return `/${locale}/writing/${slug || ""}`;
};

export const routeFromPath = (pathname: string): "home" | "about" | "writing" | "post" | "privacy" => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return "home";
  }

  if (segments[1] === "about") {
    return "about";
  }

  if (segments[1] === "writing" && segments.length === 2) {
    return "writing";
  }

  if (segments[1] === "privacy") {
    return "privacy";
  }

  return "post";
};
