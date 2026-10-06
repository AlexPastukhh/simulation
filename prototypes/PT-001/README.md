# PT-001 Implementation

Status: `Stage B data prepared and validated; Stage C UI not started`.

Disposable prototype implementation for PT-001.

Canonical plan:

```text
..\..\architecture_simulator_proposal_composition_v3a_candidate_r4.md
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

Stage C will add:

```text
app/
  React + TypeScript + Vite
```

The prototype code is disposable.
Validated evidence is promoted through `VE-*`; prototype implementation choices are not canonical by themselves.
