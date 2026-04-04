# Canonical Roadmap — leonardocamacho.com / Editorial System

This is the canonical roadmap and working checklist for the whole project.

Use it for:
- system-level direction
- migration sequencing
- implementation priorities
- status tracking

Status markers:
- `[x]` done
- `[~]` active / partially done
- `[ ]` planned
- `[-]` explicitly deferred

---

## 1. System Model

This project is not just a website.

It is three connected systems:

1. Site / app layer
- Astro frontend
- route rendering
- UX, performance, SEO output

2. Editorial engine
- planner -> writer -> reviewers -> metadata -> draft -> localization -> publish
- editorial QA, benchmarks, localization regression

3. CMS layer
- Sanity storage for drafts and published content
- localized content source for the site

Core pipeline:

`Input -> Planner -> Writer -> AntiSynthetic -> StyleShaper -> BrandGuardian -> SEO -> Draft -> Localization -> Publish`

---

## 2. Current Status Snapshot

### Editorial engine
- `[x]` source generation works
- `[x]` review chain works
- `[x]` benchmark suite exists
- `[x]` bounded benchmark remediation exists
- `[~]` first-pass consistency is improving but not fully stable
- `[~]` prose texture is controlled better than before, but still requires human editorial judgment

### Localization
- `[x]` localization workflow works
- `[x]` locale drafts can be saved to Sanity
- `[x]` localization regression gate exists
- `[~]` `pt-pt` still needs stricter native-quality review than `en-gb` and `fr-fr`

### CMS / publishing
- `[x]` source drafts can be created in Sanity
- `[x]` localized drafts can be created in Sanity
- `[x]` publish CLI exists
- `[~]` publishing flows work, but CLI/operator ergonomics still need cleanup

### Site / performance / SEO
- `[x]` canonical / hreflang / sitemap origin bug fixed
- `[x]` launch page and editorial home were structurally separated
- `[x]` major mobile performance regressions were reduced
- `[~]` performance is now in incremental-improvement territory, not critical-fix territory

### Architecture
- `[x]` the system is operational
- `[~]` the repo is still mentally fragmented
- `[~]` folder structure still reflects technical roles more than operating domains

---

## 3. Current Folder Reality

Current core structure:

```text
src/                  site and frontend
workflows/            orchestration logic
reviewers/            editorial reviewers
prompts/              LLM instructions
agents/               small helper agents
tools/                reusable infrastructure
scripts/              CLI entrypoints and tests
sanity/               CMS schema/config
studio-standalone/    separate CMS studio
types/                shared types
knowledge/            editorial and system knowledge
```

Problem:
- technically valid
- operationally fragmented

The system is operated by domain:
- publishing
- localization
- CMS / publish ops
- site / frontend

But the code is still grouped mainly by file type:
- prompts
- reviewers
- tools
- workflows

---

## 4. Target Architecture

This roadmap does **not** recommend a full big-bang domain rewrite.

It recommends a reduced, real target:

```text
src/                  keep as-is
sanity/               keep as-is
studio-standalone/    keep as-is

ops/
├── publishing/
├── localization/
└── shared/

knowledge/            single canonical knowledge layer
scripts/              stable operator entrypoints
```

### Why this target

These are the domains that are already real:
- `publishing`
- `localization`
- `shared`

These are **not** yet strong enough to justify first-class top-level domains:
- `revenue`
- `analytics`
- standalone `seo`
- standalone `newsletter`

They may become first-class later.
They should not drive folder creation today.

Important distinction:
- a function can be strategically important before it deserves its own top-level folder
- `SEO`, `growth`, and `newsletter` are part of the product roadmap now
- they are just not the right **architecture migration anchors** yet

---

## 5. Rules For Reorganization

### Keep unchanged
- `[x]` `src/`
- `[x]` `sanity/`
- `[x]` `studio-standalone/`
- `[x]` framework configs (`astro.config.*`, `tsconfig.json`, `sanity.config.ts`)

### Merge / reduce
- `[x]` merge `guidelines/` into `knowledge/`
- `[x]` reduce duplicate policy/docs layers

### Move gradually
- `[x]` move publishing internals into `ops/publishing/`
- `[x]` move localization internals into `ops/localization/`
- `[x]` move reusable infra into `ops/shared/`

### Keep stable during migration
- `[x]` CLI entrypoints in `scripts/` should stay stable while internals move
- `[x]` backward-compatible imports or wrappers should exist during transition

### Avoid
- `[-]` no empty `ops/revenue/`
- `[-]` no empty `ops/analytics/`
- `[-]` no big-bang import rewrite
- `[-]` no frontend/CMS relocation as part of editorial reorg

---

## 6. Whole-Project Roadmap

## Track A — Editorial Quality And Reliability

### Objective
Make the publishing pipeline reliable enough to operate continuously with benchmarks and human review.

### Checklist
- `[x]` planner -> writer -> review pipeline operational
- `[x]` antiSynthetic integrated into workflow
- `[x]` styleShaper integrated into workflow
- `[x]` brandGuardian integrated into workflow
- `[x]` benchmark suite for editorial cases
- `[x]` benchmark-mode retry / remediation
- `[ ]` improve first-pass pass rate on benchmark cases
- `[ ]` reduce stochastic drift between runs
- `[x]` add stronger tracking of recurring failure classes
- `[ ]` continue tightening prose texture without creating a second style subsystem

### Near-term focus
1. first-pass stability
2. failure-memory / observability
3. editorial texture improvements inside the existing antiSynthetic path

Status note on `2026-03-27`:
- benchmark case output now includes:
  - `initialFailureTaxonomy`
  - `finalFailureTaxonomy`
- suite summary now aggregates recurring categories across cases for both:
  - first-attempt failures
  - final unresolved failures
- benchmark wrapper now writes:
  - `history.json`
  - `history.txt`
  into each artifact directory using the recent artifact history under `/tmp/editorial-benchmarks`
- repeated runs can now show category movement over time, including deltas vs the previous run
- antiSynthetic JSON parsing is now hardened against unescaped quotes inside long prose string fields
- the full editorial benchmark suite returned to green:
  - `8/8` passed
  - `6` first-pass
  - `2` after revision
  - artifact: `/tmp/editorial-benchmarks/20260327-204245-editorial-en-benchmarks`
- recurring failure tracking is now operational at the benchmark level; remaining work is reducing first-pass drift and lowering the top recurring initial categories

---

## Track B — Localization Quality

### Objective
Keep localization operational while raising native-language quality and preserving source mechanism fidelity.

### Checklist
- `[x]` localization workflow implemented
- `[x]` localization guardian implemented
- `[x]` localization regression suite implemented
- `[x]` locale draft save to Sanity working
- `[~]` raise native-quality expectations for `pt-pt`
- `[x]` formalize locale-specific publish thresholds
- `[x]` track per-locale failure patterns more explicitly

### Near-term focus
1. locale quality policy
2. publish threshold by locale
3. glossary / native-voice refinement where needed

Status note on `2026-03-27`:
- localization now emits an explicit per-locale publish policy snapshot in raw results
- publish thresholds are formalized by locale, including:
  - `pt-pt` stricter native-voice gate
  - `pt-pt` zero-warning budget
  - `pt-pt` `structural_import` treated as a hard publish failure
- localization regression reports now emit per-locale failure patterns instead of only flat pass/fail lines
- standalone happy-path regression still passes `4/4`
- expected-failure regression now reports explicit locale/category output, e.g. `en-gb: closing_drift`
- the localization prompt now receives binding `localeNotes`; `pt-pt` guidance was tightened to discourage PT-BR drift and clause-by-clause English calques before guardian review
- latest happy-path regression after the `pt-pt` prompt tightening still passed `4/4` with `pt-pt` clean on first attempt and zero warnings:
  - artifact: `/tmp/localization-regression/20260327-214156-localization-longform-founders-clarity`
- a dedicated expected-failure fixture now forces PT-PT structural-import drift and is correctly rejected with:
  - `pt-pt: native_voice_risk, structural_import`
  - artifact: `/tmp/localization-regression/20260327-215206-localization-longform-pt-pt-structural-import-failure`
- `pt-pt` quality expectations are stricter at the gate level, but glossary and native-voice refinement are still open

---

## Track C — CMS / Publishing Operations

### Objective
Make draft creation, localization, review, and publish flow smooth for real use.

### Checklist
- `[x]` source draft save works
- `[x]` localized draft save works
- `[x]` publish script exists
- `[x]` content ops wrapper exists
- `[~]` simplify publish operator experience further
- `[x]` create a simple read/preview-by-id CLI
- `[x]` define editorial status states more explicitly
- `[x]` add cleaner draft inspection and workflow visibility

### Near-term focus
1. operator visibility
2. publish ergonomics
3. clearer state transitions

Status note on `2026-03-27`:
- operator inspection now exists through:
  - `npx tsx scripts/run-inspect-content.ts --postId <id>`
  - `npx tsx scripts/run-inspect-content.ts --slug <slug> --locale <locale>`
  - `npx tsx scripts/run-inspect-content.ts --translationKey <translationKey>`
- the workflow wrapper now exposes:
  - `bash scripts/content-workflow.sh inspect-content -- ...`
- explicit editorial status states now exist:
  - `draft_unpublished`
  - `draft_pending_publish`
  - `published_live`
  - `missing`
- the inspection output includes:
  - draft and published IDs
  - live URL
  - preview path
  - next operator action
  - translation-set summary by workflow state
- publish now performs pre-publish inspection before acting:
  - emits target workflow summary in `run-publish.ts`
  - warns on mixed-state translation sets
  - fails fast when a target has no real draft instead of attempting a blind publish
- publish review mode now exists for operators who want a compact human-readable check before acting:
  - `npx tsx scripts/run-publish.ts --translationKey <translationKey> --all --review`
  - `bash scripts/content-workflow.sh review-publish -- ...`
