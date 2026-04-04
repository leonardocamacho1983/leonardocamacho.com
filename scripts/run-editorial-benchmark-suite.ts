import "dotenv/config";
import { EDITORIAL_BENCHMARKS } from "./fixtures/editorial-benchmarks";
import { createContent } from "../ops/publishing/workflows/createContent";
import {
  classifyBenchmarkFailures,
  summarizeFailureTaxonomy,
} from "../ops/publishing/qa/benchmarkFailureTaxonomy";
import { evaluateEditorialBenchmarkCase } from "../ops/publishing/qa/benchmarkEvaluator";
import type { BrandViolation } from "../ops/publishing/review/types";
import type { CreateContentResult } from "../ops/publishing/types/content";
import type { EditorialBenchmarkCaseResult, EditorialBenchmarkSuiteResult } from "../ops/publishing/qa/editorialBenchmark";

const BENCHMARK_REVISION_LIMIT = 1;

const parseMultiFlag = (name: string): string[] => {
  const values: string[] = [];
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === name) {
      const value = process.argv[index + 1];
      if (typeof value === "string" && value.length > 0 && !value.startsWith("--")) {
        values.push(value);
      }
    }
  }
  return values;
};

const hasFlag = (name: string): boolean => process.argv.includes(name);

const selectedCaseIds = new Set(parseMultiFlag("--case"));
if (hasFlag("--list-cases")) {
  console.log(JSON.stringify(EDITORIAL_BENCHMARKS.map((fixture) => fixture.id), null, 2));
  process.exit(0);
}

const fixtures =
  selectedCaseIds.size > 0
    ? EDITORIAL_BENCHMARKS.filter((fixture) => selectedCaseIds.has(fixture.id))
    : EDITORIAL_BENCHMARKS;

if (selectedCaseIds.size > 0 && fixtures.length !== selectedCaseIds.size) {
  const foundIds = new Set(fixtures.map((fixture) => fixture.id));
  const missing = Array.from(selectedCaseIds).filter((id) => !foundIds.has(id));
  throw new Error(`Unknown benchmark case id(s): ${missing.join(", ")}`);
}

const buildErrorCase = (caseId: string, label: string, error: unknown): EditorialBenchmarkCaseResult => ({
  caseId,
  label,
  finalStatus: "failed",
  benchmarkResolution: "failed_after_max_revisions",
  benchmarkRevisionsUsed: 0,
  initialFailureReasons: [error instanceof Error ? error.message : String(error)],
  pipelineApproved: false,
  retry: { attempted: false, count: 0 },
  firstPassViolations: [],
  openingQuality: { name: "opening_quality", passed: false, evidence: "runner error", opening: "" },
  closingTone: { name: "closing_tone", passed: false, evidence: "runner error", closing: "" },
  conceptInvention: { name: "concept_invention", passed: false, evidence: "runner error", proposedConcepts: [] },
  mechanismSurvival: { name: "mechanism_survival", passed: false, evidence: "runner error", missingAnchorGroups: [] },
  phenomenonConsistency: { name: "phenomenon_consistency", passed: false, evidence: "runner error", expected: undefined, actual: undefined },
  benchmarkRuleResults: [],
  failureReasons: [error instanceof Error ? error.message : String(error)],
  output: { title: "", summary: "", bodyMarkdown: "" },
  brief: { contentType: "essay", coreClaim: "" },
  reference: { title: "", summary: "", bodyMarkdown: "" },
  survivalCriteria: [],
  knownFailurePatterns: [],
  error: error instanceof Error ? error.message : String(error),
  initialFailureTaxonomy: [],
  finalFailureTaxonomy: classifyBenchmarkFailures([], error instanceof Error ? error.message : String(error)),
});

