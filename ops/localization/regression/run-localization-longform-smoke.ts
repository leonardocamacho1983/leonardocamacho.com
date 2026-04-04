import "dotenv/config";
import { LOCALES, type LocaleKey } from "../../../src/lib/locales";
import { localizeDraft } from "../workflows/localizeDraft";
import {
  localizationLongformFoundersClarityFixture,
  type LocalizationSmokeFixture,
} from "../fixtures/localization-longform-founders-clarity";
import { localizationLongformAdvisoryCloseFailureFixture } from "../fixtures/localization-longform-advisory-close-failure";
import { localizationLongformPtPtStructuralImportFailureFixture } from "../fixtures/localization-longform-pt-pt-structural-import-failure";
import { localizationLongformWorkflowLeakageFailureFixture } from "../fixtures/localization-longform-workflow-leakage-failure";
import { localizationLongformLateAdaptationFixture } from "../fixtures/localization-longform-late-adaptation";

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const FIXTURES: Record<string, LocalizationSmokeFixture> = {
  "localization-longform-founders-clarity": localizationLongformFoundersClarityFixture,
  "localization-longform-advisory-close-failure": localizationLongformAdvisoryCloseFailureFixture,
  "localization-longform-pt-pt-structural-import-failure": localizationLongformPtPtStructuralImportFailureFixture,
  "localization-longform-workflow-leakage-failure": localizationLongformWorkflowLeakageFailureFixture,
  "localization-longform-late-adaptation": localizationLongformLateAdaptationFixture,
};

const applyTamper = (
  localized: Awaited<ReturnType<typeof localizeDraft>>,
  fixture: LocalizationSmokeFixture,
  targetLocale: LocaleKey,
) => {
  if (fixture.tamper?.targetLocale !== targetLocale || !localized.ok) {
    return localized;
  }

  switch (fixture.tamper.kind) {
    case "advisory_close":
      return {
        ...localized,
        localizedText: `${localized.localizedText}\n\nThe practical lesson is clear. Founders should standardize this through more meetings.`,
      };
    case "workflow_leakage":
      return {
        ...localized,
        localizedText: `${localized.localizedText}\n\nThis seed content is a placeholder. Replace it with the final article body in Studio.`,
      };
    case "pt_pt_structural_import":
      return {
        ...localized,
        localizedText: `${localized.localizedText}\n\nIsto é por isso que mais reuniões não resolvem o problema. Cada time age com uma lógica própria, e isso vai mudando a direção da empresa.`,
      };
    default:
      return localized;
  }
};

const main = async (): Promise<void> => {
  const fixtureName = parseFlag("--fixture") ?? "localization-longform-founders-clarity";
  const fixture = FIXTURES[fixtureName];

  if (!fixture) {
    throw new Error(`Unknown fixture: ${fixtureName}`);
  }

  const sourceLocale: LocaleKey = fixture.sourceLocale;
  const targetLocales: LocaleKey[] = LOCALES.map((locale) => locale.key).filter(
    (locale): locale is LocaleKey => locale !== sourceLocale,
  );
  const locales = [];

  for (const targetLocale of targetLocales) {
    try {
      const localized = await localizeDraft({
        sourceText: fixture.bodyMarkdown,
        sourceLocale,
        targetLocale,
        contentType: fixture.contentType,
        title: fixture.title,
        excerpt: fixture.excerpt,
        seoTitle: fixture.seoTitle,
        seoDescription: fixture.seoDescription,
      });

      locales.push({
        targetLocale,
        ...applyTamper(localized, fixture, targetLocale),
      });
    } catch (error) {
      locales.push({
        targetLocale,
        ok: false,
        localizedTitle: "",
        localizedExcerpt: "",
        localizedText: "",
        localizedSeoTitle: "",
        localizedSeoDescription: "",
        terminologyDecisions: [],
        qaWarnings: [],
        attemptsUsed: 0,
        guardianApproved: false,
        guardianViolations: [],
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: locales.every((locale) => locale.ok),
        fixture: fixtureName,
        source: {
          locale: sourceLocale,
          title: fixture.title,
          excerpt: fixture.excerpt,
          seoTitle: fixture.seoTitle,
          seoDescription: fixture.seoDescription,
          bodyMarkdown: fixture.bodyMarkdown,
        },
        locales,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[run-localization-longform-smoke] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
