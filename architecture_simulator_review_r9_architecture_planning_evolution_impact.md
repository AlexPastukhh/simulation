# R9 — Architecture Planning Breadth / Evolution Impact / Presentation Re-check

## Status

```text
review completed
review log saved
no Proposal Composition revision performed
no semantic commit performed
```

## Target / Scope

Primary target:

- `V3A-candidate-r7`, specifically `P-40A@r6`, `P-42@r7`, `P-44@r6`, `P-47@r6` and the related QRP entries;
- the generic architecture shape currently used by `PT-003`;
- the latest proposed extension that introduced a generic `ArchitectureElement + ArchitectureResponsibility + relation taxonomy`.

Special attention requested by the user:

- do not hard-code a universal relation taxonomy merely to express architecture structure;
- check whether Architecture Planning can express architecture-native entities such as Features, DDD Aggregates, policies, shared services/helpers and their responsibilities;
- preserve non-normalized Requirement Model semantics while allowing architecture-side consolidation/reuse;
- confirm that every Evolution Step has a full target Architecture Plan/Snapshot;
- clarify how Evolution Impact should appear both on a Step and from an architecture element/responsibility looking forward through the current Evolution Map.

Out of scope:

- final evaluator/scalarization formulas;
- AST/Class/Method fidelity;
- a final universal architecture ontology;
- final visual styling;
- semantic commitment of r7 or any new candidate.

## Task Reconstruction

The intended model has one factual Requirement Model at the selected Actual Event cursor. It is deliberately non-normalized and does not deduplicate repeated requirement/rule material merely because it looks semantically similar.

Architecture Planning sees the same product material but may structure it architecturally. This includes deciding whether repeated requirement material should remain separate or be consolidated into a shared architecture-side responsibility/knowledge owner.

Examples that must be representable without changing Requirement Model truth include:

```text
Feature A ─┐
           ├─ uses shared business policy / aggregate responsibility
Feature B ─┘

Feature A ─┐
           ├─ uses shared technical helper/service
Feature B ─┘
```

The first shared element may own business rules/state/invariants. The second may be reusable infrastructure without owning business logic.

Each Evolution Step represents a transition and has a complete target Architecture Snapshot after that step. Evolution Impact explains what the transition changes. When viewing any architecture snapshot, selecting an architecture responsibility/element should make relevant past and future planned impacts discoverable.

The model should remain architecture-neutral. The simulator may need enough structure to trace responsibilities and impacts, but should not require a universal ontology of `uses / owns / depends_on / calls / reads / writes / ...` unless a later prototype proves such formalization necessary.

## Independent Re-check

### Evidence from r7

`P-40A@r6` already says Architecture Planning adds architectural organization, responsibility boundaries and reuse/grouping decisions over the same product context.

It also states that a BRU may cover multiple requirement occurrences and may be shared across contexts.

`P-42@r7` already requires every Evolution Step version to point to a **complete target Architecture Snapshot**. Therefore the semantic requirement “there is an architecture plan after every step” is already present in the plan.

`P-44@r6` already defines per-Step `EvolutionImpact` and explicitly says that selecting a target entity can expose impact history across the map. The later summary says selecting a BRU/File can show every Step that plans to impact it.

The current PT-003 implementation, however, materializes `ArchitectureSnapshot` primarily as:

```text
brus[]
dependencies[]
```

with `BehaviorResponsibilityUnit` as the concrete architecture node type. That was sufficient for PT-003's scoped BRU experiment, but it is too narrow to become the generic foundation for PT-004.

## 1. Confirmed Problems

### P-1 — BRU is too central as the generic architecture storage unit

**Goal / requirement:** represent concrete architecture choices without forcing one architecture vocabulary or one primary reasoning unit.

**Observed shape:** r7 keeps the BRU-vs-architecture-native-primary-unit question open, but PT-003 concretely stores architecture snapshots as `brus[]`. `P-40A` is also phrased strongly enough that a later implementation could continue treating BRU as the primary generic node.

**Failure condition:** PT-004 tries to represent architecture-native concepts such as:

- a DDD Aggregate that owns state and invariants;
- a shared policy that owns reusable business knowledge;
- a shared helper/service that is reusable but owns no business rule;
- a layer/module/service that is primarily structural rather than a behavior unit.

