import {
  fallbackAboutPage,
  fallbackCategories,
  fallbackHomePage,
  fallbackPosts,
  fallbackSiteSettings,
  fallbackWritingPage,
} from "@/lib/fallback-content";
import type {
  AboutPageDTO,
  CategoryDTO,
  HomePageDTO,
  PostCardDTO,
  PostDetailDTO,
  SiteSettingsDTO,
  WritingPageDTO,
} from "@/lib/types";
import type { LocaleKey } from "@/lib/locales";
import { getSanityClient, hasSanityConfig } from "./client";
import {
  ABOUT_PAGE_QUERY,
  CATEGORIES_QUERY,
  HOME_PAGE_QUERY,
  POSTS_QUERY,
  POST_BY_SLUG_QUERY,
  SITE_SETTINGS_QUERY,
  WRITING_PAGE_QUERY,
} from "./queries";

const fetchOrFallback = async <T>(
  query: string,
  params: Record<string, string>,
  fallback: T,
  preview: boolean,
): Promise<T> => {
  if (!hasSanityConfig) {
    return fallback;
  }

  try {
    const client = getSanityClient(preview);
    if (!client) {
      return fallback;
    }
    const result = await client.fetch<T | null>(query, params);
    return result || fallback;
  } catch (error) {
    console.warn("Sanity query failed, using fallback content:", error);
    return fallback;
  }
};

export const getSiteSettings = async (
  locale: LocaleKey,
  preview = false,
): Promise<SiteSettingsDTO> =>
  fetchOrFallback<SiteSettingsDTO>(
    SITE_SETTINGS_QUERY,
    { locale },
    fallbackSiteSettings(locale),
    preview,
  );

export const getHomePage = async (
  locale: LocaleKey,
  preview = false,
): Promise<HomePageDTO> =>
  fetchOrFallback<HomePageDTO>(HOME_PAGE_QUERY, { locale }, fallbackHomePage(locale), preview);

export const getAboutPage = async (
  locale: LocaleKey,
  preview = false,
): Promise<AboutPageDTO> =>
  fetchOrFallback<AboutPageDTO>(ABOUT_PAGE_QUERY, { locale }, fallbackAboutPage(locale), preview);

export const getWritingPage = async (
  locale: LocaleKey,
  preview = false,
): Promise<WritingPageDTO> =>
  fetchOrFallback<WritingPageDTO>(WRITING_PAGE_QUERY, { locale }, fallbackWritingPage(locale), preview);

export const getCategories = async (
  locale: LocaleKey,
  preview = false,
): Promise<CategoryDTO[]> =>
  fetchOrFallback<CategoryDTO[]>(CATEGORIES_QUERY, { locale }, fallbackCategories(locale), preview);

export const getPosts = async (
  locale: LocaleKey,
  preview = false,
): Promise<PostCardDTO[]> =>
  fetchOrFallback<PostCardDTO[]>(POSTS_QUERY, { locale }, fallbackPosts(locale), preview);

export const getPostBySlug = async (
  locale: LocaleKey,
  slug: string,
  preview = false,
): Promise<PostDetailDTO | null> => {
  const fallbackPost = fallbackPosts(locale).find((post) => post.slug === slug);
  const fallback: PostDetailDTO | null = fallbackPost
    ? {
        ...fallbackPost,
        body: [
          {
            _type: "block",
            children: [
              {
                _type: "span",
                text: fallbackPost.excerpt,
                marks: [],
              },
            ],
            markDefs: [],
            style: "normal",
          },
        ],
        translations: [{ locale, slug: fallbackPost.slug }],
      }
    : null;

  if (!hasSanityConfig) {
    return fallback;
  }

  try {
    const client = getSanityClient(preview);
    if (!client) {
      return fallback;
    }
    const result = await client.fetch<PostDetailDTO | null>(POST_BY_SLUG_QUERY, { locale, slug });
    return result || fallback;
  } catch (error) {
    console.warn("Failed to fetch post by slug, using fallback:", error);
    return fallback;
  }
};
