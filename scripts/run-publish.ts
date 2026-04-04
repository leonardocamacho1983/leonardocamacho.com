import "dotenv/config";
import { inspectPostById, inspectPostBySlug, inspectTranslationSet } from "../ops/shared/cms/read";
import { deriveEditorialStatus } from "../ops/publishing/status/editorialStatus";
import { publishDraft } from "../ops/shared/cms/write";
import { isLocale, type LocaleKey } from "../src/lib/locales";

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const hasFlag = (name: string): boolean => process.argv.includes(name);

interface PublishResult {
  ok: boolean;
  dryRun: boolean;
  inspection: {
    mode: "single" | "translation_set";
    warnings: string[];
    summary: Record<string, number>;
    targets: Array<{
      locale: string | null;
      translationKey: string | null;
      title: string | null;
      draftId: string | null;
      publishedId: string | null;
      status: string;
      nextAction: string;
      hasDraft: boolean;
      hasPublished: boolean;
    }>;
  };
  results: Array<{
    ok: boolean;
    draftId: string;
    publishedId: string;
    title: string;
    locale: string;
    error?: string;
  }>;
}

const summarizeInspectionTarget = (inspection: Awaited<ReturnType<typeof inspectPostById>>) => {
  const draft = inspection.draft;
  const published = inspection.published;
  const primary = draft ?? published;
  const workflow = deriveEditorialStatus({
    hasDraft: Boolean(draft),
    hasPublished: Boolean(published),
  });

  const draftId =
    draft?.storageId ||
    (draft?.presentedId
      ? draft.presentedId.startsWith("drafts.")
        ? draft.presentedId
        : `drafts.${draft.presentedId}`
      : null);

  return {
    locale: primary?.locale ?? null,
    translationKey: primary?.translationKey ?? null,
    title: primary?.title ?? null,
    draftId,
    publishedId: published?.presentedId ?? primary?.presentedId ?? null,
    status: workflow.status,
    nextAction: workflow.nextAction,
    hasDraft: workflow.hasDraft,
    hasPublished: workflow.hasPublished,
  };
};

const truncate = (value: string | null | undefined, maxLength = 72): string => {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
};

const formatSummary = (summary: Record<string, number>): string => {
  const entries = Object.entries(summary);
  if (entries.length === 0) {
    return "none";
  }

  return entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([status, count]) => `${status}=${count}`)
    .join(", ");
};

