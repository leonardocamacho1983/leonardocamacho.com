import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type {
  ContentPlannerInput,
  ContentPlannerOutput,
  PlannerContentType,
  PlannerInternalLinkPlanItem,
  PlannerOpportunityIntent,
  PlannerPhenomenonType,
  PlannerSearchIntent,
  PlannerSourceMode,
} from "../types/contentPlanner";

const PROMPT_PATH = path.resolve(process.cwd(), "ops/publishing/prompts/contentPlanner.system.md");

const CONTENT_TYPES = new Set(["note", "insight", "essay", "research"]);
const CLUSTER_ROLES = new Set(["pillar", "support", "bridge"]);
const CONCEPT_ROLES = new Set(["introduce", "develop", "apply", "connect"]);
const SYSTEM_ROLES = new Set(["new-node", "reinforce-node", "connect-nodes"]);
const INTERNAL_LINK_KINDS = new Set(["post", "core-page"]);
const INTERNAL_LINK_PURPOSES = new Set(["reinforce", "bridge", "next-step"]);
const RESOLUTION_LEVELS = new Set(["low", "medium", "high"]);
const EVIDENCE_MODES = new Set(["none", "examples", "research"]);
const PHENOMENON_TYPES = new Set(["mechanical", "structural", "perceptual", "emergent"]);
const SOURCE_MODES = new Set(["notes", "research", "mixed"]);
const SEARCH_INTENTS = new Set(["informational", "commercial", "navigational", "mixed"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new Error(`contentPlanner invalid field: ${field} must be a string.`);
  }
  const clean = value.trim();
  if (!clean) {
    throw new Error(`contentPlanner invalid field: ${field} cannot be empty.`);
  }
  return clean;
};

const asNullableString = (value: unknown, field: string): string | null => {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`contentPlanner invalid field: ${field} must be string or null.`);
  }
  const clean = value.trim();
  return clean || null;
};

const asStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`contentPlanner invalid field: ${field} must be an array.`);
  }
  return value
    .map((item, index) => asString(item, `${field}[${index}]`))
    .filter(Boolean);
};

const asInternalLinkPlan = (value: unknown, field: string): PlannerInternalLinkPlanItem[] => {
  if (!Array.isArray(value)) {
    throw new Error(`contentPlanner invalid field: ${field} must be an array.`);
  }

  const plan = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`contentPlanner invalid field: ${field}[${index}] must be an object.`);
    }

    return {
      target: asString(item.target, `${field}[${index}].target`),
      kind: requireEnum(
        item.kind,
        `${field}[${index}].kind`,
        INTERNAL_LINK_KINDS,
      ) as PlannerInternalLinkPlanItem["kind"],
      purpose: requireEnum(
        item.purpose,
        `${field}[${index}].purpose`,
        INTERNAL_LINK_PURPOSES,
      ) as PlannerInternalLinkPlanItem["purpose"],
      anchorHint: asString(item.anchorHint, `${field}[${index}].anchorHint`),
    };
  });

  if (plan.length < 1 || plan.length > 3) {
    throw new Error(`contentPlanner invalid field: ${field} must contain 1 to 3 items.`);
  }

  return plan;
};

const normalizeEnumToken = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z-]/g, "");

const requireEnum = (
  value: unknown,
  field: string,
  allowed: Set<string>,
  aliases: Record<string, string> = {},
): string => {
  const raw = asString(value, field);
  const normalized = normalizeEnumToken(raw);
  const canonical = aliases[normalized] || normalized;
  if (!allowed.has(canonical)) {
    throw new Error(`contentPlanner invalid field: ${field} must be one of ${Array.from(allowed).join(", ")}.`);
  }
  return canonical;
};

const asNullableSearchIntent = (value: unknown, field: string): PlannerSearchIntent => {
  if (value === null) {
    return null;
  }

  return requireEnum(value, field, SEARCH_INTENTS, {
    info: "informational",
    navigation: "navigational",
  }) as PlannerSearchIntent;
};

