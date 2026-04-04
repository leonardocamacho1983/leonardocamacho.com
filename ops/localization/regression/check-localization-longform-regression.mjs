import fs from "node:fs";

const parseArgs = (argv) => {
  const args = {
    raw: "",
    report: "",
    fixture: "",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--raw") {
      args.raw = next ?? "";
      index += 1;
      continue;
    }

    if (current === "--report") {
      args.report = next ?? "";
      index += 1;
      continue;
    }

    if (current === "--fixture") {
      args.fixture = next ?? "";
      index += 1;
    }
  }

  return args;
};

const { raw: rawPath, report: reportPath, fixture: expectedFixture } = parseArgs(process.argv);

if (!rawPath || !reportPath || !expectedFixture) {
  console.error("Usage: node scripts/check-localization-longform-regression.mjs --raw <raw.json> --report <report.txt> --fixture <fixture-name>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const expectedLocales = ["en-gb", "pt-br", "pt-pt", "fr-fr"];
const MAX_ATTEMPTS_USED = 3;

const localeConfigs = {
  "en-gb": {
    policy: {
      maxAttemptsUsed: MAX_ATTEMPTS_USED,
      maxQaWarnings: 1,
      criticalViolationRules: ["mechanism", "opening_claim", "closing_tone", "workflow_leakage", "argument_completeness"],
      nativeVoicePriority: "standard",
    },
    advisoryPatterns: [
      /(^|[.!?]\s+)the practical lesson is clear\b/i,
      /(^|[.!?]\s+)founders should\b/i,
      /(^|[.!?]\s+)leaders should\b/i,
      /(^|[.!?]\s+)to avoid this\b/i,
    ],
    mechanismAnchors: [
      { name: "decision", pattern: /decision|choices?/iu },
      { name: "structure", pattern: /structural|structure|architecture/iu },
      { name: "direction", pattern: /direction|course|clarity/iu },
      { name: "accumulation", pattern: /accumul|combine|interaction|together/iu },
    ],
  },
  "pt-br": {
    policy: {
      maxAttemptsUsed: MAX_ATTEMPTS_USED,
      maxQaWarnings: 1,
      criticalViolationRules: ["mechanism", "opening_claim", "closing_tone", "workflow_leakage", "argument_completeness"],
      nativeVoicePriority: "standard",
    },
    advisoryPatterns: [
      /(^|[.!?]\s+)a lição prática é clara\b/iu,
      /(^|[.!?]\s+)os fundadores devem\b/iu,
      /(^|[.!?]\s+)os líderes devem\b/iu,
      /(^|[.!?]\s+)para evitar isso\b/iu,
    ],
    mechanismAnchors: [
      { name: "decision", pattern: /decis|escolh/iu },
      { name: "structure", pattern: /estrutur|arquitet/iu },
      { name: "direction", pattern: /rumo|direção|direcc|clareza/iu },
      { name: "accumulation", pattern: /acumul|combin|intera|conjunt/iu },
    ],
  },
  "pt-pt": {
    policy: {
      maxAttemptsUsed: MAX_ATTEMPTS_USED,
      maxQaWarnings: 0,
      criticalViolationRules: [
        "mechanism",
        "opening_claim",
        "closing_tone",
        "workflow_leakage",
        "argument_completeness",
        "structural_import",
      ],
      nativeVoicePriority: "strict",
    },
    advisoryPatterns: [
      /(^|[.!?]\s+)a lição prática é clara\b/iu,
      /(^|[.!?]\s+)os fundadores devem\b/iu,
      /(^|[.!?]\s+)os líderes devem\b/iu,
      /(^|[.!?]\s+)para evitar isso\b/iu,
    ],
    mechanismAnchors: [
      { name: "decision", pattern: /decis|escolh/iu },
      { name: "structure", pattern: /estrutur|arquitet/iu },
      { name: "direction", pattern: /rumo|direção|direcc|clareza/iu },
      { name: "accumulation", pattern: /acumul|combin|intera|conjunt/iu },
    ],
    structuralImportPatterns: [
      /\bisto é por isso que\b/iu,
      /\bcada time age com uma lógica própria\b/iu,
      /\bisso vai mudando a direção da empresa\b/iu,
    ],
  },
  "fr-fr": {
    policy: {
      maxAttemptsUsed: MAX_ATTEMPTS_USED,
      maxQaWarnings: 1,
      criticalViolationRules: ["mechanism", "opening_claim", "closing_tone", "workflow_leakage", "argument_completeness"],
      nativeVoicePriority: "standard",
    },
    advisoryPatterns: [
      /(^|[.!?]\s+)la leçon pratique est claire\b/iu,
      /(^|[.!?]\s+)les fondateurs doivent\b/iu,
      /(^|[.!?]\s+)les dirigeants doivent\b/iu,
      /(^|[.!?]\s+)pour éviter cela\b/iu,
      /(^|[.!?]\s+)il faut\b/iu,
    ],
    mechanismAnchors: [
      { name: "decision", pattern: /décision|choix/iu },
      { name: "structure", pattern: /structurel|structure|architecture/iu },
      { name: "direction", pattern: /direction|trajectoire|clarté/iu },
      { name: "accumulation", pattern: /accumul|agrèg|interact|ensemble/iu },
    ],
  },
};

const leakagePatterns = [
  /workflow_leakage/iu,
  /This seed content is a placeholder/iu,
  /Replace it with the final article body in Studio/iu,
  /\bStudio\b/iu,
  /conteúdo provisório/iu,
  /Substitua-o/iu,
  /Il sera remplacé/iu,
  /Replace it/iu,
  /drafts\./iu,
  /editorial process/iu,
  /workflow steps/iu,
];

const lines = [];
const failures = [];
const localeFailurePatterns = new Map();

const fail = (scope, message) => {
  failures.push(`${scope}: ${message}`);
  lines.push(`[FAIL] ${scope} - ${message}`);
};

const pass = (scope) => {
  lines.push(`[PASS] ${scope}`);
};

const addLocalePattern = (localeKey, pattern) => {
  const patterns = localeFailurePatterns.get(localeKey) ?? [];
  patterns.push(pattern);
  localeFailurePatterns.set(localeKey, patterns);
};

const ensureString = (value) => (typeof value === "string" ? value : "");

const splitParagraphs = (text) =>
  ensureString(text)
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const sentenceCount = (text) => {
  const matches = ensureString(text).match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : 0;
};

const buildClosingWindow = (text) => {
  const paragraphs = splitParagraphs(text);
  const selected = [];
  let chars = 0;
  let sentences = 0;

  for (let index = paragraphs.length - 1; index >= 0 && selected.length < 3; index -= 1) {
    selected.unshift(paragraphs[index]);
    chars += paragraphs[index].length;
    sentences += sentenceCount(paragraphs[index]);
    if (chars >= 350 || sentences >= 3) {
      break;
    }
  }

  return selected.join("\n\n").replace(/\s+/g, " ").trim();
};

if (data.ok !== true) {
  fail("global", "top-level ok is not true");
}

if (data.fixture !== expectedFixture) {
  fail("global", `fixture mismatch: expected ${expectedFixture}, got ${String(data.fixture)}`);
}

const locales = Array.isArray(data.locales) ? data.locales : [];
const localeMap = new Map(locales.map((locale) => [locale.targetLocale, locale]));
const actualLocales = Array.from(localeMap.keys()).sort();
const expectedSorted = [...expectedLocales].sort();

if (JSON.stringify(actualLocales) !== JSON.stringify(expectedSorted)) {
  fail("global", `locale set mismatch: expected ${expectedSorted.join(", ")}, got ${actualLocales.join(", ")}`);
}

for (const localeKey of expectedLocales) {
  const locale = localeMap.get(localeKey);
  if (!locale) {
    fail(localeKey, "missing locale result");
    continue;
  }

  const reasons = [];
  const config = localeConfigs[localeKey];
  const policy = config.policy;
  const title = ensureString(locale.localizedTitle);
  const excerpt = ensureString(locale.localizedExcerpt);
  const text = ensureString(locale.localizedText);
  const closingWindow = buildClosingWindow(text);
  const warningCount = Array.isArray(locale.qaWarnings) ? locale.qaWarnings.length : 0;
  const guardianViolations = Array.isArray(locale.guardianViolations) ? locale.guardianViolations : [];
  const policySnapshot =
    locale.publishPolicy && typeof locale.publishPolicy === "object" ? locale.publishPolicy : null;

  if (locale.ok !== true) {
    reasons.push("ok is not true");
    addLocalePattern(localeKey, "publish_threshold");
  }

  if (locale.error != null && `${locale.error}`.trim() !== "") {
    reasons.push(`error present: ${locale.error}`);
    addLocalePattern(localeKey, "runner_error");
  }

  if (warningCount > policy.maxQaWarnings) {
    reasons.push(`qaWarnings exceeded threshold: ${warningCount}/${policy.maxQaWarnings}`);
    addLocalePattern(localeKey, "warning_budget");
  }

  if (typeof locale.attemptsUsed !== "number" || locale.attemptsUsed > policy.maxAttemptsUsed) {
    reasons.push(`attemptsUsed exceeded limit: ${String(locale.attemptsUsed)}/${policy.maxAttemptsUsed}`);
    addLocalePattern(localeKey, "attempt_budget");
  }

  if (!title.trim()) {
    reasons.push("localizedTitle is empty");
    addLocalePattern(localeKey, "content_missing");
  }

  if (!excerpt.trim()) {
    reasons.push("localizedExcerpt is empty");
    addLocalePattern(localeKey, "content_missing");
  }

  if (!text.trim()) {
    reasons.push("localizedText is empty");
    addLocalePattern(localeKey, "content_missing");
  }

  for (const pattern of leakagePatterns) {
    if (pattern.test(excerpt) || pattern.test(text)) {
      reasons.push(`workflow leakage matched pattern: ${pattern}`);
      addLocalePattern(localeKey, "workflow_leakage");
      break;
    }
  }

  for (const pattern of config.advisoryPatterns) {
    if (pattern.test(closingWindow)) {
      reasons.push(`advisory close matched pattern: ${pattern}`);
      addLocalePattern(localeKey, "closing_drift");
      break;
    }
  }

  for (const anchor of config.mechanismAnchors) {
    if (!anchor.pattern.test(text)) {
      reasons.push(`missing mechanism anchor group: ${anchor.name}`);
      addLocalePattern(localeKey, "mechanism_loss");
    }
  }

  if (Array.isArray(config.structuralImportPatterns)) {
    for (const pattern of config.structuralImportPatterns) {
      if (pattern.test(text)) {
        reasons.push(`structural import matched pattern: ${pattern}`);
        addLocalePattern(localeKey, "structural_import");
        if (policy.nativeVoicePriority === "strict") {
          addLocalePattern(localeKey, "native_voice_risk");
        }
        break;
      }
    }
  }

  for (const violation of guardianViolations) {
    if (!violation || typeof violation.rule !== "string") {
      continue;
    }
    addLocalePattern(localeKey, violation.rule);
  }

  if (policy.nativeVoicePriority === "strict" && guardianViolations.some((violation) => violation.rule === "structural_import")) {
    addLocalePattern(localeKey, "native_voice_risk");
  }

  if (policySnapshot) {
    const criticalRules = Array.isArray(policySnapshot.criticalViolationRules)
      ? policySnapshot.criticalViolationRules.slice().sort()
      : [];
    const expectedCriticalRules = [...policy.criticalViolationRules].sort();

    if (
      policySnapshot.maxAttemptsUsed !== policy.maxAttemptsUsed ||
      policySnapshot.maxQaWarnings !== policy.maxQaWarnings ||
      JSON.stringify(criticalRules) !== JSON.stringify(expectedCriticalRules) ||
      policySnapshot.nativeVoicePriority !== policy.nativeVoicePriority
    ) {
      reasons.push("publishPolicy mismatch against expected locale threshold");
      addLocalePattern(localeKey, "policy_mismatch");
    }
  } else {
    reasons.push("publishPolicy missing from locale result");
    addLocalePattern(localeKey, "policy_missing");
  }

  if (reasons.length > 0) {
    fail(localeKey, reasons.join("; "));
    const patterns = Array.from(new Set(localeFailurePatterns.get(localeKey) ?? [])).sort();
    if (patterns.length > 0) {
      lines.push(`       patterns: ${patterns.join(", ")}`);
    }
  } else {
    pass(localeKey);
  }
}

if (failures.length === 0) {
  lines.push(`Localization regression passed: ${expectedLocales.length}/${expectedLocales.length} locales passed.`);
} else {
  const failedCount = lines.filter((line) => line.startsWith("[FAIL] ")).length;
  lines.push(`Localization regression failed: ${failedCount} locale checks failed.`);
}

const summarizedPatterns = Array.from(localeFailurePatterns.entries())
  .map(([localeKey, patterns]) => [localeKey, Array.from(new Set(patterns)).sort()])
  .filter(([, patterns]) => patterns.length > 0);

if (summarizedPatterns.length > 0) {
  lines.push("");
  lines.push("Per-locale failure patterns:");
  for (const [localeKey, patterns] of summarizedPatterns) {
    lines.push(`  - ${localeKey}: ${patterns.join(", ")}`);
  }
}

fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

if (failures.length > 0) {
  process.exit(1);
}
