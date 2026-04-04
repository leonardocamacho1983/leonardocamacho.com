import type { LocaleKey } from "../../../src/lib/locales";
import type { GeneratedMetadata } from "../finalize/generateMetadata";
import type { AntiSyntheticReviewResult, BrandGuardianResult, BrandViolation } from "../review/types";
import type {
  ContentFunction,
  ContentPlannerInput,
  PlannerEvidenceMode,
  PlannerInternalLinkPlanItem,
  PlannerOpportunityIntent,
  PlannerPhenomenonType,
  PlannerPracticeApplication,
  PlannerResolutionLevel,
} from "./contentPlanner";
import type { StyleShaperOutput } from "./styleShaper";

export type ContentType = "essay" | "insight" | "research" | "note";

export type CreateContentPlannerInput = Omit<ContentPlannerInput, "topic" | "audience" | "locale">;

export interface CreateContentInput {
  topic: string;
  contentType: ContentType;
  audience: string;
  locale?: LocaleKey;
  plannerInput: CreateContentPlannerInput;
  dryRun?: boolean;
  revisionViolations?: BrandViolation[];
}

export interface ContentBrief {
  topic: string;
  audience: string;
  contentType: ContentType;
  coreClaim: string;
  strategicTension: string;
  readerOutcome: string;
  keyPoints: string[];
  locale: LocaleKey;
  takeaway?: string;
  practiceApplication?: PlannerPracticeApplication;
  contentFunction?: ContentFunction;
  phenomenonType?: PlannerPhenomenonType;
  primaryKeyword?: string | null;
  secondaryKeywords?: string[];
  searchIntent?: string | null;
  mustLinkTo?: string[];
  internalLinkPlan?: PlannerInternalLinkPlanItem[];
  readinessTest?: string;
  resolutionLevel?: PlannerResolutionLevel;
  evidenceMode?: PlannerEvidenceMode;
  seoOpportunity?: {
    topic: string;
    cluster: string;
    intent: PlannerOpportunityIntent;
  };
}

export interface CreateContentResult {
  ok: boolean;
  status: "approved" | "rejected";
  dryRun: boolean;
  brief: ContentBrief;
  writerOutput: {
    title: string;
    bodyMarkdown: string;
    summary: string;
    model: string;
    proposedConcepts: string[];
  };
  antiSynthetic: AntiSyntheticReviewResult;
  styleShaper: StyleShaperOutput;
  brandGuardian: BrandGuardianResult;
  firstPassBrandGuardian?: BrandGuardianResult;
  retry: {
    attempted: boolean;
    count: number;
  };
  seo: GeneratedMetadata | null;
  sanity: {
    draftId: string;
    saved: boolean;
  } | null;
  failureReason?: string;
  events: Array<{
    event: "workflow_started" | "draft_created" | "review_failed";
    sent: boolean;
    reason?: string;
  }>;
}
