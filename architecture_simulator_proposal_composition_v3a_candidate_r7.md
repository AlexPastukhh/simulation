# Architecture Evolution Simulator — Proposal Composition V3A-candidate-r7

## Transaction Status

**CANDIDATE REVISION — NOT SEMANTICALLY COMMITTED**

This document revises:

`V3A-candidate-r6`

Committed baseline remains:

`V2 — architecture_simulator_canonical_model_plan_v2.md`

Review / clarification applied:

`R8 — CURRENT / immutable plan BASE / Evolution Step revision identity`

Candidate label:

`V3A-candidate-r7`

---

# 1. Target Plan / Baseline

## Target being updated

`architecture_simulator_proposal_composition_v3a_candidate_r6.md`

State before this operation:

`candidate`

## Source committed version

`V2 — committed`

## Candidate lineage

```text
V2 — COMMITTED
  ↓
R2 -> V2
  ↓
R3 -> R2 / underlying V2
  ↓
V3-candidate
  ↓ user selects P-9B cost direction
V3A-candidate
  ↓ Event Dynamics + State History + Work Dynamics
V3A-candidate-r2
  ↓ R4 + R5
V3A-candidate-r3
  ↓ prototype-governance decision
V3A-candidate-r4
  ↓ R6 -> r4
V3A-candidate-r5
  ↓ R7 -> r5
V3A-candidate-r6
  ↓ R8 -> r6
V3A-candidate-r7 — THIS DOCUMENT
```

No later candidate than `r6` exists at the start of this revision.

No committed version later than V2 exists.

---

# 2. Reviews Applied / Provenance

## R2

Target: `V2`.

Scope: semantic model, architecture axes, cost/evolution semantics.

Limits: no engine, no calibration dataset, no runtime model.

## R3

Target: `R2`; underlying artifact `V2`.

Scope: meta-review of R2.

## R4

Target: `V3A-candidate-r2`.

Confirmed/narrowed event, replay, cost and work-dynamics issues preserved in lineage.

## R5

Target: `R4`; underlying artifact `V3A-candidate-r2`.

Meta-review corrected R4 and added semantic-foundation / dependency findings.

## R6

Target: `V3A-candidate-r4`.

Artifact:

`architecture_simulator_review_r6_requirement_surface_and_state_canvas.md`

Scope: Requirement Surface, Feature grouping, Required/Current/Plan separation, synchronized Event/State UX.

R6 does not target r5.

## R7

Target: `V3A-candidate-r5`.

Artifact:

`architecture_simulator_review_r7_post_r5_requirement_architecture_evolution_planning.md`

Source: direct user clarification sequence after r5 / PT-002 remediation.

Scope:
- non-normalized Requirement Model;
- Architecture Planning as structured representation of the same product context;
- Behavior Responsibility Units;
- Requirement knowledge vs Evolution Steps;
- Actual Event History vs Evolution Map;
- full intermediate Architecture Snapshots;
- plan revisions / planning events;
- Evolution Options;
- planned Change Axes / Actual Hot Paths;
- Evolution Impact and cross-step consistency;
- fake project/file-tree Implementation Model;
- code-facing implementation guidance.

Limits:
- no `VE-*` promotion;
- no empirical calibration;
- no final metric formula;
- file/class-level workflow not yet prototype-validated.

R7 is applied to r5 only.

## R8

Target: `V3A-candidate-r6`.

Artifact:

`architecture_simulator_review_r8_current_base_and_step_revision_identity.md`

Source: direct user clarification after reviewing r6 before PT-003.

Scope:
- `CURRENT` as factual architecture at an Actual Event cursor;
- immutable `BASE` for each historical `EvolutionMapRevision`;
- historical plan knowledge reconstructed at the revision base event;
- immutable Evolution Step versions with lineage across plan revisions.

Limits:
- no `VE-*` promotion;
- no ordered-path-vs-DAG decision;
- no Class/Method fidelity decision;
- no new metric formula.

R8 is applied to r6 only.

---

# 3. Semantic Foundation Model

The composition keeps four governance levels:

```text
User Need (N-*)
Fundamental Requirement (FR-*)
Candidate Design Constraint (CDC-*)
Proposal (P-*)
```

R7 contains direct user semantic corrections. They are not silently rewritten into older FR text.

Three new candidate Fundamental Requirements are introduced explicitly below because they are correctness semantics stated directly by the user:

```text
FR-26 non-normalized Requirement Model
FR-27 Requirement knowledge follows actual history, not planned rollout
FR-28 Actual history and planned evolution are distinct truths
```

They are candidate additions, not committed changes to V2.

The key semantic correction from r5 is:

```text
r5:
Requirement Surface
  -> Branch Feature Model
  -> CurrentRealization / TeamPlan

r6:
Actual Event History
  -> Requirement Model at actual cursor

Requirement Model
  -> Architecture Planning representation
      -> Current factual architecture
      -> Evolution Map revisions
          -> full planned Architecture Snapshot per Evolution Step
          -> Evolution Impact
          -> optional Evolution Options

Architecture responsibilities
  -> Implementation Model / project tree
```

The Requirement Model is intentionally not a normalized ownership ontology.

R8 tightens temporal provenance without changing that model:

```text
Actual Event cursor
  -> CURRENT factual architecture

EvolutionMapRevision
  -> immutable BASE actual event/snapshot
  -> immutable Evolution Step versions
  -> lineage to revised step versions in later plan revisions
```

A historical plan is never reinterpreted using later requirement knowledge or later mutated step objects.

---

# 4. User Needs

## Existing Needs retained

### N-1 — Explain architecture decisions through evolution
Show why a decision was made and how it affects later work.

### N-2 — Compare alternatives fairly
Do not pre-bias toward a named architecture/pattern.

### N-3 — Model changing systems over time
Represent changing functionality, rules, environment, organization and requirements.

### N-4 — Make preparation for future change explicit
Distinguish known future change, forecast, speculation and hindsight.

### N-5 — Keep architectural choices conceptually independent
Avoid architecture-package thinking.

### N-6 — Make consequences concrete and explainable
Show affected knowledge, state, contracts, teams, deployables and work.

### N-7 — Support branch/replay comparison
Compare alternative histories from the same starting point.

### N-8 — Stay practical enough to implement
Do not build a universal architecture ontology before the core simulator works.

### N-9 — Event-centric history
Expose a potentially long ordered history of meaningful project/simulation events.

### N-10 — Bidirectional Event <-> Entity/State exploration
For an event, show affected entities/state; for an entity/state, show relevant history.

### N-11 — Compare architectures through event dynamics
Given comparable external stimuli/requirements, show different internal work/change dynamics.

### N-12 — Evaluate quality of working with the system
Include comprehensibility, discoverability, planning burden, reversibility, experimentability, feedback, plan flexibility, team autonomy, operational burden and delivery stability.

### N-13@r3 — Explain work dynamics per goal/change
For a requirement, goal or significant change, explain resulting work dynamics and compare them across branches.

No new User Need is required by R7; the new semantics sharpen N-1, N-3, N-4, N-6, N-10, N-11 and N-12.

---

# 5. Fundamental Requirements

## Retained FR-1 .. FR-25

`FR-1` architecture-neutral problem semantics.  
`FR-2` Feature != Vertical Slice.  
`FR-3` scoped architecture decisions.  
`FR-4` orthogonal underlying architecture state.  
`FR-5` Observed / Required / Forecast separation.  
`FR-6` no hidden architecture score.  
`FR-7` transparent evaluation.  
`FR-8` temporal integrity / no hindsight.  
`FR-9` known future information must be actionable before occurrence.  
`FR-10` separate cost classes.  
`FR-11` honest requirement evaluation.  
`FR-12` fair controlled branch comparison.  
`FR-13` KEEP is valid.  
`FR-14` deterministic MVP before Monte Carlo.  
`FR-15` raw impact remains inspectable.  
`FR-16@r3` sequence and elapsed time are distinct.  
`FR-17@r3` event semantics must avoid conflating independent dimensions.  
`FR-18@r3` scenario anchors and branch-generated events must be distinguishable.  
`FR-19@r3` event relations and state mutation must be distinguishable.  
`FR-20` state/entity history is first-class.  
`FR-21@r3` work dynamics may be grouped without changing event truth.  
`FR-22@r3` human/work-quality claims use computable/evidenced proxies.  
`FR-23` work dynamics depend on context.  
`FR-24@r3` reversibility/experimentability evidence remains decomposable.  
`FR-25` scalarized effort remains transparent.

