# PT-002 — Requirement Surface / Feature Model / State Canvas

## Status

```text
running
```

Stage A-C and the Stage D semantic slice are implemented in `prototypes/PT-002/app`. PT-002-R1 structural remediation is applied and technical/invariant checks pass. Stage E interpretation and any `VE-*` promotion are still pending.

## Lineage

Derived from:
- R6 requirement-surface / state-canvas review;
- P-39 Requirement Surface Model;
- P-40A Branch Functional Decomposition / Feature Model;
- P-41 Required / Design / Current / Plan State Layers;
- P-31@r5 synchronized Event/State workbench.

Inherits from PT-001 only:
- event-controlled time cursor;
- replay shell;
- ScenarioEvent vs BranchEvent distinction;
- relation vs mutation distinction.

PT-002 does **not** assume PT-001 has validated the new requirement/Feature semantics.

## Canonical candidate under test

`architecture_simulator_proposal_composition_v3a_candidate_r5.md`

## Purpose

Test whether the simulator can keep requirement truth architecture-neutral while allowing different, equally correct branch-specific Feature groupings and realizations.

The prototype should make three things understandable at once:

1. what the product requires;
2. how the selected branch functionally decomposes those requirements;
3. what is currently implemented/planned at the selected event cursor.

## Main targets

```text
P-31@r5
P-35@r5
P-38@r5
P-39
P-40A
P-41

CDC-10..CDC-15

QRP-P-34
QRP-P-35
QRP-P-36
QRP-Q-37
QRP-R-38
QRP-Q-39
QRP-GQ-6
QRP-GR-7
QRP-CP-7
QRP-CR-8
QRP-CR-9
```

## Test questions

### TQ-1 — Requirement ownership

Can users distinguish:
- Scenario as path/context;
- ScreenRequirement;
- WidgetRequirement;
- ProductFunctionalRequirement;
without needing a generic ScenarioRequirement?

### TQ-2 — Identical independent requirements

Can two ProductFunctionalRequirements remain separate even when their current behavior is identical?

### TQ-3 — Branch Feature grouping

Can one branch map those two requirements to one Feature while another maps them to separate Features, with both remaining correct?

### TQ-4 — RequirementCoverage

Is N:M RequirementCoverage understandable and sufficient for:
- many requirements -> one Feature;
- one requirement -> many Features;
- specialized entry Features + shared core?

### TQ-5 — BusinessRule reuse

Can one BusinessRule be shared by multiple requirements without implying shared Feature/code reuse?

### TQ-6 — Non-UI trigger does not determine Feature boundary

Can the prototype represent a ProductFunctionalRequirement with a non-UI trigger (schedule/time, external system, event or internal process) without pre-deciding that it must be a separate Feature?

Can different branches correctly map the same requirement to:
- a separate Feature;
- another trigger/variation of an existing Feature;
- a broader Feature that also covers other requirement units?

### TQ-7 — Required / Design / Current / Plan

Can the viewer distinguish:
- RequiredProductSemantics;
- BranchFunctionalDesign;
- CurrentRealization;
- TeamPlan;
at one time cursor?

### TQ-8 — Planning without implementation

Can a planning event change TeamPlan/Design while leaving CurrentRealization unchanged?

### TQ-9 — Domain-specific projections

Do distinct projections improve understanding over generic key/value state cards?

Candidate projections:
- Scenario / user-system flow;
- Screen / Widget composition;
- Requirement Surface / Rules;
- Branch Feature Model;
- Code / Module structure placeholder;
- Runtime / Data placeholder;
- Ownership / Plan.

### TQ-10 — Synchronized replay

Does selecting an event still keep accumulated state and selected-event delta understandable when several state layers change at once?

## Fixture constraints

Use a small Booking SaaS fixture, but do not copy PT-001 data blindly.

Required fixture elements:

1. at least one Scenario crossing two Screens;
2. at least one reusable Widget appearing on multiple Screens;
3. at least one UI-exposed branch Feature;
4. at least one ProductFunctionalRequirement with a non-UI trigger (schedule/time, external system, event or internal process), with Feature boundary left to branch decomposition;
5. two independent ProductFunctionalRequirements with initially identical behavior;
6. one BusinessRule referenced by both requirements;
7. one branch with shared Feature grouping;
8. one branch with separate Feature grouping;
9. at least one later event that causes contextual divergence;
10. at least one requirement event followed by planning before implementation.

