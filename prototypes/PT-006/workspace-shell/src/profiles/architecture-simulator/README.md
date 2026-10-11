# src/profiles/architecture-simulator — предметный профиль

**CURRENT / PT-006: профиль и тематические начальные экраны, 2026-10-11.** Этот каталог — конкретное применение Shell, а не обязательная модель для всех профилей. [Вход в документацию симулятора](../../../docs/profiles/architecture-simulator/README.md).

**Основные предметные источники:** [система контента, факты и связи](../../../docs/architecture-simulator/CONTENT_SYSTEM.md) · [18 видов](../../../docs/architecture-simulator/CONTENT_VIEWS.md). Общие окна, вкладки, навигация и ограничения Shell: [docs/shell](../../../docs/shell/README.md).

| Файлы | Назначение |
|---|---|
| [SimulatorProfile.tsx](SimulatorProfile.tsx) | Подключение, A/B, хранение предметного State, выбор исторического момента, инспектор |
| [workspace.ts](workspace.ts) | Регистрация 18 видов, четыре тематических стартовых экрана, миграция старого layout; `SCREEN_TEMPLATES` (4) и `SCREEN_BUNDLES` (набор) подготовлены в коде, но не показываются через «+ Экран» |
| [content.ts](content.ts), [material.ts](material.ts), [extraContent.ts](extraContent.ts) | State, JSON Schema, авторский сценарий, проекции |
| [history.ts](history.ts), [references.ts](references.ts) | Подготовленная история событий/PlanRevision и диагностика ссылок |
| [DomainContent.tsx](DomainContent.tsx), [AdditionalContent.tsx](AdditionalContent.tsx), [MaterialContent.tsx](MaterialContent.tsx), [HistoryContent.tsx](HistoryContent.tsx) | Отображение контента |
| [styles.css](styles.css) | Предметные стили |

Данные A/B сохраняются как `pt006-simulator-content-[A|B]-v6`, layout Shell — `pt006-simulator-layout-[A|B]-v3`. Переход `open-content` не исполняет Step, не добавляет Actual Events и не переписывает архив. Новые стартовые экраны и generic копия повторно используют существующие виды, не меняя State/History. Профильные рецепты сохранены **для следующей реализации Context Template**, но в текущем меню «+ Экран» нет предметных шаблонов; [план дальнейшей итерации](../../../docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md).

**CANDIDATE, не реализовано:** один Context Template из четырёх экранов, готовые/создаваемые Context Instances, межконтекстные и профильные Scope Mechanisms. Подробнее: [кандидатная модель](../../../docs/workspace/CANDIDATE_MODEL.md). Настоящего Markdown-профиля в PT-006 нет.