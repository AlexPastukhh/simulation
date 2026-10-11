# Shell — универсальная оболочка экранов и контекстов

**CURRENT / G-CODE-02 (2026-10-11).** Shell управляет экранами, окнами, вкладками, их геометрией и маршрутизацией. **Не** владеет Architecture, Actual Events, Plan, History и предметным State. [Главный индекс](../README.md) · [Работа с Workspace](../workspace/README.md).

## Реализованные механизмы

В [src/shell/workspace.ts](../../src/shell/workspace.ts) находится модель `Workspace v3` как **раскладка**, операции экранов/окон/вкладок, ограничения `ContentDescriptor` и поиск свободной геометрии. [WorkspaceShell.tsx](../../src/shell/WorkspaceShell.tsx) реализует UI, drag/fit — [windowDrag.ts](../../src/shell/windowDrag.ts), общие контракты — [contracts.ts](../../src/shell/contracts.ts).

- **Screen** — название и список Panel; **Panel** — геометрия `rect`, вкладки `tabs` и выбранный `active`.
- «**+ Экран**» предлагает только **пустой** экран и **копию текущего**. Копия получает новые screen/panel IDs, сохраняя видимое расположение и ссылки на тот же State.
- В общем Workspace «**+ Контекст**» открывает выбор Context Template, предложенный профилем. `createContext` сначала подготавливает новый State и набор экранов, Shell **целиком проверяет** раскладку через `addScreensFromTemplates`, затем вызывает `commit`; недопустимый набор не сохраняется частично. Shell не копирует предметные данные сам.
- Дескрипторы и `maxPerScreen` ограничивают размещение **конкретного адресованного вида**, а не число предметных объектов. В общем Workspace экземпляры Architecture разных Context имеют разные адреса.
- Навигация активирует вкладку, при необходимости создаёт окно, прокручивает к нему и подсвечивает. Закрытие окна/вкладки или смена экрана не удаляет Context, State или историю.
- Горизонтальное колесо вкладок не прокручивает Workspace; нижняя полоса Shell может прокручивать рабочую область; Ctrl+колесо остаётся браузеру. Режим просмотра скрывает служебную шапку окон, не скрывая их предметное содержимое.

## Адресация и навигация

Для старого A/B режима поддерживается прежнее событие:

```ts
{ type: 'open-content', target: { profileId: 'architecture-simulator', instanceId: 'architecturePlan' } }
```

В **общем Workspace** событие дополнительно содержит идентификатор Context:

```ts
{ type: 'open-content', target: {
  profileId: 'architecture-simulator',
  contextId: 'B',
  instanceId: 'architecturePlan'
} }
```

Shell проверяет `profileId`, разрешает адрес через `WorkspaceProfile.resolveContentAddress`, затем находит вкладку **в текущей раскладке**. В неизвестный Context/вид не переходит и не подставляет похожий ID. Само событие не исполняет Evolution Step.

В [contexts.ts](../../src/shell/contexts.ts) определены структурированный `ResourceRef`, `ContextInstance<T>`, `ContextTemplate<T>`, функции `scopedContentId`/`parseScopedContentId`, `scopeDescriptors`, `bindContextScreens`, `bindLegacyLayout`. Строковый ключ `context/<contextId>/<resourceId>` используется только как **внутренний таб-ID Workspace v3**, но не как универсальная идентичность предметных ресурсов.

## Два режима при одном профиле

- **Отдельные A/B раскладки:** прежний `WorkspaceProfile.contextId` переключает всю раскладку; она продолжает храниться в legacy `layout-v3`.
- **Общий Workspace:** `contextId='workspace'` и отдельный layout key; несколько Context отображаются на одних экранах. Профиль предоставляет адресованные дескрипторы, рендеринг и callback создания Context. Старые layouts и содержимое A/B при этом не перезаписываются.
- В обоих случаях подключён **один Architecture Simulator Profile**. Каталога поставщиков и общего межпрофильного runtime пока нет.

**Не реализованы:** универсальный Scope Mechanism и его applicability/effects, готовые/ручные Scope-композиции, независимые локальные настройки каждого View и динамическое подключение второго настоящего профиля. Эти возможности относятся к [кандидатной архитектуре](../workspace/CANDIDATE_MODEL.md) и следующим G-CODE-03/04.

**Сброс:** в старом режиме подтверждённый демо-сброс может вызвать профильное `resetContent`; в общем Workspace сбрасывается раскладка, а `resetContent` контекстного профиля **не удаляет** State существующих Context. Не считать эту кнопку универсальной операцией удаления Context.

[Профильный контракт](../profiles/README.md) · [Код Shell](../../src/shell/README.md).
