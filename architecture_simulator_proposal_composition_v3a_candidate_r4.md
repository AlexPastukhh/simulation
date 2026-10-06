# Architecture Evolution Simulator — Proposal Composition V3A-candidate-r4

## Transaction Status

**CANDIDATE REVISION — NOT COMMITTED**

This document revises:

`V3A-candidate-r3`

Committed baseline remains:

`V2 — architecture_simulator_canonical_model_plan_v2.md`

No commit is performed by this revision.

Candidate label:

`V3A-candidate-r4`

---

# 1. Target Plan / Baseline

## Target being updated

`architecture_simulator_proposal_composition_v3a_candidate_r3.md`

State before this operation:

`candidate`

## Source committed version

`V2 — committed`

## Existing candidate lineage

```text
V2 — COMMITTED
  ↓
R2 → V2
  ↓
R3 → R2 (underlying V2)
  ↓
V3-candidate
  ↓ user selected preferred cost direction P-9B
V3A-candidate
  ↓ Event Dynamics + State History + Work Dynamics
V3A-candidate-r2
  ↓ R4 + R5
V3A-candidate-r3
  ↓ prototype-governance decision
V3A-candidate-r4 — THIS DOCUMENT
```

No later committed version exists.

No parallel newer candidate is known beyond `V3A-candidate-r3`.

---

# 2. Reviews Applied / Provenance

## R2

**Target:** V2  
**Scope:** semantic model, architecture axes, cost/evolution semantics.  
**Limits:** no engine, no calibration dataset, no runtime model.

## R3

**Target:** R2  
**Underlying artifact:** V2  
**Scope:** meta-review of R2; false positives/negatives and missed issues.  
**Limits:** same execution/calibration limits.

## R4

**Target:** `V3A-candidate-r2`

This is the independent review with findings:

```text
REV-P-1 .. REV-P-9
REV-U-1 .. REV-U-3
REV-D-1 .. REV-D-4
REV-Q-1 .. REV-Q-6
```

Main useful findings:
- event classification needed normalization;
- replay mutation semantics were underspecified;
- old/new event vocabularies coexisted;
- cross-branch identity and granularity remained unresolved;
- cost/time/proxy semantics needed tightening.

## R5

**Target:** R4  
**Underlying artifact:** `V3A-candidate-r2`

Meta-review corrected R4:

Confirmed strongly:
```text
REV-P-1
REV-P-4
REV-P-9
REV-U-1
REV-U-2
REV-U-3
```

Narrowed/downgraded:
```text
REV-P-2
REV-P-3
REV-P-5
REV-P-6
REV-P-8
```

Invalidated as current problem:
```text
REV-P-7
```

R5 also added new findings:
```text
MR-P-1 semantic-foundation over-promotion
MR-P-2 shared exogenous event identity vs branch_id
MR-P-3 non-computable human-behavior proxies
MR-P-4 missing Proposal dependency P-24 -> P-19
MR-P-5 duplicate P-28 block
```

These findings apply to `V3A-candidate-r2`, not to an already modified version.

---

# 3. Semantic Foundation Model

R5 showed that the candidate had started to promote some assistant-derived design decisions into User Needs / Fundamental Requirements.

This candidate therefore uses four levels:

```text
User Need (N-*)
Fundamental Requirement (FR-*)
Candidate Design Constraint (CDC-*)
Proposal (P-*)
```

Meaning:

## User Need

Stable user-level outcome or capability.

## Fundamental Requirement

A correctness constraint necessary to satisfy one or more User Needs without embedding a particular implementation choice.

## Candidate Design Constraint

A currently preferred design rule for this candidate composition.
It may later be revised without claiming that the user's need changed.

## Proposal

A concrete candidate solution.

This distinction is itself introduced through `P-32`.

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

### N-10 — Bidirectional Event ↔ Entity/State exploration
For an event, show affected entities/state.
For an entity/state, show relevant history.

### N-11 — Compare architectures through event dynamics
Given comparable external stimuli/requirements, show different internal work/change dynamics.

### N-12 — Evaluate quality of working with the system
Include more than change count:
- comprehensibility;
- discoverability;
- planning burden;
- reversibility;
- experimentability;
- feedback;
- plan flexibility;
- team autonomy;
- operational burden;
- delivery stability.

### N-13@r3 — Explain work dynamics per goal/change

**REVISED_FROM N-13@r2**

Previous wording embedded `WorkEpisode`.

Revised user-level need:

> For a requirement, goal or significant change, the simulator should explain the resulting work dynamics and allow comparison across architecture branches.

`WorkEpisode` is now a Proposal serving N-13, not part of the Need itself.

---

# 5. Fundamental Requirements

## FR-1 — Architecture-neutral problem semantics
Business/problem semantics must not embed the architecture being evaluated.

## FR-2 — Feature != Vertical Slice
Feature is a unit of functionality; Vertical Slice is an implementation organization decision.

## FR-3 — Scoped architecture decisions
Architecture decisions may apply locally.

## FR-4 — Orthogonal underlying architecture state
Compatible choices must not be encoded as mutually exclusive state values.

## FR-5 — Observed / Required / Forecast separation
Facts, targets and expectations are distinct.

## FR-6 — No hidden architecture score
Structural/behavioral consequences precede evaluation.

