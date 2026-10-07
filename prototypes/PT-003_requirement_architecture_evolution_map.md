# PT-003 — Requirement Model / Architecture Planning / Evolution Map

## Status

```text
running
```

Prototype lineage created after R7/R8. PT-003 does **not** retarget PT-002 and does not inherit PT-002 semantic validation.

## Canonical candidate under test

`architecture_simulator_proposal_composition_v3a_candidate_r7.md`

## Inherited mechanics only

From PT-001 / PT-002:
- factual event-controlled replay shell;
- shared scenario/factual anchors vs branch-generated responses;
- one canonical factual mutation stream per branch replay;
- accumulated state + selected-event explanation.

Inherited mechanics are not evidence for PT-003 semantics by themselves.

## Primary targets

```text
P-31@r7 dual Actual / Planned workbench
P-35@r6 occurrence trace mapping
P-39@r6 non-normalized Requirement Model
P-40A@r6 Architecture Planning / BRU model
P-41@r7 Requirement / Current / Planned semantics
P-42@r7 Evolution Map + full Architecture Snapshots
P-43@r7 Planning Events + immutable Plan Revision history
P-44@r6 Evolution Impact
P-45@r6 Evolution Options
P-37@r6 adaptive evolution direction

CDC-10@r6 .. CDC-20@r7 as applicable
QRP-P-40 .. QRP-P-53 as applicable
QRP-GQ-9 remains explicitly non-blocking
```

## Purpose

Test whether one interface/model can keep these truths distinct and causally connected:

```text
Actual Event History
  -> Requirement Model known at factual cursor
  -> factual CURRENT architecture

Planning Event
  -> immutable EvolutionMapRevision BASE
  -> immutable Evolution Step versions
  -> full target Architecture Snapshot per Step

Later Actual Event
  -> new knowledge
  -> replanning
  -> new revision without rewriting old plan truth
```

The prototype also tests whether an unforeseen requirement can produce visibly different **plan disruption** for two architecture alternatives without using hindsight or architecture-label bonuses.

## Core propositions

### TQ-1 — Requirement Model is non-normalized

Can requirement material remain as contextual blocks/occurrences without mandatory PFR/ScreenRequirement/BusinessRule normalization?

Technical occurrence refs are allowed only for traceability.

### TQ-2 — One Requirement Model per actual cursor

When all currently known material is visible, does selecting a planned Evolution Step leave Requirement Model truth unchanged?

### TQ-3 — Architecture Planning preserves product context but adds organization

Can BRUs trace requirement occurrences while remaining architecture-side responsibility decisions rather than requirement-side semantic identity?

### TQ-4 — CURRENT vs historical BASE

After actual implementation advances from A0 to A1, can the user still open Plan R1 and understand that:
- factual CURRENT is A1;
- R1 BASE is still A0;
- R1 knowledge is reconstructed at its `based_on_actual_event_ref`?

### TQ-5 — Full planned snapshots are non-monotonic

Can a Step target represent split, temporary duplication/migration and retirement rather than only additions?

### TQ-6 — Evolution Step version identity

Can one conceptual Step be:
- reused as the same exact version when plan-defining semantics stay unchanged;
- revised into `@v2 REVISED_FROM @v1` when target/dependencies/impact change;
without mutating the historical revision?

### TQ-7 — Unforeseen change / plan disruption

With the same unexpected factual requirement in both alternatives, can the prototype show different disruption in terms of:
- realized prior steps;
- exact step versions reused;
- step versions revised;
- inserted work;
- removed/cancelled work?

### TQ-8 — Evolution Option is not hidden future knowledge

Can a known uncertainty remain an option until:
1. a factual event resolves its trigger;
2. a Planning Event creates a new revision;
3. only then is a concrete Evolution Step inserted?

### TQ-9 — Actual and planned cursors remain distinct

Does selecting a planned Step show its target snapshot without moving the Actual Event cursor or pretending implementation happened?

### TQ-10 — Full-snapshot version churn is understandable

Because exact Step version identity includes the full target snapshot, an upstream unforeseen architectural change may force later Step versions to revise even if their local intent is similar.

Is that distinction useful and understandable, or does it create excessive version churn that suggests target snapshots should be revision-owned separately from Step identity?

This is an intentional falsification pressure, not an assumption to hide.

## Fixture

Domain: Booking SaaS cancellation.

### Initial factual requirement knowledge at E01

Known now:
- customer cancellation eligibility;
- admin can cancel under the same currently-known rule;
- final cancellation status must remain visible;
- product-specific cancellation windows are known now but become effective later;
- confirmation UI has an open experiment: page vs inline drawer.

Unknown at E01:
- admin bypass of the normal window with a recorded reason.

### Initial factual architecture A0

Both alternatives start from the same realized architecture:
- `BookingActions` owns customer cancellation + current window check;
- `CancellationStatus` exposes final state.

### Alternative A — explicit policy boundary early

R1 first Step implements admin cancellation and introduces `CancellationPolicy` before product-specific windows become effective.

### Alternative B — handler first

R1 first Step implements admin cancellation inside `BookingActions`; policy extraction remains a deliberately planned later migration.

Neither alternative receives a built-in score or correctness bonus.

## Actual Event sequence

```text
E01  initial factual state + known requirements
A/B-E02  Planning Event creates Plan R1 from E01 / A0
A/B-E03  first Step is actually implemented; CURRENT becomes A1
E04  genuinely unexpected admin-bypass requirement appears
A/B-E05  Planning Event creates Plan R2 from E04 / factual A1
E06  usability experiment selects inline drawer
A/B-E07  Planning Event creates Plan R3 and instantiates the option
```

Shared events are requirement/experiment facts. Branch events are planning or implementation responses.

