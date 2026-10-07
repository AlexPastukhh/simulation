# Architecture Evolution Simulator — Proposal Composition V3A-candidate-r5

## Transaction Status

**CANDIDATE REVISION — NOT COMMITTED**

This document revises:

`V3A-candidate-r4`

Committed baseline remains:

`V2 — architecture_simulator_canonical_model_plan_v2.md`

No commit is performed by this revision.

Candidate label:

`V3A-candidate-r5`

---

# 1. Target Plan / Baseline

## Target being updated

`architecture_simulator_proposal_composition_v3a_candidate_r4.md`

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
V3A-candidate-r4
  ↓ R6 requirement-surface / state-canvas review
V3A-candidate-r5 — THIS DOCUMENT
```

No later committed version exists.

No parallel newer candidate than `V3A-candidate-r4` was present when R6 was applied.

The open candidate is therefore revised transactionally as `r5`; `r4` remains preserved in history.

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

## R6

**Target:** `V3A-candidate-r4`  
**Review artifact:** `architecture_simulator_review_r6_requirement_surface_and_state_canvas.md`  
**Scope:** requirement-surface semantics, Feature grouping boundaries, Required/Current/Planned state separation, and Event/State UX/prototype structure.  
**Order:** after r4 and after PT-001 Stage C plus the later live time-travel experiment.  
**Limits:** no empirical effort validation; no final event-schema validation; no `VE-*` promotion; code-level example evolution remains deferred.

Confirmed R6 findings:
```text
R6-P-1 split Event/State UI weakens causality
R6-P-2 stable problem-space Feature identity can pre-commit reuse
R6-P-3 requirement correctness must not be an architecture variable
R6-P-4 Scenario must not be a generic requirement bag
R6-P-5 Feature must be independent of Widget/UI containment
R6-P-6 Required / Current / Planned are distinct
R6-P-7 generic key/value state hides architectural meaning
R6-P-8 implementation-specific behavior can leak into requirements
R6-P-9 BusinessRule reuse != Feature reuse
```

Open R6 questions / risks:
```text
R6-Q-1 ProductFunctionalRequirement -> Feature cardinality
R6-Q-2 direct BusinessRule use by Screen/Widget
R6-R-1 product-semantic ontology creep
R6-R-2 shared Feature hides context obligations
```

User clarifications:
```text
R6-U-1 identical requirements remain independent before grouping
R6-U-2 multiple Feature groupings may all be correct
R6-U-3 Screen / Widget / ProductFunctionalRequirement ownership
```

R6 is a review of r4. It is not represented as a review of r5.

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

## R6 semantic-foundation handling

R6 does **not** silently rewrite User Needs or Fundamental Requirements.

In particular:

- `FR-1` remains architecture-neutral problem semantics;
- `FR-2` remains Feature != Vertical Slice;
- R6 changes the **candidate interpretation** of where Feature identity is introduced.

Previous candidate interpretation:
```text
problem semantics -> stable Feature identity -> branch representation
```

R6 candidate interpretation:
```text
Requirement Surface
  -> branch Functional Decomposition / Feature Model
  -> branch Realization
```

Feature still means a unit of system functionality.  
What changes is that identical requirement units are no longer pre-deduplicated into a single cross-branch Feature before architecture planning.

This is handled through new/revised Proposals, not by pretending the underlying user need changed.

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

## CDC-10 — Requirement correctness is invariant across normal architecture branches
Do not create an architectural loser by assigning the same requirement incorrectly in one branch.

Controlled branches share the same correctly modeled Requirement Surface.

## CDC-11 — Requirement Surface does not pre-deduplicate Feature identity
Independent product-functional requirements retain independent identity even when their current behavior is identical.

Feature grouping is introduced by branch-specific functional/architecture planning.

## CDC-12 — Required / Current / Planned remain distinct
Prefer explicit separation of:
```text
RequiredProductSemantics
CurrentRealization
TeamPlan
```

A requirement event may change Required state before implementation changes Current state.

## CDC-13 — Feature is independent of UI containment
Screen and Widget may expose/use Features, but Feature identity is not contained by either.

API, event, schedule, external system and internal process triggers remain valid.

## CDC-14 — Replay shows snapshot + selected-event delta
In analysis/replay mode:
```text
state at cursor = all authoritative mutations through selected event
```

The UI should show the selected event's local delta at the affected state representation.

Future events may remain visible only when the mode is explicitly labeled replay/analysis.  
Play/no-hindsight mode hides unrevealed future events.

## CDC-15 — State projections may differ by semantic domain
The canonical state is not forced into one generic key/value visualization.

Scenario flow, Screen/Widget composition, Feature Model, code/module structure, runtime/data topology and ownership/plan may use different projections over the same underlying state.

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

## R6 confirmed findings

```text
R6-P-1  split Event/State UI weakens causal reading
R6-P-2  pre-canonical Feature identity can pre-commit reuse
R6-P-3  requirement-model correctness must not vary by architecture branch
R6-P-4  Scenario should not be a generic requirement bag
R6-P-5  Feature must not be contained by Widget/UI
R6-P-6  Required / Current / Planned must be distinct
R6-P-7  generic state cards hide domain-specific meaning
R6-P-8  implementation details can leak into requirement wording
R6-P-9  BusinessRule reuse must not imply Feature/code reuse
```

## R6 uncertainties / questions

```text
R6-Q-1  exact ProductFunctionalRequirement <-> Feature cardinality/coverage semantics
R6-Q-2  when direct Screen/Widget -> BusinessRule relation is legitimate
```

## R6 risks

```text
R6-R-1  product-semantic ontology creep
R6-R-2  shared Feature hides context-specific obligations
```

## Disputed / invalidated findings

No R6 finding is invalidated in this candidate.

Earlier `REV-P-7` remains invalidated as a current defect and preserved only as deferred capability.

No recommendation from R6 is treated as committed merely because it was suggested; remediation remains Proposal-level candidate work below.

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

## P-31@r5 — Synchronized Event/State Time-Travel Workbench

**REVISED_FROM P-31@r3**

Origin:
`R6-P-1`, `R6-P-7`, user validation of the time-travel interaction direction.

Primary interaction:

```text
EVENT HISTORY / CURSOR
        ↓ select event
