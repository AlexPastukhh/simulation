# src/shell — код универсального Shell

**CURRENT / G-CODE-03, 2026-10-11.** Shell содержит общую UI-компоновку, навигацию, механизм создания Context из предоставленного профилем шаблона и проверку адресов. Он **не** содержит типов `DemoStore`, `Actual Event` или `PlanRevision`.

| Файл | Реализованная ответственность |
|---|---|
| [workspace.ts](workspace.ts) | Layout v3: Screen/Panel/Tab, generic add/duplicate, проверка экранных рецептов, поиск и переключение вкладок, геометрия |
| [contexts.ts](contexts.ts) | `ResourceRef`, `ContextTemplate`, `ContextInstance`, copy-by-default `instantiateContext`, контекстные ID вкладок, безопасный импорт legacy layout |
| [contracts.ts](contracts.ts) | `WorkspaceProfile`, `ContentAddress` с необязательным `contextId`, `contextTemplateOptions`, `createContext`, `resolveContentAddress`, опциональные `compositionContextIds` / `prepareComparison` |
| [WorkspaceShell.tsx](WorkspaceShell.tsx) | Экран/окно/вкладки, «+ Экран», «+ Контекст», «⇄ Композиция», атомарное размещение готового набора либо привязка Comparison к уже открытым источникам |
| [windowDrag.ts](windowDrag.ts) | Drag/swap/fit с учётом препятствий и размеров |
| [styles.css](styles.css) | Общий UI |

В прежнем режиме `open-content` использует `{profileId,instanceId}`. Для общего Workspace адрес может включать `contextId`; только профиль разрешает его во внутренний `context/<contextId>/<resourceId>` ключ вкладки. Нельзя подменять неизвестную цель другим Context. Два экземпляра одного вида в разных Context считаются разными адресованными ресурсами.

В `App.tsx` по-прежнему **один профиль**; подключается либо legacy-представление, либо общий Workspace этого же профиля. Реализована ready/manual композиция **одного профильного read-only Comparison Scope**: Shell размещает окна и подтверждает профильный Scope только после проверки layout. Межпрофильный runtime, **универсальные** Scope Mechanisms и всеобщие view-local persisted selections **не реализованы**.

[Подробное описание Shell](../../docs/shell/README.md) · [Работа с Workspace](../../docs/workspace/README.md) · [Профили](../../docs/profiles/README.md).