const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";

export interface BroadcastInput {
  subject: string;
  previewText: string;
  contentHtml: string;
  description?: string;
  dryRun?: boolean;
}

export interface BroadcastResult {
  dryRun: boolean;
  broadcastId: string | null;
  subject: string;
  previewUrl: string | null;
}

interface KitBroadcastResponse {
  broadcast?: {
    id?: string | number;
    subject?: string;
    preview_url?: string;
  };
}

const getConfig = () => {
  const apiKey = readEnv("KIT_API_KEY");
  const rawBase = readEnv("KIT_API_BASE_URL") || "https://api.kit.com/v4";
  const baseUrl = rawBase.replace(/\/+$/, "");
  return { apiKey, baseUrl };
};

export const isKitConfigured = (): boolean => Boolean(getConfig().apiKey);

export const createBroadcast = async (input: BroadcastInput): Promise<BroadcastResult> => {
  const dryRun = input.dryRun ?? true;

  if (dryRun) {
    return {
      dryRun: true,
      broadcastId: null,
      subject: input.subject,
      previewUrl: null,
    };
  }

  const { apiKey, baseUrl } = getConfig();
  if (!apiKey) {
    throw new Error("Missing KIT_API_KEY for broadcast creation.");
  }

  const payload = {
    subject: input.subject,
    description: input.description || input.subject,
    content: input.contentHtml,
    preview_text: input.previewText,
    public: false,
  };

  const response = await fetch(`${baseUrl}/broadcasts`, {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let details = `${response.status} ${response.statusText}`.trim();
    try {
      const body = await response.json();
      details = JSON.stringify(body);
    } catch {
      // keep default
    }
    throw new Error(`Kit broadcast API failed: ${details}`);
  }

  const data = (await response.json()) as KitBroadcastResponse;
  const id = data?.broadcast?.id;
  const broadcastId = typeof id === "number" ? String(id) : typeof id === "string" ? id : null;
  const previewUrl =
    typeof data?.broadcast?.preview_url === "string" ? data.broadcast.preview_url : null;

  return { dryRun: false, broadcastId, subject: input.subject, previewUrl };
};
