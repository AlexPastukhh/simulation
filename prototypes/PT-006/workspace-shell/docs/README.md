# PT-006 — одна архитектура

Приложение создаёт новую пустую архитектуру и сохраняет данные в браузере. Сравнение нескольких архитектур не входит в текущую версию.

## Точка входа

`src/App.tsx` подключает `useSingleArchitectureProfile` и `WorkspaceShell`.

Текущий Workspace показывает одну архитектуру в Content Template `feature-ddd-architecture-planning`, отдельный `site-requirements-model`, единый Plan и History. Markdown-документы доступны в том же Workspace.

- [Архитектура](templates/content/FEATURE_DDD_ARCHITECTURE_PLANNING.md)
- [Требования](templates/content/SITE_REQUIREMENTS_MODEL.md)
- [Workspace и данные](workspace/README.md)
- [Передача в новый чат — актуальный код и ограничения](workspace/HANDOFF.md)
- [Команды Workspace](workspace/BRIDGE_COMMANDS.md)
- [Универсальный Shell](shell/README.md)
- [Core/Scope-механики, хранение и observability](shell/MECHANICS.md)

## Граница текущей версии

Workspace Window/Screen/Screen Group — размещение представлений; данные архитектуры живут в Content Instance. Полноценного Screen Set Instance и сравнения нет. Старый A/B runtime удалён. Старые сохранения A/B не удаляются и не переименовываются, но активным профилем не читаются.

## Проверка

`npm run build`, `npm run lint`, `npm test`. Для браузерного smoke-теста: запустить `npm run dev -- --port 4197` и затем `node tests/single-architecture-ui-smoke.cjs`.

Стандартный Workspace снова содержит четыре экрана. Создание отдельных экранов и всего набора доступно через «+ Экран». [Состав и восстановление размещения](workspace/README.md).

[Полный каталог видов содержимого](architecture-simulator/CONTENT_VIEWS.md) · [Система источников](architecture-simulator/CONTENT_SYSTEM.md). Четыре экрана содержат 5/4/4/3 основных окон; прежнее сокращённое описание заменено.

[Учебный пример эволюции](../examples/README.md) — восемь исторических срезов, шесть будущих Steps и воспроизводимый локальный запуск.
