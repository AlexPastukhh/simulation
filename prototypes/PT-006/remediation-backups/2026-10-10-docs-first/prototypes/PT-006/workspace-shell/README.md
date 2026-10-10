# PT-006 · Architecture Simulator Workspace — content inventory prototype

**Status:** working UI prototype, not simulation engine or semantically committed product model. Built against the `SC-001@v4-candidate` and `V3A-candidate-r9-delta` interpretation, plus the earlier Workspace discussions. Candidate documents and the in-app fixture are not promoted to a committed baseline.

## Launch and verify (Windows)

```powershell
cd C:\Users\alexa\simulation\prototypes\PT-006\workspace-shell
npm run dev -- --port 4196 --strictPort
npm test
npm run build
npm run lint
```

Open http://127.0.0.1:4196/ .

## All 18 window content types

| Content type | Role |
|---|---|
| Scenario / Context | Same initial app, shared constraints and exogenous scenario anchor |
| Actual Events | Branch-local factual events and selected factual cursor |
| Current State | Factual Requirements / Architecture CURRENT / files at the selected archived event |
| Requirement Model | Factually known, intentionally non-normalized requirements at selected event cursor |
| Architecture | Existing compact combined diagram/snapshot preview, retained for later merge decision |
| Architecture Planning | Complete planned target ArchitectureSnapshot for the selected conditional Step |
| Plan | One PlanRevision: BASE, conditional Steps, deadlines, forecasts, axes and intended implementation effects |
| Forecasts / Deadlines | Projected event/demand and conditional route selection, not factual events |
| Planned Change Axes | Future-facing expected directions, separate from actual hot paths |
| Actual Hot Paths | Observed repeated changes, separate from forecast axes |
| Evolution Impact | Per-Step/route architecture/file impact, not a full snapshot |
| Impact History / Future | Actual CURRENT/file changes from archived transitions plus route-qualified planned future impacts |
| Evolution Fitness | Migration, plan alignment, separate costs and cited fixture evidence, no hidden scalar |
| Implementation / Files | Event-linked actual file tree, earlier versions and separate planned file effects |
| Requirement / Implementation Trace | Requirement–architecture–file links; trace projection does not normalize requirements |
| Event / Entity Explorer | Event → newly known requirements and before/after State changes |
| Cross-Architecture Comparison | Same shared event and branch-specific consequences in text; not two architecture diagrams side-by-side |
| Work Dynamics / Hot Paths | Work episodes and hot-path evidence, retained combined for possible future split/merge |

All content types have an independent `State` slice and possible `JSON Schema` exposed via the global header inspector or panel-edge buttons, whether or not an instance is on-screen. **For projection types** (such as Forecasts, Current State or Impact History), their own editable State describes selection/view settings, while the same inspector also exposes expandable **canonical source State and JSON Schemas** for all underlying data rendered in the view. This avoids copying Plan or Events objects into a second supposed truth. Primitive objects, arrays and collections do **not** become standalone content types. The inspector has `Preview / State / JSON Schema / History`. History shows event-linked additions, deletions and changed values for a content type or its canonical sources. Selection/configuration changes and direct local JSON edits are not labelled simulation events. An older selected State is read-only; the latest State remains directly editable.

**Navigation:** separate top-level `Architecture A / Architecture B` (not two side-by-side architecture windows), each with its own Screens and panel positions. On a fresh workspace four sample screens are available: `Обзор`, `Разбор изменений`, `Факты и связи`, `План и прогнозы`. Existing customized saved layouts are not silently modified to insert new example screens: create windows via `+ Окно`, filter content using the search field, or use **Reset** (resets content as well) to load the fresh examples.

**Workspace behavior:** any number of windows/screens; tabs; responsive content warnings; window geometry swapping; live drag with mouse-wheel and edge scrolling; fit-on-drop with editable gap; drag focus/status. Content State remains when a window disappears. Typed singletons (e.g., events/plan/requirements/current) are per screen, not duplicated semantic facts.