const asOpportunityIntent = (value: unknown, field: string): PlannerOpportunityIntent =>
  requireEnum(value, field, SEARCH_INTENTS, {
    info: "informational",
    navigation: "navigational",
  }) as PlannerOpportunityIntent;

const asOptionalEnum = (
  value: unknown,
  field: string,
  allowed: Set<string>,
  aliases: Record<string, string> = {},
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return requireEnum(value, field, allowed, aliases);
};

const normalizeInput = (input: ContentPlannerInput): ContentPlannerInput => {
  const sourceMode = requireEnum(input.sourceMode, "sourceMode", SOURCE_MODES) as PlannerSourceMode;
  const normalized: ContentPlannerInput = {
    topic: asString(input.topic, "topic"),
    audience: asString(input.audience, "audience"),
    locale: asString(input.locale, "locale"),
    goal: asString(input.goal, "goal"),
    notes: asStringArray(input.notes, "notes"),
    thesisHint: asNullableString(input.thesisHint, "thesisHint"),
    examples: asStringArray(input.examples, "examples"),
    sourceMode,
  };

  if (input.requestedContentType !== undefined) {
    normalized.requestedContentType = requireEnum(
      input.requestedContentType,
      "requestedContentType",
      CONTENT_TYPES,
    ) as PlannerContentType;
  }

  if (input.seoContext) {
    normalized.seoContext = {
      primaryKeyword: asNullableString(input.seoContext.primaryKeyword, "seoContext.primaryKeyword"),
      secondaryKeywords: asStringArray(input.seoContext.secondaryKeywords, "seoContext.secondaryKeywords"),
      searchIntent: asNullableSearchIntent(input.seoContext.searchIntent, "seoContext.searchIntent"),
    };
  }

  if (input.seoOpportunity) {
    normalized.seoOpportunity = {
      topic: asString(input.seoOpportunity.topic, "seoOpportunity.topic"),
      cluster: asString(input.seoOpportunity.cluster, "seoOpportunity.cluster"),
      intent: asOpportunityIntent(input.seoOpportunity.intent, "seoOpportunity.intent"),
    };
  }

  if (input.clusterContext) {
    normalized.clusterContext = {
      clusterRole: requireEnum(
        input.clusterContext.clusterRole,
        "clusterContext.clusterRole",
        CLUSTER_ROLES,
      ) as NonNullable<ContentPlannerInput["clusterContext"]>["clusterRole"],
      mustLinkTo: asStringArray(input.clusterContext.mustLinkTo, "clusterContext.mustLinkTo"),
    };
  }

  if (input.seoFeedback) {
    normalized.seoFeedback = {
      missingCoverage: asStringArray(input.seoFeedback.missingCoverage, "seoFeedback.missingCoverage"),
      keywordWeakness: asStringArray(input.seoFeedback.keywordWeakness, "seoFeedback.keywordWeakness"),
      structureIssues: asStringArray(input.seoFeedback.structureIssues, "seoFeedback.structureIssues"),
    };
  }

  return normalized;
};

