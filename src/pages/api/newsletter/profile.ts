import type { APIRoute } from "astro";
import { trackGrowthEvent } from "@/lib/analytics/growth";
import { localizedPath } from "@/lib/locales";
import { updateKitProfile } from "@/lib/newsletter/kit";
import { verifyNewsletterStateToken } from "@/lib/newsletter/state-token";
import {
  getClientIp,
  getFormValue,
  isRateLimited,
  parseLocale,
  sanitizeOptionalNumber,
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

const trackGrowthSafely = async (
  event: Parameters<typeof trackGrowthEvent>[0],
  properties: Parameters<typeof trackGrowthEvent>[1],
): Promise<void> => {
  try {
    await trackGrowthEvent(event, properties);
  } catch {
    // Never fail profile flow due to tracking errors.
  }
};

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const localeFromForm = parseLocale(getFormValue(formData, "locale"));
  const state = getFormValue(formData, "state");
  const payload = verifyNewsletterStateToken(state);

  if (!payload) {
    await trackGrowthSafely("newsletter_profile_failed", {
      locale: localeFromForm,
      path: `/${localeFromForm}/newsletter/thanks`,
      source: "newsletter_profile",
      surface_type: "confirmed",
      reason: "invalid_state",
    });
    return redirectTo(buildThanksPath(localeFromForm, "invalid-state"));
  }

  const ip = getClientIp(request.headers);
  if (isRateLimited(`newsletter:profile:${ip}:${payload.email}`, 12, 5 * 60_000)) {
    await trackGrowthSafely("newsletter_profile_failed", {
      locale: payload.locale,
      path: localizedPath(payload.locale, "writing"),
      source: "newsletter_profile",
      surface_type: "confirmed",
      reason: "rate_limited",
    });
    return redirectTo(buildThanksPath(payload.locale, "rate-limited", state));
  }

  const position = sanitizeText(getFormValue(formData, "position"), 120);
  const company = sanitizeText(getFormValue(formData, "company"), 120);
  const teamSize = sanitizeOptionalNumber(getFormValue(formData, "team_size"));
  const customerImpactMonthly = sanitizeOptionalNumber(getFormValue(formData, "customer_impact_monthly"));

  if (!position && !company && !teamSize && !customerImpactMonthly) {
    return redirectTo(localizedPath(payload.locale, "writing"));
  }

  try {
    await updateKitProfile({
      email: payload.email,
      position,
      company,
      teamSize,
      customerImpactMonthly,
    });
    await trackGrowthSafely("newsletter_profile_saved", {
      locale: payload.locale,
      path: localizedPath(payload.locale, "writing"),
      source: "newsletter_profile",
      surface_type: "confirmed",
    });
    return redirectTo(`${localizedPath(payload.locale, "writing")}?profile=saved`);
  } catch (error) {
    console.error("[newsletter/profile] Profile update failed", error);
    await trackGrowthSafely("newsletter_profile_failed", {
      locale: payload.locale,
      path: localizedPath(payload.locale, "writing"),
      source: "newsletter_profile",
      surface_type: "confirmed",
      reason: "profile_error",
    });
    return redirectTo(buildThanksPath(payload.locale, "profile-error", state));
  }
};
