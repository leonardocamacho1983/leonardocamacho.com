# Operator Quick Start

Use this as the day-to-day one-page runbook.

## 0) Prerequisites (once)

```bash
npm install
cp .env.example .env
```

Required env vars for core workflows:
- `OPENAI_API_KEY`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `SANITY_API_VERSION`

## 1) Generate a source draft (review first)

```bash
bash scripts/content-workflow.sh review-source -- \
  --topic "Why founders mistake customer pull for strategy" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain how repeated requests can distort product direction." \
  --notes "Repeated demand can still be the wrong segment signal." \
  --thesisHint "Customer pull is signal, not strategy." \
  --sourceMode notes
```

If output is good, save:

```bash
bash scripts/content-workflow.sh generate-source-save -- \
  --topic "Why founders mistake customer pull for strategy" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain how repeated requests can distort product direction." \
  --notes "Repeated demand can still be the wrong segment signal." \
  --thesisHint "Customer pull is signal, not strategy." \
  --sourceMode notes
```

## 2) Inspect content state

```bash
bash scripts/content-workflow.sh inspect-content -- --postId drafts.post-translation-key-en-us
```

## 3) Localize

Dry-run:

```bash
bash scripts/content-workflow.sh review-localization -- --postId drafts.post-translation-key-en-us --all
```

Save:

```bash
bash scripts/content-workflow.sh localize-save -- --postId drafts.post-translation-key-en-us --all
```

## 4) Publish review (gate)

```bash
bash scripts/content-workflow.sh review-publish -- --translationKey your-translation-key --all
```

## 5) Publish

```bash
bash scripts/content-workflow.sh publish-draft-save -- --translationKey your-translation-key --all
```

## 6) Verify live

```bash
bash scripts/content-workflow.sh inspect-content -- --translationKey your-translation-key
curl -sSI "https://www.leonardocamacho.com/en-us/writing/your-post-slug"
npm run test:seo:acceptance
```

## 7) Refresh an existing post (optional)

```bash
bash scripts/content-workflow.sh review-refresh -- --slug your-post-slug --locale en-us
bash scripts/content-workflow.sh refresh-save -- --slug your-post-slug --locale en-us
```

## 8) Weekly SEO tracking

```bash
npm run seo:track -- \
  --csv /absolute/path/to/search-console-performance.csv \
  --indexing-csv /absolute/path/to/search-console-indexing.csv \
  --property leonardocamacho.com \
  --window last-28-days
```

Read:
- `/tmp/seo-tracking/<timestamp>-seo-tracking/summary.txt`
- `/tmp/seo-tracking/history.json`

## 9) Weekly growth KPI tracking

```bash
npm run growth:kpi:summary -- \
  --events /absolute/path/to/posthog-events-export.ndjson \
  --property leonardocamacho.com \
  --window last-28-days
```

Read:
- `/tmp/growth-kpi/<timestamp>-growth-kpi/summary.txt`
- `/tmp/growth-kpi/history.json`

Policy:
- `knowledge/system/growth-experimentation-policy.md`

## 10) Growth stabilization check (after 3 weekly runs)

```bash
npm run growth:kpi:stability -- --required-cycles 3
```

Read:
- `/tmp/growth-kpi/<timestamp>-growth-kpi-stability/report.txt`

## Fast failure triage

- Run dry-run version first (`review-*` commands).
- If dry-run passes but save fails, check write token/dataset.
- If one locale fails, isolate with `--targetLocale <locale>`.
- If publish-all fails, run `review-publish` and fix failing locale only.

## Safety gate before major changes

```bash
npm run build
npm run test:system:validation
```