## FR-7 — Transparent evaluation
Aggregated results must be traceable to visible assumptions/facts.

## FR-8 — Temporal integrity / no hindsight
Decisions may use only information available at decision time.

## FR-9 — Known future information must be actionable before occurrence
The simulator must allow preparation after information reveal and before actual change.

## FR-10 — Separate cost classes
Distinguish at least:
- transition;
- per-change;
- recurring;
- optional incident/risk cost.

## FR-11 — Honest requirement evaluation
Do not claim numerical pass/fail without a valid evaluation method.

## FR-12 — Fair controlled branch comparison
When running a controlled counterfactual, branches must share the same scenario-level external anchors.

This does not claim that every future simulator mode must use a fixed future.

## FR-13 — KEEP is valid
No architecture change must always remain an option.

## FR-14 — Deterministic MVP before Monte Carlo
Validate causal semantics first.

## FR-15 — Raw impact remains inspectable
Scalar results never replace raw evidence.

## FR-16@r3 — Sequence and elapsed time are distinct
Logical/display order and elapsed time are different dimensions.

If a result depends on elapsed time, required timing data must exist.

## FR-17@r3 — Event semantics must avoid conflating independent dimensions

**REVISED_FROM FR-17@r2**

The model must not force event origin, role and domain category into one mutually-exclusive dimension.

Exact field layout is a Candidate Design Constraint / Proposal concern.

## FR-18@r3 — Scenario anchors and branch-generated events must be distinguishable

**REVISED_FROM FR-18@r2**

Controlled branch comparison needs stable identity for shared scenario-level stimuli and separate identity for branch-generated responses.

## FR-19@r3 — Event relations and state mutation must be distinguishable

**REVISED_FROM FR-19@r2**

An event may:
- relate to an entity;
- read/inspect/evaluate it;
- or mutate its state.

These are not assumed to be the same thing.

## FR-20 — State/entity history is first-class
Users must be able to inspect current state plus relevant history.

## FR-21@r3 — Work dynamics may be grouped without changing event truth

**REVISED_FROM FR-21@r2**

The model may group work for explanation/comparison, but grouping must reference canonical events/operations rather than create a conflicting second history.

This no longer mandates `WorkEpisode` specifically.

## FR-22@r3 — Human/work-quality claims must use computable or evidenced proxies

**REVISED_FROM FR-22@r2**

The simulator must distinguish:
- structurally derived proxies;
- future observed/survey/agent traces if such data is later added.

For MVP, only structurally computable proxies are required.

## FR-23 — Work dynamics depend on context
Architecture, organization, engineering environment and task jointly shape work.

## FR-24@r3 — Reversibility/experimentability evidence must remain decomposable

Do not hide rollback, data, contracts, rollout, isolation and feedback behind an opaque single score.

## FR-25 — Scalarized effort remains transparent
User selected `P-9B`.
Raw evidence and coefficients remain visible and scenario/profile-specific.

---

# 6. Candidate Design Constraints

These are **not** User Needs or immutable Fundamental Requirements.

## CDC-1 — Orthogonal event dimensions
Prefer separate:
```text
provenance
role
category
```

## CDC-2 — One canonical event envelope
`SimulationEvent` is the common envelope for event-like history.

## CDC-3 — Authoritative mutation separate from derived impact
Replay uses explicit typed mutations/deltas, not propagated impact descriptions.

## CDC-4 — Controlled MVP comparison
First MVP uses controlled counterfactual scenario anchors.

Adaptive product evolution is deferred.

## CDC-5 — Three-level granularity
Preferred structure:
```text
SimulationEvent
  -> Activity/Subevent
     -> ImplementationOperation
```

## CDC-6 — Point-event MVP temporal model
For MVP:
```text
timestamp/order
causal/predecessor edges
```

Intervals are deferred until wall-clock critical-path/wait metrics are required.

## CDC-7 — Structural work-quality proxies only in MVP
Do not invent simulated developer inspection behavior.

## CDC-8 — One scalar cost-bearing ledger
Analytical lenses do not automatically add independent cost.

## CDC-9 — Prototype plans stay outside the canonical plan
Prototype plans, fixtures, mockups and experiment procedures are stored as separate `PT-*` artifacts.
The canonical Proposal Composition records only:
- the prototype reference;
- validated evidence/result;
- resulting Proposal/QRP/status changes.
Unvalidated prototype assumptions do not become Needs, FRs or accepted Proposals merely because they were used in a prototype.

---

# 7. Existing Committed Decisions

Committed baseline remains V2.

Committed proposal lineage retained:

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

Nothing in this candidate changes committed V2.

---

# 8. Review Findings Classification

## Confirmed findings retained

```text
REV-P-1  event classification conflates dimensions
REV-P-4  replay mutation semantics underspecified
REV-P-9  old/new event vocabularies coexist
REV-U-1  cross-branch semantic identity unresolved
REV-U-2  event granularity unresolved
REV-U-3  WorkEpisode overlap unresolved but non-blocking
MR-P-1   design choices promoted into Need/FR
MR-P-2   shared scenario event identity conflicts with branch_id-only model
MR-P-3   some reasoning/planning proxies are not computable from current model
MR-P-4   Proposal relation graph missed P-24 -> P-19
MR-P-5   duplicate P-28 block
```

