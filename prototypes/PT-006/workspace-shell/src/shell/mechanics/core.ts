import type {MechanicDefinition} from './contracts.ts'
const shell='src/shell/WorkspaceShell.tsx'
function core(id:string,title:string,description:string,effects:string[],sources:MechanicDefinition['sources'],calls:string[]):MechanicDefinition {
 return {id,kind:'core',title,description,level:'workspace',effects,sources,bindings:[{module:shell,calls}]}
}
export const CORE_MECHANICS: readonly MechanicDefinition[] = [
 core('core.open-content','Открыть Content','Находит существующее представление, активирует его или создаёт окно. Данные Content не копируются.',
  ['layout.write','view.activate'],[{module:shell,symbol:'runCommand'},{module:'src/shell/workspaceCommands.ts',symbol:'executeWorkspaceCommand'}],['open']),
 core('core.workspace-command','Окна, вкладки, экраны и группы','Единый command/reducer для UI и bridge. Группа экранов организует rail и не меняет источники Content.',
  ['layout.write'],[{module:'src/shell/workspaceDispatch.ts',symbol:'reduceShellState'},{module:'src/shell/workspaceCommands.ts',symbol:'executeWorkspaceCommand'}],
  ['runCommand','modify','createWindow','selectScreen','addTemplateScreens','addBlankScreen','copyCurrentScreen','saveGroup','insertPanelPreset','reset','onSelect','onClose']),
 core('core.window-drag','Перенос, вписывание и размер окна','Pointer preview, wheel/edge scroll и отмена. Геометрия записывается отдельно от предметных данных.',
  ['layout.write','viewport.scroll','ui.preview'],[{module:'src/shell/windowDrag.ts',symbol:'useWindowDrag'},{module:shell,symbol:'startResize'}],['startDrag','startResize','toggleFit']),
 core('core.layout-persistence','Сохранение Workspace','Архивирует требуемые исходные bytes и подтверждает запись read-back. Отказ не выдаётся за сохранение.',
  ['browser.layout.write'],[{module:'src/shell/safeStorage.ts',symbol:'writePreservingInvalid'},{module:shell,symbol:'WorkspaceShell'}],[]),
 core('core.settings','Настройки и шаблоны окон','UI settings и Panel Presets отдельно от Content. Запись проходит общий preserving/read-back helper.',
  ['browser.ui.write'],[{module:shell,symbol:'updatePanelPresets'},{module:'src/shell/panelPresets.ts'}],
  ['setFitGap','setViewMode','setHeaderHidden','savePanelTemplate','removePanelPreset']),
 core('core.bridge','Workspace bridge','Только dev: проверка session/revision и разрешённой команды. Ответ об applied ожидает persistence.',
  ['layout.write','bridge.reply'],[{module:shell,symbol:'receive'},{module:'dev/workspaceBridgePlugin.ts'}],[]),
 core('core.ui','Локальное UI и viewport','Выбор окна, меню, drafts, прокрутка и размеры viewport. UI callback виден отдельно от подтверждённой domain/layout записи.',
  ['ui.local','viewport.read','viewport.scroll'],[{module:shell,symbol:'WorkspaceShell'}],[]),
]
