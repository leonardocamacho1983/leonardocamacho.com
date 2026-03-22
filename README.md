# Camacho Website (Astro + Sanity)

This project is now an Astro website with:

- Multilingual locale-prefixed routes (`/en-us`, `/pt-br`, etc.)
- Dynamic content from Sanity Studio
- Embedded Sanity Studio at `/studio`
- Dynamic writing archive and post pages
- Light/dark mode (system default + persisted override)
- Vercel-ready server output + preview mode support

## Routes

- `/:locale/`
- `/:locale/about`
- `/:locale/writing`
- `/:locale/writing/:slug`
- `/studio/*`
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

### Studio Troubleshooting (`/studio`)

If embedded Studio shows a blank page or missing Vite chunks:

1. Run only one Astro dev process:

```bash
npm run dev -- --port 4321 --strictPort --force
```

2. Open `http://localhost:4321/studio/` (with trailing slash) and hard refresh (`Cmd+Shift+R`).
3. If browser console shows `ZOTERO_CONFIG`, `singlefile`, `messaging_inject`, or similar errors, test in Incognito with extensions disabled for localhost.

For urgent content editing fallback:

```bash
npx sanity dev --port 3333
```

Then use `http://localhost:3333`.

## Build

```bash
npm run build
npm run preview
```

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

## Deploy (Vercel)

The app is configured with `@astrojs/vercel` and `output: "server"`.
Set the same environment variables in Vercel before deployment.

## Sanity Webhooks and Releases

- Incoming webhook endpoint: `POST /api/sanity/webhook`
- Health check: `GET /api/sanity/webhook`
- SEO infra audit (MVP) is executed from webhook events, with alerting restricted to `P0/P1`
- Setup + workflow runbook:
  [guidelines/sanity-webhooks-and-releases.md](./guidelines/sanity-webhooks-and-releases.md)

## Indexing and Search Console

See [guidelines/indexing-and-ai.md](./guidelines/indexing-and-ai.md) for:

- Google Search Console DNS verification setup
- `robots.txt` and `sitemap.xml` policy
- AI indexing guidance via `llms.txt`
