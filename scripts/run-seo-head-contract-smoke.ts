import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const read = (relativePath: string): string =>
  readFileSync(path.resolve(ROOT, relativePath), "utf8");

const fileExists = (relativePath: string): boolean =>
  existsSync(path.resolve(ROOT, relativePath));

interface CheckResult {
  file: string;
  check: string;
}

const checks: CheckResult[] = [];

const requirePattern = (source: string, file: string, check: string, pattern: RegExp): void => {
  assert.match(source, pattern, `[${file}] missing ${check}`);
  checks.push({ file, check });
};

const requireExists = (relativePath: string): void => {
  assert.ok(fileExists(relativePath), `[${relativePath}] file is required for SEO OG routing`);
  checks.push({ file: relativePath, check: "exists" });
};

const main = (): void => {
  const baseLayoutPath = "src/layouts/BaseLayout.astro";
  const flowLayoutPath = "src/layouts/FlowLayout.astro";
  const articlePagePath = "src/pages/[locale]/writing/[slug].astro";
  const seoLibPath = "src/lib/seo.ts";

  const baseLayout = read(baseLayoutPath);
  const flowLayout = read(flowLayoutPath);
  const articlePage = read(articlePagePath);
  const seoLib = read(seoLibPath);

  requirePattern(baseLayout, baseLayoutPath, "canonical tag", /<link\s+rel="canonical"\s+href=\{canonicalUrl\}/);
  requirePattern(baseLayout, baseLayoutPath, "hreflang alternates", /rel="alternate"\s+hreflang=\{mapHtmlLang\(link\.locale\)\}/);
  requirePattern(baseLayout, baseLayoutPath, "x-default alternate", /rel="alternate"\s+hreflang="x-default"/);
  requirePattern(baseLayout, baseLayoutPath, "og:image tag", /<meta\s+property="og:image"\s+content=\{ogImage\}/);
  requirePattern(baseLayout, baseLayoutPath, "twitter:image tag", /<meta\s+name="twitter:image"\s+content=\{twitterImage\}/);

  requirePattern(flowLayout, flowLayoutPath, "canonical tag", /<link\s+rel="canonical"\s+href=\{canonicalUrl\}>/);
  requirePattern(flowLayout, flowLayoutPath, "hreflang alternates", /<link\s+rel="alternate"\s+hreflang=\{link\.hrefLang\}/);
  requirePattern(flowLayout, flowLayoutPath, "x-default alternate", /hreflang="x-default"/);
  requirePattern(flowLayout, flowLayoutPath, "og:image tag", /<meta\s+property="og:image"\s+content=\{socialImage\}>/);
  requirePattern(flowLayout, flowLayoutPath, "twitter:image tag", /<meta\s+name="twitter:image"\s+content=\{socialImage\}>/);

  requirePattern(articlePage, articlePagePath, "article og route", /`\/og\/article\/\$\{post\.slug\}\.png\?/);
  requirePattern(articlePage, articlePagePath, "article og type", /openGraph=\{\{\s*type:\s*"article"/s);
  requirePattern(articlePage, articlePagePath, "article published time", /publishedTime:\s*post\.publishedAt/);
  requirePattern(articlePage, articlePagePath, "article modified time", /modifiedTime:\s*post\.updatedAt\s*\|\|\s*post\.publishedAt/);

  requirePattern(seoLib, seoLibPath, "absoluteUrl helper", /export const absoluteUrl = \(path: string/);
  requirePattern(seoLib, seoLibPath, "hreflang helper", /export const hreflangFromLocale = \(locale: LocaleKey\)/);

  requireExists("src/pages/og/[page].png.ts");
  requireExists("src/pages/og/article/[slug].png.ts");

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks,
      },
      null,
      2,
    ),
  );
};

main();