## Narrowed findings

### REV-P-2
Not retained as a confirmed mutation/history bug.

Retained as:
```text
need to model non-mutating EventEntityRelation separately from StateMutation
```

### REV-P-3
Not a current MVP defect.

Retained as:
```text
future temporal-model requirement if wall-clock concurrency/critical-path metrics are added
```

### REV-P-5
Not retained as proven double-counting.

Retained as:
```text
confirmed underspecification of scalar cost-bearing basis
+
double-counting risk
```

### REV-P-6
Narrowed to:
```text
conditional timing-data contract needed for time-based recurring/crossover evaluation
```

### REV-P-8
Narrowed to:
```text
MVP must label values as modeled structural proxies;
observed/survey provenance is deferred until such data exists
```

## Invalidated current problem

### REV-P-7
`fixed exogenous future conflicts with Experimentability`

Invalidated as a current defect because FR-18 already applied only "where applicable".

Preserved as deferred future capability:
`adaptive_product_evolution`.

---

# 9. Proposal Changes

## P-19@r3 — Canonical SimulationEvent envelope

**REVISED_FROM P-19@r2**

Addresses:
`REV-P-4`, `REV-P-9`, `MR-P-2`

```text
SimulationEvent
- id
- scope
- logical_order
- occurred_at?
- provenance
- role
- category
- title
- description
- caused_by[]
- triggered_by[]
- relations[]
- mutations[]
```

### Scope

```text
scenario
branch:<branch_id>
```

Scenario-scoped events may be shared anchors.

Branch-scoped events belong to a branch.

### Replay rule

Only authoritative:
```text
mutations[]
```
change reconstructed state.

Relations/analytics do not.

**Status:** preferred candidate

---

## P-20@r3 — Orthogonal event taxonomy

**REVISED_FROM P-20@r2**

Addresses:
`REV-P-1`

Preferred fields:

```text
provenance:
  scenario_external
  branch_generated
  user_decision
  external_observation

role:
  information
  stimulus
  decision
  activity
  state_change
  outcome
  evaluation

category:
  requirement
  business_change
  workload
  organization
  external_system
  architecture
  analysis
  planning
  coordination
  implementation
  test
  migration
  deployment
  experiment
  feedback
  incident
  recovery
  ...
```

Not all combinations are valid; validation rules may constrain them.

**Status:** preferred candidate

---

## P-21@r3 — EventEntityRelation + StateMutation

**REVISED_FROM P-21@r2**

Addresses:
`REV-P-2` narrowed finding, `REV-P-4`

### EventEntityRelation

```text
event_id
entity_id
relation_type:
  reads
  inspects
  depends_on
  evaluates
  triggers
  coordinates_with
  references
  ...
directness?
causal_path?
```

### StateMutation

```text
event_id
entity_id
mutation_type:
  create
  modify
  delete
  migrate
  replace
delta / before_ref / after_ref
```

State history may show:
- Mutation History
- Related Activity History

**Status:** preferred candidate

---

## P-22@r3 — Entity/State Explorer

**REVISED_FROM P-22@r2**

Use terminology:

```text
TrackedEntity
EntityState
```

rather than treating every business rule/module/team/requirement itself as "a State".

View contains:

```text
Current entity state
Mutation History
Related Activity History
Semantic history
Architecture/implementation representation history
Before/after where applicable
Causal paths
```

**Status:** preferred candidate

---

## P-23@r3 — Controlled Event Dynamics Compare

**REVISED_FROM P-23@r2**

Addresses:
`MR-P-2`, `FR-12`, `FR-18`

Comparison anchor:

```text
ScenarioEvent
```

Branch responses:

```text
BranchEvent
```

Example:

```text
ScenarioEvent REQ-7
        │
   ┌────┴────┐
   │         │
Branch A   Branch B
   │         │
BranchEvents...
```

Never duplicate a shared external requirement merely to assign it a branch.

**Status:** preferred candidate

---

## P-24@r3 — WorkEpisode grouping

**REVISED_FROM P-24@r2**

Addresses:
`MR-P-4`, `REV-U-3`

**REQUIRES:** `P-19`

WorkEpisode is explicitly a grouping/projection:

```text
WorkEpisode
- id
- trigger_refs[]
- event_refs[]
- operation_refs[]
- branch_id
```

It does not own or duplicate canonical events.

Multiple WorkEpisodes may reference the same event/operation.

No exclusive ownership assumption.

**Status:** preferred candidate

---

## P-25@r3 — Structural Reasoning Surface

**REVISED_FROM P-25@r2**

Addresses:
`MR-P-3`, `REV-P-8` narrowed

MVP uses only structurally computable proxies:

```text
authoritative knowledge locations
semantic concepts in affected closure
states/entities in affected closure
contracts crossed
boundary crossings
dependency depth
knowledge duplication
runtime mechanisms involved
owners/teams whose domain knowledge is structurally required
```

Removed from MVP proxy set:

```text
locations actually inspected
authority candidates actually checked
semantic context switches actually experienced
```

unless a future agent/human observation model exists.

**Status:** preferred candidate

---

## P-26@r3 — Structural Planning Surface

**REVISED_FROM P-26@r2**

MVP planning proxies:

