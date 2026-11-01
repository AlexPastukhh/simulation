import type { Rect, Workspace } from './workspace.ts'
import { createWorkspaceModel } from './workspace.ts'
import { appendTemplateScreens } from './screenTemplates.ts'
import type { ScreenTemplate, ScreenTemplatePlacement } from './screenTemplates.ts'

export type WorkspaceCommand =
  | { type: 'createTemplateScreens'; placements: ScreenTemplatePlacement[] }
  | { type: 'renameScreen'; screenId: string; title: string }
  | { type: 'activateScreen' | 'removeScreen' | 'createScreen'; screenId: string }
  | { type: 'duplicateScreen'; sourceId: string; screenId: string; panelIds: string[] }
  | { type: 'saveScreenGroup'; groupId: string; title: string; screenIds: string[] }
  | { type: 'removeScreenGroup'; groupId: string }
  | { type: 'addPanel'; screenId: string; panelId: string; rect?: Rect; contentId?: string }
  | { type: 'removePanel'; screenId: string; panelId: string }
  | { type: 'changeRect'; screenId: string; panelId: string; rect: Rect }
  | { type: 'swapPanels'; screenId: string; firstPanelId: string; secondPanelId: string }
  | { type: 'addContent' | 'removeContent' | 'activateContent'; screenId: string; panelId: string; contentId: string }
  | { type: 'openContent'; contentId: string; panelId: string }

export type CommandResult =
  | { ok: true; workspace: Workspace; affectedScreenIds: string[]; opened?: {screenId:string;panelId:string} }
  | { ok: false; code: string; message: string }

type Ops = ReturnType<typeof createWorkspaceModel>
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
const id = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 200
const ids = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= 100 && v.every(id) && new Set(v).size === v.length
const rect = (v: unknown): v is Rect =>
  record(v) && [v.x,v.y,v.w,v.h].every(x=>typeof x==='number' && Number.isFinite(x)) &&
  Number(v.x) >= 0 && Number(v.y) >= 0 && Number(v.w) >= 190 && Number(v.h) >= 156
/** Exact allow-list for both UI and external bridge commands. */
export function parseWorkspaceCommand(value: unknown): WorkspaceCommand | null {
  if (!record(value)) return null
  switch (value.type) {
    case 'createTemplateScreens':
      return Array.isArray(value.placements) && value.placements.length > 0 && value.placements.length <= 100 &&
        value.placements.every(p=>record(p) && id(p.templateId) && id(p.screenId) && ids(p.panelIds))
        ? {type:value.type,placements:value.placements.map(p=>({templateId:p.templateId as string,screenId:p.screenId as string,panelIds:[...p.panelIds as string[]]}))} : null
    case 'renameScreen':
      return id(value.screenId) && typeof value.title==='string' &&
        value.title.trim().length > 0 && value.title.trim().length <= 100
        ? {type:'renameScreen',screenId:value.screenId,title:value.title.trim()} : null
    case 'activateScreen':
    case 'removeScreen':
    case 'createScreen':
      return id(value.screenId) ? {type:value.type,screenId:value.screenId} : null
    case 'duplicateScreen':
      return id(value.sourceId) && id(value.screenId) && ids(value.panelIds)
        ? {type:value.type,sourceId:value.sourceId,screenId:value.screenId,panelIds:value.panelIds} : null
    case 'saveScreenGroup':
      return id(value.groupId) && typeof value.title==='string' &&
        value.title.trim().length > 0 && value.title.trim().length <= 100 && ids(value.screenIds)
        ? {type:value.type,groupId:value.groupId,title:value.title.trim(),screenIds:value.screenIds} : null
    case 'removeScreenGroup':
      return id(value.groupId) ? {type:value.type,groupId:value.groupId} : null
    case 'addPanel':
      return id(value.screenId) && id(value.panelId) && (value.rect===undefined || rect(value.rect)) &&
        (value.contentId===undefined || id(value.contentId))
        ? {type:value.type,screenId:value.screenId,panelId:value.panelId,
          ...(value.rect?{rect:value.rect}:{}),...(value.contentId?{contentId:value.contentId}:{})} : null
    case 'removePanel':
      return id(value.screenId) && id(value.panelId)
        ? {type:value.type,screenId:value.screenId,panelId:value.panelId} : null
    case 'changeRect':
      return id(value.screenId) && id(value.panelId) && rect(value.rect)
        ? {type:value.type,screenId:value.screenId,panelId:value.panelId,rect:value.rect} : null
    case 'swapPanels':
      return id(value.screenId) && id(value.firstPanelId) && id(value.secondPanelId)
        ? {type:value.type,screenId:value.screenId,firstPanelId:value.firstPanelId,secondPanelId:value.secondPanelId} : null
    case 'addContent':
    case 'removeContent':
    case 'activateContent':
      return id(value.screenId) && id(value.panelId) && id(value.contentId)
        ? {type:value.type,screenId:value.screenId,panelId:value.panelId,contentId:value.contentId} : null
    case 'openContent':
      return id(value.contentId) && id(value.panelId)
        ? {type:value.type,contentId:value.contentId,panelId:value.panelId} : null
    default:
      return null
  }
}