## FR-26@r6 — Requirement Model is intentionally non-normalized

**NEW CANDIDATE FR — direct user clarification.**

The simulator must allow requirement material to remain in the form it is known:
- Actor / Goal / Scenario / Step context;
- free text requirements;
- acceptance criteria;
- expected behavior;
- optional Behavior Units;
- Screens/Widgets when explicitly required;
- constraints;
- ambiguity / alternatives / experiment notes.

It must not require mandatory ownership/deduplication into PFR/ScreenRequirement/WidgetRequirement/BusinessRule entities merely to enter architecture planning.

## FR-27@r6 — Requirement knowledge follows actual history, not planned rollout

**NEW CANDIDATE FR — direct user clarification.**

At an Actual Event cursor the Requirement Model contains all requirements known at that actual point.

Evolution Steps may plan when requirements are architecturally covered/implemented, but do not create separate copies of requirement truth.

Unknown future requirements are absent until an Actual Event reveals them.

## FR-28@r6 — Actual history and planned evolution are distinct truths

**NEW CANDIDATE FR — direct user clarification.**

The simulator must distinguish:
- factual Actual Event History;
- factual Current architecture/implementation state;
- planned Evolution Map;
- planned Architecture Snapshot after each Evolution Step;
- contingent Evolution Options.

A planned step must not be represented as if it already happened.

---

# 6. Candidate Design Constraints

## CDC-1 .. CDC-9 retained

Event dimensions, canonical event envelope, authoritative mutation ledger, controlled comparison, event granularity, point-event MVP, structural proxies, scalar-cost ledger and prototype governance remain.

## CDC-10@r6 — Requirement truth invariant across compared branches

**REVISED_FROM CDC-10@r5.**

At the same Actual Event cursor, normal compared architecture branches share the same Requirement Model.

Branches differ in architecture planning, realization, evolution path and work consequences, not by deleting inconvenient requirements.

## CDC-11@r6 — Requirement occurrences are traceable, not semantically deduplicated

**REVISED_FROM CDC-11@r5.**

Requirement-side material may have technical occurrence handles for tracing.

A technical handle/UUID does not imply semantic identity, reuse or equivalence.

No `SAME_AS`, `VARIANT_OF` or canonical shared object is required merely because two occurrences look identical.

## CDC-12@r6 — One Requirement Model; Current + Evolution Map on the planning side

**REVISED_FROM CDC-12@r5.**

Preferred separation:

```text
RequirementModel@ActualCursor
CurrentArchitectureSnapshot
CurrentImplementationSnapshot
EvolutionMapRevision
  -> EvolutionSteps
     -> planned ArchitectureSnapshot
     -> EvolutionImpact
EvolutionOptions
```

`TeamPlan` is no longer the primary planning state model.

## CDC-13@r6 — Product concepts may appear in both Requirement and Architecture views

**REVISED_FROM CDC-13@r5.**

Actor, Goal, Scenario, Step, Behavior, Screen and Widget are not partitioned into mutually exclusive requirement-vs-architecture ontologies.

Architecture Planning may introduce additional Screen/Widget/structure when requirements left them open.

Provenance must distinguish:
- explicitly required;
- architecture/design-introduced.

## CDC-14 — Replay shows snapshot + selected Actual Event delta

Retained from r5.

Actual Event replay is reconstructed from canonical mutations.

## CDC-15@r6 — Domain-specific projections share canonical facts

**REVISED_FROM CDC-15@r5.**

Useful projections include:
- Requirement Model;
- Architecture Responsibility view;
- Evolution Map / impacts;
- project/file tree;
- runtime/data topology;
- ownership/deployment;
- actual history.

Views must not own duplicate historical truth.

## CDC-16@r6 — Evolution Step target is a full Architecture Snapshot

Each Evolution Step defines a transition from a predecessor planned/current snapshot to a complete target Architecture Snapshot.

The snapshot is non-monotonic: add/remove/replace/split/merge/move/rewire/migrate/temporarily duplicate/retire are valid.

## CDC-17@r6 — File-first implementation projection

The first concrete implementation entity is `File` in a fake project tree.

Class/Method/AST fidelity is deferred until file-level modeling proves insufficient.

## CDC-18@r6 — Planned Change Axis vs Actual Hot Path; Evolution Impact is per change

`PlannedChangeAxis` captures expected repeated change direction.

`ActualHotPath` is the corresponding observed repeated change pattern in actual history.

`EvolutionImpact` is the concrete impact of one Step/change and must not be conflated with Hot Path.

## CDC-19@r7 — Historical plan revision BASE is immutable

A stored `EvolutionMapRevision` records the factual point from which it was built.

At minimum:

```text
based_on_actual_event_ref
base_architecture_snapshot_ref
```

The Requirement Model used to inspect that historical revision is reconstructed at `based_on_actual_event_ref`.

Later Actual Events, requirements and actual progress do not move or rewrite the historical BASE.

`CURRENT` remains a factual Actual-Event-cursor concept; it is not stored as a mutable left anchor of an old plan.

## CDC-20@r7 — Evolution Step versions are immutable across plan revisions

A conceptual planned step may continue across revisions, but an exact step version is immutable.

Unchanged step versions may be referenced by multiple plan revisions.

If impact, dependencies, target snapshot or other plan-defining semantics change, create a new version and preserve lineage such as `REVISED_FROM`.

Historical plan revisions never observe later mutations of their step objects.

---

# 7. Existing Committed Decisions

Committed baseline remains V2:

```text
P-1@V2  Problem semantics separate from architecture
P-2@V2  Scoped ArchitectureDecision
P-3@V2  Orthogonal architecture dimensions
P-4@V2  Observed / Required / Forecast
P-5@V2  known_at / occurs_at
P-6@V2  ArchitectureDecision + MigrationPlan
P-7@V2  structural impact before cost
P-8@V2  separate cost classes
P-9@V2  profile/vector-first evaluation
P-10@V2 requirement/scenario/constraint model
P-11@V2 deterministic MVP
P-12@V2 normalized ArchitectureState
P-13@V2 branch/replay
```

R7/r6 does not rewrite committed V2.

---

# 8. Review Findings Classification

## Earlier confirmed findings retained

R4/R5 event, replay, work-proxy, cost-basis and semantic-foundation findings remain historical and applicable as recorded in r5.

R6 useful findings retained:
- event/state causal reading must remain synchronized;
- requirement correctness must not vary by architecture branch;
- Feature/UI containment must not be mandatory;
- domain-specific projections are preferable to generic key/value cards;
- implementation-specific detail should not leak into requirement wording unless it is actually required.

## R6 findings narrowed / superseded by R7

### R6-P-4 / R6-U-3

Historical finding preserved, but the r5 ownership remediation is **partially invalidated**.

Current rule:
Requirement Model does not require normalized ownership of acceptance/behavior by Scenario, Screen, Widget or PFR.

### R6-P-9

Historical concern preserved, but canonical shared requirement-side BusinessRule is no longer preferred.

Reuse/grouping belongs to Architecture Planning.

### R6-Q-1 / QRP-Q-37

Old `PFR <-> Feature` cardinality blocker is **superseded/reframed** as requirement-occurrence / BehaviorUnit -> BRU / realization traceability.

### R6-Q-2 / QRP-Q-39

**Superseded** as a central schema question.

### P-41@r5 / QRP-GQ-6

Old four-layer state ownership model is **superseded** by Requirement Model + Current + Evolution Map/PlanRevision semantics.

## R7 confirmed problems

```text
R7-P-1  r5 Requirement Surface is over-normalized
R7-P-2  Architecture Planning modeled as too-different ontology
R7-P-3  Requirement Model must not be distributed by Evolution Steps
R7-P-4  Feature too strong as universal architecture behavior unit
R7-P-5  TeamPlan insufficient; planned states need full snapshots
R7-P-6  Actual Event and Evolution Step need distinct truth semantics
R7-P-7  plan revisions/replanning missing as first-class history
R7-P-8  known uncertainty needs Evolution Options
R7-P-9  Change Axis/Hot Path/Evolution Impact terminology conflated
R7-P-10 cross-step Evolution Impact consistency missing
R7-P-11 concrete Implementation Model missing
R7-P-12 code-facing future-impact guidance missing
```

## R7 questions / risks

