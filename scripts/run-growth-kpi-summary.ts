import "dotenv/config";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  buildGrowthKpiSnapshot,
  buildGrowthKpiSummaryText,
  compareGrowthKpiSnapshots,
  parseGrowthEvents,
  type GrowthEventRecord,
  type GrowthKpiSnapshot,
} from "./lib/growth-kpi.ts";

interface GrowthKpiHistory {
  property: string;
  snapshots: Array<{
    id: string;
    generatedAt: string;
    property: string;
    windowLabel: string;
    snapshot: GrowthKpiSnapshot;
  }>;
}

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  return process.argv[index + 1];
};

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

const withDefault = (value: string | undefined, fallback: string): string => {
  const trimmed = (value || "").trim();
  return trimmed || fallback;
};

const sanitizeHost = (value: string): string => value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

const asPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt((value || "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const timestampId = (date: Date): string => {
  const yyyy = `${date.getFullYear()}`;
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");
  const sec = `${date.getSeconds()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${min}${sec}`;
};

const loadHistory = (historyPath: string, property: string): GrowthKpiHistory => {
  if (!existsSync(historyPath)) {
    return { property, snapshots: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(historyPath, "utf8")) as Partial<GrowthKpiHistory>;
    if (!raw || !Array.isArray(raw.snapshots)) {
      return { property, snapshots: [] };
    }
    return {
      property: typeof raw.property === "string" && raw.property ? raw.property : property,
      snapshots: raw.snapshots as GrowthKpiHistory["snapshots"],
    };
  } catch {
    return { property, snapshots: [] };
  }
};

const formatHintFromPath = (filePath: string): "csv" | "json" | "ndjson" => {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  return "ndjson";
};

const main = async (): Promise<void> => {
  const eventPaths = parseMultiFlag("--events");
  if (eventPaths.length === 0) {
    throw new Error("Missing --events <path>. Repeat --events for multiple exports.");
  }

  const outDir = withDefault(parseFlag("--out-dir"), "/tmp/growth-kpi");
  const property = withDefault(
    parseFlag("--property"),
    sanitizeHost(process.env.PUBLIC_SITE_URL || "leonardocamacho.com"),
  );
  const windowLabel = withDefault(parseFlag("--window"), "last-28-days");
  const windowDays = asPositiveInt(parseFlag("--days"), 28);
  const topN = asPositiveInt(parseFlag("--top-n"), 10);
  const maxHistory = asPositiveInt(parseFlag("--max-history"), 26);
  const sessionGapMinutes = asPositiveInt(parseFlag("--session-gap-minutes"), 30);
  const generatedAt = new Date().toISOString();
  const runId = `${timestampId(new Date())}-growth-kpi`;
  const artifactDir = path.join(outDir, runId);
  const historyPath = path.join(outDir, "history.json");

  mkdirSync(outDir, { recursive: true });
  mkdirSync(artifactDir, { recursive: true });

  const allEvents: GrowthEventRecord[] = [];
  for (const eventPath of eventPaths) {
    const raw = readFileSync(eventPath, "utf8");
    const formatHint = formatHintFromPath(eventPath);
    const parsed = parseGrowthEvents(raw, formatHint);
    allEvents.push(...parsed);
  }

  allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const snapshot = buildGrowthKpiSnapshot({
    generatedAt,
    property,
    windowLabel,
    windowDays,
    records: allEvents,
    topN,
    sessionGapMinutes,
  });

  const history = loadHistory(historyPath, property);
  const samePropertyHistory = history.snapshots.filter(
    (item) => (item.property || history.property) === property,
  );
  const previous = samePropertyHistory.at(-1)?.snapshot || null;
  const movement = compareGrowthKpiSnapshots({
    current: snapshot,
    previous,
  });
  const summaryText = buildGrowthKpiSummaryText({ snapshot, movement });

  eventPaths.forEach((eventPath, index) => {
    const sourceName = path.basename(eventPath);
    const targetName = `${`${index + 1}`.padStart(2, "0")}-${sourceName}`;
    copyFileSync(eventPath, path.join(artifactDir, targetName));
  });

  writeFileSync(path.join(artifactDir, "snapshot.json"), JSON.stringify(snapshot, null, 2));
  writeFileSync(path.join(artifactDir, "movement.json"), JSON.stringify(movement, null, 2));
  writeFileSync(path.join(artifactDir, "summary.txt"), `${summaryText}\n`);

  const nextHistory: GrowthKpiHistory = {
    property,
    snapshots: [
      ...history.snapshots,
      {
        id: runId,
        generatedAt,
        property,
        windowLabel,
        snapshot,
      },
    ].slice(-maxHistory),
  };
  writeFileSync(historyPath, JSON.stringify(nextHistory, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: true,
        generatedAt,
        property,
        artifactDir,
        historyPath,
        eventSources: eventPaths.length,
        totals: snapshot.totals,
        kpis: snapshot.kpis,
        comparedWith: movement.previousGeneratedAt,
        movementSummary: movement.summary,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[run-growth-kpi-summary] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