- validated on a real published article and a real translation set:
  - `comp-os-why-harmless-approval-rules-create-strategic-delay-202603271336`

---

## Track D — SEO Evolution, Growth, And Newsletter

### Objective
Turn the editorial system into a real audience engine:
- publish strong content
- improve discovery
- convert readers into subscribers
- use newsletter distribution as a compounding loop

### SEO evolution

#### Objective
Move from “correct metadata and indexability” to a deliberate SEO system.

#### Checklist
- `[x]` canonical / hreflang / sitemap origin fixed
- `[x]` baseline metadata generation exists
- `[x]` metadata generator upgraded from generic template to type-aware deterministic rules
- `[x]` metadata quality smoke test exists (`npm run test:seo:metadata`)
- `[x]` SEO head contract smoke exists (`npm run test:seo:head:contract`)
- `[x]` SEO acceptance is part of system validation (`npm run test:system:validation`)
- `[x]` define a clear SEO opportunity model by topic / cluster / intent
- `[x]` add schema.org where it materially helps
- `[x]` define internal-linking strategy from posts to posts / posts to core pages
- `[x]` add content-refresh workflow for existing posts
- `[x]` track Search Console / indexing / query movement systematically
- `[x]` decide when SEO should become a first-class operational domain rather than a subfunction

#### Near-term focus
1. topic/cluster opportunity tracking
2. internal linking
3. refresh loop for existing content

Status note on `2026-03-28`:
- `ops/publishing/finalize/generateMetadata.ts` no longer emits the old `Topic: Type for Audience` template or the generic `Built for ... strategic execution` suffix
- metadata generation now:
  - cleans markdown before extracting excerpt/description
  - uses content-type-aware intent fallback only when draft text is too short
  - keeps deterministic length limits for title/description
- metadata quality smoke now exists:
  - `npm run test:seo:metadata`
- SEO head contract smoke now exists:
  - `npm run test:seo:head:contract`
- system validation now runs SEO acceptance before editorial/localization suites:
  - `npm run test:system:validation`
- planner input now supports a formal SEO opportunity model:
  - `plannerInput.seoOpportunity = { topic, cluster, intent }`
  - CLI flags:
    - `--seo-opportunity-topic`
    - `--seo-opportunity-cluster`
    - `--seo-opportunity-intent`
- CLI parsing for SEO opportunity model is now smoke-tested:
  - `npm run test:create-content:cli:seo-opportunity`
- planner output now includes formal internal-linking planning:
  - `internalLinkPlan[] = { target, kind, purpose, anchorHint }`
- draft persistence now stores `editorialPlan` metadata with:
  - `clusterRole`, `mustLinkTo`, `internalLinkPlan`
- publish preflight now blocks `support`/`bridge` drafts that have no valid internal link target
  - validation is deterministic and covered by:
    - `npm run test:publish:internal-link-preflight`
- review draft detection now has a dedicated smoke:
  - `npm run test:publish:review:draft-detection`
  - validates draft query fallback via `_originalId` and runtime env resolution in the Sanity client
- content refresh workflow now exists for existing posts:
  - `npx tsx scripts/run-refresh-content.ts --postId <id>`
  - `npx tsx scripts/run-refresh-content.ts --slug <slug> --locale <locale>`
  - supports dry-run by default and `--save` to upsert/update the draft
  - deterministic workflow smoke:
    - `npm run test:refresh:workflow`
- status note on `2026-03-30`:
  - schema.org coverage is now extended across key public surfaces where it adds search understanding:
    - base layout now emits `WebSite`, `Organization`, and canonical `WebPage` blocks
    - article pages emit `BlogPosting` + `BreadcrumbList`
    - writing index emits `CollectionPage` + `ItemList` + `BreadcrumbList`
    - about page emits `AboutPage` + `BreadcrumbList`
    - privacy page emits `PrivacyPolicy` + `BreadcrumbList` in both launch and editorial layouts
  - a deterministic schema smoke now exists:
    - `npm run test:seo:schema`
  - SEO acceptance now includes schema validation:
    - `npm run test:seo:acceptance`
- status note on `2026-03-30`:
  - Search Console tracking workflow now exists for systematic query/indexing movement tracking:
    - `npx tsx scripts/run-seo-tracking.ts --csv <performance.csv> [--indexing-csv <indexing.csv>]`
    - operator wrapper: `bash scripts/content-workflow.sh seo-track -- ...`
    - npm alias: `npm run seo:track -- --csv <performance.csv>`
  - tracking writes deterministic artifacts and rolling history under:
    - `/tmp/seo-tracking/<timestamp>-seo-tracking/`
    - `/tmp/seo-tracking/history.json`
  - SEO tracking smoke now exists:
    - `npm run test:seo:tracking`
  - SEO acceptance now includes tracking smoke:
    - `npm run test:seo:acceptance`
- status note on `2026-03-30`:
  - SEO remains a subfunction for now (inside publishing/shared operations), not a first-class domain
  - promotion trigger is now explicit and stable:
    - only promote when SEO expands beyond metadata/enrichment/opportunity/refresh into a distinct planning + operation loop
  - review gate for re-evaluation:
    - revisit after at least 3 monthly Search Console tracking snapshots in `/tmp/seo-tracking/history.json`

### Growth

#### Objective
Make the content system drive measurable audience and subscriber growth.

#### Checklist
- `[x]` newsletter signup flow exists
- `[x]` launch page / editorial conversion surfaces exist
- `[x]` define the core growth loop: content -> subscribe -> newsletter -> return visit -> deeper readership
- `[x]` track post-to-signup conversion more explicitly
- `[x]` define acquisition surfaces by page type
- `[x]` decide what counts as a growth KPI for this system
- `[x]` separate editorial analytics from growth analytics where useful
- `[x]` create a lightweight experimentation policy for conversion changes

#### Near-term focus
1. conversion instrumentation
2. growth KPI definition
3. clearer acquisition loop design

Status note on `2026-03-30`:
- growth-loop/KPI planning spec created:
  - `knowledge/system/growth-loop-kpi-plan.md`
- this closes planning for:
  - core loop definition
  - KPI model definition
  - acquisition surface mapping
- implementation plan status:
  1. minimal event taxonomy (client + server): completed
  2. KPI summarizer artifacts under `/tmp/growth-kpi/`: completed
  3. run 3 weekly cycles and tune noisy metrics: pending
- status note on `2026-03-30`:
  - minimal growth event taxonomy has started implementation:
    - client:
      - `home_subscribe_submit_clicked`
      - `home_subscribe_success`
      - `home_subscribe_failed`
      - `writing_subscribe_submit_clicked`
      - `writing_subscribe_success`
      - `writing_subscribe_failed`
      - `article_engaged_read`
      - `article_secondary_navigation_clicked`
    - server:
      - `newsletter_subscribe_attempt`
      - `newsletter_subscribe_success`
      - `newsletter_subscribe_failed`
      - `newsletter_profile_saved`
      - `newsletter_profile_failed`
  - next execution step is now KPI summarizer implementation and artifact generation under `/tmp/growth-kpi/`
- status note on `2026-03-30`:
  - growth KPI summarizer now exists:
    - `npm run growth:kpi:summary -- --events <posthog-export.ndjson>`
    - operator wrapper:
      - `bash scripts/content-workflow.sh growth-kpi -- --events <posthog-export.ndjson>`
  - artifacts are now written under:
    - `/tmp/growth-kpi/<timestamp>-growth-kpi/`
    - `/tmp/growth-kpi/history.json`
  - deterministic smoke now exists:
    - `npm run test:growth:kpi`
  - next step in growth track:
    - run 3 consecutive weekly KPI cycles and tune noisy metrics
- status note on `2026-03-30`:
  - analytics separation is now explicit and usable:
    - baseline telemetry tags client events as `analytics_domain=editorial`
    - growth surfaces and newsletter API events tag as `analytics_domain=growth`
    - growth KPI summarizer excludes non-growth tagged events from KPI calculations
      and reports domain split in output artifacts
  - lightweight experimentation policy now exists:
    - `knowledge/system/growth-experimentation-policy.md`
- status note on `2026-03-30`:
  - growth stabilization helper now exists for D1.5 execution:
    - `npm run growth:kpi:stability -- --required-cycles 3`
    - operator wrapper:
      - `bash scripts/content-workflow.sh growth-stability -- --required-cycles 3`
  - deterministic stability smoke now exists:
    - `npm run test:growth:stability`
  - remaining work in growth stabilization:
    - complete 3 consecutive weekly real snapshots and tune noisy metrics from report flags

### Newsletter

#### Objective
Make newsletter production and distribution an integrated extension of the editorial engine.

#### Checklist
- `[x]` newsletter prompt exists
- `[x]` Kit-based signup flow exists
- `[~]` newsletter generation capability exists but is not yet a mature operating lane
- `[ ]` define newsletter edition workflow from published content
- `[ ]` improve `run-newsletter.ts` into a dependable operator path
- `[ ]` define issue types: digest, essay-led, launch/update, curation
- `[ ]` decide how newsletter performance feeds back into editorial planning
- `[ ]` define whether newsletter becomes a first-class domain later

#### Near-term focus
1. edition workflow
2. operator ergonomics
3. feedback loop between newsletter and editorial planning

---

## Track E — Site / Frontend / Performance

### Objective
Keep the site fast, stable, and aligned with the editorial system.

### Checklist
- `[x]` route structure working across locales
- `[x]` launch page and editorial home separated
- `[x]` critical SEO origin bug fixed
- `[x]` major mobile performance regressions reduced
- `[x]` analytics load reduced on editorial pages
- `[ ]` continue incremental performance monitoring
- `[ ]` keep launch/performance changes isolated from editorial system changes
- `[ ]` fix remaining non-critical build hints and housekeeping warnings

### Near-term focus
1. protect current perf baseline
2. avoid unnecessary UI/system coupling
3. clean maintenance debt only when it does not disrupt editorial work

