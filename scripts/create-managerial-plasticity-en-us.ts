import 'dotenv/config';
import { createDraftPost } from '../ops/shared/cms/write';
import { getCategoryRefByTranslationKey, inspectPostById } from '../ops/shared/cms/read';

const bodyMarkdown = `The strategy was on track and hitting close to its targets. The market was moving within the scenarios the intelligence had mapped — few surprises, nothing outside the range of what the leadership team had planned for. They had the data, the mandate, and the budget. The transformation stalled anyway.

This happens often enough that it cannot be explained by strategy failure. The strategy, in most of these cases, was not the problem. The problem was the cognitive architecture of the people responsible for executing it: executives whose mental models of how their industry worked had been built over decades of success and had calcified, invisibly, into the ceiling of what the organization could become.

A firm transforms only as fast as its leaders can revise their own mental models. Not as fast as the market demands. Not as fast as the strategy specifies. As fast as the people at the top can genuinely change how they think.

*This is the problem managerial plasticity names.*

Plasticity, in neuroscience, refers to the brain's capacity to rewire itself in response to new experience. The term is useful here not as decoration but as a precise description of what organizational transformation actually requires at the leadership level. It is not the acquisition of new information. Executives at this level are, almost without exception, voracious learners. They read, travel, attend conferences, hire consultants, and commission research. The problem is not input.

The problem is revision. Adding new information to an existing mental model is learning. Dismantling part of the model because it is no longer accurate is unlearning: restructuring the underlying framework, not appending to it. The two processes are not on the same continuum. They require different cognitive operations, produce different kinds of discomfort, and fail in different ways.

Chris Argyris spent four decades studying why intelligent, educated professionals were often the worst learners in their organizations. His central finding, developed across two landmark studies, was precise enough to be uncomfortable.

In *Teaching Smart People How to Learn* (1991), Argyris documented what he called the defensive reasoning trap. High-achieving professionals had built their careers on a particular kind of competence: identifying problems in the world outside themselves and solving them. When the problem was external, they performed brilliantly. When the problem required examining their own assumptions, they short-circuited. Not from lack of intelligence. From too much investment in the mental models that their intelligence had produced.

The mechanism operates through what Argyris and Donald Schon named the distinction between single-loop and double-loop learning (1978). Single-loop learning corrects errors within the existing framework: the executive adjusts tactics, reallocates resources, changes the plan. The underlying assumptions stay intact. Double-loop learning questions the framework itself: it asks whether the goals, values, and mental models driving the strategy are still accurate. Most executives do the first well. Most executives actively resist the second, not from laziness, but from a deeply conditioned instinct to protect the models that produced their success.

These findings are now thirty-five years old. They are also more relevant in 2026 than when they were published, for a specific reason. Argyris identified a cognitive and behavioral mechanism, not a technological or market condition. Cognitive and behavioral mechanisms do not date the way strategy frameworks date. What has changed since 1991 is not the mechanism but the pressure on it. Market cycles have compressed. AI tools now produce more information, faster, than any executive team can process. The volume of input has increased enormously; the organizational capacity for double-loop revision has not kept pace. If anything, the abundance of data creates a new version of the same trap: executives who are better informed than ever, and no more likely than ever to revise the assumptions through which that information is filtered.

What Argyris observed in his fieldwork, and what I have observed repeatedly in executive contexts, is that this resistance does not feel like resistance. It feels like rigor. The executive who interrogates the data, challenges the analyst's methodology, and asks for more evidence before revising a core assumption experiences themselves as being intellectually careful. The defensive move and the critical move are phenomenologically identical from the inside. That is precisely what makes the pattern so durable.

## Figure 1 Placeholder

*Reserve this slot for SVG 1: single-loop vs. double-loop learning.*

> The defensive move and the critical move are phenomenologically identical from the inside. That is precisely what makes the pattern so durable.

The practical signature of this failure is recognizable. An executive encounters evidence that contradicts a long-held assumption, about customer behavior, competitive dynamics, the economics of the business, and rather than revising the assumption, they revise the evidence. The data is incomplete. The case is an outlier. The analyst doesn't understand the industry. The reframe arrives automatically, below the level of conscious decision, and it does the job it was designed to do: the model survives intact.

The people closest to the customer see it first. Front-line teams, account managers, customer success leads: they accumulate signal months before it reaches any executive dashboard, and they frequently know that what they are seeing does not fit the current model. The organizational distance between that signal and the decision center is not primarily a communication problem. It is a reception problem. The signal arrives. The mental model filters it before it can register as a threat to the model itself. Information that challenges a premise does not receive the same hearing as information that confirms one. This is not a failure of process. It is the normal operation of a cognitive system optimized, over years, for pattern recognition rather than pattern revision.

## Figure 3 Placeholder

*Reserve this slot for SVG 3: the signal-to-decision-center gap.*

The cost of this, at the organizational level, is structural. When the people responsible for directing a transformation cannot revise their model of what needs to change, the transformation becomes an elaborate performance of change rather than change itself. New processes are installed inside old logic. New language describes unchanged behavior. The organization moves through the motions with genuine effort and produces, at enormous cost, a slightly updated version of what already existed.

The firms that escape this pattern share one observable characteristic: leaders who treat their own prior conclusions as provisional. Not performatively, not the false humility of an executive who publicly invites challenge but privately punishes it, but operationally. Leaders who have built into their decision-making practice a genuine mechanism for detecting when their model of a situation has diverged from the situation itself.

Satya Nadella's transformation of Microsoft between 2014 and 2019 is the most studied recent example, and it is studied for the right reason. The cognitive shift that made the transformation possible was not a new strategy. It was a revised mental model of what Microsoft was competing for. The prior model, Microsoft as a platform company protecting Windows and Office, was not wrong in the abstract. It was wrong for the conditions that existed in 2014. Nadella's contribution was not the cloud strategy itself. It was the willingness to treat the prior model as obsolete before the financial pressure made revision unavoidable. That willingness, demonstrated consistently at the leadership level and structurally reinforced through hiring and organizational design, created the conditions under which the rest of the organization could follow.

The contrast case does not require naming. Every major industry in the past two decades has produced its own version of a leadership team that held the old model long enough to watch the window close.

## Figure 4 Placeholder

*Reserve this slot for SVG 4: three moments in the plasticity window.*

Managerial plasticity is not a personality trait. It is not a function of intelligence, open-mindedness, or leadership style. It is a practice: the deliberate subjection of operating assumptions to stress, on a schedule that does not wait for crisis to force the question.

The failure mode it guards against has a precise mechanism. Mental models that produce success accumulate epistemic weight: they become harder to revise not because they are more right, but because more of the organization's structure, processes, and identity have been built on top of them. The more successful the model has been, the more it costs to touch it. By the time the evidence against it is overwhelming, the cost of revision has become prohibitive, not financially, but cognitively and organizationally. The leader who needed to revise their model five years ago now faces a different problem: an entire organization that has organized itself around the model's premises.

This is why transformation almost always comes too late. Not because leaders are incapable of change. Because the conditions that make change most necessary are precisely the conditions that make it most costly.

## Figure 2 Placeholder

*Reserve this slot for SVG 2: the revision cost curve.*

> The conditions that make change most necessary are precisely the conditions that make it most costly.

Conventional leadership development is, almost entirely, a learning system. It adds: frameworks, cases, skills, networks, exposure. What it rarely does is subtract, deliberately stress-testing the assumptions the executive already holds, in conditions where being wrong is survivable and revision is expected. The result is a pipeline of executives who are exceptionally well-equipped to operate within their mental models and exceptionally underprepared to revise them. Argyris identified this failure in 1991. The leadership development industry has not substantially addressed it since.

A firm that wants to compound through disruption rather than merely survive it needs something different at the top. Not smarter leaders. Not more informed ones. Leaders whose cognitive architecture has been maintained for plasticity: for the specific capacity to hold success lightly enough to question it before the market forces the question.

That capacity is the scarcest resource in organizational transformation. It cannot be hired. It cannot be mandated. It has to be built, deliberately, structurally, over time, in the people the organization has already placed at the ceiling of what it can become.

*Organizational unlearning is the mechanism. Managerial plasticity is the condition that makes it possible. The difference matters because one can be mandated as a process and the other cannot.*`;

