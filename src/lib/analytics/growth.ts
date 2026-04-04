export type GrowthEventName =
  | "newsletter_subscribe_attempt"
  | "newsletter_subscribe_success"
  | "newsletter_subscribe_failed"
  | "newsletter_profile_saved"
  | "newsletter_profile_failed";

export interface GrowthEventPayload {
  locale?: string;
  path?: string;
  source?: string;
  surface_type?: string;
  reason?: string;
  status?: number | string;
  [key: string]: unknown;
}

export interface GrowthEventResult {
  sent: boolean;
  reason?: string;
}

const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";

const getPosthogHost = (): string => (readEnv("PUBLIC_POSTHOG_HOST") || "https://us.i.posthog.com").replace(/\/+$/, "");
const getPosthogKey = (): string => readEnv("PUBLIC_POSTHOG_KEY");

export const trackGrowthEvent = async (
  event: GrowthEventName,
  properties: GrowthEventPayload,
): Promise<GrowthEventResult> => {
  const apiKey = getPosthogKey();
  if (!apiKey) {
    return { sent: false, reason: "missing_posthog_key" };
  }

  const distinctId = `growth_server:${properties.locale || "unknown"}:${properties.source || "unknown"}`;

  try {
    const response = await fetch(`${getPosthogHost()}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          analytics_domain: "growth",
          analytics_channel: "server",
          source: "website_growth_backend",
          ...properties,
        },
      }),
    });

    if (!response.ok) {
      return { sent: false, reason: `http_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "unknown_error",
    };
  }
};