replay authoritative mutations through selected event
        ↓
STATE CANVAS AT CURSOR
        +
SELECTED-EVENT DELTA inline at affected representations
```

Preferred desktop composition:

```text
left / main:  state canvas
right:        vertical event rail
secondary:    expandable inspectors / analytics
```

Rules:
- selected event controls the time cursor;
- snapshot includes all authoritative mutations up to and including the selected event;
- the selected event's own mutation/relation effect is shown locally where the affected state is rendered;
- unrelated state remains visible as context but visually quiet;
- ScenarioEvents and branch-generated responses remain distinguishable;
- Event Inspector remains available as secondary detail, not the only place to discover what changed;
- WorkEpisode / analytics remain secondary projections.

State Canvas may use domain-specific views rather than identical property cards:

```text
Product / Requirement Surface
Branch Feature Model
Code / Module Structure
Runtime / Data Topology
Ownership / Deployment / Plan
```

Mode distinction:

```text
Replay / Analysis:
  full history may be visible with past/current/future focus encoding

Play / No-hindsight:
  unrevealed future events are hidden
```

Vertical ordering is a navigation/display order and does not imply strict sequential runtime execution.

**REQUIRES:** P-19 + P-21 + P-22  
**RECOMMENDED_WITH:** P-23 + P-39 + P-40A + P-41

**Status:** preferred candidate

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

## P-35@r5 — Stable Semantics ↔ Branch Representation Mapping

**REVISED_FROM P-35@r3**

Origin:
`REV-U-1`, `MR-Q-5`, revised by `R6-P-2` and `R6-P-9`.

Stable cross-branch identity remains valid for semantic entities that are genuinely problem-level facts:

```text
BusinessRule
BusinessState
ExternalSystem
Scenario / Screen / Widget where product-defined
ProductFunctionalRequirement
...
```

Architecture branches then map those stable semantics to branch-local design/implementation representations.

```text
StableSemanticEntity
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

Important R6 correction:

```text
Feature identity is NOT assumed to be stable across branches.
```

ProductFunctionalRequirement -> Feature grouping is handled separately by P-40A.

Example:

```text
BusinessRule: CancellationPolicy
  -> Branch A representation: shared DomainPolicy
  -> Branch B representations: local rule copies
```

and independently:

```text
PFR-CustomerCancel ─┐
                    ├-> Branch A Feature: CancelBooking
PFR-AdminCancel ────┘

PFR-CustomerCancel -> Branch B Feature: CustomerCancelBooking
PFR-AdminCancel    -> Branch B Feature: AdminCancelBooking
```

The first mapping concerns semantic knowledge representation.  
The second concerns branch-specific functional decomposition.

**RECOMMENDED_WITH:** P-39 + P-40A

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

## P-38@r5 — Prototype Validation Track

**REVISED_FROM P-38@r4**

Origin:
user prototype-governance decision after `V3A-candidate-r3`, refined by R6.

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
execution/result
interpretation / limitations
main-plan impact
```

R6 refinement:
- do not indefinitely expand one prototype when a materially new semantic question appears;
- preserve the earlier prototype as evidence/baseline;
- create a new `PT-*` with explicit lineage and inherited assumptions;
- reusing a UI shell does not automatically transfer validation of its semantics.

Current prototype split:
```text
PT-001  Event / Entity / replay mechanics and event-state causal shell
PT-002  Requirement Surface -> branch Feature Model -> State Canvas
future PT  literal code/project-tree examples if later needed
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
prototype version / commit
what was observed
what was not established
which Proposal/QRP/CDC is affected
status change / composition change, if any
```

Prototype failures and inconclusive results remain preserved.

No `VE-*` is created merely because R6 changed the prototype direction.

**RECOMMENDED_WITH:** P-32

**Status:** preferred candidate governance proposal

---

## P-39@r5 — Requirement Surface Model

**NEW**

Origin:
`R6-P-3`, `R6-P-4`, `R6-P-5`, `R6-P-8`, `R6-U-1`, `R6-U-3`.

Purpose:
represent what the product must do without pre-committing Feature reuse or implementation structure.

Candidate entities:

```text
Scenario
ScenarioStep
Screen
Widget
ScreenRequirement
WidgetRequirement
ProductFunctionalRequirement
BusinessRule
BusinessState
ExternalSystem
```

Rules:

1. Scenario represents actor/goal/path/context, not a generic requirement bucket.
2. ScreenRequirement belongs to a Screen.
3. WidgetRequirement belongs to a Widget.
4. ProductFunctionalRequirement represents required application behavior in one independent context.
5. Two ProductFunctionalRequirements may remain separate even when their current text/behavior is identical.
6. ProductFunctionalRequirement identity does not imply Feature identity.
7. ProductFunctionalRequirement may exist without Screen/Widget/UI context and may carry a non-UI trigger such as time/schedule, external system, event or internal process.
8. Trigger/exposure type is requirement context, not Feature identity: a non-UI trigger does not imply that the requirement must become a separate Feature.
9. BusinessRule may be canonical/shared without forcing shared Feature or code.
10. Technology-specific realization terms stay out unless externally mandated.

Requirement behavior should prefer guarantees such as:
```text
durably recorded
visible to later reads
idempotent retry
eventually reflected in reporting
required external effect occurred
```

rather than:
```text
PostgreSQL row
Redis key
Repository.save()
Kafka topic
```

unless those are explicit constraints.

No generic `ScenarioRequirement` is selected in the preferred candidate.

**DERIVED_FROM:** P-1 + P-10  
**RECOMMENDED_WITH:** P-32 + P-35

**Status:** preferred candidate

---

## P-40A@r5 — Branch Functional Decomposition / Feature Model

**NEW — preferred alternative**

Origin:
`R6-P-2`, `R6-P-5`, `R6-P-9`, `R6-Q-1`, `R6-U-1`, `R6-U-2`.

A Feature remains a unit of system functionality, but its identity/boundary is selected inside a branch-specific functional/architecture design.

Core mapping:

```text
ProductFunctionalRequirement
        N:M
