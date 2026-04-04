import type { LocaleKey } from "../../../src/lib/locales";
import type { PostDetailDTO } from "../../../src/lib/types";
import { getPostById, inspectPostById, inspectPostBySlug, getFirstCategoryRef } from "../../shared/cms/read";
import { getCmsWriteClient, markdownToPortableText } from "../../shared/cms/write";
import { extractMarkdownFromPortableText } from "../../shared/cms/portableText";
import { createContent } from "./createContent";
import type { ContentType, CreateContentResult } from "../types/content";
import {
  buildRefreshPlannerInput,
  resolveRefreshSourceSelection,
  type RefreshSourceMode,
} from "./refreshContentHelpers";

export type { RefreshSourceMode } from "./refreshContentHelpers";

export interface RefreshContentInput {
  postId?: string;
  slug?: string;
  locale?: LocaleKey;
  source?: RefreshSourceMode;
  topic?: string;
  audience?: string;
  contentType?: ContentType;
  goal?: string;
  notes?: string[];
  dryRun?: boolean;
}

export interface RefreshContentResult {
  ok: boolean;
  dryRun: boolean;
  source: {
    requested: RefreshSourceMode;
    resolved: RefreshSourceMode;
    fallbackReason?: string;
    postId: string;
    title: string;
    locale: string;
    slug: string;
    translationKey: string;
  } | null;
  generation: CreateContentResult | null;
  refresh: {
    targetDraftId: string | null;
    saved: boolean;
    reason?: string;
  };
  draftDocumentPreview?: RefreshDraftDocument | null;
}

type RefreshDraftDocument = { _id: string; _type: "post" } & Record<string, unknown>;

const clean = (value: string): string => value.trim();

const estimateReadTime = (markdown: string): number => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 220));
};

const mapCategoryToContentType = (source: PostDetailDTO): ContentType => {
  const token = clean((source.category?.translationKey || source.category?.slug || "essay").toLowerCase());
  if (token === "insight") return "insight";
  if (token === "research") return "research";
  if (token === "note" || token === "notes") return "note";
  return "essay";
};

const resolveTargetDraftId = (
  sourceInspection: Awaited<ReturnType<typeof inspectPostById>>,
  sourcePost: PostDetailDTO,
): string => {
  const draftStorageId = sourceInspection.draft?.storageId?.trim();
  if (draftStorageId) {
    return draftStorageId;
  }

  const draftPresentedId = sourceInspection.draft?.presentedId?.trim();
  if (draftPresentedId) {
    return draftPresentedId.startsWith("drafts.") ? draftPresentedId : `drafts.${draftPresentedId}`;
  }

  if (sourceInspection.published?.presentedId) {
    return `drafts.${sourceInspection.published.presentedId}`;
  }

  return sourcePost.id.startsWith("drafts.") ? sourcePost.id : `drafts.${sourcePost.id}`;
};

const toReference = (id: string | null): Record<string, unknown> | undefined =>
  id ? { _type: "reference", _ref: id } : undefined;

const buildRefreshedDraftDocument = async (input: {
  targetDraftId: string;
  sourcePost: PostDetailDTO;
  generation: CreateContentResult;
}): Promise<RefreshDraftDocument> => {
  const revisedMarkdown = input.generation.styleShaper.revisedText;
  const categoryRef =
    input.sourcePost.category?.id ||
    (await getFirstCategoryRef(input.sourcePost.locale, true)) ||
    null;

  return {
    _id: input.targetDraftId,
    _type: "post",
    locale: input.sourcePost.locale,
    translationKey: input.sourcePost.translationKey,
    title: clean(input.generation.writerOutput.title || input.generation.seo?.title || input.sourcePost.title),
    titleEmphasis: input.sourcePost.titleEmphasis,
    slug: { current: clean(input.sourcePost.slug) },
    excerpt: clean(input.generation.seo?.excerpt || input.sourcePost.excerpt),
    coverImage: input.sourcePost.coverImage,
    category: toReference(categoryRef),
    publishedAt: input.sourcePost.publishedAt,
    readTimeMinutes: estimateReadTime(revisedMarkdown),
    featuredOnHome: Boolean(input.sourcePost.featuredOnHome),
    featuredInArchive: Boolean(input.sourcePost.featuredInArchive),
    body: markdownToPortableText(revisedMarkdown),
    editorialPlan: {
      clusterRole: input.generation.brief.contentFunction?.clusterRole,
      mustLinkTo: input.generation.brief.mustLinkTo || [],
      internalLinkPlan: input.generation.brief.internalLinkPlan || [],
    },
    seoTitle: input.generation.seo?.title || input.sourcePost.seoTitle,
    seoDescription: input.generation.seo?.description || input.sourcePost.seoDescription,
    seoImage: input.sourcePost.seoImage,
  };
};

