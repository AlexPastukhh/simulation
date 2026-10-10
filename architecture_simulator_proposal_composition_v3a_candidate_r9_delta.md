# Architecture Evolution Simulator — V3A Candidate r9: Single Plan / Conditional Steps / Staged Prototype

**Version:** `V3A-candidate-r9-delta` (versioned candidate amendment to r7; **not** a semantically committed baseline).  
**Status:** `TRANSACTION OPEN / SELECTED USER DIRECTIONS + CANDIDATE IMPLEMENTATION PROPOSALS`; not semantic commit; no `VE-*` promotion.  
**Date:** 2026-10-09.  
**Source/lineage:** Historical r7 + preserved r8 candidate overlay, accepted R9 Q1–Q5 and R10 PR-2, R11/R12/R13 discussion, R14 independent review and subsequent user clarifications (terminology, PT stages, conditional Steps, fixture authorship, snapshot reuse). Proposal IDs follow existing P-/CDC- lineage; R14-PR-* are review-origin proposals, not semantically committed baseline.  
**Composition rule:** This **r9 overlay replaces r8 as the single current candidate amendment** to historical r7. r8 remains preserved solely as versioned provenance. Named P-/CDC- in this r9 file are effective for the current candidate; unaffected N/FR/P and historical lineage come from r7 only where compatible. Earlier r7/r8 phase schedules and prototype targets are historical, **not instructions to execute**. r9 is not a 2,473-line replacement, is not a semantic baseline commit, and is not validated prototype evidence.

## 0. Effective reading contract / replacement map

| Read for | Effective candidate source | Historical only / no longer current instruction |
|---|---|---|
| Desired user journey and seven SRUs | `SC-001@v4-candidate` | `SC-001@v0..v3` retained for provenance |
| Single Plan semantics and versions | **`P-41/42/43@r9`, `CDC-12/19/20@r9`** | r7 `EvolutionMapRevision`, old separate Evolution Map and r8 P/CDC variants |
| Conditional Steps, event forecasts | **`P-42/45@r9`, `CDC-21@r9`** | r7 `EvolutionOption` as a mandatory primary object; r8's two-model Option+Step vocabulary |
| Events/comparability | **`P-23/31/36/39@r9`, `CDC-10@r9`** | r7 same-RequirementModel-at-any-cursor literal generalization |
| Code-only Step, impact and Fitness | **`P-42/44/49@r9`, `CDC-16/23@r9`** | physical ArchitectureSnapshot copy after every Step; hidden scalar fitness |
| Prototype sequence | **§6 of this r9 candidate, then a separately numbered PT artifact** | old r7 'PT-003 next' or automatic retargeting of historical PT-004 |

**Term usage in live text:** use **Plan** for the whole planned development and **Evolution Steps** for function/implementation-changing work. There is no separately stored or independently normative Evolution Map; legacy occurrences in historical documents are source references, not a second active model. Reissued `@r9` P/CDC records below inherit r8's earlier lineage; some wording is unchanged, while references now resolve to the single r9 overlay. `selected candidate` ≠ atomic semantic `COMMITTED`.


## 1. User-confirmed semantics and deliberately staged implementation proposals