**Mechanism:** each of these is forced to masquerade as a BRU or becomes a second-class side structure.

**Consequence:** architecture-specific structure becomes distorted, implementation mapping attaches to artificial behavior units, and the simulator loses the distinction between behavioral responsibility, business-knowledge ownership and technical reuse.

**Impact:** blocking before PT-004 becomes the next generic architecture/implementation prototype.

This is not a retroactive defect in PT-003 under its original scope. PT-003 was explicitly a BRU-focused semantic fixture. It becomes a problem only if its concrete schema is inherited as the generic model.

### P-2 — Architecture-side consolidation is only partially expressed

**Goal / requirement:** keep Requirement Model non-normalized while allowing Architecture Planning to intentionally consolidate or separate repeated material.

r7 already contains the important direction:

```text
reuse/grouping belongs to Architecture Planning
BRU may cover one or many requirement occurrences
```

This supports architecture-side consolidation in principle.

The gap is that the current formulation is still behavior-centric. It does not clearly say that an architecture may introduce a shared **business knowledge/state owner** such as an Aggregate or Policy, or a shared **technical capability** such as a helper/service, without treating either one as a requirement-side normalized entity.

Concrete example:

```text
Requirement Model
  customer cancellation window rule text
  admin cancellation window rule text

Architecture A
  both trace to one CancellationPolicy / Booking Aggregate responsibility

Architecture B
  each feature keeps its own rule representation
```

Both architectures must be valid consumers of the same Requirement Model.

Without this clarification, a future implementation can incorrectly conclude that the only legal architecture-side consolidation mechanism is “many requirement occurrences -> one BRU”.

**Impact:** blocking for the next plan revision / PT-004 model shape.

### P-3 — The proposed universal relation taxonomy is unnecessary scope expansion

The latest proposal suggested a generic relation vocabulary such as:

```text
owns responsibility
uses
depends on
calls
reads/writes
implements
shares
```

That is stronger than current evidence supports.

**Goal / constraint:** architecture-neutral modeling with practical scope (`N-5`, `N-8`) and no premature universal ontology.

**Failure condition:** these relations become canonical requirements rather than fixture-local descriptions.

**Mechanism:** different architecture styles need different useful structural semantics; a universal relation graph either grows continuously or forces unrelated concepts into generic labels.

**Consequence:** scope increases, architecture-specific meaning is flattened, and PT-004 starts validating a relation ontology rather than Evolution Impact / Implementation Model.

**Impact:** current proposal should be narrowed before it is incorporated into the plan.

The existing r7 wording `ownership/dependencies` is acceptable if treated as examples of structure that may be represented, not as a mandatory closed relation schema.

### P-4 — Per-Step architecture plans exist semantically but are not discoverable enough in the UI

`P-42@r7` already passes the semantic check: every Step has a complete target Architecture Snapshot.

The current PT-003 presentation does not pass the usability check. User feedback showed that the existence of the architecture plan for each Step was not obvious without explanation.

**Mechanism:** Plan BASE, CURRENT, Step-version provenance and snapshots compete for attention in one long page. The Step-to-target-architecture relationship is present but not visually dominant.

**Consequence:** a user can understand the internal temporal model only after learning the simulator vocabulary, instead of simply selecting a Step and seeing “Architecture after this Step”.

**Impact:** blocking for the next UI iteration, but not a defect in `P-42` semantics.

## 2. Disputed / Uncertain Areas

### U-1 — Do we need a universal `ArchitectureElement` type at all?

A lightweight common envelope may eventually be useful for selection, tracing and Evolution Impact targeting.

However, the current evidence does not justify freezing:

```text
ArchitectureElement
  type = Feature | Aggregate | Service | Module | Helper | ...
```

as a closed or universal taxonomy.

A PT-004 fixture can first use architecture-native labels directly and test whether a common envelope is actually necessary.

### U-2 — “Requirement reuse” vs architecture-side reuse

The phrase “one requirement is reused in several places” is potentially misleading.

Requirement-side occurrence identity should remain factual and non-normalized.

Two different architecture-side situations must be distinguishable:

```text
one requirement occurrence influences/traces to several architecture places
```

versus:

```text
several requirement occurrences are consolidated into one shared architecture responsibility / knowledge owner
```

The second is architecture-side reuse/consolidation. Neither implies requirement-side semantic deduplication.

