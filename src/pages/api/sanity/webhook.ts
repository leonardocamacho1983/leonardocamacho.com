export const prerender = false;

import crypto from "node:crypto";
import type { APIRoute } from "astro";

interface SanityWebhookPayload {
  _id?: string;
  _type?: string;
  _rev?: string;
  slug?: string | { current?: string };
  locale?: string;
  translationKey?: string;
  [key: string]: unknown;
}

const DELIVERY_TTL_MS = 10 * 60 * 1000;
const seenDeliveries = new Map<string, number>();

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

export const GET: APIRoute = async () => {
  const tokenConfigured = Boolean(import.meta.env.SANITY_WEBHOOK_BEARER_TOKEN?.trim());
  return json({
    ok: true,
    service: "sanity-webhook",
    tokenConfigured,
    allowedDatasets: Array.from(allowedDatasets()),
  });
};

export const POST: APIRoute = async ({ request }) => {
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

  // Placeholder hook for future automations (alerts, cache invalidation, pipelines).
  console.info("[api/sanity/webhook] Event received", {
    operation,
    dataset: dataset || null,
    documentId,
    documentType,
    slug,
    deliveryKey: deliveryKey || null,
  });

  return json({
    ok: true,
    received: true,
    operation,
    dataset: dataset || null,
    documentId,
    documentType,
    slug,
    duplicate: false,
  });
};
