import { LOCALES, type LocaleKey } from "../../../src/lib/locales";

type ClusterRole = "pillar" | "support" | "bridge";
type LinkKind = "post" | "core-page";

interface InternalLinkPlanEntry {
  target: string;
  kind: LinkKind;
}

export interface DraftInternalLinkPreflightResult {
  ok: boolean;
  required: boolean;
  clusterRole: ClusterRole | null;
  plannedTargets: string[];
  validTargets: string[];
  reason?: string;
}

const LOCALE_SET = new Set(LOCALES.map((item) => item.key as LocaleKey));
const CORE_PAGE_NAMES = new Set(["home", "about", "writing", "privacy"]);
const INTERNAL_HOSTS = new Set(["www.leonardocamacho.com", "leonardocamacho.com"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");

const normalizePath = (value: string): string => {
  const stripped = value.split("#")[0].split("?")[0].trim();
  if (!stripped) return "/";
  const withLeading = stripped.startsWith("/") ? stripped : `/${stripped}`;
  const collapsed = withLeading.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return collapsed;
  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
};

const stripLocalePrefix = (pathname: string): string => {
  const cleanPath = normalizePath(pathname);
  const match = cleanPath.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(\/.*)?$/i);
  if (!match) {
    return cleanPath;
  }
  const localeToken = match[1].toLowerCase() as LocaleKey;
  if (!LOCALE_SET.has(localeToken)) {
    return cleanPath;
  }
  return match[2] || "/";
};

const toInternalPath = (target: string): string | null => {
  const cleanTarget = target.trim();
  if (!cleanTarget || cleanTarget.startsWith("#")) {
    return null;
  }

  if (cleanTarget.startsWith("/")) {
    return normalizePath(cleanTarget);
  }

  if (/^https?:\/\//i.test(cleanTarget)) {
    try {
      const parsed = new URL(cleanTarget);
      if (!INTERNAL_HOSTS.has(parsed.hostname.toLowerCase())) {
        return null;
      }
      return normalizePath(parsed.pathname);
    } catch {
      return null;
    }
  }

  return null;
};

const normalizeSlugToken = (value: string): string =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const isCorePageTarget = (target: string): boolean => {
  const cleanTarget = normalizeWhitespace(target).toLowerCase();
  if (!cleanTarget) {
    return false;
  }
  if (CORE_PAGE_NAMES.has(cleanTarget)) {
    return true;
  }

  const path = toInternalPath(cleanTarget);
  if (!path) {
    return false;
  }
  const suffix = stripLocalePrefix(path);
  return suffix === "/" || suffix === "/about" || suffix === "/writing" || suffix === "/privacy";
};

const isPostTarget = (target: string): boolean => {
  const cleanTarget = normalizeWhitespace(target);
  if (!cleanTarget) {
    return false;
  }

  const asPath = toInternalPath(cleanTarget);
  if (asPath) {
    const suffix = stripLocalePrefix(asPath);
    if (/^\/writing\/[a-z0-9][a-z0-9-]{5,}$/i.test(suffix)) {
      return true;
    }
    return false;
  }

  const token = normalizeSlugToken(cleanTarget);
  return /^[a-z0-9][a-z0-9-]{5,}$/.test(token);
};

const collectBodyLinkTargets = (draft: Record<string, unknown>): string[] => {
  const body = draft.body;
  if (!Array.isArray(body)) {
    return [];
  }

  const hrefs: string[] = [];
  for (const block of body) {
    if (!isRecord(block)) {
      continue;
    }
    const markDefs = block.markDefs;
    if (!Array.isArray(markDefs)) {
      continue;
    }

    for (const markDef of markDefs) {
      if (!isRecord(markDef)) {
        continue;
      }
      if (markDef._type !== "link") {
        continue;
      }
      const href = markDef.href;
      if (typeof href === "string" && href.trim()) {
        hrefs.push(href.trim());
      }
    }
  }

  return hrefs;
};

const collectPlannedTargets = (draft: Record<string, unknown>): InternalLinkPlanEntry[] => {
  const result: InternalLinkPlanEntry[] = [];
  const editorialPlan = isRecord(draft.editorialPlan) ? draft.editorialPlan : null;

  if (!editorialPlan) {
    return result;
  }

  const internalLinkPlan = editorialPlan.internalLinkPlan;
  if (Array.isArray(internalLinkPlan)) {
    for (const entry of internalLinkPlan) {
      if (!isRecord(entry)) {
        continue;
      }
      const target = typeof entry.target === "string" ? entry.target.trim() : "";
      const kind = entry.kind === "core-page" ? "core-page" : entry.kind === "post" ? "post" : null;
      if (!target || !kind) {
        continue;
      }
      result.push({ target, kind });
    }
  }

  const mustLinkTo = editorialPlan.mustLinkTo;
  if (Array.isArray(mustLinkTo)) {
    for (const entry of mustLinkTo) {
      if (typeof entry !== "string") {
        continue;
      }
      const target = entry.trim();
      if (!target) {
        continue;
      }
      result.push({ target, kind: "post" });
    }
  }

  for (const href of collectBodyLinkTargets(draft)) {
    result.push({ target: href, kind: "post" });
  }

  return result;
};

const unique = (items: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    if (seen.has(item)) {
      continue;
    }
    seen.add(item);
    result.push(item);
  }
  return result;
};

const resolveClusterRole = (draft: Record<string, unknown>): ClusterRole | null => {
  const editorialPlan = isRecord(draft.editorialPlan) ? draft.editorialPlan : null;
  if (!editorialPlan) {
    return null;
  }
  const role = editorialPlan.clusterRole;
  if (role === "pillar" || role === "support" || role === "bridge") {
    return role;
  }
  return null;
};

export const validateDraftInternalLinkPreflight = (
  draft: Record<string, unknown>,
): DraftInternalLinkPreflightResult => {
  const clusterRole = resolveClusterRole(draft);
  const required = clusterRole === "support" || clusterRole === "bridge";
  const candidates = collectPlannedTargets(draft);
  const plannedTargets = unique(candidates.map((entry) => entry.target));
  const validTargets = unique(
    candidates
      .filter((entry) => (entry.kind === "core-page" ? isCorePageTarget(entry.target) : isPostTarget(entry.target)))
      .map((entry) => entry.target),
  );

  if (!required) {
    return {
      ok: true,
      required: false,
      clusterRole,
      plannedTargets,
      validTargets,
    };
  }

  if (validTargets.length > 0) {
    return {
      ok: true,
      required: true,
      clusterRole,
      plannedTargets,
      validTargets,
    };
  }

  const roleLabel = clusterRole || "unknown";
  const reason =
    plannedTargets.length > 0
      ? `Publish blocked: clusterRole=${roleLabel} requires at least one valid internal link target. None of the planned targets were valid.`
      : `Publish blocked: clusterRole=${roleLabel} requires at least one valid internal link target, but no targets were planned.`;

  return {
    ok: false,
    required: true,
    clusterRole,
    plannedTargets,
    validTargets,
    reason,
  };
};

