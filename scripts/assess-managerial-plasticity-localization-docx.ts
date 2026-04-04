import "dotenv/config";

import { execFileSync } from "node:child_process";
import path from "node:path";

import { runPrompt } from "../ops/shared/llm/runPrompt";
import { getPostBySlug } from "../ops/shared/cms/read";
import type { LocaleKey } from "../src/lib/locales";
import type { PostDetailDTO } from "../src/lib/types";

const GUARDIAN_PROMPT_PATH = path.resolve(process.cwd(), "ops/localization/prompts/localizationGuardian.system.md");
const DEFAULT_DOC_PATH = "/Users/leonardocamacho/Downloads/on_managerial_plasticity_localizations.docx";
const SOURCE_SLUG = "on-managerial-plasticity";
const SOURCE_LOCALE: LocaleKey = "en-us";

type SupportedTargetLocale = "pt-br" | "fr-fr";

interface ParsedSection {
  rawLocale: string;
  targetLocale: SupportedTargetLocale | null;
  title: string;
  byline: string;
  localizedText: string;
  skippedReason?: string;
}

interface GuardianResult {
  approved: boolean;
  violations: Array<{
    rule: string;
    message: string;
    evidence?: string;
  }>;
  notes?: string[];
}

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const normalizeLocale = (rawLocale: string): SupportedTargetLocale | null => {
  const normalized = rawLocale.trim().toLowerCase();
  if (normalized === "pt-br") return "pt-br";
  if (normalized === "fr" || normalized === "fr-fr") return "fr-fr";
  return null;
};

const plainTextFromBlock = (block: Record<string, unknown>): string => {
  const children = Array.isArray(block.children) ? block.children : [];
  return children
    .map((child) =>
      child && typeof child === "object" && typeof (child as { text?: unknown }).text === "string"
        ? ((child as { text: string }).text)
        : "",
    )
    .join("")
    .trim();
};

const isFullyEmphasizedBlock = (block: Record<string, unknown>): boolean => {
  const children = Array.isArray(block.children) ? block.children : [];
  const nonWhitespace = children.filter(
    (child) =>
      child &&
      typeof child === "object" &&
      typeof (child as { text?: unknown }).text === "string" &&
      (child as { text: string }).text.trim().length > 0,
  );

  return (
    nonWhitespace.length > 0 &&
    nonWhitespace.every(
      (child) =>
        Array.isArray((child as { marks?: unknown }).marks) &&
        ((child as { marks: string[] }).marks).includes("em"),
    )
  );
};

const serializeFlagshipSource = (post: PostDetailDTO): string => {
  const blocks = Array.isArray(post.body) ? post.body : [];
  const paragraphs: string[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!block || typeof block !== "object") continue;

    if ((block as { _type?: string })._type === "diagramEmbed") {
      const diagramKey = (block as { diagramKey?: string }).diagramKey;
      const figureNumber =
        diagramKey === "loop-learning" ? "1" :
        diagramKey === "signal-filter" ? "2" :
        diagramKey === "three-moments" ? "3" :
        diagramKey === "revision-cost" ? "4" :
        null;
      if (figureNumber) paragraphs.push(`[[FIGURE_${figureNumber}]]`);
      continue;
    }

    if ((block as { _type?: string })._type !== "block") continue;

    const text = plainTextFromBlock(block as Record<string, unknown>);
    if (!text) continue;

    const placeholderMatch = /^Figure\s+(\d+)\s+Placeholder$/i.exec(text);
    if (placeholderMatch) {
      paragraphs.push(`[[FIGURE_${placeholderMatch[1]}]]`);
      continue;
    }

    if (/^Reserve this slot for SVG/i.test(text)) {
      continue;
    }

    const style = typeof (block as { style?: unknown }).style === "string"
      ? ((block as { style: string }).style)
      : "normal";

    if (isFullyEmphasizedBlock(block as Record<string, unknown>)) {
      paragraphs.push(`*${text}*`);
      continue;
    }

    if (style === "h2") {
      paragraphs.push(`## ${text}`);
      continue;
    }

    if (style === "blockquote") {
      paragraphs.push(`> ${text}`);
      continue;
    }

    paragraphs.push(text);
  }

  return paragraphs.join("\n\n").trim();
};

