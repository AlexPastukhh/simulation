# PT-006 Workspace

Один Workspace, одна архитектура и один Plan. Site Requirements, Markdown, Scenario, Implementation, Work, Fitness и Trace — самостоятельные Content Instances. Окна и экраны отображают данные; не владеют их предметными копиями.

## Полный четырёхэкранный Workspace

| Экран | Окна |
|---|---|
| История и факты (5) | Actual Events, Current State, Requirements, Explorer, Scenario |
| Архитектура и реализация (4) | Architecture Planning, Files, Trace, Impact History |
| Планирование (4) | Plan, Evolution Impact, Forecasts, Planned Axes |
| Работа и результаты (3) | Work Dynamics, Actual Hot Paths, Evolution Fitness |

Всего 16 основных окон (5/4/4/3). Architecture Planning заменяет прежнее отдельное Architecture и имеет собственный выбор CURRENT/Step. Один стандартный вид Architecture Planning показывает CURRENT/Step; Plan открывает его через общий переход. History доступна вкладкой Actual Events, Markdown — вкладкой Work Dynamics и через добавление контента. [Полный каталог видов](../architecture-simulator/CONTENT_VIEWS.md).

«+ Экран» создаёт отдельный шаблон или добавляет весь набор атомарно с новыми Screen/Window ID. Пустой экран, копирование, группы, шаблоны окон и существующий Content сохраняются. Кнопка ↺ по подтверждению заменяет размещение стандартными четырьмя экранами.

### Исправление прежних нетронутых стандартных раскладок

Известны три прежние default-композиции: один экран с тремя окнами, четыре урезанных экрана и полный набор из 17 окон с повторным Architecture Planning. Только точное совпадение композиции (ID, названия, окна, вкладки и геометрия) раскрывается в полный набор. Переключение экрана/активной вкладки не считается собственной композицией. Изменённая геометрия, состав вкладок, дополнительные экраны, поля и группы не заменяются автоматически.

Чтение исходные bytes не меняет. Первая запись после раскрытия сохраняет их в pt006-unique-views-layout-original-v1, затем подтверждает новое размещение read-back. Более ранние recovery/full-content archives не перезаписываются. Отличающаяся существующая unique-views копия или отказ записи блокирует замену и показывает предупреждение.

[Рецепты экранов](../../src/profiles/single-architecture/workspace.ts) · [Шаблон группы и его Scope-механики](../../src/templates/profiles/single-architecture/screen-groups/application-architecture/template.ts) · [Атомарное создание](../../src/shell/screenTemplates.ts)

## Хранение

| Browser key | Содержимое |
|---|---|
| pt006-single-architecture-instances-v1 | Слот предметных данных; payload version:2: Architecture Planning Instance с current/steps и optional details, отдельный Requirements Instance, optional materials пяти источников и cross-content History |
| pt006-single-architecture-view-v1 | Только курсор CURRENT/Step/History |
| pt006-single-architecture-original-v1 | Точные bytes прежнего нового v1 перед первым обновлением формы |
| pt006-single-markdown-instances-v1 | Самостоятельные Markdown Content Instances |
| pt006-single-architecture-layout-v1 | Только окна, вкладки, экраны и группы |
| pt006-full-content-layout-original-v1 | Архив предыдущего этапа полного восстановления; не перезаписывается |
| pt006-unique-views-layout-original-v1 | Точные bytes прежней нетронутой композиции перед первой записью набора без повторов |

Остальные settings/presets keys содержат только UI. Сброс Workspace меняет размещение, не предметные данные.

## Запись и просмотр

Новые модели начинаются пустыми. Step имеет самостоятельную плановую цель; его выбор не исполняет работу. History snapshot создаётся явно и не меняется при просмотре. Навигация записывает только отдельный view key и работает даже при отказе предметной записи.

Архитектура и Markdown используют общий contentStorage commit: сравнить текущие bytes с прочитанными, записать и подтвердить read-back, затем опубликовать React state. Stale write отклоняется с сообщением и предложением перезагрузить страницу. Participating writers используют Web Locks, когда API доступен. Без Web Locks сравнение предотвращает stale-сессию, но не даёт гарантии атомарных одновременно выполняющихся writes.

Неподдерживаемый или нечитаемый предметный raw сохраняется; редактирование блокируется. Ошибки Content отображаются независимо от header; Shell отдельно сообщает отказ layout/settings. Навигация при отказе view write действует только в открытой вкладке.

## Переход новой формы v1 → v2

Только прежний single-architecture v1 читается без записи и переносится в память: CURRENT/Steps входят в architecture-main.data; Requirements и исторические снимки сохраняются. Прежний cursor используется, если нет нового view key.

Первое предметное изменение архивирует исходный v1 raw перед записью v2. Неудачный архив или отличающаяся существующая копия блокирует замену. При простом открытии/просмотре migration write не происходит.

Старые Context/A/B/Scope/Markdown-форматы не читаются, не импортируются и не удаляются.

[Код профиля](../../src/profiles/single-architecture/SingleArchitectureProfile.tsx) · [Shell](../../src/shell/WorkspaceShell.tsx) · [HANDOFF и проверка](HANDOFF.md)

## Scope и видимость механик

Навигация Event/Step принадлежит общему подключению связанных представлений группы четырёх экранов. Повторные наборы остаются зеркальными; группы layout организуют rail и не создают новый cursor или Content. [Хранение Scope и observability](../shell/MECHANICS.md) задаёт определения у шаблонов, участников, локальные фильтры, доступность и фактические вызовы core/scope.
