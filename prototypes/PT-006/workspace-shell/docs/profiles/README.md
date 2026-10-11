# Профили — содержимое и создание Context

**CURRENT / G-CODE-03.** В прототипе подключён **один** [Architecture Simulator Profile](architecture-simulator/README.md). Профиль предоставляет содержание, типы видов, State, предметные операции и Context Templates; Shell предоставляет отображение, навигацию и размещение. Не путать один профиль с одним Context: теперь **несколько Context одного профиля** могут быть видны на одном Workspace Screen.

## Текущий контракт

[src/shell/contracts.ts](../../src/shell/contracts.ts) определяет `WorkspaceProfile`: `id`, `descriptors`, `initialWorkspace`, `contextId/contexts`, ключи layout, миграцию, `renderContent`, `renderPanelTools`, инспектор и команды.

Для общего Workspace теперь доступны **опциональные** механизмы:
- `contextTemplateOptions`: список возможных Context Templates.
- `createContext(templateId)`: подготовка независимого профильного State, собственных дескрипторов и предложенных экранов; профиль предоставляет `commit()` для сохранения **после** проверки полного экранного набора Shell.
- `resolveContentAddress({profileId,contextId?,instanceId})`: разрешение контекстного адреса вида в отдельную внутреннюю вкладку, без неявной подстановки другого Context.
- `compositionContextIds` / `prepareComparison({leftId,rightId})`: профильное определение готового/ручного Comparison. Shell валидирует размещение и вызывает `commit` **только после успеха**. Сам профиль проверяет источники, применимость и read-only эффекты.

Контракт также сохраняет `screenTemplates` / `screenBundles` для экранных рецептов. Их не следует путать с Context Template: **«+ Экран» остаётся универсальным**, а создание профильного комплекта экранов идёт через **«+ Контекст»**.

[src/App.tsx](../../src/App.tsx) переключает старые отдельные A/B раскладки и общий Workspace, используя один `useSimulatorProfile()`, без подключения второго независимого профиля.

## Что предоставляет Architecture Simulator

- **A и B:** два независимых исторических `DemoStore`, с существующими `content-v6` и `layout-v3` ключами.
- **Architecture Evolution:** новый Context получает копию State A по умолчанию, provenance и **четыре тематических экрана**. Каждая копия редактируется и сохраняется отдельно.
- **Минимальный контекст:** один экран с заметками и требованиями, **без History**. Это рабочий пример, что Context не обязан быть завершённой симуляцией.
- **Существующие 18 видов:** JSON Schema, данные и предметные операции продолжают принадлежать профилю. В общем Workspace у каждого вида есть явная принадлежность Context.

## Реализованный Scope и оставшийся кандидат

**Один типизированный Scope Mechanism для Comparison двух совместимых Architecture Context реализован** в [коде профиля](../../src/profiles/architecture-simulator/scope-mechanisms/comparison.ts): он читает два явных `ResourceRef`, имеет `allowedEffects:['read']` и отдельную область представления, проверяет доступность и совпадение сценарных якорей. Сфера механизма ограничена **одним профилем**, несмотря на участие нескольких Context. **Межпрофильный runtime и другие Scope Mechanisms ещё не реализованы**. Текущий `comparison` по-прежнему специально программируется для A/B. [Кандидатная архитектура](../workspace/CANDIDATE_MODEL.md) объясняет будущее разделение: общие механизмы в Shell, механизмы одного профиля (включая межконтекстные) — внутри него, требующие нескольких профилей — в integrations, узкие — у владельца с исполняемой проверкой применимости. Теперь существует только предметная папка `src/profiles/architecture-simulator/scope-mechanisms/`, поскольку в ней действительно размещён механизм сравнения. Универсальной папки `src/shell/scope-mechanisms/` и интеграционных Scope-модулей пока нет.

[Индекс](../README.md) · [Shell](../shell/README.md) · [Workspace](../workspace/README.md).