```text
R7-Q-1  BRU logical projection vs architecture-native primary planning unit
R7-Q-2  implementation fidelity beyond File
R7-Q-3  ordered map + prerequisites vs general DAG
R7-R-1  speculative Evolution Option explosion
R7-R-2  forward-consistency overfitting / premature complexity
R7-R-3  fake-code model drifting into IDE simulation
```

---

# 9. Proposal Changes

## P-19@r3 — Canonical SimulationEvent envelope

**RETAINED.**

Actual Events remain canonical factual history with relations/mutations.

Planning/replanning may itself be represented by Actual Events that mutate plan-revision state, but `EvolutionStep` is not a `SimulationEvent`.

## P-20@r3 — Orthogonal event taxonomy

**RETAINED.**

`planning`, `architecture`, `implementation`, `migration`, `verification`, etc. remain categories/roles as appropriate.

## P-21@r3 — EventEntityRelation + StateMutation

**RETAINED.**

Used for factual history/replay.

## P-22@r3 — Entity/State Explorer

**RETAINED, broadened by new target types.**

Tracked targets may now include BRUs, files, plan revisions and Evolution Options in addition to earlier entities.

## P-23@r3 — Controlled Event Dynamics Compare

**RETAINED.**

Same actual scenario/requirement anchors can drive different architecture plans and actual responses.

## P-24@r3 — WorkEpisode grouping

**RETAINED as secondary projection.**

Does not own canonical history.

## P-25@r3 .. P-30@r3 — Work Dynamics / lenses

**RETAINED.**

R7 strengthens Plan Flexibility and Experimentability evidence but does not freeze a new scalar formula.

## P-31@r7 — Dual Actual / Planned Time-Travel Workbench

**REVISED_FROM P-31@r6.**

Actual history cursor:

```text
select Actual Event
-> replay factual state through event
-> CURRENT = factual architecture at that cursor
-> show actual snapshot + selected-event delta
```

Planned evolution cursor:

```text
select EvolutionMapRevision
-> show immutable BASE for that revision
-> select Evolution Step version
-> show planned Architecture Snapshot after that step
-> show Evolution Impact for the selected transition
```

The two cursors are semantically distinct.

For the active plan, UI may use a convenience view such as:

```text
CURRENT A1 -> remaining S2 -> S3
```

when actual progress has reached A1. This is a projection of the remaining active plan; it does not mutate the historical revision whose BASE may still be A0.

When a historical plan revision is selected, the UI must distinguish:
- `BASE` — factual architecture/knowledge anchor from which that revision was built;
- `ACTUAL CURRENT` — factual architecture at the separately selected Actual Event cursor;
- reached/implemented progress where useful.

A planning event in Actual Event History may create a new EvolutionMapRevision without pretending the planned architecture already exists.

**REQUIRES:** P-19 + P-21 + P-42@r7 + P-43@r7.

**Status:** preferred candidate.

## P-32@r3 — Semantic Foundation Layering

**RETAINED.**

## P-33@r3 — Canonical Cost-Bearing Ledger

**RETAINED.**

## P-34@r3 — Evaluation Time Basis

**RETAINED.**

## P-35@r6 — Requirement Trace <-> Architecture / Implementation Representation Mapping

**REVISED_FROM P-35@r5.**

The r5 idea of stable semantic identity is narrowed.

Requirement-side references use technical occurrence handles, for example:

```text
Scenario[AdminCancellation]
  /Step[Confirm]
  /Behavior[Cancel booking]
```

or internal IDs used only for tracing.

These references do **not** imply:
- semantic deduplication;
- reuse identity;
- shared Feature/BRU;
- equality across contexts.

Architecture Planning may map requirement occurrences to BRUs and implementation artifacts with 1:1 / 1:N / N:1 / N:M traceability where needed.

Stable semantic identity may still exist for genuinely externally-given things such as a named external system or explicit protocol, but is not inferred merely from matching requirement text.

**RECOMMENDED_WITH:** P-39 + P-40A + P-47.

**Status:** preferred candidate.

## P-36@r3 — ScenarioEvent / BranchEvent identity

**RETAINED.**

## P-37@r6 — Controlled and Adaptive Evolution Modes

**REVISED_FROM P-37@r3.**

Modes:

```text
controlled_counterfactual
adaptive_product_evolution
```

Controlled comparison remains important for fair architecture comparison.

Adaptive evolution is no longer treated as merely remote future work: unexpected Actual Events, requirement discovery and replanning are now a core simulator capability after the basic deterministic semantics are validated.

No Monte Carlo is implied.

**Status:** preferred candidate; staged after core semantics.

## P-38@r6 — Prototype Validation Track

**REVISED_FROM P-38@r5.**

PT lineage rule is retained.

PT-002 remains historical evidence for event/replay mechanics and its own semantic experiment.

R7 materially changes Requirement/Architecture/Plan semantics, so PT-002 must not be retroactively treated as validation of r6.

Candidate new prototype lineage:

```text
PT-003 Requirement Model / Architecture Planning / Evolution Map
PT-004 Evolution Impact / fake project tree / implementation guidance
```

No `VE-*` is promoted merely by creating r6.

## P-39@r6 — Non-normalized Requirement Model

**REVISED_FROM P-39@r5.**

Purpose:
represent all product requirements/knowledge known at the selected Actual Event cursor without forcing architecture-level normalization.

Possible material:

```text
Actor
Business Goal
Scenario
Scenario Step
free text requirement
Acceptance Criterion
expected behavior
Behavior Unit occurrence
Screen / Widget when explicitly required
constraint
ambiguity / acceptable alternatives
experiment requirement
known effective date / deadline
external-system fact
...
```

Rules:

1. The model is intentionally non-normalized.
2. No mandatory owner is required for acceptance/expected behavior.
3. A requirement may remain text in its context.
4. Behavior Unit is optional, not mandatory for every requirement.
5. Repeated/identical behavior may remain repeated occurrences.
6. No requirement-side reuse/dedup relation is inferred from similarity.
7. A canonical shared BusinessRule is not required; rule text may repeat.
8. Screen/Widget may be present when explicitly required; otherwise architecture may introduce them later.
9. Technology-specific realization remains out unless itself required.
10. The model at an Actual Event cursor contains everything known at that actual moment.
11. The model is **not** copied/distributed by Evolution Step.
12. Unknown future requirements do not appear before an Actual Event reveals them.
13. Known uncertainty/experiments may be present now without pretending a particular outcome will occur.
14. Technical occurrence IDs/paths are trace handles only.

**DERIVED_FROM:** P-1 + P-10 + FR-26 + FR-27.

**Status:** preferred candidate.

## P-40A@r6 — Architecture Planning / Behavior Responsibility Model

**REVISED_FROM P-40A@r5.**

Architecture Planning represents the same product context as the Requirement Model, but adds architectural organization.

It may contain/visualize:

```text
Actor / Goal / Scenario / Step
requirements / acceptance / behavior context
Screens / Widgets
Behavior Responsibility Units (BRU)
responsibility boundaries
reuse/grouping decisions
ownership
dependencies
chosen UI structure
data/runtime/deployment decisions
implementation mappings
```

### Behavior Responsibility Unit

`BehaviorResponsibilityUnit` is the preferred neutral logical unit for architecture-side behavior responsibility.

A BRU:
- may cover one or many requirement/Behavior Unit occurrences;
- may cooperate with other BRUs to satisfy one occurrence;
- may be shared across contexts;
- does not have to map 1:1 to a physical module/service/file.

`Feature` is a possible subtype/label/view of BRU when meaningful.

Feature does **not** mean Vertical Slice.

In a layered architecture, a Feature may be a useful logical functional trace across layers even if the physical organization is by layer.

The future question of the architecture's primary reasoning/planning unit remains open and does not change BRU's usefulness as a behavior-responsibility projection.

**REQUIRES:** P-39.

**RECOMMENDED_WITH:** P-35 + P-42 + P-47.

**Status:** preferred candidate.

## P-40B@r6 — Stable Cross-Branch Feature Identity

**REVISED STATUS FROM r5.**

Historical alternative retained, but it is no longer an active generic alternative to P-40A.

A stable Feature identity may still be used locally when the architecture/domain explicitly gives such an identity, but the composition does not require it across branches.

**Status:** historical/local option; excluded from preferred generic model.

## P-41@r7 — Requirement / Current / Planned State Semantics

**REVISED_FROM P-41@r6.**

Preferred semantics:

