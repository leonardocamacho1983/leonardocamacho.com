export interface SearchPerformanceRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformanceTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  rows: number;
}

export interface SearchPerformanceSnapshot {
  generatedAt: string;
  property: string;
  windowLabel: string;
  totals: SearchPerformanceTotals;
  rows: SearchPerformanceRow[];
}

export interface QueryMovement {
  key: string;
  query: string;
  page: string;
  current: SearchPerformanceRow;
  previous: SearchPerformanceRow | null;
  delta: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

export interface SearchPerformanceMovement {
  compared: boolean;
  previousGeneratedAt: string | null;
  summary: {
    totalClicksDelta: number;
    totalImpressionsDelta: number;
    totalCtrDelta: number;
    totalPositionDelta: number;
    currentRows: number;
    previousRows: number;
  };
  topClickGainers: QueryMovement[];
  topClickDecliners: QueryMovement[];
  topPositionImprovements: QueryMovement[];
  topPositionRegressions: QueryMovement[];
  newRows: QueryMovement[];
  droppedRows: Array<{
    key: string;
    query: string;
    page: string;
    previous: SearchPerformanceRow;
  }>;
}

export interface IndexCoverageRow {
  reason: string;
  pages: number;
}

export interface IndexCoverageSnapshot {
  generatedAt: string;
  property: string;
  totals: {
    pages: number;
    reasons: number;
  };
  rows: IndexCoverageRow[];
}

export interface IndexCoverageMovement {
  compared: boolean;
  previousGeneratedAt: string | null;
  summary: {
    totalPagesDelta: number;
    currentReasons: number;
    previousReasons: number;
  };
  topPageGainers: Array<{
    reason: string;
    currentPages: number;
    previousPages: number;
    deltaPages: number;
  }>;
  topPageDecliners: Array<{
    reason: string;
    currentPages: number;
    previousPages: number;
    deltaPages: number;
  }>;
}

const clean = (value: string): string => value.trim();

const normalizeHeader = (value: string): string =>
  clean(value)
    .toLowerCase()
    .replace(/[%()]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const parseNumber = (value: string): number => {
  const normalized = clean(value).replace(/,/g, "");
  if (!normalized) return 0;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseCtr = (value: string): number => {
  const raw = clean(value);
  if (!raw) return 0;
  if (raw.endsWith("%")) {
    return parseNumber(raw.slice(0, -1)) / 100;
  }
  const parsed = parseNumber(raw);
  if (parsed > 1 && parsed <= 100) {
    return parsed / 100;
  }
  return parsed;
};

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const toCsvRows = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      const hasContent = row.some((cell) => clean(cell).length > 0);
      if (hasContent) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  const hasContent = row.some((cell) => clean(cell).length > 0);
  if (hasContent) {
    rows.push(row);
  }

  return rows;
};

const requiredHeader = (
  headerMap: Map<string, number>,
  names: string[],
  label: string,
): number => {
  for (const name of names) {
    const idx = headerMap.get(normalizeHeader(name));
    if (typeof idx === "number") {
      return idx;
    }
  }
  throw new Error(`Missing required CSV column: ${label}`);
};

const keyForPerformance = (query: string, page: string): string =>
  `${query.toLowerCase()}||${page.toLowerCase()}`;

export const parseSearchPerformanceCsv = (csv: string): SearchPerformanceRow[] => {
  const rows = toCsvRows(csv);
  if (rows.length < 2) {
    throw new Error("Search performance CSV must include a header row and at least one data row.");
  }

  const header = rows[0].map((cell) => normalizeHeader(cell));
  const headerMap = new Map<string, number>();
  header.forEach((name, index) => headerMap.set(name, index));

  const queryIndex = requiredHeader(headerMap, ["query"], "query");
  const pageIndex = requiredHeader(headerMap, ["page", "url"], "page");
  const clicksIndex = requiredHeader(headerMap, ["clicks"], "clicks");
  const impressionsIndex = requiredHeader(headerMap, ["impressions"], "impressions");
  const ctrIndex = requiredHeader(headerMap, ["ctr"], "ctr");
  const positionIndex = requiredHeader(headerMap, ["position", "avgposition"], "position");

  const aggregate = new Map<
    string,
    {
      query: string;
      page: string;
      clicks: number;
      impressions: number;
      positionNumerator: number;
      positionWeight: number;
    }
  >();

  for (const rawRow of rows.slice(1)) {
    const query = clean(rawRow[queryIndex] || "");
    const page = clean(rawRow[pageIndex] || "");
    if (!query || !page) {
      continue;
    }

    const clicks = parseNumber(rawRow[clicksIndex] || "");
    const impressions = parseNumber(rawRow[impressionsIndex] || "");
    const position = parseNumber(rawRow[positionIndex] || "");
    const ctr = parseCtr(rawRow[ctrIndex] || "");

    const key = keyForPerformance(query, page);
    const existing = aggregate.get(key) || {
      query,
      page,
      clicks: 0,
      impressions: 0,
      positionNumerator: 0,
      positionWeight: 0,
    };

    existing.clicks += clicks;
    existing.impressions += impressions;
    if (impressions > 0) {
      existing.positionNumerator += position * impressions;
      existing.positionWeight += impressions;
    } else if (position > 0) {
      // If impressions are missing, approximate with one unit of weight.
      existing.positionNumerator += position;
      existing.positionWeight += 1;
    }

    // Recompute CTR from totals to avoid inconsistencies in source export.
    if (existing.impressions === 0 && ctr > 0) {
      existing.impressions = Math.max(existing.impressions, 1);
      existing.clicks = Math.max(existing.clicks, ctr);
    }

    aggregate.set(key, existing);
  }

  return Array.from(aggregate.values())
    .map((item) => {
      const ctr = item.impressions > 0 ? item.clicks / item.impressions : 0;
      const position = item.positionWeight > 0 ? item.positionNumerator / item.positionWeight : 0;
      return {
        query: item.query,
        page: item.page,
        clicks: round(item.clicks, 2),
        impressions: round(item.impressions, 2),
        ctr: round(ctr, 4),
        position: round(position, 2),
      };
    })
    .sort((a, b) => {
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      if (b.impressions !== a.impressions) return b.impressions - a.impressions;
      return a.position - b.position;
    });
};

export const buildSearchPerformanceSnapshot = (input: {
  generatedAt: string;
  property: string;
  windowLabel: string;
  rows: SearchPerformanceRow[];
}): SearchPerformanceSnapshot => {
  const totals = input.rows.reduce(
    (acc, row) => {
      acc.clicks += row.clicks;
      acc.impressions += row.impressions;
      acc.positionNumerator += row.position * row.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0, positionNumerator: 0 },
  );

  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const position = totals.impressions > 0 ? totals.positionNumerator / totals.impressions : 0;

  return {
    generatedAt: input.generatedAt,
    property: input.property,
    windowLabel: input.windowLabel,
    totals: {
      clicks: round(totals.clicks, 2),
      impressions: round(totals.impressions, 2),
      ctr: round(ctr, 4),
      position: round(position, 2),
      rows: input.rows.length,
    },
    rows: input.rows,
  };
};

export const compareSearchPerformanceSnapshots = (input: {
  current: SearchPerformanceSnapshot;
  previous: SearchPerformanceSnapshot | null;
  topN?: number;
  minImpressions?: number;
}): SearchPerformanceMovement => {
  const topN = Math.max(1, input.topN ?? 10);
  const minImpressions = Math.max(0, input.minImpressions ?? 20);
  const previous = input.previous;
  if (!previous) {
    return {
      compared: false,
      previousGeneratedAt: null,
      summary: {
        totalClicksDelta: 0,
        totalImpressionsDelta: 0,
        totalCtrDelta: 0,
        totalPositionDelta: 0,
        currentRows: input.current.rows.length,
        previousRows: 0,
      },
      topClickGainers: [],
      topClickDecliners: [],
      topPositionImprovements: [],
      topPositionRegressions: [],
      newRows: [],
      droppedRows: [],
    };
  }

  const previousByKey = new Map(previous.rows.map((row) => [keyForPerformance(row.query, row.page), row]));
  const currentByKey = new Map(input.current.rows.map((row) => [keyForPerformance(row.query, row.page), row]));

  const movements: QueryMovement[] = [];
  for (const row of input.current.rows) {
    const key = keyForPerformance(row.query, row.page);
    const prev = previousByKey.get(key) || null;
    const prevClicks = prev?.clicks || 0;
    const prevImpressions = prev?.impressions || 0;
    const prevCtr = prev?.ctr || 0;
    const prevPosition = prev?.position || 0;
    movements.push({
      key,
      query: row.query,
      page: row.page,
      current: row,
      previous: prev,
      delta: {
        clicks: round(row.clicks - prevClicks, 2),
        impressions: round(row.impressions - prevImpressions, 2),
        ctr: round(row.ctr - prevCtr, 4),
        position: round(row.position - prevPosition, 2),
      },
    });
  }

  const filteredForPosition = movements.filter(
    (row) => (row.current.impressions + (row.previous?.impressions || 0)) / 2 >= minImpressions,
  );

  const newRows = movements
    .filter((row) => row.previous === null && row.current.impressions >= minImpressions)
    .sort((a, b) => b.current.clicks - a.current.clicks)
    .slice(0, topN);

  const droppedRows = previous.rows
    .filter((row) => !currentByKey.has(keyForPerformance(row.query, row.page)) && row.impressions >= minImpressions)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, topN)
    .map((row) => ({
      key: keyForPerformance(row.query, row.page),
      query: row.query,
      page: row.page,
      previous: row,
    }));

  return {
    compared: true,
    previousGeneratedAt: previous.generatedAt,
    summary: {
      totalClicksDelta: round(input.current.totals.clicks - previous.totals.clicks, 2),
      totalImpressionsDelta: round(input.current.totals.impressions - previous.totals.impressions, 2),
      totalCtrDelta: round(input.current.totals.ctr - previous.totals.ctr, 4),
      totalPositionDelta: round(input.current.totals.position - previous.totals.position, 2),
      currentRows: input.current.rows.length,
      previousRows: previous.rows.length,
    },
    topClickGainers: [...movements]
      .sort((a, b) => b.delta.clicks - a.delta.clicks)
      .filter((row) => row.delta.clicks > 0)
      .slice(0, topN),
    topClickDecliners: [...movements]
      .sort((a, b) => a.delta.clicks - b.delta.clicks)
      .filter((row) => row.delta.clicks < 0)
      .slice(0, topN),
    topPositionImprovements: [...filteredForPosition]
      .sort((a, b) => a.delta.position - b.delta.position)
      .filter((row) => row.delta.position < 0)
      .slice(0, topN),
    topPositionRegressions: [...filteredForPosition]
      .sort((a, b) => b.delta.position - a.delta.position)
      .filter((row) => row.delta.position > 0)
      .slice(0, topN),
    newRows,
    droppedRows,
  };
};

export const parseIndexCoverageCsv = (csv: string): IndexCoverageRow[] => {
  const rows = toCsvRows(csv);
  if (rows.length < 2) {
    throw new Error("Index coverage CSV must include a header row and at least one data row.");
  }

  const header = rows[0].map((cell) => normalizeHeader(cell));
  const headerMap = new Map<string, number>();
  header.forEach((name, index) => headerMap.set(name, index));

  const reasonIndex = requiredHeader(headerMap, ["reason", "status", "state"], "reason");
  const pagesIndex = requiredHeader(headerMap, ["pages", "count", "urls"], "pages");

  const aggregate = new Map<string, number>();
  for (const rawRow of rows.slice(1)) {
    const reason = clean(rawRow[reasonIndex] || "");
    if (!reason) continue;
    const pages = parseNumber(rawRow[pagesIndex] || "");
    aggregate.set(reason, (aggregate.get(reason) || 0) + pages);
  }

  return Array.from(aggregate.entries())
    .map(([reason, pages]) => ({ reason, pages: round(pages, 2) }))
    .sort((a, b) => b.pages - a.pages);
};

export const buildIndexCoverageSnapshot = (input: {
  generatedAt: string;
  property: string;
  rows: IndexCoverageRow[];
}): IndexCoverageSnapshot => {
  const pages = input.rows.reduce((acc, row) => acc + row.pages, 0);
  return {
    generatedAt: input.generatedAt,
    property: input.property,
    totals: {
      pages: round(pages, 2),
      reasons: input.rows.length,
    },
    rows: input.rows,
  };
};

export const compareIndexCoverageSnapshots = (input: {
  current: IndexCoverageSnapshot;
  previous: IndexCoverageSnapshot | null;
  topN?: number;
}): IndexCoverageMovement => {
  const topN = Math.max(1, input.topN ?? 10);
  const previous = input.previous;
  if (!previous) {
    return {
      compared: false,
      previousGeneratedAt: null,
      summary: {
        totalPagesDelta: 0,
        currentReasons: input.current.rows.length,
        previousReasons: 0,
      },
      topPageGainers: [],
      topPageDecliners: [],
    };
  }

  const previousByReason = new Map(previous.rows.map((row) => [row.reason, row.pages]));
  const movements = input.current.rows.map((row) => {
    const previousPages = previousByReason.get(row.reason) || 0;
    return {
      reason: row.reason,
      currentPages: row.pages,
      previousPages: round(previousPages, 2),
      deltaPages: round(row.pages - previousPages, 2),
    };
  });

  return {
    compared: true,
    previousGeneratedAt: previous.generatedAt,
    summary: {
      totalPagesDelta: round(input.current.totals.pages - previous.totals.pages, 2),
      currentReasons: input.current.rows.length,
      previousReasons: previous.rows.length,
    },
    topPageGainers: [...movements]
      .filter((row) => row.deltaPages > 0)
      .sort((a, b) => b.deltaPages - a.deltaPages)
      .slice(0, topN),
    topPageDecliners: [...movements]
      .filter((row) => row.deltaPages < 0)
      .sort((a, b) => a.deltaPages - b.deltaPages)
      .slice(0, topN),
  };
};

const fmt = (value: number, digits: number): string => value.toFixed(digits);

export const buildSeoTrackingSummaryText = (input: {
  current: SearchPerformanceSnapshot;
  movement: SearchPerformanceMovement;
  indexingCurrent?: IndexCoverageSnapshot | null;
  indexingMovement?: IndexCoverageMovement | null;
}): string => {
  const lines: string[] = [];
  lines.push("SEO Tracking Summary");
  lines.push(`Generated: ${input.current.generatedAt}`);
  lines.push(`Property: ${input.current.property}`);
  lines.push(`Window: ${input.current.windowLabel}`);
  lines.push("");
  lines.push("Search performance:");
  lines.push(`- clicks: ${fmt(input.current.totals.clicks, 2)}`);
  lines.push(`- impressions: ${fmt(input.current.totals.impressions, 2)}`);
  lines.push(`- ctr: ${fmt(input.current.totals.ctr * 100, 2)}%`);
  lines.push(`- avg position: ${fmt(input.current.totals.position, 2)}`);
  lines.push(`- tracked rows: ${input.current.totals.rows}`);

  if (input.movement.compared) {
    lines.push("");
    lines.push(`Vs previous snapshot (${input.movement.previousGeneratedAt}):`);
    lines.push(`- clicks delta: ${fmt(input.movement.summary.totalClicksDelta, 2)}`);
    lines.push(`- impressions delta: ${fmt(input.movement.summary.totalImpressionsDelta, 2)}`);
    lines.push(`- ctr delta: ${fmt(input.movement.summary.totalCtrDelta * 100, 2)} pp`);
    lines.push(`- position delta: ${fmt(input.movement.summary.totalPositionDelta, 2)} (negative is better)`);
    lines.push(`- new rows: ${input.movement.newRows.length}`);
    lines.push(`- dropped rows: ${input.movement.droppedRows.length}`);
  } else {
    lines.push("");
    lines.push("Vs previous snapshot: baseline only (no previous snapshot found).");
  }

  if (input.movement.topClickGainers.length > 0) {
    lines.push("");
    lines.push("Top click gainers:");
    for (const row of input.movement.topClickGainers.slice(0, 5)) {
      lines.push(`- +${fmt(row.delta.clicks, 2)} clicks | ${row.query} | ${row.page}`);
    }
  }

  if (input.movement.topPositionImprovements.length > 0) {
    lines.push("");
    lines.push("Top position improvements:");
    for (const row of input.movement.topPositionImprovements.slice(0, 5)) {
      lines.push(`- ${fmt(row.delta.position, 2)} | ${row.query} | ${row.page}`);
    }
  }

  if (input.indexingCurrent) {
    lines.push("");
    lines.push("Index coverage:");
    lines.push(`- tracked reasons: ${input.indexingCurrent.totals.reasons}`);
    lines.push(`- pages total: ${fmt(input.indexingCurrent.totals.pages, 2)}`);
    if (input.indexingMovement?.compared) {
      lines.push(`- pages delta vs previous: ${fmt(input.indexingMovement.summary.totalPagesDelta, 2)}`);
    }
  }

  return lines.join("\n");
};
