# Camacho Website (Astro + Sanity)

This project is now an Astro website with:

- Multilingual locale-prefixed routes (`/en-us`, `/pt-br`, etc.)
- Dynamic content from Sanity Studio
- Standalone Sanity Studio for content operations
- Dynamic writing archive and post pages
- Light/dark mode (system default + persisted override)
- Vercel-ready server output + preview mode support

## Routes

- `/:locale/`
- `/:locale/about`
- `/:locale/writing`
- `/:locale/writing/:slug`
- `/` redirects to `/en-us`

## Environment Variables

Copy `.env.example` to `.env` and fill values:

- `PUBLIC_SITE_URL`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_API_READ_TOKEN` (for preview/drafts)
- `SANITY_PREVIEW_SECRET`
- `SANITY_API_WRITE_TOKEN` (for seeding script)
- `SANITY_WEBHOOK_BEARER_TOKEN` (auth for incoming Sanity webhook endpoint)
- `SANITY_WEBHOOK_ALLOWED_DATASETS` (comma-separated dataset allowlist)
- `KIT_API_KEY`
- `KIT_API_BASE_URL`
- `KIT_FORM_ID`
- `NEWSLETTER_CONFIRMATION_SUBJECT`
- `NEWSLETTER_FLOW_SECRET`
- `NEWSLETTER_CONSENT_POLICY_VERSION`
- `NEWSLETTER_PRIVACY_URL`

## Development

```bash
npm install
npm run dev
```

### Studio

Canonical Studio URL:

`https://leonardo-camacho-studio.sanity.studio/`

For local Studio development:

```bash
cd studio-standalone
npm install
npm run dev
```

If local Studio shows a blank page or missing chunks:

1. Run only one Studio dev process:

```bash
cd studio-standalone
npm run dev
```

2. Hard refresh the Studio tab (`Cmd+Shift+R`).
3. If browser console shows `ZOTERO_CONFIG`, `singlefile`, `messaging_inject`, or similar errors, test in Incognito with extensions disabled for localhost.

Transition note:
- the public site no longer embeds a Studio route
- use the standalone Studio URL for all CMS operations

## Build

```bash
npm run build
npm run preview
```

## Editorial Validation

Run the full editorial validation stack with:

```bash
npm run test:system:validation
```

This runs, in order:
- `test:llm:hardening`
- `test:editorial:benchmarks`
- `test:localization:regression`

The operator wrapper is:

```bash
bash scripts/content-workflow.sh validate-system
```

## Operations Manual

For day-to-day execution of create/localize/publish/refresh/SEO tracking workflows, use:

- [knowledge/system/operations-manual.md](./knowledge/system/operations-manual.md)
- [knowledge/system/operator-quick-start.md](./knowledge/system/operator-quick-start.md)

## Seed Initial Content

```bash
npm run seed
```

This seeds localized singleton pages, categories, and posts into your configured Sanity dataset.

## Preview Mode

Open preview with:

`/api/preview?secret=YOUR_SANITY_PREVIEW_SECRET&redirect=/en-us`

Exit preview with:

`/api/exit-preview`

## Newsletter Flow (Kit)

- Home/Writing newsletter forms post to `POST /api/newsletter/subscribe`
- Successful submission redirects to `/:locale/newsletter/thanks` with optional survey
- Survey submits to `POST /api/newsletter/profile`
- Optional confirmation page: `/:locale/newsletter/unsubscribed`
- Newsletter legal settings can be managed per locale in Sanity:
  `Site Settings -> Newsletter & Consent`:
  `Privacy policy URL` and `Consent policy version`

## Analytics (PostHog)

- Client key/host:
  - `PUBLIC_POSTHOG_KEY`
  - `PUBLIC_POSTHOG_HOST`
- Feature toggles:
  - `PUBLIC_POSTHOG_ENABLE_AUTOCAPTURE`
  - `PUBLIC_POSTHOG_ENABLE_PAGEVIEW`
  - `PUBLIC_POSTHOG_ENABLE_PAGELEAVE`
  - `PUBLIC_POSTHOG_ENABLE_SESSION_RECORDING`
  - `PUBLIC_POSTHOG_SESSION_RECORDING_SAMPLE_RATE` (`0..1`)
  - `PUBLIC_POSTHOG_ENABLE_SURVEYS`
- Consent remains mandatory: PostHog is initialized only after user accepts analytics.

## Deploy (Vercel)

The app is configured with `@astrojs/vercel` and `output: "server"`.
Set the same environment variables in Vercel before deployment.

## Studio Deploy

The standalone Studio lives in [studio-standalone](./studio-standalone).

```bash
cd studio-standalone
npm run build
npx sanity login
npm run deploy
```

## Sanity Webhooks and Releases

- Incoming webhook endpoint: `POST /api/sanity/webhook`
- Health check: `GET /api/sanity/webhook`
- SEO infra audit (MVP) is executed from webhook events, with alerting restricted to `P0/P1`
- Setup + workflow runbook:
  [knowledge/system/sanity-webhooks-and-releases.md](./knowledge/system/sanity-webhooks-and-releases.md)

## Indexing and Search Console

See [knowledge/site/indexing-and-ai.md](./knowledge/site/indexing-and-ai.md) for:

- Google Search Console DNS verification setup
- `robots.txt` and `sitemap.xml` policy
- AI indexing guidance via `llms.txt`
- Search Console tracking workflow (query/indexing movement)

Run the tracking CLI with:

```bash
npm run seo:track -- \
  --csv /absolute/path/to/search-console-performance.csv \
  --indexing-csv /absolute/path/to/search-console-indexing.csv \
  --property leonardocamacho.com \
  --window last-28-days
```

## Growth KPI Tracking

Summarize growth KPIs from PostHog event exports (`.ndjson`, `.json`, or `.csv`):

```bash
npm run growth:kpi:summary -- \
  --events /absolute/path/to/posthog-events-export.ndjson \
  --property leonardocamacho.com \
  --window last-28-days
```

Notes:
- Growth instrumentation tags events with `analytics_domain=growth`
- Baseline site telemetry tags events with `analytics_domain=editorial`
- The growth summarizer excludes non-growth tagged events from KPI calculations
- Experiment policy: [knowledge/system/growth-experimentation-policy.md](./knowledge/system/growth-experimentation-policy.md)

Run stabilization check after at least 3 weekly snapshots:

```bash
npm run growth:kpi:stability -- --required-cycles 3
```

## Post-Checklist Improvements

Deferred until the current roadmap checklist is closed:

- Architecture hardening: complete the `orchestrator coordinates / adapters communicate` model across all lanes.
- Storybook adoption: frontend-only (`src/components/*`) for visual state development and optional visual regression snapshots.

Reference:
- [ROADMAP.md](./ROADMAP.md), section `Track G — Future Domains` -> `Post-checklist system hardening`.
