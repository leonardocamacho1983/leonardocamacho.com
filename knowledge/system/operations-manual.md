# System Operations Manual (v1)

This manual explains how to run the current editorial system end-to-end as it exists today.

If you want the short operational version, use:
- `knowledge/system/operator-quick-start.md`

## 1) Current Scope

The system currently supports:
- source draft generation (`create`)
- draft inspection (`inspect`)
- localization from source locale (`localize`)
- draft publishing (`publish`)
- content refresh for existing posts (`refresh`)
- SEO quality checks and Search Console movement tracking
- growth KPI snapshots with growth/editorial analytics separation

Current source locale:
- `en-us`

Current supported target locales:
- `en-gb`
- `pt-br`
- `pt-pt`
- `fr-fr`

## 2) Required Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill real values:

```bash
cp .env.example .env
```

3. Minimum environment values to operate workflows:
- `OPENAI_API_KEY`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `SANITY_API_VERSION`
- `PUBLIC_SITE_URL`

4. Optional but recommended for full system use:
- newsletter vars (`KIT_*`, `NEWSLETTER_*`)
- telemetry vars (`PUBLIC_POSTHOG_*`)
- webhook vars (`SANITY_WEBHOOK_*`)

## 3) Core Operator Entry Point

Preferred command wrapper:

```bash
bash scripts/content-workflow.sh <command> -- <args>
```

Main commands:
- `review-source` (dry-run source generation)
- `generate-source-save` (save source draft in Sanity)
- `inspect-content` (single post or full translation set status)
- `review-localization` (dry-run localization checks)
- `localize-save` (save localized drafts)
- `review-publish` (publish preflight review)
- `publish-draft-save` (publish draft(s))
- `review-refresh` / `refresh-save` (refresh existing content)
- `validate-system` (full validation stack)
- `seo-track` (Search Console movement ingestion)

## 4) Standard End-to-End Flow

### Step A: Review a source draft (dry-run)

```bash
bash scripts/content-workflow.sh review-source -- \
  --topic "Why founders mistake customer pull for strategy" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain how repeated requests can simulate market truth and distort product direction." \
  --notes "Repeated demand can come from the wrong segment." \
  --notes "Each exception looks rational in isolation." \
  --thesisHint "Customer pull is a signal, not a strategy." \
  --sourceMode notes
```

### Step B: Save the source draft

```bash
bash scripts/content-workflow.sh generate-source-save -- \
  --topic "Why founders mistake customer pull for strategy" \
  --type insight \
  --audience founders \
  --locale en-us \
  --goal "Explain how repeated requests can simulate market truth and distort product direction." \
  --notes "Repeated demand can come from the wrong segment." \
  --notes "Each exception looks rational in isolation." \
  --thesisHint "Customer pull is a signal, not a strategy." \
  --sourceMode notes
```

### Step C: Inspect saved content state

By draft id:

```bash
bash scripts/content-workflow.sh inspect-content -- --postId drafts.post-translation-key-en-us
```

By slug + locale:

```bash
bash scripts/content-workflow.sh inspect-content -- --slug your-post-slug --locale en-us
```

### Step D: Localize

Dry-run:

```bash
bash scripts/content-workflow.sh review-localization -- --postId drafts.post-translation-key-en-us --all
```

Save localized drafts:

```bash
bash scripts/content-workflow.sh localize-save -- --postId drafts.post-translation-key-en-us --all
```

### Step E: Review publishability

Single draft:

```bash
bash scripts/content-workflow.sh review-publish -- --postId drafts.post-translation-key-en-us
```

Translation set:

```bash
bash scripts/content-workflow.sh review-publish -- --translationKey your-translation-key --all
```

### Step F: Publish

Single draft:

```bash
bash scripts/content-workflow.sh publish-draft-save -- --postId drafts.post-translation-key-en-us
```

Translation set:

```bash
bash scripts/content-workflow.sh publish-draft-save -- --translationKey your-translation-key --all
```

## 5) Post-Publish Verification

1. Re-inspect and confirm state moved to `published_live` or expected `draft_pending_publish`:

```bash
bash scripts/content-workflow.sh inspect-content -- --translationKey your-translation-key
```

2. Validate one live URL:

