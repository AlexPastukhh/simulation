# src/profiles/architecture-simulator — предметный профиль

**CURRENT / опубликованный `main`; локальные, ещё не опубликованные экранные изменения отделены ниже.** Этот каталог — конкретное применение Shell, а не обязательная модель для всех профилей. [Вход в документацию симулятора](../../../docs/profiles/architecture-simulator/README.md).

**Основные предметные источники:** [система контента, факты и связи](../../../docs/architecture-simulator/CONTENT_SYSTEM.md) · [18 видов](../../../docs/architecture-simulator/CONTENT_VIEWS.md). Общие окна, вкладки, навигация и ограничения Shell: [docs/shell](../../../docs/shell/README.md).

| Файлы | Назначение |
|---|---|
| [SimulatorProfile.tsx](SimulatorProfile.tsx) | Подключение, A/B, хранение предметного State, выбор исторического момента, инспектор |
| [workspace.ts](workspace.ts) | Регистрация 18 видов и стартовые 4 экрана, миграция старого layout; **LOCAL UNPUBLISHED:** `SCREEN_TEMPLATES` (4), `SCREEN_BUNDLES` (набор) и новые места экранов |
| [content.ts](content.ts), [material.ts](material.ts), [extraContent.ts](extraContent.ts) | State, JSON Schema, авторский сценарий, проекции |
| [history.ts](history.ts), [references.ts](references.ts) | Подготовленная история событий/PlanRevision и диагностика ссылок |
| [DomainContent.tsx](DomainContent.tsx), [AdditionalContent.tsx](AdditionalContent.tsx), [MaterialContent.tsx](MaterialContent.tsx), [HistoryContent.tsx](HistoryContent.tsx) | Отображение контента |
| [styles.css](styles.css) | Предметные стили |

Данные A/B сохраняются как `pt006-simulator-content-[A|B]-v6`, layout Shell — `pt006-simulator-layout-[A|B]-v3`. Переход `open-content` не исполняет Step, не добавляет Actual Events и не переписывает архив. **LOCAL UNPUBLISHED:** новый набор экранов размещает существующие виды и не меняет их State/History. Опубликованный `main` не предоставляет это меню; [план будущей итерации](../../../docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md).

**CANDIDATE, не реализовано:** один Context Template из четырёх экранов, готовые/создаваемые Context Instances, межконтекстные и профильные Scope Mechanisms. Подробнее: [кандидатная модель](../../../docs/workspace/CANDIDATE_MODEL.md). Настоящего Markdown-профиля в PT-006 нет.