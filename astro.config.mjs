import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import sanity from "@sanity/astro";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "5cx1wkew";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "http://localhost:4321",
  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: process.env.SANITY_API_VERSION || "2025-02-01",
      useCdn: true,
      studioBasePath: "/studio",
    }),
    react(),
  ],
  vite: {
    server: {
      fs: {
        strict: false,
      },
    },
    optimizeDeps: {
      include: ["void-elements", "html-parse-stringify", "prop-types", "react-focus-lock"],
    },
  },
});
