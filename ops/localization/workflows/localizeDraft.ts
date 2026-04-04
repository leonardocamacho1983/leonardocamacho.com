import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type { LocaleKey } from "../../../src/lib/locales";
import { getLocalizationLocaleNotes } from "../localeNotes";
import { getLocalizationPublishPolicy } from "../policy";
import type {
  LocalizationGuardianViolation,
  LocalizationPublishPolicySnapshot,
  TerminologyDecision,
} from "../types/content";

const LOCALIZATION_PROMPT_PATH = path.resolve(process.cwd(), "ops/localization/prompts/localization.system.md");
const LOCALIZATION_GUARDIAN_PROMPT_PATH = path.resolve(process.cwd(), "ops/localization/prompts/localizationGuardian.system.md");

export type LocalizedContentType = "essay" | "insight" | "research" | "note";

export const LOCALIZATION_REVISION_LIMIT = 2;

interface LocalizationCandidate {
  localizedTitle: string;
  localizedTitleEmphasis?: string;
  localizedExcerpt: string;
  localizedText: string;
  localizedSeoTitle?: string;
  localizedSeoDescription?: string;
  terminologyDecisions: TerminologyDecision[];
  qaWarnings: string[];
}

interface GuardianEvaluation {
  approved: boolean;
  qaWarnings: string[];
  violations: LocalizationGuardianViolation[];
}

