import { createClient, type SanityClient } from "@sanity/client";
import type { LocaleKey } from "../../../src/lib/locales";
import { getFirstCategoryRef, getPostById } from "./read";
import { validateDraftInternalLinkPreflight } from "./internalLinking";

export interface DraftPostInput {
  locale: LocaleKey;
  translationKey: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  bodyBlocks?: Array<Record<string, unknown>>;
  editorialPlan?: DraftEditorialPlanInput;
  contentType?: "essay" | "insight" | "research" | "note";
  templateVariant?: "standard" | "flagship";
  flagshipHeroMode?: "image" | "illustration";
  titleEmphasis?: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: unknown;
  seoImage?: unknown;
  categoryRef?: string;
  readTimeMinutes?: number;
  publishedAt?: string;
  featuredOnHome?: boolean;
  featuredInArchive?: boolean;
  dryRun?: boolean;
}

export interface DraftWriteResult {
  dryRun: boolean;
  draftId: string;
  document: { _id: string; _type: string } & Record<string, unknown>;
}

export interface UpdatePostInput {
  postId: string;
  patch: Record<string, unknown>;
  dryRun?: boolean;
}

export interface LocalizedDraftInput {
  sourcePostId: string;
  targetLocale: LocaleKey;
  dryRun?: boolean;
}

type EditorialClusterRole = "pillar" | "support" | "bridge";
type EditorialInternalLinkKind = "post" | "core-page";
type EditorialInternalLinkPurpose = "reinforce" | "bridge" | "next-step";

interface DraftEditorialInternalLinkPlanItem {
  target: string;
  kind: EditorialInternalLinkKind;
  purpose: EditorialInternalLinkPurpose;
  anchorHint: string;
}

export interface DraftEditorialPlanInput {
  clusterRole?: EditorialClusterRole;
  mustLinkTo?: string[];
  internalLinkPlan?: DraftEditorialInternalLinkPlanItem[];
}

const sanitize = (value: string): string => value.trim();

const toSlug = (value: string): string =>
  sanitize(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);

const estimateReadTime = (markdown: string): number => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 220));
};

type PortableTextSpan = {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
};

type PortableTextMarkDef = {
  _type: "link";
  _key: string;
  href: string;
};

type PortableTextBlock = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: PortableTextMarkDef[];
  children: PortableTextSpan[];
};

const HEADING_RE = /^(#{1,4})\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s+(.+)$/;

const headingStyle = (hashes: string): string => {
  const level = hashes.length;
  return level <= 4 ? `h${level}` : "normal";
};

// Parse inline markdown (bold, italic, links) into Portable Text spans + markDefs.
// Handles: **bold**, *italic*, [text](url), and combinations.
const parseInline = (
  raw: string,
  blockKey: string,
): { spans: PortableTextSpan[]; markDefs: PortableTextMarkDef[] } => {
  const spans: PortableTextSpan[] = [];
  const markDefs: PortableTextMarkDef[] = [];
  // Token: link | bold | italic | text
  const TOKEN_RE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|([^*[\]]+)/g;
  let spanIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(raw)) !== null) {
    const spanKey = `${blockKey}-s${spanIndex++}`;
    if (match[1] !== undefined) {
      // Link: [text](url)
      const linkKey = `${blockKey}-l${markDefs.length}`;
      markDefs.push({ _type: "link", _key: linkKey, href: match[2] });
      spans.push({ _type: "span", _key: spanKey, text: match[1], marks: [linkKey] });
    } else if (match[3] !== undefined) {
      // Bold: **text**
      spans.push({ _type: "span", _key: spanKey, text: match[3], marks: ["strong"] });
    } else if (match[4] !== undefined) {
      // Italic: *text*
      spans.push({ _type: "span", _key: spanKey, text: match[4], marks: ["em"] });
    } else if (match[5] !== undefined) {
      spans.push({ _type: "span", _key: spanKey, text: match[5], marks: [] });
    }
  }

  return { spans, markDefs };
};

