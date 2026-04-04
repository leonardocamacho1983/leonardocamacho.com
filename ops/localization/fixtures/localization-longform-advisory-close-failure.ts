import { localizationLongformFoundersClarityFixture, type LocalizationSmokeFixture } from "./localization-longform-founders-clarity";

export const localizationLongformAdvisoryCloseFailureFixture: LocalizationSmokeFixture = {
  ...localizationLongformFoundersClarityFixture,
  tamper: {
    targetLocale: "en-gb",
    kind: "advisory_close",
  },
};
