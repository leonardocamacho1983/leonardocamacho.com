import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type { AntiSyntheticReviewResult, ReviewerIssue, ReviewerSeverity } from "./types";

export interface AntiSyntheticInput {
  text: string;
  contentType: string;
  phenomenonType?: string;
}

const PROMPT_PATH = path.resolve(process.cwd(), "ops/publishing/prompts/antiSynthetic.system.md");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readSeverity = (value: unknown): ReviewerSeverity => {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  return "medium";
};

const parseIssues = (value: unknown): ReviewerIssue[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((issue) => ({
      code: typeof issue.code === "string" ? issue.code : "OTHER",
      message: typeof issue.message === "string" ? issue.message : "Unspecified issue",
      excerpt: typeof issue.excerpt === "string" ? issue.excerpt : undefined,
      severity: readSeverity(issue.severity),
    }));
};

export const antiSyntheticReviewer = async ({ text, contentType, phenomenonType }: AntiSyntheticInput): Promise<AntiSyntheticReviewResult> => {
  const raw = await runPrompt({
    systemPromptPath: PROMPT_PATH,
    input: { text, contentType, phenomenonType },
  });

  if (!isRecord(raw)) {
    throw new Error("antiSyntheticReviewer received non-object output.");
  }

  const revisedText = typeof raw.revisedText === "string" ? raw.revisedText.trim() : "";
  const scores = isRecord(raw.scores) ? raw.scores : {};
  const artificiality = typeof scores.artificiality === "number" ? scores.artificiality : NaN;
  const authorialPresence = typeof scores.authorialPresence === "number" ? scores.authorialPresence : NaN;
  const concreteness = typeof scores.concreteness === "number" ? scores.concreteness : NaN;

  if (!revisedText) {
    throw new Error("antiSyntheticReviewer returned empty revisedText.");
  }

  if (![artificiality, authorialPresence, concreteness].every(Number.isFinite)) {
    throw new Error("antiSyntheticReviewer returned invalid score fields.");
  }

  const changes = Array.isArray(raw.changes) ? raw.changes.filter((item): item is string => typeof item === "string") : [];

  return {
    revisedText,
    scores: {
      artificiality,
      authorialPresence,
      concreteness,
    },
    issues: parseIssues(raw.issues),
    changes,
  };
};
