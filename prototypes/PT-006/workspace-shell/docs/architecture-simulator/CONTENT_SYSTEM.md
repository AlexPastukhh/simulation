# Architecture Simulator — система содержимого и связей

**Назначение:** единая входная карта того, *что* изучает пользователь, *где* живут факты и планы и *как* взаимодействуют 18 представлений. Подробные карточки — в [CONTENT_VIEWS.md](CONTENT_VIEWS.md). Этот документ описывает текущий PT-006 и не утверждает весь `SC-001/V3A` как принятый нормативный baseline.

**Проверенная основа:** локальный профиль `prototypes/PT-006/workspace-shell/src/profiles/architecture-simulator/`, content-v6, 18 идентификаторов `CONTENT`. На момент создания документа перенос профиля и изменения Shell присутствуют **в рабочем дереве, но не в Git HEAD** (`5c5c754`); ссылки на относительные файлы ниже относятся именно к локальной структуре. Дата сверки: 2026-10-10.

## Зачем существуют эти виды

Пользователь исследует **одно приложение** и два варианта его архитектурной реализации (A/B): что было известно в прошлом, что фактически произошло, какой Plan существовал тогда, какие альтернативы и последствия рассматривались, что было сделано и чем отличаются исходы. Это **подготовленный авторский сценарий** (scripted fixture), а не универсальный движок вычисления причинности, исполнения Steps или вероятностей.

Есть три уровня, которые нельзя отождествлять: **предметная модель** хранит факты и планы; **content view** отображает/исследует эти модели; **Workspace/Shell** размещает экземпляры видов по окнам и экранам. Два окна с одним видом не означают две независимые версии истории. Закрытие вкладки не удаляет её данные.

## Общая граница истины — определения только здесь