RequirementCoverage
        N:M
BranchFeature
```

This allows correct alternatives such as:

```text
A. several requirements -> one shared Feature
B. each requirement -> separate Feature
C. separate entry Features -> shared core
D. one parameterized/configurable Feature
E. one broader requirement -> several cooperating Features
```

Feature is independent of UI containment.

Possible requirement/entry triggers or exposure points:
```text
Widget
Screen lifecycle
API / ExternalSystem
Schedule / time
Event
InternalProcess
```

Trigger kind does **not** determine Feature boundary.

For the same non-UI ProductFunctionalRequirement, a branch may correctly choose, for example:
```text
A. separate Feature: ExpireBookingHold
B. existing Feature with another trigger/variation: ReleaseBookingHold(reason=expired)
C. broader Feature: MaintainBookingHoldLifecycle
```

The Requirement Surface states the required behavior and trigger/context. Branch Functional Decomposition decides whether that behavior is a new Feature, another entry into an existing Feature, or part of a broader Feature.

Fairness invariant:
every ProductFunctionalRequirement remains an independent coverage obligation.

A shared Feature cannot erase a context-specific requirement.

Separate Features are not penalized merely for being separate; consequences emerge through duplication, coupling, change locality, testing, coordination and later evolution.

**REQUIRES:** P-39  
**RECOMMENDED_WITH:** P-3 + P-35 + P-41  
**ALTERNATIVE_TO:** P-40B

**Status:** preferred candidate

---

## P-40B@r5 — Stable Cross-Branch Feature Identity

**NEW — explicit alternative preserving the earlier hypothesis**

Origin:
earlier prototype interpretation before R6.

Model:

```text
FeatureUse / context
        -> stable semantic Feature
        -> branch-specific FeatureRealization
```

Pros:
- simpler cross-branch comparison;
- fewer mapping objects;
- useful when Feature identity is genuinely domain-stable.

Cons:
- can pre-commit a reuse boundary;
- cannot represent some valid architecture choices where branches group identical requirement units differently.

**ALTERNATIVE_TO:** P-40A

**Status:** excluded from current preferred candidate, retained as a viable local alternative when Feature identity is genuinely given by the domain.

---

## P-41@r5 — Required / Design / Current / Plan State Layers

**NEW**

Origin:
`R6-P-6` and the requirement-vs-realization discussion.

Do not collapse requirement truth, chosen design, implemented state and future work.

Candidate layers:

```text
RequiredProductSemantics
  scenario-shared requirement surface after revealed requirement events

BranchFunctionalDesign
  branch-local Feature Model + accepted architecture decisions

CurrentRealization
  what is actually represented/implemented in code/data/runtime/deployment now

TeamPlan
  intended future work, migration, verification and unresolved planning
```

Typical evolution:

```text
RequirementEvent
  -> RequiredProductSemantics changes

Decision / Planning BranchEvent
  -> BranchFunctionalDesign and/or TeamPlan changes

Implementation / Migration BranchEvent
  -> CurrentRealization changes
  -> TeamPlan items may complete/change

Verification BranchEvent
  -> compares CurrentRealization against RequiredProductSemantics
