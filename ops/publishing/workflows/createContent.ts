import path from "node:path";
import { antiSyntheticReviewer } from "../review/antiSyntheticReviewer";
import { brandGuardian } from "../review/brandGuardian";
import { styleShaper } from "../review/styleShaper";
import { createDraftPost } from "../../shared/cms/write";
import { generateMetadata } from "../finalize/generateMetadata";
import { trackEditorialEvent } from "../../shared/analytics/trackEditorialEvent";
import { getCategoryRefByTranslationKey } from "../../shared/cms/read";
import { runPrompt } from "../../shared/llm/runPrompt";
import { DEFAULT_LOCALE, isLocale, type LocaleKey } from "../../../src/lib/locales";
import { generateBrief } from "./generateBrief";
import type { BrandViolation } from "../review/types";
import type { ContentBrief, CreateContentInput, CreateContentResult } from "../types/content";

interface WriterOutput {
  title: string;
  bodyMarkdown: string;
  summary: string;
  model: string;
  proposedConcepts: string[];
}

const WRITER_PROMPT_PATH = path.resolve(process.cwd(), "ops/publishing/prompts/writer.system.md");
const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";
const usePreviewDraftReads = (): boolean => readEnv("SANITY_WORKFLOW_USE_PREVIEW_DRAFTS") === "true";

const clean = (value: string): string => value.trim();

const nowSuffix = (): string => new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 12);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const runWriterPrompt = async (brief: ContentBrief, violations?: BrandViolation[]): Promise<WriterOutput> => {
  const raw = await runPrompt({
    systemPromptPath: WRITER_PROMPT_PATH,
    input: { brief, violations: violations ?? [] },
  });

  if (!isRecord(raw)) {
    throw new Error("Writer prompt returned non-object output.");
  }

  const title = typeof raw.title === "string" ? clean(raw.title) : "";
  const bodyMarkdown = typeof raw.bodyMarkdown === "string" ? clean(raw.bodyMarkdown) : "";
  const summary = typeof raw.summary === "string" ? clean(raw.summary) : "";

  if (!title || !bodyMarkdown || !summary) {
    throw new Error("Writer prompt returned invalid fields.");
  }

  const proposedConcepts = Array.isArray(raw.proposedConcepts)
    ? raw.proposedConcepts.filter((item): item is string => typeof item === "string")
    : [];

  return {
    title,
    bodyMarkdown,
    summary,
    model: readEnv("EDITORIAL_LLM_MODEL") || "gpt-4.1-mini",
    proposedConcepts,
  };
};

const resolveLocale = (value: string | undefined): LocaleKey => {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const lowered = value.toLowerCase();
  return isLocale(lowered) ? lowered : DEFAULT_LOCALE;
};

const resolveCategoryTranslationKey = (contentType: string): string => {
  if (contentType === "insight") return "insight";
  if (contentType === "research") return "research";
  if (contentType === "note") return "note";
  return "essay";
};