```text
RequirementModel@ActualCursor
  all requirements/uncertainty known at that factual cursor

CurrentArchitectureSnapshot@ActualCursor
  factual realized architecture at that cursor

CurrentImplementationSnapshot@ActualCursor
  factual fake code/project state at that cursor

EvolutionMapRevision
  immutable BASE actual event/snapshot
  + immutable Evolution Step versions
  + plan-revision provenance

EvolutionStepVersion
  planned transition
  + full target ArchitectureSnapshot
  + EvolutionImpact
```

`CURRENT` is always factual and derives from an Actual Event cursor.

A historical plan revision does not own a mutable CURRENT. It owns an immutable BASE tied to the factual state/knowledge from which that revision was created.

Requirements known at a revision's BASE remain visible even when not covered until later steps. Requirements revealed later do not appear when inspecting that older plan under its historical knowledge context.

A UI may project requirement status at a selected step as:

```text
already covered
covered by this step
planned later
unscheduled
```

without creating a new Requirement Model per step.

**REQUIRES:** P-39 + P-42@r7 + P-43@r7.

**Status:** preferred candidate.

## P-42@r7 — Evolution Map + immutable revision BASE + full Architecture Snapshots

**REVISED_FROM P-42@r6.**

An Evolution Map is a planned architecture path inside a specific `EvolutionMapRevision`.

For the active plan UI, it may be shown as:

```text
CURRENT -> S1 -> S2 -> ... -> Sn
```

But the stored revision is anchored by an immutable BASE:

```text
EvolutionMapRevision R1
BASE A0
  -> S1@v1 -> A1
  -> S2@v1 -> A2
  -> S3@v1 -> A3
```

Definitions:
- `CURRENT` = factual architecture at the selected Actual Event cursor; not an Evolution Step.
- `BASE` = factual architecture/knowledge anchor from which this exact plan revision was built.
- a historical revision's BASE does not move when actual implementation progresses.

Core revision references:

```text
id
created_by_planning_event_ref
based_on_actual_event_ref
base_architecture_snapshot_ref
step_version_refs[]
```

The Requirement Model relevant to historical no-hindsight inspection is reconstructed at `based_on_actual_event_ref`; a duplicated requirement-knowledge pointer is unnecessary if actual replay reconstructs knowledge deterministically.

Each Evolution Step version contains:

```text
step_lineage_id
version_id
predecessor / prerequisite step-version refs
title / rationale
transition description
architecture_target_snapshot_ref
evolution_impact_refs[]
requirement_coverage_refs[]?
status / scheduling metadata?
revised_from_step_version_ref?
```

The exact storage schema may differ, but must preserve immutable exact versions and conceptual lineage.

The target snapshot is a complete architecture state after the step.

Valid transitions include:
- add;
- remove;
- replace;
- split;
- merge;
- move responsibility;
- rewire dependency;
- migrate data;
- temporary duplication/compatibility;
- retire old path.

`State(Sn)` is not defined as `State(Sn-1) + additions`.

The last current step is not a privileged separate Architecture Plan.

Migration may be planned/economically sensible, forced, or avoided; none is automatically rewarded/punished.

**REQUIRES:** P-40A + P-41@r7.

**Status:** preferred candidate.

## P-43@r7 — Planning Events + immutable Plan Revision / Step Version History

**REVISED_FROM P-43@r6.**

Planning/replanning is factual history.

A Planning Actual Event creates a new immutable `EvolutionMapRevision` from the factual architecture/knowledge available at its base event.

Example:

```text
E10 actual architecture = A0
known requirements = R1..R4

Planning Event E11 creates Plan R1
R1 BASE A0
  -> STEP-A@v1 -> A1
  -> STEP-B@v1 -> A2
  -> STEP-C@v1 -> A3

E12/E13 actual execution reaches A1
ACTUAL CURRENT = A1

E14 unexpected R5 appears
Planning Event E15 creates Plan R2 from factual A1
R2 BASE A1
  -> STEP-B@v1 -> A2       // reused unchanged
  -> STEP-X@v1 -> A2.5     // new
  -> STEP-C@v2 -> A3'      // revised
```

Lineage:

```text
STEP-C@v2 REVISED_FROM STEP-C@v1
```

Rules:
1. Earlier plan revisions are immutable and preserved.
2. Their BASE event/snapshot and historical requirement knowledge remain unchanged.
3. Exact Evolution Step versions are immutable.
4. A later revision may reuse an unchanged step version.
5. If impact, dependencies, target snapshot or other plan-defining semantics change, create a new step version with lineage.
6. Replanning therefore exposes what survived unchanged, what was revised, what was inserted, and what was removed/cancelled.
7. One Evolution Step version may later correspond to multiple Actual Events; no 1:1 identity is required.

This enables no-hindsight inspection, planning-quality analysis and structural plan-disruption/resilience evidence.

**REQUIRES:** P-19 + P-42@r7.

**Status:** preferred candidate.

## P-44@r6 — Evolution Impact + Impact History + Forward Consistency

**NEW.**

`EvolutionImpact` describes what one planned transition is expected to change.

Possible targets:

```text
Behavior Responsibility Unit
Screen / Widget
architecture dependency
ownership / deployment
File / implementation artifact
data/runtime artifact
test/migration/deployment obligation
```

For architecture structure, before/after snapshots should derive impact where possible rather than duplicate truth manually.

For a target entity, users can inspect impact history across the map:

```text
Cancellation BRU
S2 introduced
S4 admin variation added
S7 audit responsibility extracted
...
```

Forward Evolution Consistency checks current/planned work against known later impacts.

Rules:

1. If the responsibility plan changes, that change is itself an explicit Evolution Step and later snapshots are rechecked.
2. If implementation work is already represented by the selected Step's planned impact, no redundant ad-hoc check is required.
3. If local implementation work is not represented in the plan, compare it with known future impacts to reveal conflicts/rework.
4. A warning is evidence, not a ban; cheap temporary work may still beat premature generalization.

**REQUIRES:** P-42@r7.

**RECOMMENDED_WITH:** P-47 + P-48.

**Status:** preferred candidate.

## P-45@r6 — Evolution Options / Contingent Evolution Steps

**NEW.**

An Evolution Option is a prepared transition that may become a planned Step if its trigger occurs.

```text
EvolutionOption
- id
- known_at_event_ref
- rationale / uncertainty source
- trigger / activation condition
- applicability constraints
- intended transformation
- expected EvolutionImpact
- prerequisites
- verification expectation
```

Sources:
- requirement uncertainty / experiment;
- known likely external/technical change;
- architecture/design/implementation uncertainty created by a current choice.

An option is **not** a claim that the future will happen.

Prefer transition-template semantics over a fixed snapshot when the option may be inserted later.

On activation:

```text
EvolutionOption
  -> concrete EvolutionStep
  -> concrete target ArchitectureSnapshot
```

**REQUIRES:** FR-8 + FR-9 + P-42@r7.

**Status:** preferred candidate.

## P-46@r6 — Planned Change Axis / Actual Hot Path

**NEW.**

One conceptual change-direction model has two statuses:

```text
PlannedChangeAxis
  expected repeated direction of change

ActualHotPath
  observed repeated change direction/area in factual history
```

Examples:
- cancellation policy;
- notification channels;
- storage strategy;
- UI composition;
- tenant isolation.

Evolution Impact remains the per-change/step impact.

Comparisons may ask:
- did actual hot paths match planned axes?
- did architecture localize repeated impacts where expected?
- did supposedly local change axes repeatedly produce broad impacts?

No hidden score is implied.

**RECOMMENDED_WITH:** P-44 + P-43.

**Status:** preferred candidate.

## P-47@r6 — Implementation Model / fake project tree

**NEW.**

Preferred first concrete implementation projection:

```text
ProjectTree
Directory
File
```

A File is an `ImplementationArtifact` for MVP.

Possible fields:

```text
path
role / description
BRU refs[]
dependency refs[]
actual history refs[]
planned impact refs[]
```

BRU <-> File mapping may be N:M.

Files may appear, disappear, move, split, merge or be replaced across actual/planned implementation states.

Current project tree is factual.

A selected Evolution Step may show planned file impact / target tree without pretending those files already exist.

Runtime/data topology remains a separate projection where file tree is insufficient.

Class/Method/AST detail is deferred.

**REQUIRES:** P-40A + P-41.

**Status:** preferred candidate for prototype validation.

## P-48@r6 — Implementation Guidance as a projection of planned impacts

**NEW.**

For a file, the simulator may surface future planned impacts:

```text
CancelBooking.ts
  S4 add admin variation
  S7 extract policy evaluation
  S9 retire direct inventory dependency
```

