export type GrowthSurfaceType =
  | "launch"
  | "home"
  | "writing_index"
  | "article"
  | "welcome"
  | "confirmed"
  | "other";

export interface GrowthEventRecord {
  timestamp: string;
  event: string;
  distinctId: string | null;
  locale: string | null;
  path: string | null;
  source: string | null;
  surfaceType: GrowthSurfaceType;
  postSlug: string | null;
  translationKey: string | null;
  properties: Record<string, unknown>;
}

export interface GrowthKpiLocaleSummary {
  locale: string;
  conversionVisitors: number;
  signupUsers: number;
  visitorToSignupCvr: number;
  articleReaders: number;
  articleSignupUsers: number;
  articleToSignupCvr: number;
}

export interface GrowthKpiArticleSummary {
  slug: string;
  readerUsers: number;
  signupUsers: number;
  articleToSignupCvr: number;
}

export interface GrowthAnalyticsDomainBreakdown {
  growth: number;
  editorial: number;
  other: number;
  untagged: number;
}

export interface GrowthKpiSnapshot {
  generatedAt: string;
  property: string;
  windowLabel: string;
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  domainBreakdown: GrowthAnalyticsDomainBreakdown;
  totals: {
    records: number;
    recordsInWindow: number;
    uniqueUsers: number;
  };
  funnel: {
    welcomeViews: number;
    confirmedViews: number;
  };
  kpis: {
    visitorToSignupCvr: number;
    articleToSignupCvr: number;
    welcomeProgressRate: number;
    returnReaderRate14d: number;
    depthRate: number;
  };
  counters: {
    conversionVisitors: number;
    signupUsers: number;
    articleReaders: number;
    articleSignupUsers: number;
    returnReaders14d: number;
    totalContentReaders: number;
    sessionsWith2PlusContentEvents: number;
    totalContentSessions: number;
  };
  locales: GrowthKpiLocaleSummary[];
  topConvertingArticles: GrowthKpiArticleSummary[];
  eventCounts: Record<string, number>;
}

export interface GrowthKpiMovement {
  compared: boolean;
  previousGeneratedAt: string | null;
  summary: {
    visitorToSignupCvrDelta: number;
    articleToSignupCvrDelta: number;
    welcomeProgressRateDelta: number;
    returnReaderRate14dDelta: number;
    depthRateDelta: number;
    conversionVisitorsDelta: number;
    signupUsersDelta: number;
  };
  localeDeltas: Array<{
    locale: string;
    visitorToSignupCvrDelta: number;
    conversionVisitorsDelta: number;
    signupUsersDelta: number;
  }>;
}

const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clean = (value: string): string => value.trim();

const normalizeHeader = (value: string): string =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const parseIso = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
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
      if (row.some((cell) => clean(cell).length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => clean(cell).length > 0)) {
    rows.push(row);
  }
  return rows;
};

const readObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const parseMaybeJsonObject = (value: unknown): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
};

const asString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const getProperty = (properties: Record<string, unknown>, ...keys: string[]): string | null => {
  for (const key of keys) {
    const direct = asString(properties[key]);
    if (direct) return direct;
  }
  return null;
};

const localeFromPath = (path: string | null): string | null => {
  if (!path) return null;
  const match = path.match(/^\/(en-us|en-gb|pt-br|pt-pt|fr-fr)(?:\/|$)/);
  return match ? match[1] : null;
};

const pathFromValue = (value: string | null): string | null => {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try {
    return new URL(value).pathname || null;
  } catch {
    return null;
  }
};

const inferSurfaceType = (path: string | null, explicit: string | null): GrowthSurfaceType => {
  const normalizedExplicit = (explicit || "").toLowerCase();
  if (
    normalizedExplicit === "launch" ||
    normalizedExplicit === "home" ||
    normalizedExplicit === "writing_index" ||
    normalizedExplicit === "article" ||
    normalizedExplicit === "welcome" ||
    normalizedExplicit === "confirmed" ||
    normalizedExplicit === "other"
  ) {
    return normalizedExplicit;
  }

  if (!path) return "other";
  if (/^\/(en-us|en-gb|pt-br|pt-pt|fr-fr)$/.test(path)) return "launch";
  if (/^\/(en-us|en-gb|pt-br|pt-pt|fr-fr)\/writing$/.test(path)) return "writing_index";
  if (/^\/(en-us|en-gb|pt-br|pt-pt|fr-fr)\/writing\/[^/]+$/.test(path)) return "article";
  if (/^\/(?:welcome|pt-br\/welcome|pt\/welcome|fr\/welcome)$/.test(path)) return "welcome";
  if (/^\/(?:confirmed|pt-br\/confirmed|pt\/confirmed|fr\/confirmed)$/.test(path)) return "confirmed";
  return "other";
};