export const createContent = async (input: CreateContentInput): Promise<CreateContentResult> => {
  if (!input.plannerInput) {
    throw new Error(
      "[createContent] plannerInput is required. Provide --goal and at least one of --notes, --thesisHint, or --examples.",
    );
  }

  const dryRun = input.dryRun ?? true;
  const locale = resolveLocale(input.locale);
  const topic = clean(input.topic);
  const audience = clean(input.audience);
  const { brief } = await generateBrief({
    topic,
    audience,
    locale,
    goal: input.plannerInput.goal,
    notes: input.plannerInput.notes,
    thesisHint: input.plannerInput.thesisHint,
    examples: input.plannerInput.examples,
    sourceMode: input.plannerInput.sourceMode,
    requestedContentType: input.contentType,
    seoContext: input.plannerInput.seoContext,
    seoOpportunity: input.plannerInput.seoOpportunity,
    clusterContext: input.plannerInput.clusterContext,
    seoFeedback: input.plannerInput.seoFeedback,
  });
  const contentType = brief.contentType;

  const events: CreateContentResult["events"] = [];

  const started = await trackEditorialEvent("workflow_started", {
    workflow: "createContent",
    contentType,
    locale,
  });
  events.push({ event: "workflow_started", sent: started.sent, reason: started.reason });

  let writerOutput = await runWriterPrompt(brief, input.revisionViolations);

  let antiSynthetic = await antiSyntheticReviewer({
    text: writerOutput.bodyMarkdown,
    contentType,
    phenomenonType: brief.phenomenonType,
  });

  let styleShaperResult = await styleShaper({
    text: antiSynthetic.revisedText,
    contentType,
    phenomenonType: brief.phenomenonType,
  });

  let brandCheck = await brandGuardian({
    text: styleShaperResult.revisedText,
    contentType,
    coreClaim: brief.coreClaim,
    phenomenonType: brief.phenomenonType,
    proposedConcepts: writerOutput.proposedConcepts,
    resolutionLevel: brief.resolutionLevel,
    evidenceMode: brief.evidenceMode,
  });

  let retryCount = 0;
  let firstPassBrandGuardian: typeof brandCheck | undefined;
  if (!brandCheck.approved) {
    firstPassBrandGuardian = brandCheck;
    retryCount = 1;
    writerOutput = await runWriterPrompt(brief, brandCheck.violations);

    antiSynthetic = await antiSyntheticReviewer({
      text: writerOutput.bodyMarkdown,
      contentType,
      phenomenonType: brief.phenomenonType,
    });

    styleShaperResult = await styleShaper({
      text: antiSynthetic.revisedText,
      contentType,
      phenomenonType: brief.phenomenonType,
    });

    brandCheck = await brandGuardian({
      text: styleShaperResult.revisedText,
      contentType,
      coreClaim: brief.coreClaim,
      phenomenonType: brief.phenomenonType,
      proposedConcepts: writerOutput.proposedConcepts,
      resolutionLevel: brief.resolutionLevel,
      evidenceMode: brief.evidenceMode,
    });
  }

  if (!brandCheck.approved) {
    const reason = brandCheck.violations.map((item) => item.rule).join(",") || "brand_guardian_rejected";
    const failed = await trackEditorialEvent("review_failed", {
      workflow: "createContent",
      contentType,
      locale,
      reason,
    });
    events.push({ event: "review_failed", sent: failed.sent, reason: failed.reason });

    return {
      ok: false,
      status: "rejected",
      dryRun,
      brief,
      writerOutput,
      antiSynthetic,
      styleShaper: styleShaperResult,
      brandGuardian: brandCheck,
      firstPassBrandGuardian,
      retry: {
        attempted: retryCount > 0,
        count: retryCount,
      },
      seo: null,
      sanity: null,
      failureReason: reason,
      events,
    };
  }

  const seo = generateMetadata({
    topic,
    contentType,
    audience,
    draftText: styleShaperResult.revisedText,
  });

  const translationKey = `comp-os-${seo.slug}-${nowSuffix()}`;
  const categoryRef = await getCategoryRefByTranslationKey(
    locale,
    resolveCategoryTranslationKey(contentType),
    usePreviewDraftReads(),
  );

  const saved = await createDraftPost({
    locale,
    translationKey,
    title: writerOutput.title || seo.title,
    slug: `${seo.slug}-${nowSuffix().slice(0, 8)}`,
    excerpt: seo.excerpt,
    bodyMarkdown: styleShaperResult.revisedText,
    editorialPlan: {
      clusterRole: brief.contentFunction?.clusterRole,
      mustLinkTo: brief.mustLinkTo,
      internalLinkPlan: brief.internalLinkPlan,
    },
    contentType,
    seoTitle: seo.title,
    seoDescription: seo.description,
    categoryRef: categoryRef || undefined,
    dryRun,
  });

  const created = await trackEditorialEvent("draft_created", {
    workflow: "createContent",
    contentType,
    locale,
    draftId: saved.draftId,
  });
  events.push({ event: "draft_created", sent: created.sent, reason: created.reason });

  return {
    ok: true,
    status: "approved",
    dryRun,
    brief,
    writerOutput,
    antiSynthetic,
    styleShaper: styleShaperResult,
    brandGuardian: brandCheck,
    firstPassBrandGuardian,
    retry: {
      attempted: retryCount > 0,
      count: retryCount,
    },
    seo,
    sanity: {
      draftId: saved.draftId,
      saved: !dryRun,
    },
    events,
  };
};
