import type { CreateContentResult } from "../types/content";
import { classifyBenchmarkFailures } from "./benchmarkFailureTaxonomy";
import type {
  EditorialBenchmarkCaseResult,
  EditorialBenchmarkFixture,
  EditorialBenchmarkPatternRule,
  EditorialBenchmarkRuleResult,
} from "./editorialBenchmark";

const OPENING_FAILURE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "negation_open", pattern: /^\s*(?:Organizations?|Founders?|Leaders?)\s+do(?:es)?\s+not\b/i },
  { name: "most_do_not_open", pattern: /^\s*Most\s+\w+(?:\s+\w+)?\s+do(?:es)?\s+not\b/i },
  { name: "correction_open", pattern: /^\s*Not because\b/i },
  { name: "setup_open", pattern: /^\s*(?:Despite|While)\b/i },
  { name: "problem_open", pattern: /^\s*(?:Organizations?|Founders?|Leaders?)\s+(?:often\s+)?(?:struggle|struggles|face|faces|confront|confronts)\b/i },
  { name: "warmup_open", pattern: /^\s*Founders\s+often\b/i },
];

const DIAGNOSIS_CLOSE_PATTERNS: RegExp[] = [
  /(^|[.!?]\s+)the practical lesson is clear\b/i,
  /(^|[.!?]\s+)founders should\b/i,
  /(^|[.!?]\s+)founders must\b/i,
  /(^|[.!?]\s+)leaders should\b/i,
  /(^|[.!?]\s+)leaders must\b/i,
  /(^|[.!?]\s+)the first step\b/i,
  /(^|[.!?]\s+)begin with\b/i,
  /(^|[.!?]\s+)this requires\b/i,
  /(^|[.!?]\s+)it demands\b/i,
  /(^|[.!?]\s+)to avoid this\b/i,
  /(^|[.!?]\s+)the answer is\b/i,
];

const APPLICATION_LEAD_PATTERNS: RegExp[] = [
  /\bstart by\b/i,
  /\bbegin by\b/i,
  /\brun the audit\b/i,
  /\baudit\b/i,
  /\bidentify where\b/i,
  /\blocate where\b/i,
  /\btrace(?:d|s|ing)?\b/i,
  /\bmap(?:ped|s|ping)?\b/i,
  /\bfollow(?:ed|s|ing)?\b/i,
  /\binspect(?:ed|s|ing)?\b/i,
  /\bpinpoint(?:ed|s|ing)?\b/i,
  /\blook for\b/i,
];

const GENERIC_BUSINESS_PATTERNS: EditorialBenchmarkPatternRule[] = [
  { name: "best_practices", pattern: "best practices?" },
  { name: "stakeholder_buy_in", pattern: "stakeholder buy-in" },
  { name: "change_management", pattern: "change management" },
  { name: "cross_functional_alignment", pattern: "cross-functional alignment" },
];

const CRITICAL_TEXTURE_ISSUE_CODES = new Set([
  "PARAGRAPH_TEMPLATE",
  "TRANSITION_CRUTCH",
  "PUNCTUATION_SIGNALING",
  "REPEATED_SENTENCE_OPENER",
  "ABSTRACTION_STACK",
]);

const asRuleResult = (name: string, passed: boolean, evidence?: string): EditorialBenchmarkRuleResult => ({
  name,
  passed,
  evidence,
});

const firstSentence = (text: string): string => {
  const normalized = text.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^[^.!?]+[.!?]?/);
  return match?.[0]?.trim() || normalized;
};

const splitParagraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const sentenceCount = (text: string): number => {
  const matches = text.match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : 0;
};

const buildTrailingWindow = (text: string, maxParagraphs: number, minChars: number, minSentences: number): string => {
  const paragraphs = splitParagraphs(text);
  const selected: string[] = [];
  let chars = 0;
  let sentences = 0;

  for (let index = paragraphs.length - 1; index >= 0 && selected.length < maxParagraphs; index -= 1) {
    const paragraph = paragraphs[index];
    selected.unshift(paragraph);
    chars += paragraph.length;
    sentences += sentenceCount(paragraph);
    if (chars >= minChars || sentences >= minSentences) {
      break;
    }
  }

  return selected.join("\n\n").replace(/\s+/g, " ").trim();
};

const buildLeadingWindow = (text: string, maxParagraphs: number, minChars: number, minSentences: number): string => {
  const paragraphs = splitParagraphs(text);
  const selected: string[] = [];
  let chars = 0;
  let sentences = 0;

  for (let index = 0; index < paragraphs.length && selected.length < maxParagraphs; index += 1) {
    const paragraph = paragraphs[index];
    selected.push(paragraph);
    chars += paragraph.length;
    sentences += sentenceCount(paragraph);
    if (chars >= minChars || sentences >= minSentences) {
      break;
    }
  }

  return selected.join("\n\n").replace(/\s+/g, " ").trim();
};

const buildClosingWindow = (text: string): string => buildTrailingWindow(text, 3, 350, 3);

