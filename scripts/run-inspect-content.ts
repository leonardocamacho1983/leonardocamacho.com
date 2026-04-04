import "dotenv/config";
import { inspectPostById, inspectPostBySlug, inspectTranslationSet } from "../ops/shared/cms/read";
import { isLocale, type LocaleKey } from "../src/lib/locales";
import { deriveEditorialStatus } from "../ops/publishing/status/editorialStatus";

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const normalizeOrigin = (value: string): string => value.replace(/\/+$/, "");

const parseConfiguredOrigin = (value: string | undefined): string | null => {
  const configured = (value || "").trim();
  if (!configured) {
    return null;
  }

  try {
    const parsed = new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`);
    if (LOCAL_HOSTS.has(parsed.hostname)) {
      return null;
    }
    return normalizeOrigin(parsed.origin);
  } catch {
    return null;
  }
};

const resolveSiteOrigin = (): string => {
  return (
    parseConfiguredOrigin(process.env.PUBLIC_SITE_URL) ||
    parseConfiguredOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    parseConfiguredOrigin(process.env.VERCEL_URL) ||
    "https://www.leonardocamacho.com"
  );
};

const absoluteUrl = (path: string): string => {
  const origin = resolveSiteOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

const previewPathForPost = (locale: string, slug?: string): string | null =>
  slug ? `/${locale}/writing/${slug}` : null;

const summarizeInspection = (inspection: Awaited<ReturnType<typeof inspectPostById>>) => {
  const draft = inspection.draft;
  const published = inspection.published;
  const primary = draft ?? published;
  const state = deriveEditorialStatus({
    hasDraft: Boolean(draft),
    hasPublished: Boolean(published),
  });

  const contentPath = primary ? previewPathForPost(primary.locale, primary.slug) : null;
  const liveUrl = published && contentPath ? absoluteUrl(contentPath) : null;

  return {
    locale: primary?.locale ?? null,
    translationKey: primary?.translationKey ?? null,
    title: primary?.title ?? null,
    slug: primary?.slug ?? null,
    excerpt: primary?.excerpt ?? null,
    category: primary?.category ?? null,
    updatedAt: draft?._updatedAt ?? published?._updatedAt ?? null,
    publishedAt: published?.publishedAt ?? draft?.publishedAt ?? null,
    readTimeMinutes: primary?.readTimeMinutes ?? null,
    ids: {
      draftId: draft?.storageId ?? draft?.originalId ?? null,
      publishedId: published?.presentedId ?? draft?.presentedId ?? null,
    },
    workflow: state,
    visibility: {
      contentPath,
      previewPath: contentPath,
      previewRequiresPreviewMode: Boolean(draft),
      liveUrl,
      liveAvailable: Boolean(liveUrl),
    },
    versions: {
      draft: draft
        ? {
            id: draft.storageId ?? draft.originalId ?? draft.presentedId,
            updatedAt: draft._updatedAt ?? null,
            seoTitle: draft.seoTitle ?? null,
            seoDescription: draft.seoDescription ?? null,
          }
        : null,
      published: published
        ? {
            id: published.presentedId,
            updatedAt: published._updatedAt ?? null,
            seoTitle: published.seoTitle ?? null,
            seoDescription: published.seoDescription ?? null,
          }
        : null,
    },
  };
};

const main = async (): Promise<void> => {
  const postId = parseFlag("--postId");
  const slug = parseFlag("--slug");
  const locale = parseFlag("--locale");
  const translationKey = parseFlag("--translationKey");

  if (!postId && !translationKey && !slug) {
    throw new Error("Provide --postId, --translationKey, or --slug --locale <locale>");
  }

  if (slug && (!locale || !isLocale(locale))) {
    throw new Error("--slug requires a valid --locale");
  }

  if (translationKey) {
    const locales = await inspectTranslationSet(translationKey);
    const localeSummaries = Object.entries(locales).map(([, inspection]) => summarizeInspection(inspection));

    const summary = localeSummaries.reduce(
      (acc, current) => {
        acc[current.workflow.status] = (acc[current.workflow.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log(
      JSON.stringify(
        {
          ok: localeSummaries.length > 0,
          mode: "translation_set",
          translationKey,
          summary,
          locales: localeSummaries,
        },
        null,
        2,
      ),
    );
    return;
  }

  const inspection = postId
    ? await inspectPostById(postId)
    : await inspectPostBySlug(locale as LocaleKey, slug!);
  const summary = summarizeInspection(inspection);

  console.log(
    JSON.stringify(
      {
        ok: summary.workflow.status !== "missing",
        mode: "single",
        input: {
          postId: postId ?? null,
          slug: slug ?? null,
          locale: locale ?? null,
        },
        post: summary,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[run-inspect-content] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
