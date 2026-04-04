import type { APIRoute } from "astro";
import { trackGrowthEvent } from "@/lib/analytics/growth";
import {
  createNewsletterStateToken,
  hasNewsletterStateTokenSecret,
} from "@/lib/newsletter/state-token";
import { isKitConfigured, subscribeToKit } from "@/lib/newsletter/kit";
import { getSiteSettings } from "@/lib/sanity/api";
import {
  getClientIp,
  getFormValue,
  isRateLimited,
  isValidEmail,
  normalizeEmail,
  parseLocale,
  sanitizePath,
  sanitizeText,
} from "@/lib/newsletter/validation";

const redirectTo = (location: string): Response =>
  new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
    },
  });

const isLaunchSource = (source: string): boolean =>
  source.startsWith("launch_home") || source === "launch_archive" || source === "launch-mode";

const buildThanksPath = (locale: string, status: string, source: string, state?: string): string => {
  const params = new URLSearchParams({ status });
  if (state) {
    params.set("state", state);
  }
  const basePath = isLaunchSource(source) ? `/${locale}/launch/thanks` : `/${locale}/newsletter/thanks`;
  return `${basePath}?${params.toString()}`;
};

const mapSourceToSurface = (source: string): string => {
  if (source.startsWith("launch_home")) return "launch_home";
  if (source === "launch_archive") return "launch_archive";
  if (source === "home") return "home";
  if (source === "writing") return "writing_index";
  if (source === "launch-mode") return "launch";
  return "other";
};

const parseVariant = (value: string): string | undefined => {
  const normalized = sanitizeText(value, 12).toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "v1" || normalized === "v2" || normalized === "v3") return normalized;
  return undefined;
};

const trackGrowthSafely = async (
  event: Parameters<typeof trackGrowthEvent>[0],
  properties: Parameters<typeof trackGrowthEvent>[1],
): Promise<void> => {
  try {
    await trackGrowthEvent(event, properties);
  } catch {
    // Do not fail subscription flow because tracking failed.
  }
};

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") || "";
  let payload:
    | {
        locale?: string;
        email?: string;
        source?: string;
        variant?: string;
        path?: string;
      }
    | undefined;

  if (contentType.includes("application/json")) {
    payload = (await request.json().catch(() => ({}))) as typeof payload;
  } else {
    const formData = await request.formData();
    payload = {
      locale: getFormValue(formData, "locale"),
      email: getFormValue(formData, "email"),
      source: getFormValue(formData, "source"),
      variant: getFormValue(formData, "variant"),
      path: getFormValue(formData, "path"),
    };
  }

  const locale = parseLocale(payload?.locale || "");
  const email = normalizeEmail(payload?.email || "");
  const source = sanitizeText(payload?.source || "", 40) || "unknown";
  const variantFromForm = parseVariant(payload?.variant || "");
  const variantFromSource = parseVariant(source.split("_").at(-1) || "");
  const variant = variantFromForm || variantFromSource;
  const path = sanitizePath(payload?.path || "") || `/${locale}`;
  const surfaceType = mapSourceToSurface(source);

  await trackGrowthSafely("newsletter_subscribe_attempt", {
    locale,
    path,
    source,
    surface_type: surfaceType,
    variant,
  });

  if (!isValidEmail(email)) {
    await trackGrowthSafely("newsletter_subscribe_failed", {
      locale,
      path,
      source,
      surface_type: surfaceType,
      reason: "invalid_email",
      variant,
    });
    return redirectTo(buildThanksPath(locale, "invalid-email", source));
  }
  if (!isKitConfigured() || !hasNewsletterStateTokenSecret()) {
    await trackGrowthSafely("newsletter_subscribe_failed", {
      locale,
      path,
      source,
      surface_type: surfaceType,
      reason: "service_unavailable",
      variant,
    });
    return redirectTo(buildThanksPath(locale, "service-unavailable", source));
  }

  const ip = getClientIp(request.headers);
  if (isRateLimited(`newsletter:subscribe:${ip}:${email}`, 8, 60_000)) {
    await trackGrowthSafely("newsletter_subscribe_failed", {
      locale,
      path,
      source,
      surface_type: surfaceType,
      reason: "rate_limited",
      variant,
    });
    return redirectTo(buildThanksPath(locale, "rate-limited", source));
  }

  try {
    const settings = await getSiteSettings(locale, false);
    const consentPolicyVersion =
      settings.newsletterConsentPolicyVersion ||
      import.meta.env.NEWSLETTER_CONSENT_POLICY_VERSION ||
      "v1";

    await subscribeToKit({
      email,
      locale,
      source,
      path,
      consentTimestamp: new Date().toISOString(),
      consentPolicyVersion,
    });

    await trackGrowthSafely("newsletter_subscribe_success", {
      locale,
      path,
      source,
      surface_type: surfaceType,
      variant,
    });

    const state = createNewsletterStateToken({ email, locale });
    return redirectTo(buildThanksPath(locale, "subscribed", source, state));
  } catch (error) {
    console.error("[newsletter/subscribe] Subscription failed", error);
    await trackGrowthSafely("newsletter_subscribe_failed", {
      locale,
      path,
      source,
      surface_type: surfaceType,
      reason: "subscribe_error",
      variant,
    });
    return redirectTo(buildThanksPath(locale, "subscribe-error", source));
  }
};
