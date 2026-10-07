# PT-002 App

Disposable implementation for:

```text
PT-002_requirement_surface_feature_model_state_canvas.md
```

Canonical candidate under test:

```text
architecture_simulator_proposal_composition_v3a_candidate_r5.md
```

## Status

```text
Stage A-C + Stage D semantic slice implemented
PT-002-R1 structural remediation: applied
invariant suite: pass
build: pass
lint: pass
production-preview smoke: pass
Stage E interpretation: pending
VE promotion: none
```

## What this app tests

- one Requirement Surface shared by controlled branches;
- branch-specific Feature grouping;
- identical independent ProductFunctionalRequirements;
- BusinessRule reuse without forced Feature reuse;
- non-UI PFR trigger independent from Feature boundary;
- Required / Design / Current / Plan as distinct replay layers;
- planning events that do not mutate CurrentRealization;
- selected-event delta inline with accumulated state.

## Run

```powershell
npm ci
npm run dev
```

Production verification:

```powershell
npm run build
npm run lint
npm run preview -- --host 127.0.0.1 --port 4174
```

## Important

The implementation is prototype evidence, not canonical truth.

Do not promote fixture-specific Feature names, UI layout, or branch preferences into the canonical Proposal Composition before Stage E interpretation and an explicit `VE-*` record.
