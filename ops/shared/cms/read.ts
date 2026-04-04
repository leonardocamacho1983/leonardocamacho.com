import type { LocaleKey } from "../../../src/lib/locales";
import type { PostCardDTO, PostDetailDTO } from "../../../src/lib/types";
import { getPostBySlug as fetchPostBySlug, getPosts as fetchPosts } from "../../../src/lib/sanity/api";
import { getSanityClient } from "../../../src/lib/sanity/client";

const POST_BY_ID_QUERY = `
*[_type == "post" && (_id == $id || _id == $draftId)][0] {
  "id": _id,
  locale,
  translationKey,
  templateVariant,
  title,
  titleEmphasis,
  "slug": slug.current,
  excerpt,
  coverImage,
  "category": category->{
    "id": _id,
    locale,
    translationKey,
    title,
    "slug": slug.current,
    color,
    order
  },
  publishedAt,
  readTimeMinutes,
  featuredOnHome,
  featuredInArchive,
  flagshipHeroMode,
  body,
  editorialPlan{
    clusterRole,
    mustLinkTo,
    internalLinkPlan[]{
      target,
      kind,
      purpose,
      anchorHint
    }
  },
  seoTitle,
  seoDescription,
  seoImage,
  "translations": *[_type == "post" && translationKey == ^.translationKey && defined(slug.current)] {
    locale,
    "slug": slug.current
  }
}`;

const CATEGORIES_QUERY = `
*[_type == "category" && locale == $locale] | order(order asc) {
  "id": _id,
  translationKey,
  title,
  "slug": slug.current
}[0]
`;

const CATEGORY_BY_KEY_QUERY = `
*[_type == "category" && locale == $locale && translationKey == $translationKey][0] {
  "id": _id
}
`;

const INSPECT_POST_FIELDS = `
{
  "storageId": _id,
  "presentedId": _id,
  "originalId": _originalId,
  locale,
  translationKey,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "_updatedAt": _updatedAt,
  readTimeMinutes,
  featuredOnHome,
  featuredInArchive,
  editorialPlan{
    clusterRole,
    mustLinkTo,
    internalLinkPlan[]{
      target,
      kind,
      purpose,
      anchorHint
    }
  },
  seoTitle,
  seoDescription,
  "category": category->{
    "id": _id,
    locale,
    translationKey,
    title,
    "slug": slug.current
  }
}`;

const PUBLISHED_POST_INSPECT_BY_ID_QUERY = `
*[_type == "post" && _id == $publishedId][0] ${INSPECT_POST_FIELDS}
`;

const DRAFT_POST_INSPECT_BY_ID_QUERY = `
*[_type == "post" && (_id == $draftId || _originalId == $draftId)][0] ${INSPECT_POST_FIELDS}
`;

const PUBLISHED_POST_INSPECT_BY_SLUG_QUERY = `
*[_type == "post" && locale == $locale && slug.current == $slug][0] ${INSPECT_POST_FIELDS}
`;

const DRAFT_POST_INSPECT_BY_SLUG_QUERY = `
*[_type == "post" && locale == $locale && slug.current == $slug && defined(_originalId) && _id != _originalId][0] ${INSPECT_POST_FIELDS}
`;

const PUBLISHED_TRANSLATION_SET_QUERY = `
*[_type == "post" && translationKey == $translationKey] | order(locale asc) ${INSPECT_POST_FIELDS}
`;

const DRAFT_TRANSLATION_SET_QUERY = `
*[_type == "post" && translationKey == $translationKey && defined(_originalId)] | order(locale asc) ${INSPECT_POST_FIELDS}
`;

export interface CmsInspectablePostVersion {
  storageId?: string;
  presentedId: string;
  originalId?: string;
  locale: LocaleKey;
  translationKey: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  _updatedAt?: string;
  readTimeMinutes: number;
  featuredOnHome: boolean;
  featuredInArchive: boolean;
  editorialPlan?: {
    clusterRole?: "pillar" | "support" | "bridge";
    mustLinkTo?: string[];
    internalLinkPlan?: Array<{
      target: string;
      kind: "post" | "core-page";
      purpose: "reinforce" | "bridge" | "next-step";
      anchorHint: string;
    }>;
  };
  seoTitle?: string;
  seoDescription?: string;
  category: {
    id: string;
    locale: LocaleKey;
    translationKey: string;
    title: string;
    slug: string;
  } | null;
}

export interface CmsInspectionResult {
  draft: CmsInspectablePostVersion | null;
  published: CmsInspectablePostVersion | null;
}

type CmsQueryClient = {
  fetch: <T>(query: string, params?: Record<string, unknown>) => Promise<T>;
};

interface CmsInspectClients {
  publishedClient?: CmsQueryClient | null;
  previewClient?: CmsQueryClient | null;
}

