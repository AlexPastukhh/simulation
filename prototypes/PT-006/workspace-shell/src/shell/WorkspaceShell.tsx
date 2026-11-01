import { Suspense, lazy, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { createWorkspaceModel } from './workspace.ts'
import { parseWorkspaceCommand } from './workspaceCommands.ts'
import { reduceShellState } from './workspaceDispatch.ts'
import type { ShellAction, ShellState } from './workspaceDispatch.ts'
import type { WorkspaceCommand } from './workspaceCommands.ts'
import { readPanelPresets, capturePanelPreset, placePanelPreset, isPanelPresetStore, presetStoreJson, PANEL_PRESETS_KEY } from './panelPresets.ts'
import type { PanelPreset } from './panelPresets.ts'
import type { Panel, Rect, Workspace, ContentDescriptor } from './workspace.ts'
import type { WorkspaceProfile } from './contracts.ts'
import { matchesDefaultComposition } from './screenTemplates.ts'
import { useWindowDrag } from './windowDrag.ts'
import { writePreservingInvalid, validStoredJson } from './safeStorage.ts'
import sourceIndex from 'virtual:pt006-mechanics-metadata'
import {createMechanicsRuntime,attachMechanicsHost,observeMechanicsElement} from './mechanics/runtime.ts'
import {CORE_MECHANICS} from './mechanics/core.ts'
const MechanicsInspector=lazy(()=>import('./mechanics/MechanicsInspector.tsx').then(module=>({default:module.MechanicsInspector})))
import type {MechanicsTarget} from './mechanics/MechanicsInspector.tsx'
import type {MechanicConnection,TraceToken} from './mechanics/contracts.ts'

const SETTINGS_KEY = 'pt006-workspace-settings-v1'
const VIEW_KEY = 'workspace-shell-view-mode-v1'
const HEADER_KEY = 'pt006-shell-header-hidden-v1'
const DEFAULT_FIT_GAP = 4
function restoreGap() {
  try { const raw=localStorage.getItem(SETTINGS_KEY); if (raw !== null) { const value = Number(raw); if (Number.isInteger(value) && value >= 0 && value <= 32) return value } } catch { /* default */ }
  return DEFAULT_FIT_GAP
}
function restoreLayout(profile: WorkspaceProfile, workspaceId: string, valid: (raw: unknown) => raw is Workspace): Workspace {
  try {
    const raw = localStorage.getItem(profile.layoutKey(workspaceId))
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (valid(parsed)) {
        if(profile.previousInitialWorkspaces?.some(previous=>matchesDefaultComposition(parsed,previous))){
          const expanded=structuredClone(profile.initialWorkspace)
          if(expanded.screens.some(s=>s.id===parsed.activeScreenId))expanded.activeScreenId=parsed.activeScreenId
          return expanded
        }
        return parsed
      }
    }
  } catch { /* fall back to initial layout */ }
  return structuredClone(profile.initialWorkspace)
}
function nextWindowId() { return 'w-' + crypto.randomUUID() }
function TabStrip({ panel, descriptors, onSelect, onClose }: {
  panel: Panel; descriptors: ContentDescriptor[]; onSelect: (id: string) => void; onClose: (id: string) => void
}) {
  const strip = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState({left: false, right: false})
  const refresh = () => {
    const node = strip.current
    if (!node) return
    setBounds({left: node.scrollLeft > 1, right: node.scrollLeft + node.clientWidth < node.scrollWidth - 1})
  }
  useLayoutEffect(() => {
    const node = strip.current
    if (!node) return
    const chosen = [...node.querySelectorAll<HTMLElement>('[data-content-id]')].find(el => el.dataset.contentId === panel.active)
    if (chosen) {
      if (chosen.offsetLeft < node.scrollLeft) node.scrollLeft = chosen.offsetLeft
      else if (chosen.offsetLeft + chosen.offsetWidth > node.scrollLeft + node.clientWidth) node.scrollLeft = chosen.offsetLeft + chosen.offsetWidth - node.clientWidth
    }
    refresh()
  }, [panel.active, panel.tabs, descriptors])
  useEffect(() => {
    const node = strip.current
    const header = node?.closest<HTMLElement>('.panel-header')
    if (!node || !header) return
    const wheel = (event: WheelEvent) => {
      // The entire window header owns the wheel: never chain to the board,
      // including when the strip has no overflow or is already at an edge.
      if (event.ctrlKey) return // leave browser zoom intact
      event.preventDefault()
      event.stopPropagation()
      if (node.scrollWidth > node.clientWidth + 1) {
        const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
        node.scrollLeft += delta * scale
      }
      refresh()
      observeMechanicsElement(node,'core:ui','tab-header-wheel',{scrollLeft:node.scrollLeft,scrollWidth:node.scrollWidth},{module:'src/shell/WorkspaceShell.tsx',symbol:'TabStrip'})
    }
    const observer = new ResizeObserver(refresh)
    observer.observe(node)
    header.addEventListener('wheel', wheel, {passive: false})
    return () => { observer.disconnect(); header.removeEventListener('wheel', wheel) }
  }, [])
  const byId = (id: string) => descriptors.find(item => item.id === id)
  return <div className="tab-navigation">
    <button className="tab-scroll-btn" aria-label="Прокрутить вкладки влево" disabled={!bounds.left} onClick={() => strip.current?.scrollBy({left:-180,behavior:'smooth'})}>‹</button>
    <div ref={strip} className="tab-strip" onScroll={refresh}>
      {panel.tabs.map(id => {
        const item = byId(id); if (!item) return null
        return <div className={'content-tab ' + (panel.active === id ? 'active' : '')} data-content-id={id} key={id} title={item.label}>
          <button onClick={() => onSelect(id)}><span style={{color:item.accent}}>{item.icon}</span><span className="tab-label">{item.label}</span></button>
          <button className="tab-x" title="Закрыть вкладку (состояние останется)" aria-label={'Убрать вкладку '+id} onClick={() => onClose(id)}>×</button>
        </div>
      })}
    </div>
    <button className="tab-scroll-btn" aria-label="Прокрутить вкладки вправо" disabled={!bounds.right} onClick={() => strip.current?.scrollBy({left:180,behavior:'smooth'})}>›</button>
    {(bounds.left || bounds.right) && <span className="tab-overflow-marker" title="Есть скрытые вкладки">•••</span>}
  </div>
}
type WorkspaceOps = ReturnType<typeof createWorkspaceModel>
type PanelProps = {
  panel: Panel; screenId: string; workspace: Workspace; profile: WorkspaceProfile; ops: WorkspaceOps
  selected: boolean; hovered: boolean; focus: () => void
  runCommand: (command: WorkspaceCommand) => void
  savePanelTemplate: (panel: Panel) => void
  pick: string | null; setPick: (id: string | null) => void
  startResize: (event: ReactPointerEvent<HTMLButtonElement>, panel: Panel) => void
  fitArmed: boolean; toggleFit: () => void
  startDrag: (event: ReactPointerEvent<HTMLDivElement>, panel: Panel) => void
  previewRect: Rect | null; isDragging: boolean
  inspect: (target:MechanicsTarget)=>void
}
function WindowPanel({ panel, screenId, workspace, profile, ops, selected, hovered, focus, runCommand, savePanelTemplate, pick, setPick, startResize, fitArmed, toggleFit, startDrag, previewRect, isDragging, inspect }: PanelProps) {
  const [contentQuery, setContentQuery] = useState('')
  const active = panel.active
  const minimum = ops.undersized(panel)
  const rect = previewRect ?? panel.rect
  const style: CSSProperties = {left:rect.x,top:rect.y,width:rect.w,height:rect.h,zIndex:isDragging?24:selected?8:hovered?7:2}
  return <section className={'window-panel '+(selected?'selected ':'')+(hovered?'swap-target ':'')+(fitArmed?'fit-armed ':'')+(isDragging?'dragging-live ':'')} style={style} onPointerDown={focus} data-panel-id={panel.id}>
    <header className="panel-header">
      <div className="drag-grip" role="button" tabIndex={0} title="Перетащить окно. Прокрутка доступна колёсиком или у края" onPointerDown={e=>startDrag(e,panel)}>⠿ <span className="panel-id" title={panel.id}>{panel.id.toUpperCase()}</span></div>
      <TabStrip panel={panel} descriptors={profile.descriptors} onSelect={id=>runCommand({type:'activateContent',screenId,panelId:panel.id,contentId:id})} onClose={id=>runCommand({type:'removeContent',screenId,panelId:panel.id,contentId:id})}/>
      <button className="panel-header-action mechanics-panel-button" title="Механики этого окна" aria-label={"Механики окна "+panel.id} onClick={()=>inspect({panelId:panel.id,screenId,viewId:active??''})}>⌁</button>
      <button className={'panel-fit-button '+(fitArmed?'active':'')} title={fitArmed?'Вписывание включено':'Вписать окно в свободное место при следующем переносе'} aria-label="Вписать в свободное место при переносе" aria-pressed={fitArmed} onClick={toggleFit}>▣</button>
      <button className="panel-header-action" title="Сохранить окно со всеми вкладками как шаблон" aria-label="Сохранить шаблон окна" onClick={()=>savePanelTemplate(panel)}>☆</button>
      <button className="panel-header-action" title="Добавить вкладку с содержимым" aria-label="Добавить содержимое" onClick={()=>setPick(pick===panel.id?null:panel.id)}>+</button>
      <button className="panel-header-action" title="Закрыть окно (данные останутся)" aria-label="Закрыть окно" onClick={()=>runCommand({type:'removePanel',screenId,panelId:panel.id})}>×</button>
    </header>
    <div className="panel-body" data-mechanics-view={active??undefined}>
      {active ? profile.renderContent(active,id=>runCommand({type:'openContent',contentId:id,panelId:nextWindowId()}),{panelId:panel.id,screenId,viewId:active}) : <div className="empty-panel"><span className="empty-glyph">▧</span><b>Пустое окно</b><p>Разместите один из доступных типов контента</p><button className="primary-btn" onClick={()=>setPick(panel.id)}>+ Добавить содержимое</button></div>}
      {minimum && <div className="size-warning" role="status">⚠ Для {active?ops.getDescriptor(active).label:'содержимого'} рекомендуется от {minimum.width} × {minimum.height} px. Текущий размер {panel.rect.w} × {panel.rect.h} px.</div>}
    </div>
    {pick===panel.id && <div className="quick-picker"><div className="picker-top"><b>Добавить содержимое</b><button onClick={()=>setPick(null)} aria-label="Закрыть выбор">×</button></div>
      <input className="content-picker-search" aria-label="Поиск вида контента" placeholder="Поиск по названию..." value={contentQuery} onChange={e=>setContentQuery(e.target.value)}/>
      {profile.descriptors.filter(d=>(d.label+' '+d.caption).toLocaleLowerCase().includes(contentQuery.trim().toLocaleLowerCase())).map(d=>{
        const used=ops.countContent(workspace,screenId,d.id), here=panel.tabs.includes(d.id), allowed=!here&&ops.canAddContent(workspace,screenId,d.id)
        return <button className="pick-option" key={d.id} disabled={!allowed} onClick={()=>{runCommand({type:'addContent',screenId,panelId:panel.id,contentId:d.id});setPick(null)}}><span style={{color:d.accent}}>{d.icon}</span><span>{d.label}<small>{here?'Уже есть в этом окне':!allowed?'Занято на экране · '+used+'/1':d.minWidth+' × '+d.minHeight+' px'}</small></span>{allowed?<span>+</span>:<span>—</span>}</button>
      })}
    </div>}
    <button className="resize-handle" title="Изменить размер" aria-label="Изменить размер окна" onPointerDown={e=>startResize(e,panel)}>◢</button>
  </section>
}
export function WorkspaceShell({profile}: {profile: WorkspaceProfile}) {
  const [mechanics]=useState(()=>createMechanicsRuntime(sourceIndex))
  const mechanicsHost=useRef<HTMLDivElement>(null)
  const [mechanicsOpen,setMechanicsOpen]=useState(false)
  const [mechanicsTarget,setMechanicsTarget]=useState<MechanicsTarget|null>(null)
  const pendingMechanics=useRef(new Map<string,TraceToken>())
  const inspect=(target:MechanicsTarget|null)=>{setMechanicsTarget(target);setMechanicsOpen(true)}
  const layoutScopeId=profile.workspaceId
  const layoutScopes=[layoutScopeId]
  const ops=createWorkspaceModel(profile.descriptors)
  const [shell,dispatchShell]=useReducer(
    (state:ShellState,action:ShellAction)=>reduceShellState(state,action,ops,layoutScopeId,profile.initialWorkspace,profile.screenTemplates),
    undefined,
    ():ShellState=>({
      layouts:Object.fromEntries(layoutScopes.map(ctx=>[ctx,restoreLayout(profile,ctx,ops.validateWorkspace)])),
      revision:0,
      bridgeReply:null,
    }),
  )
  const layouts=shell.layouts
  const workspace=layouts[layoutScopeId] ?? profile.initialWorkspace
  const screen=ops.currentScreen(workspace)
  const [picker,setPicker]=useState<string|null>(null)
  const [focused,setFocused]=useState<string|null>(null)
  const [rename,setRename]=useState(false)
  const [renameValue,setRenameValue]=useState('')
  const [fitArmed,setFitArmed]=useState<string|null>(null)
  const [settingsOpen,setSettingsOpen]=useState(false)
  const [layoutError,setLayoutError]=useState('')
  const [settingsError,setSettingsError]=useState('')
  const [headerHidden,setHeaderHidden]=useState(()=>{try{return localStorage.getItem(HEADER_KEY)==='1'}catch{return false}})
  const [groupMenu,setGroupMenu]=useState<{id:string;left:number;top:number}|null>(null)
  const [groupEditor,setGroupEditor]=useState<{id?:string;title:string;screenIds:string[]}|null>(null)
  const [screenMenu,setScreenMenu]=useState<{left:number;top:number}|null>(null)
  const [templateCatalogOpen,setTemplateCatalogOpen]=useState(false)
  const [windowPresetMenu,setWindowPresetMenu]=useState(false)
  const [windowPresetPosition,setWindowPresetPosition]=useState<{left:number;top:number}|null>(null)
  const [panelPresets,setPanelPresets]=useState<PanelPreset[]>(readPanelPresets)
  const [panelPresetEditor,setPanelPresetEditor]=useState<{panelId:string;title:string}|null>(null)
  const [fitGap,setFitGap]=useState(restoreGap)
  const [viewMode,setViewMode]=useState(()=>{try{return localStorage.getItem(VIEW_KEY)==='1'}catch{return false}})
  const board=useRef<HTMLDivElement>(null), stage=useRef<HTMLElement>(null)
  const scrollZone=useRef<HTMLDivElement>(null)
  const [stageHeight,setStageHeight]=useState(0)
  const liveMechanicsState=useRef({workspace,fitGap,viewMode,headerHidden,focused})
  useLayoutEffect(()=>{
    liveMechanicsState.current={workspace,fitGap,viewMode,headerHidden,focused}
    mechanics.setSourceIndex(sourceIndex)
    const profileCatalog=profile.getMechanicsCatalog?.(workspace.screens.flatMap(s=>s.panels.flatMap(p=>p.tabs.map(viewId=>({panelId:p.id,screenId:s.id,viewId})))))
    const entries=[['core:open','core.open-content'],['core:layout','core.workspace-command'],['core:drag','core.window-drag'],
      ['core:persistence','core.layout-persistence'],['core:settings','core.settings'],['core:bridge','core.bridge'],['core:ui','core.ui']]
    const coreConnections:MechanicConnection[]=entries.map(([id,definitionId])=>({
      id,definitionId,title:CORE_MECHANICS.find(d=>d.id===definitionId)!.title,
      scope:{id:layoutScopeId,level:'workspace',title:'Workspace · '+profile.title},
      participants:[{role:'layout',ref:layoutScopeId}],presentation:[],
      persistence:id==='core:persistence'?profile.layoutKey(layoutScopeId):id==='core:settings'?'Settings / Panel Presets browser keys':'По действию; предметные Content не копируются',
      read:()=>({available:id!=='core:bridge'||!!import.meta.hot,reason:id==='core:bridge'&&!import.meta.hot?'Bridge подключён только в dev':null,
       profileId:profile.id,activeScreenId:liveMechanicsState.current.workspace.activeScreenId,
       screens:liveMechanicsState.current.workspace.screens.length,viewMode:liveMechanicsState.current.viewMode,
       focusedWindow:liveMechanicsState.current.focused,fitGap:liveMechanicsState.current.fitGap}),
    }))
    mechanics.configure({definitions:[...CORE_MECHANICS,...profileCatalog?.definitions??[]],connections:[...coreConnections,...profileCatalog?.connections??[]],uiBindings:profileCatalog?.uiBindings})
  },[mechanics,profile,workspace,fitGap,viewMode,headerHidden,focused])
  useLayoutEffect(()=>{
    const host=mechanicsHost.current
    return host?attachMechanicsHost(host,mechanics):undefined
  },[mechanics])
  useEffect(()=>profile.attachMechanics?.(mechanics),[mechanics,profile.attachMechanics])
  useLayoutEffect(()=>{
    const viewport=stage.current
    if(!viewport) return
    const refresh=()=>{setStageHeight(viewport.clientHeight);mechanics.emit('core:ui','viewport-size','observed',{height:viewport.clientHeight},{module:'src/shell/WorkspaceShell.tsx',symbol:'WorkspaceShell'})}
    const observer=new ResizeObserver(refresh)
    observer.observe(viewport)
    refresh()
    return ()=>observer.disconnect()
  },[])
  useEffect(()=>{
    const zone=scrollZone.current
    if(!zone) return
    const wheel=(event: WheelEvent)=>{
      if(event.ctrlKey) return // native browser zoom
      if(event.target instanceof Element&&event.target.closest('.screen-group-popover,.screen-group-editor,.screen-create-menu'))return
      event.preventDefault()
      event.stopPropagation()
      const viewport=stage.current
      if(!viewport) return
      const scale=event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1
      viewport.scrollBy({top:event.deltaY*scale,left:event.deltaX*scale,behavior:'instant'})
      mechanics.emit('core:ui','workspace-wheel','observed',{scrollTop:viewport.scrollTop,scrollLeft:viewport.scrollLeft},{module:'src/shell/WorkspaceShell.tsx',symbol:'WorkspaceShell'})
    }
    zone.addEventListener('wheel',wheel,{passive:false})
    return ()=>zone.removeEventListener('wheel',wheel)
  },[])
  const modify=(fn:(w:Workspace)=>Workspace)=>{
    const token=mechanics.start('core:layout','modify',{module:'src/shell/WorkspaceShell.tsx',symbol:'modify'})
    if(token)pendingMechanics.current.set(token.id,token)
    dispatchShell({type:'modify',update:fn,...(token?{traceId:token.id}:{})})
  }
  const runCommand=(input:WorkspaceCommand)=>{
    const command=parseWorkspaceCommand(input)
    const token=mechanics.start(input.type==='openContent'?'core:open':'core:layout',input.type,
      {module:'src/shell/workspaceCommands.ts',symbol:'executeWorkspaceCommand'},{command:input.type})
    if(!command){mechanics.finish(token,'rejected',{code:'INVALID_COMMAND'});return}
    if(token)pendingMechanics.current.set(token.id,token)
    dispatchShell({type:'command',command,...(token?{traceId:token.id}:{})})
  }
  const bridgeSessionId=useRef(crypto.randomUUID())
  const liveBridgeState=useRef({workspace,revision:shell.revision})
  useLayoutEffect(()=>{
    liveBridgeState.current={workspace,revision:shell.revision}
  },[workspace,shell.revision])
  useEffect(()=>{
    const hot=import.meta.hot
    if(!hot)return
    const respond=(data:Record<string,unknown>)=>hot.send('workspace-bridge:response',data)
    const register=()=>hot.send('workspace-bridge:register',{})
    const receive=(raw:unknown)=>{
      if(!raw||typeof raw!=='object')return
      const message=raw as Record<string,unknown>
      const requestId=message.requestId
      if(typeof requestId!=='string'||requestId.length>128)return
      if(message.operation==='getWorkspace'){
        mechanics.emit('core:bridge','getWorkspace','observed',{revision:liveBridgeState.current.revision},{module:'src/shell/WorkspaceShell.tsx',symbol:'receive'})
        respond({requestId,status:'ok',sessionId:bridgeSessionId.current,...liveBridgeState.current,
          screenTemplates:profile.screenTemplates??[],screenBundles:profile.screenBundles??[]})
        return
      }
      if(message.operation!=='runCommand')return
      if(message.sessionId!==bridgeSessionId.current){
        mechanics.emit('core:bridge','runCommand','rejected',{code:'SESSION_CONFLICT'})
        respond({requestId,status:'conflict',code:'SESSION_CONFLICT'})
        return
      }
      const command=parseWorkspaceCommand(message.command)
      if(!command||!Number.isSafeInteger(message.expectedRevision)){
        mechanics.emit('core:bridge','runCommand','rejected',{code:'INVALID_COMMAND'})
        respond({requestId,status:'rejected',code:'INVALID_COMMAND'})
        return
      }
      const token=mechanics.start('core:bridge',command.type,{module:'src/shell/WorkspaceShell.tsx',symbol:'receive'},{requestId})
      if(token)pendingMechanics.current.set(token.id,token)
      dispatchShell({type:'command',command,requestId,expectedRevision:message.expectedRevision as number,...(token?{traceId:token.id}:{})})
    }
    hot.on('workspace-bridge:request',receive)
    hot.on('vite:ws:connect',register)
    register()
    return ()=>{
      hot.off('workspace-bridge:request',receive)
      hot.off('vite:ws:connect',register)
    }
  },[])
  // Hydration remains read-only. A bridge command is acknowledged only after persistence.
  const previousLayouts=useRef(layouts)
  const lastBridgeAcknowledged=useRef<string|null>(null)
  useEffect(()=>{
    const previous=previousLayouts.current
    let saved=true
    let changed=false
    for(const [workspaceId,layout] of Object.entries(layouts)){
      if(layout!==previous[workspaceId]){
        changed=true
        if(!writePreservingInvalid(profile.layoutKey(workspaceId),JSON.stringify(layout,null,2),validStoredJson(ops.validateWorkspace),raw=>{
          try{const value:unknown=JSON.parse(raw);return ops.validateWorkspace(value)&&profile.previousInitialWorkspaces?.some(previous=>matchesDefaultComposition(value,previous))?(profile.previousLayoutArchiveKey??true):false}
          catch{return false}
        }))saved=false
      }
    }
    previousLayouts.current=layouts
    if(changed){
      setLayoutError(saved?'':'Не удалось сохранить размещение окон. Текущая раскладка останется только до перезагрузки.')
      mechanics.emit('core:persistence','layout-read-back',saved?'saved':'rejected',{readBack:saved,revision:shell.revision},
        {module:'src/shell/safeStorage.ts',symbol:'writePreservingInvalid'})
    }
    for(const result of shell.mechanicsReplies??[]){
      const token=pendingMechanics.current.get(result.traceId)
      if(!token)continue
      mechanics.finish(token,result.status==='applied'?(saved?'saved':'rejected'):result.status==='noop'?'noop':'rejected',
        {revision:result.revision,code:result.code??(saved?null:'PERSISTENCE_FAILED'),reason:result.message??null,
          ...(result.status==='applied'?{layoutApplied:true,readBack:saved,coalescedCommit:true}:{})})
      pendingMechanics.current.delete(result.traceId)
    }
    const reply=shell.bridgeReply
    if(reply&&lastBridgeAcknowledged.current!==reply.requestId){
      lastBridgeAcknowledged.current=reply.requestId
      import.meta.hot?.send('workspace-bridge:response',{
        ...reply,status:reply.status==='applied'?(saved?'persisted':'error'):reply.status,
        revision:shell.revision,
        ...(reply.status==='applied'&&!saved?{code:'PERSISTENCE_FAILED'}:{}),
      })
    }
  },[layouts,shell.bridgeReply,shell.mechanicsReplies,profile.id])
  useEffect(()=>{
    const saved=[[SETTINGS_KEY,String(fitGap)],[VIEW_KEY,viewMode?'1':'0'],[HEADER_KEY,headerHidden?'1':'0']]
      .map(([key,value])=>writePreservingInvalid(key,value,()=>true)).every(Boolean)
    setSettingsError(saved?'':'Не удалось сохранить настройки Workspace. Они действуют только в открытой вкладке.')
    mechanics.emit('core:settings','settings-read-back',saved?'saved':'rejected',{readBack:saved,fitGap,viewMode,headerHidden},{module:'src/shell/safeStorage.ts',symbol:'writePreservingInvalid'})
  },[fitGap,viewMode,headerHidden])
  useEffect(()=>{
    if(!groupMenu&&!groupEditor)return
    const esc=(e:KeyboardEvent)=>{if(e.key==='Escape'){setGroupMenu(null);setGroupEditor(null)}}
    const outside=(e:PointerEvent)=>{
      if(groupMenu&&e.target instanceof Element&&!e.target.closest('.screen-group-popover,.screen-group-trigger'))setGroupMenu(null)
    }
    window.addEventListener('keydown',esc)
    window.addEventListener('pointerdown',outside)
    return ()=>{window.removeEventListener('keydown',esc);window.removeEventListener('pointerdown',outside)}
  },[groupMenu,groupEditor])
  useEffect(()=>{
    if(!screenMenu)return
    const dismiss=(event:PointerEvent)=>{
      const target=event.target
      if(target instanceof Element&&!target.closest('.screen-create-menu, .new-screen'))setScreenMenu(null)
    }
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setScreenMenu(null)}
    window.addEventListener('pointerdown',dismiss)
    window.addEventListener('keydown',escape)
    return ()=>{window.removeEventListener('pointerdown',dismiss);window.removeEventListener('keydown',escape)}
  },[screenMenu])
  useEffect(()=>{setFocused(null);setPicker(null);setFitArmed(null);setRename(false);setScreenMenu(null)},[layoutScopeId])
  const {startDrag,hovered,ghost,notice,setNotice,draggedId,previewRect}=useWindowDrag({
    screen,workspace,board,stage,armedPanelId:fitArmed,fitGap,onFitted:()=>setFitArmed(null),update:modify,
    observe:(action,outcome,detail)=>mechanics.emit('core:drag',action,outcome,detail??{}, {module:'src/shell/windowDrag.ts',symbol:'useWindowDrag'}),
  })
  const beginSavePanelTemplate=(panel:Panel)=>{
    const descriptor=panel.active?profile.descriptors.find(d=>d.id===panel.active):null
    setPanelPresetEditor({panelId:panel.id,title:descriptor?descriptor.label+' · окно':'Моё окно'})
    setWindowPresetMenu(false)
  }
  const updatePanelPresets=(items:PanelPreset[])=>{
    const result=writePreservingInvalid(PANEL_PRESETS_KEY,presetStoreJson(items),raw=>{
      try{return isPanelPresetStore(JSON.parse(raw) as unknown)}
      catch{return false}
    })
    mechanics.emit('core:settings','panel-preset-read-back',result?'saved':'rejected',{readBack:result,presets:items.length},{module:'src/shell/WorkspaceShell.tsx',symbol:'updatePanelPresets'})
    if(!result){setNotice('Не удалось сохранить шаблоны окон: исходные данные сохранены');return false}
    setPanelPresets(items)
    return true
  }
  const savePanelTemplate=()=>{
    if(!panelPresetEditor)return
    const panel=workspace.screens.flatMap(s=>s.panels).find(p=>p.id===panelPresetEditor.panelId)
    if(!panel){setNotice('Окно больше не существует');return}
    if(panelPresets.length>=100){setNotice('Лимит шаблонов окон: 100');return}
    const preset=capturePanelPreset(panel,'panel-preset-'+crypto.randomUUID(),panelPresetEditor.title)
    if(!preset){setNotice('Укажите название шаблона до 100 символов');return}
    if(updatePanelPresets([...panelPresets,preset])){
      setPanelPresetEditor(null);setNotice('Шаблон окна сохранён: вкладки, активный вид и размер')
    }
  }
  const insertPanelPreset=(preset:PanelPreset)=>{
    const panelId=nextWindowId()
    const result=placePanelPreset(workspace,screen.id,panelId,preset,ops)
    if(!result.ok){setNotice(result.reason);return}
    modify(()=>result.workspace)
    setFocused(panelId);setPicker(null);setWindowPresetMenu(false);setNotice(null)
  }
  const removePanelPreset=(id:string)=>{
    if(updatePanelPresets(panelPresets.filter(item=>item.id!==id)))
      setNotice('Шаблон окна удалён; существующие окна и контент не изменены')
  }
  const createWindow=(kind?:string)=>{
    const id=nextWindowId(),sid=screen.id
    runCommand({type:'addPanel',screenId:sid,panelId:id,...(kind?{contentId:kind}:{})})
    setFocused(id);setPicker(kind?null:id)
  }
  const startResize=(e:ReactPointerEvent<HTMLButtonElement>,panel:Panel)=>{
    e.preventDefault();e.stopPropagation()
    const original:Rect={...panel.rect},x=e.clientX,y=e.clientY,id=panel.id,sid=screen.id
    const move=(evt:PointerEvent)=>modify(w=>ops.changeRect(w,sid,id,{...original,w:original.w+evt.clientX-x,h:original.h+evt.clientY-y}))
    const stop=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);window.removeEventListener('pointercancel',stop)}
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',stop);window.addEventListener('pointercancel',stop)
  }
  const screenId= (kind:'screen'|'panel') => (kind==='screen'?'screen-':'w-')+crypto.randomUUID()
  const addTemplateScreens=(templateIds:readonly string[])=>{
    const templates=templateIds.map(id=>profile.screenTemplates?.find(t=>t.id===id))
    if(templates.some(t=>!t)){setNotice('Шаблон экрана недоступен');return}
    runCommand({type:'createTemplateScreens',placements:templates.map(template=>({
      templateId:template!.id,screenId:screenId('screen'),panelIds:template!.panels.map(()=>screenId('panel')),
    }))})
    setScreenMenu(null);setPicker(null);setFocused(null);setFitArmed(null);setNotice(null)
  }
  const addBlankScreen=()=>{
    setScreenMenu(null)
    runCommand({type:'createScreen',screenId:screenId('screen')})
    setPicker(null);setFocused(null);setFitArmed(null);setNotice(null)
  }
  const copyCurrentScreen=()=>{
    setScreenMenu(null)
    runCommand({type:'duplicateScreen',sourceId:screen.id,screenId:screenId('screen'),
      panelIds:screen.panels.map(()=>screenId('panel'))})
    setPicker(null);setFocused(null);setFitArmed(null);setNotice(null)
  }
  const toggleScreenMenu=(button:HTMLButtonElement)=>{
    if(screenMenu){setScreenMenu(null);return}
    const bounds=button.getBoundingClientRect()
    setScreenMenu({
      left:Math.max(12,Math.min(bounds.left,window.innerWidth-344)),
      top:bounds.bottom+6,
    })
    setSettingsOpen(false)


  }
  const reset=()=>{
    if(window.confirm('Сбросить размещение окон? Данные архитектуры, требования и Markdown сохранятся.')){
      modify(()=>structuredClone(profile.initialWorkspace))
      setPicker(null);setFitArmed(null);setNotice(null)
    }
  }
  const selectScreen=(id:string)=>{runCommand({type:'activateScreen',screenId:id});setFocused(null);setPicker(null);setFitArmed(null);setRename(false);setGroupMenu(null)}
  const openGroup=(id:string,button:HTMLButtonElement)=>{
    if(groupMenu?.id===id){setGroupMenu(null);return}
    const rect=button.getBoundingClientRect()
    setGroupMenu({id,left:Math.min(Math.max(12,rect.left),Math.max(12,window.innerWidth-342)),top:Math.min(rect.bottom+7,window.innerHeight-160)})
    setScreenMenu(null);
  }
  const beginGroup=(id?:string)=>{
    const current=workspace.screenGroups?.find(g=>g.id===id)
    setGroupMenu(null);setScreenMenu(null)
    const free=!(workspace.screenGroups??[]).some(g=>g.screenIds.includes(screen.id))
    setGroupEditor({id:current?.id,title:current?.title??'Новая группа',screenIds:current?[...current.screenIds]:free?[screen.id]:[]})
  }
  const saveGroup=()=>{
    if(!groupEditor)return
    const id=groupEditor.id??'group-'+crypto.randomUUID()
    const next=ops.saveScreenGroup(workspace,id,groupEditor.title,groupEditor.screenIds)
    if(!next||!ops.validateWorkspace(next)){setNotice('Выберите не менее двух свободных экранов и укажите название группы');return}
    runCommand({type:'saveScreenGroup',groupId:id,title:groupEditor.title,screenIds:groupEditor.screenIds})
    setGroupEditor(null);setNotice(null)
  }
  const screenGroups=workspace.screenGroups??[]
  const screenGroupFor=new Map(screenGroups.flatMap(g=>g.screenIds.map(id=>[id,g] as const)))
  const templateCatalog=templateCatalogOpen?profile.getTemplateCatalog?.():null
  const templateLevelLabel:Record<string,string>={content:'Content'}
  const popupPosition=(button:HTMLButtonElement,width=342)=>{
    const rect=button.getBoundingClientRect()
    return {
      left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12)),
      top:rect.bottom+8,
    }
  }
  const popupStyle=(position:{left:number;top:number}|null)=>position?{
    left:position.left,
    top:position.top,
    maxHeight:Math.max(120,window.innerHeight-position.top-12),
  }:undefined
  const targetPanel=mechanicsTarget?workspace.screens.flatMap(s=>s.panels.map(p=>({panel:p,screenId:s.id}))).find(item=>item.panel.id===mechanicsTarget.panelId):null
  const liveTarget=targetPanel?{panelId:targetPanel.panel.id,screenId:targetPanel.screenId,viewId:targetPanel.panel.active??''}:null
  const boardWidth=Math.max(1265,...screen.panels.map(p=>p.rect.x+p.rect.w+45))+(ghost?1800:0)
  // Keep a small panning runway even when every panel initially fits.
  const boardHeight=Math.max(650,stageHeight+300,...screen.panels.map(p=>p.rect.y+p.rect.h+48))+(ghost?1800:0)
  return <div ref={mechanicsHost} data-mechanics-host={profile.id} className={'app-shell '+(viewMode?'view-mode':'')}>
    {!headerHidden&&<header className="top-header">
      <div className="brand"><div className="brand-symbol">▦</div><div><strong>{profile.title}</strong><small>{profile.subtitle}</small></div></div>
      <div className="header-actions">
        {profile.getTemplateCatalog&&<button className="header-btn template-catalog-trigger" aria-expanded={templateCatalogOpen} onClick={()=>{setTemplateCatalogOpen(v=>!v);setWindowPresetMenu(false)}}>▦ Шаблоны и экземпляры</button>}
        <button className="header-btn" onClick={()=>createWindow()}>+ Окно</button>
        <button className="header-btn panel-presets-trigger" title="Шаблоны сохранённых окон" aria-label="Шаблоны окон" aria-expanded={windowPresetMenu}
          onClick={e=>{setWindowPresetPosition(popupPosition(e.currentTarget));setWindowPresetMenu(v=>!v);setScreenMenu(null)}}>▤</button>
        <button className={'header-btn '+(viewMode?'highlighted':'')} aria-pressed={viewMode} onClick={()=>{setViewMode(v=>!v);setPicker(null);setFitArmed(null)}}>{viewMode?'Обычный режим':'Просмотр'}</button>
        <button className="header-btn settings-trigger" aria-expanded={settingsOpen} aria-controls="workspace-settings" onClick={()=>setSettingsOpen(v=>!v)}><span className="settings-gear" aria-hidden="true">⚙</span><span className="settings-label"> Настройки</span></button>
        <button className="header-btn subdued" onClick={reset} title="Восстановить стандартное размещение экранов">↺</button>
      </div>
      {templateCatalogOpen&&templateCatalog&&<section className="template-catalog" role="dialog" aria-label="Шаблоны и экземпляры">
        <div className="screen-create-title"><strong>Шаблоны и экземпляры</strong><button aria-label="Закрыть каталог шаблонов" onClick={()=>setTemplateCatalogOpen(false)}>×</button></div>
        <p className="sim-hint">Template определяет структуру и возможности; Instance хранит собственные данные. Это чтение существующих сущностей, без изменения State и раскладки.</p>
        {Boolean(profile.screenTemplates?.length)&&<>
          <h3>Шаблоны размещения экранов</h3>
          <p className="sim-hint">Набор создаётся через «+ Экран». Он открывает виды существующего Content, без копирования данных.</p>
          {profile.screenBundles?.map(bundle=><div className="template-catalog-row" key={bundle.id}><b>{bundle.title}</b><small>{bundle.description}</small></div>)}
          {profile.screenTemplates?.map(template=><div className="template-catalog-row" key={template.id}><b>{template.title}</b><small>{template.description}</small></div>)}
        </>}
        <h3>Content Templates ({templateCatalog.templates.length})</h3>
        {templateCatalog.templates.map(t=><div className="template-catalog-row" key={t.id}>
          <b>{t.title}</b><span>{templateLevelLabel[t.level]} · {t.id} · v{t.version}</span>
          {t.description&&<small>{t.description}</small>}
          <small>Поля: {t.fields.length?t.fields.join(', '):'нет'} · Возможности: {t.capabilities.join(', ')||'нет'}</small>
        </div>)}
        <h3>Экземпляры ({templateCatalog.instances.length})</h3>
        {templateCatalog.instances.map(instance=><div key={instance.id} className="template-catalog-row">
          <b>{instance.title}</b><span>{templateLevelLabel[instance.level]} · ID: {instance.id}</span>
          <small>Шаблон: {instance.templateId} · v{instance.templateVersion} · {instance.origin.kind}</small>
        </div>)}
        <p className="sim-hint">Каталог показывает Template и реальные Content Instances активного профиля. Открытие окна отображает экземпляр, а не создаёт копию его данных.</p>
      </section>}
      {windowPresetMenu&&<section className="screen-create-menu panel-presets-menu" role="dialog" aria-label="Шаблоны окон" style={popupStyle(windowPresetPosition)}>
        <div className="screen-create-title"><strong>Шаблоны окон ({panelPresets.length})</strong><button aria-label="Закрыть шаблоны окон" onClick={()=>setWindowPresetMenu(false)}>×</button></div>
        <p>Шаблон сохраняет набор вкладок, выбранный контент и размер окна. Он ссылается на существующие данные, не копируя их.</p>
        {!panelPresets.length&&<p className="panel-preset-empty">Шаблонов пока нет. Откройте окно и нажмите ☆ в его заголовке.</p>}
        {panelPresets.map(preset=><div key={preset.id} className="panel-preset-entry">
          <strong>{preset.title}</strong>
          <small>Окно · {preset.size.w} × {preset.size.h}px · {preset.tabs.length} вкладок</small>
          <ul>{preset.tabs.map(id=><li key={id}>{profile.descriptors.find(d=>d.id===id)?.label??'Недоступный контент'} <small>({id})</small></li>)}</ul>
          <div className="panel-preset-actions">
            <button onClick={()=>insertPanelPreset(preset)}>Добавить на текущий экран</button>
            <button onClick={()=>removePanelPreset(preset.id)}>Удалить шаблон</button>
          </div>
        </div>)}
      </section>}
      {settingsOpen&&<section className="settings-popover" id="workspace-settings" role="dialog" aria-label="Настройки рабочего пространства">
        <div className="settings-popover-header"><strong>⚙ Настройки Workspace</strong><button className="settings-close" aria-label="Закрыть настройки" onClick={()=>setSettingsOpen(false)}>×</button></div>
        <label className="settings-field-label" htmlFor="fit-gap-range">Отступ при вписывании</label>
        <p>Расстояние между вписанным окном и краями соседних окон. 0 px — вплотную.</p>
        <div className="settings-input-row"><input id="fit-gap-range" aria-label="Отступ при вписывании" type="range" min="0" max="32" step="1" value={fitGap} onChange={e=>setFitGap(Number(e.target.value))}/><input className="settings-number" type="number" aria-label="Отступ в пикселях" min="0" max="32" step="1" value={fitGap} onChange={e=>setFitGap(Math.max(0,Math.min(32,Math.round(Number(e.target.value)))))}/><span>px</span></div>
        <div className="settings-footer"><span>0–32 px · сохраняется в браузере</span><button onClick={()=>setFitGap(DEFAULT_FIT_GAP)}>Сбросить: 4 px</button></div>
      </section>}
    </header>}
    {profile.renderFactualTime()}
    {(layoutError||settingsError)&&<div className="workspace-storage-error" role="alert">
      {layoutError&&<p>{layoutError}</p>}{settingsError&&<p>{settingsError}</p>}
    </div>}
    <div className="screen-rail" ref={scrollZone}>
      <button className="header-toggle" aria-label={headerHidden?'Показать верхнюю панель':'Скрыть верхнюю панель'} aria-expanded={!headerHidden} title={headerHidden?'Показать команды Workspace':'Скрыть команды Workspace'} onClick={()=>{setHeaderHidden(v=>!v);setSettingsOpen(false);}}>{headerHidden?'▾':'▴'} <span>{headerHidden?'Панель':'Скрыть'}</span></button>
      <button className="header-btn mechanics-trigger" aria-expanded={mechanicsOpen} onClick={()=>inspect(null)}>⌁ Механики</button>
      <span className="screen-rail-label">ЭКРАНЫ</span>
      <div className="screen-rail-stats" aria-live="polite">{rename?<form onSubmit={e=>{e.preventDefault();runCommand({type:'renameScreen',screenId:screen.id,title:renameValue});setRename(false)}}><input autoFocus aria-label="Новое имя экрана" value={renameValue} onChange={e=>setRenameValue(e.target.value)} onBlur={()=>setRename(false)}/></form>:<button className="screen-rename-trigger" title={'Переименовать экран '+screen.title} aria-label="Переименовать активный экран" onClick={()=>{setRename(true);setRenameValue(screen.title)}}>✎</button>}<span>{screen.panels.length} окон · {screen.panels.reduce((n,p)=>n+p.tabs.length,0)} вкладок</span></div>
      <nav className="screen-tabs" aria-label="Экраны">
        {workspace.screens.map(s=>{
          const group=screenGroupFor.get(s.id)
          if(group){
            if(group.screenIds[0]!==s.id)return null
            const active=group.screenIds.includes(screen.id)
            return <button key={group.id} className={'screen-group-trigger '+(active?'current':'')} aria-expanded={groupMenu?.id===group.id} aria-haspopup="dialog" onClick={e=>openGroup(group.id,e.currentTarget)} title={'Группа: '+group.title}>
              <span>▤ {group.title}</span><small>{group.screenIds.length} экранов</small><span aria-hidden="true">▾</span>
            </button>
          }
          return <div className="screen-tab-wrap" key={s.id}><button className={s.id===screen.id?'screen-tab current':'screen-tab'} aria-current={s.id===screen.id?'page':undefined} onClick={()=>selectScreen(s.id)}>{s.title}</button>{workspace.screens.length>1&&<button title={'Закрыть экран '+s.title} aria-label={'Закрыть экран '+s.title} className="screen-close" onClick={()=>{runCommand({type:'removeScreen',screenId:s.id});setPicker(null);setFocused(null)}}>×</button>}</div>
        })}
        <button className="new-screen" onClick={e=>toggleScreenMenu(e.currentTarget)} aria-expanded={Boolean(screenMenu)} aria-haspopup="dialog" aria-controls="screen-create-menu" title="Создать экран">+ Экран ▾</button>
        <button className="new-screen screen-group-add" onClick={()=>beginGroup()} title="Объединить экраны в группу">+ Группа</button>
      </nav>
      {screenMenu&&<section className="screen-create-menu" id="screen-create-menu" role="dialog" aria-label="Создать экран" style={{left:screenMenu.left,top:screenMenu.top,maxHeight:`calc(100vh - ${screenMenu.top+12}px)`}}>
        <div className="screen-create-title"><strong>Создать экран</strong><button aria-label="Закрыть выбор экрана" onClick={()=>setScreenMenu(null)}>×</button></div>
        {profile.screenBundles?.map(bundle=><button className="screen-create-option" key={bundle.id} onClick={()=>addTemplateScreens(bundle.templateIds)}><strong>▦ {bundle.title}</strong><small>{bundle.description} · Добавляет весь набор, сохраняя текущие экраны</small></button>)}
        {profile.screenTemplates?.map(template=><button className="screen-create-option" key={template.id} onClick={()=>addTemplateScreens([template.id])}><strong>▧ {template.title}</strong><small>{template.description}</small></button>)}
        <button className="screen-create-option" onClick={addBlankScreen}><strong>＋ Пустой экран</strong><small>Создать рабочую область без окон</small></button>
        <button className="screen-create-option" onClick={copyCurrentScreen}><strong>⧉ Копия текущего</strong><small>Копирует окна и расположение, данные остаются общими</small></button>
      </section>}
      {groupMenu&&screenGroups.filter(g=>g.id===groupMenu.id).map(g=><section key={g.id} className="screen-group-popover" role="dialog" aria-label={'Экраны группы '+g.title} style={{left:groupMenu.left,top:groupMenu.top}}>
        <div className="screen-group-popover-header"><strong>{g.title}</strong><button aria-label="Закрыть группу" onClick={()=>setGroupMenu(null)}>×</button></div>
        <div className="screen-group-options">{g.screenIds.map(id=>{
          const target=workspace.screens.find(s=>s.id===id)
          if(!target)return null
          return <button key={id} className={'screen-group-option '+(id===screen.id?'current':'')} aria-current={id===screen.id?'page':undefined} onClick={()=>selectScreen(id)}>
            <span>{target.title}</span><small>{target.panels.length} окон · {target.panels.reduce((n,p)=>n+p.tabs.length,0)} вкладок</small>
            {id===screen.id&&<span className="group-selected-mark" aria-label="Выбран">✓</span>}
          </button>
        })}</div>
        <div className="screen-group-actions">
          <button onClick={()=>beginGroup(g.id)}>✎ Изменить</button>
          <button onClick={()=>{runCommand({type:'removeScreenGroup',groupId:g.id});setGroupMenu(null)}}>Разгруппировать</button>
        </div>
      </section>)}
    </div>
    {panelPresetEditor&&<div className="panel-preset-editor-backdrop" onPointerDown={e=>{if(e.target===e.currentTarget)setPanelPresetEditor(null)}}>
      <form className="panel-preset-editor" role="dialog" aria-modal="true" aria-label="Сохранить шаблон окна" onSubmit={e=>{e.preventDefault();savePanelTemplate()}}>
        <div className="screen-create-title"><strong>Сохранить окно как шаблон</strong><button type="button" aria-label="Отмена" onClick={()=>setPanelPresetEditor(null)}>×</button></div>
        <p>Сохраняются все вкладки, активный контент и размер. Данные Content останутся по исходным адресам.</p>
        <label>Название шаблона<input autoFocus maxLength={100} aria-label="Название шаблона окна" value={panelPresetEditor.title} onChange={e=>setPanelPresetEditor(old=>old?{...old,title:e.target.value}:old)}/></label>
        <div className="panel-preset-actions"><button type="button" onClick={()=>setPanelPresetEditor(null)}>Отмена</button><button type="submit" disabled={!panelPresetEditor.title.trim()}>Сохранить шаблон</button></div>
      </form>
    </div>}
    {groupEditor&&<div className="screen-group-editor-backdrop"  onPointerDown={e=>{if(e.target===e.currentTarget)setGroupEditor(null)}}>
      <section className="screen-group-editor" role="dialog" aria-modal="true" aria-label={groupEditor.id?'Изменить группу экранов':'Создать группу экранов'}>
        <div className="screen-group-editor-header"><strong>{groupEditor.id?'Изменить группу':'Создать группу экранов'}</strong><button aria-label="Закрыть редактор группы" onClick={()=>setGroupEditor(null)}>×</button></div>
        <label className="group-name-label">Название группы<input autoFocus value={groupEditor.title} onChange={e=>setGroupEditor(v=>v?{...v,title:e.target.value}:v)} maxLength={100} aria-label="Название группы"/></label>
        <div className="screen-group-editor-list" role="group" aria-label="Выбрать экраны группы">
          {workspace.screens.map(s=>{
            const belonging=screenGroupFor.get(s.id)
            const disabled=Boolean(belonging&&belonging.id!==groupEditor.id)
            return <label key={s.id} className={'screen-group-checkbox '+(disabled?'unavailable':'')}>
              <input type="checkbox" checked={groupEditor.screenIds.includes(s.id)} disabled={disabled}
                onChange={e=>setGroupEditor(v=>v?{...v,screenIds:e.target.checked?[...v.screenIds,s.id]:v.screenIds.filter(x=>x!==s.id)}:v)}/>
              <span>{s.title}</span>{disabled&&<small>В другой группе</small>}
            </label>
          })}
        </div>
        <div className="screen-group-editor-actions"><button onClick={()=>setGroupEditor(null)}>Отмена</button><button className="primary-btn" disabled={!groupEditor.title.trim()||groupEditor.screenIds.length<2} onClick={saveGroup}>Сохранить группу ({groupEditor.screenIds.length})</button></div>
      </section>
    </div>}
    <main className="stage-scroll" ref={stage}><div className="workspace-board" ref={board} style={{width:boardWidth,height:boardHeight}}>
      {screen.panels.length===0&&<div className="empty-workspace"><span>▦</span><h2>Пустой экран</h2><p>Создайте окно и разместите содержимое.</p><button className="primary-btn" onClick={()=>createWindow()}>+ Создать первое окно</button></div>}
      {screen.panels.map(p=><WindowPanel key={p.id} panel={p} screenId={screen.id} workspace={workspace} profile={profile} ops={ops} inspect={inspect} selected={focused===p.id} hovered={hovered===p.id} focus={()=>setFocused(p.id)} runCommand={runCommand} savePanelTemplate={beginSavePanelTemplate} pick={picker} setPick={setPicker} startResize={startResize} fitArmed={fitArmed===p.id} toggleFit={()=>setFitArmed(id=>id===p.id?null:p.id)} startDrag={startDrag} isDragging={draggedId===p.id} previewRect={draggedId===p.id?previewRect:null}/>)}
    </div></main>
    {ghost?.fit&&<div className="drag-ghost fitting" style={{left:ghost.x+14,top:ghost.y+14}} aria-hidden="true"><strong>▣ Вписать при отпускании</strong><small>{ghost.w} × {ghost.h} px</small></div>}
    {notice&&<div className="drag-notice" role="status">{notice}<button onClick={()=>setNotice(null)} aria-label="Скрыть уведомление">×</button></div>}
    {mechanicsOpen&&<Suspense fallback={<aside className="mechanics-loading" role="status">Загружаются механики…</aside>}><MechanicsInspector runtime={mechanics} host={mechanicsHost.current} target={liveTarget} workspace={workspace} descriptors={profile.descriptors} onClose={()=>setMechanicsOpen(false)}/></Suspense>}
    <footer className="status-footer"><div>● {profile.title} · раскладка отдельно от содержимого · закрытие окна не удаляет данные</div><div>Workspace Shell · Content Profile: {profile.id}</div></footer>
  </div>
}
