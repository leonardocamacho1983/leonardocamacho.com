import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "../sanity/schemaTypes";
import { deskStructure } from "../sanity/lib/deskStructure";

const nodeEnv = typeof process === "undefined" ? {} : process.env;

const projectId =
  nodeEnv.PUBLIC_SANITY_PROJECT_ID ||
  nodeEnv.SANITY_STUDIO_PROJECT_ID ||
  "5cx1wkew";

const dataset =
  nodeEnv.PUBLIC_SANITY_DATASET ||
  nodeEnv.SANITY_STUDIO_DATASET ||
  "production";

const apiVersion =
  nodeEnv.PUBLIC_SANITY_API_VERSION ||
  nodeEnv.SANITY_API_VERSION ||
  nodeEnv.SANITY_STUDIO_API_VERSION ||
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
