# PT-006 · Independent Content Inventory Review · 2026-10-10

**Target:** actual Windows working tree `C:\Users\alexa\simulation\prototypes\PT-006\workspace-shell`: content registry, schemas, renderer coverage, A/B layout and State persistence.  
**Basis:** user Workspace/content conversations; `SC-001@v4-candidate`; `V3A-candidate-r9-delta`; historical `R9` review where relevant. **These documents remain candidate/open; their ideas are not retroactively committed FRs.**  
**Transaction:** `TRANSACTION OPEN`; review findings and UI prototype implementation are **not** a semantic commit.

## Краткий результат / Для пользователя

Перепроверка обнаружила, что прежние 8 видов не давали отдельного представления фактического CURRENT и плановой архитектуры, сценарного сравнения и перехода событие→объект. Сейчас в каталоге **18** типов, каждый имеет State/Schema/renderer, причём старые типы не удалены: это **широкий кандидат для UX-тестирования**, не окончательная нормативная таксономия. На момент исходной проверки отсутствовала история State. Последующее расширение (раздел 8) добавило event-linked архивные снимки и PlanRevision для подготовленного сценария. Произвольный событийный движок по-прежнему отсутствует.

**HIGH: F-P-01 → PR-01** (факт/план в одной Architecture) — добавлены отдельные Current State и Architecture Planning, пока сохраняется старый совместный вид; `mitigated`, решение технич. автономное `HIGH`. **HIGH: F-P-02 → PR-02** (не хватало explorer/comparison) — добавлены ограниченные иллюстративные проекции; `mitigated`, автономность `HIGH`. **HIGH: F-P-03 → PR-03A** — `mitigated` в тестовом прототипе: добавлены история State, архивные CURRENT/Files и PlanRevision с неизменяемым BASE. Полнота произвольного событийного движка остаётся ограничением следующего этапа; исходная запись и её прежний статус сохранены ниже как история review.

**HIGH: F-P-05 → PR-08** (schema проекций показывала только селекторы, а не структуры исходных объектов) — в инспектор добавлены раскрываемые State/Schema исходных моделей; `resolved`, Decision Autonomy `HIGH`.

**Навигация по отчёту:** «Coverage» — что включено и чего сознательно нет; «Findings» — приоритетные факты/риски/выборы и конкретные сценарии; «Upstream» — что нельзя решить только UI; «Composition» — готовый экспериментальный набор и нерешённое; «Evidence / Log» — проверки, ограничения и следующие шаги.

**Следующее действие:** в браузере просмотреть новые типы через каталог, особенно Current / Architecture Planning / Explorer / Comparison; затем выбрать, какие объединять, а какие действительно должны быть независимыми окнами. Не считать passing tests доказательством корректного historical replay.

## 1. Target / reconstruction / normative status

- **User Need** (`N-1/N-2/N-3/N-6/N-10/N-11/N-12/N-13` из исторической композиции): исследовать развитие *одного приложения* под разными архитектурами, с понятными фактическими событиями, прогнозами, работой, реализацией и доказательствами, без фальшивого «лучшего» победителя.
- **Применимые явно подтверждённые границы:** разделить A/B верхними вкладками; Workspace с Screens и окнами; typed registry; State существует независимо от открытых окон; schema описывает *возможные* объекты и коллекции, State — фактические; предсказываемые события/Steps не фактические; только один Plan (нет отдельной Evolution Map); отдельные CURRENT и плановые целевые snapshots; branch-local Requirement knowledge; contextual Fitness; даты внутри timelines, не отдельная самостоятельная дорожка.
- **FR reference vs prototype Proposal:** `FR-8/9/10/12/14/15/16..25` и candidate `FR-26..28` взяты как ориентиры проверяемого сценария, **не** повышены настоящим review до новых committed requirements. `P-31/39/41/42/44/46/49@r9` и 7 `SRU-*` — текущие *candidate* design rationale, а не утверждённый backend contract.
- **Review scope сейчас:** полнота типов и честность их интерфейсных проекций на работающей тестовой оболочке. Полнота Stage A/B/C engine, causal verification, реальный календарный replay и planning assistant **вне текущего delivery scope**. Нельзя объявить полноценный сценарий завершённым из-за наличия карточек.
- **Cost/timing:** пользовательского hard deadline и ресурсного бюджета нет; точные часы, длительность, slack и экономия **unknown**. Качественно: больше типов → выше цена каталога/тестовых схем и риск расхождения, но меньше опасность забыть область до UX-проверки; строка поиска смягчает навигационную стоимость. Поздний merge должен уменьшить поддерживаемое число самостоятельных типов.

