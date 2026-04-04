import fs from "node:fs/promises";
import path from "node:path";
import {
  classifyBenchmarkFailures,
  summarizeFailureTaxonomy,
} from "../ops/publishing/qa/benchmarkFailureTaxonomy";
import type {
  EditorialBenchmarkCaseResult,
  EditorialBenchmarkFailureCategoryCount,
  EditorialBenchmarkFailureSignal,
  EditorialBenchmarkSuiteResult,
} from "../ops/publishing/qa/editorialBenchmark";

interface HistoricalRunSummary {
  artifactDir: string;
  artifactPath: string;
  generatedAt: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passedFirstAttempt: number;
    passedAfterRevision: number;
    passRate: number;
    firstPassRate: number;
    initialFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
    finalFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
  };
}

interface BenchmarkHistorySummary {
  suiteId: string;
  artifactRoot: string;
  generatedAt: string;
  runsConsidered: number;
  latestRun: HistoricalRunSummary | null;
  previousRun: HistoricalRunSummary | null;
  deltasFromPrevious: {
    passRate: number;
    firstPassRate: number;
    failed: number;
    passedAfterRevision: number;
  } | null;
  recurringInitialFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
  recurringFinalFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
  runs: HistoricalRunSummary[];
}

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  return process.argv[index + 1];
};

const artifactRoot = path.resolve(parseFlag("--artifact-root") || "/tmp/editorial-benchmarks");
const suiteId = parseFlag("--suite-id") || "editorial-en-benchmarks";
const limit = Number.parseInt(parseFlag("--limit") || "10", 10);
const outJson = parseFlag("--out-json");
const outReport = parseFlag("--out-report");

if (!Number.isFinite(limit) || limit <= 0) {
  throw new Error(`Invalid --limit: ${parseFlag("--limit")}`);
}

const toRate = (numerator: number, denominator: number): number =>
  denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

const ensureSuiteSummaryTaxonomy = (data: EditorialBenchmarkSuiteResult): {
  initialFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
  finalFailureTaxonomy: EditorialBenchmarkFailureCategoryCount[];
} => {
  const cases = data.cases.map((item): EditorialBenchmarkCaseResult => {
    const finalFailureTaxonomy =
      item.finalFailureTaxonomy && item.finalFailureTaxonomy.length > 0
        ? item.finalFailureTaxonomy
        : classifyBenchmarkFailures(item.benchmarkRuleResults, item.error);

    const initialFailureTaxonomy =
      item.initialFailureTaxonomy && item.initialFailureTaxonomy.length > 0
        ? item.initialFailureTaxonomy
        : [];

    return {
      ...item,
      initialFailureTaxonomy,
      finalFailureTaxonomy,
    };
  });

  return {
    initialFailureTaxonomy:
      data.summary.initialFailureTaxonomy && data.summary.initialFailureTaxonomy.length > 0
        ? data.summary.initialFailureTaxonomy
        : summarizeFailureTaxonomy(cases, "initialFailureTaxonomy"),
    finalFailureTaxonomy:
      data.summary.finalFailureTaxonomy && data.summary.finalFailureTaxonomy.length > 0
        ? data.summary.finalFailureTaxonomy
        : summarizeFailureTaxonomy(cases, "finalFailureTaxonomy"),
  };
};

const readHistoricalRuns = async (): Promise<HistoricalRunSummary[]> => {
  const entries = await fs.readdir(artifactRoot, { withFileTypes: true });
  const candidates = entries.filter((entry) => entry.isDirectory());
  const runs: HistoricalRunSummary[] = [];

  for (const entry of candidates) {
    const artifactPath = path.join(artifactRoot, entry.name, "raw.json");

    try {
      const raw = await fs.readFile(artifactPath, "utf8");
      const parsed = JSON.parse(raw) as EditorialBenchmarkSuiteResult;
      if (parsed.suiteId !== suiteId) continue;

      const taxonomy = ensureSuiteSummaryTaxonomy(parsed);
      const total = parsed.summary.total;
      const passed = parsed.summary.passed;
      const passedFirstAttempt = parsed.summary.passedFirstAttempt ?? 0;
      const passedAfterRevision = parsed.summary.passedAfterRevision ?? 0;

      runs.push({
        artifactDir: entry.name,
        artifactPath,
        generatedAt: parsed.generatedAt,
        summary: {
          total,
          passed,
          failed: parsed.summary.failed,
          passedFirstAttempt,
          passedAfterRevision,
          passRate: toRate(passed, total),
          firstPassRate: toRate(passedFirstAttempt, total),
          initialFailureTaxonomy: taxonomy.initialFailureTaxonomy,
          finalFailureTaxonomy: taxonomy.finalFailureTaxonomy,
        },
      });
    } catch {
      continue;
    }
  }

  return runs
    .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt))
    .slice(-limit);
};