const findMatchingPattern = (patterns: RegExp[], text: string): RegExp | undefined =>
  patterns.find((pattern) => pattern.test(text));

const compile = (pattern: string): RegExp => new RegExp(pattern, "iu");
const compileGlobal = (pattern: string): RegExp => new RegExp(pattern, "giu");

const hasNegatedContext = (text: string, matchIndex: number): boolean => {
  const sentenceStart = Math.max(
    text.lastIndexOf(".", matchIndex - 1),
    text.lastIndexOf("!", matchIndex - 1),
    text.lastIndexOf("?", matchIndex - 1),
    text.lastIndexOf("\n", matchIndex - 1),
  );
  const prefix = text
    .slice(sentenceStart + 1, matchIndex)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!prefix) {
    return false;
  }

  return /(?:\bnot\b|\bno\b|\bwithout\b|\brather than\b|\binstead of\b|\bbeyond\b|\btranscend(?:s|ed|ing)?\b|\bnot because\b|\bnot from\b|\bnot due to\b)[^.!?\n]{0,80}$/iu.test(
    prefix,
  );
};

const evaluateDisallowedPatterns = (
  text: string,
  closingWindow: string,
  patterns: EditorialBenchmarkPatternRule[],
): EditorialBenchmarkRuleResult[] =>
  patterns.map((rule) => {
    const regex = compile(rule.pattern);
    const target = rule.scope === "closing" ? closingWindow : text;
    const matches = [...target.matchAll(compileGlobal(rule.pattern))];
    const relevantMatches = rule.ignoreNegated
      ? matches.filter((match) => typeof match.index === "number" && !hasNegatedContext(target, match.index))
      : matches;
    const firstRelevantMatch = relevantMatches[0];
    return asRuleResult(
      `disallowed_${rule.name}`,
      !firstRelevantMatch,
      firstRelevantMatch ? `matched ${String(regex)}` : undefined,
    );
  });

const evaluateAnchorGroups = (
  text: string,
  fixture: EditorialBenchmarkFixture,
): { missingAnchorGroups: string[]; results: EditorialBenchmarkRuleResult[] } => {
  const results = fixture.rules.requiredAnchorGroups.map((group) => {
    const matchedPattern = group.patterns.find((pattern) => compile(pattern).test(text));
    return asRuleResult(
      `anchor_${group.name}`,
      Boolean(matchedPattern),
      matchedPattern ? `matched /${matchedPattern}/iu` : `missing patterns: ${group.patterns.join(", ")}`,
    );
  });

  return {
    missingAnchorGroups: results.filter((result) => !result.passed).map((result) => result.name.replace(/^anchor_/, "")),
    results,
  };
};

const evaluateAntiSyntheticTexture = (result: CreateContentResult): EditorialBenchmarkRuleResult => {
  const criticalTextureIssues = result.antiSynthetic.issues.filter(
    (issue) => issue.severity === "high" && CRITICAL_TEXTURE_ISSUE_CODES.has(issue.code),
  );

  return asRuleResult(
    "anti_synthetic_texture",
    criticalTextureIssues.length === 0,
    criticalTextureIssues.length > 0
      ? `high-severity antiSynthetic issues: ${criticalTextureIssues
          .map((issue) => issue.code)
          .join(", ")}`
      : undefined,
  );
};

