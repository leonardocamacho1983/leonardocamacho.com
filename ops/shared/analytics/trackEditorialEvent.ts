export type EditorialEventName = "workflow_started" | "draft_created" | "review_failed";

export interface EditorialEventPayload {
  workflow: string;
  contentType?: string;
  locale?: string;
  draftId?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface EditorialEventResult {
  sent: boolean;
  reason?: string;
}

const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";

const getPosthogHost = (): string => (readEnv("PUBLIC_POSTHOG_HOST") || "https://us.i.posthog.com").replace(/\/+$/, "");

const getPosthogKey = (): string => readEnv("PUBLIC_POSTHOG_KEY");

export const trackEditorialEvent = async (
  event: EditorialEventName,
  properties: EditorialEventPayload,
): Promise<EditorialEventResult> => {
  const apiKey = getPosthogKey();
  if (!apiKey) {
    return { sent: false, reason: "missing_posthog_key" };
  }

  const distinctId = `editorial:${properties.workflow}:${properties.locale || "unknown"}`;

  try {
    const response = await fetch(`${getPosthogHost()}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          source: "compounding_os",
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
