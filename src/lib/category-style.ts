const CATEGORY_TONE_CLASS_BY_SLUG: Record<string, string> = {
  essay: "tag--essay",
  essays: "tag--essay",
  insight: "tag--insight",
  insights: "tag--insight",
  research: "tag--research",
  note: "tag--note",
  notes: "tag--note",
};

export const categoryToneClass = (slug?: string | null): string => {
  const key = slug?.toLowerCase() || "";
  return CATEGORY_TONE_CLASS_BY_SLUG[key] || "tag--default";
};

const CATEGORY_LABEL_BY_KEY: Record<string, string> = {
  essay: "ESSAY",
  insight: "INSIGHT",
  research: "RESEARCH",
  note: "NOTE",
};

const CATEGORY_LABEL_BY_LOCALE_KEY: Record<string, Record<string, string>> = {
  "pt-br": {
    essay: "ARTIGO",
    insight: "INSIGHT",
    research: "PESQUISA",
    note: "NOTA",
  },
  "pt-pt": {
    essay: "ARTIGO",
    insight: "INSIGHT",
    research: "PESQUISA",
    note: "NOTA",
  },
};

export const categoryLabel = (category?: { locale?: string; translationKey?: string; slug?: string; title?: string } | null): string => {
  const locale = category?.locale?.toLowerCase() || "";
  const key = category?.translationKey?.toLowerCase() || category?.slug?.toLowerCase() || "";
  const localizedLabel = CATEGORY_LABEL_BY_LOCALE_KEY[locale]?.[key];
  if (localizedLabel) {
    return localizedLabel;
  }
  if (key in CATEGORY_LABEL_BY_KEY) {
    return CATEGORY_LABEL_BY_KEY[key];
  }
  return category?.title?.toUpperCase() || "POST";
};
