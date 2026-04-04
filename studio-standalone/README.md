# Standalone Sanity Studio

This Studio is the standalone CMS app for the project. It consumes the root schema from `../sanity` so the public site and the Studio use the same document model and desk structure.

## Environment

The Studio reads the same Sanity env vars used by the main app:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `PUBLIC_SANITY_API_VERSION`
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`
- `SANITY_STUDIO_API_VERSION`

If the env vars are not set, the current defaults are:

- project ID: `5cx1wkew`
- dataset: `production`
- API version: `2025-02-01`

## Local development

```bash
cd studio-standalone
npm install
npm run dev
```

## Build

```bash
cd studio-standalone
npm run build
```

## Deploy

```bash
cd studio-standalone
npx sanity login
npm run deploy
```

After deploy, Sanity returns the hosted Studio URL. That URL becomes the operator entrypoint until a custom Studio domain is added.