export const markdownToPortableText = (markdown: string): Array<Record<string, unknown>> => {
  const rawBlocks = markdown
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (rawBlocks.length === 0) {
    return [
      {
        _type: "block",
        _key: "block-0",
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: "block-0-s0", text: "Draft pending.", marks: [] }],
      },
    ];
  }

  return rawBlocks.map((raw, index): PortableTextBlock => {
    const blockKey = `block-${index}`;

    const headingMatch = HEADING_RE.exec(raw);
    if (headingMatch) {
      const style = headingStyle(headingMatch[1]);
      const { spans, markDefs } = parseInline(headingMatch[2], blockKey);
      return { _type: "block", _key: blockKey, style, markDefs, children: spans };
    }

    const quoteMatch = BLOCKQUOTE_RE.exec(raw);
    if (quoteMatch) {
      const { spans, markDefs } = parseInline(quoteMatch[1], blockKey);
      return { _type: "block", _key: blockKey, style: "blockquote", markDefs, children: spans };
    }

    const { spans, markDefs } = parseInline(raw, blockKey);
    return { _type: "block", _key: blockKey, style: "normal", markDefs, children: spans };
  }) as Array<Record<string, unknown>>;
};

const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";
const usePreviewDraftReads = (): boolean => readEnv("SANITY_WORKFLOW_USE_PREVIEW_DRAFTS") === "true";

const getWriteClient = (): SanityClient => {
  const projectId = readEnv("PUBLIC_SANITY_PROJECT_ID");
  const dataset = readEnv("PUBLIC_SANITY_DATASET");
  const token = readEnv("SANITY_API_WRITE_TOKEN");
  const apiVersion = readEnv("SANITY_API_VERSION") || "2025-02-01";

  if (!projectId || !dataset || !token) {
    throw new Error("Missing Sanity write configuration: PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN");
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion,
    useCdn: false,
  });
};

export const getCmsWriteClient = (): SanityClient => getWriteClient();

const resolveDraftId = (translationKey: string, locale: LocaleKey): string =>
  `drafts.post-${translationKey}-${locale}`;

