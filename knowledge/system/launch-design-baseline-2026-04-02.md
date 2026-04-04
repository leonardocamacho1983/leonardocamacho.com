# Launch Design Baseline — 2026-04-02

This file preserves the launch design state as of 2026-04-02.

Purpose:
1. record the editorial direction used for the current launch
2. preserve the one-post behavior decisions
3. make it easy to revisit or restore these surfaces later

## Context

At this stage, the launch is designed around a single flagship essay:

1. `On Managerial Plasticity`

The design system therefore prioritizes:

1. scarcity with intent
2. editorial authority over false archive depth
3. one-post homepage states
4. a flagship reading experience

## Home Variants

### V1

Direction:
1. most editorial / cover-like
2. split composition
3. image-led left side, subscription-led right side

One-post decisions:
1. remove coverline strip
2. keep only monogram above hero
3. let hero dominate the left column
4. tighten right-column spacing
5. reduce landing-page feel in the form stack

Primary file:
1. [V1.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/launch/variants/V1.astro)

### V2

Direction:
1. clearest launch default
2. strongest structural clarity
3. adapted to feel more editorial in the one-post state

One-post decisions:
1. remove supporting list rows
2. remove bottom LinkedIn strip
3. let the featured card occupy full remaining left-column height
4. make the featured image fill the full card area
5. tighten right-column rhythm
6. make archive link quieter and more typographic

Primary file:
1. [V2.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/launch/variants/V2.astro)

### V3

Direction:
1. most atmospheric
2. image-first
3. subscription block integrated into the image field

One-post decisions:
1. reduce overlay heaviness
2. give article block more authority
3. make subscription block smaller and quieter
4. reduce theatrical bottom composition

Primary file:
1. [V3.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/launch/variants/V3.astro)

## Launch Home Data Logic

Launch home should not use the full published library by default.

Current rule:
1. prefer posts with `templateVariant === "flagship"`
2. if none exist, fall back to posts marked `featuredOnHome` or `featuredInArchive`
3. if none exist, fall back to the single latest post

Primary files:
1. [launch-posts.ts](/Users/leonardocamacho/leonardocamacho.com2/src/lib/launch-posts.ts)
2. [index.astro](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/launch/index.astro)

## Launch Archive

Direction:
1. avoid pretending to be a mature archive
2. treat the current state as an inaugural archive
3. keep the first essay and subscription path central

One-post decisions:
1. stronger featured essay block
2. quieter, more honest intro copy
3. no mature-archive scaffolding in the single-post state
4. subscription block integrated as a closing invitation
5. footnote reduced in emphasis

Primary file:
1. [archive.astro](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/launch/archive.astro)

## Flagship Post Page

Direction:
1. full-bleed hero with cream dissolve
2. centered title/header treatment
3. narrow reading column
4. integrated diagrams
5. quieter end-of-essay invitation

Refinements included in this baseline:
1. stronger paragraph rhythm
2. more deliberate spacing around headings, pull quotes, and diagrams
3. softer CTA ending
4. reduced module feel

Primary files:
1. [writing/[slug].astro](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/writing/[slug].astro)
2. [launch/archive/[slug].astro](/Users/leonardocamacho/leonardocamacho.com2/src/pages/[locale]/launch/archive/[slug].astro)
3. [FlagshipDiagramBlock.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/writing/FlagshipDiagramBlock.astro)
4. [FlagshipProseBlock.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/writing/FlagshipProseBlock.astro)
5. [FlagshipPullQuote.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/writing/FlagshipPullQuote.astro)
6. [FlagshipEpigraph.astro](/Users/leonardocamacho/leonardocamacho.com2/src/components/writing/FlagshipEpigraph.astro)

## Design Principles Preserved Here

1. do not simulate abundance when content is scarce
2. let the flagship essay carry the brand
3. keep launch surfaces honest
4. prefer editorial calm over product aggressiveness
5. preserve room for future expansion once more essays exist

## Intended Future Use

Use this baseline if:
1. a later redesign drifts too far into product tropes
2. the launch needs to be reconstructed
3. future homepage/archive variants need a historical reference point
4. a fuller site version needs to compare itself against the original one-post launch posture
