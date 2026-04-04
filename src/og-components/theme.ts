import type { LocaleKey } from "@/lib/locales";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_TOP_BAR = 8;
export const OG_MAIN_HEIGHT = OG_HEIGHT - OG_TOP_BAR;

export const BRAND = {
  cream: "#F6F3EC",
  ink: "#1A1710",
  ox: "#6E2535",
  navy: "#1C1F2E",
  navyPanel: "#222638",
  oxDark: "#521A27",
  gold: "#C9A84C",
  notePaper: "#EDE8DE",
  researchPaper: "#E4E6E0",
} as const;

export type IdentityPageKey = "home" | "about" | "writing" | "privacy";

export const IDENTITY_PAGE_CONTENT: Record<
  IdentityPageKey,
  { label?: string; headlineLines: string[]; subhead: string }
> = {
  home: {
    headlineLines: ["Clarity for", "companies that", "want to compound."],
    subhead: "Essays on strategy, organizations, and durable advantage.",
  },
  about: {
    label: "About",
    headlineLines: ["Why good", "companies lose", "their clarity."],
    subhead: "Operator-led research on strategy, structure, and growth.",
  },
  writing: {
    label: "Writing",
    headlineLines: ["Essays that", "make strategy", "easier to see."],
    subhead: "For founders and operators building for the long term.",
  },
  privacy: {
    label: "Privacy",
    headlineLines: ["Privacy,", "without the fog."],
    subhead: "What gets collected, why, and how it is used.",
  },
};

export const resolveIdentityPage = (value: string | undefined): IdentityPageKey | null => {
  const candidate = (value || "").trim().toLowerCase();
  switch (candidate) {
    case "home":
    case "about":
    case "writing":
    case "privacy":
      return candidate as IdentityPageKey;
    default:
      return null;
  }
};

export type ArticleTypeKey = "note" | "insight" | "essay" | "research";

export interface ArticleTheme {
  background: string;
  text: string;
  railBackground: string;
  accent: string;
}

export const ARTICLE_THEMES: Record<ArticleTypeKey, ArticleTheme> = {
  note: {
    background: BRAND.notePaper,
    text: BRAND.ink,
    railBackground: BRAND.navy,
    accent: BRAND.ox,
  },
  insight: {
    background: BRAND.cream,
    text: BRAND.ink,
    railBackground: BRAND.navy,
    accent: BRAND.ox,
  },
  essay: {
    background: BRAND.navy,
    text: BRAND.cream,
    railBackground: BRAND.oxDark,
    accent: BRAND.gold,
  },
  research: {
    background: BRAND.researchPaper,
    text: BRAND.ink,
    railBackground: BRAND.navy,
    accent: BRAND.ox,
  },
};

export const resolveArticleType = (
  categorySlug?: string | null,
  override?: string | null,
): ArticleTypeKey => {
  const candidate = (override || categorySlug || "insight").trim().toLowerCase();
  switch (candidate) {
    case "note":
    case "notes":
      return "note";
    case "essay":
    case "essays":
      return "essay";
    case "research":
      return "research";
    case "insight":
    case "insights":
    default:
      return "insight";
  }
};

export const clampText = (value: string, maxLength: number): string => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
};

export const splitEditorialTitle = (title: string, explicitLine2?: string | null) => {
  const line1 = clampText(title, 96);
  if (explicitLine2) {
    return {
      line1: clampText(line1, 48),
      line2: clampText(explicitLine2, 52),
    };
  }

  const normalized = line1.replace(/\s+/g, " ").trim();
  if (normalized.length <= 34) {
    return { line1: normalized };
  }

  const separatorMatch = normalized.match(/^(.{12,42}?)(?:\s[—:\-]\s|:\s|\s-\s)(.{8,52})$/);
  if (separatorMatch) {
    return {
      line1: clampText(separatorMatch[1], 42),
      line2: clampText(separatorMatch[2], 52),
    };
  }

  const words = normalized.split(" ");
  let best: { line1: string; line2: string; score: number } | null = null;
  const totalLength = normalized.length;
  const target = totalLength * 0.55;

  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(" ");
    const second = words.slice(index).join(" ");
    if (first.length < 16 || first.length > 42 || second.length > 52) {
      continue;
    }

    const score = Math.abs(first.length - target) + Math.abs(first.length - second.length) * 0.2;
    if (!best || score < best.score) {
      best = { line1: first, line2: second, score };
    }
  }

  if (best) {
    return {
      line1: best.line1,
      line2: best.line2,
    };
  }

  return { line1: clampText(normalized, 42) };
};

export const formatEditorialDate = (
  value: string | undefined,
  locale: LocaleKey | "en-us" = "en-us",
): string => {
  if (!value) {
    return "UNPUBLISHED";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "UNPUBLISHED";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date).toUpperCase();
};

export const formatReadTimeLabel = (minutes: number | undefined, override?: string | null): string => {
  if (override) {
    return clampText(override.toUpperCase(), 24);
  }
  const safeMinutes = Number.isFinite(minutes) && minutes && minutes > 0 ? Math.round(minutes) : 6;
  return `${safeMinutes} MIN READ`;
};

export const formatIssueNumber = (override?: string | null): string => {
  const cleaned = (override || "01").trim().replace(/[^0-9A-Z]/gi, "").slice(0, 4);
  return cleaned || "01";
};
