# Publish Gate Policy

## Purpose
This document defines publishability as a policy target.
It does not turn the current regression gates into automatic publishing authority.

## Regression Gate vs Publish Gate
### Regression Gate
- Protects against obvious backward movement.
- Uses stable heuristics and deterministic failure fixtures.
- Must be CI-friendly and low-noise.

### Publish Gate
- Protects editorial quality at the point of release.
- Can be stricter, slower, and narrower.
- May still require human review for weaker locales or borderline drafts.

## Draft-Level Publishability Rules
A draft is publishable only if all of the following are true:
- no critical guardian failures remain
- the claim is explicit early
- the mechanism remains visible and specific
- diagnosis-led `insight` pieces do not end as advice
- concept governance is respected
- the final text sounds native in the target locale

## Critical Failure Classes
Treat these as blocking classes for publishability:
- opening claim failure
- mechanism loss or conceptual downgrade
- advisory closing in diagnosis-led insight
- invented concept that does not earn its place
- workflow or placeholder leakage
- locale output that reads as translated rather than native

## Locale Standard
Localization is publishable only when the output clears both:
- mechanism preservation
- locale-native readability

A correct translation with weak native voice is not publishable.

## Human Review Boundary
Human review remains the final authority when:
- locale-native quality is uncertain
- the piece is unusually conceptual or ambiguous
- concept naming is proposed
- the draft technically passes regression checks but still feels editorially weak

## Implementation Boundary
Do not make publishing automatic from this policy in this milestone.
The current milestone is for EN benchmark calibration plus regression confidence, not full publish automation.