export interface LocalizeDraftInput {
  sourceText: string;
  sourceLocale: LocaleKey;
  targetLocale: LocaleKey;
  contentType: LocalizedContentType;
  title: string;
  titleEmphasis?: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface LocalizeDraftResult {
  ok: boolean;
  localizedTitle: string;
  localizedTitleEmphasis?: string;
  localizedExcerpt: string;
  localizedText: string;
  localizedSeoTitle?: string;
  localizedSeoDescription?: string;
  terminologyDecisions: TerminologyDecision[];
  qaWarnings: string[];
  attemptsUsed: number;
  guardianApproved: boolean;
  guardianViolations: LocalizationGuardianViolation[];
  publishPolicy: LocalizationPublishPolicySnapshot;
  error?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isCriticalLocalizationViolation = (
  violation: LocalizationGuardianViolation,
  policy: LocalizationPublishPolicySnapshot,
): boolean => {
  if (policy.criticalViolationRules.includes(violation.rule)) {
    return true;
  }

  if (violation.rule !== "other") {
    return false;
  }

  const diagnostic = `${violation.message} ${violation.evidence ?? ""}`;
  return /workflow|placeholder|studio|editorial tooling|meta-process/i.test(diagnostic);
};

const normalizeLocalizationOutput = (
  raw: Record<string, unknown>,
  fallback: Pick<LocalizeDraftInput, "title" | "titleEmphasis" | "excerpt" | "seoTitle" | "seoDescription">,
): LocalizationCandidate => {
  const localizedTitle =
    typeof raw.localizedTitle === "string" && raw.localizedTitle.trim()
      ? raw.localizedTitle.trim()
      : fallback.title;
  const localizedExcerpt =
    typeof raw.localizedExcerpt === "string" && raw.localizedExcerpt.trim()
      ? raw.localizedExcerpt.trim()
      : fallback.excerpt;
  const localizedTitleEmphasis =
    typeof raw.localizedTitleEmphasis === "string" && raw.localizedTitleEmphasis.trim()
      ? raw.localizedTitleEmphasis.trim()
      : fallback.titleEmphasis;
  const localizedText = typeof raw.localizedText === "string" ? raw.localizedText.trim() : "";
  const localizedSeoTitle =
    typeof raw.localizedSeoTitle === "string" && raw.localizedSeoTitle.trim()
      ? raw.localizedSeoTitle.trim()
      : fallback.seoTitle;
  const localizedSeoDescription =
    typeof raw.localizedSeoDescription === "string" && raw.localizedSeoDescription.trim()
      ? raw.localizedSeoDescription.trim()
      : fallback.seoDescription;
  const terminologyDecisions: TerminologyDecision[] = Array.isArray(raw.terminologyDecisions)
    ? raw.terminologyDecisions.filter(
        (v): v is TerminologyDecision =>
          v !== null &&
          typeof v === "object" &&
          typeof (v as Record<string, unknown>).original === "string" &&
          typeof (v as Record<string, unknown>).localized === "string" &&
          typeof (v as Record<string, unknown>).reason === "string",
      )
    : [];
  const qaWarnings = Array.isArray(raw.qaWarnings)
    ? raw.qaWarnings.filter((v): v is string => typeof v === "string")
    : [];

  if (!localizedText) {
    throw new Error("Localization returned empty localizedText.");
  }

  return {
    localizedTitle,
    localizedTitleEmphasis,
    localizedExcerpt,
    localizedText,
    localizedSeoTitle,
    localizedSeoDescription,
    terminologyDecisions,
    qaWarnings,
  };
};

const evaluateLocalizationGuardian = async (input: {
  sourceText: string;
  localizedText: string;
  localizedTitle: string;
  localizedExcerpt: string;
  sourceLocale: LocaleKey;
  targetLocale: LocaleKey;
  contentType: LocalizedContentType;
  terminologyDecisions: TerminologyDecision[];
}): Promise<GuardianEvaluation> => {
  try {
    const guardianRaw = await runPrompt({
      systemPromptPath: LOCALIZATION_GUARDIAN_PROMPT_PATH,
      input,
    });

    if (!isRecord(guardianRaw)) {
      return {
        approved: true,
        qaWarnings: ["[guardian] Localization guardian returned non-object output."],
        violations: [],
      };
    }

    const violations: LocalizationGuardianViolation[] = Array.isArray(guardianRaw.violations)
      ? guardianRaw.violations.flatMap((value) => {
          if (!isRecord(value) || typeof value.rule !== "string" || typeof value.message !== "string") {
            return [];
          }
          return [
            {
              rule: value.rule,
              message: value.message,
              evidence: typeof value.evidence === "string" ? value.evidence : undefined,
            },
          ];
        })
      : [];

    const qaWarnings =
      guardianRaw.approved === false
        ? violations.map((violation) =>
            `[guardian:${violation.rule}] ${violation.message}${violation.evidence ? ` Evidence: ${violation.evidence}` : ""}`,
          )
        : [];

    return {
      approved: guardianRaw.approved !== false,
      qaWarnings,
      violations,
    };
  } catch {
    return {
      approved: true,
      qaWarnings: ["[guardian] Localization guardian failed to run."],
      violations: [],
    };
  }
};

const buildLocalizationRevisionNotes = (violations: LocalizationGuardianViolation[]): string[] =>
  violations.map((violation) =>
    `${violation.rule}: ${violation.message}${violation.evidence ? ` Evidence: ${violation.evidence}` : ""}`,
  );

export const localizeDraft = async (input: LocalizeDraftInput): Promise<LocalizeDraftResult> => {
  const publishPolicy = getLocalizationPublishPolicy(input.targetLocale);
  const localeNotes = getLocalizationLocaleNotes(input.targetLocale);
  let candidate: LocalizationCandidate | null = null;
  let finalGuardian: GuardianEvaluation | null = null;
  let finalQaWarnings: string[] = [];
  let revisionNotes: string[] | undefined;
  let attemptsUsed = 0;

  for (let attempt = 0; attempt <= LOCALIZATION_REVISION_LIMIT; attempt++) {
    attemptsUsed = attempt + 1;

    const raw = await runPrompt({
      systemPromptPath: LOCALIZATION_PROMPT_PATH,
      input: {
        ...input,
        localeNotes,
        revisionNotes,
      },
    });

    if (!isRecord(raw)) {
      throw new Error("Localization prompt returned non-object output.");
    }

    candidate = normalizeLocalizationOutput(raw, input);

    const guardian = await evaluateLocalizationGuardian({
      sourceText: input.sourceText,
      localizedText: candidate.localizedText,
      localizedTitle: candidate.localizedTitle,
      localizedExcerpt: candidate.localizedExcerpt,
      sourceLocale: input.sourceLocale,
      targetLocale: input.targetLocale,
      contentType: input.contentType,
      terminologyDecisions: candidate.terminologyDecisions,
    });

    finalGuardian = guardian;
    finalQaWarnings = [...candidate.qaWarnings, ...guardian.qaWarnings];

    if (guardian.approved || guardian.violations.length === 0 || attempt === LOCALIZATION_REVISION_LIMIT) {
      break;
    }

    revisionNotes = buildLocalizationRevisionNotes(guardian.violations);
  }

  if (!candidate) {
    throw new Error("Localization did not produce a candidate.");
  }

  if (!finalGuardian) {
    throw new Error("Localization guardian did not produce an evaluation.");
  }

  const criticalViolations = finalGuardian.violations.filter((violation) =>
    isCriticalLocalizationViolation(violation, publishPolicy),
  );
  const warningBudgetExceeded = finalQaWarnings.length > publishPolicy.maxQaWarnings;

  if (criticalViolations.length > 0 || warningBudgetExceeded) {
    const failureReasons: string[] = [];

    if (criticalViolations.length > 0) {
      failureReasons.push(
        `critical guardian checks after ${attemptsUsed} attempts: ${criticalViolations
          .map((violation) => violation.rule)
          .join(", ")}`,
      );
    }

    if (warningBudgetExceeded) {
      failureReasons.push(
        `qaWarnings exceeded ${publishPolicy.targetLocale} threshold (${finalQaWarnings.length}/${publishPolicy.maxQaWarnings})`,
      );
    }

    return {
      ok: false,
      localizedTitle: candidate.localizedTitle,
      localizedTitleEmphasis: candidate.localizedTitleEmphasis,
      localizedExcerpt: candidate.localizedExcerpt,
      localizedText: candidate.localizedText,
      localizedSeoTitle: candidate.localizedSeoTitle,
      localizedSeoDescription: candidate.localizedSeoDescription,
      terminologyDecisions: candidate.terminologyDecisions,
      qaWarnings: finalQaWarnings,
      attemptsUsed,
      guardianApproved: finalGuardian.approved,
      guardianViolations: finalGuardian.violations,
      publishPolicy,
      error: `Localization failed ${failureReasons.join("; ")}`,
    };
  }

  return {
    ok: true,
    localizedTitle: candidate.localizedTitle,
    localizedTitleEmphasis: candidate.localizedTitleEmphasis,
    localizedExcerpt: candidate.localizedExcerpt,
    localizedText: candidate.localizedText,
    localizedSeoTitle: candidate.localizedSeoTitle,
    localizedSeoDescription: candidate.localizedSeoDescription,
    terminologyDecisions: candidate.terminologyDecisions,
    qaWarnings: finalQaWarnings,
    attemptsUsed,
    guardianApproved: finalGuardian.approved,
    guardianViolations: finalGuardian.violations,
    publishPolicy,
  };
};