---

## Track F — Architecture Reorganization

### Objective
Reorganize the editorial engine around real operating domains without destabilizing the system.

### Phase 0 — Freeze The Model
- `[x]` agree that the correct reduced target is `publishing + localization + shared`
- `[x]` agree that `src/`, `sanity/`, and `studio-standalone/` remain untouched
- `[x]` keep this document as the canonical architecture roadmap

### Phase 1 — Documentation Cleanup
- `[x]` merge `guidelines/` into `knowledge/`
- `[x]` create a clearer structure inside `knowledge/`
- `[x]` remove duplicate or overlapping guidance

Suggested target:

```text
knowledge/
├── editorial/
├── localization/
├── publish/
├── site/
└── system/
```

#### Phase 1 objective
Create one canonical knowledge layer without breaking any runtime dependency, operator workflow, or documentation link.

#### Phase 1 status
- `[x]` completed
- result:
  - `guidelines/` removed
  - `knowledge/` reorganized by domain
  - runtime-coupled path updated safely
  - README links updated
  - build and editorial smoke passed

#### Phase 1 scope
- included:
  - merge `guidelines/` into `knowledge/`
  - reorganize `knowledge/` into clearer domain folders
  - update references in docs and code where needed
  - keep compatibility for runtime-coupled knowledge files
- excluded:
  - no `ops/` migration yet
  - no prompt relocation yet
  - no workflow relocation yet
  - no frontend/CMS moves

#### Phase 1 architectural rule
If a knowledge file is already read by runtime code, migration must preserve behavior immediately.

Known runtime-coupled file:
- `tools/llm/runPrompt.ts` now reads `knowledge/editorial/thinking-standards.md`

That means Phase 1 must do one of these safely:
- keep a compatibility file at the old path, or
- update the code path in the same change and validate the editorial workflow

#### Phase 1 inventory and target mapping

Current files and recommended targets:

- `guidelines/Guidelines.md`
  - status: placeholder template, not real project knowledge
  - action: delete unless there is project-specific content worth keeping

- `guidelines/indexing-and-ai.md`
  - target: `knowledge/site/indexing-and-ai.md`

- `guidelines/sanity-webhooks-and-releases.md`
  - target: `knowledge/system/sanity-webhooks-and-releases.md`

- `knowledge/brand-voice.md`
  - target: `knowledge/editorial/brand-voice.md`

- `knowledge/concept-registry.md`
  - target: `knowledge/editorial/concept-registry.md`

- `knowledge/editorial-standards.md`
  - target: `knowledge/editorial/editorial-standards.md`

- `knowledge/thinking-standards.md`
  - target: `knowledge/editorial/thinking-standards.md`
  - compatibility note: keep old path or update `tools/llm/runPrompt.ts` in the same phase

- `knowledge/localization-glossary.md`
  - target: `knowledge/localization/glossary.md`

- `knowledge/localization-locale-policy.md`
  - target: `knowledge/localization/locale-policy.md`

- `knowledge/publish-gate-policy.md`
  - target: `knowledge/publish/publish-gate-policy.md`

- `knowledge/newsletter-playbook.md`
  - target: `knowledge/editorial/newsletter-playbook.md`
  - rationale: newsletter is a real function, but not yet a top-level knowledge domain

#### Phase 1 execution plan

##### Step 1 — Inventory and classification
- `[x]` confirm every file in `guidelines/` and `knowledge/`
- `[x]` classify each file as:
  - keep
  - move
  - rename
  - delete
- `[x]` identify all in-repo references to those files

Expected output:
- a complete source -> target mapping
- a list of runtime-coupled docs
- a list of links/imports that must be updated

##### Step 2 — Create target knowledge structure
- `[x]` create:
  - `knowledge/editorial/`
  - `knowledge/localization/`
  - `knowledge/publish/`
  - `knowledge/site/`
  - `knowledge/system/`

Expected output:
- target directories exist
- no content moved yet

##### Step 3 — Move and rename files
- `[x]` move editorial knowledge files into `knowledge/editorial/`
- `[x]` move localization knowledge files into `knowledge/localization/`
- `[x]` move publish policy into `knowledge/publish/`
- `[x]` move indexing/search docs into `knowledge/site/`
- `[x]` move webhook/release runbook into `knowledge/system/`
- `[x]` remove placeholder `guidelines/Guidelines.md` if still empty/useless

Expected output:
- all canonical docs live under `knowledge/`
- `guidelines/` is empty or removable

##### Step 4 — Preserve compatibility for runtime-coupled paths
- `[x]` decide whether to:
  - update code references now, or
  - leave compatibility files at old paths temporarily
- `[x]` handle `knowledge/thinking-standards.md` safely

Expected output:
- no runtime file lookup breaks

##### Step 5 — Update references
- `[x]` update `README.md` links currently pointing to `guidelines/`
- `[x]` update any other internal references to old knowledge paths
- `[x]` update roadmap text if paths change materially

Known current references to update:
- `README.md` -> `knowledge/system/sanity-webhooks-and-releases.md`
- `README.md` -> `knowledge/site/indexing-and-ai.md`
- `tools/llm/runPrompt.ts` -> `knowledge/editorial/thinking-standards.md`

##### Step 6 — Remove old layer
- `[x]` remove `guidelines/` once no valid content or references remain
- `[x]` confirm there is only one canonical documentation layer

#### Phase 1 QA plan

##### QA 1 — Structure QA
- `[x]` verify the new `knowledge/` folder structure exists
- `[x]` verify each source file ended in the intended target location
- `[x]` verify `guidelines/` contains no required content after migration

Checks:
```bash
find knowledge -maxdepth 2 -type f | sort
test -d guidelines && find guidelines -maxdepth 2 -type f | sort || true
```

##### QA 2 — Reference QA
- `[x]` verify no stale references remain to `guidelines/` except roadmap history if intentionally kept
- `[x]` verify moved files are linked from the correct new paths

Checks:
```bash
rg -n "guidelines/" README.md ROADMAP.md prompts workflows reviewers scripts src tools
rg -n "knowledge/" README.md ROADMAP.md prompts workflows reviewers scripts src tools
```

Pass condition:
- no broken old links remain
- any remaining old-path reference is deliberate and documented

##### QA 3 — Runtime QA
- `[x]` verify runtime-coupled knowledge still resolves
- `[x]` verify the build still passes
- `[x]` verify one editorial dry run still works if `thinking-standards` path changed

Checks:
```bash
npm run build
./scripts/test-create-content.sh --topic "test" --audience founders --locale en-us --goal "test goal" --notes "test note"
```

Pass condition:
- build passes
- editorial dry run does not fail due to missing knowledge file

##### QA 4 — Operator QA
- `[x]` verify the README still points operators to the right runbooks
- `[x]` verify the canonical roadmap still matches the new documentation structure

Checks:
- inspect `README.md`
- inspect `ROADMAP.md`

Pass condition:
- operator-facing docs are coherent
- no duplicate guidance layer remains

#### Phase 1 completion criteria
- `[x]` all surviving project docs live under `knowledge/`
- `[x]` `guidelines/` is removed or empty and intentionally deprecated
- `[x]` README links are updated
- `[x]` runtime-coupled knowledge remains functional
- `[x]` build passes
- `[x]` one editorial smoke run passes

#### Phase 1 risks
- risk: moving `thinking-standards.md` breaks prompt runtime
  - mitigation: compatibility file or same-change path update + smoke test

- risk: README links silently rot
  - mitigation: explicit reference QA

- risk: low-value doc reshuffle creates churn without clarity
  - mitigation: delete placeholder/template docs instead of relocating them

#### Phase 1 non-goals
- `[-]` no prompt rewrite
- `[-]` no benchmark rewrite
- `[-]` no `ops/` folder migration yet
- `[-]` no runtime behavior change beyond path preservation

### Phase 2 — Introduce `ops/publishing/`
- `[x]` create `ops/publishing/`
- `[x]` move publishing workflows there
- `[x]` move publishing reviewers there
- `[x]` move publishing prompts there
- `[x]` keep compatibility wrappers in old paths during transition

Suggested target:

```text
ops/publishing/
├── plan/
├── workflows/
├── review/
├── prompts/
└── types/
```

#### Phase 2 objective
Move the core publishing engine into a domain-shaped structure without touching localization, shared infra, or frontend/CMS concerns.

#### Phase 2 scope
- included:
  - publishing planning
  - publishing workflows
  - publishing review
  - publishing prompts
  - publishing-only types
  - compatibility wrappers in old import locations
- excluded:
  - no localization move yet
  - no shared infra move yet
  - no `tools/sanity/*` move yet
  - no `tools/llm/runPrompt.ts` move yet
  - no `tools/seo/generateMetadata.ts` move yet
  - no `tools/analytics/trackEditorialEvent.ts` move yet
  - no newsletter or SEO subsystem promotion yet

#### Phase 2 architectural rule
Move the publishing domain first, but do **not** pull shared dependencies into `ops/publishing/` prematurely.

In this phase:
- publishing modules may still depend on:
  - `tools/llm/runPrompt.ts`
  - `tools/sanity/read.ts`
  - `tools/sanity/write.ts`
  - `tools/seo/generateMetadata.ts`
  - `tools/analytics/trackEditorialEvent.ts`

Those dependencies become `ops/shared/` work later in Phase 4.

#### Phase 2 exact target structure

```text
ops/publishing/
├── plan/
│   └── contentPlanner.ts
├── workflows/
│   ├── createContent.ts
│   ├── generateBrief.ts
│   └── index.ts
├── review/
│   ├── antiSyntheticReviewer.ts
│   ├── brandGuardian.ts
│   ├── styleShaper.ts
│   └── types.ts
├── prompts/
│   ├── antiSynthetic.system.md
│   ├── brandGuardian.system.md
│   ├── contentPlanner.system.md
│   ├── styleShaper.system.md
│   └── writer.system.md
└── types/
    ├── content.ts
    ├── contentPlanner.ts
    └── styleShaper.ts
```