```

A temporary gap:
```text
Required != Current
```
is valid and does not mean requirements were modeled incorrectly.

Likewise:
```text
TeamPlan != Current
```
is expected until work is completed.

**REQUIRES:** P-19 + P-21 + P-39  
**RECOMMENDED_WITH:** P-40A + P-31

**Status:** preferred candidate

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

Relations:

```text
P-20 REQUIRES P-19
P-21 REQUIRES P-19
P-22 REQUIRES P-21
P-23 REQUIRES P-19 + P-20 + P-21 + P-13 + P-36
P-31 REQUIRES P-19 + P-21 + P-22
P-31 RECOMMENDED_WITH P-23 + P-39 + P-40A + P-41
P-35 RECOMMENDED_WITH P-23 + P-39 + P-40A
```

P-31 no longer requires Dynamics Compare to exist before the basic synchronized event/state workbench can function.

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

---

## PG-8 — Requirement Surface / Functional Decomposition

Members:
```text
P-39
P-40A
P-41
P-35
P-31
```

Alternative retained outside the selected bundle:
```text
P-40B
```

Relations:
```text
P-39 DERIVED_FROM P-1 + P-10
P-40A REQUIRES P-39
P-40A ALTERNATIVE_TO P-40B
P-41 REQUIRES P-19 + P-21 + P-39
P-35 RECOMMENDED_WITH P-39 + P-40A
P-31 RECOMMENDED_WITH P-39 + P-40A + P-41
```

Selected bundle:
```text
P-39 + P-40A + P-41
```

P-40B is excluded from the selected candidate but remains historical/viable where Feature identity is truly domain-given.

No dependency cycle detected.

No mutually-exclusive Proposals remain inside the selected current candidate: P-40A and P-40B are explicit alternatives, and only P-40A is selected.

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

## QRP-P-34 — Event/state causality fragmented by detached views

**Type:** Problem  
**Source:** R6 `R6-P-1`, `R6-P-7`  
**Target:** P-31@r3  
**Evidence:** the stage-style / detached-inspector UI required mental reconstruction of accumulated state versus selected-event effect.  
**Violated:** N-6, N-9, N-10.  
**Mechanism:** selected time, accumulated state and local delta are separated spatially/semantically.  
**Consequence:** causal evolution is harder to read than the underlying event model requires.  
**Status history:**
- introduced: R6 / V3A-r4
- candidate mitigation: P-31@r5 + CDC-14/15
- current: `candidate-mitigated; open until prototype validation`

---

## QRP-P-35 — Stable Feature identity pre-commits reuse boundary

**Type:** Problem  
**Source:** R6 `R6-P-2`, `R6-U-1`, `R6-U-2`  
**Target:** prior candidate interpretation of P-1/P-10/P-35  
**Violated:** FR-1, N-2, N-5.  
**Mechanism:** identical functional requirements are deduplicated into one Feature before branch architecture planning.  
**Consequence:** some correct reuse/separation alternatives become impossible to express fairly.  
**Status history:**
- introduced: R6 / V3A-r4
- candidate mitigation: P-39 + P-40A + P-35@r5
- earlier stable-Feature hypothesis preserved as P-40B
- current: `candidate-mitigated; open until PT-002`

---

## QRP-P-36 — Requirement/design/current/plan state collapsed

**Type:** Problem  
**Source:** R6 `R6-P-6`  
**Target:** composition state semantics  
**Violated:** N-1, N-3, N-4, FR-5, FR-8, FR-9.  
**Mechanism:** required behavior, accepted design, implemented state and intended work are represented as if they were one state.  
**Consequence:** cannot explain planning, lag, migration, replanning or verification cleanly.  
**Status:** candidate mitigation P-41; open until prototype validation.

---

## QRP-Q-37 — ProductFunctionalRequirement ↔ Feature coverage cardinality

**Type:** Question  
**Source:** R6 `R6-Q-1`  
**Target:** P-40A / PG-8  
**Question:** is N:M RequirementCoverage sufficient without introducing ambiguous ownership or double counting?  
**Why important:** Feature grouping is now branch-specific and must remain comparable across branches.  
**Blocking:** yes, before product-to-feature mapping schema freeze.  
**Current candidate answer:** explicit N:M `RequirementCoverage` with each ProductFunctionalRequirement remaining independently satisfiable.  
**Status:** open; PT-002 target.

---

## QRP-R-38 — Shared Feature may hide context-specific obligations

**Type:** Risk  
**Source:** R6 `R6-R-2`  
**Target:** P-40A  
**Condition:** multiple ProductFunctionalRequirements map to one Feature.  
**Possible consequence:** one context's requirement is silently lost behind a common abstraction.  
**Materiality:** high for fairness/correctness.  
**Mitigation:** coverage is requirement-unit based; shared Feature does not merge requirement identity.  
**Status:** candidate-mitigated; validate in PT-002.

---

## QRP-Q-39 — Direct Screen/Widget ↔ BusinessRule relation

**Type:** Question  
**Source:** R6 `R6-Q-2`  
**Target:** P-39  
**Question:** when should a Screen/Widget relate directly to BusinessRule instead of inheriting relevance through ProductFunctionalRequirement/Feature?  
**Why important:** duplicate relations can make the semantic graph inconsistent.  
**Blocking:** non-blocking.  
**Current candidate answer:** direct relation only when the rule genuinely constrains presentation/availability semantics.  
**Status:** open, fixture-driven.

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

## QRP-GR-5 — Requirement/feature ontology growth

**Type:** Risk  
**Target:** PG-8  
**Source:** R6 `R6-R-1`  
**Condition:** each prototype-specific distinction becomes a permanent first-class entity.  
**Consequence:** the simulator becomes a universal product-modeling tool before the architecture causal model is validated.  
**Mitigation:** P-39 includes only Scenario/Screen/Widget/PFR/Rule/State concepts needed by concrete cases; extensions remain fixture-driven.  
**Status:** open risk.

## QRP-GQ-6 — State-layer mutation ownership

**Type:** Question  
**Target:** PG-8 / P-41  
**Source:** R6 `R6-P-6`  
**Question:** which event roles may authoritatively mutate RequiredProductSemantics, BranchFunctionalDesign, CurrentRealization and TeamPlan?  
**Why important:** replay correctness depends on preventing planning events from pretending implementation already happened.  
**Blocking:** before P-41 schema freeze.  
**Candidate answer:** requirement events mutate Required; decision/planning events mutate Design/Plan; implementation/migration mutate Current; verification relates/evaluates unless it also creates explicit state.  
**Status:** open; PT-002 target.

## QRP-GR-7 — Projection drift across State Canvas views

**Type:** Risk  
**Target:** P-31 + PG-8  
**Source:** R6 `R6-P-7`  
**Condition:** Product, Feature Model, code tree and runtime topology each keep their own manually-authored truth.  
**Consequence:** views disagree after replay.  
**Mitigation:** all projections derive from one canonical state/event log; no view owns duplicate history.  
**Status:** candidate-mitigated.

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

## QRP-CP-7 — Requirement decomposition leaked into problem truth

**Type:** Problem  
**Target:** whole composition  
**Source:** R6 `R6-P-2`, `R6-P-3`, `R6-U-1`, `R6-U-2`  
**What was wrong:** candidate semantics could treat one Feature identity as canonical before architecture branches choose reuse/decomposition.  
**Evidence/basis:** two identical independent requirements may correctly map to one Feature in one branch and two Features in another.  
**Violated:** FR-1, N-2, N-5.  
**Mechanism:** deduplication of requirements becomes an implicit architecture decision hidden in the input model.  
**Consequence:** branch comparison is biased and some valid alternatives are unrepresentable.  
**Status history:**
- introduced: R6 / V3A-r4
- candidate mitigation: CDC-10/11 + P-39 + P-40A + P-35@r5
- current: `candidate-mitigated; open until PT-002`

## QRP-CR-8 — Product-semantic ontology creep

**Type:** Risk  
**Target:** whole composition  
**Source:** R6 `R6-R-1`  
**Condition:** Screens/Widgets/PFRs/rules are generalized beyond demonstrated simulator needs.  
**Possible consequence:** architecture evolution becomes secondary to maintaining a universal requirements ontology.  
**Mitigation:** PG-8 remains prototype-driven and minimal; code/project details are projections, not new problem entities by default.  
**Status:** open.

## QRP-CR-9 — Prototype validation inheritance

**Type:** Risk  
**Target:** P-38 / composition governance  
**Source:** R6 process improvement.  
**Condition:** PT-002 reuses PT-001 UI shell and its semantics are treated as already validated.  
**Consequence:** untested Requirement Surface/Feature Model assumptions enter the plan through implementation reuse.  
**Mitigation:** each PT states inherited mechanics vs newly tested semantics; only explicit VE results transfer.  
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

R6 / V3A-candidate-r4
  confirmed:
    R6-P-1..R6-P-9
  questions:
    R6-Q-1..R6-Q-2
  risks:
    R6-R-1..R6-R-2
  user semantic clarifications:
    R6-U-1..R6-U-3

V3A-candidate-r5
  revised:
    P-31@r5
    P-35@r5
    P-38@r5
  added:
    CDC-10..CDC-15
    P-39
    P-40A
    P-40B alternative
    P-41
    PG-8
    QRP-P-34..QRP-Q-39
    QRP-GR-5..QRP-GR-7
    QRP-CP-7
    QRP-CR-8..QRP-CR-9
  no Need or FR was silently rewritten
  no VE-* promoted
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

Unchanged from r4:

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
P-37@r3
N-1..N-13@r3
FR-1..FR-25
CDC-1..CDC-9
```