## Data scope and persistence

The example has one application under architectures A and B. They share `EXT-01`, an architecture-independent external signal. Their **authored illustrative** reactions and downstream requirements differ with recorded provenance; the runtime does not prove causality. Selecting Plan Step does not execute it or advance factual time. Forecasts, conditional route impacts and deadlines are not facts.

- `src/workspace.ts`: layout, panes, typed registry and placement constraints.
- `src/content.ts`: original simulation fixture + schemas + direct edit validation.
- `src/history.ts`: archived factual snapshots, immutable PlanRevision BASE/lineage, historical projection and structural before/after differences.
- `src/HistoryContent.tsx`: State History and PlanRevision selectors/read-only details.
- `src/extraContent.ts`: new typed view/inspection State and schemas (projections; canonical Plan and Events remain elsewhere).
- `src/DomainContent.tsx`, `src/AdditionalContent.tsx`: old and added renderers.
- `src/App.tsx`: root A/B screen UI, picker/search and overlay inspector.
- `src/windowDrag.ts`: pointer dragging, edge scrolling, fit-on-drop.
- `tests/*.test.mjs`: data/schema, migration, layout and geometry tests.

State is saved under `pt006-simulator-content-[A|B]-v5`. Previous simulator State `-v4` and `-v3` are upgraded in memory. Customized data and layouts are preserved; an untouched v4 example Plan receives the revised sample. Histories come from the prepared scenario, not an inferred log of imported local edits; customized imports are labelled accordingly. Layout stays under `pt006-simulator-layout-[A|B]-v3`, so existing user layouts remain intact. If upgrading a **generic pre-simulator** layout (`pt006-workspace-v2`), screens and window rectangles are retained but generic content placements are cleared, rather than silently relabelled as new domain truths. Earlier generic demo data is never reinterpreted as factual simulator events. Previous storage keys are not deleted.

## Verification boundaries

This is a catalog completeness prototype, **not** a successful Stage A/B/C simulation acceptance test. Prepared event-linked snapshots support historical browsing of Requirements, CURRENT architecture, files, work and Plan; three archived PlanRevisions per branch retain BASE, forecasts and deadline changes. There is no interpreter for arbitrary events, automatic IF execution, automatically captured local-edit history or measured expected-completion engine; no route likelihood engine; no causal proof or measured cost estimator; no universal architecture ontology; no independent Evolution Map. JSON Schema checking is a simplified structural validator; cross-content reference integrity is not generally enforced. The authored fixtures include labels to avoid interpreting planned targets as actual effects.

See `CONTENT_INVENTORY_REVIEW_2026-10-10.md` for the independent review, findings, user-review priorities, pending decisions and next-stage limitations.

No PT-005 files, historic proposal/review documents or `wireframe_app.xml` were edited; no Git commit was made.

## Historical fixture walkthrough

- Open Actual Events and Current State. Select A-01 (12 March): API does not exist and `src/booking.ts` is present. Select A-02: API and `src/api/booking.ts` appear; the old file is removed.
- Select EXT-01: R-A3 is still absent. Select A-04: the signed-contract event reveals R-A3.
- Use the panel-edge ↶ button or the global inspector's History tab to compare saved objects and values and open complete historical JSON.
- In Plan, choose R0/R1/R2. The factual cursor and CURRENT do not move. Expand changes or the frozen BASE. B's corporate deadline changes from 30 April in R1 to 15 May in R2.
- Impact History / Future keeps actual changes and future conditional impacts in separate sections.
- A custom event without a matching archived snapshot displays an explicit unavailable-state message; latest data is never silently shown as a past snapshot.

These are working historical projections of an authored test scenario, not a general simulation engine.

Verified on Windows: 60/60 model/geometry tests, TypeScript/Vite build, zero lint errors/warnings. An isolated headless Edge session verified historical file browsing, read-only past State, before/after display, revision selection without moving CURRENT, changed B deadlines and migration preserving customized content/layout. No browser runtime exceptions.