Canonical relation:

```text
EvolutionStep
  -> EvolutionImpact
     -> ImplementationArtifact(File)
```

Optional `ImplementationGuidance` may include:
- general intended change;
- constraints to preserve;
- optional target sketch/file;
- links to later steps.

Generated source comments such as:

```text
// EVOLUTION: S7 — policy extraction planned
```

are UI/projection only, not canonical truth.

Purpose:
help a developer make a local implementation decision without loading the entire plan, while keeping known future evolution visible.

**REQUIRES:** P-44 + P-47.

**Status:** experimental preferred candidate; must be prototype-validated before strong workflow claims.

---

# 10. Proposal Relations / Groups

## Existing groups retained

`PG-1` Cost Evaluation.  
`PG-2` Change Work Semantics.  
`PG-3` Temporal / Information Integrity.  
`PG-4` Neutral Evaluation.  
`PG-5` Event Dynamics Core.  
`PG-6` Work Dynamics.  
`PG-7` Semantic Foundation Governance.

## PG-8@r7 — Requirement / Architecture Planning Semantics

**REVISED_FROM PG-8@r6.**

Members:

```text
P-39@r6 Non-normalized Requirement Model
P-40A@r6 Architecture Planning / BRU Model
P-35@r6 Requirement trace mapping
P-41@r7 Requirement/Current/Plan-BASE semantics
```

Relations:

```text
P-40A@r6 REQUIRES P-39@r6
P-35@r6 RECOMMENDED_WITH P-39@r6 + P-40A@r6
P-41@r7 REQUIRES P-39@r6 + P-42@r7 + P-43@r7
```

`P-40B` is no longer an active mutually-exclusive alternative inside the selected bundle.

## PG-9@r7 — Planned Evolution / Replanning

**REVISED_FROM PG-9@r6.**

Members:

```text
P-31@r7
P-42@r7 Evolution Map / immutable BASE
P-43@r7 Planning Events / Plan Revisions / Step Version History
P-44@r6 Evolution Impact
P-45@r6 Evolution Options
P-46@r6 Change Axis / Hot Path
```

Key relations:

```text
P-31@r7 REQUIRES P-42@r7 + P-43@r7
P-43@r7 REQUIRES P-19 + P-42@r7
P-44@r6 REQUIRES P-42@r7
P-45@r6 REQUIRES P-42@r7
P-46@r6 RECOMMENDED_WITH P-44@r6 + P-43@r7
```

No hard dependency cycle detected.

## PG-10@r6 — Implementation Evolution

**NEW.**

Members:

```text
P-47 Implementation Model
P-48 Implementation Guidance
P-44 Evolution Impact
P-35 Trace mapping
```

Relations:

```text
P-47 REQUIRES P-40A + P-41
P-48 REQUIRES P-44 + P-47
P-35 RECOMMENDED_WITH P-47
```

No hard dependency cycle detected in the selected candidate.

---

# 11. Proposal-level QRP

Existing QRP history from r5 is preserved.

Important status changes:

## QRP-Q-37 — PFR <-> Feature coverage cardinality

**Status:** `superseded/reframed in r6`.

Reason:
the old PFR/Feature ontology is no longer preferred.

Replacement question:
requirement occurrence / Behavior Unit occurrence <-> BRU / realization traceability, handled by P-35@r6 and P-40A@r6.

N:M traceability remains possible, but is no longer a blocker for freezing `ProductFunctionalRequirement <-> BranchFeature` because that schema is removed.

## QRP-Q-39 — Direct Screen/Widget <-> BusinessRule relation

**Status:** `superseded in r6`.

Reason:
canonical requirement-side BusinessRule ownership is no longer a central model assumption.

## QRP-P-40 — Requirement Model over-normalized

**NEW Problem.**

Target: P-39@r5.

Source: R7-P-1.

Evidence:
mandatory PFR/ScreenRequirement/WidgetRequirement/BusinessRule-style decomposition contradicts direct user clarification that Requirement Model is intentionally non-normalized.

Violated: FR-1, N-8; addressed by new FR-26.

Status: `candidate-mitigated by P-39@r6`.

## QRP-P-41 — Architecture Planning represented as too-different ontology

Target: P-39/P-40A@r5.

Source: R7-P-2.

Problem:
architecture view lost the same Actor/Goal/Scenario/requirement context and treated mapping into Feature Model as the central boundary.

Status: `candidate-mitigated by P-40A@r6`.

## QRP-P-42 — TeamPlan cannot represent architecture evolution path

Target: P-41@r5.

Source: R7-P-5.

Problem:
a task list does not encode full intermediate planned architecture states or non-monotonic migration.

Status: `candidate-mitigated by P-41@r7 + P-42@r7`.

## QRP-P-43 — Actual Event vs Evolution Step truth conflated/underspecified

Target: P-31/P-41@r5.

Source: R7-P-6.

Status: `candidate-mitigated by P-31@r7 + P-42@r7 + P-43@r7`.

## QRP-P-44 — Plan revision history absent

Target: composition planning semantics.

Source: R7-P-7.

Consequence:
no-hindsight replanning quality cannot be reconstructed.

Status: `candidate-mitigated by P-43@r7`.

## QRP-P-45 — Evolution Impact / cross-step consistency absent

Target: planned evolution semantics.

Source: R7-P-9/R7-P-10.

Status: `candidate-mitigated by P-44`.

## QRP-P-46 — Concrete implementation projection absent

Target: architecture realization/evolution planning.

Source: R7-P-11.

Status: `candidate-mitigated by P-47; unvalidated`.

## QRP-Q-47 — BRU logical projection vs primary architecture-native reasoning unit

Target: P-40A.

Source: R7-Q-1.

Question:
should BRU always be the primary planning unit, or can it be a cross-cutting behavior projection over an architecture whose primary reasoning unit is layer/module/service/domain?

Blocking: no.

Current answer:
BRU is canonical as a logical behavior-responsibility projection; primary architecture-native planning unit remains open for later modeling.

## QRP-Q-48 — Implementation fidelity beyond File

Target: P-47/P-48.

Source: R7-Q-2.

Question:
when do Class/Method/target-source artifacts add enough explanatory value to justify scope?

Blocking: no.

Current answer:
file-first prototype.

## QRP-R-49 — Evolution Option explosion

Target: P-45.

Source: R7-R-1.

Condition:
options are created for speculative changes without evidence that the uncertainty is currently known.

Consequence:
no-hindsight discipline and practical scope degrade.

Mitigation:
`known_at` provenance + explicit uncertainty/rationale required.

Status: open risk.

## QRP-R-50 — Forward-consistency check rewards premature complexity

Target: P-44/P-48.

Source: R7-R-2.

Condition:
known future impacts are treated as reasons to generalize now regardless of present complexity cost.

Mitigation:
compare cumulative state cost + transition/migration cost; warnings are not prohibitions.

Status: open risk.

## QRP-Q-51 — Planned Change Axis derivation

Target: P-46.

Question:
which axes are user/scenario-declared, requirement-inferred, architecture-created, or statistically observed from history?

Blocking: no.

Current direction:
retain provenance; do not require one derivation method yet.

## QRP-P-52 — Historical Plan BASE / CURRENT ambiguity

**NEW Problem.**

Target: P-31/P-41/P-42@r6.

Source: R8-P-1/R8-P-2.

Problem:
using `CURRENT` as the left anchor of a stored historical plan can silently reinterpret the plan from a later factual architecture/knowledge state.

Violated:
FR-8 no hindsight; FR-28 actual vs planned truth.

Status: `candidate-mitigated by CDC-19 + P-31@r7 + P-41@r7 + P-42@r7`.

Prototype evidence: pending PT-003.

## QRP-P-53 — Evolution Step identity can rewrite historical plan revisions

**NEW Problem.**

Target: P-42/P-43@r6.

Source: R8-P-3.

Problem:
mutating a reused Step object during replanning rewrites prior plan history; treating every later occurrence as unrelated loses continuity.

Status: `candidate-mitigated by CDC-20 + P-42@r7 + P-43@r7`.

Prototype evidence: pending PT-003.

---

# 12. Group-level QRP

Existing group QRP is preserved unless superseded below.

## QRP-GQ-6 — State-layer mutation ownership

**Status:** `superseded in r6`.

Reason:
the old Required/Design/Current/TeamPlan layering is replaced.

Replacement concerns are distributed across P-41/P-42/P-43.