## Revised

```text
P-31@r5  REVISED_FROM P-31@r3
P-35@r5  REVISED_FROM P-35@r3
P-38@r5  REVISED_FROM P-38@r4
```

No User Need or Fundamental Requirement is revised by R6.

## New preferred Proposals / constraints

```text
CDC-10 requirement correctness invariant across branches
CDC-11 no pre-deduplicated Feature identity in Requirement Surface
CDC-12 Required / Current / Planned separation
CDC-13 Feature independent of UI containment
CDC-14 replay snapshot + selected-event delta
CDC-15 domain-specific State Canvas projections

P-39 Requirement Surface Model
P-40A Branch Functional Decomposition / Feature Model
P-41 Required / Design / Current / Plan State Layers
PG-8 Requirement Surface / Functional Decomposition
```

## New explicit alternative

```text
P-40B Stable Cross-Branch Feature Identity
```

Relation:
```text
P-40A ALTERNATIVE_TO P-40B
```

P-40A is selected in the current candidate.  
P-40B is not deleted or declared universally wrong; it is excluded because it cannot express all branch-specific grouping choices R6 requires.

## Superseded candidate forms

```text
P-31@r5 SUPERSEDES P-31@r3
P-35@r5 SUPERSEDES P-35@r3
P-38@r5 SUPERSEDES P-38@r4
```

Supersede is candidate-lineage only. V2 committed decisions remain untouched.

## Removed from current preferred candidate

No historical object is deleted.

Removed as active assumptions:
```text
Feature identity must be stable across compared branches
Scenario may act as a generic requirement bucket
Screen -> Widget -> Feature as mandatory containment
one generic key/value State presentation
detached inspector as primary source of selected-event delta
```

Earlier removals from r4 remain historical:
```text
single mixed event_class
StateImpact as the only event/entity relation
WorkEpisode-specific wording inside User Need
non-computable "actually inspected" behavioral proxies in MVP
```

## Rejected

None.

## Historical / excluded alternatives retained

```text
P-9A vector/Pareto-only evaluation
P-7B ephemeral ChangeSet
P-40B stable cross-branch Feature identity
```

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

## Feature identity / functional decomposition

Preferred:
```text
P-40A
Requirement Surface keeps independent ProductFunctionalRequirements.
Each branch chooses its Feature grouping/boundaries.
```

