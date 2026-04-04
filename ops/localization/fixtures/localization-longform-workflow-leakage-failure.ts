import { localizationLongformFoundersClarityFixture, type LocalizationSmokeFixture } from "./localization-longform-founders-clarity";

export const localizationLongformWorkflowLeakageFailureFixture: LocalizationSmokeFixture = {
  ...localizationLongformFoundersClarityFixture,
  tamper: {
    targetLocale: "pt-br",
    kind: "workflow_leakage",
  },
};