const accumulateTaxonomy = (
  runs: HistoricalRunSummary[],
  field: "initialFailureTaxonomy" | "finalFailureTaxonomy",
): EditorialBenchmarkFailureCategoryCount[] => {
  const counts = new Map<string, { count: number; caseIds: Set<string> }>();

  for (const run of runs) {
    for (const item of run.summary[field]) {
      const existing = counts.get(item.category) ?? { count: 0, caseIds: new Set<string>() };
      existing.count += item.count;
      for (const caseId of item.caseIds) {
        existing.caseIds.add(caseId);
      }
      counts.set(item.category, existing);
    }
  }

  return Array.from(counts.entries())
    .map(([category, value]) => ({
      category: category as EditorialBenchmarkFailureSignal["category"],
      count: value.count,
      caseIds: Array.from(value.caseIds).sort(),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return left.category.localeCompare(right.category);
    });
};

const formatTaxonomyBlock = (
  title: string,
  items: EditorialBenchmarkFailureCategoryCount[],
): string[] => {
  if (items.length === 0) {
    return [title, "  - none"];
  }

  return [
    title,
    ...items.map((item) => `  - ${item.category}: ${item.count} [cases: ${item.caseIds.join(", ")}]`),
  ];
};

const runs = await readHistoricalRuns();
const latestRun = runs.at(-1) ?? null;
const previousRun = runs.length > 1 ? runs.at(-2) ?? null : null;

const summary: BenchmarkHistorySummary = {
  suiteId,
  artifactRoot,
  generatedAt: new Date().toISOString(),
  runsConsidered: runs.length,
  latestRun,
  previousRun,
  deltasFromPrevious:
    latestRun && previousRun
      ? {
          passRate: Number((latestRun.summary.passRate - previousRun.summary.passRate).toFixed(1)),
          firstPassRate: Number((latestRun.summary.firstPassRate - previousRun.summary.firstPassRate).toFixed(1)),
          failed: latestRun.summary.failed - previousRun.summary.failed,
          passedAfterRevision:
            latestRun.summary.passedAfterRevision - previousRun.summary.passedAfterRevision,
        }
      : null,
  recurringInitialFailureTaxonomy: accumulateTaxonomy(runs, "initialFailureTaxonomy"),
  recurringFinalFailureTaxonomy: accumulateTaxonomy(runs, "finalFailureTaxonomy"),
  runs,
};

const reportLines = [
  `Editorial benchmark history summary (${suiteId})`,
  `Artifact root: ${artifactRoot}`,
  `Runs considered: ${summary.runsConsidered}`,
  latestRun
    ? `Latest run: ${latestRun.artifactDir} | pass rate ${latestRun.summary.passRate}% | first-pass ${latestRun.summary.firstPassRate}% | failed ${latestRun.summary.failed}`
    : "Latest run: none",
  previousRun
    ? `Previous run: ${previousRun.artifactDir} | pass rate ${previousRun.summary.passRate}% | first-pass ${previousRun.summary.firstPassRate}% | failed ${previousRun.summary.failed}`
    : "Previous run: none",
  summary.deltasFromPrevious
    ? `Delta vs previous: pass rate ${summary.deltasFromPrevious.passRate >= 0 ? "+" : ""}${summary.deltasFromPrevious.passRate} pts | first-pass ${summary.deltasFromPrevious.firstPassRate >= 0 ? "+" : ""}${summary.deltasFromPrevious.firstPassRate} pts | failed ${summary.deltasFromPrevious.failed >= 0 ? "+" : ""}${summary.deltasFromPrevious.failed} | pass-after-revision ${summary.deltasFromPrevious.passedAfterRevision >= 0 ? "+" : ""}${summary.deltasFromPrevious.passedAfterRevision}`
    : "Delta vs previous: n/a",
  "",
  ...formatTaxonomyBlock("Recurring initial failure taxonomy:", summary.recurringInitialFailureTaxonomy),
  "",
  ...formatTaxonomyBlock("Recurring final failure taxonomy:", summary.recurringFinalFailureTaxonomy),
];

const reportText = `${reportLines.join("\n")}\n`;

if (outJson) {
  await fs.writeFile(path.resolve(outJson), JSON.stringify(summary, null, 2));
}

if (outReport) {
  await fs.writeFile(path.resolve(outReport), reportText);
}

console.log(JSON.stringify(summary, null, 2));