## 2. Independent content coverage

| Intended concern | Implemented content kind(s) | Assessment |
|---|---|---|
| Вход в сценарий и общий старт A/B | `scenario` | Представление + fixture, не механизм выбора разных кейсов |
| Branch-local фактические события и даты | `events` | Список + выбор cursor; не универсальный replay |
| Фактическое состояние системы | `current` | Отдельное окно; Requirements фильтруются, architecture/files пока статичны |
| Фактические требования | `requirements` | Ненормализованные известные на cursor; predicted не выдаются за actual |
| Архитектурный снимок / старое совмещённое представление | `architecture` | Retained для сравнения UX вариантов, допускает факт/план через переключение |
| Плановый целевой снимок после Step | `architecturePlan` | Отдельный полный snapshot с ссылкой на Step, нет отдельного Plan |
| Единый PlanRevision + условные Steps | `plan` | Демонстрационный immutable BASE label и IF/ELSE; нет полноценной revision history |
| Ожидаемые события, forecast requirement, deadline | `forecasts` | Проекция из Plan; нет хронологии пересмотренных обещаний/оценок |
| Прогнозные изменения направления | `axes` | Planned Change Axes отдельно от наблюдаемого факта |
| Повторяющиеся фактические изменения | `hotpaths` | Actual Hot Paths, fixture authored |
| Impact отдельного Step | `impact` | Route-local planned effect; не snapshot |
| Impact по выбранному элементу и conditional future | `impactHistory` | Плановые маршруты; **фактическая история мутаций не реализована** |
| Файловая реализация | `implementation` | CURRENT fake files и planned effects |
| Requirement→Responsibility→File | `trace` | Несколько подготовленных links; не онтология требований |
| Event↔Entity/State | `explorer` | Частично event→revealed requirement; полный bidirectional/state mutation отсутствует |
| Равное внешнее событие, причинное расхождение | `comparison` | Текстовая cross-branch проекция без двух архитектурных схем рядом |
| Конкретный контекст Fitness | `fitness` | Миграция, Plan alignment, cost classes, evidence; не скаляр |
| Work episodes / Work Dynamics | `work` | Фактическая работа, включая Goal/Hot Paths; глубокая детализация работ требует fixture |

**Осознанно не выделены как content type:** `Object`, `Collection`, `JSON Schema` (части State/инспектора); `Calendar` (даты в Event/Plan), `Evolution Map` (superseded single-Plan semantics), самостоятельные `Evolution Option`, Stage A/B/C, Monte Carlo и все архитектурные классы/узлы.

**Instance vs fact:** singleton window placement на одном Screen — это UI-ограничение, *не* ограничение существования единственного State. Другой Screen или другая ветка использует собственный экземпляр проекции, но не «новую историю реальных событий».

## 3. Findings — HIGH priority first

### F-P-01 (Problem, CURRENT UI, HIGH, mitigated) · Blended ACTUAL / PLANNED Architecture

**Общее:** до исправления `architecture` содержал CURRENT и целевой Planned Snapshot в одном селекторе; различение существовало только в подписи и требовало дополнительного внимания.  
**Reproduction (старый UI):** открыть Architecture → выбрать `A-ENTERPRISE` → видеть целевую плановую схему внутри вида, ожидаемого как архитектура. `currentRef` не меняется, но пользователь вынужден читать локальную маркировку. **Expected:** выбор фактического CURRENT и сравнение planned target доступны в ясно различающихся представлениях, без выполнения Step.  
**PR-01** (origin: assistant; rationale: user intent + `P-41/42@r9`; status: **selected candidate, implemented in prototype**): добавить отдельные `current` и `architecturePlan`, оставить старый `architecture` как возможный merged вариант. **Trade-off:** яснее истина, но появляется overlap. **User Review Priority HIGH; Decision Autonomy HIGH** — технически обратимое разбиение на views, не меняющее доменную истину. **Trace:** SRU-3/4/7; `FR-8/9` и `CDC-12/16@r9` (candidate).

### F-P-02 (Problem, CURRENT UI, HIGH, mitigated) · Missing comparison and event/entity navigation

