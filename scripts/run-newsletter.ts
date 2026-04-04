import "dotenv/config";
import path from "node:path";
import { getPostById, getPostBySlug } from "../ops/shared/cms/read";
import { runPrompt } from "../ops/shared/llm/runPrompt";
import { createBroadcast } from "../ops/newsletter/delivery/createBroadcast";
import { isLocale, type LocaleKey } from "../src/lib/locales";
import { extractMarkdownFromPortableText } from "../ops/shared/cms/portableText";

const NEWSLETTER_PROMPT_PATH = path.resolve(process.cwd(), "ops/newsletter/prompts/newsletter.system.md");

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const hasFlag = (name: string): boolean => process.argv.includes(name);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const buildPostUrl = (locale: string, slug: string): string => {
  const baseUrl = process.env.PUBLIC_SITE_URL || "https://leonardocamacho.com";
  return `${baseUrl.replace(/\/+$/, "")}/${locale}/writing/${slug}`;
};

interface NewsletterResult {
  ok: boolean;
  dryRun: boolean;
  postId: string;
  title: string;
  locale: string;
  subject: string;
  previewText: string;
  broadcastId: string | null;
  previewUrl: string | null;
  error?: string;
}

const main = async (): Promise<void> => {
  const postId = parseFlag("--postId");
  const slug = parseFlag("--slug");
  const locale = parseFlag("--locale");
  const dryRun = !hasFlag("--send");

  if (!postId && !slug) {
    throw new Error("Provide --postId or --slug --locale <locale>");
  }

  if (slug && (!locale || !isLocale(locale))) {
    throw new Error("--slug requires a valid --locale");
  }

  // Newsletters are sent from published posts — use published perspective.
  const usePreview = false;

  const post = postId
    ? await getPostById(postId, usePreview)
    : await getPostBySlug(locale as LocaleKey, slug!, usePreview);

  if (!post) {
    throw new Error(`Post not found: ${postId ?? slug}`);
  }

  const postLocale = (post.locale as LocaleKey) || (locale as LocaleKey) || "en-us";
  const postSlug = post.slug || "";
  const postUrl = buildPostUrl(postLocale, postSlug);

  const bodyMarkdown = extractMarkdownFromPortableText(post.body);
  if (!bodyMarkdown) {
    throw new Error("Post body is empty or not extractable.");
  }

  const raw = await runPrompt({
    systemPromptPath: NEWSLETTER_PROMPT_PATH,
    input: {
      title: post.title,
      excerpt: post.excerpt,
      bodyMarkdown,
      locale: postLocale,
      postUrl,
      contentType: post.category?.translationKey ?? "insight",
    },
  });

  if (!isRecord(raw)) {
    throw new Error("Newsletter prompt returned non-object output.");
  }

  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const previewText = typeof raw.previewText === "string" ? raw.previewText.trim() : "";
  const contentHtml = typeof raw.contentHtml === "string" ? raw.contentHtml.trim() : "";

  if (!subject || !contentHtml) {
    throw new Error("Newsletter prompt returned empty subject or contentHtml.");
  }

  const broadcast = await createBroadcast({
    subject,
    previewText,
    contentHtml,
    description: `${post.title} [${postLocale}]`,
    dryRun,
  });

  const result: NewsletterResult = {
    ok: true,
    dryRun,
    postId: post.id,
    title: post.title,
    locale: postLocale,
    subject,
    previewText,
    broadcastId: broadcast.broadcastId,
    previewUrl: broadcast.previewUrl,
  };

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error("[run-newsletter] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