KEEP remains valid at each architecture decision point.

## Candidate example

```text
PFR-C1
  context: Customer BookingDetails
  required behavior: cancel eligible booking

PFR-A1
  context: Admin BookingDetails
  required behavior: cancel eligible booking
```

Both may reference:
`CancellationPolicy`.

Branch A candidate:

```text
PFR-C1 ─┐
        ├-> Feature CancelBooking
PFR-A1 ─┘
```

Branch B candidate:

```text
PFR-C1 -> Feature CustomerCancelBooking
PFR-A1 -> Feature AdminCancelBooking
```

Non-UI requirement example:

```text
PFR-HOLD-EXPIRY
  trigger: time reaches hold.expires_at
  required behavior:
    unconfirmed hold becomes Expired
    reserved inventory becomes available again
```

The Requirement Surface does not decide the Feature boundary.

Possible branch mappings include:

```text
Branch X:
  PFR-HOLD-EXPIRY -> Feature ExpireBookingHold

Branch Y:
  PFR-HOLD-EXPIRY -> existing Feature ReleaseBookingHold(reason=expired)

Branch Z:
  PFR-HOLD-EXPIRY -> broader Feature MaintainBookingHoldLifecycle
```

The trigger is part of requirement context; it is not evidence that a separate Feature must exist.

Later scenario event:

```text
Admin cancellation now requires audit reason
and may bypass the normal customer cancellation window.
```

The prototype must not predeclare which branch is better.

It should show:
- what requirement changed;
- which Feature grouping was already chosen;
- what plan/current state changes follow;
- raw structural consequences.

## State layers to render
### RequiredProductSemantics

Show:
- Scenarios / ScenarioSteps;
- Screens / Widgets;
- ScreenRequirements;
- WidgetRequirements;
- ProductFunctionalRequirements;
- BusinessRules;
- BusinessState semantics.

This layer is shared across controlled branches.

### BranchFunctionalDesign

Show:
- RequirementCoverage;
- BranchFeatures;
- feature grouping;
- specialization / parameterization;
- accepted design decisions.

### CurrentRealization

Initially keep representation intentionally lightweight:
- module/code representation names;
- authoritative knowledge locations;
- runtime/data representation summary.

Do not require literal code yet.
### TeamPlan

Show:
- planned operations;
- migration steps;
- verification obligations;
- unresolved decisions.

A Plan item is not CurrentRealization until an implementation/migration event mutates Current.

## UI hypothesis

Keep the PT-001 time-travel shell:

```text
STATE CANVAS                         EVENT HISTORY
selected-time accumulated state     vertical cursor
selected-event delta inline         scenario vs branch response
```

But replace generic state property cards with domain-specific projections.

Candidate Product projection:

```text
[ Scenarios ] [ Screens ] [ Widgets ] [ Requirements ] [ Rules ]
```

Candidate branch projection:

```text
Requirement Surface
        ↓ coverage
Branch Feature Model
        ↓ realization
Code / Runtime / Data
```

Selected-event changes should be highlighted at the exact projection element they modify.
Raw canonical mutations/relations remain inspectable in expandable details.

## Observable evidence

Record:
- whether requirement ownership is understandable without explanation;
- whether identical PFRs are visibly separate before branch grouping;
- whether branch Feature grouping differences are clear;
- whether any view duplicates authoritative history;
- whether a shared Feature hides one context obligation;
- whether RequirementCoverage needs roles beyond simple links;
- whether Required/Design/Current/Plan can diverge without confusion;
- whether planning-only events are distinguishable from implementation;
- whether Screen/Widget reuse is understandable;
- whether a non-UI ProductFunctionalRequirement remains understandable before Feature grouping;
- whether trigger kind is visibly separate from Feature boundary;
- whether different branches can map the same non-UI requirement to a separate Feature vs an existing/broader Feature without changing requirement truth;
- whether state projection switching loses time-cursor orientation.

## Acceptance criteria

### AC-1 Requirement neutrality

Supported if both branches consume the same Requirement Surface without branch-specific requirement corruption.

### AC-2 Feature grouping

Supported if shared and separate Feature models can both satisfy all independent PFRs.

### AC-3 Coverage

Supported if every PFR can be traced to branch Features and later realization without hidden merging.
### AC-4 State layers

Supported if Required, Design, Current and Plan differ at intermediate events without users mistaking one for another.

### AC-5 Replay

