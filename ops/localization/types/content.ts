import type { LocaleKey } from "../../../src/lib/locales";

export interface TerminologyDecision {
  original: string;
  localized: string;
  reason: string;
}

export interface LocalizationGuardianViolation {
  rule: string;
  message: string;
  evidence?: string;
}

export interface LocalizationPublishPolicySnapshot {
  targetLocale: LocaleKey;
  maxAttemptsUsed: number;
  maxQaWarnings: number;
  criticalViolationRules: string[];
  nativeVoicePriority: "standard" | "strict";
  rationale: string;
}

export interface LocalizeContentLocaleResult {
  ok: boolean;
  targetLocale: LocaleKey;
  draftId: string;
  saved: boolean;
  localizedTitle: string;
  localizedTitleEmphasis?: string;
  localizedExcerpt: string;
  localizedText: string;
  terminologyDecisions: TerminologyDecision[];
  qaWarnings: string[];
  attemptsUsed: number;
  guardianApproved: boolean;
  guardianViolations: LocalizationGuardianViolation[];
  publishPolicy?: LocalizationPublishPolicySnapshot;
  error?: string;
}

export interface LocalizeContentResult {
  ok: boolean;
  dryRun: boolean;
  sourcePostId: string;
  sourceLocale: string;
  sourceTitle: string;
  sourceTitleEmphasis?: string;
  locales: LocalizeContentLocaleResult[];
}
