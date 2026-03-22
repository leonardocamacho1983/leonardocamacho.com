export const prerender = false;

import crypto from "node:crypto";
import type { APIRoute } from "astro";
import { LOCALES, isLocale, type LocaleKey } from "@/lib/locales";

interface SanityWebhookPayload {
  _id?: string;
  _type?: string;
  _rev?: string;
  slug?: string | { current?: string };
  locale?: string;
  translationKey?: string;
  [key: string]: unknown;
}

type SeoSeverity = "P0" | "P1";

interface SeoIssue {
  severity: SeoSeverity;
  code: string;
  url: string;
  message: string;
}

const DELIVERY_TTL_MS = 10 * 60 * 1000;
const seenDeliveries = new Map<string, number>();
const SEO_AUDIT_TIMEOUT_MS = 8_000;
const SEO_MAX_URLS_PER_EVENT = 12;
const SEO_AUDIT_DOC_TYPES = new Set([
  "post",
  "category",
  "homePage",
  "aboutPage",
  "writingPage",
  "siteSettings",
]);

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const getFirstHeader = (headers: Headers, names: string[]): string => {
  for (const name of names) {
    const value = headers.get(name);
    if (value) {
      return value.trim();
    }
  }
  return "";
};

const readBearerToken = (headers: Headers): string => {
  const auth = getFirstHeader(headers, ["authorization"]);
  if (!auth) return "";
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
};

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

const allowedDatasets = (): Set<string> => {
  const configured = (
    import.meta.env.SANITY_WEBHOOK_ALLOWED_DATASETS ||
    import.meta.env.PUBLIC_SANITY_DATASET ||
    "production"
  )
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return new Set(configured);
};

const cleanupSeenDeliveries = (now: number) => {
  if (seenDeliveries.size < 800) return;
  for (const [key, expiry] of seenDeliveries.entries()) {
    if (expiry <= now) {
      seenDeliveries.delete(key);
    }
  }
};

const deliveryKeyFromRequest = (headers: Headers, payload: SanityWebhookPayload): string => {
  const headerDeliveryKey = getFirstHeader(headers, [
    "idempotency-key",
    "sanity-transaction-id",
    "x-sanity-transaction-id",
  ]);

  if (headerDeliveryKey) {
    return headerDeliveryKey;
  }

  const docId = typeof payload._id === "string" ? payload._id : "";
  const revision = typeof payload._rev === "string" ? payload._rev : "";
  if (docId && revision) {
    return `${docId}:${revision}`;
  }
  return "";
};

const readSlug = (payload: SanityWebhookPayload): string => {
  if (typeof payload.slug === "string") {
    return payload.slug;
  }
  if (payload.slug && typeof payload.slug === "object" && typeof payload.slug.current === "string") {
    return payload.slug.current;
  }
  return "";
};

const normalizePath = (path: string): string => {
  if (!path) return "/";
  const clean = path.split("?")[0].split("#")[0] || "/";
  if (clean === "/") return "/";
  return clean.replace(/\/+$/, "");
};

