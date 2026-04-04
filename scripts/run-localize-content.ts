import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";

import type { LocaleKey } from "../src/lib/locales";
import { isLocale, LOCALES } from "../src/lib/locales";
import { localizeDiagramSvg, type DiagramKey } from "../src/diagrams/localization";
import { getFlagshipFigureByDiagramKey, getFlagshipFigureByNumber } from "../src/lib/flagship-figures";
import type { PostDetailDTO } from "../src/lib/types";
import { localizeDraft, type LocalizedContentType } from "../ops/localization/workflows/localizeDraft";
import type { LocalizeContentLocaleResult, LocalizeContentResult } from "../ops/localization/types/content";
import { extractMarkdownFromPortableText } from "../ops/shared/cms/portableText";
import { getCategoryRefByTranslationKey, getPostById, getPostBySlug } from "../ops/shared/cms/read";
import { createDraftPost, markdownToPortableText } from "../ops/shared/cms/write";

const SOURCE_LOCALE: LocaleKey = "en-us";
const ALL_TARGET_LOCALES: LocaleKey[] = LOCALES.map((l) => l.key).filter((k) => k !== SOURCE_LOCALE) as LocaleKey[];
const SEED_PLACEHOLDER_LINE = "This seed content is a placeholder. Replace it with the final article body in Studio.";
const DIAGRAM_PATHS: Record<DiagramKey, string> = {
  "loop-learning": path.resolve(process.cwd(), "src/diagrams/loop-learning.svg"),
  "revision-cost": path.resolve(process.cwd(), "src/diagrams/revision-cost.svg"),
  "signal-filter": path.resolve(process.cwd(), "src/diagrams/signal-filter.svg"),
  "three-moments": path.resolve(process.cwd(), "src/diagrams/three-moments.svg"),
};

const BLOCK_STYLE_TO_MARKDOWN: Record<string, string> = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  h4: "#### ",
  normal: "",
  blockquote: "> ",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const plainTextFromBlock = (block: Record<string, unknown>): string => {
  const children = Array.isArray(block.children) ? block.children : [];
  return children
    .map((child) =>
      isRecord(child) && typeof child.text === "string" ? child.text : "",
    )
    .join("")
    .trim();
};

const isFullyEmphasizedBlock = (block: Record<string, unknown>): boolean => {
  const children = Array.isArray(block.children) ? block.children : [];
  const nonWhitespace = children.filter(
    (child) => isRecord(child) && typeof child.text === "string" && child.text.trim().length > 0,
  );
  return (
    nonWhitespace.length > 0 &&
    nonWhitespace.every(
      (child) => Array.isArray(child.marks) && child.marks.includes("em"),
    )
  );
};

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const parseMultiFlag = (name: string): string[] => {
  const values: string[] = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === name) {
      const value = process.argv[i + 1];
      if (typeof value === "string" && value.length > 0 && !value.startsWith("--")) {
        values.push(value);
      }
    }
  }
  return values;
};

const hasFlag = (name: string): boolean => process.argv.includes(name);