**Общее:** прежний каталог не предлагал отдельного расследования «общий внешний стимул → различающиеся исходы» и перехода от события к раскрытому объекту.  
**Reproduction (старый UI):** на A выбрать `EXT-01` в Events и попытаться в одном контексте объяснить последующее B-исход/новые требования или открыть объект, фактически раскрытый событием. Требовались ручные переходы между вкладками и реконструкция.  
**PR-02** (origin: assistant, user/review-supported; status: **selected candidate, implemented partially**): `comparison`, `explorer` и `trace` с подготовленными links, event-ref и сценарием. **Trade-off:** быстрее исследование, но fixtures — author-supplied evidence, не вычисленная причинность. **User Review Priority HIGH; Decision Autonomy HIGH** — дополнение читаемых UI projection; нет нового обязательного доменного объекта. **Trace:** N-10/11, SRU-1/2/6/7, `P-23/36@r9` candidate.

### F-P-03 (Problem, CURRENT inspector, HIGH, deferred with explicit trigger) · Missing per-content historical State changes

**Общее:** пользователь ранее запросил историю изменений State *каждого вида контента* с объектами, добавлениями и изменениями значений. Сегодня инспектор имеет **только Preview / State / JSON Schema**; никакой временной реконструкции field deltas там нет. `impactHistory` содержит **только route-qualified planned impact**, не реальную историю состояний.  
**Reproduction:** в любом окне нажать боковую кнопку State/Schema → попытаться выбрать историю фактических изменений этого вида по событиям — режима нет. В `Actual Events` выбрать более раннее событие: Requirements частично фильтруются, но CURRENT Architecture и Files не восстанавливаются для этого события.  
**PR-03A** (origin: user + assistant remediation; **pending**): после введения реальных подготовленных event-linked state snapshots/deltas добавить в инспектор `История`, показывающую исторические объекты и значения конкретного вида. **REQUIRES** содержательные snapshot/delta facts для этого вида, иначе интерфейс будет врать. **User Review Priority HIGH; Decision Autonomy LOW** — поднимается до upstream семантики replay, сейчас нет данных/согласованной глубины модели.  
**PR-03B** (origin: assistant; pending; `ALTERNATIVE_TO PR-03A` для текущей UI-итерации, не конечной семантики): добавить неработающую вкладку «История — пока недоступна» для discoverability; низкая стоимость, но риск UX-шума. **User Review Priority NORMAL; Decision Autonomy MEDIUM**.  
**Disposition:** `deferred` **не означает resolved**; revisit trigger — сценарные event-linked mutations/snapshots подготовлены и UI должен показать exact earlier state, before claiming SRU-1 complete. **Question:** нужная полнота истории на следующем этапе (UI preview / event-backed fixture / generic replay)? **partially blocking** historical inspector and full SRU-1 validation, не блокирует проверку списка типов.

### F-P-04 (Problem, CURRENT migration path, NORMAL, resolved) · Misleading legacy content migration

**Общее:** предыдущий `migrateLegacyWorkspace` преобразовывал generic `notes` → simulation `work`, `metrics` → `fitness`, `diagram` → `architecture`. Содержимое старого приложения не подтверждает такую смысловую идентичность.  
**Reproduction:** создать старое layout с вкладкой `notes`; миграция давала Window Work Dynamics без соответствующей фактической работы. **Expected:** сохранить геометрию, но явно заново выбрать Domain type.  
**PR-04** (origin: independent review; **selected candidate, implemented**): сохранять окна/позиции, очищая generic domain-non-equivalent tabs; уже сохранённый симуляторный v3 State мигрировать отдельно без потери его полей. **User Review Priority NORMAL; Decision Autonomy HIGH** — объективно корректная защита truth boundary, стоимость: пользователь повторно выбирает тип для старого generic layout. **Trace:** SRU-7, FR-8/9 and no fabricated domain facts.

### F-P-05 (Problem, CURRENT inspector/schema UX, HIGH, resolved) · Projection view State hid source object structures

**Общее:** новые типы-проекции (`forecasts`, `current`, `architecturePlan`, `comparison`) первоначально имели JSON Schema только собственных полей выбора, например `selectedForecastId` и `selectedRoute`. Но на экране одновременно показываются сложные объекты `Plan.anticipatedEvents` и другие структуры. Пользователь просил видеть *все возможные структуры объектов* контента, включая отсутствующие сейчас экземпляры; только схема селекторов недостаточна.

**Reproduction:** открыть Inspector → Forecasts → JSON Schema и искать поля прогнозных событий: первоначальный результат описывал только два selector string, хотя Preview показывал массив прогнозных событий. **Expected:** увидеть Schema структуры объектов, из которых строится данный вид, не копируя canonical Plan в отдельное хранилище.

