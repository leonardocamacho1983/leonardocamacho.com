import type { LocaleKey } from "../../src/lib/locales";
import type { LocalizationPublishPolicySnapshot } from "./types/content";

const BASE_CRITICAL_VIOLATION_RULES = [
  "mechanism",
  "opening_claim",
  "closing_tone",
  "workflow_leakage",
  "argument_completeness",
] as const;

const makePolicy = (
  targetLocale: LocaleKey,
  overrides?: Partial<LocalizationPublishPolicySnapshot>,
): LocalizationPublishPolicySnapshot => ({
  targetLocale,
  maxAttemptsUsed: 3,
  maxQaWarnings: 1,
  criticalViolationRules: [...BASE_CRITICAL_VIOLATION_RULES],
  nativeVoicePriority: "standard",
  rationale: "Preserve mechanism and publishability while allowing minor style warnings when fidelity is intact.",
  ...overrides,
});

const LOCALIZATION_PUBLISH_POLICIES = {
  "en-gb": makePolicy("en-gb", {
    rationale: "EN-GB should preserve mechanism and claim structure without requiring a second editorial voice.",
  }),
  "pt-br": makePolicy("pt-br", {
    rationale: "PT-BR can tolerate one non-critical warning if the mechanism survives and the prose remains executive-natural.",
  }),
  "pt-pt": makePolicy("pt-pt", {
    maxQaWarnings: 0,
    criticalViolationRules: [...BASE_CRITICAL_VIOLATION_RULES, "structural_import"],
    nativeVoicePriority: "strict",
    rationale: "PT-PT requires stricter native-sounding prose and cannot ship with structural-import drift.",
  }),
  "fr-fr": makePolicy("fr-fr", {
    rationale: "FR-FR may retain one non-critical warning, but mechanism and argument completeness remain hard gates.",
  }),
} satisfies Partial<Record<LocaleKey, LocalizationPublishPolicySnapshot>>;

export const getLocalizationPublishPolicy = (targetLocale: LocaleKey): LocalizationPublishPolicySnapshot =>
  targetLocale in LOCALIZATION_PUBLISH_POLICIES
    ? LOCALIZATION_PUBLISH_POLICIES[targetLocale as keyof typeof LOCALIZATION_PUBLISH_POLICIES]!
    : makePolicy(targetLocale, {
        rationale: "Fallback localization publish policy.",
      });
