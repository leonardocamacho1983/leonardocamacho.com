import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { deskStructure } from "./sanity/lib/deskStructure";

const nodeEnv = typeof process === "undefined" ? {} : process.env;
const viteEnv = import.meta.env ?? {};

const projectId =
  nodeEnv.PUBLIC_SANITY_PROJECT_ID ||
  nodeEnv.SANITY_STUDIO_PROJECT_ID ||
  viteEnv.PUBLIC_SANITY_PROJECT_ID ||
  viteEnv.SANITY_STUDIO_PROJECT_ID ||
  "5cx1wkew";

const dataset =
  nodeEnv.PUBLIC_SANITY_DATASET ||
  nodeEnv.SANITY_STUDIO_DATASET ||
  viteEnv.PUBLIC_SANITY_DATASET ||
  viteEnv.SANITY_STUDIO_DATASET ||
  "production";

const apiVersion =
  nodeEnv.PUBLIC_SANITY_API_VERSION ||
  nodeEnv.SANITY_API_VERSION ||
  nodeEnv.SANITY_STUDIO_API_VERSION ||
  viteEnv.PUBLIC_SANITY_API_VERSION ||
  viteEnv.SANITY_API_VERSION ||
  viteEnv.SANITY_STUDIO_API_VERSION ||
  "2025-02-01";

export default defineConfig({
  name: "default",
  title: "Camacho Website Studio",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
});
