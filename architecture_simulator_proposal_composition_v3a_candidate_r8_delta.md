# Architecture Evolution Simulator — V3A Candidate r8: Selected Plan Semantics Delta

**Version:** `V3A-candidate-r8-delta` (versioned candidate amendment to r7; **not** a semantically committed baseline).  
**Status:** `TRANSACTION OPEN / SELECTED USER DIRECTIONS + CANDIDATE DESIGN COMPLETION`; no `VE-*` promotion.  
**Date:** 2026-10-09.  
**Source/lineage:** `architecture_simulator_proposal_composition_v3a_candidate_r7.md` (historical candidate), accepted R9 Q1–Q5, R10 accepted PR-2, R11 findings, R12 user decisions, later explicit user decisions on **Evolution Fitness** and the permission to fix document-level contradictions before prototyping.  
**Composition rule:** r7 continues to supply unchanged N/FR, baseline/proposal lineage and historical review context; the **exact named provisions below supersede the corresponding candidate r7 provisions** when interpreting r8. All unlisted r7 proposals retain their candidate status except references explicitly remapped here. Do **not** imply that r7 was edited in place or that any item has acquired committed-baseline or prototype-validated status. This is a **versioned delta composition**, not a 2,473-line replacement.

## 1. Scope and non-negotiable semantic decisions

1. The current product is a **prepared/scripted, interactive explanatory and comparative simulator**. Authors provide cases, candidate plans, events and consequences. Users study them; architecture authoring and planning for arbitrary real applications are **possible future products**, not current acceptance requirements.
2. **Exactly one planning composition per branch/revision: `Plan`**. There is **no independently stored `EvolutionMap` or `EvolutionMapRevision`**. `PlanRevision` is the working name for an immutable historical version of this single plan; exact implementation class names remain undecided.
3. The Plan includes **Evolution Steps**, other planned work, anticipated/possible events and their forecast effects, known/possible conditions, multi-Step conditional routes, lightweight optional Steps, planned time/forecasts/deadlines, and Planned Change Axes. A visual evolution route is a **projection of the Plan**, never a second canonical plan.
4. **Evolution Step** means a planned action **changing/expanding functionality or realization/implementation/code**, including refactoring, migration, feature work and changes to behavior. Testing/analysis/coordination/release preparation may appear as other planned activities or as attached work evidence; they do not automatically become Evolution Steps merely because they consume effort. Work may be traced to a concrete goal/change (R10 PR-2).
5. All compared architectures share a **common development starting point and the same architecture-independent/exogenous scenario events and circumstances**. After that, **causally justified consequences** of different architectures, implementation readiness and traceable team decisions may diverge: event sequences, work, commercial outcomes and subsequently known requirements. Never give one architecture an arbitrarily more favorable external scenario.
6. A fictional **calendar/time dimension** can locate Actual Events, projected activities, possible events, forecasts and deadlines. Chronology, event identity, route applicability, planned completion and factual completion are distinct.
7. Plans may **forecast a specific future requirement** in response to a possible event, or express less-concrete expected repeated directions via **Planned Change Axes**. **High project dynamism** may drive revisions in the directions/salience of those axes. Forecasting does not create factual requirement knowledge.
8. An anticipated event can forecast effects on requirements, plans, routes, timing and qualitative likelihood. "More/less likely" is a **historically situated qualitative belief**, not a fixed probability, a factual occurrence, or automatic execution.
9. **Evolution Fitness is contextual:** whether realizing a requirement/goal in a given current or proposed state requires uncomfortable, forced, unplanned or costly migrations, and how well that state/change **fits the known Plan** (future Steps, Change Axes and conditional routes). The evaluation referent may be current state, proposed code change, Step result, route or actual development. It is **route-, knowledge- and time-relative**. An intentionally planned, acceptably costly migration or justified deviation from an obsolete plan is not automatically a failure. Evidence is explicit and decomposed; no hidden universal fitness score.

## 2. Revised FR coverage / unchanged FR identities

The retained `N-1..N-13`, `FR-1..FR-25` and **candidate** `FR-26..28` are not renumbered or implicitly semantically committed. Relevant concrete cross-checks:

- `N-4` anticipatory change, `N-11` event dynamics, `N-12` quality of work and `N-13` work for a specific goal/change all apply to **conditional Plan routes**, not merely a static architecture diff.
- `FR-8/9/27`: future facts already **known** to the fictional team belong to actual-time knowledge even if implementation is scheduled later; a **predicted possible demand** is Plan forecast/uncertainty until factually revealed. No hindsight from the author's finished script.
- `FR-10`: retain **separate cost classes** (e.g. up-front state complexity, transition/migration, coordination, rework, delay/opportunity where modeled). Do not smuggle them into a single unexplained fitness number.
- `FR-12/18`: common independent external events are comparable; branch-dependent events and effects need explicit provenance.
- `FR-14`: deterministic prepared case first; probability engine/Monte Carlo are not prerequisites.
- `FR-15/22..25`: inspect raw impacts, work and supported quality indicators; reversibility and migration difficulty are contextual, not architecture-brand labels.
- `FR-16..20`: fictional time ≠ event order or identity; factual event/state replay and architecture-local histories stay reconstructible.
- `FR-26..28` (still candidate) remain: non-normalized requirement occurrences; factual requirement knowledge at the chosen **branch-local** actual point; Actual Events ≠ Plan/Steps.

## 3. Revised Candidate Design Constraints

### CDC-10@r8 — Fair shared exogenous scenario; causally divergent requirements

**REVISED_FROM CDC-10@r6.** The compared architectures must share a reproducible starting development situation and identical architecture-independent external events/constraints at comparable scenario anchors. A shared independent requirement occurrence is not dropped or rewritten to favor one alternative. After causal divergence, `RequirementModel@branch-local actual cursor` may legitimately differ when a factual branch event (for example, a contract made possible by delivery readiness) introduces branch-specific demand. Preserve provenance from shared/branch events to knowledge. A common fictional date or scenario event anchor **does not imply** identical branch-local factual event IDs or requirement models. This is a scoped revision, not an assertion that r7 was always wrong for aligned shared events.

### CDC-12@r8 — Factual context + one conditional Plan

**REVISED_FROM CDC-12@r6.** Canonical conceptual separation:

```text
Shared scripted scenario / architecture-independent events / fictional calendar
  -> architecture branch factual ActualEventHistory + state at branch-local actual cursor
       -> RequirementModel (non-normalized, factually known here)
       -> CurrentArchitectureSnapshot + CurrentImplementationSnapshot (fake file tree)
       -> available historical PlanRevision(s) / active Plan
            immutable BASE; timed EvolutionSteps + other planned work
            anticipated/possible events and forecast effects
            conditions, conditional Step routes, EvolutionOptions
            PlannedChangeAxes, expected dates, deadlines, qualitative expectations
            planned target ArchitectureSnapshot and EvolutionImpact per Step/route
```

There is no additional canonical `EvolutionMapRevision` or duplicate planned truth in a projection/view.

### CDC-16@r8 — Full architecture target plus inspectable implementation-changing outcome

**REVISED_FROM CDC-16@r6.** Every Evolution Step on a particular planned route remains a transition from an applicable predecessor to a **complete target ArchitectureSnapshot**. The target architecture may equal its predecessor while behavior/code/files change; such a Step still needs an **inspectable planned realization effect** (at minimum the relevant file/implementation effect or target projection where modeled), distinct from the architecture target. It is **not yet required** to store a separate full ImplementationSnapshot for every Step. A Step that really changes neither functionality nor realization is not an Evolution Step merely because it is scheduled work. Preserve non-monotonic structural transitions.

### CDC-19@r8 — Historical Plan BASE and forecast content are immutable

**REVISED_FROM CDC-19@r7.** Historical `PlanRevision` is anchored to `based_on_actual_event_ref` **including branch identity**, its factual BASE architecture/implementation knowledge and creation-time forecasts. Its entire authored planning content is historically immutable: scheduled Steps and route conditions, possible/anticipated events and expected impacts, optional work, deadlines and date versions, qualitative likelihood expectations, Planned Change Axes (direction/salience/horizon), and other planned activities. A later actual event cannot silently rewrite an older plan. At an old revision show what was known and anticipated **then**, including false forecasts.

### CDC-20@r8 — Exact Step versions and route applicability

**REVISED_FROM CDC-20@r7.** Exact plan-defining Evolution Step versions remain immutable; reuse of unchanged versions across revisions/routes is allowed **only when predecessor applicability, target architecture, intended implementation effect and relevant condition/route context stay valid**. Changed semantics require new version and `REVISED_FROM` provenance. A common display title is not enough to reuse a version. Route-conditional target projections must never appear as a single inevitable future.

### CDC-21@r8 — Forecast ≠ fact ≠ realization

**NEW CANDIDATE CONSTRAINT.** Distinguish (a) known factual requirement at the selected branch-local cursor, including known future-effective obligations; (b) a Plan's specifically **predicted** conditional requirement; (c) less-specific Planned Change Axis; (d) planned event and expected consequence; (e) factually occurred Actual Event / actual revealed demand; (f) realized implementation. A forecast becoming more likely does not trigger it, create a factual requirement or complete its Step. Plan conditions becoming satisfied make routes **applicable**, not factually executed; a new PlanRevision is needed when the team **actually replans**, not automatically at every expected condition.

