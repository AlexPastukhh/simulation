# Markdown Fixture — минимальный второй профиль PT-006

**CURRENT / G-CODE-04, 2026-10-11.** Это проверочный профиль, не полноценный Markdown-продукт. Демонстрирует подключение к тому же `WorkspaceShell` **без** импортов `DemoStore`, `History`, `Actual Events`, `PlanRevision` и внутреннего кода Architecture Simulator.

- [model.ts](model.ts) — `MarkdownContext`, независимый документ (`title`, `body`), валидация `markdown-contexts-v1`, дескрипторы `document` и подготовленный один экран.
- [MarkdownProfile.tsx](MarkdownProfile.tsx) — реализация публичного `WorkspaceProfile`, редактор и текстовый предпросмотр Markdown, создание Context и независимое сохранение.
- [Контракт Shell](../../shell/contracts.ts) — общий интерфейс для обоих профилей; [проверка capability](../../shell/resourceProviders.ts) — только read-only разрешение `ResourceRef` через `profileId`.

**Пользовательский путь:** кнопка «▤ Markdown Profile» → редактировать заметки → «+ Контекст» для второго документа → «+ Экран» для пустого/копии. Вернуться через «← Симулятор». Данные сохраняются в `pt006-markdown-contexts-v1`, раскладка — в `pt006-markdown-layout-v1`. Ключи симуляции A/B не используются. История не обязательна.

**Граница проверки:** Shell одновременно отображает несколько Context **одного активного профиля**; в App пользователь **переключает два профиля**, а не показывает их окна вместе. Контракт `readResource` + `resolveReadOnlyResource` проверяет чтение ресурсов из обоих профилей без их слияния; это **не** универсальный межпрофильный runtime, не автоматический Markdown→Architecture Comparison и не система разрешений записи.

[Профили и область G-CODE-04](../../../docs/profiles/README.md) · [Текущий Workspace](../../../docs/workspace/README.md).