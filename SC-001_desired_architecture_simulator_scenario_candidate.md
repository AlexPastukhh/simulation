# SC-001 — Architecture Evolution Simulator: Desired User Scenario

**Version:** SC-001@v0-candidate
**Status:** CANDIDATE, not semantically committed
**Source:** direct user discussion through R9 + existing N-1..N-13 and FR-1..FR-28 in V3A-candidate-r7.
**Scope:** intended end-user outcome of the simulator, not one Booking SaaS prototype and not a final implementation schema.
**Normative warning:** N/FR below restate existing plan references; new user-facing assertions marked *candidate interpretation* until expressly approved as Scenario.

## 1. Need / Goal

**Primary candidate Desired Need (derived from N-1, N-2, N-3, N-6, N-11, N-12):**
I want to **see, understand and compare how different software architectures behave as a product actually evolves**, not just view a static diagram of architecture patterns. I should be able to explain *why* one choice helps or hurts under concrete evolving requirements, planning, implementation and work consequences, without a predetermined winner.

The simulator should make changes, uncertainty, intermediate architectures, architecture decisions, migration, reuse, implementation effects and the quality/cost of future work tangible. This is an explanatory and comparison instrument, not a tool that must automatically write the simulated application or guarantee a single best architecture.

## 2. Fundamental Requirements already described by the plan

These are **references**, not newly committed FRs:

- **FR-1/2/3/4/6/7/11/12:** neutral problem context and architecture alternatives, Feature ≠ Vertical Slice, visible evidence rather than hidden architecture scoring.
- **FR-5/8/9:** separate observed, required and forecast; no hindsight; knowledge known earlier can influence planning.
- **FR-13/15/20:** KEEP is a valid decision, raw impact inspectable, event/entity-state history first-class.
- **FR-16..25:** sequence/time, actual event truth, work dynamics and quality proxies must not be collapsed.
- **FR-26/27/28 (candidate in r7):** non-normalized requirements; one Requirement Model per factual cursor; actual events and planned Evolution Steps are distinct truths.

**Candidate scenario acceptance conditions, not additional committed FRs:**
The main factual timeline must remain visible/accessible as the simulation clock. Requirement Model, actual architecture, actual implementation and available plan revision must respect the same factual cursor. Each planned Step must expose both its impact and full resulting Architecture Plan. A selected architecture item should expose future planned impacts. Core information must be understandable without first learning debug IDs.

## 3. Desired Scenario (one non-recursive user journey)

**Actor:** I — a user exploring architecture alternatives (not necessarily an architect by profession).
**Context:** I open a simulation case with an application/product context, initial requirements and at least one architecture branch; meaningful Actual Events may already be present.
**Inputs:** project context; actors/goals/scenarios and requirement material; architecture alternatives; actual events; planning choices; changes in knowledge and requirements, possibly unforeseen.
**Preconditions:** enough seeded scenario data to demonstrate causal differences; provenance is preserved; incomplete information is explicitly incomplete.

