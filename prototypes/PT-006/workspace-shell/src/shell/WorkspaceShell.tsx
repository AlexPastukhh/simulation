import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { createWorkspaceModel } from './workspace.ts'
import type { Panel, Rect, Workspace, ContentDescriptor } from './workspace.ts'
import type { WorkspaceEvent, WorkspaceProfile } from './contracts.ts'
import { useWindowDrag } from './windowDrag.ts'

const SETTINGS_KEY = 'pt006-workspace-settings-v1'
const VIEW_KEY = 'workspace-shell-view-mode-v1'
const DEFAULT_FIT_GAP = 4
function restoreGap() {
  try { const raw=localStorage.getItem(SETTINGS_KEY); if (raw !== null) { const value = Number(raw); if (Number.isInteger(value) && value >= 0 && value <= 32) return value } } catch { /* default */ }
  return DEFAULT_FIT_GAP
}
function restoreLayout(profile: WorkspaceProfile, context: string, valid: (raw: unknown) => raw is Workspace): Workspace {
  try {
    const raw = localStorage.getItem(profile.layoutKey(context))
    if (raw) { const parsed: unknown = JSON.parse(raw); if (valid(parsed)) return parsed as Workspace }
    const legacy = profile.legacyLayoutKey(context)
    if (legacy) { const saved = localStorage.getItem(legacy); if (saved) { const migrated = profile.migrateLayout(JSON.parse(saved)); if (migrated && valid(migrated)) return migrated } }
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
  selected: boolean; hovered: boolean; focus: () => void; dispatch: (event: WorkspaceEvent) => void
  modify: (fn: (w: Workspace) => Workspace) => void
  pick: string | null; setPick: (id: string | null) => void
  startResize: (event: ReactPointerEvent<HTMLButtonElement>, panel: Panel) => void
  fitArmed: boolean; toggleFit: () => void
  startDrag: (event: ReactPointerEvent<HTMLDivElement>, panel: Panel) => void
  previewRect: Rect | null; isDragging: boolean; flash: number
}
function WindowPanel({ panel, screenId, workspace, profile, ops, selected, hovered, focus, dispatch, modify, pick, setPick, startResize, fitArmed, toggleFit, startDrag, previewRect, isDragging, flash }: PanelProps) {
  const [contentQuery, setContentQuery] = useState('')
  const active = panel.active
  const minimum = ops.undersized(panel)
  const rect = previewRect ?? panel.rect
  const style: CSSProperties = {left:rect.x,top:rect.y,width:rect.w,height:rect.h,zIndex:isDragging?24:selected?8:hovered?7:2}
  return <section className={'window-panel '+(selected?'selected ':'')+(hovered?'swap-target ':'')+(fitArmed?'fit-armed ':'')+(isDragging?'dragging-live ':'')} style={style} onPointerDown={focus} data-panel-id={panel.id}>
    {flash > 0 && <div className="window-focus-flash" key={flash} aria-hidden="true"/>}
    <header className="panel-header">
      <div className="drag-grip" role="button" tabIndex={0} title="Перетащить окно. Прокрутка доступна колёсиком или у края" onPointerDown={e=>startDrag(e,panel)}>⠿ <span className="panel-id">{panel.id.toUpperCase()}</span></div>
      <TabStrip panel={panel} descriptors={profile.descriptors} onSelect={id=>modify(w=>ops.activateContent(w,screenId,panel.id,id))} onClose={id=>modify(w=>ops.removeContent(w,screenId,panel.id,id))}/>
      <button className={'panel-fit-button '+(fitArmed?'active':'')} title={fitArmed?'Вписывание включено':'Вписать окно в свободное место при следующем переносе'} aria-label="Вписать в свободное место при переносе" aria-pressed={fitArmed} onClick={toggleFit}>▣</button>
      <button className="panel-header-action" title="Добавить вкладку с содержимым" aria-label="Добавить содержимое" onClick={()=>setPick(pick===panel.id?null:panel.id)}>+</button>
      <button className="panel-header-action" title="Закрыть окно (данные останутся)" aria-label="Закрыть окно" onClick={()=>modify(w=>ops.removePanel(w,screenId,panel.id))}>×</button>
    </header>
    <div className="panel-body">
      {active ? profile.renderContent(active,dispatch) : <div className="empty-panel"><span className="empty-glyph">▧</span><b>Пустое окно</b><p>Разместите один из доступных типов контента</p><button className="primary-btn" onClick={()=>setPick(panel.id)}>+ Добавить содержимое</button></div>}
      {minimum && <div className="size-warning" role="status">⚠ Для {active?ops.getDescriptor(active).label:'содержимого'} рекомендуется от {minimum.width} × {minimum.height} px. Текущий размер {panel.rect.w} × {panel.rect.h} px.</div>}
      {active && profile.renderPanelTools(active)}
    </div>
    {pick===panel.id && <div className="quick-picker"><div className="picker-top"><b>Добавить содержимое</b><button onClick={()=>setPick(null)} aria-label="Закрыть выбор">×</button></div>
      <input className="content-picker-search" aria-label="Поиск вида контента" placeholder="Поиск по названию..." value={contentQuery} onChange={e=>setContentQuery(e.target.value)}/>
      {profile.descriptors.filter(d=>(d.label+' '+d.caption).toLocaleLowerCase().includes(contentQuery.trim().toLocaleLowerCase())).map(d=>{
        const used=ops.countContent(workspace,screenId,d.id), here=panel.tabs.includes(d.id), allowed=!here&&ops.canAddContent(workspace,screenId,d.id)
        return <button className="pick-option" key={d.id} disabled={!allowed} onClick={()=>{modify(w=>ops.addContent(w,screenId,panel.id,d.id));setPick(null)}}><span style={{color:d.accent}}>{d.icon}</span><span>{d.label}<small>{here?'Уже есть в этом окне':!allowed?'Занято на экране · '+used+'/1':d.minWidth+' × '+d.minHeight+' px'}</small></span>{allowed?<span>+</span>:<span>—</span>}</button>
      })}
    </div>}
    <button className="resize-handle" title="Изменить размер" aria-label="Изменить размер окна" onPointerDown={e=>startResize(e,panel)}>◢</button>
  </section>
}
export function WorkspaceShell({profile}: {profile: WorkspaceProfile}) {
  const ops=createWorkspaceModel(profile.descriptors)
  const [layouts,setLayouts]=useState<Record<string,Workspace>>(() => Object.fromEntries(profile.contexts.map(ctx => [ctx,restoreLayout(profile,ctx,ops.validateWorkspace)])))
  const workspace=layouts[profile.contextId] ?? profile.initialWorkspace
  const screen=ops.currentScreen(workspace)
  const [picker,setPicker]=useState<string|null>(null)
  const [focused,setFocused]=useState<string|null>(null)
  const [rename,setRename]=useState(false)
  const [renameValue,setRenameValue]=useState('')
  const [fitArmed,setFitArmed]=useState<string|null>(null)
  const [settingsOpen,setSettingsOpen]=useState(false)
  const [fitGap,setFitGap]=useState(restoreGap)
  const [viewMode,setViewMode]=useState(()=>{try{return localStorage.getItem(VIEW_KEY)==='1'}catch{return false}})
  const [flashes,setFlashes]=useState<Record<string,number>>({})
  const [focusRequest,setFocusRequest]=useState<{screenId:string;panelId:string;seq:number}|null>(null)
  const seq=useRef(0)
  const board=useRef<HTMLDivElement>(null), stage=useRef<HTMLElement>(null)
  const scrollZone=useRef<HTMLDivElement>(null)
  const [stageHeight,setStageHeight]=useState(0)
  useLayoutEffect(()=>{
    const viewport=stage.current
    if(!viewport) return
    const refresh=()=>setStageHeight(viewport.clientHeight)
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
      event.preventDefault()
      event.stopPropagation()
      const viewport=stage.current
      if(!viewport) return
      const scale=event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1
      viewport.scrollBy({top:event.deltaY*scale,left:event.deltaX*scale,behavior:'instant'})
    }
    zone.addEventListener('wheel',wheel,{passive:false})
    return ()=>zone.removeEventListener('wheel',wheel)
  },[])
  const modify=(fn:(w:Workspace)=>Workspace)=>setLayouts(prev=>({...prev,[profile.contextId]:fn(prev[profile.contextId] ?? profile.initialWorkspace)}))
  useEffect(()=>{for(const [context,layout] of Object.entries(layouts))localStorage.setItem(profile.layoutKey(context),JSON.stringify(layout,null,2))},[layouts,profile.id])
  useEffect(()=>{localStorage.setItem(SETTINGS_KEY,String(fitGap))},[fitGap])
  useEffect(()=>{localStorage.setItem(VIEW_KEY,viewMode?'1':'0')},[viewMode])
  useEffect(()=>{setFocused(null);setPicker(null);setFitArmed(null);setRename(false);profile.onContextChanged?.()},[profile.contextId])
  const {startDrag,hovered,ghost,notice,setNotice,draggedId,previewRect}=useWindowDrag({
    screen,workspace,board,stage,armedPanelId:fitArmed,fitGap,onFitted:()=>setFitArmed(null),update:modify,
  })
  const createWindow=(kind?:string)=>{
    const id=nextWindowId(),sid=screen.id
    modify(w=>{const created=ops.addPanel(w,sid,id);return kind ? ops.addContent(created,sid,id,kind):created})
    setFocused(id);setPicker(kind?null:id)
  }
  const showWindow=(screenId:string,panelId:string)=>{
    setFocused(panelId)
    const value=++seq.current
    setFlashes(prev=>({...prev,[panelId]:value}))
    setFocusRequest({screenId,panelId,seq:value})
    setPicker(null)
  }
  const dispatch=(event:WorkspaceEvent)=>{
    if(event.type!=='open-content') return
    if(event.target.profileId!==profile.id) {setNotice('Профиль недоступен: '+event.target.profileId);return}
    const resolved=ops.openContent(workspace,event.target.instanceId,nextWindowId())
    if(!resolved) {setNotice('Содержимое недоступно: '+event.target.instanceId);return}
    modify(()=>resolved.workspace)
    showWindow(resolved.screenId,resolved.panelId)
  }
  useLayoutEffect(()=>{
    if(!focusRequest||focusRequest.screenId!==screen.id) return
    const panel=screen.panels.find(p=>p.id===focusRequest.panelId),viewport=stage.current
    if(!panel||!viewport) return
    const left=Math.max(0,panel.rect.x-24),top=Math.max(0,panel.rect.y-24)
    const right=panel.rect.x+panel.rect.w+24,bottom=panel.rect.y+panel.rect.h+24
    let x=viewport.scrollLeft,y=viewport.scrollTop
    if(left<x)x=left
    else if(right>x+viewport.clientWidth)x=Math.max(0,right-viewport.clientWidth)
    if(top<y)y=top
    else if(bottom>y+viewport.clientHeight)y=Math.max(0,bottom-viewport.clientHeight)
    viewport.scrollTo({left:x,top:y,behavior:'instant'})
  },[focusRequest,workspace.activeScreenId,profile.contextId])
  const startResize=(e:ReactPointerEvent<HTMLButtonElement>,panel:Panel)=>{
    e.preventDefault();e.stopPropagation()
    const original:Rect={...panel.rect},x=e.clientX,y=e.clientY,id=panel.id,sid=screen.id
    const move=(evt:PointerEvent)=>modify(w=>ops.changeRect(w,sid,id,{...original,w:original.w+evt.clientX-x,h:original.h+evt.clientY-y}))
    const stop=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);window.removeEventListener('pointercancel',stop)}
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',stop);window.addEventListener('pointercancel',stop)
  }
  const reset=()=>{if(window.confirm('Сбросить Workspace и данные текущего профиля?')){modify(()=>structuredClone(profile.initialWorkspace));profile.resetContent();setPicker(null);setFitArmed(null);setNotice(null)}}
  const selectScreen=(id:string)=>{modify(w=>ops.activateScreen(w,id));setFocused(null);setPicker(null);setFitArmed(null);setRename(false)}
  const boardWidth=Math.max(1265,...screen.panels.map(p=>p.rect.x+p.rect.w+45))+(ghost?1800:0)
  // Keep a small panning runway even when every panel initially fits.
  const boardHeight=Math.max(650,stageHeight+300,...screen.panels.map(p=>p.rect.y+p.rect.h+48))+(ghost?1800:0)
  return <div className={'app-shell '+(viewMode?'view-mode':'')}>
    <header className="top-header">
      <div className="brand"><div className="brand-symbol">▦</div><div><strong>{profile.title}</strong><small>{profile.subtitle}</small></div></div>
      {profile.renderHeader()}
      <nav className="screen-tabs" aria-label="Экраны">
        {workspace.screens.map(s=><div className="screen-tab-wrap" key={s.id}><button className={s.id===screen.id?'screen-tab current':'screen-tab'} onClick={()=>selectScreen(s.id)}>{s.title}</button>{workspace.screens.length>1&&<button title={'Закрыть экран '+s.title} aria-label={'Закрыть экран '+s.title} className="screen-close" onClick={()=>{modify(w=>ops.removeScreen(w,s.id));setPicker(null);setFocused(null)}}>×</button>}</div>)}
        <button className="new-screen" onClick={()=>{modify(w=>ops.addScreen(w,'screen-'+crypto.randomUUID()));setPicker(null)}} title="Новый экран">+ Экран</button>
      </nav>
      <div className="header-actions">
        <button className="header-btn" onClick={()=>createWindow()}>+ Окно</button>
        <button className="header-btn highlighted" onClick={()=>profile.openInspector(profile.descriptors[0]?.id??'','schema')}>▦ Каталог / инспектор</button>
        <button className={'header-btn '+(viewMode?'highlighted':'')} aria-pressed={viewMode} onClick={()=>{setViewMode(v=>!v);setPicker(null);setFitArmed(null)}}>{viewMode?'Обычный режим':'Просмотр'}</button>
        <button className="header-btn settings-trigger" aria-expanded={settingsOpen} aria-controls="workspace-settings" onClick={()=>setSettingsOpen(v=>!v)}><span className="settings-gear" aria-hidden="true">⚙</span><span className="settings-label"> Настройки</span></button>
        <button className="header-btn subdued" onClick={reset} title="Сбросить демо">↺</button>
      </div>
      {settingsOpen&&<section className="settings-popover" id="workspace-settings" role="dialog" aria-label="Настройки рабочего пространства">
        <div className="settings-popover-header"><strong>⚙ Настройки Workspace</strong><button className="settings-close" aria-label="Закрыть настройки" onClick={()=>setSettingsOpen(false)}>×</button></div>
        <label className="settings-field-label" htmlFor="fit-gap-range">Отступ при вписывании</label>
        <p>Расстояние между вписанным окном и краями соседних окон. 0 px — вплотную.</p>
        <div className="settings-input-row"><input id="fit-gap-range" aria-label="Отступ при вписывании" type="range" min="0" max="32" step="1" value={fitGap} onChange={e=>setFitGap(Number(e.target.value))}/><input className="settings-number" type="number" aria-label="Отступ в пикселях" min="0" max="32" step="1" value={fitGap} onChange={e=>setFitGap(Math.max(0,Math.min(32,Math.round(Number(e.target.value)))))}/><span>px</span></div>
        <div className="settings-footer"><span>0–32 px · сохраняется в браузере</span><button onClick={()=>setFitGap(DEFAULT_FIT_GAP)}>Сбросить: 4 px</button></div>
      </section>}
    </header>
    <div className="context-bar" ref={scrollZone} title="Колёсико над этой панелью прокручивает рабочее поле"><div className="context-title"><span className="eyebrow">АКТИВНЫЙ ЭКРАН</span>{rename?<form onSubmit={e=>{e.preventDefault();modify(w=>ops.renameScreen(w,screen.id,renameValue));setRename(false)}}><input autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)} onBlur={()=>setRename(false)}/></form>:<button className="rename-screen" onClick={()=>{setRename(true);setRenameValue(screen.title)}}>{screen.title} <span>✎</span></button>}<span className="context-count">{screen.panels.length} окон · {screen.panels.reduce((n,p)=>n+p.tabs.length,0)} вкладок</span></div><div className="context-hint"><span className="status-dot"/>Тяни ⠿ — перенос и обмен. ▣ — вписать. Колёсико над вкладками — горизонтальная прокрутка.</div>
      <div className="workspace-scroll-zone" title="Колёсико над всей панелью прокручивает рабочее поле" aria-label="Зона прокрутки рабочего поля колесом"><span aria-hidden="true">↕</span> Прокрутка рабочего поля — колёсико на всей панели</div>
    </div>
    {profile.renderFactualTime()}
    <main className="stage-scroll" ref={stage}><div className="workspace-board" ref={board} style={{width:boardWidth,height:boardHeight}}>
      {screen.panels.length===0&&<div className="empty-workspace"><span>▦</span><h2>Пустой экран</h2><p>Создайте окно и разместите содержимое.</p><button className="primary-btn" onClick={()=>createWindow()}>+ Создать первое окно</button></div>}
      {screen.panels.map(p=><WindowPanel key={p.id} panel={p} screenId={screen.id} workspace={workspace} profile={profile} ops={ops} selected={focused===p.id} hovered={hovered===p.id} focus={()=>setFocused(p.id)} dispatch={dispatch} modify={modify} pick={picker} setPick={setPicker} startResize={startResize} fitArmed={fitArmed===p.id} toggleFit={()=>setFitArmed(id=>id===p.id?null:p.id)} startDrag={startDrag} isDragging={draggedId===p.id} previewRect={draggedId===p.id?previewRect:null} flash={flashes[p.id]??0}/>)}
    </div></main>
    {ghost?.fit&&<div className="drag-ghost fitting" style={{left:ghost.x+14,top:ghost.y+14}} aria-hidden="true"><strong>▣ Вписать при отпускании</strong><small>{ghost.w} × {ghost.h} px</small></div>}
    {notice&&<div className="drag-notice" role="status">{notice}<button onClick={()=>setNotice(null)} aria-label="Скрыть уведомление">×</button></div>}
    <footer className="status-footer"><div>● {profile.title} · раскладка отдельно от содержимого · закрытие окна не удаляет данные</div><div>Workspace Shell · Content Profile: {profile.id}</div></footer>
    {profile.renderInspector({
      countOnScreen:id=>ops.countContent(workspace,screen.id,id),
      canAddOnScreen:id=>ops.canAddContent(workspace,screen.id,id),
      createWindow,
      openContent:id=>dispatch({type:'open-content',target:{profileId:profile.id,instanceId:id}}),
    })}
  </div>
}
