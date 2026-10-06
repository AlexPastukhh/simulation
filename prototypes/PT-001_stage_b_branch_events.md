# PT-001 Stage B — Branch Events and Operations

## Status

```text
completed for data preparation
```

Stage B creates the branch-scoped event/operation dataset consumed by later UI stages.

Canonical plan is **not** changed by this artifact.

## Artifacts

```text
PT-001/data/stage_b.json
PT-001/data/stage_b_validation_report.md
PT-001/tools/enrich_stage_b.py
PT-001/tools/validate_stage_b.py
```

## Input

```text
PT-001_stage_a_fixture.md
```

## Branch inheritance

Branch history is inherited rather than duplicated:

```text
BR-ROOT
   |
   +-- BR-C-K
   |     +-- BR-KK
   |     +-- BR-KP
   |
   +-- BR-C-P
         +-- BR-PK
         +-- BR-PP
```

Events scoped to `BR-C-K` are inherited by `BR-KK` and `BR-KP`.
Events scoped to `BR-C-P` are inherited by `BR-PK` and `BR-PP`.

This preserves one canonical branch event instead of copying the same pre-fork history into every leaf.

## Event record used in Stage B

Representative shape:

```text
BranchEvent
- id
- branchScope
- triggeredBy[]
- sequenceWithinTrigger
- provenance
- role
- category
- title
- relations[]
- mutations[]
- operations[]
```

### Relation rule

`relations[]` describe association/inspection/dependency.

They do not mutate state.

Example:

```text
BE-R-01
title: Inspect current cancellation implementation
relations:
  SEM-2 -> inspects
mutations: []
```

### Mutation rule

`mutations[]` are authoritative branch-architecture state transitions.

Example:

```text
BE-CP-03
title: Create authoritative CancellationPolicy and move rule
mutations:
  create CANCELLATION_POLICY
  modify CANCEL_HANDLER
  modify CHANGE_DATES_HANDLER
```

### Operation rule

`operations[]` are expandable implementation detail.

They are not top-level Event Stream items by default.

Example:

```text
BE-CP-03
  OP-CP-01 create_rule_component
  OP-CP-02 move_rule_implementation
  OP-CP-03 wire_consumer
  OP-CP-04 wire_consumer
  OP-CP-05 add_test_obligation
```

## Concrete architecture dynamics

### Cancellation fork

After `SEVT-02`:

#### KEEP local — BR-C-K

```text
BE-CK-01 decision: KEEP local rule placement
BE-CK-02 analysis: inspect both paths
BE-CK-03 implementation: add rule to ChangeBookingDatesHandler
```

After `SEVT-03`:

```text
BE-CK-04 create AdminCancelHandler with another local rule copy
```

After repeated rule change `SEVT-08`:

```text
BE-CK-05 updates:
  CancelBookingHandler
  ChangeBookingDatesHandler
  AdminCancelHandler
```

#### Centralize — BR-C-P

After `SEVT-02`:

```text
BE-CP-01 decision: centralize CancellationPolicy
BE-CP-02 analysis: analyze rule boundary
BE-CP-03 migration: create policy and rewire two consumers
```

After `SEVT-03`:

```text
BE-CP-04 create AdminCancelHandler consuming policy
```

After repeated rule change `SEVT-08`:

```text
BE-CP-05 changes only authoritative CancellationPolicy
```

This creates the intended 1:N representation comparison without assigning an architecture-label bonus.

## Payment fork

At `SEVT-04` the system knows only a medium-confidence forecast.

### KEEP direct

Branches:

```text
BR-KK
BR-PK
```

The decision creates no implementation mutation.

When `SEVT-05` later commits the second-provider requirement, the branch creates the port/adapters reactively.

### Introduce PaymentPort proactively

Branches:

```text
BR-KP
BR-PP
```

At `SEVT-04` these branches pay migration work before the future requirement is known to occur.

At `SEVT-05` they only add `AdyenAdapter` and provider configuration.

Important:

with the current fixture, proactive PaymentPort is **not forced to have paid back after one later provider requirement**.

That is intentional. The prototype must not rig a crossover.

## WorkEpisode representation

Stage B adds 11 `WorkEpisode` records.

They only reference canonical event IDs:

```text
WorkEpisode
- id
- branchScope
- trigger
- eventRefs[]
```

No copied event payload is stored in a WorkEpisode.

## Representation mappings

Stage B adds explicit semantic-to-branch mappings.

Example local branch:

```text
SEM-2 CancellationPolicy
  -> CANCEL_HANDLER local_copy
  -> CHANGE_DATES_HANDLER local_copy
  -> ADMIN_CANCEL_HANDLER local_copy
```

Example centralized branch:

```text
SEM-2 CancellationPolicy
  -> CANCELLATION_POLICY authoritative

consumer relations:
  CANCEL_HANDLER
  CHANGE_DATES_HANDLER
  ADMIN_CANCEL_HANDLER
```

## Automatic validation

Validator:

```text
PT-001/tools/validate_stage_b.py
```

Checks:

- ScenarioEvent IDs unique;
- BranchEvent IDs unique;
- ImplementationOperation IDs unique;
- branch parent references valid and acyclic;
- every BranchEvent trigger references a ScenarioEvent;
- every state-change event has a mutation;
- analysis/coordination/test events do not mutate state;
- decision events do not directly mutate architecture state;
- representation mappings reference valid semantic entities;
- WorkEpisode event refs exist and belong to the episode branch ancestry.

## Validation result

```text
PASS
errors: 0
warnings: 0
ScenarioEvents: 8
BranchEvents: 33
ImplementationOperations: 53
WorkEpisodes: 11
RepresentationMappings: 20
```

### Leaf diagnostics

| Branch | inherited events | operations | mutating events | relation-only events |
|---|---:|---:|---:|---:|
| BR-KK | 13 | 18 | 6 | 7 |
| BR-KP | 13 | 20 | 7 | 6 |
| BR-PK | 13 | 19 | 6 | 7 |
| BR-PP | 13 | 21 | 7 | 6 |

These numbers are diagnostics only.

Especially:

```text
same event count != same implementation work
```

Event count is not promoted as a cost metric.

## Provisional evidence by test question

### TQ-1 Event granularity

`mixed / pending UI validation`

Stage B demonstrates that operations can stay nested under BranchEvents.
It does not yet prove that the resulting visual stream is readable.

### TQ-2 Shared scenario anchor

`supported at data-model level`

One `SEVT-*` identity is reused by all branches; branch responses have separate IDs.

### TQ-3 Relation vs mutation

`supported at data-model level`

Analysis/coordination events exist with relations and zero mutations.

### TQ-4 Semantic entity vs branch representation

`supported at data-model level`

`SEM-2` maps to three local copies in BR-C-K and one authoritative policy in BR-C-P.

### TQ-5 Entity history

`pending Stage C`

Data exists, but the history projection has not been rendered.

### TQ-6 Dynamics comparison

`pending Stage C`

Branch streams differ, but comparison usability is not validated yet.

### TQ-7 WorkEpisode

`supported structurally / pending UI usefulness`

WorkEpisodes reference canonical events without copying them.

### TQ-8 Raw evidence vs scalar cost

`pending later Stage C/D`

Stage B intentionally has no scalar cost model yet.

## Interpretation boundary

Stage B validates dataset consistency, not user comprehension.

No `VE-*` should be promoted into the canonical plan yet.

Next:

```text
Stage C — build the first low-fidelity React/Vite UI directly from stage_b.json.
```