**PR-08** (origin: independent review; **selected candidate, implemented**): для всех новых projection views Inspector показывает (а) собственный View State/schema, (б) раскрываемые original State / JSON Schemas всех читаемых canonical models и быстрый переход к редактированию исходного типа. Для Comparison доступны State обеих архитектур. **Trade-off:** не создаёт лишних копий Plan/Events, но пользователь должен понимать, что конфигурация вида и data source — разные сущности. **User Review Priority HIGH; Decision Autonomy HIGH** — объективное восстановление видимости структур без смены модели и с обратимым UI. **Trace:** пользовательский запрос о State/schema для каждого ContentKind, SRU-7, F-P-01/02; `RECOMMENDED_WITH PR-01/PR-02`.

## 4. Risks / uncertainties / opportunities

### F-R-01 (Risk, UPSTREAM data semantics, HIGH, mitigated by clear prototype labelling)
**Mechanism:** прямой JSON State edit проверяет форму, но **не** все cross-content references. Например, изменить `plan.steps[1].targetSnapshotRef` на строку `MISSING`: схема примет строку, но `Architecture Planning` честно покажет `snapshot not found`. При превращении fixture в trusted simulator это нарушит связность projected Step outcome. **PR-05** (assistant; `pending`): перед claim of real simulator readiness проверять ссылочные инварианты Plan↔Snapshot↔Impact, Requirement↔Event, Trace↔Files и history. **REQUIRES** согласовать точную доменную модель. **User Review Priority HIGH; Decision Autonomy MEDIUM**, так как контракт ещё кандидатный; не блокирует UI-only type review. Revisit before Stage A gate.

### F-U-01 (Decision Uncertainty, CURRENT/UPSTREAM content UX, NORMAL, open)
**Fork:** сохранить 18 отдельных видов или позже соединить близкие (`architecture` с `current/architecturePlan`, `work` с `hotpaths`, `plan` с `forecasts/axes`, `impact` с `impactHistory`). Разные последствия: отдельные виды дают гибкие размещения, но больше выборов и мест поддержки; объединённые дают меньше tab choices, но плотнее панели.  
**PR-06A** (origin: user direction to add first/merge later; **selected candidate**): держать расширенный каталог до UX-прогона. **PR-06B** (assistant, `ALTERNATIVE_TO PR-06A`, pending): заранее схлопнуть близкие виды. **User Review Priority NORMAL; Decision Autonomy USER_REQUIRED** для окончательного merge, так как речь о предпочтениях работы с окнами. **Question non-blocking:** после осмотра выбрать наиболее полезные самостоятельные виды, названия и min-size. **Bundle PG-1 SOFT_BUNDLE:** PR-01 + PR-02 + PR-06A, dependencies = сохранённый typed registry/State separation.

### F-O-01 (Improvement Opportunity, CURRENT discoverability, NORMAL, open)
Для fresh layout добавлены два sample Screens; старый сохранённый UI не изменяем автоматически. Быстрая альтернатива — кнопка «добавить демонстрационные экраны без сброса», но это дополнительная механика и сохранение ID. **PR-07** (assistant, pending, LOW/NORMAL, Decision Autonomy HIGH): рассмотреть, если пользователь не сможет обнаружить новые виды через поиск/каталог. **Revisit trigger:** обнаруженный UX friction. Сейчас каталог с поиском уже достаточен.

### Evidence Gap / Review Limitations

- Код, типы, JSON Schemas, миграция, TS build/lint, fixture assertions и HTTP response проверены. **Не подтверждён** полномасштабный ручной browser UX walkthrough (drag, визуальная адаптивность, реальный экран старого localStorage).
- Исторические состояния архитектуры/файлов в разных Actual Event cursor отсутствуют по выбранной staged границе; нельзя выдавать `CURRENT` fixture за replay.
- Исходные старые обсуждения в чате частично редуцированы; сопоставлены доступные user directions + `SC-001@v4-candidate` + `r9-delta`. **Гарантия**, что не существует вообще никакого более раннего упоминания вида вне этих источников, невозможна.
- Версии кандидатов и review имеют governance `TRANSACTION OPEN`; no semantic acceptance inferred. Не делались историческая PT validation, browser human acceptance или commit.

## 5. Upstream / Realization Impact

