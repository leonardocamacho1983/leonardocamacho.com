import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  analyzeGrowthKpiStability,
  buildGrowthKpiStabilityReportText,
  type GrowthKpiHistory,
} from "./lib/growth-kpi-stability.ts";

const parseFlag = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const withDefault = (value: string | undefined, fallback: string): string => {
  const clean = (value || "").trim();
  return clean || fallback;
};

const asPositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat((value || "").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const asPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt((value || "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
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

const loadHistory = (historyPath: string): GrowthKpiHistory => {
  if (!existsSync(historyPath)) {
    throw new Error(`Growth history file not found: ${historyPath}`);
  }

  const raw = JSON.parse(readFileSync(historyPath, "utf8")) as Partial<GrowthKpiHistory>;
  if (!raw || !Array.isArray(raw.snapshots)) {
    throw new Error(`Invalid growth history format in: ${historyPath}`);
  }

  return {
    property: typeof raw.property === "string" ? raw.property : "",
    snapshots: raw.snapshots as GrowthKpiHistory["snapshots"],
  };
};

const main = async (): Promise<void> => {
  const outDir = withDefault(parseFlag("--out-dir"), "/tmp/growth-kpi");
  const historyPath = withDefault(parseFlag("--history"), path.join(outDir, "history.json"));
  const property = withDefault(
    parseFlag("--property"),
    sanitizeHost(process.env.PUBLIC_SITE_URL || "leonardocamacho.com"),
  );
  const requiredCycles = asPositiveInt(parseFlag("--required-cycles"), 3);
  const minConversionVisitors = asPositiveInt(parseFlag("--min-conversion-visitors"), 60);
  const maxVisitorToSignupVolatilityPp = asPositiveNumber(
    parseFlag("--max-visitor-cvr-volatility-pp"),
    2,
  );
  const maxSignupUsersCv = asPositiveNumber(parseFlag("--max-signup-cv"), 0.35);
  const maxDepthRateVolatilityPp = asPositiveNumber(parseFlag("--max-depth-volatility-pp"), 12);

  const generatedAt = new Date().toISOString();
  const runId = `${timestampId(new Date())}-growth-kpi-stability`;
  const artifactDir = path.join(outDir, runId);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(artifactDir, { recursive: true });

  const history = loadHistory(historyPath);
  const analysis = analyzeGrowthKpiStability(history, {
    property,
    requiredCycles,
    minConversionVisitors,
    maxVisitorToSignupVolatilityPp,
    maxSignupUsersCv,
    maxDepthRateVolatilityPp,
  });
  const report = buildGrowthKpiStabilityReportText(analysis);

  writeFileSync(
    path.join(artifactDir, "summary.json"),
    JSON.stringify(
      {
        generatedAt,
        historyPath,
        analysis,
      },
      null,
      2,
    ),
  );
  writeFileSync(path.join(artifactDir, "report.txt"), report);

  console.log(
    JSON.stringify(
      {
        ok: true,
        generatedAt,
        historyPath,
        artifactDir,
        status: analysis.status,
        ready: analysis.ready,
        cyclesConsidered: analysis.cyclesConsidered,
        requiredCycles: analysis.requiredCycles,
        noiseFlags: analysis.noiseFlags,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(
    "[run-growth-kpi-stabilization] Failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
