# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Site: leonardocamacho.com

**Author:** Leonardo Camacho — DBA researcher (BSB Global/GWU),
strategy executive, Florianópolis, Brazil
**Newsletter:** The Compounding Letter
**Stack:** Astro (SSR), Sanity CMS, Kit.com for email, deployed on Vercel
**Obsidian/Zotero:** Academic reference pipeline feeding content

## Five Locales

| Locale | hreflang | URL prefix | Voice |
|--------|----------|------------|-------|
| en-us  | en-us    | /en-us/    | Anchor — direct, warm, authoritative |
| en-gb  | en-gb    | /en-gb/    | Measured, -ise/-our spellings |
| fr-fr  | fr       | /fr-fr/    | Formal, Académie française register |
| pt-br  | pt-br    | /pt-br/    | Warm, contractions natural, executive-to-peer |
| pt-pt  | pt       | /pt-pt/    | Conservative, European Portuguese |

## Brand System
- Typography: Playfair Display (headings), Cormorant Garamond (body), DM Sans (UI)
- Palette: cream base (#F6F3EC), ink (#1A1710), oxblood accent (#6E2535)
- CSS tokens: all colors via `var(--color-*)`, spacing via `var(--space-*)`, type via `var(--text-fluid-*)`
- Design language: flat surfaces, no box-shadows, no gradients, generous whitespace
- Images: WebP/AVIF max 300KB, SVG preferred for icons and illustrations
- OG images: 1200×630px, under 100KB

## Topics
AI governance · organizational learning · dynamic capabilities · HOTL ·
technology strategy · B2B · human-AI collaboration · DBA research ·
compounding advantage · capability systems

## Pages
/about · /research · /work · /now · /writing · /newsletter

## Agent Commands Available
/seo-brief · /write-post · /localize · /voice-director ·
/newsletter · /kit-automation · /growth-hack · /brand-assets · /art-director

---

## Commands

```bash
npm run dev          # Start dev server (localhost:4321)
npm run build        # astro check (TypeScript) then astro build
npm run preview      # Preview production build locally
npm run seed         # Seed Sanity with initial content (requires SANITY_API_WRITE_TOKEN)
npm run lint:design  # Bash script checking for hardcoded CSS values
```

`astro check` runs as part of every build — 0 errors required. Run it directly with `npx astro check`.

TypeScript path alias: `@/` → `src/` (configured in `tsconfig.json`).

---

## Architecture

### Routing

All content pages live under `src/pages/[locale]/` and use `export const prerender = false` (full SSR via Vercel adapter). The `[locale]` param is validated against the `LOCALES` array in `src/lib/locales.ts`; invalid values redirect to `/en-us`.

Route helpers in `src/lib/locales.ts`:
- `localizedPath(locale, route, slug?)` — builds locale-prefixed URLs
- `routeFromPath(pathname)` — maps a pathname back to a route key
- `localeLinksForPath(pathname, locale)` — generates the full hreflang link set for `<head>`

### Data Flow: Sanity → Pages

```
Sanity CMS
  └─ src/lib/sanity/client.ts     — two clients: publishedClient (CDN) + previewClient (drafts)
  └─ src/lib/sanity/queries.ts    — GROQ query strings (one per page type)
  └─ src/lib/sanity/api.ts        — typed fetch functions wrapping fetchOrFallback<T>()
       └─ src/lib/fallback-content.ts  — hardcoded fallback if Sanity unreachable
  └─ src/pages/[locale]/*.astro   — call getSiteSettings() + page-specific getter in Promise.all()
```

Every API function (`getSiteSettings`, `getAboutPage`, `getPosts`, etc.) silently falls back to static content if Sanity is misconfigured or down.

**Preview mode:** activate via `GET /api/preview?secret=...` — sets an httpOnly `sanity-preview=true` cookie. Pages call `isPreviewRequest(Astro.cookies)` and pass `preview: true` to all Sanity fetches, which switches to `previewClient` (perspective: `drafts`).

### Sanity Schema

Documents in `sanity/schemas/documents/`:
- `siteSettings` — global nav, footer, newsletter config (singleton per locale)
- `homePage`, `aboutPage`, `writingPage` — page content (singleton per locale)
- `post` — blog post with `translationKey` field linking translations across locales
- `category` — color, order, translationKey

All documents carry a `locale` field (`en-us` | `en-gb` | ...). The canonical Studio is the standalone deployment at `https://leonardo-camacho-studio.sanity.studio/`. The public Astro app no longer embeds a `/studio` route.

### Newsletter (Kit.com)

Subscription flow: `POST /api/newsletter/subscribe` → rate-limit check → `subscribeToKit()` in `src/lib/newsletter/kit.ts` → subscriber created as `inactive` (triggers Kit DOI email) → encrypted state token issued → redirect to `/:locale/newsletter/thanks`.

The state token (`src/lib/newsletter/state-token.ts`) encrypts email + locale using `NEWSLETTER_FLOW_SECRET` so the email never appears in plain text in URLs or referrer logs.

Profile update: `POST /api/newsletter/profile` decrypts the state token, maps survey fields to Kit custom fields.

Rate limiter is in-memory (resets on cold start) — acceptable for Vercel serverless.

### CSS Architecture

Import order in `BaseLayout.astro` is load-order significant:
```
tokens.css → base.css → layout.css → components.css
```

`tokens.css` is the single source of truth for all design tokens. When adding styles, always use tokens — never hardcoded values. `lint:design` enforces this.

### Scroll Reveal Animations

`public/js/microanim.js` drives all scroll animations. Mark elements with:
```html
<div class="scroll-reveal" data-y="24" data-delay="60">
```
`data-y` = pixel translate offset, `data-delay` = ms delay.

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `PUBLIC_SANITY_PROJECT_ID` | Sanity project (defaults to `5cx1wkew`) |
| `PUBLIC_SANITY_DATASET` | Sanity dataset (defaults to `production`) |
| `SANITY_API_READ_TOKEN` | Required for preview mode |
| `SANITY_API_WRITE_TOKEN` | Required for `npm run seed` |
| `SANITY_PREVIEW_SECRET` | Activates preview mode |
| `KIT_API_KEY` + `KIT_FORM_ID` | Newsletter subscription |
| `NEWSLETTER_FLOW_SECRET` | State token encryption (generate: `openssl rand -hex 32`) |
| `PUBLIC_POSTHOG_KEY` | Consent-gated analytics |

---

## Key Patterns

**Locale validation on every page:**
```ts
const locale = getLocaleOrDefault(Astro.params.locale);
if (!rawLocale || rawLocale.toLowerCase() !== locale) {
  return Astro.redirect(localizedPath("en-us", "home"), 302);
}
```

**Parallel data fetch pattern:**
```ts
const [settings, pageData] = await Promise.all([
  getSiteSettings(locale, isPreview),
  getPageData(locale, isPreview),
]);
```

**Adding a new locale:** update `LOCALES` in `src/lib/locales.ts`, Sanity schema options, `localeMap` in `format.ts`, newsletter copy in `src/data/newsletter-copy.ts`, then create Sanity documents for that locale.

**Adding a new page type:** add Sanity schema doc → add GROQ query to `queries.ts` → add typed DTO to `types.ts` → add fetch function to `api.ts` with fallback → add fallback content to `fallback-content.ts` → create `src/pages/[locale]/pagename.astro`.
