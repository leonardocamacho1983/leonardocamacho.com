# Growth Loop + KPI Model Plan (v1)

This document defines the implementation plan for:
- core growth loop definition
- KPI model and instrumentation boundaries

It is intentionally scoped to the current system and should not introduce a new domain or heavy analytics architecture.

## 1) Goal

Turn editorial output into a measurable loop:
- content discovery
- content engagement
- newsletter signup
- newsletter engagement
- return visit and deeper readership

## 2) Loop Definition (v1)

Loop stages:
1. `Discover`: user lands on a content surface (home, writing index, post, launch/welcome).
2. `Engage`: user reads enough to show real engagement.
3. `Convert`: user submits newsletter signup.
4. `Activate`: user confirms onboarding/welcome path and receives newsletter.
5. `Return`: user comes back and consumes another content page.
6. `Deepen`: user moves from broad surfaces into post-level reading and repeated sessions.

Operational loop expression:
- `content -> engaged visit -> signup -> newsletter touch -> return visit -> second content session`

## 3) Acquisition Surface Map (v1)

Primary acquisition surfaces:
- `launch` locale roots (`/:locale`)
- `writing index` (`/:locale/writing`)
- `article page` (`/:locale/writing/:slug`)
- `welcome/confirmed` funnel pages

Attribution dimensions:
- `surface_type`: `launch | writing_index | article | welcome | confirmed | other`
- `locale`
- `path`
- `utm_source`, `utm_medium`, `utm_campaign` when available
- `referrer_domain`

## 4) KPI Model (v1)

North-star proxy:
- `Activated Subscribers per 28d` (new newsletter subscribers who complete onboarding path)

Primary KPIs:
- `Visitor -> Signup CVR`:
  - `newsletter_signup_success / unique_visitors_on_conversion_surfaces`
- `Article -> Signup CVR`:
  - `signup_success_attributed_to_article / unique_article_visitors`
- `Welcome Progress Rate`:
  - `confirmed_view / welcome_view`
- `Return Reader Rate (14d)`:
  - `readers_with_2plus_content_sessions_within_14d / total_content_readers`
- `Depth Rate`:
  - `sessions_with_2plus_content_pageviews / content_sessions`

Secondary KPIs:
- newsletter form error rate
- consent acceptance rate (analytics opt-in, context only)
- per-locale CVR deltas
- top converting article slugs

Guardrail KPIs:
- page performance and stability (no growth change should regress editorial UX materially)
- editorial quality baseline remains green

## 5) Instrumentation Plan

### 5.1 Existing signals to keep

- funnel view events from telemetry:
  - `launch_view`
  - `welcome_view`
  - `confirmed_view`
- launch signup interactions from signup scripts:
  - `launch_submit_clicked`
  - `launch_subscribe_success`
  - `launch_subscribe_failed`

### 5.2 New events to add (minimal set)

Client events:
- `home_subscribe_submit_clicked`
- `home_subscribe_success`
- `home_subscribe_failed`
- `writing_subscribe_submit_clicked`
- `writing_subscribe_success`
- `writing_subscribe_failed`
- `article_engaged_read` (trigger after engagement threshold)
- `article_secondary_navigation_clicked` (internal content click from article)

Server-side events (newsletter API):
- `newsletter_subscribe_attempt`
- `newsletter_subscribe_success`
- `newsletter_subscribe_failed`
- `newsletter_profile_saved`

Event properties (minimum):
- `locale`
- `path`
- `surface_type`
- `source` (already sent by form payload where applicable)
- `post_slug` (for article events)
- `translation_key` when available

## 6) KPI Computation Boundaries

Source of truth:
- PostHog events for behavioral funnel metrics
- Kit API outcomes for subscriber state and delivery outcomes

Computation windows:
- weekly operational report
- rolling 28-day trend

Segmentation:
- by locale
- by surface type
- by article slug (top N)

## 7) Cadence and Ownership

Weekly growth review:
- inputs:
  - 28d KPI snapshot
  - per-surface conversion movement
  - top converting and low-converting posts
- decisions:
  - keep / revise / test conversion surfaces
  - pick post refresh candidates for conversion impact

Monthly checkpoint:
- evaluate whether KPI signal quality is stable
- evaluate whether growth instrumentation remains lightweight

## 8) Delivery Plan

Phase D1.1: Tracking spec lock (this document)
- freeze event taxonomy and KPI formulas
- define event property contract

Phase D1.2: Instrumentation implementation
- add missing client events on home/writing/article surfaces
- add server events on newsletter endpoints
- ensure locale + path attribution is always present

Phase D1.3: KPI summarizer
- create script to compute weekly + 28d KPI summary from event exports
- write artifacts to `/tmp/growth-kpi/`

Phase D1.4: Operating runbook integration
- add weekly growth routine to operations manual
- add one command alias for KPI summary generation

Phase D1.5: Stabilization
- run for 3 consecutive weekly cycles
- adjust only event quality gaps or obviously noisy metrics

## 9) Exit Criteria for “Growth loop + KPI model defined”

This roadmap item is complete when:
- growth loop stages are explicitly documented
- KPI formulas are explicit and accepted
- acquisition surfaces are mapped
- event taxonomy for v1 is frozen
- implementation milestones are sequenced and actionable

## 10) Current Delivery Status (2026-03-30)

- D1.1 complete:
  - loop, surfaces, KPI model, and event taxonomy are defined
- D1.2 started:
  - client events implemented for home, writing index, and article engagement/navigation
  - server events implemented on newsletter subscribe/profile endpoints
- D1.3 complete:
  - KPI summarizer implemented:
    - `scripts/run-growth-kpi-summary.ts`
    - `scripts/lib/growth-kpi.ts`
  - smoke test and fixtures added:
    - `npm run test:growth:kpi`
  - artifacts now written under:
    - `/tmp/growth-kpi/<timestamp>-growth-kpi/`
    - `/tmp/growth-kpi/history.json`
- D1.4 complete:
  - runbook integration:
    - `knowledge/system/operations-manual.md`
    - `knowledge/system/operator-quick-start.md`
  - growth vs editorial analytics separation in instrumentation:
    - growth events tagged as `analytics_domain=growth`
    - baseline telemetry defaults to `analytics_domain=editorial`
  - KPI summarizer now excludes non-growth tagged events from KPI calculations
    and reports domain split in the snapshot summary
- Experimentation policy added:
  - `knowledge/system/growth-experimentation-policy.md`
- D1.5 started:
  - stabilization helper now exists:
    - `scripts/run-growth-kpi-stabilization.ts`
    - `scripts/lib/growth-kpi-stability.ts`
  - smoke for stability classification:
    - `npm run test:growth:stability`
  - operator wrapper:
    - `bash scripts/content-workflow.sh growth-stability -- --required-cycles 3`
- Next:
  - complete 3 consecutive weekly real cycles and tune noisy metrics using the stability report output