```text
known dependencies requiring analysis
contracts requiring review
teams requiring coordination
migration decisions required
compatibility constraints
rollout constraints
approvals structurally required
unresolved modeled uncertainties
```

Do not invent developer behavior traces.

**Status:** preferred candidate

---

## P-27@r3 — Reversibility / Plan Flexibility

**RETAINED, wording tightened**

Track decomposed rollback/rework obligations.

No major semantic change.

---

## P-28@r3 — Experimentability / Feedback Dynamics

**REVISED_FROM duplicate P-28 blocks**

Artifact duplication removed.

MVP tracks:
```text
experiment setup operations
isolation capability
instrumentation obligations
deployment scope
rollback obligations
event-distance-to-feedback
elapsed-time-to-feedback when timing data exists
```

**Status:** preferred candidate

---

## P-29@r3 — Team Autonomy / Coordination

**RETAINED**

Still conditioned on OrganizationState + EngineeringEnvironment.

---

## P-30@r3 — Work Dynamics Lenses as projections

**REVISED_FROM P-30@r2**

Addresses:
`REV-P-5` narrowed

Lenses:

```text
Changeability
Comprehensibility
Discoverability
Planning Burden
Reversibility
Experimentability
Feedback Speed
Plan Flexibility
Team Autonomy
Operational Burden
Delivery Stability
```

They are analytical projections.

They are **not cost-bearing by default**.

Each scalar cost contribution must point to a canonical cost fact.

---

## P-31@r3 — Event-centric visualization

**REVISED_FROM P-31@r2**

Primary views:

```text
Event Stream
Entity/State Explorer
Event Inspector
Dynamics Compare
WorkEpisode Inspector
Analytics / Retrospective
```

Vertical stream remains UI ordering.

It does not imply strict sequential execution.

---

## P-32@r3 — Semantic Foundation Layering

**NEW**

Origin:
`MR-P-1`

Adds explicit composition layers:

```text
Need
Fundamental Requirement
Candidate Design Constraint
Proposal
```

Prevents Proposal choices from silently becoming immutable requirements.

**Status:** preferred candidate

---

## P-33@r3 — Canonical Cost-Bearing Ledger

**NEW**

Origin:
`REV-P-5` narrowed, `REV-Q-3`

One scalar source of truth:

```text
CostFact
- id
- source_event / operation / obligation
- cost_kind:
    effort
    elapsed_resource_time
    recurring_obligation
    explicit_risk_or_incident
- quantity
- unit
- coefficient_ref
```

Rules:
- lenses do not add cost automatically;
- one fact has one canonical identity;
- derived views reference cost facts;
- scalarization coefficients remain visible.

**Status:** preferred candidate

---

## P-34@r3 — Evaluation Time Basis

**NEW**

Origin:
`REV-P-6` narrowed

```text
EvaluationTimeBasis:
  logical_events
  elapsed_time
  hybrid
```

Validation:

```text
if recurring cost is time-based
then required timestamps/durations must exist
```

Without elapsed time:
```text
"payback after N scenario events"
```

With elapsed time:
```text
"payback after T days/months"
```

**Status:** preferred candidate

---

## P-35@r3 — Semantic Entity ↔ Branch Representation Mapping

**NEW**

Origin:
`REV-U-1`, `MR-Q-5`

```text
SemanticEntity
BranchRepresentation
RepresentationMapping
```
Mapping supports:

```text
1:1
1:N
N:1
N:M where necessary
```

Example:

```text
CancellationPolicy
  -> Branch A: DomainPolicy
  -> Branch B: CancelHandler + AdminHandler + ChangeDatesHandler
```

**Status:** preferred candidate

---

## P-36@r3 — ScenarioEvent / BranchEvent identity

**NEW**

Origin:
`MR-P-2`

A stable scenario-level event may act as an external anchor.

Branch-generated response events are separate identities.

This is represented through `P-19.scope`, but retained as a distinct Proposal because it is central to branch comparison.

**Status:** preferred candidate

---

## P-37@r3 — Controlled vs Adaptive Simulation Modes

**NEW, deferred implementation**

Origin:
`REV-P-7` invalidation / `REV-D-1`

Modes:

```text
controlled_counterfactual
adaptive_product_evolution
```

Current MVP selects:

```text
controlled_counterfactual
```

Adaptive mode remains future work.

**Status:** accepted candidate concept, deferred implementation

---

## P-38@r4 — Prototype Validation Track

**NEW**

Origin:
user process decision after `V3A-candidate-r3`.

Purpose:
keep prototype planning and experimental detail separate from the canonical Proposal Composition while making validated results traceable back into the plan.

Prototype identity:
```text
PT-001
PT-002
...
```

Each prototype artifact must define:
```text
target Proposals / QRP / questions
hypotheses or propositions being tested
scope and non-goals
fixture / scenario / variants
observable evidence
acceptance / falsification criteria
results
conclusion
main-plan impact
```

Completed prototype evidence promoted into the main plan uses:
```text
VE-001
VE-002
...
```

A `VE-*` entry records:
```text
source PT-*
what was observed
what was not established
which Proposal/QRP/CDC is affected
status change / composition change, if any
```

Prototype failures and inconclusive results remain preserved; they are not deleted merely because they do not support the preferred design.

**RECOMMENDED_WITH:** P-32

