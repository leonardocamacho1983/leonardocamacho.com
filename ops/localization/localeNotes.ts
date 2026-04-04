import type { LocaleKey } from "../../src/lib/locales";

const LOCALE_NOTES: Partial<Record<LocaleKey, string[]>> = {
  "pt-pt": [
    "Write in European Portuguese that feels originally written for Portugal, not PT-BR with spelling substitutions.",
    "Prefer European Portuguese business prose: slightly tighter, less conversational, and less oral than PT-BR, without becoming academic or bureaucratic.",
    "Avoid Brazilian lexical choices or cadence when a Portuguese-from-Portugal executive would phrase it differently. Example: prefer 'equipa' over 'time'.",
    "Avoid literal rhetorical calques from English such as 'isto é por isso que', 'o problema é que' repeated mechanically, or sentence structures that map clause-by-clause from the source.",
    "When a sentence feels translated, rebuild it completely. Prefer a natural PT-PT line over a faithful-but-imported structure, especially in openings and transitions.",
  ],
};

export const getLocalizationLocaleNotes = (targetLocale: LocaleKey): string[] => LOCALE_NOTES[targetLocale] ?? [];

