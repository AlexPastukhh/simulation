# PT-002 Independent Review — PT-002-R1

## Target / Scope

Review ID: `PT-002-R1`  
Date: 2026-10-07.

Primary target:
- `prototypes/PT-002/app`;
- `prototypes/PT-002_requirement_surface_feature_model_state_canvas.md`.

Reference semantics checked only as needed:
- `P-31@r5`;
- `P-39`;
- `P-40A`;
- `P-41`;
- inherited ScenarioEvent / BranchEvent and relation / mutation semantics.

Out of scope:
- evaluator/cost model;
- PT-001 as a whole;
- final visual polish;
- empirical effort calibration;
- literal production code examples.

## Source fingerprints

```text
App.tsx   632D858FC4325AFFABA17F6B08F910D86F7558CD4B502B33A91031FFF525FAE4
model.ts  6A3AF21210D35DED4A0536E5384AE55C69B107F93D790804736C7DF27E2AA929
PT-002 doc 6957DE8771C43C141B2D3CBA364E375D55EF1ECD187AB47E8878158C255ADB36
r5 candidate 48081DC3ADA64682506199C45690DECED94EA84E689D3D8073B17EF40649009F
```

## Task reconstruction

PT-002 is meant to test whether one architecture-neutral Requirement Surface can be mapped into different, equally correct branch-specific Feature Models while replay keeps four concerns distinct:

```text
RequiredProductSemantics
BranchFunctionalDesign
CurrentRealization
TeamPlan
```

The prototype must also exercise:
- independent but initially identical PFRs;
- Screen / Widget / functional requirement ownership;
- BusinessRule reuse without forced Feature reuse;
- a non-UI PFR whose trigger does not determine Feature boundary;
- planning before implementation;
- later contextual divergence;
- synchronized event/state replay;
- selected-event delta at the affected state.

Stage E comprehension interpretation is explicitly pending, so this review does not treat UI comprehensibility as already validated.

## Review summary

Technical execution is healthy, and several core invariants work.

However, the prototype is **not yet a valid Stage E vehicle** for all of its stated semantic questions.

The largest defects are:
1. branch-generated event identity is not stable;
2. replay state and displayed event delta have separate authored sources of truth and already diverge;
3. the Scenario/Widget requirement graph is only partially modeled;
4. the non-UI “existing Feature + new trigger” case is not actually represented by the fixture;
5. explicit fixture and RequirementCoverage cases remain unimplemented.

No `VE-*` should be promoted from the current state.# 1. Confirmed problems

## P-1 — BranchEvent identity is conflated across branches

**Impact:** main result / blocking.

The model has one global `TIMELINE` with IDs such as `E04`, `E05`, `E08`, `E09`.

Those events have `scope: branch`, but no branch identity. Their meaning/effect is changed by the selected branch.

Concrete example:
- `E04` is the same event ID in both branches;
- App.tsx changes its displayed title according to the branch;
- replay functions apply different Feature Models behind that same ID.

Requirement:
PT-002 says it inherits the ScenarioEvent vs BranchEvent distinction; r5/P-36 requires branch responses to be branch-scoped identities rather than one event whose meaning changes by branch.

Mechanism:
switching branch changes the semantics of the same historical event identity.

Consequence:
event histories cannot remain stable or be cited reliably; branches with different response counts cannot be represented honestly; nth-index cursor alignment is silently assumed.

**Proposal direction:** distinct branch event IDs, aligned through shared ScenarioEvent anchors rather than shared branch-event identity.

## P-2 — Replay state and selected-event delta are separate sources of truth

**Impact:** main result / blocking.

Current replay is authored through:
- `applyRequired`;
- `applyDesign`;
- `applyPlan`;
- `applyCurrent`.

Displayed change explanation is authored separately through:
- `eventDelta`;
- `changedIds`;
- `TimelineEvent.affectedLayers`.

There is no canonical `relations[]` / `mutations[]` event ledger in PT-002.

This is not only an abstract drift risk. It is already observable:

```text
E08 / separate branch
before Feature Model == after Feature Model
but eventDelta.design contains a design-change line
and affectedLayers includes design
```

Independent executable check: FAIL.

Requirement:
AC-6 requires projections to derive from one canonical replay state; P-31/CDC-14 expects selected-event delta to come from authoritative event effects.

Consequence:
the UI can claim that a layer changed when replay state did not change.

This invalidates the current claim that selected-event delta is authoritative.

**Proposal direction:** one canonical event mutation/relation representation; derive snapshot, delta and highlights from it.