#### Phase 2 exact file moves

Move as-is:
- `workflows/createContent.ts` -> `ops/publishing/workflows/createContent.ts`
- `workflows/generateBrief.ts` -> `ops/publishing/workflows/generateBrief.ts`
- `agents/contentPlanner.ts` -> `ops/publishing/plan/contentPlanner.ts`
- `reviewers/antiSyntheticReviewer.ts` -> `ops/publishing/review/antiSyntheticReviewer.ts`
- `reviewers/brandGuardian.ts` -> `ops/publishing/review/brandGuardian.ts`
- `reviewers/styleShaper.ts` -> `ops/publishing/review/styleShaper.ts`
- `reviewers/types.ts` -> `ops/publishing/review/types.ts`
- `types/contentPlanner.ts` -> `ops/publishing/types/contentPlanner.ts`
- `types/styleShaper.ts` -> `ops/publishing/types/styleShaper.ts`
- `prompts/antiSynthetic.system.md` -> `ops/publishing/prompts/antiSynthetic.system.md`
- `prompts/brandGuardian.system.md` -> `ops/publishing/prompts/brandGuardian.system.md`
- `prompts/contentPlanner.system.md` -> `ops/publishing/prompts/contentPlanner.system.md`
- `prompts/styleShaper.system.md` -> `ops/publishing/prompts/styleShaper.system.md`
- `prompts/writer.system.md` -> `ops/publishing/prompts/writer.system.md`

Do **not** move wholesale:
- `workflows/types.ts`

Reason:
- it currently mixes publishing and localization types
- moving it whole would couple Phase 2 to Phase 3

Instead:
- create `ops/publishing/types/content.ts`
- move publishing-only types there:
  - `ContentType`
  - `CreateContentPlannerInput`
  - `CreateContentInput`
  - `ContentBrief`
  - `CreateContentResult`
- keep localization result types out of this file for now

#### Phase 2 files that must stay where they are for now

Keep in place until later phases:
- `workflows/localizeDraft.ts`
- `prompts/localization.system.md`
- `prompts/localizationGuardian.system.md`
- `scripts/run-localize-content.ts`
- `scripts/test-localize-content.sh`
- localization regression fixtures and smoke scripts
- `tools/llm/runPrompt.ts`
- `tools/sanity/read.ts`
- `tools/sanity/write.ts`
- `tools/seo/generateMetadata.ts`
- `tools/analytics/trackEditorialEvent.ts`
- `agents/seoEnricher.ts`
- `prompts/seoEnricher.system.md`
- `scripts/run-newsletter.ts`
- `prompts/newsletter.system.md`

#### Phase 2 compatibility wrapper plan

Old paths must remain valid during transition.

Use thin re-export wrappers for TypeScript modules:
- `workflows/createContent.ts` -> re-export from `ops/publishing/workflows/createContent.ts`
- `workflows/generateBrief.ts` -> re-export from `ops/publishing/workflows/generateBrief.ts`
- `workflows/index.ts` -> re-export publishing workflow symbols from new location, while keeping localization exports unchanged
- `agents/contentPlanner.ts` -> re-export from `ops/publishing/plan/contentPlanner.ts`
- `reviewers/antiSyntheticReviewer.ts` -> re-export from new review path
- `reviewers/brandGuardian.ts` -> re-export from new review path
- `reviewers/styleShaper.ts` -> re-export from new review path
- `reviewers/types.ts` -> re-export from `ops/publishing/review/types.ts`
- `types/contentPlanner.ts` -> re-export from `ops/publishing/types/contentPlanner.ts`
- `types/styleShaper.ts` -> re-export from `ops/publishing/types/styleShaper.ts`

Special handling:
- `workflows/types.ts` becomes a transitional aggregator
  - re-export publishing types from `ops/publishing/types/content.ts`
  - keep localization types in place until Phase 3

For prompt files:
- do not maintain duplicated prompt files long-term
- update prompt paths in moved modules in the same phase
- update prompt target paths in `tools/llm/runPrompt.ts` where necessary

#### Phase 2 import updates required

Modules that will need path updates:
- publishing modules moved into `ops/publishing/`
- `tools/llm/runPrompt.ts`
  - update `THINKING_STANDARDS_TARGETS` to point to moved publishing prompts
- scripts and benchmarks should continue to work through wrappers

Known public/operator imports to preserve:
- `scripts/run-create-content.ts`
- `scripts/test-create-content.sh`
- `scripts/run-editorial-benchmark-suite.ts`
- `types/editorialBenchmark.ts`

#### Phase 2 execution plan

##### Step 1 — Create the publishing target structure
- `[x]` create `ops/publishing/plan/`
- `[x]` create `ops/publishing/workflows/`
- `[x]` create `ops/publishing/review/`
- `[x]` create `ops/publishing/prompts/`
- `[x]` create `ops/publishing/types/`

Expected output:
- publishing domain folders exist before any move

##### Step 2 — Move publishing source files
- `[x]` move workflows into `ops/publishing/workflows/`
- `[x]` move planner into `ops/publishing/plan/`
- `[x]` move reviewers into `ops/publishing/review/`
- `[x]` move publishing prompts into `ops/publishing/prompts/`
- `[x]` move publishing type files into `ops/publishing/types/`
- `[x]` create `ops/publishing/types/content.ts` from the publishing subset of `workflows/types.ts`

Expected output:
- publishing code lives under one domain root

##### Step 3 — Add compatibility wrappers
- `[x]` add wrappers at old workflow paths
- `[x]` add wrappers at old reviewer paths
- `[x]` add wrappers at old agent/type paths
- `[x]` turn `workflows/types.ts` into a transitional aggregator without breaking localization

Expected output:
- old public imports remain stable

##### Step 4 — Update internal paths
- `[x]` update moved publishing modules to use new prompt paths
- `[x]` update moved modules to use new relative imports inside `ops/publishing/`
- `[x]` update `tools/llm/runPrompt.ts` prompt-target list

Expected output:
- runtime uses the new publishing prompt locations

##### Step 5 — Validate publishing runtime
- `[x]` verify create-content CLI still works through wrapper path
- `[x]` verify direct publishing workflow imports still compile
- `[x]` verify benchmarks still compile and run through old public entrypoints

Expected output:
- operators can keep using current commands

##### Step 6 — Stabilize and stop
- `[x]` do not continue into localization or shared moves in the same pass
- `[x]` freeze after publishing migration and QA

#### Phase 2 QA plan

##### QA 1 — Structure QA
- `[x]` verify `ops/publishing/` contains the intended files
- `[x]` verify old workflow/reviewer/agent/type files still exist as wrappers
- `[x]` verify no localization files were accidentally moved

Checks:
```bash
find ops/publishing -maxdepth 3 -type f | sort
find workflows reviewers agents types -maxdepth 1 -type f | sort
```

##### QA 2 — Import Compatibility QA
- `[x]` verify old import paths used by scripts still resolve
- `[x]` verify `workflows/types.ts` still satisfies both publishing and localization callers

Checks:
```bash
rg -n "../workflows/createContent|../reviewers/|../agents/contentPlanner|../types/contentPlanner|../types/styleShaper|../workflows/types" scripts workflows reviewers agents types
```

Pass condition:
- scripts and benchmark code do not need immediate import rewrites

##### QA 3 — Prompt Path QA
- `[x]` verify publishing modules point to `ops/publishing/prompts/*`
- `[x]` verify `tools/llm/runPrompt.ts` thinking-standards injection target list matches new publishing prompt paths

Checks:
```bash
rg -n "ops/publishing/prompts|prompts/(writer|antiSynthetic|styleShaper|brandGuardian|contentPlanner)\\.system\\.md" ops tools workflows reviewers agents
```

Pass condition:
- no publishing runtime still depends on old prompt file paths unintentionally

##### QA 4 — Build QA
- `[x]` verify the full build passes

Check:
```bash
npm run build
```

##### QA 5 — Publishing Runtime QA
- `[x]` verify one `createContent` smoke run
- `[x]` verify one benchmark slice run

Checks:
```bash
./scripts/test-create-content.sh --topic "phase 2 smoke" --audience founders --locale en-us --goal "verify publishing relocation" --notes "publishing domain move smoke" --type insight
./scripts/test-editorial-benchmarks.sh --batch-size 1 --case local-rationality-perceptual
```

Pass condition:
- create-content works
- benchmark runner still works through stable public paths

##### QA 6 — Localization Regression Protection
- `[x]` verify localization entrypoints were not broken by `workflows/types.ts` transition

Check:
```bash
./scripts/test-localize-content.sh --postId drafts.some-id --targetLocale pt-br
```

Alternative if no stable draft is available:
- validate TypeScript/import integrity via `npm run build`
- and explicitly confirm `scripts/run-localize-content.ts` still imports from `workflows/types.ts` cleanly
- and optionally import-check `workflows/localizeDraft.ts` plus `workflows/types.ts` together

Pass condition:
- Phase 2 does not introduce accidental localization breakage

#### Phase 2 completion criteria
- `[x]` `ops/publishing/` exists with real publishing code inside
- `[x]` old public import paths still work through wrappers
- `[x]` publishing prompts live under `ops/publishing/prompts/`
- `[x]` `workflows/types.ts` no longer owns publishing types directly
- `[x]` build passes
- `[x]` publishing smoke run passes
- `[x]` benchmark slice passes
- `[x]` localization remains unbroken

#### Phase 2 risks
- risk: `workflows/types.ts` split accidentally breaks localization imports
  - mitigation: keep it as a transitional aggregator in this phase

- risk: prompt path moves break runtime resolution or thinking-standards injection
  - mitigation: update prompt paths and `runPrompt.ts` in the same change, then run publishing smoke QA