### U-3 — Future impact navigation through split/replace lineage

For a stable element, future impact projection is straightforward:

```text
CancellationPolicy
  S2 modified
  S4 modified
  S7 retired
```

For split/replace transitions, a later impact may target a descendant rather than the original element.

The need is real, but the exact formal lineage representation is not yet proven. It should not be solved by introducing a large generic relation system pre-emptively.

## 3. What Withstood Re-check

### W-1 — Non-normalized Requirement Model

`P-39@r6` remains sound and directly supports the user's intent.

Architecture-side structuring must not rewrite Requirement Model into canonical BusinessRule/PFR ownership.

### W-2 — Architecture-side reuse/grouping belongs on the planning side

The core r7 decision is correct. The needed change is broadening it beyond BRU-only behavior responsibility, not reversing it.

### W-3 — Full Architecture Snapshot after every Step

Already explicit in `P-42@r7` and `CDC-16@r6`.

No new semantic mechanism is needed here. The next prototype needs a clearer presentation of the existing semantics.

### W-4 — Evolution Impact is a transition/diff concept, not the snapshot itself

`P-44@r6` correctly separates:

```text
Evolution Impact = what this Step changes
Architecture Snapshot = complete target state after the Step
```

This distinction should be preserved.

### W-5 — Impact history / future impact navigation is already directionally supported

r7 already says a selected target can expose Steps that impact it.

The clarification needed is broader target scope (architecture-native items/responsibilities, not only BRU/File) and snapshot-relative presentation of past/future impacts.

### W-6 — No need to make architecture relations a mandatory ontology

Nothing in the validated need requires a closed relation set. Minimal fixture-specific structural connections are sufficient until a computational need proves otherwise.

## 4. User Assistance / Process Improvement

No additional user input is required for this review.

The screenshots and the existing r7/PT-003 source are sufficient to identify the current semantic and presentation gaps.

## 5. Deferred / Follow-up Items

### D-1 — Formal architecture relation vocabulary

**Keep:** possibility that some relations later need stable semantics for metrics, impact derivation or navigation.

**Why deferred:** no current prototype result proves which relation types are necessary.

**Return trigger:** a concrete evaluator or PT-004/PT-005 computation cannot be implemented reliably from minimal architecture structure.

**Risk if ignored after trigger:** impact derivation or metrics become inconsistent.

### D-2 — Business-knowledge vs technical-responsibility classification

**Keep:** future evaluator may need to distinguish duplicated business knowledge from shared technical machinery.

**Why deferred:** the immediate requirement is representational; no metric formula is frozen.

**Return trigger:** implementation of Knowledge Duplication (`K`) or architecture cost calculations that need this distinction.

**Risk if ignored after trigger:** a shared helper may be incorrectly treated as centralized business knowledge, or duplicated business rules may be missed.

### D-3 — Generic architecture node envelope

**Keep:** selection/inspection tooling may benefit from a minimal common identity wrapper.

**Why deferred:** PT-004 can test heterogeneous architecture-native elements without freezing a taxonomy.

**Return trigger:** repeated UI/engine logic cannot target heterogeneous architecture items cleanly.

### D-4 — Split/merge/replace lineage for future-impact projection

**Keep:** impact navigation must eventually survive non-monotonic architecture evolution.

**Why deferred:** exact representation depends on how PT-004 expresses architecture-native items.

**Return trigger:** PT-004 includes a split/merge/replace case whose later impacts cannot be explained by stable identity alone.

## 6. Questions / Proposals

### Q-1 — What replaces BRU as the generic architecture foundation?

**Question:** should Architecture Planning have a broader mandatory universal node type?

**Why it matters:** PT-004 must represent Aggregate/Policy/helper/service/module cases without forcing them into BRU.

**Proposal:** do **not** freeze a rich universal ontology now. Change the plan wording so an Architecture Snapshot may contain architecture-native elements/responsibilities appropriate to the chosen architecture. BRU remains an optional/logical behavioral-responsibility projection and may coincide with an element in some architectures but need not.

**Self-decision category:** high appropriateness for independent decision.

**Status:** blocking before PT-004 schema/model work.

### Q-2 — How should architecture-side consolidation be stated?

**Question:** how do we express shared business knowledge/reuse without normalizing Requirement Model?

