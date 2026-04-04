import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  buildIndexCoverageSnapshot,
  buildSearchPerformanceSnapshot,
  compareIndexCoverageSnapshots,
  compareSearchPerformanceSnapshots,
  parseIndexCoverageCsv,
  parseSearchPerformanceCsv,
} from "./lib/seo-tracking.ts";

const readFixture = (name: string): string =>
  readFileSync(path.resolve(process.cwd(), "scripts/fixtures/seo-tracking", name), "utf8");

const main = (): void => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "seo-tracking-smoke-"));
  try {
    const previousRows = parseSearchPerformanceCsv(readFixture("performance-previous.csv"));
    const currentRows = parseSearchPerformanceCsv(readFixture("performance-current.csv"));

    const previous = buildSearchPerformanceSnapshot({
      generatedAt: "2026-03-20T00:00:00.000Z",
      property: "example.com",
      windowLabel: "last-28-days",
      rows: previousRows,
    });
    const current = buildSearchPerformanceSnapshot({
      generatedAt: "2026-03-30T00:00:00.000Z",
      property: "example.com",
      windowLabel: "last-28-days",
      rows: currentRows,
    });

    const movement = compareSearchPerformanceSnapshots({
      current,
      previous,
      topN: 5,
      minImpressions: 10,
    });
    assert.equal(movement.compared, true, "performance movement should compare against previous snapshot");
    assert.ok(movement.summary.totalClicksDelta > 0, "expected click growth");
    assert.ok(movement.topClickGainers.some((row) => row.query === "approval delay"), "missing approval gain");
    assert.ok(movement.newRows.some((row) => row.query === "decision speed"), "missing new query row");
    assert.ok(movement.droppedRows.some((row) => row.query === "legacy process"), "missing dropped row");

    const previousIndexingRows = parseIndexCoverageCsv(readFixture("indexing-previous.csv"));
    const currentIndexingRows = parseIndexCoverageCsv(readFixture("indexing-current.csv"));
    const previousIndexing = buildIndexCoverageSnapshot({
      generatedAt: "2026-03-20T00:00:00.000Z",
      property: "example.com",
      rows: previousIndexingRows,
    });
    const currentIndexing = buildIndexCoverageSnapshot({
      generatedAt: "2026-03-30T00:00:00.000Z",
      property: "example.com",
      rows: currentIndexingRows,
    });
    const indexingMovement = compareIndexCoverageSnapshots({
      current: currentIndexing,
      previous: previousIndexing,
      topN: 5,
    });
    assert.equal(indexingMovement.compared, true, "indexing movement should compare against previous snapshot");
    assert.ok(indexingMovement.topPageGainers.some((row) => row.reason === "Indexed"), "missing indexed gain");
    assert.ok(
      indexingMovement.topPageDecliners.some((row) => row.reason === "Crawled - currently not indexed"),
      "missing crawled decline",
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          checks: [
            "performance-csv-parse",
            "performance-movement-delta",
            "performance-new-and-dropped-rows",
            "indexing-csv-parse",
            "indexing-movement-delta",
          ],
          tempDir: tmpDir,
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
};

main();
