export type PlannerSourceMode = "notes" | "research" | "mixed";

export type PlannerContentType = "note" | "insight" | "essay" | "research";
export type PlannerSearchIntent = "informational" | "commercial" | "navigational" | "mixed" | null;
export type PlannerOpportunityIntent = Exclude<PlannerSearchIntent, null>;

export type PlannerClusterRole = "pillar" | "support" | "bridge";
export type PlannerConceptRole = "introduce" | "develop" | "apply" | "connect";
export type PlannerSystemRole = "new-node" | "reinforce-node" | "connect-nodes";
export type PlannerInternalLinkKind = "post" | "core-page";
export type PlannerInternalLinkPurpose = "reinforce" | "bridge" | "next-step";

export type PlannerResolutionLevel = "low" | "medium" | "high";
export type PlannerEvidenceMode = "none" | "examples" | "research";
export type PlannerPhenomenonType = "mechanical" | "structural" | "perceptual" | "emergent";

export interface PlannerSeoContextInput {
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  searchIntent: PlannerSearchIntent;
}

export interface PlannerClusterContextInput {
  clusterRole: PlannerClusterRole;
  mustLinkTo: string[];
}

export interface PlannerSeoFeedbackInput {
  missingCoverage: string[];
  keywordWeakness: string[];
  structureIssues: string[];
}

export interface PlannerSeoOpportunityInput {
  topic: string;
  cluster: string;
  intent: PlannerOpportunityIntent;
}

export interface PlannerPracticeApplication {
  whenToUse: string;
  howToUse: string;
  whatItChanges: string;
  firstAction: string;
}

export interface ContentPlannerInput {
  topic: string;
  audience: string;
  locale: string;
  goal: string;
  notes: string[];
  thesisHint: string | null;
  examples: string[];
  sourceMode: PlannerSourceMode;
  requestedContentType?: PlannerContentType;
  seoContext?: PlannerSeoContextInput;
  seoOpportunity?: PlannerSeoOpportunityInput;
  clusterContext?: PlannerClusterContextInput;
  seoFeedback?: PlannerSeoFeedbackInput;
}

export interface ContentFunction {
  clusterRole: PlannerClusterRole;
  conceptRole: PlannerConceptRole;
  systemRole: PlannerSystemRole;
}

export interface PlannerInternalLinkPlanItem {
  target: string;
  kind: PlannerInternalLinkKind;
  purpose: PlannerInternalLinkPurpose;
  anchorHint: string;
}

export interface ContentPlannerOutput {
  contentType: PlannerContentType;
  phenomenonType?: PlannerPhenomenonType;
  coreClaim: string;
  strategicTension: string;
  readerOutcome: string;
  keyPoints: string[];
  takeaway: string;
  practiceApplication: PlannerPracticeApplication;
  contentFunction: ContentFunction;
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  searchIntent: PlannerSearchIntent;
  mustLinkTo: string[];
  internalLinkPlan?: PlannerInternalLinkPlanItem[];
  readinessTest: string;
  resolutionLevel: PlannerResolutionLevel;
  evidenceMode: PlannerEvidenceMode;
}