| Термин | Смысл и запрет неверной интерпретации | Код / решение |
|---|---|---|
| **ACTUAL / фактическое событие** | Источник исторически произошедшего в подготовленном кейсе. События могут быть общими внешними или зависеть от архитектурной ветки. Выбор события — **выбор исторического курсора**, а не создание нового события. | [events в content.ts](../../src/profiles/architecture-simulator/content.ts), `navigationEvents`, `atCursor` в [history.ts](../../src/profiles/architecture-simulator/history.ts); [SC-001 §2](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md) |
| **CURRENT** | Фактические известные требования, архитектура и файлы **на выбранный Actual cursor**. Отсутствующий архивный frame нельзя подменять последним состоянием. | `atCursor`, `factualValue` в history.ts; [remediation PR-02/03](../../../PT006_REMEDIATION_2026-10-10.md) |
| **Plan / PlanRevision / BASE** | **Один Plan**, включая Steps, прочие действия, прогнозы, условия и сроки; каждая сохранённая ревизия имеет свой неизменяемый исходный фактический контекст BASE. BASE не является текущим CURRENT. **Отдельного хранимого Evolution Map нет**. | `PlanRevision`, `plannedView` в history.ts; [SC-001 §3](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md) |
| **Evolution Step** | Планируемое действие, изменяющее функциональность или код/реализацию. Подготовительные проверки, переговоры, координация и ожидание могут быть работой внутри Plan, но не обязаны быть Step. Выбор и применимость Step **не исполняют** его. | `PlannedStep` в content.ts, `PlanActivities` в [MaterialContent.tsx](../../src/profiles/architecture-simulator/MaterialContent.tsx); SC-001 §3 |
| **PLANNED snapshot / impact** | Полная целевая архитектура после Step и **отдельное** влияние этого Step на ответственности/файлы. Плановые CREATE/MODIFY и снимки не добавляют файлов и архитектурных фактов в CURRENT. Несовместимые IF/ELSE impacts нельзя суммировать. | `resolveSnapshot`, `plannedView`, `planningSnapshots` в history.ts |
| **FORECAST** | Предполагаемое событие, конкретная потенциальная потребность, направление изменений, оценка завершения или ожидание маршрута. Даже точный прогноз не превращается в Actual Event/Requirement автоматически. | `plan.anticipatedEvents`, `plan.changeAxes`, `completionForecast`; [material.ts](../../src/profiles/architecture-simulator/material.ts) |
| **Deadline / completion forecast / actual outcome** | Обязательный/обещанный срок, ожидаемая дата завершения и фактически зафиксированный исход — **разные сущности**. Пересмотр оценки не переносит обещание сам по себе. | `ForecastDetails`, `WorkDetails` в MaterialContent.tsx; [remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **A/B и общий якорь** | Один старт, общие архитектурно-независимые стимулы; разные последствия допускаются при объяснённой причинной зависимости от реализации. Branch-local знания могут различаться; автор знает подготовленное будущее, но условная команда прошлого — нет. | `seedExtra`, `shared`, `createBranch`; [SC-001 §2/4](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md) |
| **State vs JSON Schema** | State — реально сохранённые объекты и селекторы; JSON Schema — **допустимая структура**, в том числе для объектов с нулём текущих экземпляров. View selector не является отдельной копией исходной модели. | `SCHEMAS` / `EXTRA_SCHEMAS`, `ProjectionReferences` в SimulatorProfile.tsx |
| **History / replay граница** | Архивные event-linked `HistoryFrame` и `PlanRevision` — сохранённые снимки **авторского кейса**. Прямое JSON-редактирование текущего State не становится Actual Event и не переписывает архив. Не обещается replay произвольных пользовательских событий. | `createFixtureHistory`, `diffState`, `historySources`, `StateHistory` |

## Один источник данных — несколько представлений

```text
Architecture Simulator profile  (локальный пример для универсального Shell)
├─ Общий сценарный контекст: scenario (+ anchors)
├─ Фактическая история: events + history.frames
│  ├─ requirements (известные потребности)
│  ├─ architecture (фактические snapshots)
│  ├─ implementation (фактические files)
│  └─ work (наблюдения, episodes, hot paths и исходы)
├─ Единый Plan: plan + history.revisions
│  ├─ planned snapshots / architecturePlan
│  ├─ planned impact / impact
│  ├─ forecasts / deadlines
│  └─ planned axes
├─ Оценочные свидетельства: fitness
└─ Производные исследовательские проекции:
   current, explorer, comparison, trace, hotpaths, impactHistory
   (они читают перечисленные модели, а не создают альтернативную историю)
```

**Владение данными** сверяется по `ContentStore` в [content.ts](../../src/profiles/architecture-simulator/content.ts) и по `EXTRA_SOURCES` в [extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts). У `scenario` есть собственный сценарный материал, у `trace` — собственные подготовленные `links`; остальные дополнительные виды преимущественно держат выбор/настройки просмотра. В `fitness` собственные оценки, но нет глобального скалярного балла. Исторический архив хранится отдельно от открытых окон.

## Взаимодействия: данные, действия и смысловые отношения

**D — общие предметные данные:** два вида действительно читают один source model (напрямую либо через `knownRequirements`, `atCursor`, `plannedView` или другой проверенный helper). Выбор объекта в одном **не обязан** менять селектор другого. Например, `forecasts` и `axes` читают данные одного Plan. Для дополнительных видов исходные декларируемые модели перечислены в `EXTRA_SOURCES` ([extraContent.ts](../../src/profiles/architecture-simulator/extraContent.ts)); дополнительно проверяются фактические обращения в renderer. D *не означает* общей UI-выборки или автоматической синхронизации.

**S — изменение выбора/предметного контекста:** вид меняет поле выбора в store. Пример: клик `Actual Events` задаёт `events.selectedId` и очищает `history.selectedRevisionId` — связанные виды получают фактический срез; выбор Step в Plan также обновляет `impact.selectedImpactId` и `architecture.selectedRef/selectedContext`. Это **не исполнение Step** и не появление новых Actual Events.

**L — предметная ссылка / смысловая зависимость:** виды используют **разные** источники, связанные по ID, причинному объяснению или задаче. Например, `impact.filePaths` ссылается на пути из `implementation`, а Step — на `impactRef`. L не означает автоматически общий источник, синхронизацию выбора или доступную кнопку.

**C — сопоставление разнородных данных:** пользователь может сравнивать прогноз и факт, например `axes` и `hotpaths`, или фактические данные A/B. У C сохраняются исходные различия: Plan не превращается в Work, ветка A не перезаписывает B. C не гарантирует отдельного автоматического алгоритма или прямой кнопки между видами.

**N — переход к другому виду через Shell:** явная кнопка отправляет `{ type: 'open-content', target: { profileId, instanceId } }`. Shell ищет вкладку (на текущем и других экранах), делает её активной или создаёт окно и подсвечивает. **Сам переход не изменяет предметный State и его селекторы.** Полный механизм — [shell/contracts.ts](../../src/shell/contracts.ts) и [WorkspaceShell.tsx](../../src/shell/WorkspaceShell.tsx); вызовы — `openView` в DomainContent.tsx / AdditionalContent.tsx. **Не путать типовую D-связь с реально существующей N-кнопкой**.

### Подтверждённые явные N-переходы в текущем UI

| Откуда | Куда | Что передаётся | Код |
|---|---|---|---|
| `events` | `explorer` | Только адрес вкладки; explorer читает фактический курсор | `DomainContent`, ветка `events` |
| `requirements` | `trace` | Только открытие вида, не новый выбор требования | `DomainContent`, ветка `requirements` |
| `architecture` | `impactHistory` | Только открытие; выбор цели в истории может быть своим | `DomainContent`, ветка `architecture` |
| `implementation` | `impactHistory` | Только открытие; цель истории не меняется автоматически | `DomainContent`, ветка `implementation` |
| `work` | `fitness`, `hotpaths` | Два отдельных вызова `openView` | `DomainContent`, default `work` |
| `current` | `architecture` / `requirements` / `implementation` | Адрес определяется выбранным разделом current | `AdditionalContent`, ветка `current` |

В [каталоге](CONTENT_VIEWS.md) связи размечены D/S/N/L/C: метки источника, выбранного состояния, навигации, ссылки и сравнения **не взаимозаменяемы**. Текущие явные N-переходы перечислены выше; прочим связям нельзя приписывать несуществующие кнопки. Глобальный каталог/инспектор также может найти окно с видом через действие Shell; это отдельная общая навигация, не предметное ребро между видами.

## Границы Workspace и профиля

- **Shell:** экраны, окна, экземпляры вкладок, геометрия/drag/fit, колесо, режим просмотра, событие открытия, layout и свойства отображения. Не знает `PlanRevision`, A/B, `ContentKind` симулятора, Actual или модели требований. [Shell README](../../src/shell/README.md).
- **Architecture Simulator Profile:** регистрирует все 18 видов и их ограничения, хранит A/B и предметные State/History, рендерит виды и инспектор, выполняет миграции контента. [SimulatorProfile.tsx](../../src/profiles/architecture-simulator/SimulatorProfile.tsx), [profile README](../../src/profiles/architecture-simulator/README.md).
- **Текущий scope:** подключён один активный профиль; другой симулятор и реальный Markdown Viewer ещё не реализованы. Общая адресация `profileId + instanceId` допускает разные экземпляры одного типа, но сама по себе не является системой загрузки плагинов.
- **Ограничения размещения:** `maxPerScreen: 1` или `null`, `minWidth/minHeight` и стартовые панели — **UI-конфигурация** текущего каталога, не теорема о числе возможных предметных фактов. См. [workspace.ts профиля](../../src/profiles/architecture-simulator/workspace.ts).
- **Сохранение:** текущие content-v6 и layout-v3 раздельны, ветки A/B независимы; открытие/закрытие окна не меняет фактическую историю. См. [WSC-PR-04](../../../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md).

## Как пользоваться общей картой

| Задача читателя | Начните здесь | Затем проверьте |
|---|---|---|
| «Что было известно в выбранный момент?» | [Actual Events](CONTENT_VIEWS.md#events), [Current State](CONTENT_VIEWS.md#current) | [Requirement Model](CONTENT_VIEWS.md#requirements), [Architecture](CONTENT_VIEWS.md#architecture), [Implementation](CONTENT_VIEWS.md#implementation) |
| «Что планировалось и почему?» | [Plan](CONTENT_VIEWS.md#plan) | [Architecture Planning](CONTENT_VIEWS.md#architectureplan), [Forecasts](CONTENT_VIEWS.md#forecasts), [Planned Axes](CONTENT_VIEWS.md#axes) |
| «На что повлияет Step/изменение?» | [Evolution Impact](CONTENT_VIEWS.md#impact) | [Impact History / Future](CONTENT_VIEWS.md#impacthistory), [Implementation](CONTENT_VIEWS.md#implementation) |
| «Какую работу пришлось выполнять?» | [Work](CONTENT_VIEWS.md#work) | [Fitness](CONTENT_VIEWS.md#fitness), [Actual Hot Paths](CONTENT_VIEWS.md#hotpaths) |
| «Почему A/B разошлись?» | [Scenario](CONTENT_VIEWS.md#scenario) | [Comparison](CONTENT_VIEWS.md#comparison), [Explorer](CONTENT_VIEWS.md#explorer) |
| «Как потребность связана с кодом?» | [Requirements](CONTENT_VIEWS.md#requirements) | [Trace](CONTENT_VIEWS.md#trace), [Implementation](CONTENT_VIEWS.md#implementation) |

[Все 18 видов и их точные кодовые якоря →](CONTENT_VIEWS.md)

## Происхождение решений: индекс действующих и исторических развилок

**Правило индекса.** Каждая строка сохраняет source ID, статус *на момент источника* и поздний подтверждённый исход. Индекс не заменяет исходные документы и не делает SC-001/V3A нормативно принятыми. Полнота индекса ограничена решениями, которые затрагивали **нынешние виды, их данные, взаимодействия, историю, схему или размещение**. Не относящиеся непосредственно к 18 видам гипотезы из V3A/N/FR/SRU остаются в оригиналах и доступны по ссылкам ниже. Нельзя читать «implemented in prototype» как «full scenario baseline committed».

| Исходный ID / provenance | Исторический статус → поздний исход | Как отражено сейчас, что остаётся открытым | Источник |
|---|---|---|---|
| **Single Plan / no Evolution Map** (user; SC-001 v5 §3; V3A r7 ранее) | Пользовательское уточнение принято; прежний EvolutionMapRevision **superseded**, но остаётся историческим предложением | Единый [Plan](CONTENT_VIEWS.md#plan); карта архитектуры — projection, не второй источник Plan | [SC-001](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r7](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md) |
| **F-P-01 → PR-01** (content inventory review) | Problem текущего на тот момент UI; PR-01 — **selected candidate, implemented**, finding mitigated | [Current](CONTENT_VIEWS.md#current) и [Architecture Planning](CONTENT_VIEWS.md#architectureplan) отделяют факт от планового снимка; исходная [Architecture](CONTENT_VIEWS.md#architecture) остаётся комбинированным UX-вариантом; merge **не принят** | [Inventory §3](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md) |
| **F-P-02 → PR-02** (content inventory review) | Problem отсутствия сравнения/навигации; PR-02 — **selected candidate, partially implemented**, mitigated для scripted case | [Comparison](CONTENT_VIEWS.md#comparison), [Explorer](CONTENT_VIEWS.md#explorer), [Trace](CONTENT_VIEWS.md#trace) показывают подготовленные evidence; универсального causal graph нет | [Inventory §3](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md) |
| **F-P-03 → PR-03A / PR-03B** (content inventory review + later historical fixture extension) | Изначально **deferred / оба pending**: A — настоящая event-linked History, B — пустая вкладка для видимости. После расширения fixture по указанию пользователя **PR-03A selected & implemented**, **PR-03B superseded**. Исходный review не переписывался | [History](CONTENT_SYSTEM.md) и [Explorer](CONTENT_VIEWS.md#explorer), [Impact History](CONTENT_VIEWS.md#impacthistory) читают prepared frames/PlanRevisions. Нет generic replay произвольных событий и редактирований | [Inventory §3 и §8 — историческое дополнение](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md) |
| **F-P-04 → PR-04** (inventory) | Problem ложной миграции generic notes/metrics/diagram в доменные kinds, **resolved; candidate selected/implemented** | Миграция сохраняет layout geometry, но не придумывает эквивалентный доменный вид. Совместимость сохранённого v3 симулятора — отдельный переход | [Inventory §3](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md), [WSC](../../../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md) |
| **F-P-05 → PR-08** (inventory) | Problem: source Schema проекций не видна в Inspector; PR-08 **selected candidate, implemented/resolved** | Inspector раскрывает **собственный View State/schema** и **исходные canonical State/Schema** для проекций, не копируя Plan/Events в отдельный source. Для Comparison доступны A/B | [Inventory §3](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md), [SimulatorProfile.tsx](../../src/profiles/architecture-simulator/SimulatorProfile.tsx) |
| **F-R-01 → PR-05** (inventory) | Риск произвольного JSON-редактирования ссылок; **PR-05 pending** для полного ссылочного контракта/Stage A. Позднее конкретное предупреждение **P6R-PR-06 committed/implemented** смягчило риск для content-v6, не заменило все проверки | Предупреждения не запрещают сохранение черновика; canonical ref integrity для произвольного engine **не доказана** | [Inventory §4](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md), [Remediation PR-06](../../../PT006_REMEDIATION_2026-10-10.md) |
| **F-U-01 → PR-06A / PR-06B** (inventory) | **Decision Uncertainty open**: A выбран для текущего UX-эксперимента (18 видов), B — альтернативный ранний merge, **не принят**; окончательный выбор **USER_REQUIRED** | Возможные группы: [Current/Architecture/Architecture Planning](CONTENT_VIEWS.md#architecture), [Plan/Forecasts/Axes](CONTENT_VIEWS.md#plan), [Work/Hot Paths](CONTENT_VIEWS.md#work), [Impact/Impact History](CONTENT_VIEWS.md#impact). Trigger: пользовательский UX-осмотр видов | [Inventory §4 и Review Log](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md) |
| **F-O-01 → PR-07** (inventory) | **Improvement Opportunity, deferred; PR-07 pending**, не Problem. Дополнительная кнопка «добавить sample screens без сброса» обсуждалась как обратимая UX-возможность | Примерные экраны уже в fresh layout; дополнительная кнопка не обязательна. **Revisit:** пользователь реально затрудняется обнаружить виды в ранее сохранённой раскладке | [Inventory §4, §7](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md) |
| **P6R-F-P-01 → P6R-PR-01A / P6R-PR-01B, P6R-F-U-01** (independent review → remediation) | Исходная проблема незакрытого материала по Plan, work, forecast, deadline/cost. A — добавить разделы к существующим видам, B — новые kinds. **01A committed & implemented** для content-v6; **01B не выбран** для этой итерации. Fork состава разрешён *для remediation*, не навечно | [Plan](CONTENT_VIEWS.md#plan), [Forecasts](CONTENT_VIEWS.md#forecasts), [Work](CONTENT_VIEWS.md#work), [Fitness](CONTENT_VIEWS.md#fitness). Дальнейший UX merge/разделение остаётся в F-U-01 | [Independent review §2–4](../../PT006_independent_content_review_2026-10-10.md), [Remediation §принятый состав](../../../PT006_REMEDIATION_2026-10-10.md) |
| **P6R-F-P-02 → P6R-PR-02** | Старая PlanRevision могла показывать плановый payload как ACTUAL при совпадении ID; **committed & resolved** в content-v6 | Контекстные [Architecture](CONTENT_VIEWS.md#architecture), [Architecture Planning](CONTENT_VIEWS.md#architectureplan), функция resolveSnapshot(actual/planned) | [Review §P6R-F-P-02](../../PT006_independent_content_review_2026-10-10.md), [Remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **P6R-F-P-03 → P6R-PR-03** | Live reorder событий менял знание архивного прошлого; **committed & resolved** | Отдельные archived event facts и navigationEvents для ленты; [Events](CONTENT_VIEWS.md#events), [Current](CONTENT_VIEWS.md#current), [Requirements](CONTENT_VIEWS.md#requirements) | [Review §P6R-F-P-03](../../PT006_independent_content_review_2026-10-10.md), [Remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **P6R-F-P-04 → P6R-PR-04** | Исторический diff не сообщал значимого изменения порядка элементов; **committed & resolved** для объявленных ordered collections | Порядок учитывается для events.records, plan.steps и plan.activities в [history.ts](../../src/profiles/architecture-simulator/history.ts); *не обещается* универсальный diff любых массивов | [Review §P6R-F-P-04](../../PT006_independent_content_review_2026-10-10.md), [Remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **P6R-F-P-05 → P6R-PR-05** | Собственные trace.links и factual architecture/file sources отсутствовали в части History/Inspector; **committed & resolved** для указанного источника | [Trace](CONTENT_VIEWS.md#trace), [Explorer](CONTENT_VIEWS.md#explorer), [Impact History](CONTENT_VIEWS.md#impacthistory) получают фактические/собственные sources, а не только Plan/Impact | [Review §P6R-F-P-05](../../PT006_independent_content_review_2026-10-10.md), [Remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **P6R-F-R-01 → P6R-PR-06** | Risk ссылочной целостности; **PR-06 committed, implemented/mitigated**. Отличается от старой pending PR-05 с более широкой областью | Validation предупреждает о missing targets/refs, **не блокирует** draft; точная целостность произвольной симуляции не доказана | [Review §P6R-F-R-01](../../PT006_independent_content_review_2026-10-10.md), [Remediation](../../../PT006_REMEDIATION_2026-10-10.md) |
| **WSC-PR-01 / 02 / 03 / 04** (user) | **Committed user scope; locally implemented, uncommitted Git** | Generic open-content, tab scroll, viewing mode, Simulator-as-Profile. [Shell](../../src/shell/README.md) не владеет предметными моделями; 18 видов живут в профиле | [Workspace interactions](../../../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md) |
| **SC-001 v5, SRU-1…7, V3A r7–r10** | **Полная Scenario/V3A composition — CANDIDATE / TRANSACTION OPEN**; отдельные принятые пользовательские границы из них не принимают весь состав | Текущий PT-006 — scripted demonstration и ограниченная remediation, не готовность всех SRU, не универсальный event/causal simulator | [SC-001 v5](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r10](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md) |

**Что сознательно не индексируется построчно:** все candidate N/FR/P из V3A r3–r10, если они не влияли на реализацию/границы конкретных 18 видов; их архивные версии сохраняются в [исходной композиции r7](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md) и её [r10 delta](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md). Это **предел полноты индекса**, а не заявление, что других исторических смыслов не существовало. Для расширения индекса нужно отдельное решение о scope.

### Что сознательно НЕ является отдельным видом сейчас

**Object/Collection/JSON Schema** — предметные структуры и инспектор, не 19–21-е окна. **Calendar** — даты в Events/Plan, не обязательная отдельная линия времени. **Evolution Map** — устаревший второй Plan. **Evolution Option** — пока выражается условием/планом. **Runtime/Data Topology**, **Ownership/Deployment**, **Implementation Guidance**, **Code Sketch** — возможные дополнительные *проекции* из старых candidate; не обязательства текущего прототипа. Monte Carlo, автоматический causal engine, IDE, постоянный генератор кода не реализованы и не выводятся из наличия демонстрационных карточек. Основания: [Content inventory §2](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md), [V3A r7 P-47/P-48](../../../../../architecture_simulator_proposal_composition_v3a_candidate_r7.md), [SC-001 v5 §8](../../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md).

### Не снятые вопросы / границы проверки

- **UX состава:** объединять ли похожие виды в будущем (`architecture/current/architecturePlan`, `plan/forecasts/axes`, `work/hotpaths`, `impact/impactHistory`)? Решение остаётся **USER_REQUIRED**, не меняем число видов в этой документационной работе; [inventory F-U-01](../../CONTENT_INVENTORY_REVIEW_2026-10-10.md).
- **Проверка cross-reference:** предупреждения для черновиков не означают, что любые пользовательские JSON-изменения семантически консистентны; [remediation P6R-PR-06](../../../PT006_REMEDIATION_2026-10-10.md).
- **Автоматический replay/causality:** доступна история сохранённых scripted frames, **не** произвольный динамический симулятор. Пользовательская семантическая приёмка всех сценариев и полная исходная переписка не подтверждены.
- **Версия и URL:** локальные рабочие файлы перемещены в профиль, но публичный `main` может пока содержать прежнюю структуру. Ссылки относительны к будущему согласованному commit, их нельзя выдавать за существующие GitHub URLs до push.

## Кому что менять

Для нового типа — сначала определить предметные источники/временную границу, затем зарегистрировать [CONTENT](../../src/profiles/architecture-simulator/workspace.ts), его schema/state, renderer/инспектор и [карточку](CONTENT_VIEWS.md). Для изменения существующего вида — проверить его D/S/N/L/C связи и provenance. Для изменения общего механизма окна — менять Shell, **не** смысл симуляции. **Не** редактировать исторические review задним числом; новые решения фиксируются новыми записями со ссылками на их прежние ID.

\n