1. Prepared/scripted comparative simulator now; viewers explore authored scenarios rather than dynamically authoring real software plans. Later authoring assistance is deferred.
2. **Only one Plan per architecture branch and historical planning revision**, with Evolution Steps, other work, conditional routes, potential events, forecast effects/requirements, deadline and timing expectations, Planned Change Axes and qualitative route expectations. `PlanRevision` is a provisional label. No separate Evolution Map, `EvolutionMapRevision` or `MasterPlan`.
3. **Evolution Step** is a planned action changing/extending functionality or realization/code/architecture (including refactoring, bugfix, migration). Other planned work such as analysis, testing, coordination and release preparation may live in Plan or within work evidence; it is not automatically an Evolution Step. Actual work dynamics for a selected change remain visible (R10 PR-2).
4. **Conditional/optional Steps** are ordinary planned Steps with explicit applicability conditions (`IF actual/known condition THEN Step(s)`). A possible anticipated event can change route applicability, introduce an expected concrete requirement, prompt replanning or revise qualitative expectations. The possible event and its expected effects are forecasts, not actual fact. A not-yet-detailed opportunity can stay a forecast/note; **no mandatory canonical `EvolutionOption` entity**. This is the selected validation-first candidate (R14-PR-03A), not proof that no future domain will need a separate option lifecycle.
5. Compare architectures from the same initial development circumstances under identical architecture-independent/situational events and constraints. Branch-local events, subsequent known demands, work and outcomes may differ **only with scenario-authored causal reasons**, not arbitrary branch-favoring exogenous stimuli. Authoring/evidence quality belongs to **scenario construction and fixture quality**; the runtime is not required to infer scientifically true effort or prove fictional durations.
6. Fictional calendar, event chronology and event identity are distinct. Planned timing, expected completion, deadline promises and factually completed work differ; revised deadlines retain history rather than erasing earlier obligations.
7. The fictional team can forecast concrete possible requirements (typically contingent on possible events), or use **Planned Change Axes** for less-specific change directions. Under high project dynamism the team can revise axes' direction/salience/horizon across immutable Plan revisions. Factual requirement knowledge cannot be made from forecast material, and authors' future omniscience must not leak to fictional teams.
8. An expected event or evidence can make an applicable conditional route **qualitatively more/less likely** without numerical probabilities, automatic route selection, actual occurrence or execution of its Steps.
9. **Contextual Evolution Fitness** examines (a) whether a particular requirement or change forces awkward/unplanned/costly migration, and (b) alignment of a selected actual/planned state or contemplated code change with the historically known Plan, conditional Steps/axes. Planned migration or justified replanning is not automatically harmful; route/time/knowledge matters. Preserve separate cost classes and evidence, not a universal scalar or winner.
10. **Prototype staging is explicitly in the PT plan** (§6 below): one separately numbered `PT-*` with Stage A/B/C and stage-specific falsification/gates, not three independent product models. R14-PR-02 is selected as a validation strategy; its gates are defined in §6 and belong in the eventual PT artifact. The historical PT-004 remains unretargeted until independently versioned.

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

### CDC-10@r9 — Fair shared exogenous scenario; causally divergent requirements

**REISSUED_FROM CDC-10@r8** (earlier lineage retained in r8). The compared architectures must share a reproducible starting development situation and identical architecture-independent external events/constraints at comparable scenario anchors. A shared independent requirement occurrence is not dropped or rewritten to favor one alternative. After causal divergence, `RequirementModel@branch-local actual cursor` may legitimately differ when a factual branch event (for example, a contract made possible by delivery readiness) introduces branch-specific demand. Preserve provenance from shared/branch events to knowledge. A common fictional date or scenario event anchor **does not imply** identical branch-local factual event IDs or requirement models. This is a scoped revision, not an assertion that r7 was always wrong for aligned shared events.

### CDC-12@r9 — Factual context + one conditional Plan

**REISSUED_FROM CDC-12@r8** (earlier lineage retained in r8). Canonical conceptual separation:

```text
Shared scripted scenario / architecture-independent events / fictional calendar
  -> architecture branch factual ActualEventHistory + state at branch-local actual cursor
       -> RequirementModel (non-normalized, factually known here)
       -> CurrentArchitectureSnapshot + CurrentImplementationSnapshot (fake file tree)
       -> available historical PlanRevision(s) / active Plan
            immutable BASE; timed EvolutionSteps + other planned work
            anticipated/possible events and forecast effects
            conditions, conditional Evolution Step routes (`IF`), no mandatory independent Option object
            PlannedChangeAxes, expected dates, deadlines, qualitative expectations
            planned target ArchitectureSnapshot and EvolutionImpact per Step/route
```

There is no additional canonical `EvolutionMapRevision` or duplicate planned truth in a projection/view.

### CDC-16@r9 — Full architecture target plus inspectable implementation-changing outcome

**REVISED_FROM CDC-16@r8** (r8 itself derived from r6). Every planned Evolution Step has a **complete inspectable ArchitectureSnapshot after that Step** for the applicable conditional path; no inference of structural change is required. If it is identical to its predecessor, **reusing the same immutable snapshot reference/storage is permitted**: the user-facing result is still the full architecture, not a missing snapshot. A code-only/behavior-only Step must additionally have a **nonempty planned implementation/functional effect** (description plus file/behavior reference when modeled), distinct from structural Architecture Impact and traceable from that Step. A separate full ImplementationSnapshot after every Step and duplicate stored ArchitectureSnapshots are **not mandatory**. The Step must change functionality or realization; mere scheduled discussion/wait is other Plan work. Non-monotonic architecture transitions remain supported.

