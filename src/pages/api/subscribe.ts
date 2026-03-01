export const prerender = false;

import type { APIRoute } from 'astro';
import type { LocaleKey } from '@/lib/locales';
import { isKitConfigured, subscribeToKit } from '@/lib/newsletter/kit';
import { getSiteSettings } from '@/lib/sanity/api';
import {
  getClientIp,
  isRateLimited,
  isValidEmail,
  normalizeEmail,
  sanitizePath,
  sanitizeText,
} from '@/lib/newsletter/validation';

const LEGACY_TO_LOCALE: Record<string, LocaleKey> = {
  en_US: 'en-us',
  en_UK: 'en-gb',
  pt_BR: 'pt-br',
  pt_PT: 'pt-pt',
  fr_FR: 'fr-fr',
};

const normalizeLocale = (input?: string): LocaleKey => {
  if (!input) return 'en-us';
  if (input in LEGACY_TO_LOCALE) return LEGACY_TO_LOCALE[input];

  const normalized = input.toLowerCase().replace('_', '-');
  if (normalized === 'en-us' || normalized === 'en-gb' || normalized === 'pt-br' || normalized === 'pt-pt' || normalized === 'fr-fr') {
    return normalized;
  }

  return 'en-us';
};

const inferPath = (request: Request, locale: LocaleKey): string => {
  const referrer = request.headers.get('referer');
  if (!referrer) return `/${locale}`;

  try {
    const url = new URL(referrer);
    return url.pathname || `/${locale}`;
  } catch {
    return `/${locale}`;
  }
};

export const POST: APIRoute = async ({ request }) => {
  let payload: { email?: unknown; locale?: unknown; source?: unknown; path?: unknown };
  try {
    payload = (await request.json()) as {
      email?: unknown;
      locale?: unknown;
      source?: unknown;
      path?: unknown;
    };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
  const locale = typeof payload.locale === 'string' ? payload.locale : undefined;
  const source =
    typeof payload.source === 'string'
      ? sanitizeText(payload.source, 40) || 'launch-mode'
      : 'launch-mode';
  const requestedPath = typeof payload.path === 'string' ? sanitizePath(payload.path) : '';

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400 });
  }

  if (!isKitConfigured()) {
    return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 });
  }

  const normalizedLocale = normalizeLocale(locale);
  const resolvedPath = requestedPath || inferPath(request, normalizedLocale);
  const ip = getClientIp(request.headers);

  if (isRateLimited(`launch:subscribe:${ip}:${email}`, 8, 60_000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  try {
    const settings = await getSiteSettings(normalizedLocale, false);
    const consentPolicyVersion =
      settings.newsletterConsentPolicyVersion ||
      import.meta.env.NEWSLETTER_CONSENT_POLICY_VERSION ||
      'v1';

    const result = await subscribeToKit({
      email,
      locale: normalizedLocale,
      source,
      path: resolvedPath,
      consentTimestamp: new Date().toISOString(),
      consentPolicyVersion,
    });

    return new Response(
      JSON.stringify({ success: true, subscriber_id: result.subscriberId || null }),
      { status: 200 },
    );
  } catch (error) {
    console.error('[api/subscribe] Subscribe error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