Supported if selected event + accumulated state remain visible and causally connected.

### AC-6 Projection integrity

Supported if every Product/Feature/Code/Runtime view is derived from one canonical replay state rather than manually maintaining separate histories.

### AC-7 Architecture neutrality

Supported if no architecture-label bonus or predetermined reuse preference is needed to explain consequences.

### AC-8 Trigger / Feature-boundary independence

Supported if a non-UI ProductFunctionalRequirement can keep the same requirement identity while different branches map it to a separate Feature, an existing Feature with another trigger/variation, or a broader Feature.

## Falsification signals

Reconsider the candidate if:

```text
Feature identity must be known before architecture to make the model coherent
RequirementCoverage needs contradictory ownership rules
separate Features cannot be compared fairly to a shared Feature
shared Feature grouping loses a context-specific PFR
Scenario needs a generic requirement bag for ordinary cases
Widget containment is required to identify Features
non-UI trigger type forces one particular Feature identity/boundary
Required/Design/Current/Plan cannot be replayed independently
each State Canvas projection needs its own manually-authored truth
```
## Non-goals

PT-002 does not validate:
- final visual polish;
- literal source-code diffs;
- full filesystem/project-tree fidelity;
- runtime performance;
- empirical person-hours;
- production defects;
- adaptive future ScenarioEvents;
- universal requirements ontology.

Code snippets/project trees may become a later PT if the semantic projections are already understandable.

## Execution stages

### Stage A — Requirement Surface fixture

Define:
- Scenarios;
- Screens;
- Widgets;
- requirements;
- BusinessRules;
- independent PFR identities;
- trigger/context metadata for PFRs, including at least one non-UI trigger without assigning its Feature boundary yet.

### Stage B — Branch Feature Models

Define at least:
- shared Feature branch;
- separate Feature branch;
- RequirementCoverage mappings;
- at least two valid mappings of one non-UI PFR, including a separate Feature vs an existing/broader Feature.
### Stage C — Layered evolution

Add:
- requirement events;
- planning/decision events;
- implementation/migration events;
- Required/Design/Current/Plan mutations.

### Stage D — State Canvas semantic slice

Reuse the event/time-travel shell and render the new projections. This stage is currently a semantic slice, not a claim that every future Code/Runtime/Data projection is complete.

### Stage E — Interpretation

Classify TQ-1..TQ-10 as:
`supported | unsupported | mixed | inconclusive`.

### Stage F — Promotion

Only after interpretation:
- create VE record(s);
- update affected Proposal/QRP statuses;
- create next candidate revision if needed.

## Implementation status

```text
Stage A — Requirement Surface fixture      implemented
Stage B — Branch Feature Models            implemented
Stage C — Layered evolution                implemented
Stage D — State Canvas semantic slice      implemented
Stage E — Interpretation                   not performed
Stage F — Promotion                        not performed
```

Current app implements:
- one shared Requirement Surface across both branches;
- customer/admin PFRs with initially identical behavior;
- first-class ScenarioStep / Widget / WidgetPlacement relations;
- a customer Scenario that crosses SearchResults and BookingDetails;
- reusable BookingActions across BookingDetails and AdminBookingDetails;
- derived Scenario requirement participation rather than authored backlink lists;
- shared CancellationPolicy BusinessRule;
- pre-existing `ReleaseBookingHold` from `PFR-H0` before non-UI expiry requirement `PFR-H1` appears;
- shared branch maps `PFR-H1` as a variation of the existing Feature while the specialized branch creates `ExpireBookingHold`;
- explicit `RequirementCoverage` relation objects with roles;
- Required / Design / Current / Plan replay layers;
- branch-specific event identities and histories with different event counts when appropriate;
- selected-event delta/highlights derived from the same canonical event mutations used for replay.

## Results

Technical implementation evidence only:

```text
PT-002-R1 structural invariant suite: pass
TypeScript / Vite build: pass
oxlint: pass (0 warnings, 0 errors)
production preview HTTP smoke: pass (200)
```

This does **not** establish TQ-1..TQ-10 as supported. No comprehension/semantic interpretation has been performed yet. TQ-4 / QRP-Q-37 also remains open for a natural `one requirement -> several Features` coverage case; the explicit RequirementCoverage relation itself is now implemented.

## Main-plan impact

None beyond opening PT-002 as the validation vehicle already referenced by V3A-candidate-r5.

Do not promote fixture/UI choices before Stage E interpretation.