`F-P-03` и `F-R-01` относятся к родительским `SRU-1/3/4/7`, а не только к дизайну кнопок: UI History и faithful CURRENT требуют данных, lineage и ссылочной целостности. До разрешения не строить «событийный движок» поверх произвольного mutable demo store и не суммировать взаимоисключающие IF/ELSE impacts. Реализация нужна staged/validation-first; для неё нет подтверждённых трудозатрат или hard deadline. `F-U-01` меняет доставочную поддержку UI, но обратима в registry/renderer и может быть решена после короткого наблюдения пользователя.

## 6. Recommended Candidate Composition / governance

**Selected UI-only experiment (implemented, not semantically committed):** `PR-01 + PR-02 + PR-04 + PR-06A + PR-08`. Нет самостоятельной Evolution Map, обязательного Evolution Option, лишних Object/Collection видов, scalar Fitness или отдельной Calendar lane. Изменение входного кандидата не делает его автоматически committed.

**Unresolved:** `PR-03A` vs `PR-03B` (историческая вкладка до/после полноценных данных), `PR-05` (cross-reference validation before simulator engine), `PR-06B` vs `PR-06A` (поздний merge). **No unsatisfied hard dependency for UI catalog prototype**, но полнота SRU-1 и full scenario validation blocked by real history data.  
**Transaction:** `TRANSACTION OPEN`; this review does not promote candidate to committed.

## 7. Review Log · append-only identity

- **Target:** PT-006 current working tree, content surface catalog; reviewed 2026-10-10, no historical user files changed.
- **F-P-01** UI truth blended → mitigated with PR-01, HIGH, CURRENT.
- **F-P-02** missing comparison/entity navigation → mitigated with PR-02, HIGH, CURRENT.
- **F-P-03** no per-content event-backed State history → deferred until event-linked replay fixture; PR-03A/B, HIGH, CURRENT + UPSTREAM.
- **F-P-04** generic legacy views mislabelled as domain views → resolved with PR-04, NORMAL, CURRENT.
- **F-P-05** schema проекций скрывала структуры canonical source → resolved with PR-08, HIGH, CURRENT.
- **F-R-01** direct JSON edit can violate cross-content references → open, PR-05 pending, HIGH, UPSTREAM, future promotion risk.
- **F-U-01** final type granularity / optional merging → open, PR-06A/B alternatives; NORMAL, USER_REQUIRED, non-blocking UI review.
- **F-O-01** add example layouts without reset → deferred until user friction, PR-07 pending, NORMAL.
- **UA-01:** non-blocking, user can inspect extended Catalog and select which views are redundant; this resolves F-U-01 later.
- **Evidence gaps:** no human GUI acceptance or actual cross-cursor replay.
- **Outcome:** source changes under `src/` and `tests/`, README, present file; old historical plan docs unchanged. Stage A/B/C acceptance not asserted.

## 8. Historical fixture extension · 2026-10-10

User instruction: «добавь» after the explicitly listed gaps in State history, past architecture/files and PlanRevision. PR-03A is now selected and implemented for the prototype's authored case; PR-03B is superseded. The 18 content types and Workspace placement rules are unchanged.

- Four immutable event-linked frames per branch retain actual Requirements, CURRENT architecture, files, work, Plan and source objects. All linked factual views follow the same selected event.
- Three archived PlanRevisions per branch retain their parent, originating event, complete Plan, target snapshots, impacts, planned file effects and a frozen factual BASE. Viewing a revision changes only planned projections.
- The inspector now has History, including object additions/removals, changed values, before/after and full JSON. Source-model history is shown for projections; UI selections are excluded.
- Impact History / Future now separates observed CURRENT/file transitions from mutually exclusive planned routes. Event / Entity Explorer also shows event-linked State differences.
- Generic direct edits remain possible on the last State and never rewrite archives. Earlier states are read-only. Unknown/changed events without an exact archive match do not fall back to a purported historic CURRENT.
- v4/v3 migration preserves customized content and layouts. Prepared historical fixtures are explicitly distinguished from an unavailable history of imported local edits.

**Updated disposition:** F-P-03 mitigated for this event-backed fixture. F-R-01 (general reference integrity) and F-U-01 (later content merging) remain open. There is no arbitrary-event interpreter, automatic Step execution, automatically recorded JSON-edit events or causal proof. This extension does not promote scenario candidates to a committed domain baseline.

**Review log append:** PR-03A implemented in the test fixture; PR-03B superseded. Prior records above describe the earlier review state and are not erased. Windows validation: 60/60 tests, TypeScript/Vite build and lint without errors/warnings. Headless Edge verified 11 UI behaviors plus a migration retaining edited content/layout; no runtime exceptions. Passing checks do not establish general Stage A/B/C acceptance.