```bash
curl -sSI "https://www.leonardocamacho.com/en-us/writing/your-post-slug"
```

3. Run SEO acceptance checks:

```bash
npm run test:seo:acceptance
```

## 6) Refresh Existing Content

Review refresh plan (dry-run):

```bash
bash scripts/content-workflow.sh review-refresh -- \
  --slug your-post-slug \
  --locale en-us
```

Apply refresh and save:

```bash
bash scripts/content-workflow.sh refresh-save -- \
  --slug your-post-slug \
  --locale en-us
```

Optional refresh controls:
- `--postId <id>`
- `--source published|draft`
- `--type essay|insight|research|note`
- `--audience <audience>`
- `--goal <goal>`
- `--topic <topic>`
- repeated `--notes "<note>"`

## 7) SEO Tracking (Search Console)

Run tracking from exported CSV files:

```bash
npm run seo:track -- \
  --csv /absolute/path/to/search-console-performance.csv \
  --indexing-csv /absolute/path/to/search-console-indexing.csv \
  --property leonardocamacho.com \
  --window last-28-days
```

Artifacts:
- `/tmp/seo-tracking/<timestamp>-seo-tracking/`
- `/tmp/seo-tracking/history.json`

Primary files to read:
- `summary.txt`
- `performance.movement.json`
- `indexing.movement.json`

## 8) Growth KPI Tracking

Run growth KPI summarization from PostHog event exports (`.ndjson`, `.json`, or `.csv`):

```bash
npm run growth:kpi:summary -- \
  --events /absolute/path/to/posthog-events-export.ndjson \
  --property leonardocamacho.com \
  --window last-28-days
```

You can pass multiple exports:

```bash
npm run growth:kpi:summary -- \
  --events /path/events-part-1.ndjson \
  --events /path/events-part-2.ndjson \
  --property leonardocamacho.com
```

Artifacts:
- `/tmp/growth-kpi/<timestamp>-growth-kpi/`
- `/tmp/growth-kpi/history.json`

Primary files to read:
- `summary.txt`
- `snapshot.json`
- `movement.json`

Notes:
- growth events are tagged with `analytics_domain=growth`
- baseline telemetry defaults to `analytics_domain=editorial`
- the summarizer excludes non-growth tagged records from KPI calculations while still reporting domain split

Experiment policy:
- `knowledge/system/growth-experimentation-policy.md`

## 8.1) Growth KPI Stabilization Check

After at least 3 weekly snapshots, run stability analysis against history:

```bash
npm run growth:kpi:stability -- \
  --required-cycles 3 \
  --property leonardocamacho.com
```

Operator wrapper:

```bash
bash scripts/content-workflow.sh growth-stability -- --required-cycles 3
```

Artifacts:
- `/tmp/growth-kpi/<timestamp>-growth-kpi-stability/summary.json`
- `/tmp/growth-kpi/<timestamp>-growth-kpi-stability/report.txt`

Use this to classify growth signal as:
- `stable`
- `noisy`
- `insufficient_data`

## 9) Full Validation Gate

Use this before major releases or architecture changes:

```bash
npm run test:system:validation
```

Current gate includes:
- LLM hardening
- publish review draft detection
- refresh workflow smoke
- SEO acceptance stack
- editorial benchmarks
- localization regression

## 10) Failure Triage

If a workflow fails:
1. Re-run in dry-run mode first.
2. Inspect exact error text and classify as:
- model/provider timeout or HTTP error
- CMS read/write permission/config error
- locale/validation policy failure
- publish preflight blocking issue
3. If dry-run passes and save fails, verify write token and dataset.
4. If localization fails for one locale, isolate that locale first (`--targetLocale`) before using `--all`.
5. If publish fails on translation sets, run `review-publish` to identify failing locale(s) before retrying.

## 11) Operating Rhythm

Daily:
- run source/localization/publish flow for active drafts
- use `inspect-content` after each major step

Weekly:
- run `npm run test:seo:acceptance`
- run `npm run test:editorial:benchmarks`
- review Search Console movement with `npm run seo:track -- ...`
- review growth movement with `npm run growth:kpi:summary -- ...`

Before deployment:
- run `npm run build`
- run `npm run test:system:validation`
