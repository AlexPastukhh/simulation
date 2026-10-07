# Architecture Evolution Simulator — Review R6

## Identity / provenance

Review ID: `R6`

Order: after `V3A-candidate-r4` and after the PT-001 Stage C implementation plus the subsequent live time-travel UX experiment.

Primary target:

`V3A-candidate-r4 — architecture_simulator_proposal_composition_v3a_candidate_r4.md`

Secondary surface under review:

the prototype/simulator interaction model derived from that candidate.

R6 does **not** retarget R4 or R5. Their provenance remains unchanged.

No `VE-*` is created by this review. Prototype validation is still incomplete.

## Scope

R6 reviews:
- requirement-surface semantics before architecture;
- Feature identity and reuse boundaries;
- Scenario / Screen / Widget / functional-requirement ownership;
- correct requirements vs suboptimal architecture;
- Required / Current / Planned state separation;
- synchronized event/state visualization;
- prototype staging needed to validate the new model.

## Confirmed findings

### R6-P-1 — Split Event/State UI weakens causality

Type: confirmed problem.

Target: `P-31@r3` / PT-001 Stage C visualization.

The viewer should not have to mentally join a detached Event Stream, Event Inspector and Entity/State view.

Preferred candidate interaction:
`select event -> replay through it -> show accumulated state -> show selected-event delta inline`.

### R6-P-2 — Stable problem-space Feature identity can pre-commit reuse

Type: confirmed problem.

Target: candidate interpretation of P-1/P-10/P-35.

If two independent contexts with identical functional requirements are canonicalized as one Feature before architecture planning, the requirement model has already chosen a reuse boundary.

That prevents fair comparison of one shared Feature, separate Features, shared core + adapters, or parameterized Feature.

### R6-P-3 — Requirement correctness must not be an architecture variable

Type: confirmed fairness problem.

Normal architecture branches must receive the same correctly modeled requirement surface.

A branch may be duplicated, coupled, over-parameterized or expensive while still satisfying the same requirements.

### R6-P-4 — Scenario must not be a generic requirement bag

Type: confirmed problem.

Scenario is goal/context/path.

Requirements should normally attach to reusable product objects:
- ScreenRequirement -> Screen;
- WidgetRequirement -> Widget;
- independent ProductFunctionalRequirement -> functional behavior in one context.

No generic free-floating ScenarioRequirement is preferred.

### R6-P-5 — Feature must be independent of Widget/UI containment

Type: confirmed problem.

A Feature may be invoked/exposed by Widget, Screen lifecycle, API/ExternalSystem, schedule, event or internal process.

`Screen -> Widget -> Feature` must not be a mandatory containment chain.

### R6-P-6 — Required / Current / Planned are distinct

Type: confirmed problem.

A requirement can already be true in Required Product Semantics while Current Realization is still old and Team Plan describes unfinished work.

Collapsing the three prevents planning, partial migration, replanning and verification from being simulated.

### R6-P-7 — Generic key/value state hides architectural meaning

Type: confirmed projection problem.

Different state domains need different projections:
- Scenario/user-system flow;
- Screen/Widget composition;
- requirement units and BusinessRules;
- branch Feature Model;
- code/module structure;
- runtime/data topology;
- ownership/deployment/plan.

Raw state remains inspectable but should not be the primary explanation.

### R6-P-8 — Implementation-specific behavior can leak into requirements

Type: confirmed semantic risk.

Requirement-level behavior should express guarantees such as:
- durably recorded;
- visible to later reads;
- idempotent retry;
- eventual reporting visibility.

PostgreSQL, Redis, repository method or Kafka topic normally belong to realization unless externally mandated.

### R6-P-9 — BusinessRule reuse != Feature reuse

Type: confirmed clarification.

Two independent functional requirements may reference one canonical BusinessRule without implying a shared Feature or shared code.

## Questions / risks / user clarifications

### R6-Q-1 — ProductFunctionalRequirement -> Feature cardinality

Type: question.

Candidate answer: support N:M through explicit branch-local RequirementCoverage.

Blocking: before the product-to-feature mapping is frozen.

### R6-Q-2 — Direct BusinessRule use by Screen/Widget

Type: question.

Allow only when the rule genuinely constrains visibility/availability/presentation; do not duplicate an indirect Feature->Rule relation.

Status: non-blocking.

### R6-R-1 — Product-semantic ontology creep

Type: risk.

Condition: Scenario, Screen, Widget, requirements and rules grow into a universal product ontology.

Mitigation: add only concepts needed by concrete prototypes; keep vocabularies extensible.

### R6-R-2 — Shared Feature hides context obligations

Type: risk.

Mitigation: every ProductFunctionalRequirement remains an independent coverage obligation even if several map to one Feature.

### R6-U-1 — Identical requirements remain independent before grouping

Type: user clarification / semantic correction.

Even if two functional requirements are textually and behaviorally identical, the requirement surface may preserve separate identities because they arise in independent product contexts.

Whether they form one Feature is a branch-specific architecture/functional-decomposition decision.

### R6-U-2 — Multiple Feature groupings may all be correct

Type: user clarification.

Correctness does not require canonical reuse.

The simulator evaluates consequences rather than rewarding a predetermined reuse doctrine.

### R6-U-3 — Requirement ownership

Type: user clarification.

Preferred ownership:
- Screen requirements;
- Widget requirements;
- ProductFunctionalRequirements for application behavior.

Scenario composes the journey; it does not own a generic requirement bucket.

## Review conclusion

R6 keeps the event/replay core but changes the preferred layering from:

`problem semantics with stable Feature identity -> branch representation`

toward:

`Requirement Surface -> branch Functional Decomposition / Feature Model -> branch Realization`.

It also revises P-31 toward one synchronized event/state time-travel workbench.

These are candidate changes only until an explicit composition commit.