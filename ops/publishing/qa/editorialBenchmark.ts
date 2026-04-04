import type { ContentType, CreateContentInput } from "../types/content";
import type { PlannerConceptRole, PlannerPhenomenonType } from "../types/contentPlanner";

export type EditorialBenchmarkClosingMode = "consequence" | "operator_allowed";

export interface EditorialBenchmarkAnchorGroup {
  name: string;
  patterns: string[];
}

export interface EditorialBenchmarkPatternRule {
  name: string;
  pattern: string;
  scope?: "text" | "closing";
  ignoreNegated?: boolean;
}

export interface EditorialBenchmarkRules {
  expectedPhenomenonType?: PlannerPhenomenonType;
  expectedContentType?: ContentType;
  expectedConceptRole?: PlannerConceptRole;
  closingMode: EditorialBenchmarkClosingMode;
  allowProposedConcepts?: boolean;
  maxRetryCount?: number;
  requiredAnchorGroups: EditorialBenchmarkAnchorGroup[];
  disallowedPatterns?: EditorialBenchmarkPatternRule[];
}

export interface EditorialBenchmarkReferenceOutput {
  title: string;
  summary: string;
  bodyMarkdown: string;
}

export interface EditorialBenchmarkFixture {
  id: string;
  label: string;
  input: Omit<CreateContentInput, "dryRun">;
  approvedReference: EditorialBenchmarkReferenceOutput;
  survivalCriteria: string[];
  knownFailurePatterns: string[];
  rules: EditorialBenchmarkRules;
}

export interface EditorialBenchmarkRuleResult {
  name: string;
  passed: boolean;
  evidence?: string;
}

export type EditorialBenchmarkFailureCategory =
  | "runner_error"
  | "pipeline_approval"
  | "retry_instability"
  | "opening_weakness"
  | "closing_drift"
  | "texture_artificiality"
  | "concept_invention"
  | "mechanism_loss"
  | "phenomenon_drift"
  | "content_type_drift"
  | "concept_role_drift"
  | "operator_positioning"
  | "generic_business_language"
  | "disallowed_framing"
  | "other";

export interface EditorialBenchmarkFailureSignal {
  category: EditorialBenchmarkFailureCategory;
  ruleName: string;
  evidence?: string;
}

export interface EditorialBenchmarkFailureCategoryCount {
  category: EditorialBenchmarkFailureCategory;
  count: number;
  caseIds: string[];
}

export type EditorialBenchmarkResolution =
  | "pass_first_attempt"
  | "pass_after_revision"
  | "failed_after_max_revisions";

export interface EditorialBenchmarkCaseResult {
  caseId: string;
  label: string;
  finalStatus: "passed" | "failed";
  benchmarkResolution: EditorialBenchmarkResolution;
  benchmarkRevisionsUsed: number;
  initialFailureReasons: string[];
  pipelineApproved: boolean;
  retry: {
    attempted: boolean;
    count: number;
  };
  firstPassViolations: string[];
  openingQuality: EditorialBenchmarkRuleResult & {
    opening: string;
  };
  closingTone: EditorialBenchmarkRuleResult & {
    closing: string;
  };
  conceptInvention: EditorialBenchmarkRuleResult & {
    proposedConcepts: string[];
  };
  mechanismSurvival: EditorialBenchmarkRuleResult & {
    missingAnchorGroups: string[];
  };
  phenomenonConsistency: EditorialBenchmarkRuleResult & {
    expected?: PlannerPhenomenonType;
    actual?: PlannerPhenomenonType;
  };
  benchmarkRuleResults: EditorialBenchmarkRuleResult[];
  failureReasons: string[];
  initialFailureTaxonomy: EditorialBenchmarkFailureSignal[];
  finalFailureTaxonomy: EditorialBenchmarkFailureSignal[];
  output: {
    title: string;
    summary: string;
    bodyMarkdown: string;
  };
  brief: {
    contentType: ContentType;
    phenomenonType?: PlannerPhenomenonType;
    conceptRole?: PlannerConceptRole;
    coreClaim: string;
  };
  reference: EditorialBenchmarkReferenceOutput;
  survivalCriteria: string[];
  knownFailurePatterns: string[];
  error?: string;
}

export interface EditorialBenchmarkSuiteResult {
  ok: boolean;
  suiteId: string;
  generatedAt: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passedFirstAttempt: number;
    passedAfterRevision: number;
    initialFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
    finalFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
  };
  cases: EditorialBenchmarkCaseResult[];
}
