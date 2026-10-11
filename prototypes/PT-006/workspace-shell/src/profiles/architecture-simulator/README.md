# src/profiles/architecture-simulator — предметный профиль

**CURRENT / G-CODE-04 + recovery hardening, 2026-10-11.** Конкретная реализация симуляции архитектуры A/B поверх Shell. Не универсальный владелец механизмов Workspace. [Документация профиля](../../../docs/profiles/architecture-simulator/README.md).

| Файл | Реализованная роль |
|---|---|
| [SimulatorProfile.tsx](SimulatorProfile.tsx) | Подготовленный A/B `DemoStore`, `content-v6` и `layout-v3`, два UI режима, независимые Context copies, минимальные заметки без History, сохранение `context-copies-v1` и разрешение адреса контента |
| [scope-mechanisms/comparison.ts](scope-mechanisms/comparison.ts), [ComparisonScopeView.tsx](scope-mechanisms/ComparisonScopeView.tsx) | Явные `ResourceRef` левый/правый, проверка применимости и read-only Scope result; готовая и ручная сборка, отдельный Scope-local `focus` |
| [workspace.ts](workspace.ts) | 18 зарегистрированных предметных видов, четыре начальных тематических экрана, `SCREEN_TEMPLATES` и `SCREEN_BUNDLES` как рецепты, миграция старого layout |
| [content.ts](content.ts), [material.ts](material.ts), [extraContent.ts](extraContent.ts) | State/Schema, авторский сценарий и производные виды |
| [history.ts](history.ts), [references.ts](references.ts) | История и диагностика ссылок |
| [DomainContent.tsx](DomainContent.tsx), [AdditionalContent.tsx](AdditionalContent.tsx), [MaterialContent.tsx](MaterialContent.tsx), [HistoryContent.tsx](HistoryContent.tsx) | Предметные представления |
| [styles.css](styles.css) | Предметные стили, в том числе редактор минимального Context |

**«⊞ Общий Workspace»** позволяет иметь обычные Architecture views A и B на одном экране. **«+ Контекст»** предоставляет два рецепта: «Эволюция архитектуры» с отдельным State и комплектом четырёх экранов или «Минимальный контекст» с заметками без History. Копии содержимого сохраняются в `pt006-simulator-context-copies-v1`, общий layout — в `pt006-simulator-multicontext-layout-v1`; старые A/B ключи не удаляются.

Навигация `open-content` внутри контекстного вида передаёт `contextId`, не смешивая A и B. Новый **Scope Comparison** использует явные привязки Context и read-only результат, сохраняет конфигурацию в `pt006-simulator-comparison-scopes-v1`. Прежний `comparison` в legacy-режиме по-прежнему читает `allData.A/B` ради обратной совместимости; в общем Workspace используется отдельный Scope. Другие Scope и межпрофильный runtime остаются за пределами G-CODE-03. До G-CODE-04 нет второго настоящего профиля.

[Система контента](../../../docs/architecture-simulator/CONTENT_SYSTEM.md) · [18 видов](../../../docs/architecture-simulator/CONTENT_VIEWS.md) · [план дальнейших групп](../../../docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md).