const stripSeedPlaceholder = (text: string): string =>
  text
    .replace(SEED_PLACEHOLDER_LINE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getLocalizedDiagramSvg = (diagramKey: DiagramKey, locale: LocaleKey): string =>
  localizeDiagramSvg(readFileSync(DIAGRAM_PATHS[diagramKey], "utf8"), diagramKey, locale);

const getFigureNumberFromDiagramKey = (diagramKey?: string): "1" | "2" | "3" | "4" | null => {
  if (!diagramKey) return null;
  const figure = getFlagshipFigureByDiagramKey("en-us", diagramKey as never);
  if (!figure) return null;
  const match = /(\d+)/.exec(figure.label);
  return (match?.[1] as "1" | "2" | "3" | "4" | undefined) || null;
};

const serializeFlagshipBodyForLocalization = (body: PostDetailDTO["body"]): string => {
  const blocks = Array.isArray(body) ? body : [];
  const paragraphs: string[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (!isRecord(block)) continue;

    if (block._type === "diagramEmbed") {
      const figureNumber = getFigureNumberFromDiagramKey(
        typeof block.diagramKey === "string" ? block.diagramKey : undefined,
      );
      if (figureNumber) paragraphs.push(`[[FIGURE_${figureNumber}]]`);
      continue;
    }

    if (block._type !== "block") continue;

    const text = plainTextFromBlock(block);
    if (!text) continue;

    const placeholderMatch = /^Figure\s+(\d+)\s+Placeholder$/i.exec(text);
    if (placeholderMatch) {
      paragraphs.push(`[[FIGURE_${placeholderMatch[1]}]]`);
      const next = blocks[index + 1];
      if (isRecord(next) && next._type === "block" && /^Reserve this slot for SVG/i.test(plainTextFromBlock(next))) {
        index += 1;
      }
      continue;
    }

    if (/^Reserve this slot for SVG/i.test(text)) {
      continue;
    }

    const style = typeof (block as Record<string, unknown>).style === "string"
      ? ((block as Record<string, unknown>).style as string)
      : "normal";
    const prefix = BLOCK_STYLE_TO_MARKDOWN[style] ?? "";
    if (isFullyEmphasizedBlock(block)) {
      paragraphs.push(`*${text}*`);
      continue;
    }

    paragraphs.push(`${prefix}${text}`);
  }

  return stripSeedPlaceholder(paragraphs.join("\n\n"));
};

const buildFlagshipBodyBlocks = (localizedText: string, locale: LocaleKey): Array<Record<string, unknown>> =>
  markdownToPortableText(localizedText).flatMap((block, index) => {
    const text = plainTextFromBlock(block);
    const tokenMatch = /^\[\[FIGURE_(\d+)]]$/i.exec(text) || /^FIGURE_(\d+)$/i.exec(text);

    if (!tokenMatch) {
      return [block];
    }

    const figureNumber = tokenMatch[1] as "1" | "2" | "3" | "4";
    const figure = getFlagshipFigureByNumber(locale, figureNumber);
    return [
      {
        _type: "diagramEmbed",
        _key: `diagram-${index}-${figureNumber}`,
        diagramKey: figure.diagramKey,
        label: figure.label,
        caption: figure.caption,
        accessibleText: figure.accessibleText,
        svgCode: getLocalizedDiagramSvg(figure.diagramKey, locale),
      },
    ];
  });

const getSourceTextForLocalization = (post: PostDetailDTO): string => {
  if (post.templateVariant === "flagship" || post.translationKey === "managerial-plasticity") {
    return serializeFlagshipBodyForLocalization(post.body);
  }
  return stripSeedPlaceholder(extractMarkdownFromPortableText(post.body));
};

const main = async (): Promise<void> => {
  const postId = parseFlag("--postId");
  const slug = parseFlag("--slug");
  const dryRun = !hasFlag("--save");
  const useAll = hasFlag("--all");
  const rawTargetLocales = parseMultiFlag("--targetLocale");

  if (!postId && !slug) {
    throw new Error("Missing --postId or --slug");
  }

  const targetLocales: LocaleKey[] = useAll
    ? ALL_TARGET_LOCALES
    : rawTargetLocales.filter((l): l is LocaleKey => {
        if (!isLocale(l)) {
          console.error(`[run-localize-content] Skipping unknown locale: ${l}`);
          return false;
        }
        return true;
      });

  if (targetLocales.length === 0) {
    throw new Error("No valid target locales. Use --targetLocale <locale> or --all.");
  }

  const usePreview = true;
  const resolvedPostId = postId?.startsWith("drafts.") ? postId.slice("drafts.".length) : postId;
  const sourcePost = resolvedPostId
    ? await getPostById(resolvedPostId, usePreview)
    : await getPostBySlug(SOURCE_LOCALE, slug!, usePreview);

  if (!sourcePost) {
    throw new Error(`Source post not found: ${postId ?? slug}`);
  }

  const sourceText = getSourceTextForLocalization(sourcePost);
  if (!sourceText) {
    throw new Error("Source post body is empty or not extractable.");
  }

  const sourceLocale = (sourcePost.locale as LocaleKey) || SOURCE_LOCALE;
  const baseSlug = sourcePost.slug || sourcePost.title || sourcePost.id;
  const categoryTranslationKey = sourcePost.category?.translationKey ?? null;
  const contentType = (categoryTranslationKey ?? "insight") as LocalizedContentType;
  const isFlagship = sourcePost.templateVariant === "flagship" || sourcePost.translationKey === "managerial-plasticity";

  const localeResults: LocalizeContentLocaleResult[] = [];

  for (const targetLocale of targetLocales) {
    try {
      const localized = await localizeDraft({
        sourceText,
        sourceLocale,
        targetLocale,
        contentType,
        title: sourcePost.title,
        titleEmphasis: sourcePost.titleEmphasis,
        excerpt: sourcePost.excerpt,
        seoTitle: sourcePost.seoTitle ?? undefined,
        seoDescription: sourcePost.seoDescription ?? undefined,
      });

      if (!localized.ok) {
        localeResults.push({
          ok: false,
          targetLocale,
          draftId: "",
          saved: false,
          localizedTitle: localized.localizedTitle,
          localizedTitleEmphasis: localized.localizedTitleEmphasis,
          localizedExcerpt: localized.localizedExcerpt,
          localizedText: localized.localizedText,
          terminologyDecisions: localized.terminologyDecisions,
          qaWarnings: localized.qaWarnings,
          attemptsUsed: localized.attemptsUsed,
          guardianApproved: localized.guardianApproved,
          guardianViolations: localized.guardianViolations,
          publishPolicy: localized.publishPolicy,
          error: localized.error,
        });
        continue;
      }

      const categoryRef = categoryTranslationKey
        ? await getCategoryRefByTranslationKey(targetLocale, categoryTranslationKey, usePreview)
        : null;

      const bodyBlocks = isFlagship ? buildFlagshipBodyBlocks(localized.localizedText, targetLocale) : undefined;
      const draft = await createDraftPost({
        locale: targetLocale,
        translationKey: sourcePost.translationKey,
        title: localized.localizedTitle,
        titleEmphasis: localized.localizedTitleEmphasis,
        slug: `${baseSlug}-${targetLocale}`,
        excerpt: localized.localizedExcerpt,
        bodyMarkdown: localized.localizedText,
        bodyBlocks,
        editorialPlan: sourcePost.editorialPlan,
        templateVariant: sourcePost.templateVariant,
        flagshipHeroMode: sourcePost.flagshipHeroMode,
        seoTitle: localized.localizedSeoTitle,
        seoDescription: localized.localizedSeoDescription,
        coverImage: sourcePost.coverImage,
        seoImage: sourcePost.seoImage,
        categoryRef: categoryRef ?? undefined,
        featuredOnHome: sourcePost.featuredOnHome,
        featuredInArchive: sourcePost.featuredInArchive,
        dryRun,
      });

      localeResults.push({
        ok: true,
        targetLocale,
        draftId: draft.draftId,
        saved: !dryRun,
        localizedTitle: localized.localizedTitle,
        localizedTitleEmphasis: localized.localizedTitleEmphasis,
        localizedExcerpt: localized.localizedExcerpt,
        localizedText: localized.localizedText,
        terminologyDecisions: localized.terminologyDecisions,
        qaWarnings: localized.qaWarnings,
        attemptsUsed: localized.attemptsUsed,
        guardianApproved: localized.guardianApproved,
        guardianViolations: localized.guardianViolations,
        publishPolicy: localized.publishPolicy,
      });
    } catch (error) {
      localeResults.push({
        ok: false,
        targetLocale,
        draftId: "",
        saved: false,
        localizedTitle: "",
        localizedTitleEmphasis: undefined,
        localizedExcerpt: "",
        localizedText: "",
        terminologyDecisions: [],
        qaWarnings: [],
        attemptsUsed: 0,
        guardianApproved: false,
        guardianViolations: [],
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const result: LocalizeContentResult = {
    ok: localeResults.every((r) => r.ok),
    dryRun,
    sourcePostId: sourcePost.id,
    sourceLocale,
    sourceTitle: sourcePost.title,
    sourceTitleEmphasis: sourcePost.titleEmphasis,
    locales: localeResults,
  };

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error("[run-localize-content] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