Alternative:
```text
P-40B
Feature identity is stable across branches; only FeatureRealization differs.
```

P-40B remains viable only when Feature identity is genuinely given rather than inferred from coincident requirements.

The current candidate selects P-40A because it can represent both reuse and deliberate separation without changing requirement truth.

No second full composition is needed yet because this is a localized alternative inside PG-8.

## Event/state presentation

Preferred:
```text
P-31@r5 synchronized time-travel workbench
```

Superseded local formulation:
```text
P-31@r3 detached Event Stream / Entity Explorer / Inspector as primary surfaces
```

The old views may survive as secondary inspectors, but not as the primary causal interaction.

---

# 18. Need / FR Coverage Re-check

| Need | Candidate coverage |
|---|---|
| N-1 explain decisions | P-5, P-6, P-23, P-24, P-41 |
| N-2 fair comparison | P-1, P-9B, P-17, P-33, CDC-10/11, P-39, P-40A |
| N-3 evolution | P-14, P-19, P-39, P-41 |
| N-4 future preparation | P-5, P-41 |
| N-5 independent choices | P-3, P-20, P-40A |
| N-6 concrete consequences | P-7A, P-21, P-31@r5, P-35@r5, P-33 |
| N-7 branch/replay | P-13, P-19, P-31@r5, P-36 |
| N-8 practical scope | P-11, CDC-4/6/7, QRP-GR-5 mitigation |
| N-9 event history | P-19, P-31@r5 |
| N-10 event/entity exploration | P-21, P-22, P-31@r5 |
| N-11 event dynamics | P-23, P-36, P-40A |
| N-12 work quality | P-25..P-30 |
| N-13 work-dynamics explanation | P-24, P-31@r5, P-41 |

All active Needs retain coverage.

## R6-sensitive FR re-check

| FR | R6-candidate handling |
|---|---|
| FR-1 architecture-neutral problem semantics | P-39 keeps Requirement Surface independent; P-40A moves Feature grouping into branch design |
| FR-2 Feature != Vertical Slice | unchanged; P-40A still defines Feature as functionality, not code organization |
| FR-3 scoped decisions | branch Feature grouping/parameterization may be local |
| FR-4 orthogonal architecture state | P-40A does not package unrelated architecture axes |
| FR-5 observed/required/forecast separation | P-41 adds Required/Design/Current/Plan separation without collapsing forecast |
| FR-8 temporal integrity | P-41 keeps requirement reveal, decision, plan and implementation as distinct event/state transitions |
| FR-9 preparation before occurrence | TeamPlan/BranchFunctionalDesign may change before later requirement occurrence when information is known |
| FR-12 fair controlled comparison | CDC-10/11 + P-39 keep the same Requirement Surface across branches |
| FR-13 KEEP valid | no change; KEEP may preserve existing Feature grouping/realization |
| FR-15 raw impact inspectable | P-31 shows state/delta; raw evidence remains available |
| FR-18 scenario vs branch events | unchanged; requirement anchors remain scenario-scoped, functional decomposition responses branch-scoped |
| FR-19 relation vs mutation | unchanged; state-canvas projections consume the same canonical relations/mutations |
| FR-20 state/entity history | strengthened by P-31@r5 and P-41 |
| FR-23 work dynamics depend on context | P-40A/P-41 add functional decomposition and plan context |
| FR-25 scalarized effort transparent | unchanged |

No FR meaning is silently changed.

No hard FR conflict is detected in the selected candidate.

The new blocking questions concern schema/prototype validation, not uncovered committed FRs.

No User Need depends on `WorkEpisode` or on one fixed Feature-grouping strategy as the only implementation.

---

# 19. Composition Delta from V3A-candidate-r4

## UNCHANGED

- committed baseline remains V2;
- all User Needs N-1..N-13 are retained;
- all Fundamental Requirements FR-1..FR-25 are retained;
- event envelope / relation-vs-mutation / scenario-vs-branch event semantics remain;
- P-9B cost direction remains selected inside the candidate;
- Work Dynamics and transparent cost semantics remain;
- KEEP remains valid;
- prototype governance remains separate from canonical plan content.

## REVISED

### P-31 — Event/state visualization

Previous:
detached Event Stream / Entity Explorer / Event Inspector were the primary surfaces.

Proposed:
`P-31@r5` synchronized Event/State time-travel workbench:
- event rail controls time;
- accumulated state shown at cursor;
- selected-event delta shown inline where state changed;
- detached inspectors become secondary.

Source:
R6-P-1, R6-P-7.

### P-35 — semantic identity mapping

Previous:
stable SemanticEntity -> branch representations, with Feature implicitly eligible to be one stable semantic identity.

Proposed:
`P-35@r5` keeps stable identity for genuine problem-level semantics, but excludes Feature identity from the cross-branch invariant by default.

Source:
R6-P-2, R6-P-9.

### P-38 — prototype lifecycle

Previous:
one PT artifact could keep accumulating new prototype questions.

Proposed:
`P-38@r5` preserves PT lineage and creates a new PT when a materially new semantic question appears.

Source:
R6 process review.

## ADDED

```text
CDC-10..CDC-15
P-39 Requirement Surface Model
P-40A Branch Functional Decomposition / Feature Model
P-40B Stable Cross-Branch Feature Identity (explicit alternative)
P-41 Required / Design / Current / Plan State Layers
PG-8 Requirement Surface / Functional Decomposition

QRP-P-34
QRP-P-35
QRP-P-36
QRP-Q-37
QRP-R-38
QRP-Q-39
QRP-GR-5
QRP-GQ-6
QRP-GR-7
QRP-CP-7
QRP-CR-8
QRP-CR-9
```