export const contentPlanner = async (input: ContentPlannerInput): Promise<ContentPlannerOutput> => {
  const normalizedInput = normalizeInput(input);
  const raw = await runPrompt({
    systemPromptPath: PROMPT_PATH,
    input: normalizedInput,
  });

  if (!isRecord(raw)) {
    throw new Error("contentPlanner returned non-object output.");
  }

  const contentFunction = raw.contentFunction;
  if (!isRecord(contentFunction)) {
    throw new Error("contentPlanner invalid field: contentFunction must be an object.");
  }

  const keyPoints = asStringArray(raw.keyPoints, "keyPoints");
  if (keyPoints.length < 3 || keyPoints.length > 5) {
    throw new Error("contentPlanner invalid field: keyPoints must contain 3 to 5 items.");
  }

  const practiceApplication = raw.practiceApplication;
  if (!isRecord(practiceApplication)) {
    throw new Error("contentPlanner invalid field: practiceApplication must be an object.");
  }

  const plannerSearchIntent = asNullableSearchIntent(raw.searchIntent, "searchIntent");
  const resolvedSearchIntent =
    plannerSearchIntent ??
    normalizedInput.seoContext?.searchIntent ??
    normalizedInput.seoOpportunity?.intent ??
    null;
  const mustLinkTo = asStringArray(raw.mustLinkTo, "mustLinkTo");
  const resolvedClusterRole = requireEnum(
    contentFunction.clusterRole,
    "contentFunction.clusterRole",
    CLUSTER_ROLES,
  ) as ContentPlannerOutput["contentFunction"]["clusterRole"];
  const resolvedConceptRole = requireEnum(
    contentFunction.conceptRole,
    "contentFunction.conceptRole",
    CONCEPT_ROLES,
  ) as ContentPlannerOutput["contentFunction"]["conceptRole"];
  const resolvedSystemRole = requireEnum(
    contentFunction.systemRole,
    "contentFunction.systemRole",
    SYSTEM_ROLES,
  ) as ContentPlannerOutput["contentFunction"]["systemRole"];
  const plannerInternalLinkPlan =
    raw.internalLinkPlan === undefined
      ? []
      : asInternalLinkPlan(raw.internalLinkPlan, "internalLinkPlan");
  const fallbackInternalLinkPlan = plannerInternalLinkPlan.length
    ? plannerInternalLinkPlan
    : mustLinkTo
        .slice(0, 3)
        .map(
          (target): PlannerInternalLinkPlanItem => ({
            target,
            kind: "post",
            purpose: resolvedClusterRole === "bridge" ? "bridge" : "reinforce",
            anchorHint: target,
          }),
        );

  return {
    contentType: requireEnum(raw.contentType, "contentType", CONTENT_TYPES) as ContentPlannerOutput["contentType"],
    phenomenonType: asOptionalEnum(
      raw.phenomenonType,
      "phenomenonType",
      PHENOMENON_TYPES,
    ) as PlannerPhenomenonType | undefined,
    coreClaim: asString(raw.coreClaim, "coreClaim"),
    strategicTension: asString(raw.strategicTension, "strategicTension"),
    readerOutcome: asString(raw.readerOutcome, "readerOutcome"),
    keyPoints,
    takeaway: asString(raw.takeaway, "takeaway"),
    practiceApplication: {
      whenToUse: asString(practiceApplication.whenToUse, "practiceApplication.whenToUse"),
      howToUse: asString(practiceApplication.howToUse, "practiceApplication.howToUse"),
      whatItChanges: asString(practiceApplication.whatItChanges, "practiceApplication.whatItChanges"),
      firstAction: asString(practiceApplication.firstAction, "practiceApplication.firstAction"),
    },
    contentFunction: {
      clusterRole: resolvedClusterRole,
      conceptRole: resolvedConceptRole,
      systemRole: resolvedSystemRole,
    },
    primaryKeyword: asNullableString(raw.primaryKeyword, "primaryKeyword"),
    secondaryKeywords: asStringArray(raw.secondaryKeywords, "secondaryKeywords"),
    searchIntent: resolvedSearchIntent,
    mustLinkTo,
    internalLinkPlan: fallbackInternalLinkPlan,
    readinessTest: asString(raw.readinessTest, "readinessTest"),
    resolutionLevel: requireEnum(raw.resolutionLevel, "resolutionLevel", RESOLUTION_LEVELS, {
      med: "medium",
    }) as ContentPlannerOutput["resolutionLevel"],
    evidenceMode: requireEnum(raw.evidenceMode, "evidenceMode", EVIDENCE_MODES, {
      example: "examples",
      mixed: "examples",
    }) as ContentPlannerOutput["evidenceMode"],
  };
};
