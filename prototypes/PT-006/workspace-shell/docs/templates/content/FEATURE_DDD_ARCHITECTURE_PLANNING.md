# Feature/DDD Architecture Planning

Content Template feature-ddd-architecture-planning **v2** имеет один сохраняемый экземпляр architecture-main.

## Данные Content Instance

ArchitecturePlanning содержит representation: feature-ddd-planning, current: FeatureArchitecture и steps: EvolutionStep[]. Поэтому экземпляр владеет полным текущим Plan: фактом CURRENT и независимыми плановыми targets.

FeatureArchitecture содержит representation: feature-ddd и nodes[]. У узла есть ID, kind, title, необязательные parentId и usedByFeatureIds. Единственный список видов — ARCHITECTURE_NODE_KINDS в [модели](../../../src/templates/content/feature-ddd-architecture-planning/model.ts); из него получен TypeScript-тип, его используют валидатор и UI.

Владение parentId не содержит циклов. usedByFeatureIds ссылается только на реальные Features. IDs уникальны, названия непустые.

## CURRENT, Plan и History

Выбор Step показывает его target и не изменяет CURRENT. Новый Step получает независимую копию выбранной цели либо CURRENT. Исторические и рабочие Steps проходят один validateEvolutionSteps: CURRENT зарезервирован и не может быть ID шага.

History — отдельный cross-content архив факта, требований и плана, созданный явным действием. Архивный просмотр read-only; CURRENT всегда разрешается непосредственно в фактический снимок. ISO-дата и IDs события проверяются.

Курсор CURRENT/Step/History — UI-состояние, не часть предметной записи. Навигация не переписывает Architecture Planning или Requirements.

## Сохранение и прежняя новая форма v1

Ключ browser storage сохранён; payload имеет version:2. Предыдущие single-architecture v1-сохранения валидируются и переводятся в новую форму в памяти. Hydration и просмотр исходный raw не меняют. При первом успешном предметном изменении точные bytes v1 архивируются до замены; отказ архива не перезаписывает исходник. Context/A/B и другие legacy formats не читаются.

Общий guarded commit архитектуры и Markdown отклоняет stale write, проверяет read-back и показывает ошибку. Web Locks сериализуют participating вкладки при доступном API; без него остаётся проверка прочитанных bytes, без обещания атомарного multiwriter.

[Workspace и ключи](../../workspace/README.md) · [Проверка состояния](../../../src/profiles/single-architecture/state.ts) · [Редактор](../../../src/profiles/single-architecture/SingleArchitectureProfile.tsx)

## Восстановленные подробности того же Plan

Optional details содержит activities, forecasts, routeExpectations, deadlines, completionForecasts и changeAxes. Это данные того же Architecture Planning Instance, не второй Plan. Их исполняемая JSON Schema находится в simulation-material/model.ts; неизвестные поля и неверные даты отклоняются.

Вид Architecture Planning имеет собственный selector CURRENT/Step и показывает полный Feature/DDD-снимок. Прежнее отдельное Architecture больше не зарегистрировано. Historical checkpoint может содержать отдельную копию деталей Plan; отсутствие этой записи не заменяется live-данными.

[Полный каталог окон и источников](../../architecture-simulator/CONTENT_VIEWS.md)
