# Localization Locale Policy

## Purpose
This policy exists to keep localization quality from collapsing into near-translation.
The immediate focus is PT-BR and PT-PT, where cross-locale leakage is the highest current risk.

## Operating Principle
- Preserve mechanism before wording.
- Preserve native voice before surface similarity.
- Do not treat PT-BR and PT-PT as spelling variants of the same output.

## Locale Expectations
### EN-GB
- Adapt, do not reconstruct.
- Keep paragraph structure unless the source is clearly broken.
- Change spelling and phrasing, not argument shape.

### PT-BR
- Direct and idiomatic.
- Executive-to-peer, not bureaucratic.
- Avoid translated abstractions and stiff nominal phrasing.
- Favor natural sentence flow over fidelity to English structure.

### PT-PT
- More formal and more syntactically deliberate than PT-BR.
- Avoid Brazilian syntax, title framing, and discourse rhythm.
- Prefer European lexical choices when they change the native feel materially.

### FR-FR
- Slightly more formal than EN-US.
- Avoid unnecessary anglicisms unless the term is actually standard in operator contexts.
- Preserve mechanism density without mapping English rhetoric directly onto French syntax.

## Cross-Locale Leakage Rules
Reject or revise if any of the following occur:
- PT-PT carries PT-BR title framing or sentence rhythm.
- PT-BR sounds translated or over-formal.
- FR-FR mirrors English sentence order too closely.
- EN-GB is unnecessarily reconstructed instead of lightly adapted.

## Recurring Business Vocabulary
These are policy defaults, not automatic substitutions.

- `mid-market`
  - PT-BR: prefer `mercado intermediario` or a concrete equivalent in context.
  - PT-PT: prefer `mercado intermedio` or a concrete equivalent in context.
- `roadmap`
  - PT-BR/PT-PT: `roadmap` is acceptable in operator contexts; avoid awkward literal replacements.
- `self-serve onboarding`
  - PT-BR/PT-PT: keep `onboarding self-service` only if the surrounding sentence is fully natural.
  - If not natural, reconstruct the function rather than translate the phrase literally.
- `pipeline`
  - PT-BR/PT-PT: `pipeline` is acceptable in sales context; do not force literal replacements.
- `weak signals`
  - Do not translate into terms that imply explicit alerts or formal warnings if the mechanism is subtle interpretation.

## Manual Review Checkpoints
Before encoding a new locale rule into prompts or guardians, review a small sample manually and answer:
- Does this sound native or translated?
- Is the mechanism still explicit?
- Did the locale preserve the right business register?
- Did PT-BR and PT-PT diverge where they should?
- Was any English abstraction carried over without being earned?

## Implementation Boundary
This policy is deliberately ahead of runtime enforcement.
Do not add prompt or guardian hardening from this document until benchmark-calibrated EN quality is stable.
