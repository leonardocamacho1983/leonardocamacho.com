import type { LocaleKey } from "../../../src/lib/locales";
import type { LocalizedContentType } from "../workflows/localizeDraft";

export interface LocalizationSmokeFixture {
  sourceLocale: LocaleKey;
  contentType: LocalizedContentType;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  bodyMarkdown: string;
  tamper?: {
    targetLocale: LocaleKey;
    kind: "advisory_close" | "workflow_leakage" | "pt_pt_structural_import";
  };
}

export const localizationLongformFoundersClarityFixture: LocalizationSmokeFixture = {
  sourceLocale: "en-us",
  contentType: "insight",
  title: "Why Founders Lose Strategic Clarity Long Before They Notice",
  excerpt:
    "Strategic clarity rarely disappears in a dramatic moment. It erodes as individually reasonable decisions accumulate across teams until the company's direction becomes difficult to recognize from inside the organization.",
  seoTitle: "Why Founders Lose Strategic Clarity",
  seoDescription:
    "Strategic clarity erodes through locally rational decisions that accumulate across teams before founders can see the pattern.",
  bodyMarkdown: `Strategic clarity rarely disappears in a single dramatic moment. It fades while sensible decisions accumulate across product, sales, marketing, and finance, each one justified within its own context, each one slightly altering the company's direction.

Founders often misread this loss of clarity. They call it distraction, weak prioritization, or execution drift. That diagnosis is too shallow. The deeper mechanism is structural: well-functioning teams optimize against different constraints, time horizons, and success measures. The company does not lose direction because people stop thinking. It loses direction because many people think well inside different frames at the same time.

Consider a company that says it wants to win a narrow mid-market segment. Product invests in self-serve onboarding to improve activation. Sales accepts enterprise feature requests to close larger deals. Marketing broadens acquisition campaigns to keep pipeline volume high. Finance rewards short-term revenue preservation over roadmap discipline. None of these decisions is irrational on its own. Together they move the company away from the market it claims to serve.

The hard part is that this drift does not usually feel like conflict. Most decisions remain defensible. Each team can explain why its choice made sense. The founder approves one decision after another without seeing the full pattern forming underneath them. By the time the contradiction becomes visible, it has already been written into headcount, customer promises, revenue expectations, and product architecture.

This is why more meetings do not solve the problem by themselves. If every team keeps optimizing within a different frame, additional coordination can simply make the emerging contradiction easier to justify. The issue is not the absence of conversation. It is the absence of a view that can register how individually reasonable decisions combine into a direction nobody explicitly chose.

Strategic clarity is therefore not a slogan or a planning artifact. It is a property of the decisions a company repeats over time. It weakens before anyone intends it to weaken, and it usually becomes legible only after incompatible commitments have already hardened.`,
};