const requestOrigin = (request: Request, requestUrl: URL): string => {
  const forwardedHost = getFirstHeader(request.headers, ["x-forwarded-host"]);
  const host = forwardedHost || getFirstHeader(request.headers, ["host"]);
  const proto =
    getFirstHeader(request.headers, ["x-forwarded-proto"]) ||
    requestUrl.protocol.replace(":", "") ||
    "https";

  if (host) {
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  const configured = (import.meta.env.PUBLIC_SITE_URL || "").trim();
  if (configured) {
    try {
      return new URL(configured).origin.replace(/\/+$/, "");
    } catch {}
  }

  return requestUrl.origin.replace(/\/+$/, "");
};

const absoluteUrl = (origin: string, path: string): string =>
  `${origin}${path.startsWith("/") ? path : `/${path}`}`;

const readLocale = (payload: SanityWebhookPayload): LocaleKey | null => {
  if (typeof payload.locale !== "string") return null;
  const normalized = payload.locale.toLowerCase();
  return isLocale(normalized) ? normalized : null;
};

const localesForPayload = (payload: SanityWebhookPayload): LocaleKey[] => {
  const locale = readLocale(payload);
  if (locale) return [locale];
  return LOCALES.map((item) => item.key);
};

const shouldBeNoindex = (path: string): boolean => {
  const normalized = normalizePath(path);
  return (
    normalized === "/confirmed" ||
    normalized === "/thankyou" ||
    normalized.endsWith("/confirmed") ||
    normalized.endsWith("/thankyou")
  );
};

const shouldCheckInSitemap = (path: string): boolean => {
  const normalized = normalizePath(path);
  if (shouldBeNoindex(normalized)) return false;
  if (normalized.startsWith("/api/")) return false;
  if (normalized.startsWith("/studio")) return false;
  return true;
};

const readCanonicalHref = (html: string): string => {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  return match?.[1]?.trim() || "";
};

const readRobotsMeta = (html: string): string => {
  const match = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  return match?.[1]?.trim().toLowerCase() || "";
};

const safeFetchText = async (url: string): Promise<{ status: number; body: string }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEO_AUDIT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "seo-audit-bot/1.0" },
      signal: controller.signal,
    });
    const body = await response.text();
    return { status: response.status, body };
  } finally {
    clearTimeout(timeout);
  }
};

const sitemapContains = (sitemapXml: string, absolute: string): boolean =>
  sitemapXml.includes(`<loc>${absolute}</loc>`);

const addIssue = (issues: SeoIssue[], issue: SeoIssue) => {
  issues.push(issue);
};

const buildAffectedPaths = (payload: SanityWebhookPayload): string[] => {
  const type = typeof payload._type === "string" ? payload._type : "";
  const slug = readSlug(payload);
  const locales = localesForPayload(payload);
  const paths = new Set<string>();

  if (type === "post") {
    for (const locale of locales) {
      paths.add(`/${locale}/writing`);
      if (slug) {
        paths.add(`/${locale}/writing/${slug}`);
      }
    }
  }

  if (type === "category") {
    for (const locale of locales) {
      paths.add(`/${locale}/writing`);
    }
  }

  if (type === "homePage" || type === "siteSettings") {
    for (const locale of locales) {
      paths.add(`/${locale}`);
      paths.add(`/${locale}/privacy`);
    }
    paths.add("/welcome");
    paths.add("/pt-br/welcome");
    paths.add("/pt/welcome");
    paths.add("/fr/welcome");
  }

  if (type === "aboutPage") {
    for (const locale of locales) {
      paths.add(`/${locale}/about`);
    }
  }

  if (type === "writingPage") {
    for (const locale of locales) {
      paths.add(`/${locale}/writing`);
    }
  }

  return Array.from(paths).slice(0, SEO_MAX_URLS_PER_EVENT);
};

