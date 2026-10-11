# Профили — подключение содержимого к Shell

**CURRENT / G-CODE-04 (2026-10-11).** PT-006 содержит **два профиля**, использующих один и тот же `WorkspaceShell`: [Architecture Simulator](architecture-simulator/README.md) и минимальный [Markdown Fixture](../../src/profiles/markdown-fixture/README.md). В `App.tsx` пользователь выбирает **один активный профиль**. Несколько Context одного профиля могут находиться на одном Screen. Это проверка универсальности Shell, **не** одновременное смешанное Workspace двух профилей.

## Общий контракт

[src/shell/contracts.ts](../../src/shell/contracts.ts) определяет `WorkspaceProfile`: `id`, `descriptors`, `initialWorkspace`, `contextId/contexts`, ключи раскладки, миграцию, `renderContent`, инструменты и инспектор, `resetScope`.

Опциональные механизмы:
- `contextTemplateOptions` + `createContext(templateId)`: профиль подготавливает State/дескрипторы/экраны. Shell сначала проверяет раскладку, затем вызывает `commit()`; ошибка не создаёт частичного Context.
- `resolveContentAddress`: проверяет `profileId/contextId/instanceId` и не подставляет неизвестный источник.
- `compositionContextIds` + `prepareComparison`: профиль Architecture Simulator определяет **свой read-only Scope**, Shell только размещает его окна.
- `readResource(ResourceRef)`: необязательное **read-only** описание ресурса для межпрофильной проверки. Универсальный [resourceProviders.ts](../../src/shell/resourceProviders.ts) проверяет адрес, совпадение владельца и заявленную семантическую способность, но **не знает** `DemoStore` или `MarkdownContext`. Совпадение формы JSON не даёт права применить предметный механизм.

**Architecture Simulator** предоставляет подготовленные A/B `DemoStore`, Context-копии по умолчанию, минимальные заметки, 18 видов и профильный `architecture-comparison-v1`. Comparison применяется только к двум совместимым Architecture Context, даже когда приложение содержит Markdown Profile.

**Markdown Fixture** предоставляет редактируемый текстовый Markdown-документ, отдельные Context/экраны и сохранение, **не требуя** History, Actual Events или схем симулятора. В режиме Markdown кнопки A/B и профильный Comparison не выводятся.

## Граница доказанной универсальности

Проверены положительный случай (публичный `WorkspaceProfile` + Shell для второго профиля, чтение ресурсных снимков обоих профилей через `ResourceProvider`) и отрицательный (Architecture Comparison и механизм `architecture.read` неприменимы к `document.read`). Поставщики не импортируют внутренние хранилища друг друга.

**Пока не реализованы:** одновременные окна разных профилей на одном Workspace Screen, универсальные inter-profile Scope с effects/write, динамическая загрузка неизвестных профилей, общий registry permissions и всеобщая семантика view-local selections. Их не следует автоматически объявлять выполненными из-за успешного G-CODE-04.

[Shell](../shell/README.md) · [Workspace](../workspace/README.md) · [История плана](../workspace/NEXT_CODE_PLAN_CANDIDATE.md).