import { isLocale, type LocaleKey } from "../../src/lib/locales.ts";
import type { ContentType } from "../../ops/publishing/types/content";
import type { RefreshContentInput, RefreshSourceMode } from "../../ops/publishing/workflows/refreshContent";

const parseFlag = (argv: string[], name: string): string | undefined => {
  const index = argv.indexOf(name);
  if (index === -1) return undefined;
  return argv[index + 1];
};

const parseMultiFlag = (argv: string[], name: string): string[] => {
  const values: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === name) {
      const value = argv[index + 1];
      if (typeof value === "string" && value.length > 0 && !value.startsWith("--")) {
        values.push(value);
      }
    }
  }
  return values;
};

const hasFlag = (argv: string[], name: string): boolean => argv.includes(name);

const normalizeSourceMode = (value: string | undefined): RefreshSourceMode => {
  const normalized = (value || "published").toLowerCase();
  if (normalized === "published" || normalized === "draft") {
    return normalized;
  }
  throw new Error("Invalid --source. Use one of: published, draft");
};

const normalizeContentType = (value: string | undefined): ContentType | undefined => {
  if (!value) {
    return undefined;
  }
  const normalized = value.toLowerCase();
  const allowed: ContentType[] = ["essay", "insight", "research", "note"];
  if (!allowed.includes(normalized as ContentType)) {
    throw new Error(`Invalid --type. Use one of: ${allowed.join(", ")}`);
  }
  return normalized as ContentType;
};

export const parseRefreshArgsFromArgv = (argv: string[]): RefreshContentInput => {
  const postId = parseFlag(argv, "--postId")?.trim();
  const slug = parseFlag(argv, "--slug")?.trim();
  const localeRaw = parseFlag(argv, "--locale")?.toLowerCase();
  const locale = localeRaw && isLocale(localeRaw) ? (localeRaw as LocaleKey) : undefined;

  if (!postId && !slug) {
    throw new Error("Missing selector. Provide --postId or --slug --locale <locale>.");
  }

  if (slug && !locale) {
    throw new Error("--slug requires a valid --locale.");
  }

  const audience = parseFlag(argv, "--audience")?.trim();
  const goal = parseFlag(argv, "--goal")?.trim();
  const topic = parseFlag(argv, "--topic")?.trim();
  const notes = parseMultiFlag(argv, "--notes").map((item) => item.trim()).filter(Boolean);

  return {
    postId,
    slug,
    locale,
    source: normalizeSourceMode(parseFlag(argv, "--source")),
    audience,
    goal,
    topic,
    notes,
    contentType: normalizeContentType(parseFlag(argv, "--type")),
    dryRun: !hasFlag(argv, "--save"),
  };
};