const slugFromPath = (path: string | null): string | null => {
  if (!path) return null;
  const match = path.match(/^\/(?:en-us|en-gb|pt-br|pt-pt|fr-fr)\/writing\/([^/]+)$/);
  return match ? match[1] : null;
};

const normalizeEventRecord = (raw: Record<string, unknown>): GrowthEventRecord | null => {
  const event = asString(raw.event) || asString(raw.event_name) || asString(raw.name);
  const timestamp =
    parseIso(asString(raw.timestamp) || asString(raw.created_at) || asString(raw.time)) ||
    parseIso(asString(raw["$timestamp"]));
  if (!event || !timestamp) return null;

  const rootProperties = readObject(raw.properties);
  const properties = {
    ...rootProperties,
    ...parseMaybeJsonObject(raw["$properties"]),
  };

  const distinctId =
    asString(raw.distinct_id) ||
    asString(raw.distinctId) ||
    asString(raw.person_id) ||
    getProperty(properties, "distinct_id", "$distinct_id");

  const path = pathFromValue(
    asString(raw.path) ||
      getProperty(
        properties,
        "path",
        "page_path",
        "$pathname",
        "$current_url",
        "current_url",
        "url",
      ),
  );

  const locale = asString(raw.locale) || getProperty(properties, "locale", "$locale") || localeFromPath(path);
  const source = asString(raw.source) || getProperty(properties, "source");
  const surfaceType = inferSurfaceType(
    path,
    asString(raw.surface_type) || getProperty(properties, "surface_type"),
  );
  const postSlug = asString(raw.post_slug) || getProperty(properties, "post_slug") || slugFromPath(path);
  const translationKey = asString(raw.translation_key) || getProperty(properties, "translation_key");

  return {
    timestamp,
    event,
    distinctId,
    locale,
    path,
    source,
    surfaceType,
    postSlug,
    translationKey,
    properties,
  };
};

export const parseGrowthEventsNdjson = (raw: string): GrowthEventRecord[] =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => normalizeEventRecord(item))
    .filter((item): item is GrowthEventRecord => Boolean(item))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