### CDC-19@r9 — Historical Plan BASE and forecast content are immutable

**REVISED_FROM CDC-19@r8** (r8 traced to r7). Historical `PlanRevision` is anchored to `based_on_actual_event_ref` **including branch identity**, its factual BASE architecture/implementation knowledge and creation-time forecasts. Its entire authored planning content is historically immutable: scheduled Steps and route conditions, possible/anticipated events and expected impacts, optional work, deadlines and date versions, qualitative likelihood expectations, Planned Change Axes (direction/salience/horizon), and other planned activities. A later actual event cannot silently rewrite an older plan. At an old revision show what was known and anticipated **then**, including false forecasts.

### CDC-20@r9 — Exact Step versions and route applicability

**REVISED_FROM CDC-20@r8** (r8 traced to r7). Exact plan-defining Evolution Step versions remain immutable; reuse of unchanged versions across revisions/routes is allowed **only when predecessor applicability, target architecture, intended implementation effect and relevant condition/route context stay valid**. Changed semantics require new version and `REVISED_FROM` provenance. A common display title is not enough to reuse a version. Route-conditional target projections must never appear as a single inevitable future.

### CDC-21@r9 — Forecast ≠ fact ≠ realization

**REISSUED_FROM the matching r8 candidate constraint; still not semantically committed.** Distinguish (a) known factual requirement at the selected branch-local cursor, including known future-effective obligations; (b) a Plan's specifically **predicted** conditional requirement; (c) less-specific Planned Change Axis; (d) planned event and expected consequence; (e) factually occurred Actual Event / actual revealed demand; (f) realized implementation. A forecast becoming more likely does not trigger it, create a factual requirement or complete its Step. Plan conditions becoming satisfied make routes **applicable**, not factually executed; a new PlanRevision is needed when the team **actually replans**, not automatically at every expected condition.

### CDC-22@r9 — Truthful deadlines and time

**REISSUED_FROM the matching r8 candidate constraint; still not semantically committed.** A deadline may have stable conceptual identity and a revised promised/required date with immutable change history; **forecast completion** can slip without moving the obligation. Missed-deadline claims require factual state at the relevant time. The fictional calendar permits shared exogenous events and branch-specific progress at the same date. Temporal plan items need not all have exact timestamps; windows, order and relative times are valid where appropriate.

### CDC-23@r9 — Traceable route-relative Fitness and comparative causality

**REISSUED_FROM the matching r8 candidate constraint; still not semantically committed.** Fitness and forward consistency/impacts are evaluated **relative to a specified branch, historical PlanRevision, knowledge cutoff, selected state or proposed action, and relevant conditional route(s)**. Explain forced/awkward/costly migrations, planned vs unplanned migration, alignment or conflict with known future Steps/axes, and whether changing the plan itself is better than forcing compliance. Do not add effects from mutually exclusive routes to one inevitable sequence. No scalar, numeric probability or automatic winner is required. During **script/fixture authorship**, keep independent external events controlled and record the author-assumed causal chain for material branch divergences (architecture/work/readiness -> schedule -> outcome). The simulator should display/trace authored reasons and separate team decisions where relevant; it is **not** responsible for proving that fictional time estimates are empirically correct or automatically validating all author assumptions. No standalone runtime causal-proof engine or dedicated PT stage is required.

## 4. Revised / new preferred candidate Proposals

### P-23@r9 — Shared external scenario comparison

**REISSUED_FROM P-23@r8** (earlier lineage retained in r8). Compare matched initial development conditions and independently occurring external events at shared scenario anchors/calendar times; allow only explained architecture-/work-dependent consequences to diverge. Support inspecting identical stimuli with different readiness, causal commercial outcomes, actual event sequences and emergent requirements. Preserve `KEEP`/inconclusive and raw evidence. **REQUIRES:** P-19/P-21/P-36 + CDC-10@r9. **Status:** selected candidate direction.

### P-31@r9 — Factual branch/time vs local planned-route selection

