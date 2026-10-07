# Architecture Evolution Simulator — Review / User Clarification R8

## Identity / provenance

Review ID: `R8`

Primary target:

`V3A-candidate-r6 — architecture_simulator_proposal_composition_v3a_candidate_r6.md`

Source:

direct user clarification after review of r6 before PT-003.

Order:

`R8` is later than `R7` and targets `r6` directly.

Scope:
- meaning of `CURRENT`;
- immutable base of a historical `EvolutionMapRevision`;
- no-hindsight requirement knowledge when inspecting an old plan revision;
- identity/versioning of `EvolutionStep` across plan revisions;
- preservation of plan-revision history for plan-disruption analysis.

Limits:
- no new `VE-*` evidence;
- no change to Requirement Model / BRU / Evolution Impact semantics from R7;
- no decision on ordered-path vs general DAG;
- no decision on Class/Method implementation fidelity;
- no new metric formula.

---

# 1. Confirmed problems in r6

## R8-P-1 — `CURRENT` is ambiguous inside historical plan revisions

`P-42@r6` draws:

```text
CURRENT -> S1 -> S2 -> ... -> Sn
```

and calls `CURRENT` a factual reference point.

That is adequate only while the selected plan revision is the active plan and its base still coincides with the actual cursor being viewed.

After actual implementation progresses or a new plan revision is created, opening an older plan makes `CURRENT` ambiguous:
- actual architecture now;
- or the factual architecture from which that old plan was originally built.

If the left anchor silently moves with actual time, historical plan truth is rewritten.

## R8-P-2 — Historical plans need an immutable factual base / knowledge cursor

A stored `EvolutionMapRevision` must remain reconstructable under the factual state and knowledge available when that revision was created.

If requirement R5 becomes known after Plan R1 was created, opening R1 must not make R5 look known to R1.

This is required by no-hindsight semantics.

## R8-P-3 — Evolution Step identity across plan revisions is underspecified

If Plan R1 contains `S3`, then replanning mutates `S3` in-place, Plan R1 is retrospectively changed.

Conversely, treating every repeated step in a new plan as unrelated destroys useful lineage.

The model needs to distinguish:
- same conceptual planned intention;
- same exact immutable version of a step.

---

# 2. User-confirmed semantic decisions

## R8-U-1 — CURRENT is factual architecture at an Actual Event cursor

`CURRENT` means:

> the factual realized architecture at the selected point in Actual Event History.

It is not an Evolution Step.

For the active plan UI, `CURRENT` may be a convenient label when the plan's base is the selected/current actual state.

## R8-U-2 — Every EvolutionMapRevision has an immutable BASE

A plan revision records the factual point from which it was built.

Preferred core references:

```text
EvolutionMapRevision
  based_on_actual_event_ref
  base_architecture_snapshot_ref
  step_version_refs[]
```

The Requirement Model for historical planning analysis is reconstructed at `based_on_actual_event_ref`; later knowledge does not leak backward.

A separate duplicated requirement-knowledge pointer is not required if the Actual Event cursor deterministically reconstructs known requirement state.

## R8-U-3 — BASE and ACTUAL CURRENT are different concepts

Example:

```text
Plan R1 created at E10
BASE = A0
A0 -> S1/A1 -> S2/A2 -> S3/A3

Later actual state = A1
```

R1 remains based on A0.

The UI may additionally show that actual progress has reached A1, or present a convenience projection of the remaining active plan:

```text
CURRENT A1 -> remaining S2 -> S3
```

but that projection must not mutate historical R1.

## R8-U-4 — Evolution Step versions are immutable

A conceptual step may continue across plan revisions, but an exact step version is immutable.

If unchanged:

```text
R1 -> STEP-AUDIT@v1
R2 -> STEP-AUDIT@v1
```

If its impact/dependencies/target snapshot change:

```text
R1 -> STEP-POLICY@v1
R2 -> STEP-POLICY@v2
      REVISED_FROM STEP-POLICY@v1
```

The exact storage shape may use `lineage_id + version_id`, immutable objects with `REVISED_FROM`, or an equivalent representation, but must preserve both continuity and historical truth.

---

# 3. Consequences for plan-disruption analysis

These clarifications make plan resilience structurally observable.

After an unexpected Actual Event and replanning, the simulator can distinguish:
- step versions reused unchanged;
- revised step versions;
- removed/cancelled future steps;
- newly inserted steps;
- changed target snapshots;
- changed prerequisite relations.

This allows plan disruption to be explained without relying on a hidden score.

---

# 4. Proposal / QRP consequences

Candidate revisions required:
- `P-31` dual Actual/Planned workbench: distinguish ACTUAL CURRENT from historical plan BASE;
- `P-41` current/planned state semantics: add plan-base semantics;
- `P-42` Evolution Map: replace stored `CURRENT` anchor with immutable `BASE` on the revision;
- `P-43` Plan Revision History: define immutable revision base and versioned step lineage.

Candidate constraints:
- historical plan revision base is immutable;
- step versions are immutable and lineage-preserving.

New QRP problems:
- historical plan BASE/CURRENT ambiguity;
- step identity/version mutation across revisions.

Both are candidate-mitigated by this revision and should be tested in PT-003.

---

# 5. Prototype implication

PT-003 should include at least:

1. Plan R1 created from actual architecture A0 with requirements known at that actual cursor.
2. Actual execution progresses to A1 while R1 remains historically based on A0.
3. A later unexpected requirement appears.
4. Replanning creates R2 from the then-current factual architecture.
5. At least one future step version is reused unchanged.
6. At least one future step is revised into a new immutable version with lineage to the prior version.
7. Opening R1 after R2 exists still shows R1's original BASE, requirement knowledge and step versions.

No PT-003 implementation is performed by this review.

---

# 6. Review conclusion

The preferred semantics are:

```text
Actual Event cursor
  -> CURRENT factual architecture

EvolutionMapRevision
  -> immutable BASE factual event/snapshot
  -> immutable EvolutionStep versions
  -> lineage across revisions when a conceptual step continues
```

`CURRENT` is a view of factual history.
`BASE` is a stored anchor of a particular plan revision.
A plan revision never rewrites its base, requirement knowledge or step versions after later Actual Events/replanning.

These are candidate changes only until an explicit semantic composition commit.
