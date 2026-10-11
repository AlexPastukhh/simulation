# Architecture Simulator — каталог 18 видов содержимого

**Статус:** описание текущей локальной реализации PT-006 (content-v6), **не нормативное утверждение окончательного набора типов**. Объяснение целого, DRY-определения и исторические решения: [CONTENT_SYSTEM.md](CONTENT_SYSTEM.md). Исторический обзор оставил будущий merge видов открытым (F-U-01); здесь **все 18 остаются раздельными**.

**Соглашения карточек:** **D** = подтверждённый общий source model (не гарантирует синхронизации селекторов); **S** = реально изменяемый выбор/контекст; **N** = присутствующая кнопка `open-content`; **L** = ссылка или объяснительная зависимость **разных** источников; **C** = сопоставление разнородных данных (например, Plan/Work или A/B), а не единый источник. Метка L или C **не означает** наличие кнопки N либо автоматический расчёт. Ребра D сверяются по фактическим обращениям renderer/helper и, для проекций, по `EXTRA_SOURCES`. Все относительные ссылки `../../src/profiles/architecture-simulator/...` относятся к текущим локальным, пока ещё uncommitted исходникам.

**Общие кодовые точки** (в карточках на них ссылаемся по символу, не дублируя реализацию): [ContentKind, CONTENT, INITIAL_WORKSPACE](../../src/profiles/architecture-simulator/workspace.ts); [DomainContent](../../src/profiles/architecture-simulator/DomainContent.tsx); [AdditionalContent](../../src/profiles/architecture-simulator/AdditionalContent.tsx); [ContentStore, SCHEMAS](../../src/profiles/architecture-simulator/content.ts); [SupplementalStore, EXTRA_SCHEMAS, EXTRA_SOURCES](../../src/profiles/architecture-simulator/extraContent.ts); [HistoryFrame, PlanRevision, atCursor, plannedView](../../src/profiles/architecture-simulator/history.ts); [StateHistory, PlanHistory](../../src/profiles/architecture-simulator/HistoryContent.tsx); [SimulatorProfile, ProjectionReferences](../../src/profiles/architecture-simulator/SimulatorProfile.tsx).

**Общее для всех:** в каталоге профиля доступны режимы Preview, State, JSON Schema и History. Данные хранятся независимо от окон; исторические состояния только для чтения, выбор окна/вкладки не создаёт события. Для проекций Inspector показывает источники через `EXTRA_SOURCES`, но **только проекции из extraContent.ts** перечислены этой таблицей; не предполагайте одинаковые источники/настройки у всех. Подробнее: [общая граница истины](CONTENT_SYSTEM.md).

## Основные виды предметных данных (8)

<a id="events"></a>
### 01. `events` — Actual Events