**REISSUED_FROM P-31@r8** (earlier lineage retained in r8). UI exposes shared scenario calendar or comparable exogenous event anchor, selected architecture branch and its own factual event cursor. Plan inspection separately chooses a historical `PlanRevision`, conditional route and selected Step. Planned cursor never advances actual time or claims execution. Historical `BASE` differs from branch factual `CURRENT`. No particular widget or synchronized cursor UX is required yet. **REQUIRES:** P-19/P-21 + P-42@r9 + P-43@r9. **Status:** selected direction; precise cursor UX to be prototype-tested.

### P-36@r9 — Independent scenario events / branch-generated events / causal consequences

**REISSUED_FROM P-36@r8** (earlier lineage retained in r8). Common exogenous scenario event identities/conditions remain shared; branch-local implementation/planning/commercial events may differ only with inspectable causal lineage (including traceable team choices), not arbitrary authored exogenous advantages. Common calendar instant ≠ common branch event ID. **RECOMMENDED_WITH:** P-23@r9 + P-31@r9. **Status:** selected candidate direction.

### P-39@r9 — Actual non-normalized requirements vs forecast demands

**REISSUED_FROM P-39@r8** (r8 revised r6); preserve all non-normalization requirements. Factual requirement knowledge reconstructed **per branch-local Actual Event cursor**. Forecasted demands in Plan may describe specific potential requirements or general change axes, but are not copied into actual Requirements before factual discovery. A known future-effective requirement can already be factual knowledge. Technical tracing from a predicted item to a later actual requirement does not imply semantic deduplication of independent occurrences. **REQUIRES:** FR-26/27 candidate + CDC-10@r9/21@r9. **Status:** selected candidate direction.

### P-41@r9 — Current vs planned state semantics

**REISSUED_FROM P-41@r8** (earlier lineage retained in r8). `CURRENT` refers only to actual state for the selected architecture branch and factual cursor. A Plan has an immutable `BASE` plus possibly conditional planned target architecture/implementation effects; Requirements are historical factual knowledge at BASE plus distinctly labeled Plan forecasts, **not one copied RequirementModel per Step**. Choosing a route/Step cannot imply it happened. **REQUIRES:** P-39@r9. **RECOMMENDED_WITH:** P-42@r9 + P-43@r9. **Status:** selected candidate direction.

### P-42@r9 — Single Plan with conditional Evolution Steps

**REVISED_FROM P-42@r8** (r8 replaced the older Evolution Map from r7). Exactly one Plan owns the chosen branch's scheduled/conditional Evolution Steps, other work, possible events/forecast consequences, conditional requirements, deadlines, Change Axes, qualitative expectations and historical planning BASE. Conditional planned changes are written simply as **ordinary Evolution Steps plus applicability conditions**. Multiple Steps may share an `IF` branch. Plan rules can be preauthored; no optional Step automatically runs when its condition becomes true. A condition becoming true makes its route applicable, not factually realized; genuine replanning creates a new revision through a Planning Actual Event.

Each Step has an applicable predecessor state, a **complete planned target ArchitectureSnapshot** (which may reference the same immutable snapshot if unchanged), separate EvolutionImpact and **visible planned function/implementation effect** when structural architecture is unchanged. For a code-only Step, the latter must not be empty. Fork/rejoin cases must maintain compatible predecessor/target state and version provenance; exact data model is deliberately PT-scoped. There is no separate Evolution Map/model, `EvolutionOption` primary entity, generic graph DSL or calendar solver imposed now.

**REQUIRES:** P-40A + P-41@r9. **RECOMMENDED_WITH:** P-43@r9/P-44@r9/P-45@r9/P-46@r9/P-49@r9. **Status:** selected user direction for single Plan/Steps; conditional-Step representation is selected validation candidate; graph mechanics await PT.

### P-43@r9 — Historical Plan revisions and immutable components

**REISSUED_FROM P-43@r8** (earlier lineage retained in r8). A factual Planning Event creates/revises a complete immutable PlanRevision, preserving branch-local actual BASE, old Steps/versions and all historically stated deadlines, Change Axes, conditional routes, potential events, expectations and other authored planning content. Changed projections have lineage, not in-place mutation; do not require duplicating all unchanged objects. A factual trigger can make an existing route applicable without forcing a revision; actual replanning requires a Planning Event and new revision. **REQUIRES:** P-19 + P-42@r9; **RECOMMENDED_WITH:** P-31@r9. **Status:** selected candidate direction.