### CDC-22@r8 — Truthful deadlines and time

**NEW CANDIDATE CONSTRAINT.** A deadline may have stable conceptual identity and a revised promised/required date with immutable change history; **forecast completion** can slip without moving the obligation. Missed-deadline claims require factual state at the relevant time. The fictional calendar permits shared exogenous events and branch-specific progress at the same date. Temporal plan items need not all have exact timestamps; windows, order and relative times are valid where appropriate.

### CDC-23@r8 — Traceable route-relative Fitness and comparative causality

**NEW CANDIDATE CONSTRAINT.** Fitness and forward consistency/impacts are evaluated **relative to a specified branch, historical PlanRevision, knowledge cutoff, selected state or proposed action, and relevant conditional route(s)**. Explain forced/awkward/costly migrations, planned vs unplanned migration, alignment or conflict with known future Steps/axes, and whether changing the plan itself is better than forcing compliance. Do not add effects from mutually exclusive routes to one inevitable sequence. No scalar, numeric probability or automatic winner is required. Exogenous events must be controlled, and downstream differences attributed only with traceable causal evidence; team planning/work differences must not be silently credited solely to an architecture label.

## 4. Revised / new preferred candidate Proposals

### P-23@r8 — Shared external scenario comparison

**REVISED_FROM P-23@r3.** Compare matched initial development conditions and independently occurring external events at shared scenario anchors/calendar times; allow only explained architecture-/work-dependent consequences to diverge. Support inspecting identical stimuli with different readiness, causal commercial outcomes, actual event sequences and emergent requirements. Preserve `KEEP`/inconclusive and raw evidence. **REQUIRES:** P-19/P-21/P-36 + CDC-10@r8. **Status:** selected candidate direction.

### P-31@r8 — Factual branch/time vs local planned-route selection

**REVISED_FROM P-31@r7.** UI exposes shared scenario calendar or comparable exogenous event anchor, selected architecture branch and its own factual event cursor. Plan inspection separately chooses a historical `PlanRevision`, conditional route and selected Step. Planned cursor never advances actual time or claims execution. Historical `BASE` differs from branch factual `CURRENT`. No particular widget or synchronized cursor UX is required yet. **REQUIRES:** P-19/P-21 + P-42@r8 + P-43@r8. **Status:** selected direction; precise cursor UX to be prototype-tested.

### P-36@r8 — Independent scenario events / branch-generated events / causal consequences

**REVISED_FROM P-36@r3.** Common exogenous scenario event identities/conditions remain shared; branch-local implementation/planning/commercial events may differ only with inspectable causal lineage (including traceable team choices), not arbitrary authored exogenous advantages. Common calendar instant ≠ common branch event ID. **RECOMMENDED_WITH:** P-23@r8 + P-31@r8. **Status:** selected candidate direction.

### P-39@r8 — Actual non-normalized requirements vs forecast demands

**REVISED_FROM P-39@r6; preserve all non-normalization requirements.** Factual requirement knowledge reconstructed **per branch-local Actual Event cursor**. Forecasted demands in Plan may describe specific potential requirements or general change axes, but are not copied into actual Requirements before factual discovery. A known future-effective requirement can already be factual knowledge. Technical tracing from a predicted item to a later actual requirement does not imply semantic deduplication of independent occurrences. **REQUIRES:** FR-26/27 candidate + CDC-10@r8/21@r8. **Status:** selected candidate direction.

### P-41@r8 — Current vs planned state semantics

**REVISED_FROM P-41@r7.** `CURRENT` refers only to actual state for the selected architecture branch and factual cursor. A Plan has an immutable `BASE` plus possibly conditional planned target architecture/implementation effects; Requirements are historical factual knowledge at BASE plus distinctly labeled Plan forecasts, **not one copied RequirementModel per Step**. Choosing a route/Step cannot imply it happened. **REQUIRES:** P-39@r8. **RECOMMENDED_WITH:** P-42@r8 + P-43@r8. **Status:** selected candidate direction.

### P-42@r8 — Single historical Plan with timed conditional Evolution Steps