**Status:** preferred candidate governance proposal

---

# 10. Proposal Relations / Groups

## PG-1 — Cost Evaluation

Selected:
```text
P-9B transparent scalar effort + raw vectors
```

New hard relation:
```text
P-9B REQUIRES P-33
P-9B RECOMMENDED_WITH P-34
```

P-9A remains historical alternative.

---

## PG-2 — Change Work Semantics

Selected:
```text
P-7A persistent lightweight ChangeSet
```

Relations:
```text
P-7A RECOMMENDED_WITH P-33
```

---

## PG-3 — Temporal / Information Integrity

Members:
```text
P-5
P-10
P-14
P-19
P-20
P-34
P-36
```

`DecisionOpportunity` is no longer required to be a stored event.
It may be engine/UI capability derived from current state/information.

---

## PG-4 — Neutral Evaluation

Members:
```text
P-1
P-7A
P-9B
P-10
P-17
P-25
P-26
P-30
P-33
```

---

## PG-5 — Event Dynamics Core

```text
P-19
P-20
P-21
P-22
P-23
P-31
P-35
P-36
```

Hard relations:

```text
P-20 REQUIRES P-19
P-21 REQUIRES P-19
P-22 REQUIRES P-21
P-23 REQUIRES P-19 + P-20 + P-21 + P-13 + P-36
P-31 REQUIRES P-19 + P-21 + P-22 + P-23
P-35 RECOMMENDED_WITH P-23
```

---

## PG-6 — Work Dynamics

```text
P-24
P-25
P-26
P-27
P-28
P-29
P-30
```

Relations:

```text
P-24 REQUIRES P-19
P-25 REQUIRES P-24
P-26 REQUIRES P-24
P-29 REQUIRES P-24 + P-16
P-30 BUNDLES P-25..P-29
P-30 REQUIRES P-33 only for scalar-cost views
```

---

## PG-7 — Semantic Foundation Governance

```text
P-32
P-38
```

Relations:
```text
P-38 RECOMMENDED_WITH P-32
```

P-32 applies composition-wide.
P-38 governs how experimental evidence enters the composition.

No dependency cycle detected.

No mutually-exclusive Proposals remain inside the selected current candidate.

---

# 11. Proposal-level QRP

Existing QRP history is preserved.

## QRP-P-20 — Event classification dimensions conflated

**Type:** Problem  
**Source:** R4 `REV-P-1`, confirmed R5  
**Target:** P-20@r2  
**Status history:**
- introduced: R4 / V3A-r2
- confirmed: R5
- candidate mitigation: P-20@r3
- current: `candidate-mitigated; open until commit`

---

## QRP-Q-21 — Non-mutating relation semantics

**Type:** Question  
**Source:** R4 `REV-P-2`, narrowed R5  
**Target:** P-21  
**Status:**
candidate answer in P-21@r3.

Not a confirmed historical corruption bug.

---

## QRP-R-22 — Concurrency / wall-clock flow model

**Type:** Risk  
**Source:** R4 `REV-P-3`, narrowed R5  
**Target:** P-19/P-24/P-28  
**Condition:** simulator starts claiming wait time / critical path / true wall-clock WorkEpisode duration.  
**Mitigation:** causal edges now; intervals later.  
**Status:** `deferred risk`

---

## QRP-P-23 — Replay mutation semantics underspecified

**Type:** Problem  
**Source:** R4 `REV-P-4`, confirmed R5  
**Target:** P-19/P-21  
**Status:** candidate mitigation P-19/P-21@r3.

---

## QRP-P-24 — Scalar cost-bearing basis underspecified

**Type:** Problem  
**Source:** R4 `REV-P-5`, narrowed R5  
**Target:** P-9B/P-30  
**Mechanism:** same work can appear in multiple analytical views without a canonical additive basis.  
**Status:** candidate mitigation P-33.

---

## QRP-Q-25 — Conditional timing basis

**Type:** Question  
**Source:** R4 `REV-P-6`, narrowed R5  
**Target:** P-9B / recurring cost  
**Status:** candidate answer P-34.

---

## QRP-R-26 — Adaptive product evolution absent

**Type:** Risk / future capability  
**Source:** R4 `REV-P-7`, invalidated as current problem by R5  
**Status history:**
- introduced as problem by R4
- invalidated as current problem by R5
- preserved as deferred future capability P-37

---

## QRP-R-27 — Proxy provenance / human cognition

**Type:** Risk  
**Source:** R4 `REV-P-8`, narrowed R5  
**Status:** mitigated for MVP through P-25/P-26 structural-only proxies.

Observed/survey modes deferred.

---

## QRP-P-28 — Dual event vocabularies

**Type:** Problem  
**Source:** R4 `REV-P-9`, confirmed R5  
**Target:** P-5/P-19/P-20  
**Status:** candidate mitigation through single P-19 envelope.

---

## QRP-P-29 — Semantic foundation over-promotion

**Type:** Problem  
**Source:** R5 `MR-P-1`  
**Target:** composition semantics  
**Violated:** proposal-governance intent  
**Status:** candidate mitigation P-32 + revised N/FR.

---

## QRP-P-30 — Shared scenario anchor identity ambiguous

**Type:** Problem  
**Source:** R5 `MR-P-2`  
**Target:** P-19/P-23  
**Status:** candidate mitigation P-36.

