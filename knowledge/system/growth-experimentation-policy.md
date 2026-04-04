# Growth Experimentation Policy (v1)

This policy defines how conversion experiments are run without destabilizing editorial quality.

## 1) Scope

Applies to:
- launch page conversion changes
- writing index conversion changes
- article-page conversion changes
- newsletter onboarding flow UX/copy changes

Does not apply to:
- core editorial pipeline logic
- localization quality logic
- CMS schema migrations

## 2) Experiment Unit

Each experiment must define:
- `hypothesis`: one sentence
- `surface`: `launch | home | writing_index | article | welcome | confirmed`
- `primary_kpi`: one of the growth KPIs from `growth-loop-kpi-plan.md`
- `guardrails`: at least editorial quality + performance
- `start_date` and planned evaluation window (default 14 days)
- `owner`

## 3) Change Constraints

- One primary change per experiment.
- No concurrent experiments on the same surface unless explicitly coordinated.
- No hidden copy/layout changes outside the declared experiment.

## 4) Decision Rules

- Keep: primary KPI improves and guardrails are stable.
- Revert: KPI degrades materially or guardrails regress.
- Extend: inconclusive after 14 days; extend one more window and then decide.

Use practical thresholds:
- conversion KPI movement below `0.5pp` is usually noise unless sustained.
- any verified editorial-quality regression blocks rollout.

## 5) Guardrails (Mandatory)

- `npm run test:system:validation` stays green.
- no net regression in Lighthouse/perf checks for affected pages.
- no increase in newsletter API error classes (`newsletter_subscribe_failed`, `newsletter_profile_failed`) driven by the change.

## 6) Measurement Inputs

- growth KPI snapshot artifacts:
  - `/tmp/growth-kpi/<timestamp>-growth-kpi/snapshot.json`
  - `/tmp/growth-kpi/<timestamp>-growth-kpi/movement.json`
  - `/tmp/growth-kpi/history.json`
- deployment/release identifier for traceability

## 7) Logging Template (minimal)

```md
## Growth Experiment
- Date:
- Owner:
- Hypothesis:
- Surface:
- Primary KPI:
- Guardrails:
- Change shipped:
- Baseline snapshot:
- Result snapshot:
- Decision: keep | revert | extend
- Notes:
```
