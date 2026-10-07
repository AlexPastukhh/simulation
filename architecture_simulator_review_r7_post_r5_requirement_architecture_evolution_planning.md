# Architecture Evolution Simulator — Review / User Clarification Consolidation R7

## Identity / provenance

Review ID: `R7`

Primary target:

`V3A-candidate-r5 — architecture_simulator_proposal_composition_v3a_candidate_r5.md`

Source:

the user clarification sequence after `V3A-candidate-r5`, including the discussion after PT-002 remediation and before this candidate update.

Order:

`R7` is later than `R6` and targets `r5` directly. It does **not** retarget R6 to r5 and does not rewrite R6 history.

Scope:

- Requirement Model semantics;
- relation between Requirement Model and Architecture Planning;
- Behavior Unit vs architecture-side behavior responsibility;
- Actual Event History vs planned Evolution Map;
- Evolution Step / Architecture Snapshot semantics;
- replanning and plan revisions;
- known uncertainty and optional evolution;
- change axes / actual hot paths;
- Evolution Impact and forward consistency;
- implementation representation through a fake project/file tree;
- code-facing evolution guidance.

Limits:

- no empirical calibration;
- no final metric formula;
- no claim that file/class-level implementation modeling is already validated;
- no `VE-*` promotion;
- no semantic composition commit.

---

# 1. Confirmed problems in r5

## R7-P-1 — Requirement Surface is still over-normalized

`P-39@r5` requires a fairly rigid ontology around `ScreenRequirement`, `WidgetRequirement`, `ProductFunctionalRequirement` and canonical `BusinessRule`.

The user clarified that the Requirement Model is intentionally **not normalized**.

It may contain Actors, Goals, Scenarios, Steps, text requirements, acceptance criteria, expected behavior, Behavior Units, Screens/Widgets when explicitly required, constraints, ambiguity, variants and experiment notes without forcing ownership or normalization relations between them.

A requirement may remain plain text in context. Repetition is valid. Similar or identical requirement-side behavior does not imply shared semantic identity.

## R7-P-2 — Architecture Planning was modeled too much as a different ontology

The user clarified that Architecture Planning may contain essentially the same product context as the Requirement Model:

- Actor;
- Goal;
- Scenario;
- Step;
- requirement text / acceptance;
- Behavior;
- Screen / Widget where applicable.

The distinction is not “requirements entities here, architecture entities there”.

Architecture Planning adds architectural structure:

- behavior responsibilities;
- responsibility boundaries;
- reuse/grouping;
- ownership;
- dependencies;
- chosen UI structure where requirements left it open;
- implementation/runtime/data mappings;
- planned evolution.

## R7-P-3 — Requirement Model must not be copied across Evolution Steps

The current Requirement Model at an actual-history cursor contains **all requirements known at that actual moment**.

If R1..R5 are known now, Evolution Step S1 must not pretend that only R1..R2 exist merely because only they are implemented by S1.

Evolution Steps distribute planned architectural coverage/realization, not requirement truth.

A new Actual Event may later reveal R6; then the Requirement Model changes and the future Evolution Map may be replanned.

## R7-P-4 — Feature is too strong as the universal architecture-side unit

The preferred neutral architecture-side unit is a `Behavior Responsibility Unit` (BRU):

> a logical architecture responsibility for behavior.

`Feature` is a possible specialization/view, not the universal canonical unit and not a synonym for Vertical Slice.

In a layered architecture a functional “feature” may be a useful logical trace through layers without being a physical slice or primary physical unit.

The future question “what is the primary reasoning/planning unit of this architecture?” may itself become an architecture dimension, but is not frozen here.

## R7-P-5 — TeamPlan is insufficient for planned evolution

A task list does not represent the planned architecture.

Evolution planning needs:

```text
CURRENT -> S1 -> S2 -> ... -> Sn
```

where each selected step exposes a **full planned Architecture Snapshot after that step**.

Snapshots are not monotonic additive states. Responsibilities and structures may appear, disappear, split, merge, move, be replaced, be temporarily duplicated or retired.

The final step is not a privileged separate “Architecture Plan”; it is just the current last target snapshot.

## R7-P-6 — Actual history and planned evolution need separate semantics

An `Actual Event` is a factual occurrence.

An `Evolution Step` is a planned transition plus target architecture state.

They may use analogous navigation/time-travel UX, but are not the same type of truth.

One Evolution Step may later be realized by multiple Actual Events: implementation, migration, verification, deployment, etc.

## R7-P-7 — Replanning must be first-class history