**Proposal:** add one explicit semantic rule:

> Architecture Planning may intentionally consolidate, separate or duplicate representations of requirement-side material into architecture-side responsibilities/knowledge owners. This is an architectural choice and does not create semantic identity or deduplication in Requirement Model.

A requirement occurrence may trace to multiple architecture places; multiple requirement occurrences may trace to one shared architecture responsibility.

Do not call this mandatory “normalization”; call it architecture-side structuring/consolidation so keeping material separate remains equally valid.

**Self-decision category:** high appropriateness for independent decision.

**Status:** blocking for next plan revision / PT-004.

### Q-3 — How should Evolution Impact appear to the user?

**Question:** what is the minimum user-facing model?

**Proposal:**

```text
Step selected
  -> show "What changes in this Step"
  -> show complete "Architecture after this Step"

Architecture item selected inside any snapshot
  -> show impacts that already led to this state
  -> show future planned impacts from later Steps in this Evolution Map
```

The future-impact list should be derived/projected from Step impacts and snapshot evolution where possible. It does not require a universal relation ontology.

**Self-decision category:** high appropriateness for independent decision.

**Status:** blocking for PT-004 UX acceptance, non-blocking for r7 historical correctness.

### Q-4 — Do architecture connections need canonical relation types now?

**Question:** should `uses / owns / depends / calls / reads / writes` be first-class universal types?

**Proposal:** no. Permit architecture-specific structure/connections where useful, with only the minimum semantics required by the fixture. Promote a relation type only when a concrete computation/navigation need demonstrates it.

**Self-decision category:** high appropriateness for independent decision.

**Status:** non-blocking for prototype creation; blocking against premature schema freeze.

### Q-5 — How should each Step expose its Architecture Plan?

**Question:** is a separate stored “Architecture Plan” object needed per Step?

**Proposal:** no additional object. Keep the existing `P-42` semantics: each Step's complete target `ArchitectureSnapshot` **is** the architecture plan after that Step. In the UI, selecting a Step should make this explicit with a dominant `Architecture after Sx` view; selecting the final Step shows the final planned architecture.

**Self-decision category:** high appropriateness for independent decision.

**Status:** blocking for next UI iteration, not for semantic model.

## Review Log

```text
Review ID:
  R9

Target:
  r7 P-40A/P-42/P-44/P-47
  PT-003 generic architecture shape
  latest ArchitectureElement/Responsibility/relation proposal

Summary:
  Core temporal semantics and per-Step full snapshots survive review.
  The main problem is not missing per-Step Architecture Plans; it is that
  BRU is still too central as the concrete generic architecture shape and
  the current UI does not expose Step -> Architecture Snapshot clearly.

Confirmed problems:
  P-1 BRU-only generic shape is too narrow for Aggregate/Policy/helper/etc.
  P-2 architecture-side consolidation/reuse is under-specified beyond BRU
  P-3 universal relation taxonomy is premature scope expansion
  P-4 per-Step architecture plans exist but are not discoverable enough in UI

Uncertainties:
  U-1 whether any universal ArchitectureElement envelope is needed
  U-2 terminology around requirement trace vs architecture-side reuse
  U-3 formal lineage for future impacts after split/replace

User assistance:
  none required

Deferred:
  D-1 relation vocabulary only when concrete computation requires it
  D-2 business-vs-technical classification when K/evaluator needs it
  D-3 common architecture node envelope after PT-004 evidence
  D-4 split/merge lineage when the fixture needs it

Proposals:
  Q-1 broaden Architecture Planning beyond BRU; BRU becomes optional logical projection
  Q-2 explicitly allow architecture-side structuring/consolidation without requirement normalization
  Q-3 Step impact + full snapshot + snapshot-relative future-impact inspector
  Q-4 no universal relation taxonomy now
  Q-5 Step target ArchitectureSnapshot is the Architecture Plan after that Step

Blocking:
  Q-1/Q-2 before PT-004 model work
  Q-3/Q-5 before PT-004 UX acceptance
  Q-4 blocks only premature schema freeze

Limitations:
  no human usability test of a redesigned PT-004 UI has yet occurred
  no evaluator/metric implementation was reviewed
  no final heterogeneous architecture fixture (DDD/layered/service/etc.) exists yet

Governance:
  review only
  no semantic commit
  no VE promotion
```
