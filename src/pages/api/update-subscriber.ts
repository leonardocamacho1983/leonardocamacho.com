export const prerender = false;

import type { APIRoute } from 'astro';
import { isKitConfigured, updateKitProfileBySubscriberId } from '@/lib/newsletter/kit';
import {
  getClientIp,
  isRateLimited,
  sanitizeText,
} from '@/lib/newsletter/validation';
import {
  hasNewsletterStateTokenSecret,
  verifySubscriberUpdateToken,
} from '@/lib/newsletter/state-token';

interface UpdateSubscriberPayload {
  subscriber_id?: unknown;
  update_token?: unknown;
  fields?: unknown;
}

const getSafeField = (value: unknown, maxLength: number): string => {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return sanitizeText(String(value), maxLength);
  }
  return '';
};

export const POST: APIRoute = async ({ request }) => {
  let payload: UpdateSubscriberPayload;
  try {
    payload = (await request.json()) as UpdateSubscriberPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
  }

  const subscriberId =
    typeof payload.subscriber_id === 'string' ? payload.subscriber_id.trim() : '';
  const updateToken =
    typeof payload.update_token === 'string' ? payload.update_token.trim() : '';
  const fields =
    payload.fields && typeof payload.fields === 'object'
      ? (payload.fields as Record<string, unknown>)
      : {};

  if (!subscriberId) {
    return new Response(JSON.stringify({ error: 'subscriber_id required' }), { status: 400 });
  }

  if (!updateToken) {
    return new Response(JSON.stringify({ error: 'update_token required' }), { status: 400 });
  }

  if (!isKitConfigured() || !hasNewsletterStateTokenSecret()) {
    return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 });
  }

  const ip = getClientIp(request.headers);
  if (isRateLimited(`newsletter:update:${ip}:${subscriberId}`, 20, 60_000)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 });
  }

  const verifiedToken = verifySubscriberUpdateToken(updateToken, subscriberId);
  if (!verifiedToken) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403 });
  }

  try {
    await updateKitProfileBySubscriberId(subscriberId, {
      position: getSafeField(fields.position, 120),
      company: getSafeField(fields.company, 120),
      companyWebsite: getSafeField(fields.company_website, 220),
      teamSize: getSafeField(fields.team_size, 80),
      strategicQuestion: getSafeField(fields.strategic_question, 500),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[api/update-subscriber] Update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