export const parseGrowthEventsJson = (raw: string): GrowthEventRecord[] => {
  const parsed = JSON.parse(raw) as unknown;
  const rows = Array.isArray(parsed) ? parsed : [];
  return rows
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((row) => normalizeEventRecord(row))
    .filter((item): item is GrowthEventRecord => Boolean(item))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export const parseGrowthEventsCsv = (raw: string): GrowthEventRecord[] => {
  const rows = toCsvRows(raw);
  if (rows.length < 2) {
    throw new Error("Growth CSV must include header and at least one row.");
  }

  const header = rows[0].map((cell) => normalizeHeader(cell));
  const headerMap = new Map<string, number>();
  header.forEach((name, index) => headerMap.set(name, index));

  const readCell = (row: string[], ...candidates: string[]): string => {
    for (const candidate of candidates) {
      const index = headerMap.get(normalizeHeader(candidate));
      if (typeof index === "number") {
        return row[index] || "";
      }
    }
    return "";
  };

  const out: GrowthEventRecord[] = [];
  for (const row of rows.slice(1)) {
    const properties: Record<string, unknown> = {
      ...parseMaybeJsonObject(readCell(row, "properties")),
    };

    for (let index = 0; index < header.length; index += 1) {
      const key = header[index];
      if (!key.startsWith("properties")) continue;
      const rawKey = rows[0][index] || "";
      const dotted = rawKey.replace(/^properties\./i, "");
      if (!dotted) continue;
      const value = clean(row[index] || "");
      if (!value) continue;
      if (properties[dotted] === undefined) {
        properties[dotted] = value;
      }
    }

    const normalized = normalizeEventRecord({
      event: readCell(row, "event", "event_name", "name"),
      timestamp: readCell(row, "timestamp", "created_at", "time"),
      distinct_id: readCell(row, "distinct_id", "distinctid", "person_id"),
      locale: readCell(row, "locale"),
      source: readCell(row, "source"),
      surface_type: readCell(row, "surface_type"),
      path: readCell(row, "path", "page_path", "$pathname", "$current_url", "url"),
      post_slug: readCell(row, "post_slug"),
      translation_key: readCell(row, "translation_key"),
      properties,
    });

    if (normalized) {
      out.push(normalized);
    }
  }

  return out.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export const parseGrowthEvents = (raw: string, formatHint: "csv" | "json" | "ndjson"): GrowthEventRecord[] => {
  if (formatHint === "csv") return parseGrowthEventsCsv(raw);
  if (formatHint === "json") return parseGrowthEventsJson(raw);
  return parseGrowthEventsNdjson(raw);
};

const percentage = (numerator: number, denominator: number): number =>
  denominator > 0 ? round(numerator / denominator, 4) : 0;

const isSignupSuccessEvent = (event: string): boolean =>
  [
    "newsletter_subscribe_success",
    "home_subscribe_success",
    "writing_subscribe_success",
    "launch_subscribe_success",
  ].includes(event);

const isContentEvent = (record: GrowthEventRecord): boolean => {
  if (record.surfaceType !== "article" && record.surfaceType !== "writing_index") return false;
  return true;
};

const isArticleReaderEvent = (record: GrowthEventRecord): boolean =>
  record.event === "article_engaged_read" || (record.surfaceType === "article" && record.event === "$pageview");

const getAnalyticsDomain = (record: GrowthEventRecord): "growth" | "editorial" | "other" | null => {
  const raw = asString(record.properties.analytics_domain)?.toLowerCase();
  if (!raw) return null;
  if (raw === "growth") return "growth";
  if (raw === "editorial") return "editorial";
  return "other";
};

const isGrowthDomainRecord = (record: GrowthEventRecord): boolean => {
  const domain = getAnalyticsDomain(record);
  return domain === null || domain === "growth";
};

const uniqueCount = (values: Array<string | null | undefined>): number =>
  new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0)).size;

const groupBy = <T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = map.get(key) || [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
};

interface Session {
  start: string;
  end: string;
  events: GrowthEventRecord[];
}

const buildSessions = (
  records: GrowthEventRecord[],
  sessionGapMinutes: number,
): Map<string, Session[]> => {
  const byUser = groupBy(
    records.filter((record) => typeof record.distinctId === "string" && record.distinctId.length > 0),
    (record) => record.distinctId as string,
  );
  const gapMs = Math.max(1, sessionGapMinutes) * 60_000;
  const output = new Map<string, Session[]>();

  for (const [distinctId, userRecords] of byUser.entries()) {
    const sorted = [...userRecords].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const sessions: Session[] = [];
    let current: Session | null = null;
    let previousMs = 0;

    for (const item of sorted) {
      const ms = new Date(item.timestamp).getTime();
      if (!current || ms - previousMs > gapMs) {
        current = { start: item.timestamp, end: item.timestamp, events: [item] };
        sessions.push(current);
      } else {
        current.end = item.timestamp;
        current.events.push(item);
      }
      previousMs = ms;
    }

    output.set(distinctId, sessions);
  }

  return output;
};