- risk: wrappers drift from source after migration
  - mitigation: wrappers should be re-export only, with no duplicated logic

- risk: moving too much shared infra into publishing creates fake boundaries
  - mitigation: keep shared infra in place until Phase 4

#### Phase 2 non-goals
- `[-]` no localization relocation
- `[-]` no shared infra relocation
- `[-]` no `tools/sanity` move
- `[-]` no `runPrompt` move
- `[-]` no newsletter subsystem move
- `[-]` no SEO subsystem move

### Phase 3 — Introduce `ops/localization/`
- `[x]` create `ops/localization/`
- `[x]` move localization workflow there
- `[x]` move localization prompts there
- `[x]` move localization fixtures / regression logic there
- `[x]` keep CLI entrypoints stable in `scripts/`

Suggested target:

```text
ops/localization/
├── workflows/
├── prompts/
├── regression/
├── fixtures/
└── types/
```

#### Phase 3 objective
Move the localization subsystem into a domain-shaped structure without mixing it into `ops/shared/`, changing the publishing runtime, or breaking the stable localization CLI surface in `scripts/`.

#### Phase 3 scope
- included:
  - localization workflow
  - localization prompts
  - localization smoke/regression runners
  - localization fixtures
  - localization-only result types
  - compatibility wrappers in old import locations
- excluded:
  - no `tools/llm/runPrompt.ts` move yet
  - no `tools/sanity/*` move yet
  - no `src/lib/locales` move
  - no publishing move changes beyond compatibility validation
  - no `ops/shared/` work yet
  - no frontend/CMS schema changes

#### Phase 3 architectural rule
Move the localization domain first, but do **not** extract shared dependencies out of it yet.

In this phase:
- localization modules may still depend on:
  - `tools/llm/runPrompt.ts`
  - `tools/sanity/read.ts`
  - `tools/sanity/write.ts`
  - `tools/sanity/portableText.ts`
  - `src/lib/locales`
  - `workflows/types.ts` as a transitional bridge

Those dependencies become `ops/shared/` work later in Phase 4.

#### Phase 3 exact target structure

```text
ops/localization/
├── workflows/
│   └── localizeDraft.ts
├── prompts/
│   ├── localization.system.md
│   └── localizationGuardian.system.md
├── regression/
│   ├── run-localization-longform-smoke.ts
│   └── check-localization-longform-regression.mjs
├── fixtures/
│   ├── localization-longform-advisory-close-failure.ts
│   ├── localization-longform-founders-clarity.ts
│   ├── localization-longform-late-adaptation.ts
│   └── localization-longform-workflow-leakage-failure.ts
└── types/
    └── content.ts
```

#### Phase 3 exact file moves

Move as-is:
- `workflows/localizeDraft.ts` -> `ops/localization/workflows/localizeDraft.ts`
- `prompts/localization.system.md` -> `ops/localization/prompts/localization.system.md`
- `prompts/localizationGuardian.system.md` -> `ops/localization/prompts/localizationGuardian.system.md`
- `scripts/run-localization-longform-smoke.ts` -> `ops/localization/regression/run-localization-longform-smoke.ts`
- `scripts/check-localization-longform-regression.mjs` -> `ops/localization/regression/check-localization-longform-regression.mjs`
- `scripts/fixtures/localization-longform-advisory-close-failure.ts` -> `ops/localization/fixtures/localization-longform-advisory-close-failure.ts`
- `scripts/fixtures/localization-longform-founders-clarity.ts` -> `ops/localization/fixtures/localization-longform-founders-clarity.ts`
- `scripts/fixtures/localization-longform-late-adaptation.ts` -> `ops/localization/fixtures/localization-longform-late-adaptation.ts`
- `scripts/fixtures/localization-longform-workflow-leakage-failure.ts` -> `ops/localization/fixtures/localization-longform-workflow-leakage-failure.ts`

Do **not** move wholesale:
- `workflows/types.ts`
- `scripts/run-localize-content.ts`
- `scripts/test-localize-content.sh`
- `scripts/test-localization-longform-smoke.sh`
- `scripts/test-localization-longform-regression.sh`
- `scripts/test-localization-longform-regression-failure.sh`
- `scripts/test-localization-longform-regression-expected-failure.sh`
- `scripts/test-localization-longform-regression-workflow-leakage-failure.sh`
- `scripts/test-localization-patterns.sh`

Reason:
- those files are the current stable operator surface
- moving them physically now would add churn without reducing architectural ambiguity

Instead:
- create `ops/localization/types/content.ts`
- move localization-only types there:
  - `TerminologyDecision`
  - `LocalizeContentLocaleResult`
  - `LocalizeContentResult`
- keep `workflows/types.ts` as the transitional aggregator for both publishing and localization until the old top-level contract can be retired later

#### Phase 3 files that must stay where they are for now

Keep in place until later phases:
- `scripts/run-localize-content.ts`
- all `scripts/test-localization-*.sh` entrypoints
- `tools/llm/runPrompt.ts`
- `tools/sanity/read.ts`
- `tools/sanity/write.ts`
- `tools/sanity/portableText.ts`
- `src/lib/locales/*`
- `workflows/createContent.ts`
- `workflows/generateBrief.ts`
- `ops/publishing/*`

#### Phase 3 compatibility wrapper plan

Old paths must remain valid during transition.

Use thin wrappers / re-export shims:
- `workflows/localizeDraft.ts` -> re-export from `ops/localization/workflows/localizeDraft.ts`
- `scripts/run-localization-longform-smoke.ts` -> wrapper that runs/imports `ops/localization/regression/run-localization-longform-smoke.ts`
- `scripts/check-localization-longform-regression.mjs` -> wrapper that forwards to `ops/localization/regression/check-localization-longform-regression.mjs`
- `scripts/fixtures/localization-longform-*.ts` -> re-export from `ops/localization/fixtures/*`

Special handling:
- `workflows/types.ts` remains the compatibility bridge
  - re-export publishing types from `ops/publishing/types/content.ts`
  - re-export localization types from `ops/localization/types/content.ts`

For prompt files:
- do not keep duplicate prompt files long-term
- update localization workflow prompt paths in the same phase

#### Phase 3 import updates required

Modules that will need path updates:
- moved localization workflow
- moved regression runner
- moved regression checker
- moved fixture files
- `workflows/types.ts`

Known public/operator imports to preserve:
- `scripts/run-localize-content.ts`
- `scripts/test-localize-content.sh`
- `scripts/run-localization-longform-smoke.ts` through wrapper path
- `scripts/test-localization-longform-smoke.sh`
- `scripts/test-localization-longform-regression.sh`
- `scripts/test-localization-patterns.sh`

#### Phase 3 execution plan

##### Step 1 — Create the localization target structure
- `[x]` create `ops/localization/workflows/`
- `[x]` create `ops/localization/prompts/`
- `[x]` create `ops/localization/regression/`
- `[x]` create `ops/localization/fixtures/`
- `[x]` create `ops/localization/types/`

Expected output:
- localization domain folders exist before any move

##### Step 2 — Move localization source files
- `[x]` move `localizeDraft.ts` into `ops/localization/workflows/`
- `[x]` move localization prompts into `ops/localization/prompts/`
- `[x]` move localization regression runner/checker into `ops/localization/regression/`
- `[x]` move localization fixtures into `ops/localization/fixtures/`
- `[x]` create `ops/localization/types/content.ts` from the localization subset of `workflows/types.ts`

Expected output:
- localization internals live under one domain root

##### Step 3 — Add compatibility wrappers
- `[x]` add wrapper at `workflows/localizeDraft.ts`
- `[x]` add wrappers at moved regression script paths
- `[x]` add wrapper/re-export files at old fixture paths
- `[x]` turn `workflows/types.ts` into a dual publishing + localization aggregator without owning either domain directly

Expected output:
- old public imports and test paths remain stable

##### Step 4 — Update internal paths
- `[x]` update moved localization workflow to use `ops/localization/prompts/*`
- `[x]` update moved regression runner imports to the new workflow and fixture paths
- `[x]` update moved regression checker paths if needed

Expected output:
- runtime uses the new localization prompt and fixture locations

##### Step 5 — Validate localization runtime
- `[x]` verify `run-localize-content.ts` still works through the stable script path
- `[x]` verify longform smoke still works through the stable script path
- `[x]` verify longform regression still works through the stable script path

Expected output:
- operators can keep using current localization commands unchanged

##### Step 6 — Protect publishing and stop
- `[x]` verify publishing imports were not broken by `workflows/types.ts` changes
- `[x]` do not continue into `ops/shared/` in the same pass
- `[x]` freeze after localization migration and QA

#### Phase 3 QA plan

##### QA 1 — Structure QA
- `[x]` verify `ops/localization/` contains the intended files
- `[x]` verify old workflow/script/fixture paths still exist as wrappers
- `[x]` verify no publishing files were accidentally moved

Checks:
```bash
find ops/localization -maxdepth 3 -type f | sort
find workflows scripts/fixtures -maxdepth 2 -type f | sort | rg 'localiz|longform'
```

##### QA 2 — Import Compatibility QA
- `[x]` verify old import paths used by scripts still resolve
- `[x]` verify `workflows/types.ts` still satisfies both localization and publishing callers

Checks:
```bash
rg -n "../workflows/localizeDraft|../workflows/types|scripts/run-localization-longform-smoke|scripts/fixtures/localization" scripts workflows ops types -S
```

Pass condition:
- operator scripts do not need immediate rewrites

##### QA 3 — Prompt Path QA
- `[x]` verify localization workflow points to `ops/localization/prompts/*`
- `[x]` verify no localization runtime still points at old prompt paths unintentionally

Checks:
```bash
rg -n "ops/localization/prompts|prompts/(localization|localizationGuardian)\\.system\\.md" workflows ops scripts -S
```

Pass condition:
- localization runtime uses the new prompt locations

##### QA 4 — Build QA
- `[x]` verify the full build passes

