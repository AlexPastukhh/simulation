# src/shell — универсальный Shell

**CURRENT / опубликованный `main`; локальные неопубликованные экранные функции помечены отдельно.** Этот каталог реализует предметно-независимые окна, вкладки, экраны, компоновку и навигацию. Обзор механики и границы реализации: [docs/shell](../../docs/shell/README.md). Текущая роль `Workspace` как раскладки описана в [docs/workspace](../../docs/workspace/README.md).

| Файл | Ответственность |
|---|---|
| [workspace.ts](workspace.ts) | `Workspace v3`: экраны/окна/вкладки, `createWorkspaceModel`, `openContent`, размеры и лимиты; `duplicateScreen` и `addScreensFromTemplates` — только LOCAL UNPUBLISHED |
| [contracts.ts](contracts.ts) | `WorkspaceProfile`, `ContentAddress`, `WorkspaceEvent` |
| [WorkspaceShell.tsx](WorkspaceShell.tsx) | Shell UI, профильно предоставленное содержимое, экраны, события и сохранение раскладок |
| [windowDrag.ts](windowDrag.ts) | Перетаскивание, обмен геометрией и вписывание |
| [styles.css](styles.css) | Общие стили окна и оболочки |

`open-content` адресует `{profileId,instanceId}` и открывает/подсвечивает вид в **текущей раскладке**, не изменяя предметный State/History. **LOCAL UNPUBLISHED:** `screenTemplates` и `screenBundles` добавляют представления, а не создают контексты или дублируют данные; в опубликованном `main` их ещё нет. [План интеграции](../../docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md). Shell получает **один активный профиль**.

**Не реализовано:** универсальные Context Instances и ResourceRefs с `contextId`, многопрофильный runtime, Scope Mechanisms и cross-profile инструменты. Их [кандидатная модель](../../docs/workspace/CANDIDATE_MODEL.md) не является частью нынешнего контракта.

[Главный README](../../README.md) · [Документация профилей](../../docs/profiles/README.md).