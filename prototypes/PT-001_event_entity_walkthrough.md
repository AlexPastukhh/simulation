# PT-001 — Event / Entity Walkthrough

## Status

```text
planned
```

No result has been promoted into the canonical plan yet.

## Canonical plan under test

```text
architecture_simulator_proposal_composition_v3a_candidate_r4.md
```

## Purpose

Test whether the current event/entity model is understandable and internally coherent when applied to a concrete architecture-evolution walkthrough.

This prototype must not prove a preferred architecture in advance.

## Targets

```text
P-19 Canonical SimulationEvent envelope
P-20 Orthogonal event taxonomy
P-21 EventEntityRelation + StateMutation
P-22 Entity/State Explorer
P-23 Controlled Event Dynamics Compare
P-24 WorkEpisode
P-31 Event-centric visualization
P-35 Semantic Entity <-> Branch Representation Mapping
P-36 ScenarioEvent / BranchEvent identity
P-38 Prototype Validation Track

CDC-1 Orthogonal event dimensions
CDC-2 One canonical event envelope
CDC-3 Mutation separate from derived impact
CDC-5 Three-level granularity
CDC-6 Point-event MVP temporal model

Q-3 / QRP-GQ-2 Event granularity
Q-5 / QRP-Q-19 Cross-branch representation identity
```

## Test questions

### TQ-1 — Event granularity

Can the prototype distinguish `SimulationEvent`, optional Activity/Subevent, and `ImplementationOperation` without either losing causality or flooding the main stream?

### TQ-2 — Shared scenario anchor

Can one external requirement remain one stable ScenarioEvent while architecture branches generate different BranchEvents?

### TQ-3 — Relation vs mutation

Can analysis/testing/inspection relate to an entity without fabricating a StateMutation?

### TQ-4 — Semantic entity vs branch representation

Can one semantic concept remain stable while branches represent it differently, including at least one 1:N mapping?

### TQ-5 — Entity history

Can a user understand semantic history, mutation history, related activity history and representation history separately?

### TQ-6 — Dynamics comparison

Can the same scenario-level requirement stream produce visibly different branch-generated work streams without pre-declaring a winner?

### TQ-7 — WorkEpisode

Does WorkEpisode improve explanation while only referencing canonical events/operations?

### TQ-8 — Raw evidence vs scalar cost

Can raw operations, Work Dynamics lenses and scalar effort coexist without the scalar score hiding or double-counting evidence?

## Fixture

### Product

```text
B2B Booking SaaS
```

### Initial organization

```text
1 team
4 developers
1 deployable
PostgreSQL
low traffic
```

### Initial architecture

```text
layered monolith
transaction-script leaning
direct Stripe integration
single deployable
shared PostgreSQL
```

These are prototype fixture assumptions only.

### Candidate semantic entities

```text
SEM-1 Booking
SEM-2 CancellationPolicy
SEM-3 PaymentProviderIntegration
SEM-4 Payment
SEM-5 SellerReporting
SEM-6 BillingResponsibility
SEM-7 SearchWorkload
```

The exact entity taxonomy is itself testable and may change.

## Scenario events

Start with approximately 6–8 ScenarioEvents:

```text
SEVT-01 Add VIP cancellation rule
SEVT-02 ChangeBookingDates must obey cancellation policy
SEVT-03 Admin cancellation must obey same policy
SEVT-04 Information: second payment provider under negotiation
SEVT-05 Requirement committed: support second payment provider
SEVT-06 Billing gets separate team ownership
SEVT-07 Add billing retry workflow
SEVT-08 Change cancellation window again
```

These events are test data, not canonical requirements.

## Branching points

### D-1

```text
KEEP local/duplicated cancellation logic
vs
centralize CancellationPolicy
```

### D-2

```text
KEEP direct Stripe integration
vs
introduce PaymentPort before the second provider occurs
```

KEEP must remain a legitimate outcome.

## UI surfaces to prototype

### Event Stream
- vertical main history;
- scenario vs branch scope;
- event role/category;
- compact causal context.

### Event Inspector
- identity;
- relations;
- mutations;
- causes/triggers;
- affected semantic entities;
- branch response.

### Entity/State Explorer
- current state;
- mutation history;
- related activity history;
- semantic history;
- branch representation history.

### Dynamics Compare
- align branches around the same ScenarioEvents;
- show divergent BranchEvents.

### WorkEpisode Inspector
- reference canonical IDs;
- never duplicate event truth.

### Evidence / Cost panel
- raw evidence first;
- scalar effort as derived view.

## Observable evidence

Record at least:

```text
top-level events visible per ScenarioEvent
expandable subevents/operations
events needing incompatible classifications
related-but-non-mutating activities
whether ScenarioEvent identity is duplicated per branch
whether one SemanticEntity maps cleanly to 1:N representations
whether WorkEpisode duplicates or references canonical events
whether scalar effort needs duplicate cost counting
whether branch differences are explainable from the visible trace
```

## Acceptance criteria

### AC-1 Event granularity
Supported if the main stream stays readable while evaluator detail remains available by expansion.

### AC-2 Scenario/Branch identity
Supported if each external anchor has one stable scenario identity and branch responses remain separate.

### AC-3 Relation/mutation split
Supported if inspection/testing/analysis can relate to entities without appearing in mutation history.

### AC-4 Cross-branch representation
Supported if the same semantic entity maps understandably to different branch representations, including 1:N.

### AC-5 WorkEpisode
Supported if it improves explanation without creating a second event history.

### AC-6 Fair comparison
Supported if no architecture-label bonuses are needed and KEEP can remain preferable for some histories.

### AC-7 Cost presentation
Supported if scalar effort traces to canonical CostFacts and analytical lenses are not silently added again.

## Falsification signals

Reconsider the current design if:

```text
every ImplementationOperation must be a top-level event
ScenarioEvents must be duplicated per branch
StateMutation is needed merely to express inspection/test relation
semantic identity cannot survive representation splits
WorkEpisode needs conflicting event copies
scalar cost requires counting the same work twice
the UI can explain outcomes only by architecture labels
```

## Non-goals

PT-001 does not validate:

```text
runtime latency or availability
Monte Carlo uncertainty
empirical person-hours
real human cognitive load
production UX quality
adaptive feedback changing future ScenarioEvents
full microservice extraction economics
```

## Execution stages

### Stage A — Static scenario model
Define ScenarioEvents, SemanticEntities and branch representations.

### Stage B — Branch event generation
Create branch-generated events and operations.

### Stage C — Low-fidelity walkthrough
Render Event Stream, Event Inspector, Entity Explorer and Dynamics Compare from the same IDs.

### Stage D — Consistency audit
Check every visible element against canonical event/entity data.

### Stage E — Interpretation
Classify every TQ as `supported`, `unsupported`, `mixed`, or `inconclusive`.

### Stage F — Promotion
Create `VE-001` in the canonical plan and update only evidence-supported Proposal / CDC / QRP statuses.

## Results

Not executed yet.

## Conclusion

Not available yet.

## Main-plan impact

None yet.

No Proposal/QRP status changes should be made solely from this prototype plan.
