export type ReviewerSeverity = "low" | "medium" | "high";

export interface ReviewerIssue {
  code: string;
  message: string;
  excerpt?: string;
  severity?: ReviewerSeverity;
}

export interface AntiSyntheticScores {
  artificiality: number;
  authorialPresence: number;
  concreteness: number;
}

export interface AntiSyntheticReviewResult {
  revisedText: string;
  scores: AntiSyntheticScores;
  issues: ReviewerIssue[];
  changes: string[];
}

export interface BrandViolation {
  rule: string;
  message: string;
  evidence?: string;
}

export interface BrandGuardianResult {
  approved: boolean;
  violations: BrandViolation[];
  notes: string[];
  conceptWarnings: string[];
}
