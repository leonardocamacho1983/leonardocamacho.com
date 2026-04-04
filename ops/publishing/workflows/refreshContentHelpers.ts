import type { PostDetailDTO } from "../../../src/lib/types";
import type { CreateContentPlannerInput } from "../types/content";

export type RefreshSourceMode = "published" | "draft";

interface RefreshInspectableVersion {
  presentedId: string;
}

interface RefreshInspection {
  draft: RefreshInspectableVersion | null;
  published: RefreshInspectableVersion | null;
}

export interface RefreshSourceSelection {
  resolved: RefreshSourceMode;
  fallbackReason?: string;
}

const DEFAULT_REFRESH_GOAL =
  "Refresh this article to sharpen mechanism clarity, preserve the core claim, and improve operator relevance without diluting conceptual rigor.";

const clean = (value: string): string => value.trim();

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

const splitParagraphs = (markdown: string): string[] =>
  markdown
    .split(/\n\s*\n/g)
    .map((part) => clean(part))
    .filter(Boolean);

export const resolveRefreshSourceSelection = (
  requested: RefreshSourceMode,
  inspection: RefreshInspection,
): RefreshSourceSelection => {
  if (requested === "draft") {
    if (inspection.draft) {
      return { resolved: "draft" };
    }
    if (inspection.published) {
      return {
        resolved: "published",
        fallbackReason: "requested_draft_unavailable_using_published",
      };
    }
  }

  if (requested === "published") {
    if (inspection.published) {
      return { resolved: "published" };
    }
    if (inspection.draft) {
      return {
        resolved: "draft",
        fallbackReason: "requested_published_unavailable_using_draft",
      };
    }
  }

  throw new Error("Refresh source not found. No draft or published version is available for this post.");
};

export const buildRefreshPlannerInput = (input: {
  source: PostDetailDTO;
  sourceMarkdown: string;
  goal?: string;
  extraNotes?: string[];
}): CreateContentPlannerInput => {
  const notes: string[] = [];
  const excerpt = clean(input.source.excerpt || "");
  const paragraphs = splitParagraphs(input.sourceMarkdown)
    .slice(0, 6)
    .map((paragraph) => truncate(paragraph, 280));

  notes.push(`Current title: ${clean(input.source.title)}`);
  if (excerpt) {
    notes.push(`Current excerpt: ${excerpt}`);
  }

  for (const paragraph of paragraphs) {
    notes.push(paragraph);
  }

  for (const note of input.extraNotes || []) {
    const cleaned = clean(note);
    if (cleaned) {
      notes.push(cleaned);
    }
  }

  const uniqueNotes = Array.from(new Set(notes.map((item) => item.trim()).filter(Boolean)));
  if (uniqueNotes.length === 0) {
    uniqueNotes.push("Refresh the article while preserving the original strategic mechanism.");
  }

  return {
    goal: clean(input.goal || DEFAULT_REFRESH_GOAL),
    notes: uniqueNotes,
    thesisHint: clean(input.source.seoTitle || input.source.title || "") || null,
    examples: [],
    sourceMode: "mixed",
  };
};