---

## QRP-P-31 — Some work-quality proxies not computable

**Type:** Problem  
**Source:** R5 `MR-P-3`  
**Target:** P-25/P-26  
**Status:** candidate mitigation structural-only proxies.

---

## QRP-P-32 — Missing P-24 -> P-19 dependency

**Type:** Problem  
**Source:** R5 `MR-P-4`  
**Target:** proposal relation graph  
**Status:** resolved in this candidate artifact; relation explicitly added.

---

## QRP-P-33 — Duplicate P-28 block

**Type:** Problem  
**Source:** R5 `MR-P-5`  
**Target:** V3A-r2 artifact  
**Status:** resolved in this candidate artifact.

---

# 12. Group-level QRP

## QRP-GQ-1 — Cost mode
Resolved for candidate through user selection of P-9B.

## QRP-GQ-2 — Event granularity
Still open.

Current Proposal:
```text
SimulationEvent
Activity/Subevent
ImplementationOperation
```

Blocking:
before final event schema freeze.

## QRP-GR-3 — Work Dynamics complexity growth
Still applicable.

Mitigation:
phased implementation.

## QRP-GR-4 — Event-core consistency
New.

Target:
PG-5

Risk:
scope/identity/mutation/relation concepts drift apart.

Mitigation:
P-19/P-21/P-35/P-36 share stable IDs and explicit mappings.

Status:
candidate-mitigated.

---

# 13. Composition-level QRP

## QRP-CQ-1 — Cost mode
Resolved in candidate through P-9B.

## QRP-CR-2 — Workflow-simulator scope drift
Still applicable.

Mitigation:
every Work Dynamics conclusion must trace back to architecture/context facts.

## QRP-CR-3 — Event taxonomy ontology creep
Still applicable.

Mitigation:
small extensible vocabularies.

## QRP-CP-4 — Semantic-foundation contamination

**Type:** Problem  
**Source:** R5 MR-P-1  
**Status:** candidate-mitigated by P-32.

## QRP-CR-5 — Scalarization mistaken for empirical truth

**Type:** Risk  
**Target:** whole composition  
**Condition:** abstract coefficients presented as realistic productivity estimates.  
**Mitigation:** visible EvaluationProfile + illustrative labeling + later calibration.  
**Status:** open risk.

## QRP-CR-6 — Prototype assumptions leak into canonical semantics

**Type:** Risk  
**Target:** composition governance  
**Source:** prototype-governance decision after V3A-r3  
**Condition:** a mockup/scenario choice is copied into the main plan before it is actually validated.  
**Consequence:** exploratory artifacts silently harden into Needs/FRs/accepted design.  
**Mitigation:** CDC-9 + P-38; only `VE-*` evidence and explicit Proposal/QRP changes are promoted.  
**Status:** candidate-mitigated.

---

# 14. QRP History / Status Changes

```text
R2 / V2
  QRP-P-1.. earlier model problems introduced

R3 / underlying V2
  additional model findings; several earlier findings narrowed

V3-candidate
  candidate mitigations created
  cost mode unresolved

User decision
  P-9B selected

V3A-candidate-r2
  Event Dynamics + Work Dynamics introduced

R4 / V3A-r2
  REV-P-1..REV-P-9 etc.

R5 / underlying V3A-r2
  confirmed:
    REV-P-1
    REV-P-4
    REV-P-9
  narrowed:
    REV-P-2
    REV-P-3
    REV-P-5
    REV-P-6
    REV-P-8
  invalidated as current defect:
    REV-P-7
  added:
    MR-P-1..MR-P-5

V3A-candidate-r3
  candidate mitigations added:
    P-19@r3
    P-20@r3
    P-21@r3
    P-22@r3
    P-23@r3
    P-24@r3
    P-25@r3
    P-26@r3
    P-28@r3
    P-30@r3
    P-32..P-37

  QRP-P-32 resolved in candidate artifact
  QRP-P-33 resolved in candidate artifact
  all other candidate fixes remain uncommitted

V3A-candidate-r4
  prototype planning separated from canonical composition
  added:
    CDC-9
    P-38 Prototype Validation Track
    QRP-CR-6
  prototype evidence will be promoted as VE-* entries only after execution
```

No QRP history is deleted.

---

# 15. User Assistance

No user action is required to continue design.

## UA-2 — Event granularity validation

Still useful later.

After a real walkthrough exists, present:

```text
coarse
balanced
fine
```

granularity on the same scenario.

This validates readability/pedagogy.