const runSeoAuditMvp = async (
  origin: string,
  affectedPaths: string[],
): Promise<{ auditedUrls: string[]; issues: SeoIssue[] }> => {
  const issues: SeoIssue[] = [];
  const auditedUrls: string[] = [];

  let sitemapXml = "";
  try {
    const sitemap = await safeFetchText(absoluteUrl(origin, "/sitemap.xml"));
    if (sitemap.status === 200) {
      sitemapXml = sitemap.body;
    } else {
      addIssue(issues, {
        severity: "P1",
        code: "SITEMAP_UNAVAILABLE",
        url: absoluteUrl(origin, "/sitemap.xml"),
        message: `sitemap.xml returned ${sitemap.status}`,
      });
    }
  } catch (error) {
    addIssue(issues, {
      severity: "P1",
      code: "SITEMAP_FETCH_ERROR",
      url: absoluteUrl(origin, "/sitemap.xml"),
      message: error instanceof Error ? error.message : "unknown error",
    });
  }

  for (const path of affectedPaths) {
    const normalizedPath = normalizePath(path);
    const url = absoluteUrl(origin, normalizedPath);
    auditedUrls.push(url);

    let response: { status: number; body: string };
    try {
      response = await safeFetchText(url);
    } catch (error) {
      addIssue(issues, {
        severity: "P0",
        code: "PAGE_FETCH_ERROR",
        url,
        message: error instanceof Error ? error.message : "unknown error",
      });
      continue;
    }

    if (response.status !== 200) {
      addIssue(issues, {
        severity: "P0",
        code: "PAGE_STATUS_NOT_200",
        url,
        message: `status ${response.status}`,
      });
      continue;
    }

    const canonicalHref = readCanonicalHref(response.body);
    if (!canonicalHref) {
      addIssue(issues, {
        severity: "P0",
        code: "CANONICAL_MISSING",
        url,
        message: "Missing canonical link tag",
      });
    } else {
      try {
        const canonical = new URL(canonicalHref);
        const expected = new URL(url);
        const canonicalPath = normalizePath(canonical.pathname);
        const expectedPath = normalizePath(expected.pathname);
        if (canonical.origin !== expected.origin || canonicalPath !== expectedPath) {
          addIssue(issues, {
            severity: "P0",
            code: "CANONICAL_MISMATCH",
            url,
            message: `canonical ${canonical.origin}${canonicalPath} does not match ${expected.origin}${expectedPath}`,
          });
        }
      } catch {
        addIssue(issues, {
          severity: "P0",
          code: "CANONICAL_INVALID",
          url,
          message: "Canonical is not a valid absolute URL",
        });
      }
    }

    const robots = readRobotsMeta(response.body);
    if (shouldBeNoindex(normalizedPath) && !robots.includes("noindex")) {
      addIssue(issues, {
        severity: "P0",
        code: "ROBOTS_EXPECTED_NOINDEX",
        url,
        message: `Expected noindex but got "${robots || "missing"}"`,
      });
    }

    if (!shouldBeNoindex(normalizedPath) && robots.includes("noindex")) {
      addIssue(issues, {
        severity: "P0",
        code: "ROBOTS_UNEXPECTED_NOINDEX",
        url,
        message: `Unexpected noindex on indexable route (${robots})`,
      });
    }

    if (sitemapXml && shouldCheckInSitemap(normalizedPath) && !sitemapContains(sitemapXml, url)) {
      addIssue(issues, {
        severity: "P1",
        code: "SITEMAP_MISSING_URL",
        url,
        message: "URL not present in sitemap.xml",
      });
    }
  }

  return { auditedUrls, issues };
};