### P-44@r9 — Conditional EvolutionImpact and forward consistency

**REISSUED_FROM P-44@r8** (earlier lineage retained in r8). EvolutionImpact is the per-Step intended change, not a full target snapshot. A Step with no structural architecture change still has a nonempty functional/implementation effect, as required by CDC-16@r9. A selected architecture-native item or file reveals past and **route-qualified future** planned impacts, including split/migration/retirement where modeled. Forward consistency asks whether present/proposed work conflicts with **known future work on a specified possible route**, with warnings rather than prohibitions. Do not mix mutually exclusive effects. **REQUIRES:** P-42@r9; **RECOMMENDED_WITH:** P-47/P-48/P-49@r9. **Status:** selected candidate direction.

### P-45@r9 — Conditional and optional Evolution Steps without a second primary Option model

**REVISED_FROM P-45@r8**; SUPERSEDES its dual `Evolution Steps + EvolutionOptions` candidate. Within the **one Plan**, a fully specified optional change is simply an ordinary Evolution Step or a sequence of Steps annotated with applicable `IF` conditions; it has the same state/impact obligations as any other Step. A possible event may be forecast with explicit expected effects (new demand, route applicability, changed schedule, preparatory work or change in qualitative expectation). Occurrence of an event does **not** itself execute planned Steps or factually create a requirement before discovery. If a potential change is *not yet defined as an implementable Step*, preserve only a forecast/uncertainty note; do not invent an empty Step solely to store a possibility.

For initial PT, no first-class `EvolutionOption` or `OptionActivation` entity and no conversion workflow is necessary. **Revisit trigger:** a concrete use case where a not-yet-concretized potential change needs independent stable identity, versioning, activation and traceable lifecycle not expressible with Plan revisions, notes and conditional Steps. R14-PR-03A is **selected candidate**; R14-PR-03B (distinct option lifecycle) is **deferred alternative**, not rejected or semantically committed. Conditions are authored in the fixture; exact rule-expression grammar is out of scope.

**REQUIRES:** FR-8/9 + P-42@r9 + CDC-21@r9. **RECOMMENDED_WITH:** P-43@r9/P-46@r9. **Status:** selected candidate for staged PT, pending falsification and atomic composition commitment.

### P-46@r9 — Historically revisable Planned Change Axes and actual Hot Paths

**REISSUED_FROM P-46@r8** (earlier lineage retained in r8). PlannedChangeAxis is a **forecast**, particularly for non-specific/frequent future requirements: direction, area, salience and horizon where meaningful. **Project dynamism** is separate context and can cause those axes to be revised across PlanRevisions (new, strengthened, weakened, split, retired). `ActualHotPath` is evidence of repeated observed changes in factual history, not a rewritten Axis forecast. **RECOMMENDED_WITH:** P-42@r9/P-43@r9/P-49@r9. **Status:** selected candidate direction.

### P-49@r9 — Contextual Evolution Fitness

**REISSUED_FROM P-49@r8 candidate**, grounded in direct user clarification; distinct from `P-44` structural consistency and from global architecture rankings.

**Question/evaluation referent:** how suitable is the selected actual/planned architecture state **or contemplated change** for (a) realizing particular known or forecast/conditional requirements **without inconvenient or costly migration**, and (b) remaining coherent with the selected historical Plan's expected future Steps, routes and Change Axes? Inspect this at the level of current state, proposed code modification, Step result, conditional route or later actual outcome. Report **migration need, awkwardness, cost classes, degree of surprise/plannedness**, future rework and alignment/conflicts with plans; show evidence. Planned migration can be rational; a plan can be obsolete, so deviation from it is **not** automatically bad. The outcome is **contextual and route-relative**, not a requirement for a single scalar score, numeric likelihood, all-route optimization or reliable person-hour estimates. Preserve a weaker/harder fallback when rational. **DERIVED_FROM:** N-1/4/6/12/13, FR-6/7/8/9/10/15/22..25, direct user explanation. **REQUIRES:** P-42@r9 + P-44@r9; **RECOMMENDED_WITH:** P-23@r9 + P-45@r9/P-46@r9/P-47. **Status:** selected user-intent candidate; operational proxies need prototype evidence.

