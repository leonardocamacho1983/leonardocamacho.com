export type SeoPlannerContentType = "note" | "insight" | "essay" | "research";

export type SeoSearchIntent = "informational" | "commercial" | "navigational" | "mixed" | null;

export interface SeoPlannerPracticeApplication {
  whenToUse: string;
  howToUse: string;
  whatItChanges: string;
  firstAction: string;
}

export interface SeoPlannerOutputInput {
  contentType: SeoPlannerContentType;
  coreClaim: string;
  strategicTension: string;
  readerOutcome: string;
  keyPoints: string[];
  takeaway: string;
  practiceApplication: SeoPlannerPracticeApplication;
}

export interface SeoContextInput {
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  searchIntent: SeoSearchIntent;
  targetSlug: string | null;
}

export interface SeoEnricherInput {
  plannerOutput: SeoPlannerOutputInput;
  seoContext: SeoContextInput;
}

export interface SeoEnricherOutput {
  alignmentScore: number;
  missingCoverage: string[];
  keywordWeakness: string[];
  structureIssues: string[];
  recommendedAdditions: string[];
  shouldRefinePlanner: boolean;
}
