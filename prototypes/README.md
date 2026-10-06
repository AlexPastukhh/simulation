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

Failed and negative prototypes remain preserved.

## Current prototypes

### PT-001 — Event / Entity Walkthrough

Validates the event-centric simulation model against one concrete Booking SaaS walkthrough before event/entity schema freeze.

File:

```text
PT-001_event_entity_walkthrough.md
```