Check:
```bash
npm run build
```

##### QA 5 — Localization Runtime QA
- `[x]` verify one live localize-content run
- `[x]` verify one longform smoke run
- `[x]` verify one longform regression run

Checks:
```bash
./scripts/test-localize-content.sh -- --postId drafts.some-id --targetLocale pt-br
./scripts/test-localization-longform-smoke.sh
./scripts/test-localization-longform-regression.sh
```

Pass condition:
- direct localization and regression harness still work

##### QA 6 — Publishing Protection QA
- `[x]` verify publishing entrypoints were not broken by the `workflows/types.ts` transition

Checks:
```bash
./scripts/test-create-content.sh -- --topic "phase 3 bridge smoke" --type insight --audience founders --locale en-us --goal "verify localization relocation does not break publishing types" --notes "phase 3 bridge check" --sourceMode notes
./scripts/test-editorial-benchmarks.sh --batch-size 1 --case local-rationality-perceptual
```

Alternative:
- if live LLM runs are not available, require `npm run build` plus import-checks for `workflows/createContent.ts`, `workflows/localizeDraft.ts`, and `workflows/types.ts`

Pass condition:
- Phase 3 does not introduce accidental publishing breakage

#### Phase 3 completion criteria
- `[x]` `ops/localization/` exists with real localization code inside
- `[x]` old public localization import paths still work through wrappers
- `[x]` localization prompts live under `ops/localization/prompts/`
- `[x]` localization fixtures/regression helpers live under `ops/localization/`
- `[x]` `workflows/types.ts` no longer owns localization types directly
- `[x]` build passes
- `[x]` direct localization smoke passes
- `[x]` longform regression passes
- `[x]` publishing remains unbroken

#### Phase 3 risks
- risk: `workflows/types.ts` changes break publishing or localization scripts
  - mitigation: keep it as a transitional aggregator and explicitly run both publishing and localization smoke checks

- risk: moving regression fixtures breaks shell-based regression wrappers
  - mitigation: keep old script paths as wrappers and validate the wrapper layer with the existing shell scripts

- risk: prompt path moves break localization runtime
  - mitigation: update prompt paths and runtime references in the same change, then run direct localization QA

- risk: trying to create a separate localization “review” subsystem now would invent boundaries that do not yet exist
  - mitigation: keep the localization guardian inside the workflow for this phase

#### Phase 3 non-goals
- `[-]` no `ops/shared/` move
- `[-]` no `tools/sanity` move
- `[-]` no `runPrompt` move
- `[-]` no publishing refactor beyond compatibility checks
- `[-]` no CMS schema changes
- `[-]` no frontend/site move

### Phase 4 — Introduce `ops/shared/`
- `[x]` create `ops/shared/`
- `[x]` move only true cross-domain infrastructure there
- `[x]` keep old import paths as wrappers during migration

#### Phase 4 objective
Move the infrastructure that is genuinely shared by multiple operational domains into `ops/shared/` without turning `shared` into a junk drawer.

This phase exists to separate:
- domain logic that belongs in `publishing` / `localization`
from:
- runtime plumbing used by multiple domains

#### Phase 4 boundary rule
Something belongs in `ops/shared/` only if it is one of these:
- runtime wrapper around an external system
- neutral serialization / parsing helper
- neutral read/write CMS helper
- neutral analytics helper

Something does **not** belong in `ops/shared/` if it is:
- publishing-specific judgment or review logic
- localization-specific logic
- benchmark or QA domain logic
- newsletter / SEO strategy logic
- a future domain that is still immature

#### Target structure

```text
ops/shared/
├── llm/
├── cms/
├── analytics/
└── types/
```

#### What moves in Phase 4
- `tools/llm/runPrompt.ts`
  - target: `ops/shared/llm/runPrompt.ts`

- `tools/sanity/read.ts`
  - target: `ops/shared/cms/read.ts`

- `tools/sanity/write.ts`
  - target: `ops/shared/cms/write.ts`

- `tools/sanity/portableText.ts`
  - target: `ops/shared/cms/portableText.ts`

- `tools/analytics/trackEditorialEvent.ts`
  - target: `ops/shared/analytics/trackEditorialEvent.ts`

#### What does **not** move in Phase 4
- `tools/seo/generateMetadata.ts`
  - stays out for now
  - reason: currently this is publishing-finalization logic, not shared runtime infrastructure

- `tools/editorial/benchmarkEvaluator.ts`
  - stays out
  - reason: this is editorial QA domain logic, not shared infra

- `tools/kit/broadcast.ts`
  - stays out
  - reason: this belongs to the newsletter/future-domain track, not shared infra yet

- any `src/lib/sanity/*`
  - stays out
  - reason: frontend/site consumption should not be mixed with operational infra in this phase

#### Compatibility wrapper strategy
The old paths remain as thin re-export wrappers first:
- `tools/llm/runPrompt.ts`
- `tools/sanity/read.ts`
- `tools/sanity/write.ts`
- `tools/sanity/portableText.ts`
- `tools/analytics/trackEditorialEvent.ts`

Only after imports are migrated and stable should the old top-level files be removed in a later cleanup phase.

#### Import migration rules
Update imports in:
- `ops/publishing/*`
- `ops/localization/*`
- `scripts/*`

Do **not** mass-rewrite unrelated frontend imports in this phase.

Do **not** touch:
- `src/lib/sanity/*`
- `sanity/*`
- `studio-standalone/*`

#### Exact execution order
1. Create:
   - `ops/shared/llm/`
   - `ops/shared/cms/`
   - `ops/shared/analytics/`

2. Move:
   - `runPrompt.ts`
   - `read.ts`
   - `write.ts`
   - `portableText.ts`
   - `trackEditorialEvent.ts`

3. Replace old files with re-export wrappers

4. Update direct imports in:
   - `ops/publishing/*`
   - `ops/localization/*`
   - `scripts/*`

5. Leave old wrapper paths in place for external/operator stability

#### Phase 4 QA
Required checks:
- `npm run build`
- `./scripts/test-create-content.sh -- --topic "phase 4 shared smoke" --type insight --audience founders --locale en-us --goal "Verify shared infra migration does not break editorial generation" --notes "Shared infra should move without changing publishing behavior." --sourceMode notes`
- `./scripts/test-localization-longform-regression.sh`
- one direct localization script path check:
  - `npx tsx scripts/run-localize-content.ts ...`
- one benchmark slice:
  - `./scripts/test-local-rationality-perceptual.sh`

Success criteria:
- build passes
- wrapper paths still work
- publishing still works
- localization still works
- benchmark slice still works

Validation completed on `2026-03-26`:
- `npm run build` passed
- `./scripts/test-create-content.sh -- --topic "Why urgency corrupts prioritization" ...` passed
- `./scripts/test-local-rationality-perceptual.sh` passed
- `./scripts/test-localization-longform-smoke.sh` passed
- `./scripts/test-localization-longform-regression.sh` passed
- legacy wrapper import check passed
- regression artifacts:
  - `/tmp/localization-regression/20260326-225612-localization-longform-founders-clarity/raw.json`
  - `/tmp/localization-regression/20260326-225612-localization-longform-founders-clarity/report.txt`

#### Phase 4 risks
- risk: `shared` becomes a catch-all folder
  - mitigation: exclude domain logic explicitly and keep the boundary rule strict

- risk: wrapper paths are removed too early
  - mitigation: keep the wrapper layer for this phase and validate shell/script entrypoints

- risk: `src/lib/sanity` and operational CMS helpers get mixed together
  - mitigation: keep frontend/site Sanity code untouched in this phase

- risk: moving `generateMetadata` into `shared` creates a false abstraction
  - mitigation: leave it where it is for now

#### Phase 4 non-goals
- `[-]` no SEO domain promotion
- `[-]` no newsletter domain promotion
- `[-]` no benchmark evaluator move
- `[-]` no frontend/site refactor
- `[-]` no Sanity schema move
- `[-]` no `studio-standalone` move

### Phase 5 — Rationalize Old Top-Level Folders
- `[x]` reduce `agents/`
- `[x]` reduce `reviewers/`
- `[x]` reduce `prompts/`
- `[x]` reduce `tools/`
- `[x]` preserve compatibility until all internal imports are migrated

#### Phase 5 objective
Finish the reorganization by shrinking the old top-level compatibility surface without forcing immature functions into artificial domains.

This phase is not "delete old folders."
It is:
- migrate remaining internal imports away from wrappers
- classify the remaining top-level files honestly
- remove only what is truly redundant

Execution completed on `2026-03-27`:
- removed the legacy top-level folders:
  - `agents/`
  - `reviewers/`
  - `workflows/`
  - `prompts/`
  - `tools/`
  - `types/`
- moved publishing residuals into:
  - `ops/publishing/finalize/`
  - `ops/publishing/qa/`
- created:
  - `ops/seo/`
  - `ops/newsletter/`
- migrated scripts and internal imports to canonical `ops/*` and `ops/shared/*` paths
- validated build, publishing, benchmark, and localization after cleanup

#### Phase 5 decision rule
Every remaining file in `agents/`, `reviewers/`, `workflows/`, `prompts/`, and `tools/` must be assigned to one of these buckets:
- `wrapper`
  - thin compatibility layer that re-exports a canonical file already living under `ops/*`
- `residual real module`
  - still contains real logic and does not yet have a final domain home
- `keep transitional aggregator`
  - small bridge file that still stabilizes types or operator-facing imports
- `candidate for deletion`
  - no remaining internal imports and no clear operator value

Do not move or delete a file in Phase 5 unless its bucket is explicit.

#### Phase 5 buckets

