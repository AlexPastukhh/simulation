# PT-003 App

Disposable prototype implementation for:

```text
prototypes/PT-003_requirement_architecture_evolution_map.md
```

Candidate under test:

```text
architecture_simulator_proposal_composition_v3a_candidate_r7.md
```

## Status

```text
semantic fixture implemented
model invariant suite: pass on HOST
HOST build: pass
HOST lint: pass (0 warnings, 0 errors)
HOST production-preview HTTP smoke: pass (200)
human semantic interpretation: pending
VE promotion: none
```

## What it tests

- non-normalized Requirement Model at an Actual Event cursor;
- factual CURRENT vs immutable Plan Revision BASE;
- historical requirement knowledge at BASE;
- BRU-based architecture planning;
- full planned Architecture Snapshot per Evolution Step;
- immutable Step versions + `REVISED_FROM` lineage;
- replanning after an unforeseen requirement;
- decomposed plan disruption;
- Evolution Option trigger -> Planning Event -> concrete Step.

## Commands

```powershell
npm ci
npm run check:model
npm run build
npm run lint
npm run preview -- --host 127.0.0.1 --port 4175
```

The app is prototype evidence only. Do not promote fixture-specific BRU names, Step shapes or UI layout into canonical semantics without Stage E interpretation.
