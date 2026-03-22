/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly SANITY_STUDIO_API_VERSION?: string;
  readonly SANITY_API_VERSION?: string;
  readonly SANITY_API_READ_TOKEN?: string;
  readonly SANITY_API_WRITE_TOKEN?: string;
  readonly SANITY_PREVIEW_SECRET?: string;
  readonly SANITY_WEBHOOK_BEARER_TOKEN?: string;
  readonly SANITY_WEBHOOK_ALLOWED_DATASETS?: string;
  readonly SEO_AUDIT_ALERT_WEBHOOK_URL?: string;
  readonly KIT_API_KEY?: string;
  readonly KIT_API_BASE_URL?: string;
  readonly KIT_FORM_ID?: string;
  readonly PUBLIC_LAUNCH_ILLUSTRATION_DEBUG?: string;
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
  readonly NEWSLETTER_CONFIRMATION_SUBJECT?: string;
  readonly NEWSLETTER_FLOW_SECRET?: string;
  readonly NEWSLETTER_CONSENT_POLICY_VERSION?: string;
  readonly NEWSLETTER_PRIVACY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  lcTrack?: (eventName: string, props?: Record<string, string | number | boolean>) => void;
  posthog?: {
    capture: (eventName: string, properties?: Record<string, unknown>) => void;
    init: (...args: unknown[]) => void;
    [key: string]: unknown;
  };
}
