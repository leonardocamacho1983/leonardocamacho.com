import type { APIRoute } from "astro";
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

const buildThanksPath = (locale: string, status: string, state?: string): string => {
  const params = new URLSearchParams({ status });
  if (state) {
    params.set("state", state);
  }
  return `/${locale}/newsletter/thanks?${params.toString()}`;
};

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const locale = parseLocale(getFormValue(formData, "locale"));
  const email = normalizeEmail(getFormValue(formData, "email"));
  const source = sanitizeText(getFormValue(formData, "source"), 40) || "unknown";
  const path = sanitizePath(getFormValue(formData, "path")) || `/${locale}`;

  if (!isValidEmail(email)) {
    return redirectTo(buildThanksPath(locale, "invalid-email"));
  }
  if (!isKitConfigured() || !hasNewsletterStateTokenSecret()) {
    return redirectTo(buildThanksPath(locale, "service-unavailable"));
  }

  const ip = getClientIp(request.headers);
  if (isRateLimited(`newsletter:subscribe:${ip}:${email}`, 8, 60_000)) {
    return redirectTo(buildThanksPath(locale, "rate-limited"));
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

    const state = createNewsletterStateToken({ email, locale });
    return redirectTo(buildThanksPath(locale, "subscribed", state));
  } catch (error) {
    console.error("[newsletter/subscribe] Subscription failed", error);
    return redirectTo(buildThanksPath(locale, "subscribe-error"));
  }
};