const renderReview = (
  output: PublishResult,
  context: {
    postId?: string;
    slug?: string;
    locale?: string;
    translationKey?: string;
  },
): string => {
  const lines: string[] = [];
  const targetLabel = context.translationKey
    ? `translationKey ${context.translationKey}`
    : context.postId
      ? `postId ${context.postId}`
      : context.slug && context.locale
        ? `slug ${context.slug} (${context.locale})`
        : "unknown target";
  const successCount = output.results.filter((result) => result.ok).length;
  const failureResults = output.results.filter((result) => !result.ok);

  lines.push("Publish Review");
  lines.push(`Target: ${targetLabel}`);
  lines.push(`Mode: ${output.inspection.mode}`);
  lines.push(`Execution: ${output.dryRun ? "dry-run" : "save"}`);
  lines.push(`State summary: ${formatSummary(output.inspection.summary)}`);

  if (output.inspection.warnings.length > 0) {
    lines.push("");
    lines.push("Warnings:");
    for (const warning of output.inspection.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  if (output.inspection.targets.length > 0) {
    lines.push("");
    lines.push("Targets:");
    for (const target of output.inspection.targets) {
      const scope = target.locale ?? "unknown-locale";
      const ids = `draft:${target.draftId ?? "none"} published:${target.publishedId ?? "none"}`;
      lines.push(`- ${scope} | ${target.status} | ${ids}`);
      if (target.title) {
        lines.push(`  ${truncate(target.title)}`);
      }
      lines.push(`  next: ${target.nextAction}`);
    }
  }

  if (output.results.length > 0) {
    lines.push("");
    lines.push("Dry-run checks:");
    for (const result of output.results) {
      const status = result.ok ? "ok" : "error";
      const locale = result.locale || "unknown-locale";
      const title = truncate(result.title) || result.draftId;
      lines.push(`- ${locale} | ${status} | ${title}`);
      if (result.error) {
        lines.push(`  ${result.error}`);
      }
    }
  }

  lines.push("");
  if (output.results.length === 0) {
    lines.push("Outcome: no publishable drafts found.");
  } else if (failureResults.length === 0) {
    lines.push(`Outcome: ${successCount} draft(s) validated for publish.`);
  } else {
    lines.push(`Outcome: ${successCount}/${output.results.length} draft(s) validated; ${failureResults.length} failed.`);
  }

  if (output.dryRun) {
    lines.push("Nothing was published.");
  }

  return lines.join("\n");
};

const main = async (): Promise<void> => {
  const postId = parseFlag("--postId");
  const slug = parseFlag("--slug");
  const locale = parseFlag("--locale");
  const translationKey = parseFlag("--translationKey");
  const allLocales = hasFlag("--all");
  const dryRun = !hasFlag("--save");
  const reviewMode = hasFlag("--review");

  if (reviewMode && !dryRun) {
    throw new Error("--review cannot be combined with --save");
  }

  if (!postId && !slug && !translationKey) {
    throw new Error("Provide --postId, --slug --locale <locale>, or --translationKey --all");
  }

  const draftIds: string[] = [];
  const inspectionWarnings: string[] = [];
  let inspectionMode: PublishResult["inspection"]["mode"] = "single";
  let inspectionTargets: PublishResult["inspection"]["targets"] = [];

  if (translationKey && allLocales) {
    inspectionMode = "translation_set";
    const inspectionMap = await inspectTranslationSet(translationKey);
    inspectionTargets = Object.values(inspectionMap).map((inspection) => summarizeInspectionTarget(inspection));

    if (inspectionTargets.length === 0) {
      throw new Error(`No drafts found for translationKey: ${translationKey}`);
    }

    const distinctStates = Array.from(new Set(inspectionTargets.map((target) => target.status)));
    if (distinctStates.length > 1) {
      inspectionWarnings.push(
        `Translation set is mixed-state: ${distinctStates.join(", ")}. Review targets before publishing all locales.`,
      );
    }

    const nonDraftLocales = inspectionTargets
      .filter((target) => !target.hasDraft)
      .map((target) => target.locale)
      .filter(Boolean);
    if (nonDraftLocales.length > 0) {
      inspectionWarnings.push(
        `Some locales have no draft to publish: ${nonDraftLocales.join(", ")}.`,
      );
    }

    draftIds.push(
      ...inspectionTargets
        .map((target) => target.draftId)
        .filter((value): value is string => typeof value === "string" && value.length > 0),
    );

    if (!reviewMode && draftIds.length === 0) {
      throw new Error(`No draft versions are currently publishable for translationKey: ${translationKey}`);
    }

    if (reviewMode && draftIds.length === 0) {
      inspectionWarnings.push(`No draft versions are currently publishable for translationKey: ${translationKey}.`);
    }
  } else if (postId) {
    const inspection = await inspectPostById(postId);
    const target = summarizeInspectionTarget(inspection);
    inspectionTargets = [target];

    if (!target.hasDraft) {
      if (!reviewMode) {
        throw new Error(`No draft found to publish. Current status: ${target.status}`);
      }

      inspectionWarnings.push(`No draft found to publish. Current status: ${target.status}.`);
    }

    if (target.draftId) {
      draftIds.push(target.draftId);
    }
  } else if (slug) {
    if (!locale || !isLocale(locale)) {
      throw new Error("--slug requires a valid --locale");
    }
    const inspection = await inspectPostBySlug(locale as LocaleKey, slug);
    const target = summarizeInspectionTarget(inspection);
    inspectionTargets = [target];

    if (target.status === "missing") {
      throw new Error(`Post not found: ${slug} (${locale})`);
    }

    if (!target.hasDraft) {
      if (!reviewMode) {
        throw new Error(`No draft found to publish for ${slug} (${locale}). Current status: ${target.status}`);
      }

      inspectionWarnings.push(`No draft found to publish for ${slug} (${locale}). Current status: ${target.status}.`);
    }

    if (target.draftId) {
      draftIds.push(target.draftId);
    }
  }

  const results: PublishResult["results"] = [];
  const inspectionSummary = inspectionTargets.reduce(
    (acc, target) => {
      acc[target.status] = (acc[target.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  for (const draftId of draftIds) {
    try {
      const result = await publishDraft({ draftId, dryRun });
      results.push({ ok: true, ...result });
    } catch (error) {
      results.push({
        ok: false,
        draftId,
        publishedId: "",
        title: "",
        locale: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const output: PublishResult = {
    ok: draftIds.length > 0 && results.every((r) => r.ok),
    dryRun,
    inspection: {
      mode: inspectionMode,
      warnings: inspectionWarnings,
      summary: inspectionSummary,
      targets: inspectionTargets,
    },
    results,
  };

  if (reviewMode) {
    console.log(
      renderReview(output, {
        postId,
        slug,
        locale,
        translationKey,
      }),
    );
    return;
  }

  console.log(JSON.stringify(output, null, 2));
};

main().catch((error) => {
  console.error("[run-publish] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
