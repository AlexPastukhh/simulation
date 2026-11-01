# Workspace Shell

Shell управляет размещением, не предметными данными. Карта модулей:

- workspace.ts — геометрия, Screen/Panel, группы и layout.
- WorkspaceShell.tsx — UI, layout/settings persistence и сообщения об отказе.
- workspaceCommands.ts + workspaceDispatch.ts — общий pipeline операций UI/Bridge и revision checks.
- windowDrag.ts — drag/fit.
- panelPresets.ts — сохраняемые композиции окна, без копии Content.
- safeStorage.ts — guarded UI write и архив повреждённого raw.
- templateInstances.ts — используемые constructor, metadata и summaries/catalog.
- contracts.ts — интерфейс одного активного Workspace Profile.

Неиспользуемые profile open-content events, getter экземпляров и generic compatibility checker удалены. Layout openContent command остаётся действующей командой Bridge; она адресует view descriptor, а не предметный Instance ID.

Предметная запись находится в профиле: общий contentStorage.ts используется архитектурой и Markdown. Он не является registry или универсальным ContentStore.

[Workspace и ключи](../workspace/README.md) · [Bridge](../workspace/BRIDGE_COMMANDS.md)

## Шаблоны экранов

screenTemplates.ts создаёт размещение из рецептов и проверяет весь набор через действующий workspace validator. Текущий профиль предоставляет четыре рецепта и их bundle; UI и Bridge используют одну createTemplateScreens-команду. Screen Templates не входят в Content metadata/ownership.

Shell раскрывает только известные нетронутые прежние стандартные композиции single-architecture. Чтение не пишет storage; первая запись сохраняет исходные bytes через safeStorage. Пользовательские раскладки не заменяются автоматически.

[Состав, ключи и поведение](../workspace/README.md)

Действующие переходы из видов используют renderContent open-callback и layout openContent command. Callback реально вызывается Events/Current/Requirements/Files/Work; он не является dormant profile event API и не пишет предметные данные.

## Механики и observability

[MECHANICS](MECHANICS.md) — единое описание core/scope, Definition/Connection/UI binding/Invocation, хранения у шаблонов и ограничений трассировки. Модули src/shell/mechanics содержат общий runtime и Inspector; dev/mechanicsSourcePlugin строит производный source index и UI bindings. Для runtime используется короткая metadata; UI и тексты исходников загружаются по открытию.