const sendSeoP0P1Alert = async (
  summary: { event: string; documentType: string | null; documentId: string | null; issues: SeoIssue[] },
) => {
  const alertUrl = import.meta.env.SEO_AUDIT_ALERT_WEBHOOK_URL?.trim() || "";
  if (!alertUrl) return;

  const payload = {
    source: "sanity-webhook-seo-audit",
    severity: "P0_P1",
    event: summary.event,
    documentType: summary.documentType,
    documentId: summary.documentId,
    issueCount: summary.issues.length,
    issues: summary.issues.map((issue) => ({
      severity: issue.severity,
      code: issue.code,
      url: issue.url,
      message: issue.message,
    })),
  };

  try {
    await fetch(alertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[api/sanity/webhook] Failed to send SEO alert", error);
  }
};

export const GET: APIRoute = async () => {
  const tokenConfigured = Boolean(import.meta.env.SANITY_WEBHOOK_BEARER_TOKEN?.trim());
  return json({
    ok: true,
    service: "sanity-webhook",
    tokenConfigured,
    allowedDatasets: Array.from(allowedDatasets()),
    seoAudit: {
      enabled: true,
      scope: "infra_only",
      alertWebhookConfigured: Boolean(import.meta.env.SEO_AUDIT_ALERT_WEBHOOK_URL?.trim()),
      alerting: "P0_P1_only",
    },
  });
};

export const POST: APIRoute = async ({ request, url }) => {
  const expectedToken = import.meta.env.SANITY_WEBHOOK_BEARER_TOKEN?.trim() || "";
  if (!expectedToken) {
    return json({ ok: false, error: "Webhook token not configured" }, 503);
  }

  const incomingToken = readBearerToken(request.headers);
  if (!incomingToken || !timingSafeEqual(incomingToken, expectedToken)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const rawBody = await request.text();
  if (!rawBody) {
    return json({ ok: false, error: "Missing payload" }, 400);
  }

  let payload: SanityWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SanityWebhookPayload;
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400);
  }

  const dataset =
    getFirstHeader(request.headers, ["sanity-dataset", "x-sanity-dataset"]).toLowerCase() || "";
  const allowed = allowedDatasets();
  if (dataset && !allowed.has(dataset)) {
    return json({ ok: true, ignored: true, reason: "dataset-not-allowed", dataset }, 202);
  }

  const now = Date.now();
  cleanupSeenDeliveries(now);
  const deliveryKey = deliveryKeyFromRequest(request.headers, payload);
  if (deliveryKey) {
    const previousExpiry = seenDeliveries.get(deliveryKey);
    if (previousExpiry && previousExpiry > now) {
      return json({ ok: true, duplicate: true, deliveryKey }, 202);
    }
    seenDeliveries.set(deliveryKey, now + DELIVERY_TTL_MS);
  }

  const operation = getFirstHeader(request.headers, ["sanity-operation", "x-sanity-operation"]) || "unknown";
  const documentId = typeof payload._id === "string" ? payload._id : null;
  const documentType = typeof payload._type === "string" ? payload._type : null;
  const slug = readSlug(payload) || null;
  const eventLabel = `${operation}:${documentType || "unknown"}`;
  console.info("[api/sanity/webhook] Event received", {
    operation,
    dataset: dataset || null,
    documentId,
    documentType,
    slug,
    deliveryKey: deliveryKey || null,
  });

  let seoAuditSummary: Record<string, unknown> = { executed: false };
  if (documentType && SEO_AUDIT_DOC_TYPES.has(documentType)) {
    const origin = requestOrigin(request, url);
    const affectedPaths = buildAffectedPaths(payload);

    if (affectedPaths.length === 0) {
      seoAuditSummary = { executed: false, reason: "no-affected-paths" };
    } else {
      const auditResult = await runSeoAuditMvp(origin, affectedPaths);
      const p0p1Issues = auditResult.issues;

      if (p0p1Issues.length > 0) {
        await sendSeoP0P1Alert({
          event: eventLabel,
          documentType,
          documentId,
          issues: p0p1Issues,
        });
      }

      const p0Count = p0p1Issues.filter((issue) => issue.severity === "P0").length;
      const p1Count = p0p1Issues.filter((issue) => issue.severity === "P1").length;

      seoAuditSummary = {
        executed: true,
        auditedUrls: auditResult.auditedUrls.length,
        issues: {
          p0: p0Count,
          p1: p1Count,
          total: p0p1Issues.length,
        },
        alerted: p0p1Issues.length > 0,
      };

      if (p0p1Issues.length > 0) {
        console.warn("[api/sanity/webhook] SEO audit found P0/P1 issues", {
          event: eventLabel,
          documentId,
          documentType,
          p0: p0Count,
          p1: p1Count,
        });
      } else {
        console.info("[api/sanity/webhook] SEO audit clean", {
          event: eventLabel,
          documentId,
          documentType,
          auditedUrls: auditResult.auditedUrls.length,
        });
      }
    }
  }

  return json({
    ok: true,
    received: true,
    operation,
    dataset: dataset || null,
    documentId,
    documentType,
    slug,
    duplicate: false,
    seoAudit: seoAuditSummary,
  });
};