- **Вопрос:** что действительно произошло в ветке и как выбрать фактический момент?
- **Показывает:** `navigationEvents(data)`: дата, ID, вид события и provenance. Общие внешние события имеют общий ID; веточные события могут различаться. Текущий выбор отражён в `events.selectedId`.
- **Источник/время:** `data.events.records`; `history.frames` содержит подготовленные фактические State после событий. При выбранном курсоре лента навигации может включать **более поздние события**, но их знание не становится содержимым выбранного прошлого (разделение `navigationEvents` / `atCursor`).
- **Связи (D/S/N/L/C):** **D:** [Requirements](#requirements) (фильтр по events), [Current](#current), [Explorer](#explorer), [Comparison](#comparison) — тот же событийный источник; **L:** [History / архивы](CONTENT_SYSTEM.md) — связь курсора и архивных снимков. **S:** клик события задаёт `events.selectedId` и очищает `history.selectedRevisionId`; меняется фактический контекст других окон. **N:** «Открыть разбор события в Explorer» → `explorer`; сам переход не выбирает сущность.
- **Код:** [DomainContent.tsx](../../src/profiles/architecture-simulator/DomainContent.tsx) `kind === 'events'`; [content.ts](../../src/profiles/architecture-simulator/content.ts) `EventRow`, `ContentStore.events`; [history.ts](../../src/profiles/architecture-simulator/history.ts) `navigationEvents`, `atCursor`; [HistoryContent.tsx](../../src/profiles/architecture-simulator/HistoryContent.tsx) `StateHistory`.
- **Решение/граница:** accepted различие actual vs forecast и branch-local factual knowledge, [SC-001 §2/3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md); remed. `P6R-PR-03` — архив знания не зависит от изменённой live-навигации. Не универсальный интерпретатор произвольных событий.
- **Проверка:** выбрать раннее событие, открыть Requirements; позднее `R-A3` не должно стать фактически известным задним числом. **UI:** один экземпляр на экран; штатно `screen-1/panel-3`.

<a id="plan"></a>
### 02. `plan` — Plan

- **Вопрос:** каким был единый Plan в выбранный момент, какие есть Step/другая работа, условия, сроки и прогнозы?
- **Показывает:** `PlanHistory` и `PlanRevision` с `basedOnActualEventRef`; условные Steps, полные `targetSnapshotRef`, плановые эффекты; `PlanActivities`, anticipated events/forecast requirements, Planned Change Axes, `ForecastDetails` (обязательства, завершение, основания, ожидания маршрутов).
- **Источник/время:** `ContentStore.plan`, `history.revisions[].plan/base`; `plannedView` может показывать выбранную историческую ревизию **отдельно** от CURRENT. BASE ревизии неизменяем и не переезжает за курсором.
- **Связи (D/S/N/L/C):** **D:** [Architecture Planning](#architectureplan), [Forecasts](#forecasts), [Axes](#axes) — Plan; **L:** [Impact](#impact) (impactRef и выбранный Step), [Implementation](#implementation) (плановые файловые эффекты). **S:** клик Step меняет `plan.selectedStepId`, `impact.selectedImpactId`, `architecture.selectedRef` и контекст `planned`. Выбор архивной ревизии в `PlanHistory` меняет `history.selectedRevisionId`, но **не CURRENT**. **N:** прямой кнопки `open-content` к этим видам здесь нет.
- **Код:** DomainContent `kind === 'plan'`, `selectStep`; [HistoryContent.tsx](../../src/profiles/architecture-simulator/HistoryContent.tsx) `PlanHistory`; [MaterialContent.tsx](../../src/profiles/architecture-simulator/MaterialContent.tsx) `PlanActivities`/`ForecastRequirement`/`ForecastDetails`; content.ts `PlannedStep`, `ContentStore.plan`; history.ts `plannedView`.
- **Решение/граница:** принятое пользовательское **один Plan, нет Evolution Map**, Step меняет функцию/реализацию, другая работа не обязана менять код; [SC-001 §3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md). P6R-PR-01A добавил недостающие разделы *в существующий вид* (commit scope content-v6), не запретил новые виды навсегда.
- **Проверка:** выбрать Step и увидеть target/impact как PLANNED без появления Actual Event; выбрать старую PlanRevision и проверить неизменный factual CURRENT. **UI:** один экземпляр на экран; `screen-1/panel-1`.

<a id="requirements"></a>
### 03. `requirements` — Requirement Model

- **Вопрос:** какие требования фактически известны на выбранном моменте и откуда получены?
- **Показывает:** ненормализованные requirement occurrences с ID, названием, описанием, source и `knownFrom`; численность screens и apiEndpoints. Пустая фактическая коллекция может быть разрешена Schema.
- **Источник/время:** `ContentStore.requirements`, `knownRequirements(data)`; фильтрация согласована с event cursor. Будущее требование из anticipated event **не** добавляется фактически от одного прогноза.
- **Связи (D/S/N/L/C):** **D:** [Current](#current), [Explorer](#explorer), [Trace](#trace), [Comparison](#comparison) — фактические requirements; вид Requirements также читает Events через knownRequirements. Сам список не выбирает требования и не создаёт факты. **N:** «Открыть связи требований» → `trace`, без автоматического выбора конкретного `trace.selectedRequirementId`.
- **Код:** DomainContent `kind === 'requirements'`; content.ts `Requirement`, `knownRequirements`, `SCHEMAS.requirements`; history.ts `atCursor`, `changesFor`; `trace.links` создаются/хранятся отдельно.
- **Решение/граница:** пользовательски принятая **ненормализованная Requirement Model**; архитектура вправе группировать повторяющееся знание, но это не слияние требования; [V3A r7 CDC-13/15](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md), [SC-001 §2](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md).
- **Проверка:** выбрать A-ранний момент → нет позднего R-A3; перейти в Trace и убедиться, что переход не изменил requirement history. **UI:** один на экран; `screen-1/panel-2`.

<a id="architecture"></a>
### 04. `architecture` — Architecture

- **Вопрос:** как структурированы ответственности и связи у фактической или предполагаемой архитектуры?
- **Показывает:** полные `ArchitectureSnapshot` с ответственностями и connections; выбор ACTUAL/PLANNED явно помечен, `currentRef` остаётся фактической ссылкой.
- **Источник/время:** `ContentStore.architecture.snapshots/currentRef`; целевые снимки доступны через `planningSnapshots` и `resolveSnapshot(data, ref, context)`. `plannedView` не должен подменять actual snapshot одноимённым planned payload.
- **Связи (D/S/N/L/C):** **D:** [Current](#current), [Architecture Planning](#architectureplan), [Impact History](#impacthistory) — фактические/плановые snapshots с явно различённым контекстом; **L:** [Plan](#plan) — Step ссылается на целевой снимок. **S:** селектор меняет `architecture.selectedRef` и `architecture.selectedContext`, **не исполняет Step**. Plan может выставить выбранный planned target. **N:** «Открыть историю архитектурных изменений» → `impactHistory`, но не выбирает в нём target автоматически.
- **Код:** DomainContent `kind === 'architecture'`; content.ts `ContentStore.architecture`; history.ts `resolveSnapshot`/`planningSnapshots`/`plannedView`; [remediation P6R-PR-02](../../../PT006_REMEDIATION_2026-10-10.md).
- **Решение/граница:** исходный смешанный UI retained как UX-вариант; отдельные Current и Architecture Planning добавлены для ясного разделения истины (inventory F-P-01), окончательный merge — **открытый вопрос**, [inventory](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md).
- **Проверка:** архивный Plan target с тем же ID, что CURRENT, не должен менять фактическое содержимое. **UI:** несколько на экран, `screen-1/panel-2` и `screen-2/panel-5`.

<a id="impact"></a>
### 05. `impact` — Evolution Impact

- **Вопрос:** какие конкретные ответственности и файлы затронет выбранное изменение/Step по данному маршруту?
- **Показывает:** выбранный `impact.records[]`: `stepId`, `route`, reason, `targetRefs`, `filePaths`. Влияние **одного** изменения, а не агрегат несовместимых IF/ELSE.
- **Источник/время:** `ContentStore.impact` и плановый `history.revisions[].impacts` при `plannedView`. Impact не фактическая история файлов и не target ArchitectureSnapshot.
- **Связи (D/S/N/L/C):** **D:** [Impact History](#impacthistory) — impact.records; **L:** [Plan](#plan) (step.impactRef), [Architecture Planning](#architectureplan) (ссылка impactRef), [Implementation](#implementation) (filePaths), [Fitness](#fitness) (оценка последствий). **S:** клик impact-chip меняет `impact.selectedImpactId`; выбор Step в Plan тоже направляет этот селектор. **N:** предметной кнопки на другие виды из этого view нет.
- **Код:** DomainContent `kind === 'impact'`; content.ts `ContentStore.impact`; history.ts `plannedView`/`PlanRevision.impacts`; Schema `SCHEMAS.impact`.
- **Решение/граница:** EvolutionImpact отдельно от полного Step target и от Actual Hot Paths; [V3A r7 CDC-16/18 и P-42](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md). Предупреждения отсутствующих refs не гарантируют полноценную семантическую проверку (P6R-PR-06).
- **Проверка:** переключать chip разных routes и проверить, что ни один выбор не изменяет CURRENT. **UI:** несколько на экран, `screen-1/panel-4` и `screen-2/panel-6`.

<a id="implementation"></a>
### 06. `implementation` — Implementation / Files

- **Вопрос:** какие файлы существуют фактически и что предполагается сделать с ними в плановых Steps?
- **Показывает:** fake project tree `implementation.files` с path/responsibility/status; отдельно `plannedEffects` по Step — CREATE/MODIFY и т. п.
- **Источник/время:** фактические files из выбранного `HistoryFrame`; запланированные effects — из одного Plan / выбранной `PlanRevision` через `plannedView`. **Plan file effect не создаёт CURRENT file**.
- **Связи (D/S/N/L/C):** **D:** [Current](#current), [Trace](#trace), [Impact History](#impacthistory) — фактические файлы; **L:** [Impact](#impact) — ссылки filePaths на объекты другой модели. В основном представлении — чтение. **N:** «Открыть историю изменений файлов» → `impactHistory`, без переноса выбранного path.
- **Код:** DomainContent `kind === 'implementation'`; content.ts `ContentStore.implementation`; history.ts `atCursor`/`plannedView`; `WorkDetails` не является файловым деревом.
- **Решение/граница:** первый MVP-уровень — **File**, без AST/Class/Method и без автоматического IDE; [V3A r7 P-47/48](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md). Runtime/data topology и Implementation Guidance — факультативные *кандидатные* проекции, не обязательный 19-й вид.
- **Проверка:** на раннем фактическом событии tree должен соответствовать архиву; файл, предусмотренный поздним Step, не появляется до фактического события. **UI:** несколько на экран; `screen-2/panel-5`.


<a id="fitness"></a>
### 07. `fitness` — Evolution Fitness

- **Вопрос:** насколько состояние/предложенное изменение подходит конкретной потребности и историческому плану, какие миграции и затраты потребуются?
- **Показывает:** контекстные `fitness.assessments`: `goalRef`, `stateContext`, маршрут, вопрос, `migration`, `planAlignment`, классы затрат и evidence. Не сводит всё к универсальному «какая архитектура лучше».
- **Источник/время:** `ContentStore.fitness`; для исторической PlanRevision возможна соответствующая архивная `revision.fitness` через `plannedView`. Оценка обязана читаться в её объявленном контексте, а не как timeless-score.
- **Связи (D/S/N/L/C):** **L:** [Plan](#plan) (historical plan alignment), [Work](#work) (затраты и наблюдения), [Impact](#impact) (оценка изменений), [Axes](#axes) (будущие направления): сопоставимые темы и ссылки, **не общий владелец данных**. В основном представлении нет отдельного выбора assessments. **N:** кнопки из Fitness к другим видам нет, но [Work](#work) содержит переход сюда.
- **Код:** [DomainContent.tsx](../../src/profiles/architecture-simulator/DomainContent.tsx) `kind === 'fitness'`; [content.ts](../../src/profiles/architecture-simulator/content.ts) `ContentStore.fitness`; [history.ts](../../src/profiles/architecture-simulator/history.ts) `plannedView`; Inspector/Schema через `SCHEMAS.fitness`.
- **Решение/граница:** пользовательское понимание Fitness — вынужденные/неловкие миграции и соответствие *историческому* плану; не штрафовать разумный отход от устаревшего плана, не вводить скрытый единый балл. [SC-001 §3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md); [remediation §материал](../../../PT006_REMEDIATION_2026-10-10.md).
- **Проверка:** проверить, что вопрос, цель, route и основания присутствуют рядом с оценкой; отсутствует один агрегатный рейтинг A/B. **UI:** несколько на экран; `screen-1/panel-4`.

<a id="work"></a>
### 08. `work` — Work Dynamics / Hot Paths

- **Вопрос:** что команда фактически делала для определённых целей, что стоило времени/координации и где повторялись изменения?
- **Показывает:** `work.episodes`, цель/дата/activities/evidence, `WorkDetails`: planning burden, knowledge, dependencies, compatibility, rollout, active/waiting time, costFacts и их provenance, фактические deadline outcomes; отдельно `actualHotPaths`.
- **Источник/время:** `ContentStore.work`, event-linked factual `HistoryFrame`; сведения о трудозатратах авторские, quantity может быть unknown и не трактуется как ноль. Работа не тождественна Evolution Step.
- **Связи (D/S/N/L/C):** **D:** [Actual Hot Paths](#hotpaths), [Comparison](#comparison) — work; **L:** [Fitness](#fitness) (оценки и затраты), [Events](#events) (события/эпизоды), не единый журнал событий. Основной вид не изменяет предметные селекторы. **N:** кнопки «Открыть Evolution Fitness» → `fitness` и «Открыть Actual Hot Paths» → `hotpaths`.
- **Код:** DomainContent `default work`; [MaterialContent.tsx](../../src/profiles/architecture-simulator/MaterialContent.tsx) `WorkDetails`; [material.ts](../../src/profiles/architecture-simulator/material.ts) `WorkMaterial`; content.ts `ContentStore.work`.
- **Решение/граница:** R10/P6R-PR-01A добавил работу по цели и независимые классы затрат (не суммировать пересекающиеся линзы). WorkEpisode — не второй Event log и не Step. [SC-001 §3/4](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [remediation §материал](../../../PT006_REMEDIATION_2026-10-10.md).
- **Проверка:** открыть событие с задержкой, сравнить episodes/outcomes и прогнозные сроки в Plan: фактическая задержка не создаётся одной плановой оценкой. **UI:** несколько на экран; `screen-2/panel-6`.

## Дополнительные виды / исследовательские проекции (10)

<a id="scenario"></a>
### 09. `scenario` — Scenario / Context

- **Вопрос:** какое приложение исследуем, какие условия одинаковы для A/B и какова среда команды?
- **Показывает:** `caseId`, `appName`, starting point, constraints, контекст динамичности/organization/engineering environment и общий якорь `EXT-01`. Подготовленный сценарий не является библиотекой произвольных кейсов.
- **Источник/время:** `SupplementalStore.scenario` — собственный контекст и anchors; `ScenarioContextView` читает `data.scenario.context`. Shared anchor один для веток; последствия branch-local.
- **Связи (D/S/N/L/C):** **D:** [Comparison](#comparison) — сравнение читает anchors сценария; **L:** [Events](#events) (общий внешний стимул), [Axes](#axes) (контекст прогнозов), [Work](#work) (среда работы). Селектор scenario.selectedAnchorId не переключает фактический курсор. **N:** кнопок перехода к другим видам нет.
- **Код:** [AdditionalContent.tsx](../../src/profiles/architecture-simulator/AdditionalContent.tsx) `kind === 'scenario'`; [extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts) `seedExtra`, `EXTRA_SCHEMAS.scenario`; MaterialContent.tsx `ScenarioContextView`.
- **Решение/граница:** общая ситуация A/B, различия только с причинным объяснением; no-hindsight. [SC-001 §2/4](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md). Содержит информацию контекста, но не автоматически рассчитывает результаты.
- **Проверка:** на A/B сравнить ID `EXT-01` и убедиться, что общие исходные ограничения не «подогнаны» под победителя. **UI:** один на экран; `screen-3/panel-7`.

<a id="current"></a>
### 10. `current` — Current State

- **Вопрос:** что было фактически известно/реализовано на выбранный Actual cursor — требования, архитектура, файлы?
- **Показывает:** компактные разделы `architecture / requirements / implementation`; текущий снимок через `currentRef`, известные требования через `knownRequirements`, фактические files из выбранного состояния.
- **Источник/время:** через [atCursor](../../src/profiles/architecture-simulator/history.ts) получает **factual** data; собственный `current.selectedSection` — только настройка отображения. Отдельные forecast/Plan targets не должны подмешиваться в CURRENT.
- **Связи (D/S/N/L/C):** **D:** [Events](#events) (курсор), [Requirements](#requirements), [Architecture](#architecture), [Implementation](#implementation) — фактический State и фильтр knownRequirements. **S:** кнопки раздела меняют только `current.selectedSection`; **N:** «Открыть подробный вид» адресует ровно один из `architecture` / `requirements` / `implementation` по активному разделу. Сам переход ничего не записывает в факты.
- **Код:** AdditionalContent `kind === 'current'`; [extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts) `SupplementalStore.current`, `EXTRA_SOURCES.current`; content.ts `knownRequirements`; history.ts `atCursor`.
- **Решение/граница:** создан, чтобы не заставлять пользователя читать совместный Actual+Planned Architecture как единую истину; [inventory F-P-01 / PR-01](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md). Это проекция, **не второй Current State store**.
- **Проверка:** на раннем event cursor данные файлов и требований совпадают с историческим frame; переход к детальному виду не меняет cursor. **UI:** один на экран; `screen-3/panel-7`.

<a id="architectureplan"></a>
### 11. `architecturePlan` — Architecture Planning

- **Вопрос:** какая **полная** целевая архитектура предусмотрена после конкретного Step по выбранной версии Plan?
- **Показывает:** selector Step, route/condition, `targetSnapshotRef`, ответственности, connections (опционально) и предполагаемый implementation effect/`impactRef`. Step с изменением кода может повторно использовать ту же архитектурную структуру.
- **Источник/время:** `data.plan.steps` и `resolveSnapshot(data, step.targetSnapshotRef, 'planned')`; `plannedView` учитывает выбранную архивную PlanRevision. View-state `architecturePlan.selectedStepId/showConnections` не владеет Plan/snapshots.
- **Связи (D/S/N/L/C):** **D:** [Plan](#plan), [Architecture](#architecture) — Step и целевой snapshot; **L:** [Impact](#impact) (step.impactRef), [Implementation](#implementation) (описанный Step implementationEffect; не фактический файл). **S:** selector здесь обновляет `architecturePlan.selectedStepId` (не обязательно `plan.selectedStepId`); checkbox — `showConnections`. **N:** отдельной кнопки `open-content` из вида пока нет.
- **Код:** AdditionalContent `kind === 'architecturePlan'`; extraContent.ts `EXTRA_SOURCES.architecturePlan = ['plan','architecture','impact']`; history.ts `plannedView`/`resolveSnapshot`; content.ts `PlannedStep`.
- **Решение/граница:** полный целевой snapshot после Step и отдельный impact, без автоматического исполнения (SC-001 §3). Выделение из смешанной Architecture — UX-кандидат, финальное объединение не принято ([inventory F-P-01/F-U-01](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md)).
- **Проверка:** выбрать условный Step → увидеть snapshot как PLANNED, фактический `currentRef` не меняется. **UI:** один на экран; `screen-4/panel-10`.

<a id="forecasts"></a>
### 12. `forecasts` — Forecasts / Deadlines

- **Вопрос:** какие события/потребности ожидаются, почему вероятнее тот или иной маршрут, какие сроки и оценки обсуждаются?
- **Показывает:** `plan.anticipatedEvents` + конкретные `predictedRequirement`, `selectedRoute`, условные Steps, `ForecastDetails`: completion forecast, deadline, route expectations/grounds. Исторические значения сохраняются в PlanRevision.
- **Источник/время:** `EXTRA_SOURCES.forecasts=['plan']`. View-state `selectedForecastId/selectedRoute` — селекторы; forecast requirement не добавляется в фактический `requirements.items`.
- **Связи (D/S/N/L/C):** **D:** [Plan](#plan), [Axes](#axes) — единые прогнозные поля Plan; **L:** [Requirements](#requirements) (ожидаемое против уже известного требования), [Comparison](#comparison) (возможное сопоставление ожиданий и branch-local исходов). **S:** выбор карточки меняет `forecasts.selectedForecastId`, выбор маршрута — `forecasts.selectedRoute`, но **не** делает исход фактом. **N:** прямой кнопки перехода в другой вид нет.
- **Код:** AdditionalContent `kind === 'forecasts'`; MaterialContent.tsx `ForecastRequirement`/`ForecastDetails`; extraContent.ts `EXTRA_SOURCES.forecasts` и schema; history.ts `plannedView`.
- **Решение/граница:** конкретные прогнозные потребности ≠ известных actual требований; обещанный дедлайн ≠ оценка завершения ≠ факт пропуска; qualitative route expectations ≠ калиброванные вероятности; [SC-001 §3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [remediation P6R-PR-01A](../../../PT006_REMEDIATION_2026-10-10.md).
- **Проверка:** переключить IF route и forecast, затем открыть Actual Events: никакого нового фактического события не появляется. **UI:** один на экран; `screen-4/panel-11`.

<a id="axes"></a>
### 13. `axes` — Planned Change Axes

- **Вопрос:** в каких направлениях и на каком горизонте команда предвидела будущие изменения, как пересматривала ожидания?
- **Показывает:** `plan.changeAxes`: direction/horizon/salience/basis. Опционально исторические версии тех же прогнозных осей из `history.revisions`; возможны появление, усиление, ослабление и исчезновение оси.
- **Источник/время:** `EXTRA_SOURCES.axes=['plan']`; `plannedView` с выбранной PlanRevision, checkbox `axes.showRevisions` управляет только отображением исторических версий.
- **Связи (D/S/N/L/C):** **D:** [Plan](#plan), [Forecasts](#forecasts) — прогнозные поля Plan; **C:** [Actual Hot Paths](#hotpaths) — прогнозируемая ось против наблюдаемого пути, источники разные; **L:** [Fitness](#fitness) — контекст оценки. **S:** выбор `axes.selectedAxisId`, `axes.showRevisions`. **N:** прямого `open-content` нет. Связь с Actual Hot Paths является **сравнением прогноза и наблюдений**, не одним источником данных.
- **Код:** AdditionalContent `kind === 'axes'`; extraContent.ts `EXTRA_SOURCES.axes`; content.ts `plan.changeAxes`; history.ts `PlanRevision`.
- **Решение/граница:** PlannedChangeAxis — **менее конкретный прогноз направлений**, не сгенерированное будущее требование и не фактический Hot Path; [SC-001 §3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r7 CDC-18](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md).
- **Проверка:** сравнить R1/R2 axes и Actual Hot Paths: позднее знание не подменяет исторический прогноз. **UI:** один на экран; `screen-4/panel-11`.


<a id="hotpaths"></a>
### 14. `hotpaths` — Actual Hot Paths

- **Вопрос:** какие файлы/области реализации **наблюдаемо** многократно затрагивались в истории?
- **Показывает:** `work.actualHotPaths`: path, число touches и note; выбор выделяет `hotpaths.selectedPath`. В подготовленном кейсе счётчики авторские, не рассчитываются автоматически по произвольным event mutations.
- **Источник/время:** `EXTRA_SOURCES.hotpaths=['work']`; источник — фактические `work.actualHotPaths` из выбранного frame, **не** `plan.changeAxes`.
- **Связи (D/S/N/L/C):** **D:** [Work](#work) — фактические work.actualHotPaths; **C:** [Planned Axes](#axes) — наблюдение против прогноза; **L:** [Implementation](#implementation) — path файла ссылается на другой источник. **S:** кнопка пути меняет только `hotpaths.selectedPath`, а не Actual Events или `PlanRevision`. **N:** из этого вида кнопки на другие типы нет; [Work](#work) может открыть его через `open-content`.
- **Код:** [AdditionalContent.tsx](../../src/profiles/architecture-simulator/AdditionalContent.tsx) `kind === 'hotpaths'`; [extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts) `EXTRA_SOURCES.hotpaths`; content.ts `work.actualHotPaths`; history.ts `atCursor`.
- **Решение/граница:** наблюдаемый повторяющийся путь **не** является доказательством ожидаемого будущего направления или его вероятности; [V3A r7 CDC-18](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md). Объединять `work` и `hotpaths` пока не решено (inventory F-U-01).
- **Проверка:** сменить Actual Event и сравнить сохранённые значения touches, отдельно открыть Axes — не смешать исторический forecast с observed фактами. **UI:** один на экран; `screen-3/panel-9`.

<a id="explorer"></a>
### 15. `explorer` — Event / Entity Explorer

- **Вопрос:** что изменило выбранное фактическое событие, какие объекты стало возможно знать и какие изменения State произошли?
- **Показывает:** событие с источником/заметкой; требования, впервые известные с его `knownFrom`; выбранную сущность; `ChangeList` фактических изменений из event-linked frame.
- **Источник/время:** `EXTRA_SOURCES.explorer=['events','requirements','architecture','implementation']`. Выбранное событие для вывода берётся из общего `events.selectedId` (либо последнего frame). Поля `explorer.selectedEventId/selectedEntityRef` — view-state, история об изменении **не выводится из случайных правок этих селекторов**.
- **Связи (D/S/N/L/C):** **D:** [Events](#events), [Current](#current), [Requirements](#requirements), [Trace](#trace) — общие event/requirements/implementation источники; не означает синхронизацию всех view selectors. **S:** выбор события в explorer одновременно меняет `explorer.selectedEventId`, **глобальный фактический** `events.selectedId` и очищает `history.selectedRevisionId`; выбор требования меняет `explorer.selectedEntityRef`. **N:** из Explorer нет предметной кнопки `open-content`; из Events есть кнопка открытия Explorer.
- **Код:** AdditionalContent `kind === 'explorer'`; content.ts `knownRequirements`; history.ts `navigationEvents`/`changesFor`; [HistoryContent.tsx](../../src/profiles/architecture-simulator/HistoryContent.tsx) `ChangeList`; extraContent.ts `EXTRA_SOURCES.explorer`.
- **Решение/граница:** мотивирован пользовательской потребностью «событие ↔ сущность/State» (inventory F-P-02, [V3A r7 P-21/22](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md)); пример event→requirement подготовлен, **полный двусторонний универсальный граф причинности не реализован**.
- **Проверка:** выбрать событие без новых требований, затем событие с новыми: видеть отличия и архивные changes; не подменять отсутствующий frame последним. **UI:** один на экран; `screen-3/panel-8`.

<a id="comparison"></a>
### 16. `comparison` — Cross-Architecture Comparison

- **Вопрос:** как альтернативные архитектуры A/B отреагировали на *один и тот же* внешний стимул и почему расходятся фактические последствия?
- **Показывает:** общий anchor (`comparison.selectedAnchorId`) и текстовые фактические evidence обеих веток по выбранному `focus = events | requirements | work`; сообщает о несоответствии текста общего события, если сравниваемые records расходятся.
- **Источник/время:** `allData.A/B` из `atCursor`, `scenario.anchors`, `events.records`, `requirements.items`, `work.episodes`; `EXTRA_SOURCES.comparison=['events','requirements','work']`. У каждой ветки собственный factual cursor; общий сценарный якорь **не** обязан означать одну и ту же локальную позицию истории.
- **Связи (D/S/N/L/C):** **D:** [Scenario](#scenario) (anchors), [Events](#events), [Requirements](#requirements), [Work](#work) — читает соответствующие источники A/B; **C:** архитектурно-зависимые исходы A/B по выбранному внешнему якорю. **S:** выбор `comparison.selectedAnchorId` и `comparison.focus` управляет **темой сравнения**, не переписывает A/B facts, не синхронизирует два actual cursors. **N:** прямого `open-content` из этого вида нет.
- **Код:** AdditionalContent `kind === 'comparison'`; [SimulatorProfile.tsx](../../src/profiles/architecture-simulator/SimulatorProfile.tsx) `allData`; content.ts `knownRequirements`; extraContent.ts `EXTRA_SOURCES.comparison`.
- **Решение/граница:** один старт/одинаковые внешние обстоятельства, допустимы лишь причинно объяснённые архитектурно-зависимые исходы; [SC-001 §2/3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md). **Сейчас только текстовая проекция**, не две параллельные архитектурные диаграммы и не автоматический причинный анализ.
- **Проверка:** выбрать общий `EXT-01`, сравнить events/requirements/work; различие branch-local знаний не выдать за разные внешние стимулы. **UI:** один на экран; `screen-3/panel-8`.

<a id="trace"></a>
### 17. `trace` — Requirement / Implementation Trace

- **Вопрос:** какой архитектурной ответственности и какому файлу соответствует известное требование?
- **Показывает:** выбранное `trace.selectedRequirementId`, подготовленные цепочки `requirementId → architectureRef → filePath`, note и отметку, есть ли файл в фактическом CURRENT или ссылка planned/external.
- **Источник/время:** `EXTRA_SOURCES.trace=['requirements','architecture','implementation']`, плюс **собственные** предметные `trace.links`. Это не просто селектор: links содержат авторские correspondence facts; связь N:M возможна, нормализовать Requirements на их основании нельзя.
- **Связи (D/S/N/L/C):** **D:** [Requirements](#requirements), [Architecture](#architecture), [Implementation](#implementation), [Explorer](#explorer) — использует одни factual модели плюс собственные trace.links, а не новую копию Requirements. **S:** выбор требования меняет `trace.selectedRequirementId` (не создаёт requirement), фактическое наличие файла проверяется по текущему `implementation.files`. **N:** из Trace нет прямой кнопки открыть другие виды; [Requirements](#requirements) содержит кнопку открытия Trace.
- **Код:** AdditionalContent `kind === 'trace'`; [extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts) `SupplementalStore.trace.links`/`EXTRA_SCHEMAS.trace`/`EXTRA_SOURCES.trace`; [SimulatorProfile.tsx](../../src/profiles/architecture-simulator/SimulatorProfile.tsx) `ProjectionReferences`; [history.ts](../../src/profiles/architecture-simulator/history.ts) `historySources('trace')`.
- **Решение/граница:** `P6R-PR-05` признал собственные links источником history/projection, а `P6R-PR-06` дал предупреждения для отсутствующих refs без запрета всех черновиков; [remediation](../../../PT006_REMEDIATION_2026-10-10.md). Trace не доказывает универсальную ontology связей и не делает planned файл фактическим.
- **Проверка:** выбрать `R-A3` до реального создания onboarding-файла: связь может отображаться, но статус должен быть PLANNED/external. **UI:** один на экран; `screen-3/panel-9`.

<a id="impacthistory"></a>
### 18. `impactHistory` — Impact History / Future

- **Вопрос:** что уже **фактически** менялось у выбранной ответственности/файла и какие **условные будущие** воздействия на него перечислены в плане?
- **Показывает:** `impactHistory.selectedTargetRef`, последовательность actual `StateChange` из архивных архитектур/файлов, отдельно planned `impact.records` с `stepId`, route/reason/affected files. Это два разнородных списка, не одна временная линия исполненных Steps.
- **Источник/время:** `EXTRA_SOURCES.impactHistory=['events','architecture','implementation','impact','plan']`; `actualImpacts(data,target)` читает factual `history.frames` до фактического курсора, а `plannedView` включает impact выбранной PlanRevision. Даже совпадающий ref не делает запланированное изменение произошедшим.
- **Связи (D/S/N/L/C):** **D:** [Architecture](#architecture), [Impact](#impact), [Implementation](#implementation), [Plan](#plan), [Explorer](#explorer) — archive actual frames и plan/impact; **C:** фактические дельты и отдельные условные будущие воздействия. **S:** selector меняет `impactHistory.selectedTargetRef` и фильтрует оба списка. **N:** из этого вида прямого перехода нет; Architecture и Implementation могут открыть Impact History, **но не передают targetRef**.
- **Код:** AdditionalContent `default impactHistory`; [history.ts](../../src/profiles/architecture-simulator/history.ts) `actualImpacts`, `diffState`, `plannedView`; [HistoryContent.tsx](../../src/profiles/architecture-simulator/HistoryContent.tsx) `ChangeList`; extraContent.ts `EXTRA_SOURCES.impactHistory`.
- **Решение/граница:** F-P-03 inventory фиксировал **отсутствие фактической истории на ранней версии**; позже добавлена в scripted fixture (§8 inventory), затем `P6R-PR-05` расширил чтение actual architecture/files ([remediation](../../../PT006_REMEDIATION_2026-10-10.md)). Старую запись не стирать и не цитировать как текущий дефицит в неизменном виде.
- **Проверка:** выбрать текущий файл, увидеть фактические дельты и отдельные условные impacts без смешивания IF/ELSE. **UI:** один на экран; `screen-4/panel-12`.

## Сводная карта взаимодействий и границ реализации

**Прямые N-кнопки:** `events → explorer`; `requirements → trace`; `architecture → impactHistory`; `implementation → impactHistory`; `work → fitness / hotpaths`; `current → architecture / requirements / implementation`. Остальные связи в карточках — D или S, не вымышленные переходы. Все виды доступны через универсальный каталог независимо от предметных кнопок.

**Существенные совместные S:** `events.selectedId` влияет на исторические факты связанных видов; выбор Step в `plan` выбирает также planned ref и impact; архивная PlanRevision в `PlanHistory` влияет на плановые проекции через `plannedView`, **не** на фактический CURRENT; `explorer` при выборе события тоже меняет общий factual cursor. Локальные настройки `current/axes/forecasts/...selected*` обычно не синхронизируют «одноимённые» селекторы других видов.

**Механика окон:** `maxPerScreen`, min-size, `INITIAL_WORKSPACE` определяются [реестром профиля](../../src/profiles/architecture-simulator/workspace.ts); поиск/создание/подсветка таба — [Shell](../../src/shell/WorkspaceShell.tsx), domain selections остаются в [SimulatorProfile.tsx](../../src/profiles/architecture-simulator/SimulatorProfile.tsx).

**Материал с отличным от самостоятельного content kind статусом:** Plan.activities, forecast requirements, route expectations, completion forecast vs deadline, work.details, costFacts, deadline outcomes — реальные **разделы существующих 18 видов** в content-v6, а не «пропущенные типы» ([PT-006 remediation](../../../PT006_REMEDIATION_2026-10-10.md)). Optional Runtime/Data Topology, Implementation Guidance, Ownership/Deployment и code sketch остаются кандидатными будущими проекциями ([CONTENT_SYSTEM — решения/ограничения](CONTENT_SYSTEM.md)).

**Если каталог будет пересматриваться:** сохранять историческую систему смыслов/ownership и trace даже при объединении окон; менять пользовательский UX после отдельного решения по F-U-01, а не считать DRY-документ разрешением автоматически сократить 18 видов.

\n