## REMOVED FROM CURRENT PREFERRED CANDIDATE

```text
stable Feature identity as a mandatory cross-branch assumption
Scenario as a generic requirement bucket
Screen -> Widget -> Feature as mandatory containment
one generic key/value State Canvas projection
detached inspector as primary explanation of selected-event effect
```

These are removed from the active candidate, not deleted from history.

## SUPERSEDED

```text
P-31@r5 SUPERSEDES P-31@r3
P-35@r5 SUPERSEDES P-35@r3
P-38@r5 SUPERSEDES P-38@r4
```

Candidate lineage only; V2 remains committed.

## ALTERNATIVE / EXCLUDED CONFLICT

```text
P-40A ALTERNATIVE_TO P-40B
```

Selected:
`P-40A`.

Excluded from current preferred bundle:
`P-40B`.

Reason:
P-40B cannot express all correct branch-specific feature grouping choices identified by R6, though it remains valid where Feature identity is genuinely given.

## REOPENED

`Q-5` cross-branch mapping is effectively broadened:
it now includes not only stable semantic representation mapping but also the new requirement-unit -> branch Feature mapping problem.

Its original question is preserved; a new explicit blocker `QRP-Q-37` handles the new cardinality semantics.

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
reopened/broadened by R6.

Earlier answer:
stable SemanticEntity + branch-local representations + N:M mapping.

R6 adds a distinct mapping problem:
```text
ProductFunctionalRequirement <-> BranchFeature
```

Preferred candidate:
`P-35@r5 + P-40A`.

Blocking:
before generalized Product/Feature/State Compare is frozen.

---

## Q-6 — Wall-clock concurrency model

Status:
deferred.

Current Proposal:
point events + timestamps + causal edges.

Intervals/critical-path model only when needed.

Not blocking Event/State MVP.

---

## Q-7 — RequirementCoverage cardinality and semantics

Status:
open / blocking.

Target:
`P-40A`, `QRP-Q-37`.

Question:
is explicit N:M RequirementCoverage sufficient for:
- several requirements -> one Feature;
- one requirement -> several Features;
- shared core + specialized entry Features;
without ambiguous ownership or duplicated requirement satisfaction?

Prototype:
PT-002.

---

## Q-8 — State-layer mutation ownership

Status:
open / blocking before P-41 schema freeze.

Target:
`P-41`, `QRP-GQ-6`.

Candidate rule:
- requirement events mutate RequiredProductSemantics;
- decision/planning events mutate BranchFunctionalDesign / TeamPlan;
- implementation/migration mutate CurrentRealization;
- verification primarily evaluates/relates.

Prototype:
PT-002.

---

## Q-9 — State Canvas projection set

Status:
open, non-blocking for semantics.

Candidate projections:
```text
Scenario / user-system flow
Screen / Widget composition
Requirement Surface / Rules
Branch Feature Model
Code / Module Structure
Runtime / Data Topology
Ownership / Deployment / TeamPlan
```

Need to validate which should be primary, secondary or collapsible.

Prototype:
PT-002.

---

# 21. Candidate Version Label

`V3A-candidate-r5`

Meaning:

```text
V2 committed baseline
+ R2/R3 corrections
+ user-selected P-9B
+ Event Dynamics / Work Dynamics
+ R4 independent review
+ R5 meta-review corrections
+ semantic-foundation / prototype governance
+ R6 requirement-surface and state-canvas review
+ branch-specific functional decomposition candidate
+ synchronized Event/State replay workbench
+ PT-001 / PT-002 prototype split
```

---

# 22. Transaction Status

```text
SOURCE COMMITTED:
V2

INPUT CANDIDATE:
V3A-candidate-r4

REVIEW APPLIED:
R6 -> V3A-candidate-r4

OPEN CANDIDATE:
V3A-candidate-r5

COMMIT:
NOT PERFORMED
```

Candidate is not ready for schema/semantic freeze because:

1. `Q-3` event granularity remains open;
2. `Q-5` mapping semantics are broadened and need validation;
3. `Q-7 / QRP-Q-37` RequirementCoverage semantics are blocking;
4. `Q-8 / QRP-GQ-6` state-layer mutation ownership is blocking;
5. PT-002 has not validated Requirement Surface -> Feature Model -> State Canvas;
6. PT-001 has not been formally closed/interpreted into VE evidence.

No committed Need or FR is uncovered by this candidate.

No commit is implied by the apparent quality of the time-travel UX.

---

# 23. Current Preferred Simulation Semantics

## 23.1 Layered state model

```text
Scenario-shared:
  RequiredProductSemantics
    - Scenarios / ScenarioSteps
    - Screens / Widgets
    - ScreenRequirements
    - WidgetRequirements
    - ProductFunctionalRequirements
    - BusinessRules
    - BusinessState semantics
    - ExternalSystem semantics

Branch-local:
  BranchFunctionalDesign
    - RequirementCoverage
    - BranchFeatures
    - feature grouping / specialization / parameterization

  CurrentRealization
    - code/module representations
    - data/runtime topology
    - deployment/ownership representations

  TeamPlan
    - intended work
    - migration / rollout / verification
    - unresolved planning
```

Required, Design, Current and Plan are related but not interchangeable.

---

## 23.2 Event/state core

```text
Initial Layered State
+
ScenarioEvents
+
BranchEvents with authoritative mutations
=
Branch Simulation State at cursor
```