const dedupeViolations = (violations: BrandViolation[]): BrandViolation[] => {
  const seen = new Set<string>();
  const unique: BrandViolation[] = [];

  for (const violation of violations) {
    const key = `${violation.rule}::${violation.message}::${violation.evidence ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(violation);
  }

  return unique;
};

const appendViolation = (
  violations: BrandViolation[],
  rule: string,
  message: string,
  evidence?: string,
): void => {
  violations.push({ rule, message, evidence });
};

const buildDisallowedPatternViolationMessage = (ruleName: string): string => {
  if (ruleName === "disallowed_ownership_substitution") {
    return "Benchmark review: do not invoke delay as slow people, weak ownership, or low urgency even as contrast. Replace that framing with a neutral phrase like individual performance explanations, and keep the mechanism on rule interaction and path latency.";
  }

  const normalizedName = ruleName.replace(/^disallowed_/, "").replace(/_/g, " ");
  return `Benchmark review: remove the prohibited framing flagged by ${normalizedName} while preserving the mechanism and claim.`;
};

const buildBenchmarkRevisionViolations = (
  result: CreateContentResult,
  evaluated: EditorialBenchmarkCaseResult,
): BrandViolation[] => {
  const violations: BrandViolation[] = [...result.brandGuardian.violations];

  if (!evaluated.openingQuality.passed) {
    appendViolation(
      violations,
      "opening_claim",
      "Benchmark review: opening must state the claim more sharply in the first sentence.",
      evaluated.openingQuality.evidence,
    );
  }

  if (!evaluated.closingTone.passed) {
    appendViolation(
      violations,
      "tone",
      "Benchmark review: restore a consequence-led close instead of operator advice.",
      evaluated.closingTone.evidence,
    );
  }

  if (!evaluated.conceptInvention.passed) {
    appendViolation(
      violations,
      "concept_governance",
      "Benchmark review: remove or weaken the invented concept and keep the mechanism explicit in plain language.",
      evaluated.conceptInvention.evidence,
    );
  }

  if (!evaluated.mechanismSurvival.passed) {
    appendViolation(
      violations,
      "mechanism",
      "Benchmark review: restore the missing mechanism anchors from the core claim.",
      evaluated.mechanismSurvival.evidence,
    );
  }

  if (!evaluated.phenomenonConsistency.passed) {
    appendViolation(
      violations,
      "category_mistake",
      "Benchmark review: realign the piece to the intended phenomenon type instead of drifting into a softer category.",
      evaluated.phenomenonConsistency.evidence,
    );
  }

  for (const rule of evaluated.benchmarkRuleResults) {
    if (rule.passed) continue;

    if (rule.name === "operator_relevance" || rule.name === "positioning") {
      appendViolation(
        violations,
        rule.name,
        "Benchmark review: move the operator frame into the opening and first 1-2 paragraphs.",
        rule.evidence,
      );
      continue;
    }

    if (rule.name === "anti_synthetic_texture") {
      appendViolation(
        violations,
        "tone",
        "Benchmark review: reduce templated paragraph texture and restore more human prose rhythm.",
        rule.evidence,
      );
      continue;
    }

    if (rule.name.startsWith("disallowed_")) {
      appendViolation(
        violations,
        rule.name,
        buildDisallowedPatternViolationMessage(rule.name),
        rule.evidence,
      );
      continue;
    }
  }

  if (violations.length === 0) {
    appendViolation(
      violations,
      "other",
      "Benchmark review failed. Regenerate the draft to satisfy the benchmark findings.",
      evaluated.failureReasons.join("; "),
    );
  }

  return dedupeViolations(violations);
};

const buildProtocolRecoveryViolations = (error: unknown): BrandViolation[] =>
  dedupeViolations([
    {
      rule: "other",
      message:
        "Previous benchmark attempt failed before producing a valid draft. Regenerate a clean JSON-compliant draft while preserving the brief and editorial rules.",
      evidence: error instanceof Error ? error.message : String(error),
    },
  ]);

const withBenchmarkResolution = (
  result: EditorialBenchmarkCaseResult,
  resolution: EditorialBenchmarkCaseResult["benchmarkResolution"],
  revisionsUsed: number,
  initialFailureReasons: string[],
  initialFailureTaxonomy: EditorialBenchmarkCaseResult["initialFailureTaxonomy"],
): EditorialBenchmarkCaseResult => ({
  ...result,
  benchmarkResolution: resolution,
  benchmarkRevisionsUsed: revisionsUsed,
  initialFailureReasons,
  initialFailureTaxonomy,
});

const runBenchmarkCase = async (
  fixture: (typeof EDITORIAL_BENCHMARKS)[number],
): Promise<EditorialBenchmarkCaseResult> => {
  let revisionViolations: BrandViolation[] | undefined;
  let initialFailureReasons: string[] = [];
  let initialFailureTaxonomy: EditorialBenchmarkCaseResult["initialFailureTaxonomy"] = [];

  for (let attempt = 0; attempt <= BENCHMARK_REVISION_LIMIT; attempt += 1) {
    try {
      const result = await createContent({
        ...fixture.input,
        dryRun: true,
        revisionViolations,
      });
      const evaluated = evaluateEditorialBenchmarkCase(fixture, result);

      if (attempt === 0) {
        initialFailureReasons = evaluated.failureReasons;
        initialFailureTaxonomy = evaluated.finalFailureTaxonomy;
      }

      if (evaluated.finalStatus === "passed") {
        return withBenchmarkResolution(
          evaluated,
          attempt === 0 ? "pass_first_attempt" : "pass_after_revision",
          attempt,
          initialFailureReasons,
          initialFailureTaxonomy,
        );
      }

      if (attempt === BENCHMARK_REVISION_LIMIT) {
        return withBenchmarkResolution(
          evaluated,
          "failed_after_max_revisions",
          attempt,
          initialFailureReasons,
          initialFailureTaxonomy,
        );
      }

      revisionViolations = buildBenchmarkRevisionViolations(result, evaluated);
    } catch (error) {
      const baseErrorCase = buildErrorCase(fixture.id, fixture.label, error);

      if (attempt === 0) {
        initialFailureReasons = baseErrorCase.failureReasons;
        initialFailureTaxonomy = baseErrorCase.finalFailureTaxonomy;
      }

      if (attempt === BENCHMARK_REVISION_LIMIT) {
        return withBenchmarkResolution(
          baseErrorCase,
          "failed_after_max_revisions",
          attempt,
          initialFailureReasons,
          initialFailureTaxonomy,
        );
      }

      revisionViolations = buildProtocolRecoveryViolations(error);
    }
  }

  return buildErrorCase(fixture.id, fixture.label, new Error("benchmark_runner_exhausted_without_result"));
};

const main = async (): Promise<void> => {
  const cases: EditorialBenchmarkCaseResult[] = [];

  for (const fixture of fixtures) {
    cases.push(await runBenchmarkCase(fixture));
  }

  const passed = cases.filter((item) => item.finalStatus === "passed").length;
  const passedFirstAttempt = cases.filter((item) => item.benchmarkResolution === "pass_first_attempt").length;
  const passedAfterRevision = cases.filter((item) => item.benchmarkResolution === "pass_after_revision").length;
  const suiteResult: EditorialBenchmarkSuiteResult = {
    ok: passed === cases.length,
    suiteId: "editorial-en-benchmarks",
    generatedAt: new Date().toISOString(),
    summary: {
      total: cases.length,
      passed,
      failed: cases.length - passed,
      passedFirstAttempt,
      passedAfterRevision,
      initialFailureTaxonomy: summarizeFailureTaxonomy(cases, "initialFailureTaxonomy"),
      finalFailureTaxonomy: summarizeFailureTaxonomy(cases, "finalFailureTaxonomy"),
    },
    cases,
  };

  console.log(JSON.stringify(suiteResult, null, 2));
};

main().catch((error) => {
  console.error("[run-editorial-benchmark-suite] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