1. **Orient.** I open the case and can immediately identify the global **Actual Event History**, the selected factual point and available architecture alternatives. I do not need a guide to locate the major views.
2. **Inspect what was known.** I select an Actual Event and open the **Requirement Model** for that factual moment: actors, goals, scenarios, free-form behaviors/acceptance, explicit screens/widgets if required, ambiguities and experiments. Similar occurrences remain separate; architecture reuse is not presupposed.
3. **Inspect what exists.** At the same factual point I can inspect the **actual architecture** and **current fake implementation/project file tree**, with meaningful responsibility-to-file navigation and links to relevant factual changes. If I chose a historical event, the view clearly says "actual after E..." rather than incorrectly "now".
4. **Inspect what was planned then.** I open the active **Evolution Map revision as it existed at this Actual Event**. I see its immutable planning BASE, remaining/planned Steps, **Change Axes** and contingent **Evolution Options**, without future knowledge leaking into the past.
5. **Explore every planned intermediate architecture.** I select S1, S2, ... or final Step and see **Architecture after Sx**, a complete target snapshot, not just a delta. I also see **What changes in Sx** (Evolution Impact) and requirement coverage relative to this stage. Steps may migrate, replace or remove previous structure.
6. **Follow one responsibility through time.** I click a Feature, Aggregate, Policy, Service, BRU projection or other meaningful architecture-native item. I learn its role, relevant requirement material, what affected it previously and **which later Steps plan to affect it**. Shared business knowledge and shared technical helpers can be represented without assuming they are the same. Technical relations and IDs appear only on demand.
7. **Observe real evolution and replanning.** I move the global Actual Event cursor forward. An unforeseen requirement, implementation or experiment may change factual state. A **Planning Event** can create a new plan revision, while old BASE/Step versions remain unchanged; I can compare planned vs actual progress, revisions, insertions, cancellations and migrations.
8. **Compare alternatives.** I inspect the same external stimuli/requirements in different architecture branches. I can see differences in work and evolution: what changes where, whether dependencies/rework/migrations are local or broad, how plans are disrupted, what complexity was carried earlier, what optional future change was enabled and which trade-offs mattered. I can trace any qualitative or quantitative conclusion to inspectable evidence.
9. **Form an explanation.** I can state which architecture I prefer **for these requirements, uncertainties and assumptions**, why, and under which circumstances that choice would change. The tool must also allow an inconclusive result if evidence is insufficient.

**Observable outcome:** I can reproduce a coherent causal walkthrough from requirement/event → plan and architectural choice → intermediate architecture/implementation impacts → actual response and work/evaluation, comparing alternatives without hindsight or architecture-label bias.

## 4. Scenario efficiency

No mandatory wizard, mandatory tutorial, manually authored duplicate Requirement Models per Step, exhaustive ontology or per-file code editing is needed to reach that outcome. A small seeded case + readable views + an evidence-driven comparison is the sufficient validation path. Larger/fancier simulations and detailed source-code sketches may be later extensions.


**Scenario operation cost:** Navigation between factual time, planned Step, architecture and file should not require learning internal IDs. Detailed trace and provenance should be available on demand. The user should not need to manually reconstruct a Step's full architecture from scattered cards.

**Realization/delivery cost:** Start with a small seeded fixture and readable workbench. Simulated executable source, a universal ontology, accurate hour estimates and complex evaluators are not prerequisites for the first useful validation.

**Lifecycle/option cost:** Allow later refinement of architecture-specific structure and fidelity. Do not introduce large rigid schemas merely for hypothetical cases. No deadline, resources or reliable quantitative estimates were supplied.

## 5. Top-level Scenario Realization Composition

These are top-level realization units, not nested scenarios, app modules or specific classes.

| ID | Contribution to the Desired Scenario | Success criterion |
|---|---|---|
| **SRU-1 Factual time and replay** | Actual Event History is the global simulation clock. Events determine known requirements, actual architecture, implementation and plan revisions without hindsight. | Selecting E reliably reconstructs factual state and available plans at E. |
| **SRU-2 Requirement understanding** | Separate non-normalized Requirement Model for the selected factual moment: actors, goals, scenarios, behavior/acceptance, explicit screens/widgets and uncertainty. | Similar requirement occurrences remain separate unless the requirements explicitly establish identity. |
| **SRU-3 Architectural interpretation** | Full factual and planned architectures in the selected architecture's own vocabulary: Feature, Policy, DDD Aggregate, Service, BRU projection and more where applicable. | Alternative architectures can make different valid choices about consolidation, reuse and state ownership without changing requirement facts. |
| **SRU-4 Planned evolution** | Evolution Map, immutable revisions/BASE/Step versions, full architecture after every Step, separate Evolution Impact, Change Axes, Options and replanning. | Selected S shows its complete planned architecture and distinct changes; a selected responsibility reveals future planned impacts. |
| **SRU-5 Implementation projection** | Fake project/file tree for actual state, architecture-to-file navigation and optional future file-level impact guidance. | One can see what is actually implemented and which files are planned to change without an IDE simulation. |
| **SRU-6 Comparative evidence** | Controlled/adaptive branch comparison, intermediate costs, change locality, work dynamics, migrations, plan disruption and uncertainty. | User can explain a conditional preference or an inconclusive result from inspectable evidence. |
| **SRU-7 Accessible simulator workbench** | Persistent global factual time and easily discoverable Requirements, Evolution Map, Architecture and Implementation areas with contextual inspectors. | Key journey is understandable without reading a technical guide or debug ontology first. |

