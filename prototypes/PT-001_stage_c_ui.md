# PT-001 Stage C — Low-Fidelity React Walkthrough

## Status

```text
implemented / technical smoke passed
visual interpretation pending
```

Canonical Proposal Composition remains unchanged.

## Purpose

Render the Stage B dataset through the first executable UI projections.

The goal is not visual polish. The goal is to test whether the current event/entity semantics remain understandable when projected into an interactive interface.

## Implementation location

```text
prototypes/PT-001/app
```

Technology:

```text
React
TypeScript
Vite
```

No backend, database, authentication or generic editor is included.

## Data flow

```text
PT-001/data/stage_b.json
        ↓ npm predev/prebuild sync
app/public/stage_b.json
        ↓
React projections
```

`public/stage_b.json` is generated and gitignored.

The UI must not maintain a second manually-authored scenario history.

## Implemented projections

### Event Stream

Displays:
- all shared ScenarioEvents;
- inherited branch responses for one selected leaf branch;
- role/category/scope tags;
- relation/mutation/operation counts.

ScenarioEvent and BranchEvent remain visually distinct.

### Event Inspector

Displays one selected event with:
- identity;
- role/category/branch scope;
- relations;
- authoritative mutations;
- nested ImplementationOperations.

An event with relations but zero mutations remains representable.

### Entity Explorer

Displays for one selected semantic entity and branch:
- semantic history derived from ScenarioEvents;
- branch-related activity/mutation history;
- semantic-to-representation mappings.

### Dynamics Compare

Aligns two selected leaf branches around the same ScenarioEvents.

Shows:
- branch responses under each shared anchor;
- inherited event count;
- ImplementationOperation count;
- raw operation-type breakdown.

Stage C intentionally does not show scalar cost yet.

## Branch options

```text
BR-KK
BR-KP
BR-PK
BR-PP
```

Any two leaves can be selected for comparison.

## Derived logic

`src/model.ts` derives:
- branch ancestry;
- inherited BranchEvents;
- branch responses per ScenarioEvent;
- operation counts/type breakdown;
- entity-related branch events;
- semantic history;
- representation mappings.

No derived selector uses architecture labels as scores.

## Technical validation

### Stage B dataset validation

```text
PASS
errors: 0
warnings: 0
```

### TypeScript / Vite build

```text
PASS
vite production build completed
```

### Lint

```text
PASS
0 warnings
0 errors
```

### Runtime HTTP smoke

Local Vite dev server:

```text
http://127.0.0.1:4173/
```

Observed:

```text
HTML root available: yes
ScenarioEvents served: 8
BranchEvents served: 33
WorkEpisodes served: 11
```

## What Stage C has not validated yet

Technical execution is not the same as prototype evidence about comprehensibility.

Still requires visual/manual walkthrough:

1. Is a long vertical Event Stream readable?
2. Are ScenarioEvent anchors visually distinguishable from branch responses?
3. Does relation-vs-mutation remain understandable without explanation?
4. Does Entity Explorer separate semantic and representation history clearly?
5. Can a viewer explain why two branches differ from Dynamics Compare alone?
6. Is nested operation detail enough, or are some operations forced into top-level events?
7. Does the four-branch fixture make causal comparison clearer or too complex?

## Provisional TQ status after implementation

| Test question | Current status | Basis |
|---|---|---|
| TQ-1 Event granularity | mixed / pending visual review | operations stay nested technically; readability untested |
| TQ-2 Shared scenario anchor | supported at data + UI projection level | one ScenarioEvent rendered against multiple branch responses |
| TQ-3 Relation vs mutation | supported at data + UI projection level | inspector renders relation-only events without mutation |
| TQ-4 Semantic entity vs representation | supported at data + UI projection level | Entity Explorer projects 1:N mappings |
| TQ-5 Entity history | implemented / pending visual review | semantic/activity/mapping columns render from same data |
| TQ-6 Dynamics comparison | implemented / pending visual review | branches align on ScenarioEvent anchors |
| TQ-7 WorkEpisode | structurally supported; inspector not yet implemented | canonical refs exist, but no dedicated WorkEpisode UI yet |
| TQ-8 Raw vs scalar cost | pending | raw ops shown; scalar cost deliberately absent |

## Evidence boundary

No `VE-*` is promoted to the canonical plan yet.

Reason:

Stage C has verified executable projections but not yet completed the intended visual/consistency audit and interpretation.

## Next

```text
Stage D
1. manually inspect the running UI;
2. trace representative ScenarioEvent/BranchEvent/Entity paths;
3. record UI/model mismatches;
4. only then classify TQ results for Stage E.
```
