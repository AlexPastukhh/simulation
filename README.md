# Architecture Evolution Simulator — Start Here / Handoff

## Intended result

The goal is an interactive simulator showing **how software architecture choices evolve under real product change**, why different valid architectures behave differently, and what requirements, plans, implementation and future work are affected. It is an educational/comparative simulation, not a pattern gallery, a guaranteed architecture ranking or an IDE.

**Start with [SC-001 Candidate Desired Scenario](SC-001_desired_architecture_simulator_scenario_candidate.md)**. It states the actor's whole user journey, observable outcome, N/FR references, top-level SRUs, alternatives and open questions. It is a **candidate**, not a semantically committed specification.

## Read these sources in order

1. [SC-001 Candidate Desired Scenario](SC-001_desired_architecture_simulator_scenario_candidate.md): what the user ultimately wants.
2. [V3A candidate Proposal Composition r7](architecture_simulator_proposal_composition_v3a_candidate_r7.md): accumulated N/FRs, Proposals, groups, relations, QRP history, phases and constraints.
3. [R9 architecture/impact review](architecture_simulator_review_r9_architecture_planning_evolution_impact.md): latest critique and Q1–Q5 directions, accepted by the user.
4. [PT-003 specification](prototypes/PT-003_requirement_architecture_evolution_map.md) and [source](prototypes/PT-003/app/): technical semantic fixture, **not** approved interface design.
5. [Prototype index](prototypes/README.md): PT-001..PT-003 limitations and test status.

## Mental model

```text
Actual Event History  E1 --- E2 --- E3 --- E4 --- CURRENT
                              |
                     factual state at E
                Requirement Model (known at E)
                actual Architecture + Implementation
                Evolution Map revision available at E
                              |
                   immutable BASE of that plan
                              |
                        S1 --> S2 --> S3
                         |      |      |
                       full planned Architecture after each Step
                       and separate per-Step Evolution Impact
```

- **Actual Events are the factual time backbone**, including requirements arriving, implementation, experiments, migrations and Planning Events. A planned Step never advances actual time.
- **Requirement Model stays deliberately non-normalized.** Similar behavior or rules in two scenario/behavior occurrences do not automatically become one Feature or BusinessRule entity. Screens/Widgets exist if requirements demand them; uncertainty is allowed.
- **Architecture Planning** interprets that same requirement material differently for each architecture. It may consolidate or keep separate business rules/state, use Features, DDD Aggregates, Services, Policies or shared technical helpers. The logical BRU is a *behavior-responsibility projection*, not the universal architecture unit. Do not prematurely freeze `uses/owns/calls/reads/writes` relations.
- **Every planned Evolution Step** targets a **complete Architecture Snapshot**, not an additive patch. **Evolution Impact** explains the transition; clicking a responsibility should reveal past and future planned impacts. Architecture may migrate or replace earlier structures.
- **Evolution Map** has revision BASE/Step versions with immutable provenance. **Change Axes** are anticipated change directions; **Evolution Options** are contingent possible changes; **Actual Hot Paths** emerge from realized work.
- **Implementation** begins as a fictional factual project/file tree, not working source. Files and responsibilities need not be 1:1.
- **Comparison** must use comparable external stimuli without hindsight and show evidence of intermediate states, disruption, work/complexity and trade-offs. KEEP/inconclusive outcomes remain possible.

## UI lesson learned

PT-003's technical tests passed, but the user's screenshots showed an unintuitive dense page with excessive fine text and internal IDs. User-facing areas should be **Requirements, Evolution Map, Architecture, Implementation**, with **Actual Event History persistently accessible as the global clock**, not hidden under a separate secondary History tab. Select Step → full Architecture after Step + distinct impact. Select responsibility → current role and future impacts. Debug/lineage/IDs belong behind details, not the primary canvas. This is an **unvalidated UX proposal**, not already shipped.

## Exact current governance / state

- Plan names **V2 as committed semantic baseline**, but no tracked V2 file exists in the currently inspected checkout; do not fabricate an independently verified baseline.
- Latest plan file is **`architecture_simulator_proposal_composition_v3a_candidate_r7.md`**. It was edited **in place** after user accepted R9 Q1–Q5; commit `48bd612`. This does **not** mean a new `V3A-r8` or semantic commit exists.
- R9 review committed separately (`691c92d`), its directions accepted. It confirmed the too-BRU-centric generic shape and weak per-Step UI discoverability; it did **not** authorize a universal architecture ontology.
- PT-001/PT-002 mechanics remain useful, but PT-002's r5 normalized requirement interpretation was superseded in part. PT-003 has machine-verified model/build/lint/HTTP checks and **no VE promotion**. Human-semantic review/UX remedy remains pending.
- SC-001 is a **saved Candidate Scenario**, not a committed User Need or Fundamental Requirement update.

## What should the next chat do?

Read SC-001 and the referenced plan before proposing implementation. Confirm any material uncertainty in the desired user outcome. Then, if updating plans, create a **properly versioned candidate** (not an in-place rewrite), preserving N/FR, Proposal IDs/relations/groups, QRP lineage, review provenance and the committed/candidate boundary. For next prototype, prioritize understandable factual timeline, separate work areas, per-Step architecture plans/impacts, architecture-native responsibilities and actual file tree. Do not add an ontology/IDE or exact effort model without a concrete need.

**Working method:** heavy work on a local snapshot/workspace; via the user-provided TUNNEL APP obtain authoritative HOST state, synchronize finished changes after conflict check, then verify with CLI/tests. Do not use Remote Desktop Commander or automate the user's Windows desktop GUI without explicit permission. A Git commit of candidate docs is **not** semantic plan commit.