const sanitizeEditorialPlan = (
  input?: DraftEditorialPlanInput,
): Record<string, unknown> | undefined => {
  if (!input) {
    return undefined;
  }

  const clusterRole = input.clusterRole && ["pillar", "support", "bridge"].includes(input.clusterRole)
    ? input.clusterRole
    : undefined;
  const mustLinkTo = Array.isArray(input.mustLinkTo)
    ? input.mustLinkTo
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const internalLinkPlan = Array.isArray(input.internalLinkPlan)
    ? input.internalLinkPlan
        .filter((item): item is DraftEditorialInternalLinkPlanItem => Boolean(item) && typeof item === "object")
        .map((item) => {
          const target = typeof item.target === "string" ? item.target.trim() : "";
          const anchorHint = typeof item.anchorHint === "string" ? item.anchorHint.trim() : "";
          return {
            target,
            kind: item.kind,
            purpose: item.purpose,
            anchorHint,
          };
        })
        .filter(
          (item) =>
            item.target &&
            item.anchorHint &&
            ["post", "core-page"].includes(item.kind) &&
            ["reinforce", "bridge", "next-step"].includes(item.purpose),
        )
    : [];

  if (!clusterRole && mustLinkTo.length === 0 && internalLinkPlan.length === 0) {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  if (clusterRole) {
    result.clusterRole = clusterRole;
  }
  if (mustLinkTo.length > 0) {
    result.mustLinkTo = mustLinkTo;
  }
  if (internalLinkPlan.length > 0) {
    result.internalLinkPlan = internalLinkPlan;
  }
  return result;
};

export const createDraftPost = async (input: DraftPostInput): Promise<DraftWriteResult> => {
  const dryRun = input.dryRun ?? true;
  const translationKey = sanitize(input.translationKey);
  const slug = toSlug(input.slug || input.title);
  const draftId = resolveDraftId(translationKey, input.locale);
  const categoryRef = input.categoryRef || (await getFirstCategoryRef(input.locale, usePreviewDraftReads()));
  const editorialPlan = sanitizeEditorialPlan(input.editorialPlan);

  const document: { _id: string; _type: string } & Record<string, unknown> = {
    _id: draftId,
    _type: "post",
    locale: input.locale,
    translationKey,
    templateVariant: input.templateVariant || "standard",
    title: sanitize(input.title),
    titleEmphasis: input.titleEmphasis ? sanitize(input.titleEmphasis) : undefined,
    slug: { current: slug },
    excerpt: sanitize(input.excerpt),
    category: categoryRef ? { _type: "reference", _ref: categoryRef } : undefined,
    publishedAt: input.publishedAt || new Date().toISOString(),
    readTimeMinutes: input.readTimeMinutes || estimateReadTime(input.bodyMarkdown),
    featuredOnHome: input.featuredOnHome ?? false,
    featuredInArchive: input.featuredInArchive ?? false,
    body: input.bodyBlocks && input.bodyBlocks.length > 0 ? input.bodyBlocks : markdownToPortableText(input.bodyMarkdown),
    flagshipHeroMode: input.flagshipHeroMode,
    coverImage: input.coverImage,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    seoImage: input.seoImage,
    editorialPlan,
  };

  if (!dryRun) {
    const client = getWriteClient();
    await client.createOrReplace(document);
  }

  return {
    dryRun,
    draftId,
    document,
  };
};

export const updatePost = async (input: UpdatePostInput): Promise<{ dryRun: boolean; targetId: string }> => {
  const dryRun = input.dryRun ?? true;
  const cleanId = sanitize(input.postId);
  const targetId = cleanId.startsWith("drafts.") ? cleanId : `drafts.${cleanId}`;

  if (!dryRun) {
    const client = getWriteClient();
    await client.patch(targetId).set(input.patch).commit({ autoGenerateArrayKeys: true });
  }

  return { dryRun, targetId };
};

export interface PublishDraftInput {
  draftId: string;
  dryRun?: boolean;
}

export interface PublishDraftResult {
  dryRun: boolean;
  draftId: string;
  publishedId: string;
  title: string;
  locale: string;
}

export const publishDraft = async (input: PublishDraftInput): Promise<PublishDraftResult> => {
  const dryRun = input.dryRun ?? true;
  const rawId = sanitize(input.draftId);
  const draftId = rawId.startsWith("drafts.") ? rawId : `drafts.${rawId}`;
  const publishedId = draftId.replace(/^drafts\./, "");

  const client = getWriteClient();
  const draft = await client.getDocument<Record<string, unknown>>(draftId);
  if (!draft) {
    throw new Error(`Draft not found: ${draftId}`);
  }

  const internalLinkPreflight = validateDraftInternalLinkPreflight(draft);
  if (!internalLinkPreflight.ok) {
    throw new Error(
      [
        "[code=publish_internal_link_preflight_failed]",
        internalLinkPreflight.reason || "Publish blocked by internal-link preflight.",
        `[clusterRole=${internalLinkPreflight.clusterRole ?? "none"}]`,
        `[plannedTargets=${internalLinkPreflight.plannedTargets.join("|") || "none"}]`,
      ].join(" "),
    );
  }

  const title = typeof draft.title === "string" ? draft.title : "";
  const locale = typeof draft.locale === "string" ? draft.locale : "";

  if (!dryRun) {
    const published = { ...draft, _id: publishedId };
    await client.createOrReplace(published);
    await client.delete(draftId);
  }

  return { dryRun, draftId, publishedId, title, locale };
};

export const createLocalizedDraft = async (
  input: LocalizedDraftInput,
): Promise<DraftWriteResult> => {
  const source = await getPostById(input.sourcePostId, usePreviewDraftReads());
  if (!source) {
    throw new Error(`Source post not found: ${input.sourcePostId}`);
  }

  const baseSlug = source.slug || source.title || source.id;
  const localizedSlug = `${toSlug(baseSlug)}-${input.targetLocale}`;

  return createDraftPost({
    locale: input.targetLocale,
    translationKey: source.translationKey,
    title: source.title,
    titleEmphasis: source.titleEmphasis,
    slug: localizedSlug,
    excerpt: source.excerpt,
    bodyMarkdown: source.excerpt,
    editorialPlan: source.editorialPlan,
    templateVariant: source.templateVariant,
    flagshipHeroMode: source.flagshipHeroMode,
    seoTitle: source.seoTitle,
    seoDescription: source.seoDescription,
    coverImage: source.coverImage,
    seoImage: source.seoImage,
    featuredOnHome: source.featuredOnHome,
    featuredInArchive: source.featuredInArchive,
    dryRun: input.dryRun ?? true,
  });
};