**REVISED_FROM P-42@r7; replaces the old `EvolutionMapRevision` *concept*, not its retained useful invariants.** The Plan contains Evolution Steps changing functionality/implementation, other scheduled work, anticipated/possible events/conditions/forecast effects, deadlines, conditional routes, lightweight optional Steps, Change Axes and qualitative expectations. Each Step on its applicable route has a complete planned target ArchitectureSnapshot plus separate EvolutionImpact and inspectable implementation effect where relevant. Route fork/rejoin must preserve applicable predecessor state, dependency and target consistency. Planned events can change a qualitative branch expectation without selecting the branch as factual. **No separate EvolutionMap model or compulsory master-planner engine.** `PlanRevision` is a working label, not a frozen storage class. **REQUIRES:** P-40A + P-41@r8; **RECOMMENDED_WITH:** P-44@r8/P-45@r8/P-46@r8/P-49@r8. **Status:** selected user direction; concrete graph/data mechanics await prototype.

### P-43@r8 — Historical Plan revisions and immutable components

**REVISED_FROM P-43@r7.** A factual Planning Event creates/revises a complete immutable PlanRevision, preserving branch-local actual BASE, old Steps/versions and all historically stated deadlines, Change Axes, conditional routes, potential events, expectations and other authored planning content. Changed projections have lineage, not in-place mutation; do not require duplicating all unchanged objects. A factual trigger can make an existing route applicable without forcing a revision; actual replanning requires a Planning Event and new revision. **REQUIRES:** P-19 + P-42@r8; **RECOMMENDED_WITH:** P-31@r8. **Status:** selected candidate direction.

### P-44@r8 — Conditional EvolutionImpact and forward consistency

**REVISED_FROM P-44@r6.** EvolutionImpact is the per-Step intended change, not a full target snapshot. A selected architecture-native item or file reveals past and **route-qualified future** planned impacts, including split/migration/retirement where modeled. Forward consistency asks whether present/proposed work conflicts with **known future work on a specified possible route**, with warnings rather than prohibitions. Do not mix mutually exclusive effects. **REQUIRES:** P-42@r8; **RECOMMENDED_WITH:** P-47/P-48/P-49@r8. **Status:** selected candidate direction.

### P-45@r8 — Multi-Step conditional routes plus lightweight Evolution Options

**REVISED_FROM P-45@r6.** A Plan can have complete preprepared multi-Step conditional trajectories **and** lighter forecast options/templates for changes not yet fully planned. Possible events/conditions can forecast concrete requirement impacts, route selection or replanning. Event actually occurring ≠ plan Step actually happening. A ready route may become applicable with no new revision; converting/altering a lightweight option into concrete work may require a factual Planning Event/new revision. Exact activation grammar is deferred. **REQUIRES:** FR-8/9 + P-42@r8 + CDC-21@r8. **Status:** selected candidate direction.

### P-46@r8 — Historically revisable Planned Change Axes and actual Hot Paths

**REVISED_FROM P-46@r6.** PlannedChangeAxis is a **forecast**, particularly for non-specific/frequent future requirements: direction, area, salience and horizon where meaningful. **Project dynamism** is separate context and can cause those axes to be revised across PlanRevisions (new, strengthened, weakened, split, retired). `ActualHotPath` is evidence of repeated observed changes in factual history, not a rewritten Axis forecast. **RECOMMENDED_WITH:** P-42@r8/P-43@r8/P-49@r8. **Status:** selected candidate direction.

### P-49@r8 — Contextual Evolution Fitness

**NEW CANDIDATE PROPOSAL**, grounded in direct user clarification; distinct from `P-44` structural consistency and from global architecture rankings.

**Question/evaluation referent:** how suitable is the selected actual/planned architecture state **or contemplated change** for (a) realizing particular known or forecast/conditional requirements **without inconvenient or costly migration**, and (b) remaining coherent with the selected historical Plan's expected future Steps, routes and Change Axes? Inspect this at the level of current state, proposed code modification, Step result, conditional route or later actual outcome. Report **migration need, awkwardness, cost classes, degree of surprise/plannedness**, future rework and alignment/conflicts with plans; show evidence. Planned migration can be rational; a plan can be obsolete, so deviation from it is **not** automatically bad. The outcome is **contextual and route-relative**, not a requirement for a single scalar score, numeric likelihood, all-route optimization or reliable person-hour estimates. Preserve a weaker/harder fallback when rational. **DERIVED_FROM:** N-1/4/6/12/13, FR-6/7/8/9/10/15/22..25, direct user explanation. **REQUIRES:** P-42@r8 + P-44@r8; **RECOMMENDED_WITH:** P-23@r8 + P-45@r8/P-46@r8/P-47. **Status:** selected user-intent candidate; operational proxies need prototype evidence.

### P-24 / P-25..P-30 / P-47 / P-48 retained, clarified