## P-3 — Scenario / Widget product graph is under-modeled

**Impact:** main semantic validation / blocking TQ-1.

Current model has:
- no first-class `Widget` entity;
- no `ScenarioStep` type;
- `Scenario.steps: string[]`;
- `Screen.widgets: string[]`;
- no Widgets product tab;
- Widget reuse badge hard-coded by the string `BookingActions`;
- `Scenario.requirementIds` stored directly rather than derived.

Concrete drift:
after E07, `SR-ADMIN-REASON` exists, but `SC-ADMIN-CANCEL.requirementIds` still contains only:

```text
PFR-A1
SR-ADMIN-BOOKING
```

Independent executable check: FAIL.

Requirement:
PT-002 TQ-1 and P-39 need Scenario as path/context, reusable Screen/Widget objects, and requirements attached to the object that must satisfy them.

Consequence:
the prototype cannot robustly test requirement ownership, Widget reuse, or derived Scenario participation; direct relationship lists can become stale.

**Proposal direction:** first-class ScenarioStep, Widget and WidgetPlacement relations; derive scenario requirement/rule participation.

## P-4 — Non-UI “existing Feature + new trigger” case is not actually demonstrated

**Impact:** main semantic validation / blocking TQ-6 and AC-8.

In the shared branch, E04 creates:

```text
F-RELEASE-HOLD
title: ReleaseBookingHold
mode: existing Feature + new trigger
coverage: [PFR-H1]
```

But `F-RELEASE-HOLD` did not exist before E04 and covers no prior requirement.

Therefore “existing Feature + new trigger” is currently only a label.

The actual structure is still:

```text
one PFR -> one newly introduced Feature
```

Independent check: FAIL; coverage at E04 is only `PFR-H1`.

Requirement:
TQ-6 / AC-8 specifically needs the same non-UI PFR to be mappable either to a separate Feature or to an already-existing/broader Feature.

Consequence:
the prototype does not yet test the distinction it claims to demonstrate.

**Proposal direction:** introduce a prior independent hold-release requirement and Feature, then let expiry either join that Feature or remain separate.

## P-5 — Fixture does not contain the required cross-Screen Scenario

**Impact:** local, but blocks one declared fixture validation.

PT-002 explicitly requires at least one Scenario crossing two Screens.

Current scenarios are:
- customer cancellation on BookingDetails;
- admin cancellation on AdminBookingDetails;
- hold expiry with no Screen.

No Scenario traverses two Screens.

Consequence:
the prototype does not exercise cross-Screen Scenario composition or navigation ownership, despite claiming Stage A-D implemented.

## P-6 — RequirementCoverage N:M is not actually validated

**Impact:** blocking TQ-4 / QRP-Q-37.

Current `FeatureDesign.coverage: string[]` can express several PFR IDs on one Feature.

The fixture demonstrates:
- N requirements -> 1 Feature;
- 1 requirement -> 1 Feature.

It does not demonstrate:
- 1 requirement -> several Features;
- specialized entry Features + shared core.

There is also no explicit RequirementCoverage relation identity/role.

Consequence:
the current Stage B implementation cannot answer TQ-4 or close QRP-Q-37.

Calling RequirementCoverage N:M “implemented” is too strong at this stage.# 2. Uncertain / disputed areas

## U-1 — Stage E comprehensibility is unverified

This review can verify source structure, model behavior, build/lint and HTTP runtime.

It cannot establish that a user understands:
- requirement ownership;
- branch Feature grouping;
- four state layers;
- time-cursor orientation.

This is expected because Stage E is still pending; it is not itself a defect.

## U-2 — KEEP at E04 is underspecified by the fixture

PT-002 says KEEP remains valid at each architecture decision point.

But E04 is currently the first creation of a Feature Model: before E04 there is no prior BranchFunctionalDesign to keep.

Two interpretations are possible:
1. E04 is initialization, not an architecture decision where KEEP must exist;
2. the fixture should seed an initial decomposition so one branch can genuinely KEEP it.

The plan and fixture should choose one explicitly.

## U-3 — Stage D completion label is stronger than the implemented slice

The document marks Stage D implemented, while some declared projections are absent:
- first-class Widget projection;
- BusinessState semantics;
- runtime/data summary;
- raw canonical mutation/relation detail.

Whether all of those are required in PT-002 before Stage E is partly a scope decision.

At minimum the status should distinguish “semantic slice implemented” from “all listed projections implemented.”# 3. What held up under independent re-check

The following were re-checked independently and are supported by the current implementation:

- Requirement Surface is byte-for-byte structurally equivalent between shared/separate branches at all 9 replay cursors.
- E05 has TeamPlan populated while CurrentRealization is still empty.
- E07 creates a real Required != Current gap.
- PFR-C1 and PFR-A1 are independent and initially behaviorally identical.
- BR-CANCEL is shared by both cancellation requirements without forcing shared Feature grouping.
- PFR-H1 exists as a non-UI requirement before Feature decomposition.
- shared vs specialized cancellation Feature grouping is visibly represented.
- reusable BookingActions appears on both booking Screens, although it is not yet a first-class Widget entity.
- implementation docs correctly keep Stage E and VE promotion pending.
- PT-001 provenance was not retroactively rewritten into PT-002 validation.

Technical checks also hold:
```text
TypeScript/Vite build: PASS
oxlint: PASS, 0 warnings / 0 errors
production preview HTTP: 200
```

These technical passes do not override semantic problems P-1..P-6.# 4. User Assistance / Process Improvement

## UA-1 — Human Stage E observation

No user action is needed to fix P-1..P-6.

After those structural problems are corrected, a small user action will materially improve validation quality:

1. open the PT-002 preview;
2. inspect E02/E03/E04/E07/E08 in both branches;
3. report where the distinction between Requirement Surface, Feature Model, Current and Plan is unclear or surprising.

This is needed because comprehension cannot be established from static/source inspection alone.

**Blocking:** not blocking structural remediation; blocking any strong Stage E / VE claim about understandability.

# 5. Deferred / Follow-up Items

## D-1 — Visual polish, accessibility and responsive behavior

Keep for after semantic corrections and first Stage E pass.

Reason:
semantic structure is still changing; polishing now risks optimizing the wrong projections.

Return trigger:
P-1..P-6 resolved and Stage E begins.

Potential consequence if ignored later:
the semantic model may be correct but difficult to use at realistic viewport sizes.

## D-2 — Rich code/runtime/data projections

Literal code/project-tree fidelity remains correctly deferred.

Return trigger:
Requirement Surface -> Feature Model -> replay semantics survive PT-002 Stage E.

Potential consequence if ignored after that point:
later architecture-realization teaching will remain too abstract.# 6. Questions / Proposals

## Q-1 — How should branch events be represented?

**Why it matters:** stable causal history and controlled comparison require event identity not to change when branch selection changes.

**Proposal:** keep shared ScenarioEvent anchors; give each branch response its own BranchEvent ID and branch scope. Align comparison by shared scenario anchor plus causal/response order, not by assuming one common branch-event ID.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** blocking P-31/P-36 replay correctness.

## Q-2 — What is the single authoritative replay source?

**Why it matters:** P-2 is already producing false deltas.

**Proposal:** replace procedural duplicate truth with canonical event relations/mutations. Snapshot replay, selected-event delta, changed IDs and affected-layer highlights should all derive from those same facts.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** blocking AC-6 and Stage E.

## Q-3 — What should be authoritative in the product graph?

**Why it matters:** Scenario/Widget participation currently drifts.

**Proposal:** introduce first-class `ScenarioStep`, `Widget` and `WidgetPlacement`; keep requirement ownership on Screen/Widget/PFR; derive Scenario -> requirement/rule participation transitively.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** blocking TQ-1.

## Q-4 — How should the non-UI case prove “existing Feature + new trigger”?

**Why it matters:** the current fixture does not actually contain an existing Feature.

**Proposal:** add a prior independent requirement such as release of a booking hold from another valid context. Establish `ReleaseBookingHold` before the expiry requirement. Then:
- shared branch maps expiry PFR to the existing release Feature as another trigger/variation;
- specialized branch maps expiry PFR to `ExpireBookingHold`.

Do not add a third “broader lifecycle” branch unless it adds a distinct validation need.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** blocking TQ-6 / AC-8.

## Q-5 — How much N:M RequirementCoverage should PT-002 demonstrate?

**Why it matters:** QRP-Q-37 is blocking schema freeze.

**Proposal:** make RequirementCoverage an explicit relation object first. Add a 1:N fixture only if a semantically natural requirement exists; do not invent artificial Features just to force every cardinality into one fixture.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** blocking QRP-Q-37, but not blocking fixes P-1..P-4.

## Q-6 — Is E04 initialization or a KEEP-capable decision?

**Why it matters:** current fixture and “KEEP at each decision point” cannot both be true without an initial design.

**Proposal:** prefer seeding a simple initial Feature Model, then make E04 a real evolution decision: KEEP the existing decomposition versus regroup requirements. This better matches the simulator’s architecture-evolution goal.