Not blocking current plan refinement.

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
P-27@r3
P-29@r3
```

## Revised

```text
P-19@r3
P-20@r3
P-21@r3
P-22@r3
P-23@r3
P-24@r3
P-25@r3
P-26@r3
P-28@r3
P-30@r3
P-31@r3
N-13@r3
FR-16@r3
FR-17@r3
FR-18@r3
FR-19@r3
FR-21@r3
FR-22@r3
FR-24@r3
```

## New

```text
P-32 Semantic Foundation Layering
P-33 Canonical Cost-Bearing Ledger
P-34 Evaluation Time Basis
P-35 Semantic Entity ↔ Branch Representation Mapping
P-36 ScenarioEvent / BranchEvent identity
P-37 Controlled vs Adaptive Simulation Modes
P-38 Prototype Validation Track
CDC-1..CDC-9
```

## Removed from current candidate

No historical Proposal is deleted.

Removed as active formulation:
```text
single event_class = EXOGENOUS|DECISION|ENDOGENOUS|OUTCOME
StateImpact as the only event/entity relation
WorkEpisode-specific wording inside User Need
behavioral proxies such as "locations actually inspected" in MVP
```

## Rejected

None.

## Historical alternatives retained

```text
P-9A vector/Pareto-only evaluation
P-7B ephemeral ChangeSet
```

Not active.

---

# 17. Alternative Compositions

No major full alternative composition remains.

Local alternatives remain:

## Event taxonomy representation
Preferred:
```text
provenance + role + category
```

Alternative:
tag-based qualified types.

No separate candidate branch required yet because both satisfy FR-17.

## Temporal model
Current MVP:
```text
point events + ordering/timestamps + causal edges
```

Future alternative:
```text
interval activities + partial-order/critical-path model
```

Deferred until wall-clock flow metrics are required.

## Adaptive simulation
Current:
```text
controlled_counterfactual
```

Future:
```text
adaptive_product_evolution
```

Deferred.

---

# 18. Need / FR Coverage Re-check

| Need | Candidate coverage |
|---|---|
| N-1 explain decisions | P-5, P-6, P-23, P-24 |
| N-2 fair comparison | P-1, P-9B, P-17, P-33 |
| N-3 evolution | P-14, P-19 |
| N-4 future preparation | P-5 |
| N-5 independent choices | P-3, P-20 |
| N-6 concrete consequences | P-7A, P-21, P-33 |
| N-7 branch/replay | P-13, P-19, P-36 |
| N-8 practical scope | P-11, CDC-4/6/7 |
| N-9 event history | P-19, P-31 |
| N-10 event/entity exploration | P-21, P-22 |
| N-11 event dynamics | P-23, P-36 |
| N-12 work quality | P-25..P-30 |
| N-13 work-dynamics explanation | P-24, P-31 |

All active Needs have coverage.

All active FRs have at least one Proposal/Constraint implementing them.

No hard FR conflict detected.

No User Need depends on `WorkEpisode` as the only possible implementation.

---

# 19. Composition Delta from V3A-candidate-r2

## UNCHANGED

- committed baseline V2;
- P-9B selected inside candidate;
- event-centric UI direction;
- branch/replay goal;
- state/entity history goal;
- Work Dynamics as additional architecture lens;
- phased MVP approach.

## REVISED

### Semantic foundation
Previous:
some design decisions embedded directly in N/FR.

New:
Need / FR / CDC / Proposal split.

Source:
R5 MR-P-1.

### Event model
Previous:
`event_class + category + direct_impacts`.

New:
orthogonal provenance/role/category + relations + authoritative mutations.

Source:
R4 REV-P-1/P-4/P-9 + R5.

### Shared branch anchors
Previous:
single event with branch_id ambiguity.

New:
scenario-scoped anchors + branch-scoped response events.

Source:
R5 MR-P-2.

### WorkEpisode
Previous:
grouping proposal without explicit P-19 hard dependency.

New:
explicitly references canonical events/operations and REQUIRES P-19.

Source:
R5 MR-P-4.

### Reasoning/Planning
Previous:
mixed structural and behavioral proxies.

New:
structurally computable proxies only for MVP.

Source:
R5 MR-P-3.

### Cost
Previous:
P-9B scalarization without explicit single additive ledger.

New:
P-33 canonical cost-bearing ledger.

Source:
R4 REV-P-5 narrowed by R5.

### Timing
Previous:
elapsed time optional with implicit evaluator behavior.

New:
P-34 explicit EvaluationTimeBasis and conditional data requirements.

Source:
R4 REV-P-6 narrowed by R5.

## ADDED

```text
P-32..P-38
CDC-1..CDC-9
new QRP items QRP-P-20..QRP-P-33
QRP-GR-4
QRP-CP-4
QRP-CR-5
QRP-CR-6
```

## REMOVED FROM CANDIDATE

- duplicated P-28 block;
- mandatory single mixed event_class formulation;
- WorkEpisode-specific user-need wording;
- non-computable "actually inspected" behavioral proxies from MVP.

## SUPERSEDED

Within candidate lineage:

```text
P-19@r3 supersedes candidate form P-19@r2
P-20@r3 supersedes P-20@r2
P-21@r3 supersedes P-21@r2
P-22@r3 supersedes P-22@r2
P-23@r3 supersedes P-23@r2
P-24@r3 supersedes P-24@r2
P-25@r3 supersedes P-25@r2
P-26@r3 supersedes P-26@r2
P-28@r3 supersedes duplicated P-28@r2 artifact blocks
P-30@r3 supersedes P-30@r2
P-31@r3 supersedes P-31@r2
```

These are candidate supersedes only.
V2 remains committed.

## REOPENED

None.

---

# 20. Unresolved Decisions

## Q-3 — Event granularity

Status:
open.

Preferred Proposal:
```text
SimulationEvent
Activity/Subevent
ImplementationOperation
```

Blocking:
before final event-schema freeze.

User validation later is useful.

---

## Q-4 — WorkEpisode overlap

Status:
non-blocking for simple MVP.

Preferred Proposal:
shared events/operations may be referenced by multiple episodes.

No attribution weights until a real double-counting scenario requires them.

---

## Q-5 — Cross-branch representation mapping

Status:
candidate answer P-35.

Still blocking before generalized State/Entity Compare is considered frozen.

Preferred:
stable SemanticEntity + branch-local representations + N:M mapping.

---

## Q-6 — Wall-clock concurrency model

Status:
deferred.

Current Proposal:
point events + timestamps + causal edges.

Intervals/critical-path model only when needed.

Not blocking Event/State MVP.

---

# 21. Candidate Version Label

`V3A-candidate-r4`

Meaning:

```text
V2 committed baseline
+ R2/R3 corrections
+ user-selected P-9B
+ Event Dynamics / Work Dynamics
+ R4 independent review
+ R5 meta-review corrections
+ normalized proposal-composition governance
+ separate prototype-validation track
```

---

# 22. Transaction Status

```text
SOURCE COMMITTED:
V2

