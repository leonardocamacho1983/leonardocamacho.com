import type { EditorialBenchmarkFixture } from "../../ops/publishing/qa/editorialBenchmark";

export const EDITORIAL_BENCHMARKS: EditorialBenchmarkFixture[] = [
  {
    id: "local-rationality-perceptual",
    label: "Perceptual drift from locally rational decisions",
    input: {
      topic: "Why founders lose strategic clarity",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain how strategic clarity erodes through individually rational decisions made across the organization, without reducing the phenomenon to distraction, poor prioritization, or weak leadership.",
        notes: [
          "Founders misattribute strategic fog to distraction or poor prioritization when the real failure is perceptual: no actor can see the whole decision landscape as it forms.",
          "Each team satisfices within its own goal function, producing choices that are rational inside the subunit but destructive to global coherence.",
          "Good decisions compound into a strategy no one chose and no one owns because the aggregate pattern forms below the threshold of perception.",
          "Subunit-level metrics can look healthy while the aggregate strategy becomes illegible from inside the organization.",
        ],
        thesisHint:
          "Strategic clarity is lost when the organization can no longer perceive how locally rational decisions are combining into a different direction over time.",
        examples: [
          "Product ships a self-serve onboarding flow optimized for SMB activation while sales closes enterprise deals that require white-glove implementation.",
          "A founder approves a series of reasonable customer requests that slowly turn the roadmap into something no strategy ever chose.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Founders Lose Strategic Clarity",
      summary:
        "Strategic clarity usually degrades through locally rational decisions that make sense inside each subunit while making the aggregate direction harder to see.",
      bodyMarkdown: `Founders usually lose strategic clarity long after the mechanism is already in motion. The problem is not distraction. It is that well-functioning subunits keep making decisions that are rational inside their own frames while the combined effect drifts beyond anyone's field of view.

Product, sales, marketing, and finance do not optimize against one shared reality. They optimize against different constraints, goals, and time horizons. A founder can approve each choice in sequence and still end up with a strategy no one intended. The deterioration is cumulative before it is visible.

That is why strategic fog rarely feels like conflict. Each team can justify its move. Each metric can still look healthy. What disappears first is not activity or execution quality. It is the organization's ability to see how locally rational decisions are combining into a different market position.

By the time the founder can name the contradiction, it has already hardened into roadmap commitments, customer promises, and headcount. The strategy did not break in a dramatic moment. It became difficult to perceive while everyone was acting reasonably.`,
    },
    survivalCriteria: [
      "Preserve local rationality as the core mechanism.",
      "Keep the aggregate effect harder to see than the individual decision.",
      "Do not collapse the problem into alignment advice.",
    ],
    knownFailurePatterns: [
      "Ends by telling founders to align teams or prioritize better.",
      "Replaces subunit logic with generic communication language.",
      "Invents a label for the pattern instead of explaining the mechanism.",
    ],
    rules: {
      expectedPhenomenonType: "perceptual",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "decision", patterns: ["decision", "approve", "choice"] },
        { name: "local_logic", patterns: ["local", "subunit", "team", "frame", "goal function"] },
        { name: "aggregate_effect", patterns: ["accumul", "combine", "together", "sequence"] },
        { name: "strategic_visibility", patterns: ["strategy", "direction", "clarity", "market"] },
      ],
      disallowedPatterns: [
        { name: "alignment_platitude", pattern: "cross-functional alignment|align your teams|prioritize better" },
      ],
    },
  },
  {
    id: "weak-signal-threshold-structural",
    label: "Structural threshold mismatch on weak signals",
    input: {
      topic: "Why most organizations are structurally incapable of acting on weak signals",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain why organizations fail to act on signals they already noticed.",
        notes: [
          "Decision rights sit far from signal holders.",
          "Sunk costs raise the threshold for response.",
          "The problem is not that the signal is weak. The problem is that the organization demands too much proof before action.",
          "Those closest to the signal rarely control budget or roadmap authority.",
        ],
        thesisHint: "The signal was not weak. The threshold was wrong.",
        examples: [
          "Support hears the complaint pattern first, but product and finance still treat it as noise.",
          "A product lead spots a usage shift months before leadership will reallocate resources.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "The Signal Was Not Weak. The Threshold Was Wrong.",
      summary:
        "Organizations miss weak signals less because they fail to notice them than because decision authority, sunk costs, and proof thresholds make early response structurally expensive.",
      bodyMarkdown: `Most organizations do not wait on weak signals because nobody saw them. They wait because the people who notice the signal do not control the threshold for acting on it.

Signals usually appear first where the organization is closest to friction: support, sales, operations, product. But decision rights sit elsewhere. Budget authority, roadmap control, and political legitimacy tend to live with people whose job is to defend existing commitments. That makes waiting look rational even when the pattern is already visible.

Sunk costs intensify the delay. The more resources are committed to the current plan, the more evidence is required to justify deviation. Early action therefore carries a higher burden of proof than late action, even though late action comes with worse options.

The signal was not weak in any absolute sense. It was weak relative to a response threshold built by authority structure and prior commitments. By the time the signal clears that threshold, the market has already moved further than the organization can recover quickly.`,
    },
    survivalCriteria: [
      "Preserve the gap between signal detection and decision authority.",
      "Keep sunk costs as part of the mechanism, not side context.",
      "Land on delayed action as structural cost, not leadership failure.",
    ],
    knownFailurePatterns: [
      "Turns the issue into culture or communication.",
      "Ends with a checklist for better signal reviews.",
      "Softens thresholds into generic caution or limited attention.",
    ],
    rules: {
      expectedPhenomenonType: "structural",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "signal", patterns: ["signal", "warning", "pattern", "evidence"] },
        { name: "authority", patterns: ["authority", "decision rights", "budget", "roadmap", "power"] },
        { name: "sunk_cost", patterns: ["sunk cost", "commitment", "investment"] },
        { name: "threshold_or_delay", patterns: ["threshold", "delay", "wait", "late"] },
      ],
      disallowedPatterns: [
        { name: "culture_substitution", pattern: "culture problem|communication problem|leadership visibility" },
      ],
    },
  },
  {
    id: "late-adaptation-structural",
    label: "Structural late adaptation",
    input: {
      topic: "Why organizations fail to adapt before it is too late",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain why organizations recognize the need to adapt only after the window has closed, without reducing it to resistance or poor leadership.",
        notes: [
          "Adaptation signals are often ambiguous until the moment they become obvious.",
          "Organizations have sunk costs and commitments that make early adaptation costly to justify.",
          "The people closest to the signal often lack the authority to act on it.",
          "Capability gaps only become visible under conditions the organization has not yet faced.",
        ],
        thesisHint:
          "Organizations adapt late not because they ignore signals but because the system cannot act on weak signals before they become undeniable.",
        examples: [
          "A product team sees declining engagement months before leadership acknowledges a strategic shift is needed.",
          "A capability gap becomes visible only when a competitor moves first and the organization has no ready response.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Organizations Adapt Only After the Window Closes",
      summary:
        "Late adaptation comes from the way weak signals, hidden capability gaps, and decision authority fail to line up early enough for action.",
      bodyMarkdown: `Organizations usually adapt late for structural reasons before they adapt late for cognitive ones. They can often see enough to worry well before they can justify the move that would matter.

Weak signals arrive in pieces. Support hears complaints. Product sees friction. Sales loses edge in deals. None of those fragments is decisive alone. The organization needs them to combine before it can authorize a response, but the units holding those pieces do not control the same decisions.

Capability gaps stay hidden for the same reason. They do not appear as explicit absences on a dashboard. They appear only when a competitor forces a condition the organization has not yet had to survive. By then, the proof is undeniable and the room to respond is smaller.

What looks like slow adaptation at the top is often the result of signal detection, capability readiness, and authority thresholds failing to meet in time. The window closes before the system can assemble a move with enough legitimacy to act.`,
    },
    survivalCriteria: [
      "Keep late adaptation tied to weak signals plus capability readiness plus authority.",
      "Do not reduce the problem to resistance to change.",
      "Preserve the shrinking window as the central cost.",
    ],
    knownFailurePatterns: [
      "Explains delay as poor leadership or slow culture.",
      "Treats capability gaps as obvious in advance.",
      "Ends by prescribing an adaptation playbook.",
    ],
    rules: {
      expectedPhenomenonType: "structural",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "adaptation", patterns: ["adapt", "response", "move"] },
        { name: "weak_signal", patterns: ["weak signal", "signal", "ambiguous", "fragment"] },
        { name: "capability_gap", patterns: ["capability", "readiness", "gap"] },
        { name: "window", patterns: ["window", "late", "narrow", "close"] },
      ],
      disallowedPatterns: [
        { name: "leadership_blame", pattern: "poor leadership|resistance to change|culture issue", ignoreNegated: true },
      ],
    },
  },
  {
    id: "coalition-dynamics-structural",
    label: "Coalition dynamics and conflicting subunit logic",
    input: {
      topic: "Why strategic conflict persists even when every team is right",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain why organizations structurally produce strategic conflict even when subunits are performing well, without reducing it to communication or culture.",
        notes: [
          "Organizations are coalitions of subunits with conflicting goals rather than unified rational actors.",
          "Sales, product, and marketing operate on different time horizons and success measures.",
          "Conflict persists because each subunit is right by its own logic.",
          "The founder is often the last person who can still imagine the organization as one coherent actor.",
        ],
        thesisHint:
          "Strategic conflict persists because organizations are coalitions of subunits with different goal functions, not single actors executing one coherent intention.",
        examples: [
          "Marketing optimizes top-of-funnel volume, sales optimizes deal size, and product optimizes retention quality.",
          "Each team can hit its target while the firm moves into a market no one explicitly selected.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Strategic Conflict Persists Even When Every Team Is Right",
      summary:
        "Strategic conflict persists because organizations are coalitions of subunits with different goal functions and time horizons, not single actors with one decision logic.",
      bodyMarkdown: `Strategic conflict does not persist because teams fail to communicate. It persists because organizations are coalitions of subunits that can each be rational on their own terms at the same time.

Sales is paid to close this quarter. Product is judged on the future shape of the offering. Marketing is measured on efficient demand creation. None of those logics is illegitimate. The conflict appears because the firm wants them all to behave as if they were executing one unified intention.

That fiction usually survives longest in the founder's head. From inside each subunit, the local objective still makes sense. What disappears is the ability to treat the aggregate as one coherent actor rather than a negotiated outcome of different goal functions.

The strategic conflict you feel at the top is often not a symptom of weak coordination. It is the normal output of a coalition that keeps asking incompatible subunits to produce one clean direction.`,
    },
    survivalCriteria: [
      "Keep coalition dynamics explicit.",
      "Preserve conflicting goal functions and time horizons.",
      "Do not soften the conflict into communication failure.",
    ],
    knownFailurePatterns: [
      "Reframes coalition dynamics as cross-functional friction.",
      "Generic team alignment advice.",
      "Treats the organization as a unified actor with execution issues.",
    ],
    rules: {
      expectedPhenomenonType: "structural",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "coalition", patterns: ["coalition", "subunit", "unit"] },
        { name: "goal_function", patterns: ["goal", "objective", "incentive", "measure"] },
        { name: "time_horizon", patterns: ["time horizon", "temporal horizon", "timeline", "timelines", "quarter", "future", "cadence", "horizon", "monthly", "annual"] },
        { name: "conflict", patterns: ["conflict", "incompatible", "coherent actor", "coherence"] },
      ],
      disallowedPatterns: [
        { name: "communication_substitution", pattern: "communication problem|cross-functional friction|culture issue" },
      ],
    },
  },
  {
    id: "emergent-strategy-no-owner",
    label: "Emergent strategy that no one owns",
    input: {
      topic: "Why good decisions can produce a strategy no one chose",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain how a strategy can emerge without explicit intention through a sequence of reasonable decisions.",
        notes: [
          "Emergent strategy forms below the threshold of deliberate choice.",
          "No single decision changes the strategy enough to look decisive.",
          "Ownership disappears because the aggregate outcome was not planned by any one actor.",
          "The pattern becomes visible only after commitments have accumulated.",
        ],
        thesisHint:
          "A company can end up with a strategy no one chose because strategy also emerges from the accumulated sequence of decisions that seemed too small to name at the time.",
        examples: [
          "A series of enterprise exceptions slowly rewrites the product and sales motion.",
          "A founder keeps saying yes to sensible edge cases until the edge case becomes the business.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Good Decisions Produce a Strategy No One Chose",
      summary:
        "Emergent strategy forms through a sequence of reasonable decisions that never looked large enough to count as strategy on their own.",
      bodyMarkdown: `A company can adopt a strategy without ever choosing one explicitly. The shift happens when a sequence of sensible decisions begins to add up faster than anyone can still treat them as exceptions.

The problem is not one bad call. It is that small accommodations, local optimizations, and plausible exceptions accumulate into a direction with no clear owner. Each decision is too minor to feel strategic on its own. The aggregate is unmistakably strategic once it has hardened.

That is why emergent strategy is difficult to govern. It does not arrive as a declared plan. It arrives as the residue of choices made under pressure, often by actors solving legitimate local problems.

By the time leadership can name the new direction, it is already embedded in product scope, customer expectations, and revenue dependence. Nobody chose it in one moment, but the company still has to live with it as if someone had.`,
    },
    survivalCriteria: [
      "Keep emergence explicit.",
      "Preserve the difference between local exception and aggregate direction.",
      "Keep ownership ambiguity intact.",
    ],
    knownFailurePatterns: [
      "Turns emergent strategy into generic drift.",
      "Assigns a single owner to the whole pattern.",
      "Resolves ambiguity into a neat execution mistake.",
    ],
    rules: {
      expectedPhenomenonType: "emergent",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "emergence", patterns: ["emergent", "emerge", "residue"] },
        { name: "sequence", patterns: ["sequence", "accumul", "add up", "exception"] },
        { name: "ownership", patterns: ["owner", "ownership", "owns", "owned", "responsib", "no one chose", "nobody chose", "no single person", "explicitly chose", "selected", "authorized"] },
        { name: "strategy", patterns: ["strategy", "direction", "scope"] },
      ],
      disallowedPatterns: [
        { name: "drift_substitution", pattern: "just drift|simple drift|execution drift" },
      ],
    },
  },
  {
    id: "metrics-mask-market-loss-perceptual",
    label: "Metrics masking market loss",
    input: {
      topic: "Why healthy metrics can hide market loss",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain how local metrics can stay healthy while the company loses strategic position, without reducing the issue to vanity metrics.",
        notes: [
          "Subunit metrics can improve while the firm moves away from its intended market.",
          "Dashboards are built around local outcomes, not around the organization's aggregate strategic direction.",
          "Perception is the problem: the organization can see activity and output more clearly than it can see strategic loss.",
          "The contradiction often becomes visible only when retention, implementation cost, or sales friction start to surface together.",
        ],
        thesisHint:
          "Healthy metrics can hide market loss because dashboards are optimized to show local performance, not whether the combined decisions still fit the market the company meant to serve.",
        examples: [
          "Lead volume rises while close rates fall and implementation complexity climbs.",
          "Activation improves in one segment while retention weakens in the segment the company says it wants to own.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Healthy Metrics Can Hide Market Loss",
      summary:
        "Metrics can improve while strategic position weakens because dashboards measure local performance more clearly than they reveal aggregate market fit.",
      bodyMarkdown: `A company can look healthier on its dashboards while becoming less suited to the market it claims to serve. The contradiction is possible because metrics are usually designed to register local performance, not aggregate strategic fit.

Marketing sees efficient acquisition. Sales sees larger contracts. Product sees activation improvement in the segment it just optimized for. None of those signals is false. The problem is that they do not show what the company is becoming in combination.

That is why market loss often arrives as a perceptual failure before it arrives as a financial one. The organization can see output, throughput, and isolated wins more easily than it can see the directional cost of combining them.

The metrics are not lying. They are measuring the wrong level of reality. By the time the missing fit becomes legible, the company has usually already trained itself around customers it never meant to center.`,
    },
    survivalCriteria: [
      "Keep perception and visibility limits central.",
      "Preserve the difference between local metric truth and aggregate market loss.",
      "Do not collapse the issue into vanity metrics.",
    ],
    knownFailurePatterns: [
      "Reduces the problem to vanity metrics or KPI misuse.",
      "Turns perceptual failure into a simple analytics problem.",
      "Ends with generic dashboard advice.",
    ],
    rules: {
      expectedPhenomenonType: "perceptual",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "metrics", patterns: ["metric", "dashboard", "KPI", "signal"] },
        { name: "market_fit", patterns: ["market", "fit", "segment", "customer"] },
        { name: "local_truth", patterns: ["local", "isolated", "subunit", "team"] },
        { name: "visibility", patterns: ["see", "visible", "perceive", "legible"] },
      ],
      disallowedPatterns: [
        { name: "analytics_fix", pattern: "better dashboards|better analytics|better KPI hygiene" },
      ],
    },
  },
  {
    id: "approval-loop-latency-mechanical",
    label: "Mechanical delay from approval loops",
    input: {
      topic: "Why harmless approval rules create strategic delay",
      contentType: "insight",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Explain how repeated approval loops turn routine caution into systemic delay.",
        notes: [
          "Delay compounds when each handoff adds small review latency to an already time-sensitive decision.",
          "No single approval step looks expensive in isolation.",
          "Mechanical delay comes from rule interactions, not from disagreement.",
          "Organizations often misread this as an individual performance problem rather than a slow path.",
        ],
        thesisHint:
          "Approval chains create strategic delay because the interaction of harmless review steps compounds into a response path that cannot move at the speed the situation requires.",
        examples: [
          "A pricing exception needs review from sales leadership, finance, legal, and product before anyone can answer the customer.",
          "Every reviewer says yes, but the answer arrives after the deal has moved on.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "Why Harmless Approval Rules Create Strategic Delay",
      summary:
        "Strategic delay often comes from the way review rules compound into a slow path, not from disagreement or personal hesitation.",
      bodyMarkdown: `Organizations often manufacture delay mechanically before anyone makes a bad decision. The problem is not that reviewers disagree. The problem is that each harmless approval step adds latency to a path that was already time-sensitive.

One review rarely looks expensive. Finance needs a number. Legal wants a clause. Product wants to understand the exception. Each step is defensible on its own. The interaction is what matters. The path slows because the rule set compounds, not because any one gate is unreasonable.

That is why approval-loop delay is so easy to misdiagnose. It gets explained as hesitation, weak accountability, or poor execution. In reality it is often the output of a process whose local safeguards combine into a response time the situation cannot tolerate.

Every reviewer can behave responsibly and the organization can still answer too late. The delay is already inside the path before anyone along it decides to stall.`,
    },
    survivalCriteria: [
      "Preserve rule interaction and path latency as the mechanism.",
      "Do not reframe the problem as disagreement or weak ownership.",
      "Keep the compounding effect explicit.",
    ],
    knownFailurePatterns: [
      "Treats delay as a cultural or motivational issue.",
      "Explains the problem with generic bureaucracy language only.",
      "Ends with vague advice about faster decision-making.",
    ],
    rules: {
      expectedPhenomenonType: "mechanical",
      expectedContentType: "insight",
      closingMode: "consequence",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "approval_path", patterns: ["approval", "review", "gate", "handoff"] },
        { name: "latency", patterns: ["delay", "latency", "slow", "too late"] },
        { name: "interaction", patterns: ["interact", "compound", "path", "sequence", "sequential", "accumul", "stack", "cascade"] },
        { name: "mechanical", patterns: ["rule", "process", "mechanical"] },
      ],
      disallowedPatterns: [
        { name: "ownership_substitution", pattern: "lack of ownership|slow people|low urgency" },
      ],
    },
  },
  {
    id: "signal-authority-audit-note",
    label: "Application-led note on signal-to-authority gaps",
    input: {
      topic: "How founders can audit where weak signals die inside the company",
      contentType: "note",
      audience: "founders",
      locale: "en-us",
      plannerInput: {
        goal: "Give founders a practical way to inspect where weak signals lose force before they reach the authority to trigger action.",
        notes: [
          "The useful question is not whether weak signals exist but where they stop carrying decision weight.",
          "Founders need a compact audit lens, not a full operating model.",
          "The audit should trace signal detection, interpretation, escalation, authority, and resource movement.",
          "This case is intentionally application-led to distinguish it from diagnosis-led insights.",
        ],
        thesisHint:
          "Weak signals usually die in the gap between who notices them, who can legitimate them, and who can move resources against them.",
        examples: [
          "Support sees the pattern, product validates it, but no one with budget treats it as urgent.",
          "Sales sees competitor pressure first, but roadmap authority is insulated from deal-loss evidence.",
        ],
        sourceMode: "notes",
      },
    },
    approvedReference: {
      title: "How to Audit Where Weak Signals Die",
      summary:
        "A useful weak-signal audit traces detection, interpretation, escalation, authority, and resource movement to find where response loses force.",
      bodyMarkdown: `If weak signals keep dying inside the company, do not start by asking who missed them. Start by tracing where they lost the power to change a decision.

A useful audit follows one signal across five steps: who detected it first, who translated it into a claim the organization could take seriously, who escalated it, who held the authority to respond, and what resource would have had to move if the response were real. The point is not documentation. The point is to find the exact handoff where the signal stopped carrying force.

Most organizations discover that the signal did travel. What failed was the conversion from observation into legitimate action. That is the gap worth diagnosing, because it tells you whether the problem sits in interpretation, escalation, authority, or commitment.

Run the audit on one concrete signal, not an abstract category. If the same gap appears twice, you are no longer looking at noise. You are looking at the point where your organization turns notice into delay.`,
    },
    survivalCriteria: [
      "Allow application and operator-directed language.",
      "Keep the signal-to-authority chain concrete.",
      "Preserve the diagnostic structure of the audit.",
    ],
    knownFailurePatterns: [
      "Collapses into generic leadership advice.",
      "Loses the specific handoff chain and becomes broad process talk.",
      "Turns application into a motivational close.",
    ],
    rules: {
      expectedPhenomenonType: "structural",
      expectedContentType: "note",
      closingMode: "operator_allowed",
      allowProposedConcepts: false,
      maxRetryCount: 1,
      requiredAnchorGroups: [
        { name: "signal", patterns: ["signal", "notice", "detect"] },
        { name: "authority_chain", patterns: ["authority", "escalat", "resource", "decision"] },
        { name: "audit", patterns: ["audit", "trace", "map", "follow"] },
        { name: "handoff", patterns: ["handoff", "step", "gap", "conversion", "pathway", "path", "chain", "node", "transfer", "route"] },
      ],
      disallowedPatterns: [
        { name: "motivational_close", pattern: "believe in the signal|trust your instincts|act boldly", scope: "closing" },
      ],
    },
  },
];