export const buildGrowthKpiSnapshot = (input: {
  generatedAt: string;
  property: string;
  windowLabel: string;
  windowDays: number;
  records: GrowthEventRecord[];
  topN?: number;
  sessionGapMinutes?: number;
}): GrowthKpiSnapshot => {
  const sortedAll = [...input.records].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const windowEnd = sortedAll.at(-1)?.timestamp || input.generatedAt;
  const windowStartMs = new Date(windowEnd).getTime() - input.windowDays * 24 * 60 * 60 * 1000;
  const windowStart = new Date(windowStartMs).toISOString();
  const topN = Math.max(1, input.topN ?? 10);
  const inWindowAll = sortedAll.filter(
    (record) => record.timestamp >= windowStart && record.timestamp <= windowEnd,
  );
  const inWindow = inWindowAll.filter((record) => isGrowthDomainRecord(record));
  const domainBreakdown = inWindowAll.reduce(
    (acc, row) => {
      const domain = getAnalyticsDomain(row);
      if (domain === "growth") {
        acc.growth += 1;
      } else if (domain === "editorial") {
        acc.editorial += 1;
      } else if (domain === "other") {
        acc.other += 1;
      } else {
        acc.untagged += 1;
      }
      return acc;
    },
    { growth: 0, editorial: 0, other: 0, untagged: 0 } as GrowthAnalyticsDomainBreakdown,
  );
  const eventCounts = inWindow.reduce(
    (acc, row) => {
      acc[row.event] = (acc[row.event] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const conversionVisitorRecords = inWindow.filter((row) =>
    ["launch", "home", "writing_index", "article"].includes(row.surfaceType),
  );
  const signupSuccess = inWindow.filter((row) => isSignupSuccessEvent(row.event));
  const articleReaders = inWindow.filter((row) => isArticleReaderEvent(row));
  const articleAttributedSignups = signupSuccess.filter(
    (row) => row.surfaceType === "article" || row.source === "article" || Boolean(row.postSlug),
  );

  const welcomeViews = inWindow.filter((row) => row.event === "welcome_view").length;
  const confirmedViews = inWindow.filter((row) => row.event === "confirmed_view").length;

  const conversionVisitorsCount = uniqueCount(conversionVisitorRecords.map((row) => row.distinctId));
  const signupUsersCount = uniqueCount(signupSuccess.map((row) => row.distinctId));
  const articleReadersCount = uniqueCount(articleReaders.map((row) => row.distinctId));
  const articleSignupUsersCount = uniqueCount(articleAttributedSignups.map((row) => row.distinctId));

  const contentRecords = inWindow.filter((row) => isContentEvent(row));
  const contentSessionsByUser = buildSessions(contentRecords, input.sessionGapMinutes ?? 30);
  const allContentSessions = Array.from(contentSessionsByUser.values()).flat();
  const sessionsWith2Plus = allContentSessions.filter((session) => session.events.length >= 2).length;
  const totalContentSessions = allContentSessions.length;
  const totalContentReaders = contentSessionsByUser.size;
  const returnReaders14d = Array.from(contentSessionsByUser.values()).filter((sessions) => {
    if (sessions.length < 2) return false;
    for (let index = 1; index < sessions.length; index += 1) {
      const previous = new Date(sessions[index - 1].start).getTime();
      const current = new Date(sessions[index].start).getTime();
      if (current - previous <= 14 * 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  }).length;

  const localeBuckets = groupBy(
    inWindow.filter((row) => Boolean(row.locale)),
    (row) => row.locale as string,
  );
  const locales = Array.from(localeBuckets.entries())
    .map(([locale, rows]): GrowthKpiLocaleSummary => {
      const conversionRows = rows.filter((row) => ["launch", "home", "writing_index", "article"].includes(row.surfaceType));
      const signupRows = rows.filter((row) => isSignupSuccessEvent(row.event));
      const localeArticleReaders = rows.filter((row) => isArticleReaderEvent(row));
      const localeArticleSignups = signupRows.filter(
        (row) => row.surfaceType === "article" || row.source === "article" || Boolean(row.postSlug),
      );

      const conversionVisitors = uniqueCount(conversionRows.map((row) => row.distinctId));
      const signupUsers = uniqueCount(signupRows.map((row) => row.distinctId));
      const articleReadersLocale = uniqueCount(localeArticleReaders.map((row) => row.distinctId));
      const articleSignupUsersLocale = uniqueCount(localeArticleSignups.map((row) => row.distinctId));

      return {
        locale,
        conversionVisitors,
        signupUsers,
        visitorToSignupCvr: percentage(signupUsers, conversionVisitors),
        articleReaders: articleReadersLocale,
        articleSignupUsers: articleSignupUsersLocale,
        articleToSignupCvr: percentage(articleSignupUsersLocale, articleReadersLocale),
      };
    })
    .sort((a, b) => a.locale.localeCompare(b.locale));

  const slugReaderBuckets = groupBy(
    articleReaders.filter((row) => Boolean(row.postSlug)),
    (row) => row.postSlug as string,
  );
  const slugSignupBuckets = groupBy(
    articleAttributedSignups.filter((row) => Boolean(row.postSlug)),
    (row) => row.postSlug as string,
  );
  const slugKeys = new Set<string>([...slugReaderBuckets.keys(), ...slugSignupBuckets.keys()]);
  const topConvertingArticles = Array.from(slugKeys)
    .map((slug): GrowthKpiArticleSummary => {
      const readerUsers = uniqueCount((slugReaderBuckets.get(slug) || []).map((row) => row.distinctId));
      const signupUsers = uniqueCount((slugSignupBuckets.get(slug) || []).map((row) => row.distinctId));
      return {
        slug,
        readerUsers,
        signupUsers,
        articleToSignupCvr: percentage(signupUsers, readerUsers),
      };
    })
    .sort((a, b) => {
      if (b.signupUsers !== a.signupUsers) return b.signupUsers - a.signupUsers;
      if (b.articleToSignupCvr !== a.articleToSignupCvr) return b.articleToSignupCvr - a.articleToSignupCvr;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, topN);

  return {
    generatedAt: input.generatedAt,
    property: input.property,
    windowLabel: input.windowLabel,
    windowDays: input.windowDays,
    windowStart,
    windowEnd,
    domainBreakdown,
    totals: {
      records: sortedAll.length,
      recordsInWindow: inWindowAll.length,
      uniqueUsers: uniqueCount(inWindow.map((row) => row.distinctId)),
    },
    funnel: {
      welcomeViews,
      confirmedViews,
    },
    kpis: {
      visitorToSignupCvr: percentage(signupUsersCount, conversionVisitorsCount),
      articleToSignupCvr: percentage(articleSignupUsersCount, articleReadersCount),
      welcomeProgressRate: percentage(confirmedViews, welcomeViews),
      returnReaderRate14d: percentage(returnReaders14d, totalContentReaders),
      depthRate: percentage(sessionsWith2Plus, totalContentSessions),
    },
    counters: {
      conversionVisitors: conversionVisitorsCount,
      signupUsers: signupUsersCount,
      articleReaders: articleReadersCount,
      articleSignupUsers: articleSignupUsersCount,
      returnReaders14d,
      totalContentReaders,
      sessionsWith2PlusContentEvents: sessionsWith2Plus,
      totalContentSessions,
    },
    locales,
    topConvertingArticles,
    eventCounts,
  };
};

export const compareGrowthKpiSnapshots = (input: {
  current: GrowthKpiSnapshot;
  previous: GrowthKpiSnapshot | null;
}): GrowthKpiMovement => {
  const previous = input.previous;
  if (!previous) {
    return {
      compared: false,
      previousGeneratedAt: null,
      summary: {
        visitorToSignupCvrDelta: 0,
        articleToSignupCvrDelta: 0,
        welcomeProgressRateDelta: 0,
        returnReaderRate14dDelta: 0,
        depthRateDelta: 0,
        conversionVisitorsDelta: 0,
        signupUsersDelta: 0,
      },
      localeDeltas: [],
    };
  }

  const previousLocales = new Map(previous.locales.map((row) => [row.locale, row]));
  const currentLocales = new Map(input.current.locales.map((row) => [row.locale, row]));
  const localeKeys = new Set<string>([...previousLocales.keys(), ...currentLocales.keys()]);
  const localeDeltas = Array.from(localeKeys)
    .map((locale) => {
      const current = currentLocales.get(locale);
      const prev = previousLocales.get(locale);
      return {
        locale,
        visitorToSignupCvrDelta: round((current?.visitorToSignupCvr || 0) - (prev?.visitorToSignupCvr || 0), 4),
        conversionVisitorsDelta: (current?.conversionVisitors || 0) - (prev?.conversionVisitors || 0),
        signupUsersDelta: (current?.signupUsers || 0) - (prev?.signupUsers || 0),
      };
    })
    .sort((a, b) => {
      if (Math.abs(b.visitorToSignupCvrDelta) !== Math.abs(a.visitorToSignupCvrDelta)) {
        return Math.abs(b.visitorToSignupCvrDelta) - Math.abs(a.visitorToSignupCvrDelta);
      }
      return a.locale.localeCompare(b.locale);
    });

  return {
    compared: true,
    previousGeneratedAt: previous.generatedAt,
    summary: {
      visitorToSignupCvrDelta: round(
        input.current.kpis.visitorToSignupCvr - previous.kpis.visitorToSignupCvr,
        4,
      ),
      articleToSignupCvrDelta: round(
        input.current.kpis.articleToSignupCvr - previous.kpis.articleToSignupCvr,
        4,
      ),
      welcomeProgressRateDelta: round(
        input.current.kpis.welcomeProgressRate - previous.kpis.welcomeProgressRate,
        4,
      ),
      returnReaderRate14dDelta: round(
        input.current.kpis.returnReaderRate14d - previous.kpis.returnReaderRate14d,
        4,
      ),
      depthRateDelta: round(input.current.kpis.depthRate - previous.kpis.depthRate, 4),
      conversionVisitorsDelta:
        input.current.counters.conversionVisitors - previous.counters.conversionVisitors,
      signupUsersDelta: input.current.counters.signupUsers - previous.counters.signupUsers,
    },
    localeDeltas,
  };
};

const pct = (value: number): string => `${round(value * 100, 2)}%`;

export const buildGrowthKpiSummaryText = (input: {
  snapshot: GrowthKpiSnapshot;
  movement: GrowthKpiMovement;
}): string => {
  const { snapshot, movement } = input;
  const lines: string[] = [];
  lines.push(`Growth KPI summary (${snapshot.property})`);
  lines.push(`Window: ${snapshot.windowLabel} (${snapshot.windowStart} -> ${snapshot.windowEnd})`);
  lines.push("");
  lines.push(`Visitor -> signup CVR: ${pct(snapshot.kpis.visitorToSignupCvr)}`);
  lines.push(`Article -> signup CVR: ${pct(snapshot.kpis.articleToSignupCvr)}`);
  lines.push(`Welcome progress rate: ${pct(snapshot.kpis.welcomeProgressRate)}`);
  lines.push(`Return reader rate (14d): ${pct(snapshot.kpis.returnReaderRate14d)}`);
  lines.push(`Depth rate: ${pct(snapshot.kpis.depthRate)}`);
  lines.push("");
  lines.push(
    `Core counts: conversion visitors ${snapshot.counters.conversionVisitors}, signup users ${snapshot.counters.signupUsers}, article readers ${snapshot.counters.articleReaders}`,
  );
  lines.push(
    `Domain split (window): growth ${snapshot.domainBreakdown.growth}, editorial ${snapshot.domainBreakdown.editorial}, untagged ${snapshot.domainBreakdown.untagged}, other ${snapshot.domainBreakdown.other}`,
  );

  if (movement.compared) {
    lines.push("");
    lines.push("Delta vs previous snapshot:");
    lines.push(
      `- Visitor->signup CVR ${movement.summary.visitorToSignupCvrDelta >= 0 ? "+" : ""}${pct(
        movement.summary.visitorToSignupCvrDelta,
      )}`,
    );
    lines.push(
      `- Article->signup CVR ${movement.summary.articleToSignupCvrDelta >= 0 ? "+" : ""}${pct(
        movement.summary.articleToSignupCvrDelta,
      )}`,
    );
    lines.push(
      `- Welcome progress ${movement.summary.welcomeProgressRateDelta >= 0 ? "+" : ""}${pct(
        movement.summary.welcomeProgressRateDelta,
      )}`,
    );
    lines.push(
      `- Return reader rate ${movement.summary.returnReaderRate14dDelta >= 0 ? "+" : ""}${pct(
        movement.summary.returnReaderRate14dDelta,
      )}`,
    );
    lines.push(
      `- Depth rate ${movement.summary.depthRateDelta >= 0 ? "+" : ""}${pct(
        movement.summary.depthRateDelta,
      )}`,
    );
  }

  if (snapshot.topConvertingArticles.length > 0) {
    lines.push("");
    lines.push("Top converting article slugs:");
    for (const item of snapshot.topConvertingArticles) {
      lines.push(
        `- ${item.slug}: ${item.signupUsers} signup users / ${item.readerUsers} readers (${pct(
          item.articleToSignupCvr,
        )})`,
      );
    }
  }

  if (snapshot.locales.length > 0) {
    lines.push("");
    lines.push("Locale CVR:");
    for (const locale of snapshot.locales) {
      lines.push(
        `- ${locale.locale}: ${pct(locale.visitorToSignupCvr)} (${locale.signupUsers}/${locale.conversionVisitors})`,
      );
    }
  }

  return lines.join("\n");
};