## QRP-GP-8 — r5 PG-8 over-normalizes requirement/feature boundary

**NEW Problem.**

Target: PG-8@r5.

Source: R7-P-1..P-4.

Status: `candidate-mitigated by PG-8@r6`.

## QRP-GQ-9 — Evolution Map ordering model

Target: PG-9.

Question:
ordered path + prerequisite edges vs general DAG.

Status: open / non-blocking.

Candidate:
ordered steps with prerequisite edges first.

## QRP-GR-10 — Implementation evolution scope growth

Target: PG-10.

Risk:
File -> Class -> Method -> AST/IDE modeling can overwhelm architecture semantics.

Mitigation:
file-first PT-004; deeper fidelity only with evidence.

Status: open.

---

# 13. Composition-level QRP

Earlier composition QRP is preserved.

## QRP-CP-7 — Requirement decomposition leaked into problem truth

**Status:** `reopened/strengthened by R7, candidate-mitigated in r6`.

R7 provides direct evidence that r5 still over-normalized requirement semantics.

Mitigation:
FR-26 + P-39@r6 + P-35@r6.

## QRP-CR-8 — Product-semantic ontology creep

**Status:** `mitigation revised`.

Old mitigation added selected product entities.

New mitigation:
Requirement Model explicitly permits unnormalized text/context and does not require first-class ownership entities.

## QRP-CP-10 — Requirement / Architecture / Evolution semantics collapsed

**NEW Problem.**

Source: R7-P-2, P-3, P-5, P-6.

Mechanism:
r5 used Requirement Surface -> Feature Model -> Current/TeamPlan, leaving actual knowledge, planned snapshots and evolution transitions insufficiently separated.

Status: `candidate-mitigated by P-39..P-43`.

## QRP-CR-11 — Roadmap knowledge creates hindsight-like overdesign

**NEW Risk.**

Target: whole composition.

Condition:
known future planned impacts are treated as certain justification for immediate generalization.

Mitigation:
FR-8/FR-9; state cost vs transition cost; Evolution Options for uncertain outcomes; P-44 warnings remain advisory.

Status: open.

## QRP-CR-12 — Fake-code model turns simulator into an IDE simulator

**NEW Risk.**

Target: P-47/P-48/PG-10.

Mitigation:
file-first projection; comments/target sketches optional; no AST until validated.

Status: open.

---

# 14. QRP History / Status Changes

```text
QRP-Q-37
  introduced: R6 / r4 -> r5
  r5 answer: explicit PFR <-> BranchFeature RequirementCoverage N:M
  PT-002: explicit relation partially exercised
  r6: superseded/reframed; old ontology removed

QRP-Q-39
  introduced: R6 / r4 -> r5
  r6: superseded; canonical requirement-side BusinessRule ownership no longer central

QRP-GQ-6
  introduced: R6 / r5
  r6: superseded by RequirementModel + Current + EvolutionMapRevision semantics

QRP-CP-7
  introduced: r5
  r6: reopened/strengthened by direct user clarification; candidate-mitigated

QRP-CR-8
  introduced: r5
  r6: mitigation changed from selective ontology to explicitly non-normalized Requirement Model

QRP-P-40..QRP-P-46
  introduced: R7 / r5
  candidate-mitigated in r6, pending prototype evidence where applicable

QRP-Q-47/Q-48/Q-51
  introduced: R7 / r5
  open, non-blocking

QRP-R-49/R-50
  introduced: R7 / r5
  open risks

QRP-GP-8/GQ-9/GR-10
  introduced: r6 composition work

QRP-CP-10/CR-11/CR-12
  introduced: r6 composition work

QRP-P-52
  introduced: R8 / r6
  r7: candidate-mitigated by immutable Plan BASE semantics; PT-003 pending

QRP-P-53
  introduced: R8 / r6
  r7: candidate-mitigated by immutable Step versions + lineage; PT-003 pending
```

Historical invalidated/narrowed R4/R5 findings remain preserved as recorded in r5.

---

# 15. User Assistance

No further user semantic decision is required for the R8 corrections before PT-003.

Useful later validation:

1. PT-003 walkthrough: confirm that the same Requirement Model remains visible while planned architecture coverage changes across CURRENT/S1/S2/... .
2. PT-004 walkthrough: inspect a file with future Step impact references and judge whether the guidance helps without becoming noise/prescription.
3. Architecture-style check: compare BRU projection in layered, vertical-slice, service/module and domain-oriented structures.

These are not blockers for r7 creation. PT-003 is the next validation surface.

---

# 16. Candidate Revised Composition

## Retained

```text
P-1@V3A
P-2@V2
P-3@V3A
P-4@V2
P-5@V3A
P-6@V2
P-7A@V3A
P-8@V2
P-9B@V3A
P-10@V3A
P-11@V2
P-12@V2
P-13@V2
P-14@V3A
P-15@V3A
P-16@V3A
P-17@V3A
P-18@V3A
P-19@r3
P-20@r3
P-21@r3
P-22@r3
P-23@r3
P-24@r3
P-25@r3
P-26@r3
P-27@r3
P-28@r3
P-29@r3
P-30@r3
P-32@r3
P-33@r3
P-34@r3
P-36@r3
N-1..N-13@r3
FR-1..FR-25
CDC-1..CDC-9
```

## Revised

```text
P-31@r7  REVISED_FROM P-31@r6
P-35@r6  REVISED_FROM P-35@r5
P-37@r6  REVISED_FROM P-37@r3
P-38@r6  REVISED_FROM P-38@r5
P-39@r6  REVISED_FROM P-39@r5
P-40A@r6 REVISED_FROM P-40A@r5
P-41@r7  REVISED_FROM P-41@r6
P-42@r7  REVISED_FROM P-42@r6
P-43@r7  REVISED_FROM P-43@r6
CDC-10..CDC-13 revised
CDC-15 revised
PG-8@r7 REVISED_FROM PG-8@r6
PG-9@r7 REVISED_FROM PG-9@r6
```

## New candidate FR / constraints

```text
FR-26 non-normalized Requirement Model
FR-27 actual-known requirements are not distributed by planned steps
FR-28 actual history != planned evolution
CDC-16 full target Architecture Snapshot per Evolution Step
CDC-17 file-first implementation projection
CDC-18 planned Change Axis / Actual Hot Path / Evolution Impact distinction
CDC-19 immutable historical plan BASE
CDC-20 immutable Evolution Step versions + lineage
```

## New Proposals

```text
P-44 Evolution Impact + Impact History + Forward Consistency
P-45 Evolution Options / contingent steps
P-46 Planned Change Axis / Actual Hot Path
P-47 Implementation Model / fake project tree
P-48 Implementation Guidance projection
PG-9 Planned Evolution / Replanning
PG-10 Implementation Evolution
```

## Superseded active assumptions

```text
normalized PFR/ScreenRequirement/WidgetRequirement requirement ontology
canonical shared BusinessRule as requirement-side reuse object
PFR <-> BranchFeature as central architecture mapping
Feature as universal behavior/planning unit
TeamPlan as the primary planned-evolution state
one Requirement Model per planned step / staged requirement truth
Evolution Step treated like an Actual Event
```

## Historical / local alternatives retained

```text
P-9A vector/Pareto-only evaluation
P-7B ephemeral ChangeSet
P-40B stable Feature identity where explicitly given
```

No committed V2 object is deleted.

---

# 17. Alternative Compositions / Local Alternatives

## Architecture behavior unit

Preferred:

```text
Behavior Responsibility Unit
= logical behavior responsibility
Feature = optional subtype/view
```

Open future alternative:
an architecture exposes a different primary planning/reasoning unit while BRU remains a cross-cutting behavior projection.

No separate full candidate branch is needed yet.

## Evolution Map graph

Preferred first model:
ordered steps + prerequisite edges.

Alternative:
general DAG.

Deferred until a concrete fixture needs non-linear planning semantics.

## Implementation fidelity

Preferred:
File/project-tree first.

Alternative later:
Class/Method/target source.

Do not add AST/IDE semantics without evidence.

## Controlled vs adaptive scenarios

Both are now part of the candidate capability set:
- controlled counterfactual for fair comparison;
- adaptive evolution for unforeseen requirements/replanning.

Neither replaces the other.

---

# 18. Need / FR Coverage Re-check