## Plan revision expectations

### Alternative A · R1 -> R2

Expected structural diff:

```text
realized  1
reused    1
revised   1
inserted  1
removed   0
```

The product-window Step survives exactly as `@v1` because it remains before the inserted admin-override Step. A later audit Step becomes `@v2` because its full target snapshot must now include the unforeseen semantics.

### Alternative B · R1 -> R2

Expected structural diff:

```text
realized  1
reused    0
revised   2
inserted  1
removed   0
```

The postponed policy extraction changes scope and target state; a compatibility migration is inserted; the later audit target also changes.

This is structural evidence of plan disruption, not a hidden scalar score.

### R2 -> R3

Experiment result is already factual at E06. R3 may reuse the R2 Step versions unchanged and append a concrete presentation Step. This tests that option activation is mediated by a Planning Event rather than by the option mutating the plan itself.

## UI hypothesis

Use two independent cursors:

```text
ACTUAL EVENT HISTORY
  selected event -> Requirement Model + factual CURRENT

EVOLUTION MAP REVISION
  selected revision -> immutable BASE
  selected Step version -> planned target Architecture Snapshot + Evolution Impact
```

The interface must make it impossible to mistake a selected planned target for factual CURRENT.

Historical plan inspection must show:
- BASE actual event;
- BASE architecture snapshot;
- requirement knowledge count/content at BASE;
- exact Step versions stored in that revision;
- actual CURRENT separately.

## Observable evidence

Record whether a reviewer can answer, from the UI alone:
- Which requirements were known when R1 was created?
- What is factual CURRENT at E03/E04/E05?
- What remains R1's BASE after CURRENT has advanced?
- Which Step version survived R1 -> R2 unchanged?
- Which Step was revised and what was its prior version?
- Which work was inserted only because of the unforeseen requirement?
- Why does Alternative B show more plan revision than A?
- Does opening R1 after R2 exists leak the unexpected requirement into R1 knowledge?
- Does selecting a planned Step accidentally change factual CURRENT?
- Is the option merely known, factually triggered, or actually instantiated into a plan?

## Acceptance criteria

### AC-1 No hindsight

R1 knowledge excludes the unexpected E04 requirement and the E06 experiment result.

### AC-2 Immutable BASE

Actual progress to A1 never mutates R1 BASE=A0.

### AC-3 Immutable Step versions

Historical revisions keep exact Step refs; changed plan-defining semantics create a new version with lineage.

### AC-4 Factual/planned separation

Selecting a planned Step changes only planned projection; Actual Event cursor and factual CURRENT remain unchanged.

### AC-5 Full snapshot integrity

Every Evolution Step ref resolves to a complete architecture snapshot for the modeled PT-003 dimensions.

### AC-6 Shared requirement truth

At aligned shared factual anchors, both alternatives reconstruct the same Requirement Model.

### AC-7 Replanning history

R1 remains inspectable after R2/R3 are created.

### AC-8 Option activation discipline

The option is known at E01, triggered at E06, and becomes a concrete Step only in the E07-created revision.

### AC-9 Non-monotonic architecture

At least one planned path contains split/migration/retirement rather than additive-only state.

### AC-10 Plan disruption is decomposable

The UI exposes realized/reused/revised/inserted/removed facts instead of only a score.

## Falsification signals

Reconsider r7 semantics if:

```text
historical plan knowledge cannot be reconstructed without duplicating requirement truth
CURRENT and BASE remain confusing even when explicitly separated
a Step target snapshot must be mutated when CURRENT advances
exact Step-version reuse becomes impossible or misleading in ordinary replanning
target-snapshot inclusion creates excessive meaningless version churn
Evolution Option has to mutate the plan before a factual trigger/planning event
planned Step selection must move the factual cursor to stay understandable
full Architecture Snapshots require a universal ontology beyond the modeled slice
```

## Non-goals

PT-003 does not yet validate:
- fake filesystem / File implementation artifacts;
- Class/Method/AST fidelity;
- code-facing future-impact comments;
- final Change Axis / Actual Hot Path metrics;
- empirical effort/person-hours;
- final scalarization;
- Monte Carlo;
- general-DAG Evolution Map semantics.

Those remain PT-004/later questions.

## Execution stages

### Stage A — Semantic fixture

Define requirement material, factual event history, two architecture alternatives, full snapshots, Plan Revisions, Step versions and one Evolution Option.

### Stage B — Invariant suite

Automatically verify:
- shared requirement truth at shared cursors;
- no future requirement leakage into R1;
- immutable BASE refs;
- Step lineage/version validity;
- full target snapshot refs;
- expected R1 -> R2 disruption counts.

### Stage C — UI workbench

Render Actual Event cursor, Requirement Model, factual CURRENT, historical Plan Revisions, BASE, Step versions, target snapshots, impacts and option status.

### Stage D — HOST technical verification

Run build, lint, model invariants and production-preview HTTP smoke in the real environment.

### Stage E — Human semantic audit

User/reviewer checks the questions under Observable evidence. Visual interpretation is not claimed until this happens.

### Stage F — Interpretation / VE promotion

Classify each TQ as `supported | unsupported | mixed | inconclusive`. Only then update Proposal/QRP status or add VE evidence.

## Current results

Snapshot/workspace + HOST technical verification:

```text
semantic fixture: implemented
model invariant suite: pass on HOST
UI implementation: synchronized to HOST
HOST build: pass
HOST lint: pass (0 warnings, 0 errors)
HOST production-preview HTTP smoke: pass (200)
human semantic audit: pending
VE promotion: none
```

## Main-plan impact

None yet.

PT-003 is a validation vehicle for `V3A-candidate-r7`; it does not semantically commit r7 or revise the canonical V2 baseline by itself.