**Inputs/dependencies:** SRU-1 underlies time-dependent views; SRU-2 informs SRU-3/4; SRU-3 and SRU-4 inform SRU-5/6; SRU-7 makes all of them usable. This is a conceptual realization composition, not a required code-level dependency graph. Do not count a parent SRU and its future child tasks twice.

## 6. Alternatives / Proposals

- **SC-PR-1 (candidate selected; user discussion):** one global Actual Event cursor, plus a local hypothetical cursor inside the active Evolution Map. **Review priority HIGH; decision autonomy HIGH.** Distinguishes factual and planned time without hiding the actual history.
- **SC-PR-2 (candidate selected; accepted assistant UX direction):** selecting a Step opens a complete **Architecture after Sx** and its own **What changes in Sx**; selecting an architecture item shows past and future impacts. **HIGH / HIGH.** Still needs usability evidence.
- **SC-PR-3 (candidate selected; accepted R9 direction):** architecture-native responsibilities and optional consolidation; BRU is not a mandatory universal node; no fixed relation ontology. **HIGH / HIGH.** Some automatic analyses may await later minimal relation semantics.
- **SC-PR-4 (candidate selected; existing staged preference):** fake file/project tree first, class/method/real-source detail later only if justified. **NORMAL / HIGH.**
- **SC-PR-5 (not selected, deferred):** full universal architecture ontology and deep source-code simulation from the start. Larger delivery/lifecycle complexity and weak proof of current value. **HIGH / HIGH** to defer.

**Qualitative cost/timing delta:** staged, file-first workbench is smaller than full IDE/AST simulation, with lower up-front scope but lower code fidelity. No evidence supports numeric hours, deadlines, buffer or probabilistic feasibility. Candidate choices are compatible; no new hard dependency/conflict is asserted.

## 7. Unresolved decisions / deferred items

- Exact end-user audience and visual design: non-blocking; the first prototype should test real discoverability.
- Evolution Map ordered path with prerequisites versus generic DAG: non-blocking; start simple until a fixture requires more.
- Formal lineage of architecture-native items after split/merge; common ArchitectureElement wrapper; canonical relation types: non-blocking pending evidence.
- Cost scalarization/effort calibration and class/method fidelity: later, keeping raw impact/evaluation transparent.
- PT-003's semantic fixture passed automated checks, but the screenshots showed a dense UI requiring a guide. **Human UX acceptance is not complete**; this makes SRU-7 important for the next iteration.

## 8. Candidate state / provenance

**Candidate version:** SC-001@v0-candidate. **Transaction:** OPEN. Saving this document is not semantic commit and creates no new committed Need/FR.

This is a synthesized interpretation of the user's desired simulator; it must be checked against the User Need and FR references rather than replacing them. Earlier PT-001/PT-002 semantics have known limits; PT-003 has no formal VE promotion.

At synthesis, latest plan file is `architecture_simulator_proposal_composition_v3a_candidate_r7.md`; its wording was modified in place after R9 approval at commit `48bd612` without creating a new r8 file. It still describes candidate planning. The committed V2 baseline is referenced there but its original file is not tracked in the current repository.

Next: user may approve/correct this Candidate Scenario; a subsequent revision of the full plan must retain version lineage, QRP, Needs/FRs, Proposal relations and exact candidate/committed statuses.
