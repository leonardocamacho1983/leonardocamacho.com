import { contentPlanner } from "../plan/contentPlanner";
import { DEFAULT_LOCALE, isLocale, type LocaleKey } from "../../../src/lib/locales";
import type { ContentPlannerInput, ContentPlannerOutput } from "../types/contentPlanner";
import type { ContentBrief } from "../types/content";

export interface GenerateBriefResult {
  planner: ContentPlannerOutput;
  brief: ContentBrief;
}

const resolveLocale = (value: string): LocaleKey => {
  const lowered = value.toLowerCase();
  return isLocale(lowered) ? lowered : DEFAULT_LOCALE;
};

export const toWriterBrief = (
  planner: ContentPlannerOutput,
  input: Pick<ContentPlannerInput, "topic" | "audience" | "locale" | "seoOpportunity">,
): ContentBrief => ({
  topic: input.topic.trim(),
  audience: input.audience.trim(),
  contentType: planner.contentType,
  coreClaim: planner.coreClaim,
  strategicTension: planner.strategicTension,
  readerOutcome: planner.readerOutcome,
  keyPoints: planner.keyPoints,
  takeaway: planner.takeaway,
  practiceApplication: planner.practiceApplication,
  locale: resolveLocale(input.locale),
  contentFunction: planner.contentFunction,
  phenomenonType: planner.phenomenonType,
  primaryKeyword: planner.primaryKeyword,
  secondaryKeywords: planner.secondaryKeywords,
  searchIntent: planner.searchIntent,
  mustLinkTo: planner.mustLinkTo,
  internalLinkPlan: planner.internalLinkPlan,
  readinessTest: planner.readinessTest,
  resolutionLevel: planner.resolutionLevel,
  evidenceMode: planner.evidenceMode,
  seoOpportunity: input.seoOpportunity,
});

export const generateBrief = async (input: ContentPlannerInput): Promise<GenerateBriefResult> => {
  const planner = await contentPlanner(input);
  const brief = toWriterBrief(planner, input);

  return {
    planner,
    brief,
  };
};