### P-24 / P-25..P-30 / P-47 / P-48 retained, clarified

WorkEpisode remains a **secondary grouping/projection of factual or planned work**, not canonical history; per-goal change work includes analysis, implementation, testing, migration, coordination, delay and separate costs (accepted R10 PR-2). No assumption that all these activities are Evolution Steps. P-47 stays a fictional project/file tree first; planned implementation effects in Step may be textual/file-level without an IDE/AST. Implementation Guidance under P-48 points to **Plan Steps and route-conditional impacts**, not an old separate EvolutionMap object. Their existing IDs remain as in r7 unless a later candidate finds a need to revise them formally.

## 5. Groups, relations and QRP disposition for r9

**PG-9 planned evolution / replanning is revised** to one conditional Plan; dependent edges must use `P-42@r9/P-43@r9/P-44@r9/P-45@r9/P-46@r9/P-49@r9`, not historical `EvolutionMapRevision` identities. `PG-8` Requirement ↔ Architecture distinction remains; `PG-10` Implementation impacts remains. These are **relation amendments**, not claims of new committed group IDs.

```text
P-23@r9  REQUIRES P-19, P-21, P-36@r9, CDC-10@r9
P-31@r9  REQUIRES P-19, P-21, P-42@r9, P-43@r9
P-39@r9  REQUIRES candidate FR-26/27, CDC-10@r9, CDC-21@r9
P-41@r9  REQUIRES P-39@r9; RECOMMENDED_WITH P-42@r9, P-43@r9
P-42@r9  REQUIRES P-40A, P-41@r9
P-43@r9  REQUIRES P-19, P-42@r9
P-44@r9  REQUIRES P-42@r9
P-45@r9  REQUIRES FR-8, FR-9, P-42@r9
P-46@r9  RECOMMENDED_WITH P-42@r9, P-43@r9, P-49@r9
P-49@r9  REQUIRES P-42@r9, P-44@r9
```

**Dependency hygiene repaired:** historical r7 used `P-41 REQUIRES P-42/P-43` while `P-42 REQUIRES P-41`, which forms a circular *hard* relation if taken literally. In this r9 candidate P-41 establishes the state/knowledge semantics; P-42 implements them, P-43 versions the Plan. **No back-edge `P-41 REQUIRES P-42/P-43` remains.** Other retained P-IDs' historical references to P-42/P-43 target their matching r9 versions when read as effective composition (not a claim the historical text changed). Verify graph acyclicity again before a semantic commit.

**QRP/history:** preserve old `QRP-P-40..53` and r7 uncertainty provenance; do not erase accepted historical mitigations. Add linked *candidate resolution notes* to R11-F-01..08 rather than rewriting R11. R14-PR-02 (staged PT) is selected by user. R14-PR-03A (conditional Steps without mandatory Option entity) is selected **as prototype-facing candidate**; 03B is deferred. R14-F-R-02/PR-04 concern scenario/fixture authorship, not a new runtime ability or dedicated PT subject; causal evidence remains visible as authored data. R14-PR-07 permits reuse of same full snapshot ref, preserving Step inspection. R14-PR-01's effective-map approach is used here. Any unselected R14 proposal retains prior status. Specifically R11-F-03/F-04 selected user direction is settled; F-01/F-05/F-06/F-07/F-08 have selected candidate mitigations, **not yet prototype-validated**; F-02 cursor mechanics remain open. R10 F-P-1 accepted PR-2 is represented here; R10 F-P-2/F-P-3 documentation repairs are addressed in SC-001/README candidates, not inherited runtime evidence. No `VE-*` records were created.

## 6. Planned prototype validation — staged **within one PT plan**

**Purpose:** verify the smallest sufficient deterministic single-Plan semantics before building broad simulation UI, ratings or scheduling infrastructure. The **next numbered `PT-*` document**, once created in the project, should explicitly define the following **three stages as part of the same PT**, with shared/incrementally extended fixture, evidence, falsification and gates. Stage A is *not* a deliverable simulator. The historical PT-003 evidence remains limited to its former target; PT-004's preexisting intended scope is not silently repurposed. Do not choose the next PT ID without checking actual repository status.

