# PT-005 — Single Plan, Conditional Steps, Historical Time and Contextual Fitness

**Status:** implemented candidate fixture; model/build/lint/HTTP evidence only after HOST verification; human semantic/UX validation pending; VE not promoted.

## Target and boundaries

- Candidate semantic basis: `architecture_simulator_proposal_composition_v3a_candidate_r9_delta.md` + SC-001 v4 (local candidates, not semantically committed; historical r7 remains unchanged).
- PT-003 remains historical and not reinterpreted; PT-004 historical reserved Impact/file-tree subject not silently reused. This is a new prototype lineage.
- Educational preauthored deterministic scenario; the viewer navigates, does not author or execute a plan.
- A/B/C are ordered **stages within this PT**, not new product modules and not three unrelated prototypes.

## Desired observable result

A viewer selects architecture, shared calendar date, historical Plan revision, conditional route and Evolution Step; then understands what was actually known/implemented vs predicted/planned, why routes have different consequences, how plan forecasts change and why a change requires an awkward migration or aligns with future Steps.

## Stage A — Minimal semantic spine

**Inputs:** fictional Booking SaaS cancellation requirements, shared A0, architectures A (early policy boundary) and B (handler-first), shared external opportunities, branch-local authored event histories, initial Plan R1 per architecture. Each Plan contains common and IF-conditional Step routes; testing/release-prep are non-Step planned work. B-S1 refactors code without structural architecture change.

**Checks:** `validateStageA()` and UI: two distinct conditional routes under one Plan; an optional Step is not factual execution; forecast `R-ENTERPRISE` never leaks into actual RequirementModel; selecting planned snapshots does not move factual cursor; complete architectural state after every Step; implementation effect nonempty even when architecture unchanged.

**Gate A→B:** invariant suite passes; verify the UI can distinguish Actual CURRENT, Plan BASE and one planned Step in each architecture. This is a model/technical gate only, not a claim of human interpretation acceptance.

## Stage B — Timeline, revisions, forecasts

**Extension:** shared March 15 budget signal shifts expectations; B discovers schedule delay March 22, revises Step version and completion forecast to April 9 while April 1 opportunity stays fixed. April 1 independent client opportunity is common; A is ready and signs, B misses readiness and the customer. Actual onboarding requirement appears only in A on April 2. A later renegotiates an integration deadline, preserving R1's date. Planned Change Axis salience changes under project dynamism.

**Checks:** `validateStageB()` and historical UI: same independent anchors; different branch-local Actual Events and actual requirement knowledge; immutable Plan R1 knowledge/Step refs; both forecast-date movement and genuine deadline renegotiation; a predicted event or qualitative likelihood does not resolve IF; applicable route is not automatically realized.

**Gate B→C:** Stage A + Stage B suites both pass; timeline/revision evidence reconstructible at selected date.

## Stage C — Work / migration Evolution Fitness and inspection

**Extension:** fixed qualitative authored evidence per architecture *and per route*: awkward/forced migrations, alignment with plan/axes, underlying implementation/testing/coordination work and accepted tradeoffs. Route counterfactuals are visible but never summed into one inevitable future.

**Checks:** `validateStageC()` + integrated A/B/C tests and reviewer walkthrough: no scalar winner; no penalty solely for planned migration; no fake numerical durations or likelihoods; specific reasons for scenario divergence are visible but not automatically validated by engine.

**Final gate:** all deterministic invariants plus local build/lint/HTTP checks; human UX/semantics remain independent evidence to collect before any VE or semantic promotion.

## Deferred

Automatic condition DSL, general DAG/rejoins, plan authoring, Monte Carlo, empirical time calibration, scheduler, AST/full IDE, scored Evolution Fitness and a mandatory separate EvolutionOption lifecycle.

## Implementation

`app/src/model.ts` authored scenario and invariants; `app/src/App.tsx` interactive display; `app/scripts/check-model.mjs` stage gates. No network dependency at runtime. The fictional labels, snapshots and effort/work annotations are fixture data, not universal architecture ontology.