const translationKey = 'managerial-plasticity';
const locale = 'en-us' as const;
const dryRun = !process.argv.includes('--save');

const main = async () => {
  const categoryRef = await getCategoryRefByTranslationKey(locale, 'essay', true);

  const result = await createDraftPost({
    locale,
    translationKey,
    title: 'On Managerial',
    titleEmphasis: 'Plasticity',
    slug: 'on-managerial-plasticity',
    excerpt:
      'Why intelligent leadership teams fail to revise the assumptions that no longer fit reality, and why transformation stalls long before strategy does.',
    bodyMarkdown,
    contentType: 'essay',
    categoryRef: categoryRef || undefined,
    seoTitle: 'On Managerial Plasticity | Leonardo Camacho',
    seoDescription:
      'A long-form essay on unlearning, executive cognition, and why firms transform only as fast as leaders can revise their mental models.',
    publishedAt: '2026-04-01T12:00:00.000Z',
    dryRun,
  });

  console.log(JSON.stringify(result, null, 2));

  if (!dryRun) {
    const inspection = await inspectPostById(result.draftId);
    console.log('\n--- inspection ---');
    console.log(JSON.stringify({
      draft: inspection.draft
        ? {
            id: inspection.draft.presentedId,
            locale: inspection.draft.locale,
            translationKey: inspection.draft.translationKey,
            title: inspection.draft.title,
            slug: inspection.draft.slug,
            readTimeMinutes: inspection.draft.readTimeMinutes,
          }
        : null,
    }, null, 2));
  }
};

main().catch((error) => {
  console.error('[create-managerial-plasticity-en-us] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