**Self-decision category:** desirable agreement.  
**Status:** non-blocking for code cleanup; blocking faithful KEEP validation.

## Q-7 — How should Stage D status be described until all projections exist?

**Why it matters:** current “Stage D implemented” can be read as stronger evidence than the app provides.

**Proposal:** mark it as “Stage D semantic slice implemented” until Widget/BusinessState/raw-event details required by the chosen PT-002 scope are present.

**Self-decision category:** high appropriateness for independent decision.  
**Status:** non-blocking.

# Review Log summary

```text
Target:
  PT-002 app + PT-002 plan/doc
  checked against r5 P-31/P-39/P-40A/P-41 as applicable

Result:
  technical runtime healthy
  semantic validation vehicle not yet ready for Stage E

Confirmed problems:
  P-1 branch event identity conflated
  P-2 replay/delta duplicate truth; observed E08 drift
  P-3 Scenario/Widget graph under-modeled; observed stale scenario relation
  P-4 non-UI existing-Feature case is only a label
  P-5 required cross-Screen Scenario missing
  P-6 N:M RequirementCoverage not validated

Uncertainties:
  U-1 comprehension awaits human Stage E
  U-2 KEEP semantics conflict with initial-decomposition fixture
  U-3 Stage D completion label may overstate scope

User assistance:
  UA-1 later human walkthrough; not needed for structural fixes

Deferred:
  D-1 visual/a11y/responsive polish
  D-2 richer code/runtime/data projections

Blocking proposals:
  Q-1 distinct branch event identities
  Q-2 canonical relations/mutations as replay truth
  Q-3 first-class ScenarioStep/Widget graph
  Q-4 genuine pre-existing Feature for non-UI trigger test
  Q-5 explicit RequirementCoverage relation before schema freeze

Limitations:
  no independent human-comprehension result
  no browser visual inspection was available in this review
```

No canonical Proposal Composition change or `VE-*` promotion is performed by this review.


# Remediation status after PT-002-R1

Applied without changing canonical `r5` or promoting `VE-*`.

## Resolved structurally

- **P-1 — resolved.** Branch-generated events now have branch-specific IDs. Shared ScenarioEvents remain shared anchors. Branch histories may have different event counts; branch switching aligns by comparison key when a counterpart exists and otherwise falls back to the shared triggering ScenarioEvent.
- **P-2 — resolved.** Replay snapshot, `THIS EVENT` delta, changed IDs and changed layers now derive from one canonical `SimulationEvent.mutations[]` ledger. The earlier separate authored delta/highlight paths were removed.
- **P-3 — resolved for the PT-002 semantic slice.** `ScenarioStep`, `Widget` and `WidgetPlacement` are first-class. Scenario requirement participation is derived from Scenario steps plus Screen/Widget ownership, so the earlier stale backlink failure is removed.
- **P-4 — resolved.** `PFR-H0` establishes `ReleaseBookingHold` before expiry exists. Later `PFR-H1` maps to that existing Feature as a variation in the shared branch, while the specialized branch creates `ExpireBookingHold`.
- **P-5 — resolved.** The customer cancellation Scenario now crosses `SearchResults` and `BookingDetails`.

## Partially mitigated / still open

- **P-6 — partially mitigated.** `RequirementCoverage` is now an explicit relation object with `requirementId`, `featureId` and `role`. The prototype exercises many-requirements -> one Feature and one-requirement -> one Feature. A natural one-requirement -> several-Features case is still not present, so TQ-4 / QRP-Q-37 stays open.

## Verification evidence

HOST verification after remediation:

```text
branch histories differ in length: PASS
global event IDs unique: PASS
branch events carry branch identity: PASS
branch-switch alignment semantics: PASS
Requirement Surface identical across controlled branches: PASS
snapshot / delta / changed IDs / changed layers derive from mutations: PASS
cross-Screen Scenario: PASS
first-class BookingActions reuse: PASS
ReleaseBookingHold exists before expiry PFR: PASS
shared expiry uses existing Feature: PASS
specialized expiry creates separate Feature: PASS
derived admin Scenario requirements include new screen requirement: PASS
separate admin plan does not fake a design mutation: PASS
explicit RequirementCoverage relation objects: PASS
TypeScript / Vite build: PASS
oxlint: PASS (0 warnings, 0 errors)
```

Stage E comprehension review remains pending. Questions U-2 / Q-6 (KEEP semantics) and the unresolved part of P-6 are intentionally left for later.
