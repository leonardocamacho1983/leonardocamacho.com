import { createClient } from "@sanity/client";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || "";
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "";
const apiVersion = import.meta.env.SANITY_API_VERSION || "2025-02-01";
const token = import.meta.env.SANITY_API_READ_TOKEN;

export const hasSanityConfig = Boolean(projectId && dataset);

const baseConfig = hasSanityConfig
  ? {
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      stega: false,
    }
  : null;

const publishedClient = baseConfig ? createClient(baseConfig) : null;
const previewClient = baseConfig
  ? createClient({
      ...baseConfig,
      useCdn: false,
      perspective: "previewDrafts",
      token,
    })
  : null;

export const getSanityClient = (preview = false) => {
  if (!publishedClient) {
    return null;
  }

  if (preview && token && previewClient) {
    return previewClient;
  }
  return publishedClient;
};

export const sanityEnvironment = {
  projectId,
  dataset,
  apiVersion,
};
