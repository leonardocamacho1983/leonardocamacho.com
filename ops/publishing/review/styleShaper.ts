import path from "node:path";
import { runPrompt } from "../../shared/llm/runPrompt";
import type { StyleShaperInput, StyleShaperOutput } from "../types/styleShaper";

const PROMPT_PATH = path.resolve(process.cwd(), "ops/publishing/prompts/styleShaper.system.md");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new Error(`styleShaper invalid field: ${field} must be a string.`);
  }
  const clean = value.trim();
  if (!clean) {
    throw new Error(`styleShaper invalid field: ${field} cannot be empty.`);
  }
  return clean;
};

const asScore = (value: unknown, field: string): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`styleShaper invalid field: ${field} must be a number.`);
  }
  return Math.max(0, Math.min(100, Math.round(value)));
};

const asChanges = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    throw new Error("styleShaper invalid field: changes must be an array.");
  }

  const changes = value
    .map((item, index) => asString(item, `changes[${index}]`))
    .filter(Boolean);

  if (changes.length === 0) {
    throw new Error("styleShaper invalid field: changes must contain at least one item.");
  }

  return changes;
};

export const styleShaper = async ({ text, contentType, phenomenonType }: StyleShaperInput): Promise<StyleShaperOutput> => {
  const raw = await runPrompt({
    systemPromptPath: PROMPT_PATH,
    input: { text, contentType, phenomenonType },
  });

  if (!isRecord(raw)) {
    throw new Error("styleShaper returned non-object output.");
  }

  const scores = raw.scores;
  if (!isRecord(scores)) {
    throw new Error("styleShaper invalid field: scores must be an object.");
  }

  return {
    revisedText: asString(raw.revisedText, "revisedText"),
    scores: {
      rhythm: asScore(scores.rhythm, "scores.rhythm"),
      compression: asScore(scores.compression, "scores.compression"),
      memorability: asScore(scores.memorability, "scores.memorability"),
    },
    changes: asChanges(raw.changes),
  };
};
