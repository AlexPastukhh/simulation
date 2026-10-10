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

Historical semantic experiment for the r5 candidate:

```text
Requirement Surface
  -> branch Functional Decomposition / Feature Model
  -> Current Realization / TeamPlan
```

Primary mechanics still useful to later prototypes:
- branch-specific event identities;
- canonical mutation ledger;
- synchronized event/state replay;
- first-class ScenarioStep / Widget mechanics.

File:

```text
PT-002_requirement_surface_feature_model_state_canvas.md
```

Current status: `running / historically bounded` — PT-002-R1 structural remediation and technical checks pass, but its PFR/Feature/Required-Design-Current-Plan semantics are partially superseded by R7/R8. Stage E interpretation was never promoted into `VE-*`; PT-002 must not be treated as validation of PT-003 semantics.

### PT-003 — Requirement Model / Architecture Planning / Evolution Map

Validates the r7 candidate after R7/R8:

```text
Actual Event History
  -> non-normalized Requirement Model
  -> factual CURRENT architecture

Planning Event
  -> immutable Plan Revision BASE
  -> immutable Evolution Step versions
  -> full target Architecture Snapshot per Step
  -> replanning / Evolution Options
```

Primary questions:
- non-normalized requirement material and occurrence tracing;
- one Requirement Model at the Actual Event cursor;
- BRUs as architecture-side behavior responsibilities;
- CURRENT vs immutable historical BASE;
- historical requirement knowledge / no hindsight;
- immutable Step versions + `REVISED_FROM` lineage;
- non-monotonic full planned snapshots;
- plan disruption after an unforeseen requirement;
- Evolution Option trigger -> Planning Event -> concrete Step;
- whether full target snapshots make Step-version churn understandable or excessive.

Files:

```text
PT-003_requirement_architecture_evolution_map.md
PT-003/app/
```

Current status: `running` — semantic fixture and UI implementation are synchronized to HOST; model invariants, build, lint and production-preview HTTP smoke pass. Human semantic audit remains pending, so no `VE-*` promotion is performed.

### PT-006 — Workspace / content inventory and remediation

18 content kinds in one A/B workspace: factual State, one Plan, full planned architecture, impacts, forecasts, work and inspectors. [README](PT-006/workspace-shell/README.md), [independent review](PT-006/workspace-shell/PT006_independent_content_review_2026-10-10.md), [current execution record](PT-006/PT006_REMEDIATION_2026-10-10.md).

Current status: remediation authorized and documented before source edits. PR-01A and PR-02–06 are selected for execution. Existing 60 tests/build/lint passed before remediation, with confirmed content/history gaps; those checks do not validate the new iteration. New results belong in the execution record. SC-001/V3A remain candidate, no Stage A/B/C or VE promotion.
