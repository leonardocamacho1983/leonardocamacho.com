export const LOCALES = [
  { value: "en-us", title: "English (US)", flag: "🇺🇸" },
  { value: "en-gb", title: "English (UK)", flag: "🇬🇧" },
  { value: "pt-br", title: "Português (BR)", flag: "🇧🇷" },
  { value: "pt-pt", title: "Português (PT)", flag: "🇵🇹" },
  { value: "fr-fr", title: "Français (FR)", flag: "🇫🇷" },
] as const;

export const localeList = LOCALES.map((locale) => ({
  title: locale.title,
  value: locale.value,
}));
