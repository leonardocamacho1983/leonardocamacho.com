import type { APIRoute } from "astro";
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

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const localeFromForm = parseLocale(getFormValue(formData, "locale"));
  const state = getFormValue(formData, "state");
  const payload = verifyNewsletterStateToken(state);

  if (!payload) {
    return redirectTo(buildThanksPath(localeFromForm, "invalid-state"));
  }

  const ip = getClientIp(request.headers);
  if (isRateLimited(`newsletter:profile:${ip}:${payload.email}`, 12, 5 * 60_000)) {
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
    return redirectTo(`${localizedPath(payload.locale, "writing")}?profile=saved`);
  } catch (error) {
    console.error("[newsletter/profile] Profile update failed", error);
    return redirectTo(buildThanksPath(payload.locale, "profile-error", state));
  }
};
