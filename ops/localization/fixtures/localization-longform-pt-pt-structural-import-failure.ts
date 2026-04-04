import { localizationLongformFoundersClarityFixture, type LocalizationSmokeFixture } from "./localization-longform-founders-clarity";

export const localizationLongformPtPtStructuralImportFailureFixture: LocalizationSmokeFixture = {
  ...localizationLongformFoundersClarityFixture,
  tamper: {
    targetLocale: "pt-pt",
    kind: "pt_pt_structural_import",
  },
};

