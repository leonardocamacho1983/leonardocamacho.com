import "dotenv/config";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  buildIndexCoverageSnapshot,
  buildSearchPerformanceSnapshot,
  buildSeoTrackingSummaryText,
  compareIndexCoverageSnapshots,
  compareSearchPerformanceSnapshots,
  parseIndexCoverageCsv,
  parseSearchPerformanceCsv,
  type IndexCoverageSnapshot,
  type SearchPerformanceSnapshot,
} from "./lib/seo-tracking.ts";

interface TrackingHistory {
  property: string;
  snapshots: Array<{
    id: string;
    generatedAt: string;
    property: string;
    windowLabel: string;
    performance: SearchPerformanceSnapshot;
    indexing: IndexCoverageSnapshot | null;
  }>;
}

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const withDefault = (value: string | undefined, fallback: string): string => {
  const cleaned = (value || "").trim();
  return cleaned || fallback;
};

const sanitizeHost = (value: string): string => value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

const timestampId = (date: Date): string => {
  const yyyy = `${date.getFullYear()}`;
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");
  const sec = `${date.getSeconds()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${min}${sec}`;
};

const asPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt((value || "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const loadHistory = (historyPath: string, property: string): TrackingHistory => {
  if (!existsSync(historyPath)) {
    return { property, snapshots: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(historyPath, "utf8")) as Partial<TrackingHistory>;
    if (!raw || !Array.isArray(raw.snapshots)) {
      return { property, snapshots: [] };
    }
    return {
      property: typeof raw.property === "string" && raw.property ? raw.property : property,
      snapshots: raw.snapshots as TrackingHistory["snapshots"],
    };
  } catch {
    return { property, snapshots: [] };
  }
};

const main = async (): Promise<void> => {
  const csvPath = parseFlag("--csv");
  if (!csvPath) {
    throw new Error("Missing --csv <path-to-search-console-performance-export.csv>");
  }

  const indexingCsvPath = parseFlag("--indexing-csv");
  const outDir = withDefault(parseFlag("--out-dir"), "/tmp/seo-tracking");
  const property = withDefault(
    parseFlag("--property"),
    sanitizeHost(process.env.PUBLIC_SITE_URL || "leonardocamacho.com"),
  );
  const windowLabel = withDefault(parseFlag("--window"), "last-28-days");
  const topN = asPositiveInt(parseFlag("--top-n"), 10);
  const maxHistory = asPositiveInt(parseFlag("--max-history"), 30);
  const minImpressions = asPositiveInt(parseFlag("--min-impressions"), 20);

  const generatedAt = new Date().toISOString();
  const runId = `${timestampId(new Date())}-seo-tracking`;
  const artifactDir = path.join(outDir, runId);
  const historyPath = path.join(outDir, "history.json");

  mkdirSync(artifactDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });

  const rawPerformanceCsv = readFileSync(csvPath, "utf8");
  const performanceRows = parseSearchPerformanceCsv(rawPerformanceCsv);
  const currentPerformance = buildSearchPerformanceSnapshot({
    generatedAt,
    property,
    windowLabel,
    rows: performanceRows,
  });

  const history = loadHistory(historyPath, property);
  const samePropertyHistory = history.snapshots.filter(
    (snapshot) => (snapshot.property || history.property) === property,
  );
  const previous = samePropertyHistory.at(-1) || null;

  const performanceMovement = compareSearchPerformanceSnapshots({
    current: currentPerformance,
    previous: previous?.performance || null,
    topN,
    minImpressions,
  });

  let currentIndexing: IndexCoverageSnapshot | null = null;
  let indexingMovement = null;
  if (indexingCsvPath) {
    const rawIndexingCsv = readFileSync(indexingCsvPath, "utf8");
    const indexingRows = parseIndexCoverageCsv(rawIndexingCsv);
    currentIndexing = buildIndexCoverageSnapshot({
      generatedAt,
      property,
      rows: indexingRows,
    });
    indexingMovement = compareIndexCoverageSnapshots({
      current: currentIndexing,
      previous: previous?.indexing || null,
      topN,
    });
    copyFileSync(indexingCsvPath, path.join(artifactDir, "raw-indexing.csv"));
  }

  const summaryText = buildSeoTrackingSummaryText({
    current: currentPerformance,
    movement: performanceMovement,
    indexingCurrent: currentIndexing,
    indexingMovement,
  });

  copyFileSync(csvPath, path.join(artifactDir, "raw-performance.csv"));
  writeFileSync(path.join(artifactDir, "performance.snapshot.json"), JSON.stringify(currentPerformance, null, 2));
  writeFileSync(path.join(artifactDir, "performance.movement.json"), JSON.stringify(performanceMovement, null, 2));
  if (currentIndexing) {
    writeFileSync(path.join(artifactDir, "indexing.snapshot.json"), JSON.stringify(currentIndexing, null, 2));
  }
  if (indexingMovement) {
    writeFileSync(path.join(artifactDir, "indexing.movement.json"), JSON.stringify(indexingMovement, null, 2));
  }
  writeFileSync(path.join(artifactDir, "summary.txt"), `${summaryText}\n`);

  const nextHistory: TrackingHistory = {
    property,
    snapshots: [
      ...history.snapshots,
      {
        id: runId,
        generatedAt,
        property,
        windowLabel,
        performance: currentPerformance,
        indexing: currentIndexing,
      },
    ].slice(-maxHistory),
  };
  writeFileSync(historyPath, JSON.stringify(nextHistory, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: true,
        property,
        generatedAt,
        artifactDir,
        historyPath,
        windowLabel,
        comparedWith: previous?.generatedAt || null,
        performance: {
          totals: currentPerformance.totals,
          movementSummary: performanceMovement.summary,
        },
        indexing: currentIndexing
          ? {
              totals: currentIndexing.totals,
              movementSummary: indexingMovement?.summary || null,
            }
          : null,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[run-seo-tracking] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