WorkEpisode remains a **secondary grouping/projection of factual or planned work**, not canonical history; per-goal change work includes analysis, implementation, testing, migration, coordination, delay and separate costs (accepted R10 PR-2). No assumption that all these activities are Evolution Steps. P-47 stays a fictional project/file tree first; planned implementation effects in Step may be textual/file-level without an IDE/AST. Implementation Guidance under P-48 points to **Plan Steps and route-conditional impacts**, not an old separate EvolutionMap object. Their existing IDs remain as in r7 unless a later candidate finds a need to revise them formally.

## 5. Groups, relations and QRP disposition for r8

**PG-9 planned evolution / replanning is revised** to one conditional Plan; dependent edges must use `P-42@r8/P-43@r8/P-44@r8/P-45@r8/P-46@r8/P-49@r8`, not historical `EvolutionMapRevision` identities. `PG-8` Requirement ↔ Architecture distinction remains; `PG-10` Implementation impacts remains. These are **relation amendments**, not claims of new committed group IDs.

```text
P-23@r8  REQUIRES P-19, P-21, P-36@r8, CDC-10@r8
P-31@r8  REQUIRES P-19, P-21, P-42@r8, P-43@r8
P-39@r8  REQUIRES candidate FR-26/27, CDC-10@r8, CDC-21@r8
P-41@r8  REQUIRES P-39@r8; RECOMMENDED_WITH P-42@r8, P-43@r8
P-42@r8  REQUIRES P-40A, P-41@r8
P-43@r8  REQUIRES P-19, P-42@r8
P-44@r8  REQUIRES P-42@r8
P-45@r8  REQUIRES FR-8, FR-9, P-42@r8
P-46@r8  RECOMMENDED_WITH P-42@r8, P-43@r8, P-49@r8
P-49@r8  REQUIRES P-42@r8, P-44@r8
```

**Dependency hygiene repaired:** historical r7 used `P-41 REQUIRES P-42/P-43` while `P-42 REQUIRES P-41`, which forms a circular *hard* relation if taken literally. In this r8 candidate P-41 establishes the state/knowledge semantics; P-42 implements them, P-43 versions the Plan. **No back-edge `P-41 REQUIRES P-42/P-43` remains.** Other retained P-IDs' historical references to P-42/P-43 target their matching r8 versions when read as effective composition (not a claim the historical text changed). Verify graph acyclicity again before a semantic commit.

**QRP/history:** preserve old `QRP-P-40..53` and r7 uncertainty provenance; do not erase accepted historical mitigations. Add linked *candidate resolution notes* to R11-F-01..08 rather than rewriting R11. Specifically R11-F-03/F-04 selected user direction is settled; F-01/F-05/F-06/F-07/F-08 have selected candidate mitigations, **not yet prototype-validated**; F-02 cursor mechanics remain open. R10 F-P-1 accepted PR-2 is represented here; R10 F-P-2/F-P-3 documentation repairs are addressed in SC-001/README candidates, not inherited runtime evidence. No `VE-*` records were created.

## 6. Prototype readiness and explicit boundary

**Ready to author/execute a deterministic model/UX research prototype**, not ready to treat r8 as a semantically committed implementation schema. The smallest useful fixture: one common starting state, two architectures, identical architecture-independent external events, differing implementation durations and causal outcome, one branch-specific later requirement, an actual/forecasted requirement distinction, a refactoring or code-only Step, other non-Step planned activity, a factual deadline miss vs forecast slippage and genuine deadline renegotiation, Plan R1→R2 immutable revisions, two conditional routes, an Option, an axis made more/less salient under high project dynamism, and route-specific impacts/Fitness on a selected state/Step.

**Prototype acceptance must falsify:** leaked hindsight, fabricated branch-favoring external events, invented factual requirements from forecasts, plan auto-execution, deadline overwrite, obsolete Plan revisions drifting, a Step lacking traceable realization effects, incompatible Step reuse across routes, and misleading one-route future impact, or unexplained migration cost/time claims. UI test: viewer distinguishes **actual state, Plan forecast, applicable route, realized work** without a technical guide.

**Deferred deliberately:** universal conditional-event DSL, general DAG with arbitrary merge semantics, automatic schedule solver, quantitative probability fitting, exhaustive relation ontology, AST/IDE, one-number Fitness, exact person-hours. Return only when a concrete fixture cannot express/inspect a required fact without them.

**Governance:** r7 remains unchanged; no PT-003 evidence is promoted; historical PT-004 scope is not automatically retargeted. This r8 delta and its SC-001 companion are **local candidate documents** until synchronized/verified by the project-prescribed HOST/TUNNEL workflow; a Git commit alone is not a semantic commit.