##### Bucket A — wrappers to deprecate after import cleanup
These are legacy compatibility files that already point to canonical `ops/*` or `ops/shared/*` locations:
- `workflows/createContent.ts`
- `workflows/generateBrief.ts`
- `workflows/localizeDraft.ts`
- `reviewers/antiSyntheticReviewer.ts`
- `reviewers/brandGuardian.ts`
- `reviewers/styleShaper.ts`
- `reviewers/types.ts`
- `agents/contentPlanner.ts`
- `tools/llm/runPrompt.ts`
- `tools/sanity/read.ts`
- `tools/sanity/write.ts`
- `tools/sanity/portableText.ts`
- `tools/analytics/trackEditorialEvent.ts`

Goal in Phase 5:
- migrate internal imports off these files
- keep them as wrappers until the import graph is clean
- remove them only after a final protection pass

##### Bucket B — transitional aggregators
Resolved in this pass:
- `workflows/types.ts` removed after direct imports were migrated to:
  - `ops/publishing/types/content.ts`
  - `ops/localization/types/content.ts`
  - `ops/publishing/review/types.ts`
- `workflows/index.ts` removed

##### Bucket C — residual real modules
Resolved in this pass by moving them into explicit domain homes:
- `agents/seoEnricher.ts` -> `ops/seo/enrich/seoEnricher.ts`
- `prompts/seoEnricher.system.md` -> `ops/seo/prompts/seoEnricher.system.md`
- `prompts/newsletter.system.md` -> `ops/newsletter/prompts/newsletter.system.md`
- `tools/seo/generateMetadata.ts` -> `ops/publishing/finalize/generateMetadata.ts`
- `tools/editorial/benchmarkEvaluator.ts` -> `ops/publishing/qa/benchmarkEvaluator.ts`
- `tools/kit/broadcast.ts` -> `ops/newsletter/delivery/createBroadcast.ts`

##### Bucket D — folders to collapse once wrappers are no longer needed
- `reviewers/`
- parts of `agents/`
- parts of `workflows/`
- parts of `tools/`

Goal in Phase 5:
- reduce folder surface materially
- do not leave empty compatibility directories around without reason

#### Exact Phase 5 execution order
1. Audit remaining internal imports of wrapper files.
   - especially:
     - `scripts/*`
     - `types/*`
     - `ops/localization/fixtures/*`
     - `ops/localization/regression/*`
     - `tools/editorial/benchmarkEvaluator.ts`

2. Migrate internal imports from wrapper paths to canonical paths.
   - examples:
     - `scripts/run-create-content.ts` -> `ops/publishing/workflows/createContent`
     - `scripts/run-editorial-benchmark-suite.ts` -> `ops/publishing/workflows/createContent`
     - `scripts/run-editorial-benchmark-suite.ts` type import -> `ops/publishing/review/types`
     - `scripts/run-localize-content.ts` -> `ops/localization/workflows/localizeDraft`
     - `types/editorialBenchmark.ts` -> canonical type source instead of `workflows/types` where practical

3. Re-run import audit.
   - confirm which wrappers still have internal dependents
   - separate:
     - wrappers still needed
     - wrappers now removable

4. Remove only zero-dependency wrappers in the first cleanup pass.
   - likely candidates:
     - `reviewers/*`
     - `agents/contentPlanner.ts`
   - probable holdovers:
     - `workflows/types.ts`
     - `workflows/index.ts`

5. Keep residual real modules in place.
   - do not force:
     - SEO
     - newsletter
     - benchmark evaluation
     into a fake domain move just to reduce folder count

6. Update roadmap and mark which top-level folders remain intentionally.

#### Phase 5 final target map — recommended end-state
This is the recommended clean end-state after wrapper cleanup and after the still-real residual modules receive proper domain homes.

Target top-level shape:
- `ops/publishing/`
- `ops/localization/`
- `ops/shared/`
- `ops/seo/`
- `ops/newsletter/`
- `knowledge/`
- `scripts/`
- `src/`
- `sanity/`
- `studio-standalone/`

In that end-state:
- `agents/` disappears
- `reviewers/` disappears
- `workflows/` disappears
- top-level `prompts/` disappears
- top-level `tools/` disappears
- top-level `types/` disappears

##### End-state deletion set
Delete after import cleanup because they are only wrappers:
- `agents/contentPlanner.ts`
- `reviewers/antiSyntheticReviewer.ts`
- `reviewers/brandGuardian.ts`
- `reviewers/styleShaper.ts`
- `reviewers/types.ts`
- `workflows/createContent.ts`
- `workflows/generateBrief.ts`
- `workflows/localizeDraft.ts`
- `tools/llm/runPrompt.ts`
- `tools/sanity/read.ts`
- `tools/sanity/write.ts`
- `tools/sanity/portableText.ts`
- `tools/analytics/trackEditorialEvent.ts`

Delete outright:
- `workflows/index.ts`
  - reason: top-level workflow barrel does not add clear value in the domain-shaped architecture

Keep temporarily, then delete:
- none remain after this pass

##### End-state domain homes
Move to publishing:
- `tools/seo/generateMetadata.ts`
  - target: `ops/publishing/finalize/generateMetadata.ts`
- `tools/editorial/benchmarkEvaluator.ts`
  - target: `ops/publishing/qa/benchmarkEvaluator.ts`

Move to SEO:
- `agents/seoEnricher.ts`
  - target: `ops/seo/enrich/seoEnricher.ts`
- `prompts/seoEnricher.system.md`
  - target: `ops/seo/prompts/seoEnricher.system.md`

Move to newsletter:
- `tools/kit/broadcast.ts`
  - target: `ops/newsletter/delivery/createBroadcast.ts`
- `prompts/newsletter.system.md`
  - target: `ops/newsletter/prompts/newsletter.system.md`

This end-state is cleaner than leaving these files in generic top-level buckets, but these moves should happen only when the target domains are created deliberately.

#### Phase 5 QA
Required checks:
- `npm run build`
- `./scripts/test-create-content.sh -- --topic "phase 5 cleanup smoke" --type insight --audience founders --locale en-us --goal "Verify wrapper cleanup does not break publishing entrypoints" --notes "Compatibility cleanup should not change publishing behavior." --sourceMode notes`
- `./scripts/test-localization-longform-smoke.sh`
- `./scripts/test-localization-longform-regression.sh`
- `./scripts/test-local-rationality-perceptual.sh`
- one direct check that CLI entrypoints still work:
  - `npx tsx scripts/run-create-content.ts ...`
  - `npx tsx scripts/run-localize-content.ts ...`

Success criteria:
- build passes
- scripts continue to work from their public paths
- no publishing/localization regression
- wrapper folders shrink measurably
- no residual file is moved into the wrong domain just to make the tree look cleaner

Validation completed on `2026-03-27`:
- `npm run build` passed
- `./scripts/test-create-content.sh -- --topic "phase 5 cleanup smoke" ...` passed
- direct `npx tsx scripts/run-create-content.ts ...` passed with `status: approved`
- direct `npx tsx scripts/run-localize-content.ts ... --targetLocale pt-br` passed
- `./scripts/test-localization-longform-smoke.sh` passed
- `./scripts/test-localization-longform-regression.sh` passed
- `./scripts/test-local-rationality-perceptual.sh` passed
- regression artifacts:
  - `/tmp/localization-regression/20260327-065651-localization-longform-founders-clarity/raw.json`
  - `/tmp/localization-regression/20260327-065651-localization-longform-founders-clarity/report.txt`

#### Phase 5 risks
- risk: deleting wrappers that external or operator flows still use
  - mitigation: migrate internal imports first, then delete only zero-dependency wrappers

- risk: forcing SEO/newsletter/benchmark code into bad homes
  - mitigation: treat them as residual real modules until their own domains are mature

- risk: over-cleaning `workflows/types.ts`
  - mitigation: keep it as a transitional aggregator until type imports are explicitly stabilized

- risk: ending with a cosmetically cleaner tree but a less understandable architecture
  - mitigation: prefer honest provisional modules over fake domain purity

#### Phase 5 non-goals
- `[-]` no additional empty domains beyond the ones justified by real code
- `[-]` no frontend/site restructure
- `[-]` no Sanity schema or Studio restructure

### Success criteria
- the folder structure matches how the system is operated
- moving through the publishing pipeline becomes easier to reason about
- no big break in scripts, tests, or Sanity flows

---

## Appendix — Studio Separation Execution Checklist

Goal:
- remove embedded `/studio` from the Astro app
- use [studio-standalone](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone) as the only Studio deployment
- keep the public site and editorial workflows unchanged

Recommended deployment default:
- first deploy standalone Studio using `sanity deploy`
- only add a custom domain later if needed

Why this order:
- lowest risk
- fastest proof that the architecture works
- avoids mixing domain/DNS work into the first cutover

### Stage A — Make `studio-standalone` consume the root schema

#### Exact file edits
- `[x]` edit [studio-standalone/sanity.config.ts](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/sanity.config.ts)
  - import `schemaTypes` from [sanity/schemaTypes.ts](/Users/leonardocamacho/leonardocamacho.com2/sanity/schemaTypes.ts)
  - import `deskStructure` from [sanity/lib/deskStructure.ts](/Users/leonardocamacho/leonardocamacho.com2/sanity/lib/deskStructure.ts)
  - switch from hardcoded `projectId` / `dataset` to env-driven config matching [sanity.config.ts](/Users/leonardocamacho/leonardocamacho.com2/sanity.config.ts)
  - configure `structureTool({ structure: deskStructure })`
  - keep `visionTool({ defaultApiVersion })`

- `[x]` edit [studio-standalone/sanity.cli.ts](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/sanity.cli.ts)
  - read `projectId` and `dataset` from env
  - remove hardcoded values

- `[x]` edit [studio-standalone/tsconfig.json](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/tsconfig.json)
  - include `../sanity/**/*.ts`
  - include `../sanity/lib/**/*.ts`
  - keep `studio-standalone/**/*.ts`

- `[x]` edit [studio-standalone/schemaTypes/index.ts](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/schemaTypes/index.ts)
  - either:
    - re-export from `../../sanity/schemaTypes`
  - or:
    - remove its usage entirely if `studio-standalone/sanity.config.ts` imports the root schema directly

