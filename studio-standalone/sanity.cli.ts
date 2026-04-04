import { defineCliConfig } from "sanity/cli";

const env = typeof process === "undefined" ? {} : process.env;

const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID || "5cx1wkew";
const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: {
    appId: "bw4ljgl22lghs1hkhzuqds3c",
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
});
