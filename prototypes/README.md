# Prototype Validation Track

Prototype artifacts are separate from the canonical Proposal Composition.

## Identity

Prototype plans use `PT-*` IDs. Validated evidence promoted into the canonical plan uses `VE-*` IDs.

## Lifecycle

```text
planned -> prepared -> running -> completed -> interpreted
```

A prototype may also end as `inconclusive`, `invalidated`, or `superseded`.

## Required sections

Every `PT-*` should state:

1. target Proposals / CDCs / QRP / questions;
2. propositions being tested;
3. scope and non-goals;
4. fixture/scenario assumptions;
5. variants;
6. observable evidence;
7. acceptance / falsification criteria;
8. execution procedure;
9. results;
10. interpretation and limitations;
11. main-plan impact.

## Promotion rule

A prototype is exploratory evidence, not canonical truth by itself.

Do not promote fixture-specific assumptions, temporary UI choices, mock data, shortcuts or taxonomy into User Needs, Fundamental Requirements or accepted Proposals merely because they appeared in a prototype.

After a prototype is completed:

1. preserve the prototype artifact;
2. classify tested propositions as `supported`, `unsupported`, `mixed`, or `inconclusive`;
3. add a `VE-*` record to the canonical Proposal Composition;
4. update affected Proposal / CDC / QRP status explicitly;
5. create a new candidate revision if the canonical composition changes materially.

If a materially new semantic question appears while a prototype is running:

1. do not retroactively pretend the old PT always tested it;
2. preserve the original PT target/version;
3. create a new `PT-*` with explicit lineage;
4. state which mechanics/results are inherited versus newly tested;
5. do not inherit validation merely because the same UI shell or fixture is reused.

Failed and negative prototypes remain preserved.

## Current prototypes

### PT-001 — Event / Entity Walkthrough

Validates the event-centric simulation model against one concrete Booking SaaS walkthrough before event/entity schema freeze.

Files:

```text
PT-001_event_entity_walkthrough.md
PT-001_stage_a_fixture.md
PT-001_stage_b_branch_events.md
PT-001_stage_c_ui.md
PT-001/
```

Current status: `running` — Stage C UI is technically validated and the later time-travel shell experiment improved the event/state interaction, but formal interpretation / VE promotion is still pending.

### PT-002 — Requirement Surface / Feature Model / State Canvas

Validates the r5 candidate semantics introduced after R6:

```text
Requirement Surface
  -> branch Functional Decomposition / Feature Model
  -> Current Realization / TeamPlan
```

Primary questions:
- Screen / Widget / ProductFunctionalRequirement ownership;
- identical independent requirements;
- branch-specific Feature grouping;
- RequirementCoverage N:M;
- BusinessRule reuse independent of Feature reuse;
- non-UI ProductFunctionalRequirements whose trigger does not predefine a Feature boundary;
- Required / Design / Current / Plan state layers;
- domain-specific State Canvas projections.

File:

```text
PT-002_requirement_surface_feature_model_state_canvas.md
```

Current status: `running` — Stage A-C plus the Stage D semantic slice are implemented in `PT-002/app`; PT-002-R1 structural remediation is applied, invariant checks/build/lint pass, and production-preview smoke is verified separately on HOST. Stage E interpretation is still pending, so no `VE-*` has been promoted.

PT-002 may reuse PT-001 replay mechanics, but does not inherit semantic validation from PT-001.
