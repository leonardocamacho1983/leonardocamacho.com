import { isLocale, type LocaleKey } from "../../src/lib/locales.ts";

export type PlannerSourceMode = "notes" | "research" | "mixed";
export type PlannerSearchIntent = "informational" | "commercial" | "navigational" | "mixed" | null;
export type PlannerOpportunityIntent = Exclude<PlannerSearchIntent, null>;
export type ContentType = "essay" | "insight" | "research" | "note";

export interface CreateContentPlannerInput {
  goal: string;
  notes: string[];
  thesisHint: string | null;
  examples: string[];
  sourceMode: PlannerSourceMode;
  seoContext?: {
    primaryKeyword: string | null;
    secondaryKeywords: string[];
    searchIntent: PlannerSearchIntent;
  };
  seoOpportunity?: {
    topic: string;
    cluster: string;
    intent: PlannerOpportunityIntent;
  };
}

export interface CliArgs {
  topic: string;
  contentType: ContentType;
  audience: string;
  locale?: LocaleKey;
  plannerInput: CreateContentPlannerInput;
  dryRun: boolean;
}

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

const normalizeSourceMode = (value: string | undefined): PlannerSourceMode => {
  const normalized = (value || "notes").toLowerCase();
  if (normalized === "notes" || normalized === "research" || normalized === "mixed") {
    return normalized;
  }
  throw new Error("Invalid --sourceMode. Use one of: notes, research, mixed");
};

const normalizeSearchIntent = (value: string | undefined): PlannerSearchIntent => {
  if (!value) {
    return null;
  }
  const normalized = value.toLowerCase();
  if (
    normalized === "informational" ||
    normalized === "commercial" ||
    normalized === "navigational" ||
    normalized === "mixed"
  ) {
    return normalized;
  }
  throw new Error("Invalid --seo-intent. Use one of: informational, commercial, navigational, mixed");
};

const normalizeOpportunityIntent = (value: string | undefined): PlannerOpportunityIntent => {
  const normalized = (value || "").toLowerCase();
  if (
    normalized === "informational" ||
    normalized === "commercial" ||
    normalized === "navigational" ||
    normalized === "mixed"
  ) {
    return normalized;
  }
  throw new Error("Invalid --seo-opportunity-intent. Use one of: informational, commercial, navigational, mixed");
};

export const parseArgsFromArgv = (argv: string[]): CliArgs => {
  const topic = parseFlag(argv, "--topic") || "";
  const audience = parseFlag(argv, "--audience") || "";
  const contentTypeRaw = (parseFlag(argv, "--type") || "essay").toLowerCase();
  const localeRaw = parseFlag(argv, "--locale");
  const locale = localeRaw && isLocale(localeRaw.toLowerCase()) ? (localeRaw.toLowerCase() as LocaleKey) : undefined;

  const allowed: ContentType[] = ["essay", "insight", "research", "note"];
  if (!allowed.includes(contentTypeRaw as ContentType)) {
    throw new Error(`Invalid --type. Use one of: ${allowed.join(", ")}`);
  }

  if (!topic) {
    throw new Error("Missing --topic");
  }

  if (!audience) {
    throw new Error("Missing --audience");
  }

  const goal = parseFlag(argv, "--goal");
  const notes = parseMultiFlag(argv, "--notes");
  const thesisHint = parseFlag(argv, "--thesisHint") ?? null;
  const examples = parseMultiFlag(argv, "--examples");
  const sourceMode = normalizeSourceMode(parseFlag(argv, "--sourceMode"));
  const seoPrimary = parseFlag(argv, "--seo-primary")?.trim() || null;
  const seoSecondary = parseMultiFlag(argv, "--seo-secondary");
  const seoIntent = normalizeSearchIntent(parseFlag(argv, "--seo-intent"));
  const seoOpportunityTopic = parseFlag(argv, "--seo-opportunity-topic")?.trim() || "";
  const seoOpportunityCluster = parseFlag(argv, "--seo-opportunity-cluster")?.trim() || "";
  const seoOpportunityIntentRaw = parseFlag(argv, "--seo-opportunity-intent");
  const seoOpportunityIntent = seoOpportunityIntentRaw ? normalizeOpportunityIntent(seoOpportunityIntentRaw) : null;
  const hasSeoOpportunityInput = Boolean(seoOpportunityTopic || seoOpportunityCluster || seoOpportunityIntentRaw);

  const plannerMode =
    Boolean(goal) ||
    notes.length > 0 ||
    Boolean(thesisHint) ||
    examples.length > 0 ||
    Boolean(parseFlag(argv, "--sourceMode")) ||
    Boolean(seoPrimary) ||
    seoSecondary.length > 0 ||
    Boolean(parseFlag(argv, "--seo-intent")) ||
    hasSeoOpportunityInput;

  if (!plannerMode) {
    throw new Error(
      "Planner input is required. Provide --goal and at least one of --notes, --thesisHint, or --examples.",
    );
  }

  if (!goal) {
    throw new Error("Missing --goal when planner mode is active.");
  }

  if (notes.length === 0 && !thesisHint && examples.length === 0) {
    throw new Error("Missing planner material. Provide at least one of --notes, --thesisHint, or --examples.");
  }

  const plannerInput: CreateContentPlannerInput = {
    goal,
    notes,
    thesisHint,
    examples,
    sourceMode,
  };

  if (seoPrimary || seoSecondary.length > 0 || seoIntent !== null) {
    plannerInput.seoContext = {
      primaryKeyword: seoPrimary,
      secondaryKeywords: seoSecondary,
      searchIntent: seoIntent,
    };
  }

  if (hasSeoOpportunityInput) {
    if (!seoOpportunityTopic || !seoOpportunityCluster || !seoOpportunityIntent) {
      throw new Error(
        "Incomplete SEO opportunity model. Provide --seo-opportunity-topic, --seo-opportunity-cluster, and --seo-opportunity-intent together.",
      );
    }

    plannerInput.seoOpportunity = {
      topic: seoOpportunityTopic,
      cluster: seoOpportunityCluster,
      intent: seoOpportunityIntent,
    };
  }

  return {
    topic,
    audience,
    contentType: contentTypeRaw as ContentType,
    locale,
    plannerInput,
    dryRun: !hasFlag(argv, "--save"),
  };
};
