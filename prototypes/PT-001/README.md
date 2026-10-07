# PT-001 Implementation

Status: `Stage C UI implemented; build/lint/runtime smoke passed; later replay-shell UX experiment exists; formal PT-001 interpretation / VE promotion pending`.

Disposable prototype implementation for PT-001.

Original canonical candidate under test:

```text
..\..\architecture_simulator_proposal_composition_v3a_candidate_r4.md
```

Do not retarget PT-001 retroactively to r5.

R6/r5 requirement-surface and branch Feature Model questions continue in:

```text
..\PT-002_requirement_surface_feature_model_state_canvas.md
```

Prototype specification:

```text
..\PT-001_event_entity_walkthrough.md
..\PT-001_stage_a_fixture.md
..\PT-001_stage_b_branch_events.md
```

## Current layout

```text
PT-001/
  data/
    stage_b.json
    stage_b_validation_report.md
  tools/
    enrich_stage_b.py
    validate_stage_b.py
```

Stage C implementation:

```text
app/
  React + TypeScript + Vite
  src/model.ts
  src/App.tsx
  scripts/sync-data.mjs
```

Run:

```text
cd app
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

The dev/build lifecycle syncs `../data/stage_b.json` into generated `public/stage_b.json`.

The prototype code is disposable.
Validated evidence is promoted through `VE-*`; prototype implementation choices are not canonical by themselves.