When an unexpected Actual Event changes requirements or knowledge, the plan may change.

The simulator should preserve:

```text
plan before event
-> new actual event / new knowledge
-> planning/replanning event
-> plan revision after event
```

Plan revision is itself factual history and is important for no-hindsight analysis, planning quality and plan-flexibility evaluation.

## R7-P-8 — Known uncertainty needs prepared evolution without pretending it will happen

Besides planned Evolution Steps, the model needs **Evolution Options** / contingent steps.

An option represents a prepared transition that may become a real step if a known uncertainty resolves a certain way.

Sources may include:
- explicit requirement uncertainty/experimentation;
- likely external or technical change;
- architecture/design/implementation uncertainty introduced by a current choice.

An option should not be a fixed future snapshot if it may be inserted later. It is better represented as a transition template, applicability/trigger and expected impact.

## R7-P-9 — Change Axis, Hot Path and Evolution Impact need separate roles

The user narrowed terminology:

- `Planned Change Axis` — where repeated change is expected;
- `Actual Hot Path` — the corresponding axis/area observed in actual change history;
- `Evolution Impact` — the concrete effect of one Evolution Step or actual change on responsibilities / implementation artifacts.

The earlier use of “hot area” for a single change's touched entities was incorrect; that is Evolution Impact.

## R7-P-10 — Planned impacts need cross-step consistency

Each Evolution Step may have Evolution Impact on existing/new responsibilities and implementation artifacts.

For a given BRU or file, the simulator should be able to aggregate all steps that plan to impact it.

Planning should check that impacts remain coherent across the whole known Evolution Map.

Responsibility-plan changes are explicit Evolution Steps and trigger re-check of later planned snapshots.

Implementation changes can be local, but when a local code change is not already represented by planned impact, it should be checked against known future impacts.

## R7-P-11 — A concrete Implementation Model is missing

The simulator should be able to represent a fake codebase/project tree:

```text
src/
  ...
```

Files are the preferred MVP implementation artifact.

BRU-to-file mapping may be N:M.

Files may be created, moved, split, merged, replaced or removed through evolution.

This makes locality, blast radius, migration and repeated change concrete without requiring a full AST/IDE model.

## R7-P-12 — Evolution plan should be visible where implementation work happens

For a file, a developer-facing projection may show future Evolution Steps that plan to impact that file.

This can be visualized as generated comments, side-panel references or target sketches.

The canonical truth is not the comment; it is:

```text
EvolutionStep -> EvolutionImpact -> ImplementationArtifact
```

Optional `ImplementationGuidance` may describe:
- intended general change;
- constraints to preserve;
- a future target sketch/file.

This is a candidate mechanism and needs prototype validation before being treated as a proven workflow.

---

# 2. Corrections to R6-era conclusions

## R6-P-4 / R6-U-3 — narrowed and partially invalidated

The useful part remains:

> do not let requirement correctness depend on branch architecture.

The earlier remediation “requirements should normally be owned by Screen/Widget/PFR rather than Scenario” is too normalized.

R7 correction:

> Requirement Model does not require a mandatory ownership graph for acceptance/behavior/requirements.

A Scenario can provide context, but nothing must be normalized into `ScenarioRequirement`, `ScreenRequirement`, `WidgetRequirement` or `ProductFunctionalRequirement` merely to fit the model.

## R6-P-9 — superseded as requirement-side modeling guidance

“BusinessRule reuse != Feature reuse” was directionally useful, but a canonical shared requirement-side `BusinessRule` is no longer preferred.

Rule text may simply repeat in requirement contexts.

If architecture chooses a shared policy/responsibility, that reuse is expressed in Architecture Planning.

## R6-Q-1 / QRP-Q-37 — reframed

The old blocker:

`ProductFunctionalRequirement <-> BranchFeature N:M`

is no longer the schema-freeze question.

The remaining useful question is broader:

`Requirement occurrence / Behavior Unit occurrence <-> Behavior Responsibility Unit / implementation realization`

Traceability may be N:M, but requirement occurrences are not deduplicated semantic identities.

## R6-Q-2 / QRP-Q-39 — superseded

Direct `Screen/Widget <-> BusinessRule` ownership is no longer a central requirement-model question.

## P-41@r5 / QRP-GQ-6 — superseded

`RequiredProductSemantics / BranchFunctionalDesign / CurrentRealization / TeamPlan` is too rigid.