### Stage A — Minimal semantic spine / conditional Steps (first gate)

**Fixture inputs:** one shared fictitious development situation with known requirements; two architecture alternatives; one identical architecture-independent external event/opportunity; separately authored branch states and actual event histories; one `Plan R1` per architecture branch; an anticipated possible event/forecast; one `IF` decision with two prepared conditional Step routes; one refactoring or code-only Step whose full architecture stays unchanged while implementation/function does change; one other planned non-Step activity. Provide brief *author-supplied causal reasons* for any divergent readiness/outcome: this is a fixture-quality precondition, **not** a runtime causal-reasoning computation.

**Checks and falsification:** (1) no separately stored Evolution Map or mandatory EvolutionOption entity; (2) condition makes Steps applicable, never automatically done; (3) forecasted event or requirement is absent from factual requirement history until actually revealed; (4) one shared exogenous event remains identical while only branch-local consequences diverge; (5) selecting Step never advances actual cursor; (6) after every Step complete ArchitectureSnapshot resolves, with snapshot reference reusable when unchanged and nonempty visible implementation effect; (7) route-qualified impacts never turn mutually exclusive options into one inevitable future. Fail/repair semantic model before expanding scope.

**Gate A→B:** model replay/fixture tests and an inspectable small walkthrough demonstrate all seven checks; failing case causes a narrower correction, not an automatic extra subsystem.

### Stage B — Calendar, revisions, changing forecasts (second gate)

**Extend same fixture:** factual calendar vs event identity; projected completion date sliding *without* changing fixed deadline; actual missed deadline; a **separate, genuine renegotiated deadline** with history; factual Planning Event yielding `Plan R2`, immutable `Plan R1` BASE/Step versions/expected events; under high project dynamism one Planned Change Axis changes significance/direction; qualitative expectations of an IF route change without actual event occurrence. Include a concrete forecast demand that later may or may not become a factual branch-local requirement.

**Checks and falsification:** no historical revision drift or hindsight; forecasting ≠ fact; revised estimate ≠ revised commitment; route likelihood ≠ route occurrence; branch-local factual states replay properly; changed Steps have version lineage rather than mutation.

**Gate B→C:** deterministic replay/history assertions pass and the extended fixture still passes Stage A.

### Stage C — Work, migration Fitness and discoverability (third gate)

**Extend same fixture:** compare two architecture states or contemplated code changes for a specified requirement and conditional route; show migration necessity/inconvenience/cost classes, alignment/conflict with then-known Steps/Change Axes, actual work episodes (analysis, implementation, tests, migration, coordination, delay), and explainable conditional preference including KEEP/inconclusive. Add a focused no-guide UX walkthrough for factual state vs planned/conditional/future state and inspectability of per-Step code/architecture outcomes.

**Checks and falsification:** no ungrounded scalar Fitness; no automatic penalty for justified planned migration or plan revision; no mixing mutually exclusive route impacts; no fabricated requirement/fact; no unexplained author-supplied duration presented as measured architecture truth. Inspect existing scripted causal work/explanations; **do not build a causal-accuracy verifier**.

**Final integration gate:** after Stage C verify all A/B/C invariants together in one walkthrough and record per-stage evidence and limitations. `PT completed` or `VE promoted` requires the existing prototype governance process and explicit interpretation; passing unit/model checks alone is insufficient for human UX acceptance.

**Deliberately deferred:** separate lifecycle model for forecast-only Options unless the trigger in P-45 occurs; generic conditional DSL/DAG merge solver, Monte Carlo or exact probabilities, exact person-hour calibration, universal ArchitectureElement/relations, AST/IDE, automatic schedule solver, all-route optimization. Staged work adds explicit stage gates but reduces initial scope; calendar feasibility, total effort and numeric savings are **unknown** without resource data.

**Governance:** r7/r8 stay historical, r9 is a new LOCAL versioned candidate; no PT-003 promotion, no semantically committed composition or synchronized authoritative HOST state. Before writing to the project, follow **SNAPSHOT-FIRST + TUNNEL VERIFY**, conflict-check the actual HOST checkout, reconcile with origin and verify. A Git commit or private `forfiles` reading copy is not semantic commit.