| Need / FR area | r7 coverage |
|---|---|
| N-1 decisions through evolution | P-42/P-43/P-44 + Event History |
| N-2 fair comparison | shared RequirementModel@cursor + branch-local BRU/plans |
| N-3 changing systems | Actual Events + Requirement Model changes + plan revisions |
| N-4 preparation for future | P-45 Options + P-46 Change Axes + P-44 forward consistency |
| N-5 independent choices | BRU logical unit separated from physical structure; Feature not forced |
| N-6 concrete consequences | Evolution Impact + fake project tree + raw relations/mutations |
| N-7 branch/replay | P-23/P-31/P-36 |
| N-8 practical scope | non-normalized requirements; file-first implementation; prototype gates |
| N-9 event history | P-19/P-31/P-43 |
| N-10 event/entity exploration | P-22 + Impact History + file/BRU links |
| N-11 event dynamics | controlled/adaptive modes + divergent plan/implementation responses |
| N-12 work quality | P-25..P-30 + P-44/P-45/P-46 |
| N-13 work dynamics | WorkEpisode remains secondary; impacts/events provide raw basis |
| FR-1 architecture-neutral semantics | P-39 non-normalized; reuse only in architecture planning |
| FR-2 Feature != Vertical Slice | Feature is BRU subtype/view; physical structure independent |
| FR-5 observed/required/forecast | Actual vs Requirement knowledge vs planned snapshots/options |
| FR-8 no hindsight | Requirement Model at actual cursor; plan revisions preserved |
| FR-9 actionable known future | Evolution Steps, Options, Change Axes, implementation guidance |
| FR-13 KEEP | unchanged architecture snapshot/transition remains valid where appropriate |
| FR-15 raw impact | Evolution Impact + event mutations remain inspectable |
| FR-20 history first-class | actual entity history + plan revision history + impact history |
| FR-23 context-dependent work | plan, architecture, implementation and organization all remain context |
| FR-26 non-normalized requirements | P-39@r6 |
| FR-27 actual-known requirements | P-39@r6 + P-41@r7 + P-42@r7 |
| FR-28 actual vs planned truth | P-31@r7 + P-41@r7 + P-42@r7 + P-43@r7 |

No active Need is uncovered.

No hard FR conflict is detected in the selected r7 composition.

Open questions QRP-Q-47/Q-48/Q-51 are non-blocking.

---

# 19. Composition Delta from V3A-candidate-r6

## UNCHANGED

- committed baseline remains V2;
- all User Needs and FR-1..FR-28 remain unchanged;
- non-normalized Requirement Model / BRU semantics from r6 remain;
- Evolution Impact / Options / Change Axis / file-tree proposals remain;
- no `VE-*` is promoted;
- PT-003 remains the next semantic prototype.

## REVISED

### P-31 — Actual vs planned workbench

Previous:
planned cursor could select `CURRENT` or a Step without fully distinguishing historical plan base from today's factual current state.

New:
`P-31@r7` distinguishes `ACTUAL CURRENT` from immutable plan `BASE`; active-plan remaining-path views are projections, not historical-plan mutation.

Source: R8-P-1/R8-U-1..U-3.

### P-41 — Current / planned state semantics

Previous:
EvolutionMapRevision existed but its base semantics were implicit.

New:
`P-41@r7` states that CURRENT is factual at the Actual Event cursor and each plan revision owns immutable BASE provenance.

Source: R8-P-1/R8-P-2.

### P-42 — Evolution Map

Previous:
stored model was described as `CURRENT -> S1 -> ...` and Step identity/versioning was not explicit.

New:
`P-42@r7` stores immutable `based_on_actual_event_ref`, `base_architecture_snapshot_ref`, and immutable step-version refs.

Source: R8-P-1..P-3.

### P-43 — plan revision history

Previous:
old plan revisions were preserved, but how unchanged/revised Step objects survive across revisions was unspecified.

New:
`P-43@r7` permits reuse of unchanged immutable Step versions and requires a new version + lineage when plan-defining semantics change.

Source: R8-P-3/R8-U-4.

### PG-8 / PG-9

Relation graph refreshed so Requirement/Architecture Planning and Planned Evolution groups depend on the r7 Current/BASE and Step-version semantics.

## ADDED

```text
CDC-19 historical EvolutionMapRevision BASE is immutable
CDC-20 Evolution Step versions are immutable across revisions
QRP-P-52 historical Plan BASE / CURRENT ambiguity
QRP-P-53 Step identity can rewrite historical plan revisions
R8 review artifact
```

## SUPERSEDED

```text
P-31@r7 SUPERSEDES P-31@r6
P-41@r7 SUPERSEDES P-41@r6
PG-8@r7 SUPERSEDES PG-8@r6
P-42@r7 SUPERSEDES P-42@r6
P-43@r7 SUPERSEDES P-43@r6
PG-9@r7 SUPERSEDES PG-9@r6
```

No committed V2 decision is changed.

## CLOSED AT CANDIDATE LEVEL / PENDING PROTOTYPE EVIDENCE

```text
QRP-P-52 candidate-mitigated
QRP-P-53 candidate-mitigated
```

Both require PT-003 evidence before semantic/schema freeze.

# 20. Unresolved Decisions

R8 does not add a new unresolved semantic decision before PT-003.

The following are explicitly **settled at candidate level** and move to prototype validation rather than further paper design:

```text
CURRENT = factual architecture at selected Actual Event cursor
historical EvolutionMapRevision owns immutable BASE
exact Evolution Step versions are immutable
changed step semantics create a new version with lineage
```

## Q-3 — Event granularity

Still open before final event-schema freeze.

Preferred:
`SimulationEvent -> Activity/Subevent -> ImplementationOperation`.

## QRP-Q-47 — BRU vs architecture-native primary reasoning unit

Open, non-blocking.

Candidate:
BRU remains logical behavior-responsibility projection; do not force physical/organizational structure to match it.

Potential future architecture axis:

```text
primary reasoning/planning unit:
feature | layer | capability | service | domain | workflow | ...
```

Do not freeze this axis yet.

## QRP-GQ-9 — Evolution Map as ordered path vs DAG

Open, non-blocking.

Candidate first implementation:
ordered steps + prerequisite edges.

## QRP-Q-48 — Implementation fidelity

Open, non-blocking.

Candidate:
File first; Class/Method/target-source only after PT-004 evidence.

## QRP-Q-51 — Change Axis provenance

Open, non-blocking.

Keep provenance explicit rather than forcing one derivation method.

## Metric / scalarization refinement

Still lower priority than semantic/evolution modeling.

No new hidden architecture score is introduced.

---

# 21. Candidate Version Label

`V3A-candidate-r7`

Meaning:

```text
V2 committed baseline
+ R2/R3 lineage
+ P-9B cost direction
+ Event/State/Work Dynamics
+ R4/R5 corrections
+ prototype governance
+ R6 synchronized Event/State + requirement/feature investigation
+ R7 non-normalized Requirement / BRU / Evolution semantics
+ R8 CURRENT vs immutable Plan BASE semantics
+ immutable Evolution Step versions + revision lineage
```

# 22. Transaction Status

```text
SOURCE COMMITTED:
V2

INPUT CANDIDATE:
V3A-candidate-r6

REVIEW / CLARIFICATION APPLIED:
R8 -> V3A-candidate-r6

OPEN CANDIDATE:
V3A-candidate-r7

SEMANTIC COMMIT:
NOT PERFORMED
```

This candidate is not ready for semantic/schema freeze because:

1. PT-003 has not validated Requirement Model / Architecture Planning / Evolution Map interaction;
2. PT-003 has not yet validated immutable Plan BASE and Step-version lineage in replay/replanning UX;
3. PT-004 has not validated fake-file-tree / implementation-guidance usefulness;
4. BRU vs architecture-native primary reasoning unit remains open but non-blocking;
5. Evolution Map ordered-vs-DAG detail remains open but non-blocking;
6. event granularity is still open;
7. no new `VE-*` evidence has been promoted.

No committed Need or FR is uncovered.

# 23. Current Preferred Simulation Semantics

## 23.1 Actual Event History

```text
E1 -> E2 -> E3 -> ... -> NOW
```

Actual Events are factual.

They may reveal requirements, record planning/replanning, implementation, migration, deployment, experiment results, incidents, etc.

Selecting an event shows factual state after replaying authoritative mutations through it.

## 23.2 Requirement Model at actual cursor

One Requirement Model exists for the selected actual point.

It contains all requirements/known uncertainty known then.

It is intentionally non-normalized.

It does not change merely because the user selects a different planned Evolution Step.

## 23.3 Architecture Planning