`relations[]` explain association.

`mutations[]` reconstruct authoritative state.

Selected-event delta is derived directly from the selected event's relations/mutations.

---

## 23.3 Shared external anchor

```text
ScenarioEvent REQUIREMENT
        │
        ├──── Branch A planning / design / implementation response
        │
        └──── Branch B planning / design / implementation response
```

The requirement event is not duplicated merely to attach a branch.

Its Requirement Surface mutation is shared in controlled comparison.

---

## 23.4 Requirement Surface -> Feature Model

```text
ProductFunctionalRequirement PFR-A ─┐
                                    ├-> Branch A Feature F-1
ProductFunctionalRequirement PFR-B ─┘

ProductFunctionalRequirement PFR-A -> Branch B Feature F-A
ProductFunctionalRequirement PFR-B -> Branch B Feature F-B
```

Both branches may be correct.

The simulator evaluates structural/work consequences rather than rewarding reuse itself.

A shared BusinessRule may be referenced by both requirements without forcing shared Feature identity.

---

## 23.5 State Canvas / replay interaction

```text
EVENT HISTORY
  select E-n
      ↓
replay through E-n
      ↓
STATE CANVAS AT T-n
  accumulated snapshot
  + selected-event delta inline
```

Preferred projections:
- Product / Requirement Surface;
- Branch Feature Model;
- Code / Module Structure;
- Runtime / Data;
- Ownership / Deployment / Plan.

Replay mode may show future history with explicit future encoding.

Play/no-hindsight mode hides unrevealed future events.

---

## 23.6 Work dynamics

A goal/change may still be grouped as:

```text
WorkEpisode
  -> event refs
  -> operation refs
```

It references canonical events and does not own a second history.

Comparison lenses remain:
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

MVP proxies must remain structurally computable.

---

## 23.7 Scalar cost

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

# 24. MVP Staging — r5 Candidate

## Phase 0 — Replay shell validation

Prototype:
`PT-001`.

Validate/preserve:
- ScenarioEvent / BranchEvent identity;
- relation vs mutation;
- event granularity;
- event-controlled time cursor;
- accumulated state + selected-event delta;
- branch replay mechanics.

PT-001 should be closed/interpreted without silently absorbing the new Requirement Surface experiment.

## Phase 1 — Requirement Surface / State Canvas

Prototype:
`PT-002`.

Validate:
- Scenario / Screen / Widget composition;
- ScreenRequirement / WidgetRequirement / ProductFunctionalRequirement separation;
- identical independent requirements;
- BusinessRule reuse independent of Feature reuse;
- RequirementCoverage N:M;
- branch-specific Feature Model;
- Required / Design / Current / Plan state layers;
- domain-specific state projections.

## Phase 2 — Architecture realization projections

After PT-002 semantics are stable:
- code/module tree projection;
- dependency/authoritative-knowledge view;
- runtime/data topology;
- ownership/deployment view;
- mapping from Feature Model to realization.

Literal code snippets/diffs remain optional future prototype evidence, not required now.

## Phase 3 — Controlled Dynamics Compare + cost

- shared scenario anchors;
- divergent branch response streams;
- ImplementationChangeSet;
- P-33 Cost Ledger;
- P-9B scalar effort + raw evidence.

## Phase 4 — Work Dynamics

- WorkEpisode grouping;
- structural Reasoning Surface;
- structural Planning Surface;
- Reversibility;
- Experimentability;
- Feedback distance/time;
- Plan Flexibility;
- Team Autonomy.

## Phase 5 — Future extensions

- adaptive_product_evolution;
- intervals / critical path / wait-time model;
- incidents/recovery;
- calibrated empirical effort;
- runtime performance models;
- Monte Carlo.

---

# 25. Preferred Next Step

Do **not** fold all new requirement/Feature semantics into PT-001.

Preserve PT-001 as the prototype lineage for the event/replay shell.

Create:

```text
prototypes/PT-002_requirement_surface_feature_model_state_canvas.md
```

PT-002 should reuse the working time-travel interaction pattern where useful, but treat that shell as inherited mechanics rather than proof of the new semantics.

PT-002 must specifically compare at least:

```text
same Requirement Surface
  Branch A: shared Feature
  Branch B: separate Features
```

with later events that create:
- a period where duplication is cheaper/simpler;
- a later divergence where separation may become advantageous;
- or the reverse, depending on fixture facts.

No architecture label receives a bonus.

PT-002 should also include:
- a Scenario crossing Screens;
- a reusable Widget used on more than one Screen;
- a ProductFunctionalRequirement with a non-UI trigger, with Feature boundary chosen by branch-specific decomposition rather than by trigger type;
- two identical ProductFunctionalRequirements;
- one shared BusinessRule referenced without forcing Feature reuse;
- Required != Current during planned work;
- at least one planning event that changes TeamPlan without mutating CurrentRealization.

Literal code/project-tree examples are deferred until the semantic projections are understandable without them.

When PT-001 or PT-002 is completed and interpreted, create separate `VE-*` records.

---

# 26. Validation Evidence Register

No `VE-*` is promoted by r5.

Reason:
R6 is a review and candidate-composition revision, not a completed prototype interpretation.

Current prototype evidence state:

```text
PT-001:
  implementation/provisional interaction evidence exists
  formal interpretation / VE promotion still pending

PT-002:
  planned by r5
  not yet executed
```

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

This register stores only evidence needed to evolve the Proposal Composition, not mockup details by themselves.