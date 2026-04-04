import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type { BrandGuardianResult, BrandViolation } from "./types";

export interface BrandGuardianInput {
  text: string;
  contentType: string;
  coreClaim?: string;
  phenomenonType?: string;
  proposedConcepts?: string[];
  resolutionLevel?: string;
  evidenceMode?: string;
}

const PROMPT_PATH = path.resolve(process.cwd(), "ops/publishing/prompts/brandGuardian.system.md");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const parseViolations = (value: unknown): BrandViolation[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      rule: typeof item.rule === "string" ? item.rule : "other",
      message: typeof item.message === "string" ? item.message : "Unspecified violation",
      evidence: typeof item.evidence === "string" ? item.evidence : undefined,
    }));
};

export const brandGuardian = async ({
  text,
  contentType,
  coreClaim,
  phenomenonType,
  proposedConcepts,
  resolutionLevel,
  evidenceMode,
}: BrandGuardianInput): Promise<BrandGuardianResult> => {
  const raw = await runPrompt({
    systemPromptPath: PROMPT_PATH,
    input: { text, contentType, coreClaim, phenomenonType, proposedConcepts, resolutionLevel, evidenceMode },
  });

  if (!isRecord(raw)) {
    throw new Error("brandGuardian received non-object output.");
  }

  const approved = typeof raw.approved === "boolean" ? raw.approved : false;
  const notes = Array.isArray(raw.notes) ? raw.notes.filter((item): item is string => typeof item === "string") : [];
  const conceptWarnings = Array.isArray(raw.conceptWarnings) ? raw.conceptWarnings.filter((item): item is string => typeof item === "string") : [];

  return {
    approved,
    violations: parseViolations(raw.violations),
    notes,
    conceptWarnings,
  };
};
