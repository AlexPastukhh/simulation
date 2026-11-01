# Site Requirements Model

**CURRENT.** Отдельный Content Template `site-requirements-model` и один сохраняемый экземпляр `requirements-main`. Он не является архитектурным планом.

## Ненормализованная модель

`requirements[]` — независимые текстовые требования с собственными ID и текстом; могут содержать acceptance, uncertainty и known-from-event reference.

`artifacts[]` — независимые occurrences с ID, видом и названием: Actor, Goal, Scenario, Step, Screen, Widget, Behavior Unit, API Contract, Workflow и Other. Опциональный `parentOccurrenceId` означает конкретное размещение и не образует общей сущности. `requirementIds[]` ссылается на формулировки требований.

**Никакой структурной фиксации одинаковости.** Два одинаково названных Widget в разных Screens — два разных occurrences. Нет `sameAs`, canonical occurrence, `contexts[]` или `contextRefs`. Не происходит автоматического объединения по тексту. Валидатор принимает только объявленные поля модели v1, requirement и artifact; неизвестные поля, включая `sameAs` и canonical/context-связи, отклоняются на границе сохранения. Типы acceptance (string[]), uncertainty и knownFromEventId (string) проверяются, если поля присутствуют. При отклонении исходное сохранение остаётся нетронутым.

## Текущее UI

Можно добавить, изменить и удалить требование или occurrence. Запись выполняется в отдельный Content Instance и проверяется перед сохранением. Расширенные acceptance, parent hierarchy и traceability доступны в типе модели, но UI поддерживает лишь базовые поля. Никакое сравнение не встроено. Виды occurrences определяет один SITE_ARTIFACT_KINDS; из него получен тип, его используют validator и UI.

[Типы и проверка](../../../src/templates/content/site-requirements-model/model.ts) · [Редактор](../../../src/profiles/single-architecture/SingleArchitectureProfile.tsx)
