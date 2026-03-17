import type { APIRoute } from "astro";
import { LOCALES } from "../lib/locales";
import { getPosts } from "../lib/sanity/api";

interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

const WELCOME_PATHS = ["/welcome", "/pt-br/welcome", "/pt/welcome", "/fr/welcome"];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

const getOrigin = (requestUrl: URL) => {
  const configured = (import.meta.env.PUBLIC_SITE_URL || "").trim();
  if (!configured) {
    return normalizeOrigin(requestUrl.origin);
  }

  try {
    return normalizeOrigin(new URL(configured).origin);
  } catch {
    return normalizeOrigin(requestUrl.origin);
  }
};

const absoluteUrl = (origin: string, path: string) => `${origin}${path.startsWith("/") ? path : `/${path}`}`;

const validIsoDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString();
};

export const GET: APIRoute = async ({ url }) => {
  const origin = getOrigin(url);
  const entries = new Map<string, SitemapEntry>();

  const localePaths = LOCALES.flatMap(({ key }) => [
    `/${key}`,
    `/${key}/about`,
    `/${key}/writing`,
    `/${key}/privacy`,
  ]);

  for (const path of [...localePaths, ...WELCOME_PATHS]) {
    const loc = absoluteUrl(origin, path);
    entries.set(loc, { loc });
  }

  const postsByLocale = await Promise.all(
    LOCALES.map(async ({ key }) => {
      const posts = await getPosts(key, false);
      return posts.map((post) => {
        const loc = absoluteUrl(origin, `/${key}/writing/${post.slug}`);
        return {
          loc,
          lastmod: validIsoDate(post.publishedAt),
        };
      });
    }),
  );

  for (const post of postsByLocale.flat()) {
    const existing = entries.get(post.loc);
    if (!existing || (post.lastmod && (!existing.lastmod || post.lastmod > existing.lastmod))) {
      entries.set(post.loc, post);
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...Array.from(entries.values())
      .sort((a, b) => a.loc.localeCompare(b.loc))
      .map((entry) => {
        const lastmodTag = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
        return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmodTag}</url>`;
      }),
    "</urlset>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
