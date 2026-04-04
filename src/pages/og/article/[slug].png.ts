export const prerender = false;
export const config = {
  runtime: "edge",
};

import type { APIRoute } from "astro";
import { createElement } from "react";
import { categoryLabel } from "@/lib/category-style";
import { isLocale, type LocaleKey } from "@/lib/locales";
import { getPostBySlug } from "@/lib/sanity/api";
import { ArticleOg } from "@/og-components/article";
import { renderOgPng } from "@/og-components/render";
import {
  clampText,
  resolveArticleType,
  splitEditorialTitle,
} from "@/og-components/theme";

const normalizeLocale = (input: string | null): LocaleKey | null => {
  const normalized = (input || "").trim().toLowerCase();
  return isLocale(normalized) ? normalized : null;
};

export const GET: APIRoute = async ({ params, url }) => {
  const slug = (params.slug || "").trim();
  const locale = normalizeLocale(url.searchParams.get("locale"));

  if (!slug) {
    return new Response("Missing article slug.", { status: 400 });
  }

  if (!locale) {
    return new Response("Missing or invalid locale query parameter.", { status: 400 });
  }

  const post = await getPostBySlug(locale, slug, false);
  if (!post) {
    return new Response("Article not found.", { status: 404 });
  }

  const titleOverride = url.searchParams.get("title");
  const titleLine2Override = url.searchParams.get("titleLine2");
  const displayTitle = clampText(
    titleOverride || `${post.title}${post.titleEmphasis ? ` ${post.titleEmphasis}` : ""}`.trim(),
    110,
  );
  const splitTitle = splitEditorialTitle(displayTitle, titleLine2Override);
  const section = categoryLabel(post.category);

  return renderOgPng(
    createElement(ArticleOg, {
      type: resolveArticleType(post.category?.slug, url.searchParams.get("type")),
      section,
      titleLine1: splitTitle.line1,
      titleLine2: splitTitle.line2,
      excerpt: clampText(
        post.excerpt || "Strategy, organizations, and durable advantage.",
        120,
      ),
    }),
  );
};
