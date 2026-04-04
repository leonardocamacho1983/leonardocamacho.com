import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const parseOrigin = (value) => {
  const configured = (value || "").trim();
  if (!configured) return null;

  try {
    const parsed = new URL(/^[a-z][a-z0-9+\-.]*:\/\//i.test(configured) ? configured : `https://${configured}`);
    if (LOCAL_HOSTS.has(parsed.hostname)) {
      return null;
    }
    return parsed.origin.replace(/\/+$/, "");
  } catch {
    return null;
  }
};

const resolveSiteUrl = () => {
  const vercelUrl = parseOrigin(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl;
  }

  const productionUrl = parseOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (productionUrl) {
    return productionUrl;
  }

  const configured = parseOrigin(process.env.PUBLIC_SITE_URL);
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL === "1") {
    return "https://www.leonardocamacho.com";
  }

  return "http://localhost:4321";
};

export default defineConfig({
  site: resolveSiteUrl(),
  output: "server",
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  integrations: [
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