export const refreshContent = async (input: RefreshContentInput): Promise<RefreshContentResult> => {
  const dryRun = input.dryRun ?? true;
  const requestedSource = input.source || "published";
  const audience = clean(input.audience || "founders");

  if (!input.postId && !input.slug) {
    throw new Error("Provide --postId or --slug --locale <locale>.");
  }

  if (input.slug && !input.locale) {
    throw new Error("--slug requires --locale.");
  }

  const sourceInspection = input.postId
    ? await inspectPostById(input.postId)
    : await inspectPostBySlug(input.locale as LocaleKey, input.slug as string);
  const selection = resolveRefreshSourceSelection(requestedSource, sourceInspection);
  const selectedVersion = selection.resolved === "draft" ? sourceInspection.draft : sourceInspection.published;

  if (!selectedVersion?.presentedId) {
    throw new Error("Unable to resolve source post ID for refresh.");
  }

  const sourcePost = await getPostById(selectedVersion.presentedId, selection.resolved === "draft");
  if (!sourcePost) {
    throw new Error(`Source post not found for refresh: ${selectedVersion.presentedId}`);
  }

  const sourceMarkdown = extractMarkdownFromPortableText(sourcePost.body);
  const plannerInput = buildRefreshPlannerInput({
    source: sourcePost,
    sourceMarkdown,
    goal: input.goal,
    extraNotes: input.notes,
  });

  const contentType = input.contentType || mapCategoryToContentType(sourcePost);
  const topic = clean(input.topic || sourcePost.title);
  const generation = await createContent({
    topic,
    contentType,
    audience,
    locale: sourcePost.locale,
    plannerInput,
    dryRun: true,
  });

  const targetDraftId = resolveTargetDraftId(sourceInspection, sourcePost);

  if (!generation.ok) {
    return {
      ok: false,
      dryRun,
      source: {
        requested: requestedSource,
        resolved: selection.resolved,
        fallbackReason: selection.fallbackReason,
        postId: selectedVersion.presentedId,
        title: sourcePost.title,
        locale: sourcePost.locale,
        slug: sourcePost.slug,
        translationKey: sourcePost.translationKey,
      },
      generation,
      refresh: {
        targetDraftId,
        saved: false,
        reason: generation.failureReason || "refresh_generation_rejected",
      },
      draftDocumentPreview: null,
    };
  }

  const draftDocumentPreview = await buildRefreshedDraftDocument({
    targetDraftId,
    sourcePost,
    generation,
  });

  if (!dryRun) {
    const client = getCmsWriteClient();
    await client.createOrReplace(draftDocumentPreview);
  }

  return {
    ok: true,
    dryRun,
    source: {
      requested: requestedSource,
      resolved: selection.resolved,
      fallbackReason: selection.fallbackReason,
      postId: selectedVersion.presentedId,
      title: sourcePost.title,
      locale: sourcePost.locale,
      slug: sourcePost.slug,
      translationKey: sourcePost.translationKey,
    },
    generation,
    refresh: {
      targetDraftId,
      saved: !dryRun,
    },
    draftDocumentPreview,
  };
};