export function executeWorkspaceCommand(
  workspace: Workspace, command: WorkspaceCommand, ops: Ops,
  screenTemplates: readonly ScreenTemplate[] = [],
): CommandResult {
  const fail = (code: string, message: string): CommandResult => ({ok:false,code,message})
  const hasScreen = (id:string) => workspace.screens.some(s=>s.id===id)
  const hasPanel = (sid:string,pid:string) =>
    workspace.screens.some(s=>s.id===sid&&s.panels.some(p=>p.id===pid))
  let next: Workspace = workspace
  let affectedScreenIds: string[] = []
  let opened: {screenId:string;panelId:string}|undefined
  switch (command.type) {
    case 'createTemplateScreens': {
      const expanded=appendTemplateScreens(workspace,screenTemplates,command.placements,ops)
      if(!expanded)return fail('INVALID_TEMPLATE','Шаблон или ID экранов/окон недопустимы')
      next=expanded
      affectedScreenIds=command.placements.map(p=>p.screenId)
      break
    }
    case 'renameScreen': {
      const screen = workspace.screens.find(s=>s.id===command.screenId)
      if(!screen)return fail('NOT_FOUND','Экран не найден')
      if(screen.title===command.title)return fail('NO_CHANGE','Название не изменилось')
      next=ops.renameScreen(workspace,command.screenId,command.title)
      affectedScreenIds=[command.screenId]
      break
    }
    case 'activateScreen':
      if(!hasScreen(command.screenId))return fail('NOT_FOUND','Экран не найден')
      if(workspace.activeScreenId===command.screenId)return fail('NO_CHANGE','Экран уже активен')
      next=ops.activateScreen(workspace,command.screenId)
      affectedScreenIds=[command.screenId]
      break
    case 'createScreen':
      if(hasScreen(command.screenId))return fail('ALREADY_EXISTS','Экран уже существует')
      next=ops.addScreen(workspace,command.screenId)
      affectedScreenIds=[command.screenId]
      break
    case 'duplicateScreen': {
      const source=workspace.screens.find(s=>s.id===command.sourceId)
      if(!source)return fail('NOT_FOUND','Исходный экран не найден')
      if(command.panelIds.length!==source.panels.length)return fail('INVALID_COMMAND','Неверное количество ID окон')
      let offset=0
      const clone=ops.duplicateScreen(workspace,command.sourceId,kind=>
        kind==='screen'?command.screenId:command.panelIds[offset++])
      if(!clone)return fail('ALREADY_EXISTS','Дублирующиеся ID')
      next=clone
      affectedScreenIds=[command.screenId]
      break
    }
    case 'removeScreen':
      if(!hasScreen(command.screenId))return fail('NOT_FOUND','Экран не найден')
      if(workspace.screens.length===1)return fail('LAST_SCREEN','Нельзя удалить последний экран')
      next=ops.removeScreen(workspace,command.screenId)
      affectedScreenIds=[command.screenId]
      break
    case 'saveScreenGroup': {
      const group=ops.saveScreenGroup(workspace,command.groupId,command.title,command.screenIds)
      if(!group)return fail('INVALID_GROUP','Группа недопустима')
      next=group
      break
    }
    case 'removeScreenGroup':
      next=ops.removeScreenGroup(workspace,command.groupId)
      break
    case 'addPanel':
      if(!hasScreen(command.screenId))return fail('NOT_FOUND','Экран не найден')
      next=ops.addPanel(workspace,command.screenId,command.panelId,command.rect)
      if(next===workspace)return fail('ALREADY_EXISTS','ID окна уже существует')
      if(command.contentId){
        if(!ops.hasDescriptor(command.contentId))return fail('UNKNOWN_CONTENT','Содержимое не найдено')
        const filled=ops.addContent(next,command.screenId,command.panelId,command.contentId)
        if(filled===next)return fail('CONTENT_NOT_AVAILABLE','Содержимое нельзя добавить на этот экран')
        next=filled
      }
      affectedScreenIds=[command.screenId]
      break
    case 'removePanel':
      if(!hasPanel(command.screenId,command.panelId))return fail('NOT_FOUND','Окно не найдено')
      next=ops.removePanel(workspace,command.screenId,command.panelId)
      affectedScreenIds=[command.screenId]
      break
    case 'changeRect':
      if(!hasPanel(command.screenId,command.panelId))return fail('NOT_FOUND','Окно не найдено')
      next=ops.changeRect(workspace,command.screenId,command.panelId,command.rect)
      affectedScreenIds=[command.screenId]
      break
    case 'swapPanels':
      if(!hasPanel(command.screenId,command.firstPanelId)||!hasPanel(command.screenId,command.secondPanelId))
        return fail('NOT_FOUND','Окно не найдено')
      next=ops.swapPanels(workspace,command.screenId,command.firstPanelId,command.secondPanelId)
      affectedScreenIds=[command.screenId]
      break
    case 'addContent':
    case 'removeContent':
    case 'activateContent': {
      if(!hasPanel(command.screenId,command.panelId))return fail('NOT_FOUND','Окно не найдено')
      if(!ops.hasDescriptor(command.contentId))return fail('UNKNOWN_CONTENT','Содержимое не найдено')
      if(command.type==='addContent')next=ops.addContent(workspace,command.screenId,command.panelId,command.contentId)
      else if(command.type==='removeContent')next=ops.removeContent(workspace,command.screenId,command.panelId,command.contentId)
      else next=ops.activateContent(workspace,command.screenId,command.panelId,command.contentId)
      affectedScreenIds=[command.screenId]
      break
    }
    case 'openContent': {
      if(!ops.hasDescriptor(command.contentId))return fail('UNKNOWN_CONTENT','Содержимое не найдено')
      const result=ops.openContent(workspace,command.contentId,command.panelId)
      if(!result)return fail('NOT_FOUND','Содержимое недоступно')
      next=result.workspace
      opened={screenId:result.screenId,panelId:result.panelId}
      affectedScreenIds=[result.screenId]
      break
    }
  }
  if(next===workspace)return fail('NO_CHANGE','Команда не изменила Workspace')
  return ops.validateWorkspace(next)
    ? {ok:true,workspace:next,affectedScreenIds,...(opened?{opened}:{})}
    : fail('INVALID_WORKSPACE','Команда создаёт недопустимую раскладку')
}