OPEN CANDIDATE:
V3A-candidate-r4

COMMIT:
NOT PERFORMED
```

Candidate is not yet ready for final schema freeze because:

1. `Q-3` event granularity remains open;
2. `Q-5` cross-branch representation mapping should be validated;
3. concrete walkthrough has not yet validated readability and causal traceability.

However, the following are no longer conceptual blockers:

- cost mode;
- event origin/role/category separation;
- replay source-of-truth;
- cost de-duplication policy;
- WorkEpisode dependency;
- structural-only Reasoning/Planning proxies;
- controlled-vs-adaptive MVP scope.

---

# 23. Current Preferred Simulation Semantics

## 23.1 Event/state core

```text
Initial State
+
ScenarioEvents
+
BranchEvents with authoritative mutations
=
Branch Simulation State
```

`relations[]` explain association.

`mutations[]` reconstruct state.

Derived impact/cost/lenses reference those facts.

---

## 23.2 Shared external anchor

```text
ScenarioEvent REQ-17
        │
        ├──── Branch A response events
        │
        └──── Branch B response events
```

The scenario event is not duplicated merely to attach a branch id.

---

## 23.3 Entity/state identity

```text
SemanticEntity
    ↓ mappings
BranchRepresentation(s)
```

State history may show both:
- semantic evolution;
- representation/architecture evolution.

---

## 23.4 Work dynamics

A goal/change may be grouped as:

```text
WorkEpisode
  -> event refs
  -> operation refs
```

Comparison lenses:

```text
Changeability
Comprehensibility
Discoverability
Planning Burden
Reversibility
Experimentability
Feedback Speed
Plan Flexibility
Team Autonomy
Operational Burden
Delivery Stability
```

MVP proxies must be structurally computable.

---

## 23.5 Scalar cost

```text
operations / recurring obligations / explicit incident facts
        ↓
Canonical Cost Facts
        ↓
EvaluationProfile
        ↓
abstract effort / cumulative cost
```

Analytical lenses do not automatically add extra cost.

---

# 24. MVP Staging — Revised

## Phase 1 — Event / Entity Core
- ScenarioEvent / BranchEvent identity
- SimulationEvent envelope
- event relations
- state mutations
- entity/state explorer
- event inspector
- replay/branch

## Phase 2 — Controlled Dynamics Compare

- shared scenario anchors
- divergent branch response streams
- ImplementationChangeSet
- P-33 Cost Ledger
- P-9B scalar effort + raw evidence

## Phase 3 — WorkEpisode Core

- WorkEpisode grouping
- structural Reasoning Surface
- structural Planning Surface
- Reversibility

## Phase 4 — Adaptive-development lenses

- Experimentability
- Feedback distance/time
- Plan Flexibility
- Team Autonomy

Still within controlled-counterfactual mode.

## Phase 5 — Future extensions

- adaptive_product_evolution
- intervals / critical path / wait-time model
- incidents/recovery
- calibrated empirical effort
- runtime performance models
- Monte Carlo

---

# 25. Preferred Next Step

Do **not** place the detailed Booking SaaS walkthrough inside this canonical plan.

Run it as a separate prototype artifact:

```text
prototypes/PT-001_event_entity_walkthrough.md
```

PT-001 should validate concrete unresolved propositions around:
- event granularity;
- ScenarioEvent vs BranchEvent identity;
- relation vs mutation history;
- semantic entity vs branch representation mapping;
- vertical stream readability;
- WorkEpisode usefulness;
- raw evidence vs scalar cost display.

When PT-001 is completed, add a compact `VE-*` result entry to this plan and update the affected Proposal/QRP statuses.

Do not copy the prototype's unvalidated fixture choices into the canonical model.

Only after the relevant PT-001 findings are recorded should the event/entity schema be frozen.

---

# 26. Validation Evidence Register

No prototype has been completed yet.

Validated prototype results enter this plan as `VE-*` records.

Each record must contain:
```text
VE id
source PT id
prototype version / commit
claims/questions tested
result: supported | unsupported | mixed | inconclusive
observations/evidence
limitations
Proposal / CDC / QRP affected
status changes made in this candidate
```

A prototype artifact remains the detailed experimental record.
This register stores only the evidence needed to evolve the canonical Proposal Composition.