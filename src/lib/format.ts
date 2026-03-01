import type { LocaleKey } from "./locales";

const localeMap: Record<LocaleKey, string> = {
  "en-us": "en-US",
  "en-gb": "en-GB",
  "pt-br": "pt-BR",
  "pt-pt": "pt-PT",
  "fr-fr": "fr-FR",
};

export const formatMonthYear = (isoDate: string, locale: LocaleKey): string => {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(localeMap[locale], {
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
};

export const formatReadTime = (minutes: number): string => `${minutes} min`;

export const mapHtmlLang = (locale: LocaleKey): string => localeMap[locale];
