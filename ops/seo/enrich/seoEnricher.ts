import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type {
  SeoEnricherInput,
  SeoEnricherOutput,
  SeoPlannerContentType,
  SeoSearchIntent,
} from "../types/seoEnricher";

const PROMPT_PATH = path.resolve(process.cwd(), "ops/seo/prompts/seoEnricher.system.md");

const CONTENT_TYPES = new Set(["note", "insight", "essay", "research"]);
const SEARCH_INTENTS = new Set(["informational", "commercial", "navigational", "mixed"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new Error(`seoEnricher invalid field: ${field} must be a string.`);
  }
  const clean = value.trim();
  if (!clean) {
    throw new Error(`seoEnricher invalid field: ${field} cannot be empty.`);
  }
  return clean;
};

const asNullableString = (value: unknown, field: string): string | null => {
  if (value === null) {
    return null;
  }
  return asString(value, field);
};

const asStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`seoEnricher invalid field: ${field} must be an array.`);
  }
  return value.map((item, index) => asString(item, `${field}[${index}]`));
};

const asEnum = (value: unknown, field: string, allowed: Set<string>): string => {
  const normalized = asString(value, field).toLowerCase();
  if (!allowed.has(normalized)) {
    throw new Error(`seoEnricher invalid field: ${field} must be one of ${Array.from(allowed).join(", ")}.`);
  }
  return normalized;
};

const asNullableIntent = (value: unknown): SeoSearchIntent => {
  if (value === null) {
    return null;
  }
  return asEnum(value, "seoContext.searchIntent", SEARCH_INTENTS) as SeoSearchIntent;
};

const normalizeInput = (input: SeoEnricherInput): SeoEnricherInput => {
  if (!isRecord(input.plannerOutput)) {
    throw new Error("seoEnricher invalid input: plannerOutput must be an object.");
  }
  if (!isRecord(input.seoContext)) {
    throw new Error("seoEnricher invalid input: seoContext must be an object.");
  }

  const practiceApplication = input.plannerOutput.practiceApplication;
  if (!isRecord(practiceApplication)) {
    throw new Error("seoEnricher invalid input: plannerOutput.practiceApplication must be an object.");
  }

  return {
    plannerOutput: {
      contentType: asEnum(input.plannerOutput.contentType, "plannerOutput.contentType", CONTENT_TYPES) as SeoPlannerContentType,
      coreClaim: asString(input.plannerOutput.coreClaim, "plannerOutput.coreClaim"),
      strategicTension: asString(input.plannerOutput.strategicTension, "plannerOutput.strategicTension"),
      readerOutcome: asString(input.plannerOutput.readerOutcome, "plannerOutput.readerOutcome"),
      keyPoints: asStringArray(input.plannerOutput.keyPoints, "plannerOutput.keyPoints"),
      takeaway: asString(input.plannerOutput.takeaway, "plannerOutput.takeaway"),
      practiceApplication: {
        whenToUse: asString(practiceApplication.whenToUse, "plannerOutput.practiceApplication.whenToUse"),
        howToUse: asString(practiceApplication.howToUse, "plannerOutput.practiceApplication.howToUse"),
        whatItChanges: asString(practiceApplication.whatItChanges, "plannerOutput.practiceApplication.whatItChanges"),
        firstAction: asString(practiceApplication.firstAction, "plannerOutput.practiceApplication.firstAction"),
      },
    },
    seoContext: {
      primaryKeyword: asNullableString(input.seoContext.primaryKeyword, "seoContext.primaryKeyword"),
      secondaryKeywords: asStringArray(input.seoContext.secondaryKeywords, "seoContext.secondaryKeywords"),
      searchIntent: asNullableIntent(input.seoContext.searchIntent),
      targetSlug: asNullableString(input.seoContext.targetSlug, "seoContext.targetSlug"),
    },
  };
};

const toNumberScore = (value: unknown): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("seoEnricher invalid field: alignmentScore must be a number.");
  }
  const clipped = Math.max(0, Math.min(100, Math.round(value)));
  return clipped;
};

export const seoEnricher = async (input: SeoEnricherInput): Promise<SeoEnricherOutput> => {
  const normalizedInput = normalizeInput(input);
  const raw = await runPrompt({
    systemPromptPath: PROMPT_PATH,
    input: normalizedInput,
  });

  if (!isRecord(raw)) {
    throw new Error("seoEnricher returned non-object output.");
  }

  if (typeof raw.shouldRefinePlanner !== "boolean") {
    throw new Error("seoEnricher invalid field: shouldRefinePlanner must be boolean.");
  }

  return {
    alignmentScore: toNumberScore(raw.alignmentScore),
    missingCoverage: asStringArray(raw.missingCoverage, "missingCoverage"),
    keywordWeakness: asStringArray(raw.keywordWeakness, "keywordWeakness"),
    structureIssues: asStringArray(raw.structureIssues, "structureIssues"),
    recommendedAdditions: asStringArray(raw.recommendedAdditions, "recommendedAdditions"),
    shouldRefinePlanner: raw.shouldRefinePlanner,
  };
};