R7 replaces it with:
- Requirement Model at actual cursor;
- factual Current Architecture / Implementation state;
- Evolution Map revisions;
- planned Architecture Snapshot per Evolution Step;
- optional implementation planning/guidance.

---

# 3. User-confirmed semantic decisions

The following are treated as direct user clarifications, not review recommendations:

1. Requirement Model is intentionally non-normalized.
2. Requirement Model contains all requirements known at the selected actual-history point.
3. Requirement Model is not distributed/copy-owned by Evolution Steps.
4. Architecture Planning may show the same product context plus architectural organization.
5. `Behavior Unit` is the requirement-side functional occurrence term when such a unit is useful.
6. `Behavior Responsibility Unit` is the preferred neutral architecture-side responsibility term.
7. `Feature` is a possible specialization/view of BRU, not Vertical Slice and not necessarily a physical unit.
8. Current architecture is factual; Evolution Steps are planned.
9. Every Evolution Step has a full target Architecture Snapshot.
10. Planned architecture snapshots may be non-monotonic.
11. Replanning and plan revisions are important simulation events.
12. Unknown future requirements are not inserted into the plan; known uncertainty can create Evolution Options.
13. Planned Change Axis and Actual Hot Path are planned/observed forms of the same change-direction idea.
14. Evolution Impact is the concrete impact of one step/change and is inspectable per step and per target.
15. A fake file tree is the preferred first concrete implementation projection.
16. File-level future impact guidance/comments are a plausible workflow mechanism, but require validation.

---

# 4. Open questions / risks

## R7-Q-1 — BRU as canonical logical unit vs primary architecture-native planning unit

Current candidate direction:
BRU is a logical behavior-responsibility projection that can exist across layered/module/service structures.

Open:
whether some architectures should expose another primary planning/reasoning unit and treat BRU only as a functional projection.

Status: non-blocking; future architecture-axis/prototype question.

## R7-Q-2 — Implementation fidelity

Preferred first slice:
`File` / project tree.

Open:
when to add Class/Method/target-source fidelity.

Status: non-blocking; validate file-level usefulness first.

## R7-Q-3 — Exact graph semantics of Evolution Map

Candidate:
ordered steps plus prerequisite edges.

Open:
whether the core model should become a general DAG rather than an ordered map with dependency edges.

Status: non-blocking for first prototype.

## R7-R-1 — Speculative option explosion

If every imaginable future becomes an Evolution Option, no-hindsight discipline and practical scope are lost.

Mitigation:
options require known uncertainty/rationale at the current actual cursor and must keep provenance.

## R7-R-2 — Forward-consistency overfitting

Checking code against all known future impacts is useful, but can turn the roadmap into an excuse for premature complexity.

Mitigation:
the simulator must still price present complexity and allow planned migration to beat upfront generalization.

## R7-R-3 — Fake-code model scope drift

A file tree can make implementation consequences concrete, but class/method/IDE fidelity can overwhelm the architecture simulator.

Mitigation:
file-first, optional target sketches, no AST-level model until evidence requires it.

---

# 5. Prototype implication

PT-002 remains useful evidence for:
- branch-event identity;
- canonical mutation ledger;
- replay/delta derivation;
- first-class ScenarioStep/Widget mechanics;
- branch comparison shell.

PT-002 does **not** validate the R7 Requirement Model / Architecture Planning / Evolution Map semantics.

Per P-38 governance, the new semantic direction should use a new prototype lineage rather than retroactively retarget PT-002.

Candidate next prototype:

`PT-003 — Requirement Model / Architecture Planning / Evolution Map`

A later focused prototype may test:

`PT-004 — Evolution Impact / fake code tree / implementation guidance`

No `VE-*` is promoted by R7.

---

# 6. Review conclusion

R7 changes the preferred conceptual center from:

```text
Requirement Surface
-> Branch Feature Model
-> CurrentRealization / TeamPlan
```

to:

```text
Actual Event History
        |
        v
non-normalized Requirement Model
(all requirements known now)
        |
        +-------------------------+
        |                         |
        v                         v
Architecture A Planning      Architecture B Planning
CURRENT                     CURRENT
S1 target snapshot          S1 target snapshot
S2 target snapshot          S2 target snapshot
...
```

with:
- BRUs as logical behavior responsibilities;
- Evolution Impacts on responsibilities and implementation artifacts;
- plan revisions as factual planning events;
- Evolution Options for known uncertainty;
- planned Change Axes vs Actual Hot Paths;
- a file-tree Implementation Model as the first concrete implementation projection.

These are candidate changes only until an explicit semantic composition commit.
