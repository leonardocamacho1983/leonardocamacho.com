import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const read = (relativePath: string): string =>
  readFileSync(path.resolve(ROOT, relativePath), "utf8");

interface CheckResult {
  file: string;
  check: string;
}

const checks: CheckResult[] = [];

const requirePattern = (source: string, file: string, check: string, pattern: RegExp): void => {
  assert.match(source, pattern, `[${file}] missing ${check}`);
  checks.push({ file, check });
};

const main = (): void => {
  const baseLayoutPath = "src/layouts/BaseLayout.astro";
  const flowLayoutPath = "src/layouts/FlowLayout.astro";
  const articlePath = "src/pages/[locale]/writing/[slug].astro";
  const writingPath = "src/pages/[locale]/writing/index.astro";
  const aboutPath = "src/pages/[locale]/about.astro";
  const privacyPath = "src/pages/[locale]/privacy.astro";

  const baseLayout = read(baseLayoutPath);
  const flowLayout = read(flowLayoutPath);
  const articlePage = read(articlePath);
  const writingPage = read(writingPath);
  const aboutPage = read(aboutPath);
  const privacyPage = read(privacyPath);

  requirePattern(baseLayout, baseLayoutPath, "website schema", /"@type":\s*"WebSite"/);
  requirePattern(baseLayout, baseLayoutPath, "organization schema", /"@type":\s*"Organization"/);
  requirePattern(baseLayout, baseLayoutPath, "webpage schema", /"@type":\s*"WebPage"/);
  requirePattern(baseLayout, baseLayoutPath, "schema script emission", /application\/ld\+json/);

  requirePattern(flowLayout, flowLayoutPath, "flow schema script emission", /application\/ld\+json/);
  requirePattern(flowLayout, flowLayoutPath, "flow webpage schema", /"@type":\s*"WebPage"/);

  requirePattern(articlePage, articlePath, "blogposting schema", /"@type":\s*"BlogPosting"/);
  requirePattern(articlePage, articlePath, "article breadcrumb schema", /"@type":\s*"BreadcrumbList"/);
  requirePattern(writingPage, writingPath, "collection schema", /"@type":\s*"CollectionPage"/);
  requirePattern(writingPage, writingPath, "itemlist schema", /"@type":\s*"ItemList"/);
  requirePattern(writingPage, writingPath, "writing breadcrumb schema", /"@type":\s*"BreadcrumbList"/);
  requirePattern(aboutPage, aboutPath, "about schema", /"@type":\s*"AboutPage"/);
  requirePattern(privacyPage, privacyPath, "privacy schema", /"@type":\s*"PrivacyPolicy"/);

  console.log(JSON.stringify({ ok: true, checks }, null, 2));
};

main();