export const evaluateEditorialBenchmarkCase = (
  fixture: EditorialBenchmarkFixture,
  result: CreateContentResult,
): EditorialBenchmarkCaseResult => {
  const finalText = result.styleShaper.revisedText;
  const opening = firstSentence(finalText);
  const closingWindow = buildClosingWindow(finalText);
  const openingWindow = buildLeadingWindow(finalText, 2, 350, 3);
  const operatorWindow = buildLeadingWindow(finalText, 3, 550, 5);
  const firstPassViolations = (result.firstPassBrandGuardian?.violations ?? []).map((item) => item.rule);
  const actualPhenomenonType = result.brief.phenomenonType;
  const actualConceptRole = result.brief.contentFunction?.conceptRole;
  const actualContentType = result.brief.contentType;
  const proposedConcepts = result.writerOutput.proposedConcepts;
  const maxRetryCount = fixture.rules.maxRetryCount ?? 1;
  const requiresApplicationLedPositioning =
    fixture.rules.expectedContentType === "note" && fixture.rules.closingMode === "operator_allowed";

  const openingFailure = OPENING_FAILURE_PATTERNS.find((rule) => rule.pattern.test(opening));
  const openingQuality = {
    ...asRuleResult(
      "opening_quality",
      !openingFailure,
      openingFailure ? `matched ${String(openingFailure.pattern)}` : undefined,
    ),
    opening,
  };

  const closingFailure =
    fixture.rules.closingMode === "operator_allowed" ? undefined : findMatchingPattern(DIAGNOSIS_CLOSE_PATTERNS, closingWindow);
  const closingTone = {
    ...asRuleResult(
      "closing_tone",
      !closingFailure,
      closingFailure ? `matched ${String(closingFailure)}` : undefined,
    ),
    closing: closingWindow,
  };

  const conceptInvention = {
    ...asRuleResult(
      "concept_invention",
      fixture.rules.allowProposedConcepts === true || proposedConcepts.length === 0,
      proposedConcepts.length > 0 ? `proposed concepts: ${proposedConcepts.join(", ")}` : undefined,
    ),
    proposedConcepts,
  };

  const { missingAnchorGroups, results: anchorResults } = evaluateAnchorGroups(finalText, fixture);
  const mechanismSurvival = {
    ...asRuleResult(
      "mechanism_survival",
      missingAnchorGroups.length === 0,
      missingAnchorGroups.length > 0 ? `missing anchor groups: ${missingAnchorGroups.join(", ")}` : undefined,
    ),
    missingAnchorGroups,
  };

  const phenomenonConsistency = {
    ...asRuleResult(
      "phenomenon_consistency",
      fixture.rules.expectedPhenomenonType ? actualPhenomenonType === fixture.rules.expectedPhenomenonType : true,
      fixture.rules.expectedPhenomenonType
        ? `expected=${fixture.rules.expectedPhenomenonType} actual=${String(actualPhenomenonType)}`
        : undefined,
    ),
    expected: fixture.rules.expectedPhenomenonType,
    actual: actualPhenomenonType,
  };

  const operatorRelevanceFailure =
    requiresApplicationLedPositioning && !findMatchingPattern(APPLICATION_LEAD_PATTERNS, operatorWindow)
      ? `missing application-led marker in early window: ${operatorWindow}`
      : undefined;
  const operatorRelevance = asRuleResult(
    "operator_relevance",
    !operatorRelevanceFailure,
    operatorRelevanceFailure,
  );

  const positioningFailure =
    requiresApplicationLedPositioning && !findMatchingPattern(APPLICATION_LEAD_PATTERNS, openingWindow)
      ? `opening stayed diagnosis-led: ${openingWindow}`
      : undefined;
  const positioning = asRuleResult(
    "positioning",
    !positioningFailure,
    positioningFailure,
  );
  const antiSyntheticTexture = evaluateAntiSyntheticTexture(result);

  const ruleResults: EditorialBenchmarkRuleResult[] = [
    asRuleResult(
      "pipeline_approval",
      result.ok,
      result.ok ? undefined : result.failureReason || "pipeline returned rejected status",
    ),
    asRuleResult(
      "content_type_consistency",
      fixture.rules.expectedContentType ? actualContentType === fixture.rules.expectedContentType : true,
      fixture.rules.expectedContentType ? `expected=${fixture.rules.expectedContentType} actual=${actualContentType}` : undefined,
    ),
    asRuleResult(
      "concept_role_consistency",
      fixture.rules.expectedConceptRole ? actualConceptRole === fixture.rules.expectedConceptRole : true,
      fixture.rules.expectedConceptRole ? `expected=${fixture.rules.expectedConceptRole} actual=${String(actualConceptRole)}` : undefined,
    ),
    asRuleResult(
      "retry_budget",
      result.retry.count <= maxRetryCount,
      `retry_count=${result.retry.count} max=${maxRetryCount}`,
    ),
    openingQuality,
    closingTone,
    antiSyntheticTexture,
    conceptInvention,
    mechanismSurvival,
    phenomenonConsistency,
    ...(requiresApplicationLedPositioning ? [operatorRelevance, positioning] : []),
    ...anchorResults,
    ...evaluateDisallowedPatterns(finalText, closingWindow, [...GENERIC_BUSINESS_PATTERNS, ...(fixture.rules.disallowedPatterns ?? [])]),
  ];

  const failureReasons = ruleResults.filter((rule) => !rule.passed).map((rule) => `${rule.name}: ${rule.evidence || "failed"}`);
  const finalStatus = failureReasons.length === 0 ? "passed" : "failed";

  return {
    caseId: fixture.id,
    label: fixture.label,
    finalStatus,
    benchmarkResolution: finalStatus === "passed" ? "pass_first_attempt" : "failed_after_max_revisions",
    benchmarkRevisionsUsed: 0,
    initialFailureReasons: [],
    pipelineApproved: result.ok,
    retry: result.retry,
    firstPassViolations,
    openingQuality,
    closingTone,
    conceptInvention,
    mechanismSurvival,
    phenomenonConsistency,
    benchmarkRuleResults: ruleResults,
    failureReasons,
    initialFailureTaxonomy: [],
    finalFailureTaxonomy: classifyBenchmarkFailures(ruleResults),
    output: {
      title: result.writerOutput.title,
      summary: result.writerOutput.summary,
      bodyMarkdown: finalText,
    },
    brief: {
      contentType: actualContentType,
      phenomenonType: actualPhenomenonType,
      conceptRole: actualConceptRole,
      coreClaim: result.brief.coreClaim,
    },
    reference: fixture.approvedReference,
    survivalCriteria: fixture.survivalCriteria,
    knownFailurePatterns: fixture.knownFailurePatterns,
  };
};