- `[x]` replace the boilerplate text in [studio-standalone/README.md](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/README.md)
  - document how to run/build/deploy the standalone Studio

- `[x]` edit [tsconfig.json](/Users/leonardocamacho/leonardocamacho.com2/tsconfig.json)
  - exclude `studio-standalone/dist` so the public app typecheck does not scan generated standalone Studio assets

#### Commands
```bash
cd studio-standalone
npm install
npm run dev
```

Validation target:
- Studio opens
- document list loads
- desk structure works
- Vision tool works

Optional build check:
```bash
cd studio-standalone
npm run build
```

Validation completed:
- `studio-standalone` build passes
- root `npm run build` still passes
- root `astro check` remains `0 errors / 0 warnings / 0 hints`

### Stage B — Deploy standalone Studio first

#### Commands
If using Sanity-hosted Studio:
```bash
cd studio-standalone
npm run deploy
```

If login is required first:
```bash
cd studio-standalone
npx sanity login
npm run deploy
```

Expected result:
- standalone Studio gets a stable hosted URL
- operators can use that URL before the embedded Studio is removed

Deployment completed:
- hosted Studio URL: `https://leonardo-camacho-studio.sanity.studio/`
- deployment appId saved in [studio-standalone/sanity.cli.ts](/Users/leonardocamacho/leonardocamacho.com2/studio-standalone/sanity.cli.ts)
- standalone Studio build revalidated after saving the appId

### Stage C — Operator cutover before embed removal

#### Exact file edits
- `[x]` edit [README.md](/Users/leonardocamacho/leonardocamacho.com2/README.md)
  - replace “Embedded Sanity Studio at `/studio`”
  - remove `/studio/*` from the main route list
  - replace `/studio` troubleshooting with standalone Studio instructions

- `[x]` edit [CLAUDE.md](/Users/leonardocamacho/leonardocamacho.com2/CLAUDE.md)
  - replace references that describe Studio as embedded at `/studio`
  - point operator instructions to the standalone Studio URL/process

- `[x]` update any remaining `/studio` references in docs/runbooks

#### Validation
- operators can reach the standalone Studio URL
- no one needs the embedded route operational before Stage D starts

Cutover completed:
- standalone Studio URL is now the canonical operator path in the main docs
- embedded `/studio` is documented only as a temporary migration fallback

### Stage D — Remove embedded Studio from the Astro app

#### Exact file edits
- `[x]` edit [astro.config.mjs](/Users/leonardocamacho/leonardocamacho.com2/astro.config.mjs)
  - remove `import sanity from "@sanity/astro";`
  - remove the `sanity({...})` integration block
  - keep the rest of the Astro config unchanged

- `[x]` edit [package.json](/Users/leonardocamacho/leonardocamacho.com2/package.json)
  - remove `@sanity/astro` from dependencies

- `[x]` edit [src/env.d.ts](/Users/leonardocamacho/leonardocamacho.com2/src/env.d.ts)
  - remove `/// <reference types="@sanity/astro/module" />`

- `[x]` review [src/pages/api/sanity/webhook.ts](/Users/leonardocamacho/leonardocamacho.com2/src/pages/api/sanity/webhook.ts)
  - remove the `/studio` special-case from `shouldCheckInSitemap()` if the route no longer exists

- `[x]` review docs and route references again after the config change

#### Commands
```bash
npm install
npm run build
```

Expected result:
- no embedded Studio bundle in the Astro app
- no `/studio` route coming from `@sanity/astro`

Removal completed:
- the Astro app no longer imports `@sanity/astro`
- the public app no longer documents an embedded `/studio` route

### Stage E — Post-cutover QA

#### Public app QA
```bash
npm run build
```

Success criteria:
- `astro check` remains clean
- no `/studio` bundle noise in the public app build path

Validation completed:
- root `npm run build` passes
- root `astro check` remains `0 errors / 0 warnings / 0 hints`
- public client build no longer includes Sanity Studio chunks

#### Editorial workflow QA
```bash
./scripts/test-create-content.sh -- --topic "studio separation smoke" --type insight --audience founders --locale en-us --goal "Verify Studio separation does not affect editorial generation" --notes "The CMS UI host should be decoupled from the site runtime" --sourceMode notes
./scripts/test-localization-longform-regression.sh
```

Success criteria:
- generation still works
- localization regression still passes

Validation completed:
- editorial smoke passed with `retry.count: 0`
- localization regression passed `4/4`
- artifacts:
  - [raw.json](/tmp/localization-regression/20260326-215103-localization-longform-founders-clarity/raw.json)
  - [report.txt](/tmp/localization-regression/20260326-215103-localization-longform-founders-clarity/report.txt)

#### Preview/webhook QA
- `[x]` verify preview mode still works through the public app
- `[x]` verify Sanity webhook endpoint still works through the public app
- `[ ]` verify content saves/publishes in standalone Studio are reflected on the site

Validation completed:
- preview endpoint on the public app still sets the `sanity-preview` cookie and renders an unpublished smoke draft through `www.leonardocamacho.com`
- webhook health endpoint on the public app responds successfully:
  - `{"ok":true,"service":"sanity-webhook",...}`
- draft-save reflection is validated through preview on the public app
- direct publish-to-live reflection is intentionally still pending because no disposable smoke publish has been executed against production

### Stage F — Optional custom domain later

Only after the standalone Studio is already stable:
- `[ ]` decide whether the hosted Studio URL is sufficient
- `[ ]` if not, set up a dedicated Studio domain/subdomain
- `[ ]` update docs and operator links

This is explicitly optional. It is not part of the first clean separation.

### Rollback plan

If standalone Studio fails after Stage A or B:
- keep the public app unchanged
- do not remove embedded `/studio`

If Stage D fails:
- restore the `@sanity/astro` integration in [astro.config.mjs](/Users/leonardocamacho/leonardocamacho.com2/astro.config.mjs)
- restore `@sanity/astro` in [package.json](/Users/leonardocamacho/leonardocamacho.com2/package.json)
- restore the env type reference in [src/env.d.ts](/Users/leonardocamacho/leonardocamacho.com2/src/env.d.ts)

### Completion criteria
- `[ ]` `studio-standalone` uses the root schema and desk structure
- `[ ]` standalone Studio is buildable and deployable
- `[ ]` operator docs no longer describe Studio as embedded
- `[ ]` the Astro app no longer embeds `/studio`
- `[ ]` the public app build remains healthy
- `[ ]` editorial and localization workflows remain healthy

---

## Track G — Future Domains

These are valid future functions, but not first-class migration targets yet.

### SEO
- `[~]` strategically important now, but still small as a standalone architecture domain
- `[x]` promote only if it expands beyond metadata / enrichment / opportunity tracking / refresh operations

### Newsletter
- `[~]` strategically important now, but still narrow as a standalone architecture domain
- `[ ]` promote only if it grows beyond generation + forms + Kit flow + edition operations

### Analytics
- `[~]` present but thin
- `[ ]` promote only when product analytics and editorial analytics deserve their own subsystem

### Revenue
- `[-]` explicitly deferred
- `[ ]` only create when there is real revenue workflow logic to support

### Post-checklist system hardening

These items are intentionally deferred until the current checklist is fully delivered.

#### Orchestrator vs communication modules

Principle to keep:
- orchestrators coordinate flows
- dedicated modules perform external communication

Current state:
- mostly implemented (`ops/publishing/workflows/*`, `ops/shared/cms/*`, `ops/shared/llm/runPrompt.ts`)
- still partially mixed in script-driven and `src/lib` adapter areas

Post-checklist actions:
- `[ ]` move publish orchestration into a dedicated workflow module (keep `scripts/run-publish.ts` as a thin CLI wrapper)
- `[ ]` migrate remaining external adapters from `src/lib/*` into `ops/shared/*` where appropriate (newsletter, analytics, CMS touchpoints)
- `[ ]` define explicit adapter interfaces/contracts for external providers (Sanity, OpenAI, Kit, PostHog)
- `[ ]` add targeted integration smokes per adapter boundary

#### Storybook (frontend-only, post-checklist)

Decision:
- Storybook is useful here, but only after checklist stabilization

Scope when activated:
- `src/components/*` only
- visual states for conversion and editorial UI components
- optional visual regression snapshots for safer UI iteration with AI assistance

Non-scope:
- editorial pipeline logic
- localization/publishing workflows
- backend ops/CLI behavior

Activation gate:
- `[ ]` only start when there are no high-priority checklist blockers
- `[ ]` start with a minimal pilot (8–12 key components) before expanding

---

## 7. Immediate Priorities

This is the recommended execution order from here.

### Now
- `[x]` treat this roadmap as canonical
- `[x]` merge `guidelines/` into `knowledge/`
- `[x]` define the internal structure of `knowledge/`

### Next
- `[x]` introduce `ops/publishing/` with compatibility wrappers
- `[x]` move publishing internals first
- `[x]` keep `scripts/` stable

### After that
- `[x]` move localization into `ops/localization/`
- `[x]` move shared infra into `ops/shared/`

### Later
- `[x]` decide whether SEO is mature enough to become a first-class domain
- `[ ]` decide whether newsletter is mature enough to become a first-class domain

---

## 8. Non-Goals

These are explicitly out of scope for the current architecture move.

- `[-]` redesigning the frontend information architecture
- `[-]` relocating `src/`
- `[-]` relocating Sanity schemas
- `[-]` creating empty future-domain folders
- `[-]` rewriting every import in one pass
- `[-]` doing style cleanup before domain boundaries are clearer

---

## 9. Working Rule

When deciding whether to move something, use this test:

**Does this move make the system easier to operate by domain without destabilizing the current workflow?**

If the answer is:
- `yes`, it belongs in the roadmap
- `no`, it is architecture theater and should wait
