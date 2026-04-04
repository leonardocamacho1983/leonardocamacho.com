import type {
  EditorialBenchmarkCaseResult,
  EditorialBenchmarkFailureCategory,
  EditorialBenchmarkFailureCategoryCount,
  EditorialBenchmarkFailureSignal,
  EditorialBenchmarkRuleResult,
} from "./editorialBenchmark";

const GENERIC_BUSINESS_RULES = new Set([
  "disallowed_best_practices",
  "disallowed_stakeholder_buy_in",
  "disallowed_change_management",
  "disallowed_cross_functional_alignment",
]);

const categorizeRuleFailure = (ruleName: string): EditorialBenchmarkFailureCategory => {
  switch (ruleName) {
    case "pipeline_approval":
      return "pipeline_approval";
    case "retry_budget":
      return "retry_instability";
    case "opening_quality":
      return "opening_weakness";
    case "closing_tone":
      return "closing_drift";
    case "anti_synthetic_texture":
      return "texture_artificiality";
    case "concept_invention":
      return "concept_invention";
    case "mechanism_survival":
      return "mechanism_loss";
    case "phenomenon_consistency":
      return "phenomenon_drift";
    case "content_type_consistency":
      return "content_type_drift";
    case "concept_role_consistency":
      return "concept_role_drift";
    case "operator_relevance":
    case "positioning":
      return "operator_positioning";
    default:
      if (ruleName.startsWith("anchor_")) {
        return "mechanism_loss";
      }

      if (GENERIC_BUSINESS_RULES.has(ruleName)) {
        return "generic_business_language";
      }

      if (ruleName.startsWith("disallowed_")) {
        return "disallowed_framing";
      }

      return "other";
  }
};

export const classifyBenchmarkFailures = (
  ruleResults: EditorialBenchmarkRuleResult[],
  error?: string,
): EditorialBenchmarkFailureSignal[] => {
  if (error) {
    return [
      {
        category: "runner_error",
        ruleName: "runner_error",
        evidence: error,
      },
    ];
  }

  return ruleResults
    .filter((rule) => !rule.passed)
    .map((rule) => ({
      category: categorizeRuleFailure(rule.name),
      ruleName: rule.name,
      evidence: rule.evidence,
    }));
};

export const summarizeFailureTaxonomy = (
  cases: EditorialBenchmarkCaseResult[],
  phase: "initialFailureTaxonomy" | "finalFailureTaxonomy",
): EditorialBenchmarkFailureCategoryCount[] => {
  const counts = new Map<EditorialBenchmarkFailureCategory, { count: number; caseIds: Set<string> }>();

  for (const item of cases) {
    for (const signal of item[phase]) {
      const existing = counts.get(signal.category) ?? { count: 0, caseIds: new Set<string>() };
      existing.count += 1;
      existing.caseIds.add(item.caseId);
      counts.set(signal.category, existing);
    }
  }

  return Array.from(counts.entries())
    .map(([category, value]) => ({
      category,
      count: value.count,
      caseIds: Array.from(value.caseIds).sort(),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.category.localeCompare(right.category);
    });
};