export const getPostById = async (
  id: string,
  preview = true,
): Promise<PostDetailDTO | null> => {
  const client = getSanityClient(preview);
  if (!client) {
    return null;
  }

  const cleanId = id.trim();
  if (!cleanId) {
    return null;
  }

  const draftId = cleanId.startsWith("drafts.") ? cleanId : `drafts.${cleanId}`;
  return client.fetch<PostDetailDTO | null>(POST_BY_ID_QUERY, { id: cleanId, draftId });
};

export const getPostBySlug = async (
  locale: LocaleKey,
  slug: string,
  preview = true,
): Promise<PostDetailDTO | null> => fetchPostBySlug(locale, slug, preview);

export const listRecentPosts = async (
  locale: LocaleKey,
  limit = 10,
  preview = true,
): Promise<PostCardDTO[]> => {
  const posts = await fetchPosts(locale, preview);
  return posts.slice(0, Math.max(1, limit));
};

export const getFirstCategoryRef = async (
  locale: LocaleKey,
  preview = true,
): Promise<string | null> => {
  const client = getSanityClient(preview);
  if (!client) {
    return null;
  }

  const category = await client.fetch<{ id: string } | null>(CATEGORIES_QUERY, { locale });
  return category?.id || null;
};

export const getCategoryRefByTranslationKey = async (
  locale: LocaleKey,
  translationKey: string,
  preview = true,
): Promise<string | null> => {
  const client = getSanityClient(preview);
  if (!client) {
    return null;
  }

  const category = await client.fetch<{ id: string } | null>(CATEGORY_BY_KEY_QUERY, {
    locale,
    translationKey,
  });
  return category?.id || null;
};

export const inspectPostById = async (id: string): Promise<CmsInspectionResult> => {
  const cleanId = id.trim();
  if (!cleanId) {
    return { draft: null, published: null };
  }

  const publishedId = cleanId.startsWith("drafts.") ? cleanId.replace(/^drafts\./, "") : cleanId;
  const draftId = cleanId.startsWith("drafts.") ? cleanId : `drafts.${cleanId}`;
  return inspectPostByIdWithClients(
    { publishedId, draftId },
    {
      publishedClient: getSanityClient(false),
      previewClient: getSanityClient(true),
    },
  );
};

export const inspectPostByIdWithClients = async (
  ids: {
    publishedId: string;
    draftId: string;
  },
  clients: CmsInspectClients,
): Promise<CmsInspectionResult> => {
  const { publishedClient, previewClient } = clients;

  const [published, draft] = await Promise.all([
    publishedClient?.fetch<CmsInspectablePostVersion | null>(PUBLISHED_POST_INSPECT_BY_ID_QUERY, {
      publishedId: ids.publishedId,
    }) ?? Promise.resolve(null),
    previewClient?.fetch<CmsInspectablePostVersion | null>(DRAFT_POST_INSPECT_BY_ID_QUERY, {
      draftId: ids.draftId,
    }) ??
      Promise.resolve(null),
  ]);

  return { draft, published };
};

export const inspectPostBySlug = async (
  locale: LocaleKey,
  slug: string,
): Promise<CmsInspectionResult> => {
  const cleanSlug = slug.trim();
  if (!cleanSlug) {
    return { draft: null, published: null };
  }

  const publishedClient = getSanityClient(false);
  const previewClient = getSanityClient(true);

  const [published, draft] = await Promise.all([
    publishedClient?.fetch<CmsInspectablePostVersion | null>(PUBLISHED_POST_INSPECT_BY_SLUG_QUERY, {
      locale,
      slug: cleanSlug,
    }) ?? Promise.resolve(null),
    previewClient?.fetch<CmsInspectablePostVersion | null>(DRAFT_POST_INSPECT_BY_SLUG_QUERY, {
      locale,
      slug: cleanSlug,
    }) ?? Promise.resolve(null),
  ]);

  return { draft, published };
};

export const inspectTranslationSet = async (
  translationKey: string,
): Promise<Record<string, CmsInspectionResult>> => {
  const cleanKey = translationKey.trim();
  if (!cleanKey) {
    return {};
  }

  const publishedClient = getSanityClient(false);
  const previewClient = getSanityClient(true);

  const [publishedDocs, draftDocs] = await Promise.all([
    publishedClient?.fetch<CmsInspectablePostVersion[]>(PUBLISHED_TRANSLATION_SET_QUERY, {
      translationKey: cleanKey,
    }) ?? Promise.resolve([]),
    previewClient?.fetch<CmsInspectablePostVersion[]>(DRAFT_TRANSLATION_SET_QUERY, {
      translationKey: cleanKey,
    }) ?? Promise.resolve([]),
  ]);

  const localeMap = new Map<string, CmsInspectionResult>();

  for (const doc of publishedDocs) {
    localeMap.set(doc.locale, { draft: null, published: doc });
  }

  for (const doc of draftDocs) {
    const current = localeMap.get(doc.locale) ?? { draft: null, published: null };
    current.draft = doc;
    localeMap.set(doc.locale, current);
  }

  return Object.fromEntries(localeMap.entries());
};