const looksLikeDiagramArt = (line: string): boolean =>
  /[┌┐└┘│─→↑●╱✗]/.test(line) ||
  /^\s{2,}[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s/()\-]{8,}$/.test(line) ||
  /^\s{2,}(Loop|Boucle|Ciclo|Modelo|Modèle|Leitmodell|Kosten|Coût|Das Signal|Le signal)/i.test(line);

const normalizeLocalizedSection = (lines: string[]): string => {
  const paragraphs: string[] = [];
  let insideDiagram = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const figureMatch = /^(FIGURA|FIGURE|ABBILDUNG)\s+(\d+)\s+[—-]/i.exec(line);
    if (figureMatch) {
      paragraphs.push(`[[FIGURE_${figureMatch[2]}]]`);
      insideDiagram = false;
      continue;
    }

    if (looksLikeDiagramArt(rawLine) || insideDiagram) {
      insideDiagram = true;
      continue;
    }

    paragraphs.push(line);
  }

  return paragraphs.join("\n\n").trim();
};

const parseSectionsFromDoc = (text: string): ParsedSection[] => {
  const blocks = text.split(/\f/).join("\n").split(/(?=^Type:\s+Essay\s+\|\s+Locale:)/gm).map((part) => part.trim()).filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n").map((line) => line.replace(/\r/g, ""));
    const header = lines[0] || "";
    const localeMatch = /Locale:\s*([A-Z-]+)/i.exec(header);
    const rawLocale = localeMatch?.[1] || "unknown";
    const targetLocale = normalizeLocale(rawLocale);
    const title = (lines[1] || "").trim();
    const byline = (lines[2] || "").trim();
    const bodyLines = lines.slice(3);

    return {
      rawLocale,
      targetLocale,
      title,
      byline,
      localizedText: normalizeLocalizedSection(bodyLines),
      skippedReason: targetLocale ? undefined : "unsupported_locale",
    };
  });
};

const main = async (): Promise<void> => {
  const docPath = parseFlag("--doc") || DEFAULT_DOC_PATH;
  const sourcePost = await getPostBySlug(SOURCE_LOCALE, SOURCE_SLUG, true);
  if (!sourcePost) {
    throw new Error(`Source post not found: ${SOURCE_SLUG}`);
  }

  const sourceText = serializeFlagshipSource(sourcePost);
  const extracted = execFileSync("textutil", ["-convert", "txt", "-stdout", docPath], {
    encoding: "utf8",
  });
  const sections = parseSectionsFromDoc(extracted);

  const results = [];
  for (const section of sections) {
    if (!section.targetLocale) {
      results.push({
        rawLocale: section.rawLocale,
        skipped: true,
        reason: section.skippedReason,
      });
      continue;
    }

    const guardianRaw = await runPrompt({
      systemPromptPath: GUARDIAN_PROMPT_PATH,
      input: {
        sourceText,
        localizedText: section.localizedText,
        localizedTitle: section.title,
        localizedExcerpt: "",
        sourceLocale: SOURCE_LOCALE,
        targetLocale: section.targetLocale,
        contentType: "essay",
        terminologyDecisions: [],
      },
    });

    results.push({
      rawLocale: section.rawLocale,
      targetLocale: section.targetLocale,
      title: section.title,
      byline: section.byline,
      assessment: guardianRaw as GuardianResult,
    });
  }

  console.log(JSON.stringify({
    sourceLocale: SOURCE_LOCALE,
    sourceSlug: SOURCE_SLUG,
    assessedAt: new Date().toISOString(),
    docPath,
    results,
  }, null, 2));
};

main().catch((error) => {
  console.error("[assess-managerial-plasticity-localization-docx] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
