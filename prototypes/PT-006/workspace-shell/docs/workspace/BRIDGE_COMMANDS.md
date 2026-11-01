# Workspace Bridge

Bridge — только dev-интерфейс к текущим операциям **размещения**. Токен создаёт Vite plugin в `.workspace-bridge/token`; доступ ограничен loopback, действует sessionId и ревизия layout.

- `GET /__workspace-bridge/workspace`: возвращает `workspace`, `revision`, `sessionId`.
- `POST /__workspace-bridge/command`: принимает `{sessionId, expectedRevision, command}`, вызывает валидатор `parseWorkspaceCommand` и применяет команду через общий reducer.

Сохранение проверяется до успешного подтверждения команды. Legacy Context и Scope endpoints удалены. Bridge не даёт прямой записи архитектуры, требований, History или Markdown и не служит вторым владельцем данных.

## Создание экранов из шаблонов

`GET /__workspace-bridge/workspace` также возвращает `screenTemplates` и `screenBundles` активного профиля. Они содержат только рецепты размещения.

Команда `createTemplateScreens` принимает `placements: [{templateId, screenId, panelIds}]`. Каждый ID экрана/окна должен быть новым; число panelIds соответствует числу окон выбранного шаблона. Все placements проверяются и применяются одной операцией через общий UI/Bridge reducer. Отсутствующий шаблон, неизвестный Content descriptor или конфликт ID отклоняет весь набор без частичной записи. Старый expectedRevision отклоняется по общему правилу.

Для bundle берутся templateIds из возвращённого screenBundles и создаются соответствующие placements. Это не создание Content Instances; Bridge по-прежнему не записывает предметные данные.