Architecture Planning may show the same Actor/Goal/Scenario/Behavior/UI context as requirements plus:
- BRUs;
- responsibility boundaries;
- reuse/grouping;
- ownership/dependencies;
- design-introduced UI;
- architecture mappings;
- implementation/runtime/data views.

## 23.4 CURRENT vs immutable Plan BASE

`CURRENT` is factual architecture at the selected Actual Event cursor.

A stored plan revision uses an immutable BASE:

```text
Actual History at E10
CURRENT = A0

Planning Event E11 creates Plan R1
R1 BASE = A0
  -> S1@v1 / A1
  -> S2@v1 / A2
  -> S3@v1 / A3
```

If actual execution later reaches A1:

```text
ACTUAL CURRENT = A1
```

R1 still has `BASE = A0`.

The active-plan UI may project the remaining path as:

```text
CURRENT A1 -> S2@v1 -> S3@v1
```

but that is a convenience projection, not a mutation of R1.

Opening historical R1 reconstructs requirement knowledge from its `based_on_actual_event_ref`; later requirements do not leak backward.

## 23.5 Coverage projection

If R1..R5 are all known now:

```text
Requirement Model: R1 R2 R3 R4 R5

CURRENT  covers R1
S1       covers R1 R2
S2       covers R1 R2 R3
S3       covers R1..R5
```

This is one Requirement Model viewed through changing planned architecture coverage, not four Requirement Models.

## 23.6 Replanning and Step-version lineage

```text
Plan R1
BASE A0
  -> STEP-A@v1
  -> STEP-B@v1
  -> STEP-C@v1

Actual execution reaches A1
Unexpected requirement appears
Planning Event creates R2

Plan R2
BASE A1
  -> STEP-B@v1      reused unchanged
  -> STEP-X@v1      new
  -> STEP-C@v2      revised
```

```text
STEP-C@v2 REVISED_FROM STEP-C@v1
```

Earlier plan revisions remain inspectable with their original BASE, known requirements, dependency relations and exact Step versions.

This makes plan disruption structurally visible as reused, revised, inserted and removed/cancelled future steps.

## 23.7 Evolution Options

```text
EvolutionOption O1
trigger: designer revalidates checkout interaction
transformation: replace presentation responsibility
expected unaffected: domain/payment/order behavior
```

If activated later, it becomes a concrete Step inserted into the then-current map.

## 23.8 Evolution Impact

Selected Step:

```text
S4 Add admin cancellation

Architecture Impact:
  Cancellation BRU modified

Implementation Impact:
  src/cancellation/CancelBooking.ts modified
  src/admin/AdminBooking.ts modified
```

Selecting a BRU/File can show every Step that plans to impact it.

## 23.9 Change Axis / Hot Path

```text
Planned Change Axis:
  Cancellation policy

Actual Hot Path after history:
  repeated cancellation-policy changes
```

Broad Evolution Impacts along an expected local axis are structural evidence that the architecture may not be localizing that change well.

## 23.10 Implementation Model

```text
src/
  booking/
    Booking.ts
  cancellation/
    CancelBooking.ts
    CancellationPolicy.ts
```

Current tree is factual.

Planned steps may show target tree/file impacts.

BRUs and files are not assumed 1:1.

## 23.11 Code-facing guidance

For a file:

```text
Future planned impacts:
S4 add admin variation
S7 extract policy evaluation
S9 retire direct inventory dependency
```

Optional target sketches/comments are generated projections of canonical impact relations.

---

# 24. Evaluation Direction after r7

Do not freeze a single scalar formula yet.

The simulator should be able to expose at least:

```text
State cost / overhead at each intermediate architecture snapshot
Transition / migration cost between snapshots
Evolution Impact locality / blast radius
Repeated impact history on BRUs/files
Plan disruption after unexpected Actual Events
Amount of future-map rewrite required
Ability to insert a local Step vs broad forced migration
Option value for known uncertainty
Actual Hot Path vs Planned Change Axis alignment
Implementation impact vs planned impact
```

A planned migration can be better than carrying early structural complexity.

An avoided migration can be better when upfront structure is cheap enough.

A forced migration may indicate earlier mismatch, but may also be caused by genuinely unforeseen change.

The evidence remains decomposable before any scalarization.

---

# 25. MVP / Prototype Staging — r7 Candidate

## Phase 0 — Preserve event/replay core

Evidence sources:
`PT-001`, PT-002 structural remediation.

Keep:
- ScenarioEvent / BranchEvent identity;
- canonical mutation ledger;
- factual replay;
- accumulated state + selected-event delta.

No `VE-*` promotion yet unless separately interpreted.

## Phase 1 — PT-003 Requirement / Architecture / Evolution Map

Validate:
- non-normalized Requirement Model;
- same requirement material visible in Architecture Planning;
- BRU vs Feature terminology;
- one Requirement Model across planned steps;
- CURRENT + S1/S2/... full architecture snapshots;
- immutable BASE for each historical EvolutionMapRevision;
- historical Requirement Model reconstructed at the revision base event;
- actual progress moving CURRENT without mutating an older plan BASE;
- immutable Evolution Step versions across plan revisions;
- unchanged Step version reused across revisions;
- changed Step producing a new version with `REVISED_FROM` lineage;
- non-monotonic split/merge/move/migration;
- planned coverage statuses;
- Actual Event vs Evolution Step cursor distinction;
- planning event creating a new plan revision;
- unexpected requirement causing local insertion vs broad rewrite;
- Evolution Option activation.

## Phase 2 — PT-004 Evolution Impact / Implementation Model

Validate:
- fake project/file tree;
- BRU <-> File mapping;
- Evolution Impact on BRU and files;
- impact history per target;
- forward consistency against known later impacts;
- file-facing future-step references;
- optional target sketch;
- whether comments/side-panel guidance helps rather than distracts.

Do not add Class/Method/AST unless File proves insufficient.

## Phase 3 — Controlled + adaptive dynamics compare

Use the same requirement facts at the same actual cursor across architectures.

Test:
- different evolution maps;
- same endpoint but different intermediate cost;
- sensible planned migration vs upfront complexity;
- unexpected requirement and replanning;
- plan disruption / insertion cost;
- planned Change Axis vs Actual Hot Path.

## Phase 4 — Work Dynamics + cost

Add:
- WorkEpisode/grouping where useful;
- structural reasoning/planning surfaces;
- reversibility/experimentability;
- cost ledger / P-9B scalarization with raw evidence visible.

## Phase 5 — Later extensions

- richer runtime/data topology;
- calibrated empirical effort;
- interval/critical-path timing;
- incidents/recovery;
- Monte Carlo;
- deeper code artifacts if PT evidence supports them.

---

# 26. Validation Evidence Register

No new `VE-*` is promoted by r7.

Current interpretation:

```text
PT-001
  supports event/replay interaction mechanics provisionally
  formal VE interpretation still pending

PT-002
  structural remediation verified for event identity, mutation ledger,
  ScenarioStep/Widget mechanics and branch replay shell
  BUT its r5 requirement/PFR/Feature semantics are partially superseded by R7
  therefore it must not validate r7 Requirement/Architecture/Evolution semantics

PT-003
  candidate next prototype; not yet executed

PT-004
  candidate later prototype; not yet executed
```

Prototype evidence enters the canonical Proposal Composition only through explicit `VE-*` records with source, result, limitations and affected Proposal/QRP statuses.

---

# 27. Preferred Next Step

Do not rewrite PT-002 to pretend it always tested r7 semantics.

Create a new prototype lineage for:

```text
PT-003
Requirement Model
<-> Architecture Planning / BRUs
<-> Evolution Map / full snapshots / replanning
```

Use a small fixture where:
- all currently known requirements are visible from the start;
- Plan R1 is created from factual architecture A0 and keeps immutable BASE A0;
- actual execution progresses to A1 while historical R1 remains unchanged;
- architecture coverage changes by step;
- one planned migration is economically reasonable;
- one Evolution Option represents known uncertainty;
- an unexpected Actual Event adds a genuinely new requirement;
- Planning Event creates R2 from then-current factual A1;
- at least one future Step version is reused unchanged from R1 into R2;
- at least one future Step is revised into a new version with lineage;
- opening R1 after R2 exists still shows R1's original BASE, requirement knowledge and Step versions;
- the plan can either insert a local step or require broad replanning depending on architecture.

After that semantic model survives, create PT-004 for fake project-tree / implementation-impact guidance.

Do not freeze metrics before these causal semantics are stable.
