import type { Panel, Workspace } from './workspace.ts'
import { FRAME_MIN, createWorkspaceModel } from './workspace.ts'

/** A portable panel *composition*, not a copy of Domain State. Tabs retain view descriptor IDs. */
export const PANEL_PRESETS_KEY = 'pt006-shell-panel-presets-v1'
export type PanelPreset = {
  id: string
  title: string
  tabs: string[]
  active: string | null
  size: { w: number; h: number }
}
type PanelPresetStore = { version: 1; items: PanelPreset[] }
type Ops = ReturnType<typeof createWorkspaceModel>
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max
export const isPanelPreset = (raw: unknown): raw is PanelPreset => {
  if (!raw || typeof raw !== 'object') return false
  const v = raw as Partial<PanelPreset>
  return text(v.id, 200) && text(v.title, 100) &&
    Array.isArray(v.tabs) && v.tabs.length <= 80 &&
    v.tabs.every(t => text(t, 200)) && new Set(v.tabs).size === v.tabs.length &&
    ((v.active === null && v.tabs.length===0) || (typeof v.active === 'string' && v.tabs.includes(v.active))) &&
    !!v.size && Number.isInteger(v.size.w) && Number.isInteger(v.size.h) &&
    v.size.w >= FRAME_MIN.w && v.size.h >= FRAME_MIN.h &&
    v.size.w <= 6000 && v.size.h <= 6000
}
export const isPanelPresetStore = (raw:unknown):raw is PanelPresetStore => {
  if (!raw || typeof raw !== 'object') return false
  const v=raw as Partial<PanelPresetStore>
  return v.version===1 && Array.isArray(v.items) && v.items.length<=100 &&
    v.items.every(isPanelPreset) && new Set(v.items.map(item=>item.id)).size===v.items.length
}
export const readPanelPresets = ():PanelPreset[] => {
  try {
    const raw=localStorage.getItem(PANEL_PRESETS_KEY)
    if(raw===null)return []
    const parsed:unknown=JSON.parse(raw)
    return isPanelPresetStore(parsed)?parsed.items:[]
  } catch {return []}
}
export const presetStoreJson=(items:PanelPreset[]):string => JSON.stringify({version:1,items})

export const capturePanelPreset=(panel:Panel,id:string,title:string):PanelPreset|null => {
  const preset:PanelPreset={
    id,title:title.trim(),tabs:[...panel.tabs],active:panel.active,
    size:{w:Math.round(panel.rect.w),h:Math.round(panel.rect.h)},
  }
  return isPanelPreset(preset)?preset:null
}

/** All-or-nothing placement. Invalid/missing or occupied content never creates a partial window. */
export function placePanelPreset(w:Workspace,screenId:string,panelId:string,preset:PanelPreset,ops:Ops):
  {ok:true;workspace:Workspace}|{ok:false;reason:string} {
  const reject=(reason:string):{ok:false;reason:string}=>({ok:false,reason})
  if(!isPanelPreset(preset))return reject('Шаблон окна некорректен')
  const screen=w.screens.find(s=>s.id===screenId)
  if(!screen)return reject('Экран не найден')
  if(w.screens.some(s=>s.id===panelId||s.panels.some(p=>p.id===panelId)))
    return reject('Идентификатор нового окна уже занят')
  for(const id of preset.tabs){
    if(!ops.hasDescriptor(id))return reject('Вид контента '+id+' больше недоступен')
    if(!ops.canAddContent(w,screenId,id))
      return reject('Контент '+ops.getDescriptor(id).label+' уже занят на этом экране')
  }
  const size={
    w:Math.max(preset.size.w,...preset.tabs.map(id=>ops.getDescriptor(id).minWidth)),
    h:Math.max(preset.size.h,...preset.tabs.map(id=>ops.getDescriptor(id).minHeight)),
  }
  const free=(x:number,y:number)=>screen.panels.every(p=>
    x+size.w+12<=p.rect.x || p.rect.x+p.rect.w+12<=x ||
    y+size.h+12<=p.rect.y || p.rect.y+p.rect.h+12<=y)
  let point:{x:number;y:number}|null=null
  search:for(let y=24;y<8000;y+=38){
    for(const x of [24,430,836,1242]){
      if(free(x,y)){point={x,y};break search}
    }
  }
  if(!point)return reject('На экране не найдено место для окна')
  let next=ops.addPanel(w,screenId,panelId,{...point,...size})
  if(next===w)return reject('Не удалось добавить окно')
  for(const id of preset.tabs){
    const updated=ops.addContent(next,screenId,panelId,id)
    if(updated===next)return reject('Невозможно открыть '+id+' в окне')
    next=updated
  }
  if(preset.active!==null){
    const updated=ops.activateContent(next,screenId,panelId,preset.active)
    if(updated===next)return reject('Не удалось активировать сохранённую вкладку')
    next=updated
  }
  const target=next.screens.find(s=>s.id===screenId)?.panels.find(p=>p.id===panelId)
  if(!target || target.tabs.length!==preset.tabs.length ||
     target.active!==preset.active || !ops.validateWorkspace(next))
    return reject('Сохранённая конфигурация несовместима с текущим экраном')
  return {ok:true,workspace:next}
}
