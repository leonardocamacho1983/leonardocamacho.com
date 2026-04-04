export interface MetadataInput {
  topic: string;
  contentType: string;
  audience: string;
  draftText: string;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  slug: string;
  excerpt: string;
}

const collapseWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();

const clampAtWord = (value: string, maxLength: number): string => {
  const clean = collapseWhitespace(value);
  if (clean.length <= maxLength) {
    return clean;
  }

  const sliced = clean.slice(0, maxLength + 1);
  const boundary = sliced.lastIndexOf(" ");
  return (boundary > 40 ? sliced.slice(0, boundary) : sliced.slice(0, maxLength)).trim();
};

const toSlug = (value: string): string =>
  collapseWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);

const toPlainText = (markdown: string): string => {
  const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, " ");
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, " ");
  const withoutLinks = withoutInlineCode.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  const withoutHeadings = withoutLinks.replace(/^#{1,6}\s+/gm, "");
  const withoutQuotes = withoutHeadings.replace(/^>\s?/gm, "");
  const withoutBullets = withoutQuotes.replace(/^\s*[-*+]\s+/gm, "");
  const withoutEmphasis = withoutBullets.replace(/[*_~]/g, "");
  const withoutHtml = withoutEmphasis.replace(/<[^>]+>/g, " ");
  return collapseWhitespace(withoutHtml);
};

const toSentenceArray = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => collapseWhitespace(sentence))
    .filter(Boolean);

const firstSentence = (text: string): string => {
  const sentences = toSentenceArray(text);
  const candidate = sentences.find((sentence) => sentence.length >= 45);
  if (candidate) {
    return clampAtWord(candidate, 190);
  }

  const fallback = sentences[0] || text;
  return clampAtWord(fallback, 170);
};

const TYPE_TITLE_LABELS: Record<string, string> = {
  note: "Operator Note",
  insight: "Insight",
  essay: "Essay",
  research: "Research Brief",
};

const TYPE_DESCRIPTION_INTENTS: Record<string, string> = {
  note: "A practical note on operational tradeoffs.",
  insight: "A sharper read on the mechanism behind the headline.",
  essay: "A clear interpretation of the strategic tradeoffs in play.",
  research: "An evidence-led brief on the mechanism and implications.",
};

const normalizeTopic = (value: string): string =>
  collapseWhitespace(value)
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

export const generateMetadata = (input: MetadataInput): GeneratedMetadata => {
  const topic = normalizeTopic(input.topic) || "Strategic clarity under pressure";
  const plainDraft = toPlainText(input.draftText);
  const sentences = toSentenceArray(plainDraft);
  const excerpt = firstSentence(plainDraft);
  const contentType = input.contentType.toLowerCase();
  const titleLabel = TYPE_TITLE_LABELS[contentType] || "Insight";

  const titleBase = topic.length >= 34 ? topic : `${topic}: ${titleLabel}`;
  const title = clampAtWord(titleBase, 110);

  const audience = collapseWhitespace(input.audience).toLowerCase();
  const fallbackIntent = TYPE_DESCRIPTION_INTENTS[contentType] || TYPE_DESCRIPTION_INTENTS.insight;
  const firstTwoSentences = clampAtWord(sentences.slice(0, 2).join(" "), 160);

  let description = firstTwoSentences;
  if (!description || description.length < 96) {
    const audienceSuffix = audience ? ` For ${audience}.` : "";
    description = clampAtWord(`${excerpt} ${fallbackIntent}${audienceSuffix}`, 160);
  }

  const slugSeed = topic || title;
  const slug = toSlug(slugSeed) || toSlug(title) || "strategic-brief";

  return {
    title,
    description,
    slug,
    excerpt,
  };
};
