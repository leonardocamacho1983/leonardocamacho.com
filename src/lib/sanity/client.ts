import { createClient } from "@sanity/client";

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};

const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] || "" : "") || viteEnv[key] || "";

type ClientCache = {
  cacheKey: string;
  publishedClient: ReturnType<typeof createClient>;
  previewClient: ReturnType<typeof createClient> | null;
};

let cachedClients: ClientCache | null = null;

const resolveConfig = () => {
  const projectId = readEnv("PUBLIC_SANITY_PROJECT_ID");
  const dataset = readEnv("PUBLIC_SANITY_DATASET");
  const apiVersion = readEnv("SANITY_API_VERSION") || "2025-02-01";
  const token = readEnv("SANITY_API_READ_TOKEN") || readEnv("SANITY_API_WRITE_TOKEN");

  return {
    projectId,
    dataset,
    apiVersion,
    token,
  };
};

const getOrCreateClients = (): ClientCache | null => {
  const config = resolveConfig();
  if (!config.projectId || !config.dataset) {
    return null;
  }

  const cacheKey = `${config.projectId}|${config.dataset}|${config.apiVersion}|${config.token || ""}`;
  if (!cachedClients || cachedClients.cacheKey !== cacheKey) {
    const baseConfig = {
      projectId: config.projectId,
      dataset: config.dataset,
      apiVersion: config.apiVersion,
      useCdn: true,
      stega: false,
    };

    cachedClients = {
      cacheKey,
      publishedClient: createClient(baseConfig),
      previewClient: config.token
        ? createClient({
            ...baseConfig,
            useCdn: false,
            perspective: "drafts",
            token: config.token,
          })
        : null,
    };
  }

  return cachedClients;
};

export const hasSanityConfig = (): boolean => {
  const { projectId, dataset } = resolveConfig();
  return Boolean(projectId && dataset);
};

export const getSanityClient = (preview = false) => {
  const clients = getOrCreateClients();
  if (!clients) {
    return null;
  }

  if (preview && clients.previewClient) {
    return clients.previewClient;
  }
  return clients.publishedClient;
};

export const sanityEnvironment = {
  get projectId() {
    return resolveConfig().projectId;
  },
  get dataset() {
    return resolveConfig().dataset;
  },
  get apiVersion() {
    return resolveConfig().apiVersion;
  },
};
