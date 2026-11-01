# PT-006 — виды содержимого и их источники

**Срез: одна архитектура, 2026-10-13.** Прочитаны прежние CONTENT_VIEWS/CONTENT_SYSTEM и принятые P6R-PR-01A, 02–06 в Git HEAD 85b6f343e5973bf904209bc19834a321c827792d. Поздние указания пользователя имеют приоритет: отдельный Architecture заменён Architecture Planning с выбором CURRENT/Step; A/B и Scope Comparison исключены; требования ненормализованные. Эти решения не разрешали удалить остальные окна.

## Полный состав четырёх экранов

| Экран | Окна по порядку |
|---|---|
| История и факты — 5 | Actual Events; Current State; Site Requirements Model; Event / Entity Explorer; Scenario / Environment |
| Архитектура и реализация — 4 | Architecture Planning; Implementation / Files; Requirement / Implementation Trace; Impact History / Future |
| Планирование — 4 | Plan; Evolution Impact; Forecasts / Deadlines; Planned Change Axes |
| Работа и результаты — 3 | Work Dynamics; Actual Hot Paths; Evolution Fitness |

Итого 16 основных окон. Architecture Planning открыт один раз, на экране «Архитектура и реализация»; Plan открывает это существующее окно. History — дополнительная вкладка Actual Events; Markdown — дополнительная вкладка Work Dynamics. Они также доступны через добавление контента. Отдельных Architecture, Cross-Architecture Comparison, Context/DemoStore и переходных адаптеров нет.

Источник размещения: [workspace.ts](../../src/profiles/single-architecture/workspace.ts). Окна не определяют владение данными.

## Карта видов

| ID / вид | Что показывает и откуда | Действие и граница |
|---|---|---|
| events / Actual Events | Явные фактические checkpoints: ID, название, ISO-дата | Выбор факта задаёт архивный курсор. Открывает Explorer. Сам выбор не создаёт событие |
| current / Current State | Фактические architecture.current, Requirements и Files рабочего состояния либо выбранного checkpoint | Не читает target выбранного Step. Открывает подробные виды |
| requirements / Site Requirements Model | requirements-main: текст, occurrences, их явные ссылки | Один независимый Content Instance. Одинаковые появления имеют разные ID; sameAs/canonical/contexts запрещены. Открывает Trace |
| explorer / Event / Entity Explorer | Выбранный факт, один выбранный объект (элемент, требование или файл) и его записанные Trace-связи | Разбор объекта отделён от общего Current State. Не подменяет отсутствующий исторический источник live-данными |
| scenario / Scenario / Environment | material-scenario: польза, концепция, путь, участники, ограничения и рабочая среда | Это предметное описание случая, не legacy Context Instance и не автоматическое утверждение глобальных FR |
| architecturePlan / Architecture Planning | architecture-main: полный CURRENT или независимый target выбранного Step | Собственный selector CURRENT/Step; показывает связи владения/использования и редактор. Выбор не исполняет Step |
| implementation / Implementation / Files | material-implementation.files — ACTUAL; effects — отдельные PLANNED изменения по Step | Плановый CREATE не создаёт фактический файл. Открывает Impact History |
| trace / Requirement / Implementation Trace | material-trace.links + фактические требования, архитектура и файлы | Подготовленные N:M соответствия не нормализуют Requirements. Различает ACTUAL/PLANNED/UNRESOLVED file и показывает неразрешённые ссылки |
| impactHistory / Impact History / Future | Сохранённые checkpoints: actual-дельты архитектуры и файлов; отдельно плановые effects | Выбор элемента/файла фильтрует результат. Первый снимок — baseline, не доказанное CREATE без предшественника |
| plan / Plan | architecture-main: CURRENT, Steps, работа из optional details и сводка | Один Plan. Подробные forecasts/deadlines и axes не дублируются здесь: переход открывает существующие виды. State / Schema даёт доступ к общему источнику. В архиве читается Plan момента факта |
| impact / Evolution Impact | material-implementation.effects: Step, действие, ответственность, путь, причина | Target архитектуры и влияние на реализацию различаются. Показывает выбранный Step либо все плановые effects |
| forecasts / Forecasts / Deadlines | architecture-main.data.details: ожидаемые события/потребности, условия маршрутов, обещания и оценки завершения | FORECAST не добавляет фактическое требование. Оценка завершения не переносит обещанный срок |
| axes / Planned Change Axes | Тот же Plan.details.changeAxes: направление, горизонт, значимость, основание | PLANNED, не Actual Hot Path. Нет скрытой генерации будущих требований |
| work / Work Dynamics | material-work: episodes по целям, activities/evidence, costFacts, deadlineOutcomes | Фактическая работа не равна Step. Unknown quantity не равно нулю; классы затрат не суммируются автоматически. Открывает Fitness/Hot Paths |
| hotpaths / Actual Hot Paths | Тот же material-work.hotPaths: путь, touches и note | Наблюдение/авторские данные, не прогноз и не автоматический Git-анализ |
| fitness / Evolution Fitness | material-fitness.assessments: цель, context/route, вопрос, migration, planAlignment, классы затрат, evidence | Нет скалярного рейтинга. Оценка читается в объявленном контексте, не объявляется вечной истиной |

## Владельцы данных

Content Instances: Architecture Planning v2, Site Requirements v1, Markdown v1 и пять восстановленных классов Scenario, Implementation, Work, Fitness, Trace v1. Plan, Forecasts и Axes используют один Architecture Planning Instance; Work и Hot Paths — один Work Instance; Files и Evolution Impact — один Implementation Instance.

Пять источников находятся в optional SingleState.materials. Детали Plan — в optional architecture.data.details. Это совместимое расширение нынешнего payload v2: прежние поддерживаемые v1/v2 читаются; открытие не записывает и не добавляет поля в исходные bytes. Metadata/constructor и формы данных не являются универсальным registry будущих плагинов.

[Модели и исполняемые JSON Schema](../../src/templates/content/simulation-material/model.ts), [редакторы представлений](../../src/profiles/single-architecture/MaterialViews.tsx), [проверка пакета](../../src/profiles/single-architecture/state.ts).

## State, Schema, запись и история

У восстановленных источников и Plan details доступны State / JSON Schema и явная проверяемая запись. Core Architecture Planning и Requirements имеют предметные редакторы и validators. Проекции Current/Explorer/Impact History читают владельцев и checkpoints; отдельной копии предметных данных у них нет.

Explicit checkpoint сохраняет фактическую архитектуру, Requirements, Steps, детали Plan и пять источников **по значению**. Архив read-only. Старый checkpoint без sources/details показывает отсутствие записи и не получает более поздние live-данные. Работа и фактические исходы берутся из fact source; условные effects, forecasts и axes остаются PLANNED/FORECAST.

Переходы в другие виды используют общий Shell openContent: существующее окно повторно используется, иначе создаётся окно текущего Workspace. Это размещение, а не изменение фактов. Проверка stale bytes, Web Locks, read-back и сообщения об отказе сохраняются.

## Границы

Это оболочка для описания и исследования явных данных. Она не сканирует файловую систему, не исполняет Steps, не вычисляет прогнозы/вероятности и не создаёт исторические события от JSON-редактирования. Новый полноценный causal/replay engine, A/B и generic Context не добавлены.

[Общая система](CONTENT_SYSTEM.md) · [Хранение и размещение](../workspace/README.md)
