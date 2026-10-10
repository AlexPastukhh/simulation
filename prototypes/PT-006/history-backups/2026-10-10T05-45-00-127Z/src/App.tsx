import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { CONTENT, INITIAL_WORKSPACE, activateContent, activateScreen, addContent, addPanel, addScreen, canAddContent, changeRect, countContent, currentScreen, getDescriptor, removeContent, removePanel, removeScreen, renameScreen, undersized, validateWorkspace, migrateLegacyWorkspace } from './workspace.ts'
import type { ContentKind, Panel, Rect, Workspace } from './workspace.ts'
import { SCHEMAS, initialData, initialDataB, nextId, validateDemo, migrateLegacyDemo, replaceContentState, matchesSchema } from './content.ts'
import type { Branch, DemoStore } from './content.ts'
import { DomainContent } from './DomainContent.tsx'
import { isExtraKind } from './AdditionalContent.tsx'
import { EXTRA_SOURCES } from './extraContent.ts'
import { useWindowDrag } from './windowDrag.ts'

type Mutate = (fn: (draft: DemoStore) => void) => void
type InspectMode = 'preview' | 'state' | 'schema'
type Inspector = { kind: ContentKind; mode: InspectMode } | null
const STORAGE_LAYOUT_A = 'pt006-simulator-layout-A-v3'
const STORAGE_LAYOUT_B = 'pt006-simulator-layout-B-v3'
const STORAGE_DATA_A = 'pt006-simulator-content-A-v4'
const STORAGE_DATA_B = 'pt006-simulator-content-B-v4'
const STORAGE_SETTINGS = 'pt006-workspace-settings-v1'
const DEFAULT_FIT_GAP = 4
function restoreFitGap(): number {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS)
    if (raw !== null) {
      const n = Number(raw)
      if (Number.isInteger(n) && n >= 0 && n <= 32) return n
    }
  } catch { /* use default */ }
  return DEFAULT_FIT_GAP
}
function restore<T>(key: string, legacyKey: string, initial: T, valid: (value: unknown) => value is T, migrate: (value: unknown) => T | null): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (valid(parsed)) return parsed
    }
    const legacy = localStorage.getItem(legacyKey)
    if (legacy) {
      const migrated = migrate(JSON.parse(legacy) as unknown)
      if (migrated && valid(migrated)) return migrated
    }
  } catch { /* reset invalid data */ }
  return structuredClone(initial)
}
const stringify = (v: unknown) => JSON.stringify(v, null, 2)
function JsonEdit({ value, onSave, readOnly = false }: { value: unknown; onSave?: (value: unknown) => boolean; readOnly?: boolean }) {
  const [draft, setDraft] = useState(() => stringify(value))
  const [error, setError] = useState('')
  useEffect(() => { setDraft(stringify(value)); setError('') }, [value])
  const save = () => { try { const parsed: unknown = JSON.parse(draft); const ok = onSave?.(parsed); setError(ok === false ? 'Значение не соответствует JSON Schema этого контента.' : '') } catch { setError('Некорректный JSON — исправьте синтаксис.') } }
  return <div className="json-edit"><textarea spellCheck={false} aria-label="JSON state" value={draft} onChange={e => setDraft(e.target.value)} readOnly={readOnly}/>{!readOnly && <button onClick={save} className="minor-btn">Применить JSON</button>}{error && <span className="form-error">{error}</span>}</div>
}
type PanelProps = {
  panel: Panel; screenId: string; workspace: Workspace; branch: Branch; data: DemoStore; allData: Record<Branch, DemoStore>; mutate: Mutate
  selected: boolean; hovered: boolean; focus: () => void
  modify: (fn: (w: Workspace) => Workspace) => void
  pick: string | null; setPick: (id: string | null) => void
  setInspector: (inspector: Inspector) => void
  startResize: (e: ReactPointerEvent<HTMLButtonElement>, panel: Panel) => void
  fitArmed: boolean
  toggleFit: () => void
  startDrag: (event: ReactPointerEvent<HTMLDivElement>, panel: Panel) => void
  previewRect: Rect | null
  isDragging: boolean
}
function WindowPanel({ panel, screenId, workspace, branch, data, allData, mutate, selected, hovered, focus, modify, pick, setPick, setInspector, startResize, fitArmed, toggleFit, startDrag, previewRect, isDragging }: PanelProps) {
  const [contentQuery, setContentQuery] = useState('')
  const active = panel.active
  const minimum = undersized(panel)
  const liveRect = previewRect ?? panel.rect
  const style: CSSProperties = { left: liveRect.x, top: liveRect.y, width: liveRect.w, height: liveRect.h, zIndex: isDragging ? 24 : selected ? 8 : hovered ? 7 : 2 }
  return <section className={'window-panel ' + (selected ? 'selected ' : '') + (hovered ? 'swap-target ' : '') + (fitArmed ? 'fit-armed ' : '') + (isDragging ? 'dragging-live ' : '')} style={style} onPointerDown={focus}>
    <header className="panel-header">
      <div className="drag-grip" role="button" tabIndex={0} title="Перетащить окно. Прокрутка доступна колёсиком или у края" onPointerDown={e => startDrag(e, panel)}>⠿ <span className="panel-id">{panel.id.toUpperCase()}</span></div>
      <div className="tab-strip">{panel.tabs.map(kind => <div className={'content-tab '+(active === kind ? 'active' : '')} key={kind} title={getDescriptor(kind).label}><button onClick={() => modify(w => activateContent(w, screenId, panel.id, kind))}><span style={{ color: getDescriptor(kind).accent }}>{getDescriptor(kind).icon}</span><span className="tab-label">{getDescriptor(kind).label}</span></button><button className="tab-x" title="Закрыть вкладку (состояние останется)" aria-label={'Убрать вкладку '+kind} onClick={() => modify(w => removeContent(w, screenId, panel.id, kind))}>×</button></div>)}</div>
      <button className={'panel-fit-button ' + (fitArmed ? 'active' : '')} title={fitArmed ? 'Режим вписывания включён: перетащите окно и отпустите. Повторное нажатие отменяет.' : 'Вписать окно в свободное место только при следующем переносе и отпускании'} aria-label="Вписать в свободное место при переносе" aria-pressed={fitArmed} onClick={toggleFit}>▣</button>
      <button className="panel-header-action" title="Добавить вкладку с содержимым" aria-label="Добавить содержимое" onClick={() => setPick(pick === panel.id ? null : panel.id)}>+</button>
      <button className="panel-header-action" title="Закрыть окно (данные останутся)" aria-label="Закрыть окно" onClick={() => modify(w => removePanel(w, screenId, panel.id))}>×</button>
    </header>
    <div className="panel-body">
      {active ? <DomainContent key={active} kind={active} branch={branch} data={data} allData={allData} mutate={mutate}/> : <div className="empty-panel"><span className="empty-glyph">▧</span><b>Пустое окно</b><p>Разместите один из доступных типов контента</p><button className="primary-btn" onClick={() => setPick(panel.id)}>+ Добавить содержимое</button></div>}
      {minimum && <div className="size-warning" role="status">⚠ Для {panel.active ? getDescriptor(panel.active).label : 'содержимого'} рекомендуется от {minimum.width} × {minimum.height} px. Текущий размер {panel.rect.w} × {panel.rect.h} px.</div>}
      {active && <div className="edge-actions"><button title="Предпросмотр" aria-label="Предпросмотр" onClick={() => setInspector({ kind: active, mode: 'preview' })}>◉</button><button title="Фактический State" aria-label="Фактический State" onClick={() => setInspector({ kind: active, mode: 'state' })}>{'{}'}</button><button title="JSON Schema" aria-label="JSON Schema" onClick={() => setInspector({ kind: active, mode: 'schema' })}>▤</button></div>}
    </div>
    {pick === panel.id && <div className="quick-picker"><div className="picker-top"><b>Добавить содержимое</b><button onClick={() => setPick(null)} aria-label="Закрыть выбор">×</button></div><input className="content-picker-search" aria-label="Поиск вида контента" placeholder="Поиск по названию..." value={contentQuery} onChange={e => setContentQuery(e.target.value)} />{CONTENT.filter(d => (d.label+' '+d.caption).toLocaleLowerCase().includes(contentQuery.trim().toLocaleLowerCase())).map(d => { const used = countContent(workspace, screenId, d.id); const here = panel.tabs.includes(d.id); const allowed = !here && canAddContent(workspace, screenId, d.id); return <button className="pick-option" key={d.id} disabled={!allowed} onClick={() => { modify(w => addContent(w, screenId, panel.id, d.id)); setPick(null) }}><span style={{ color: d.accent }}>{d.icon}</span><span>{d.label}<small>{here ? 'Уже есть в этом окне' : !allowed ? 'Занято на экране · ' + used + '/1' : d.minWidth+' × '+d.minHeight+' px'}</small></span>{allowed ? <span>+</span> : <span>—</span>}</button> })}</div>}
    <button className="resize-handle" title="Изменить размер (ниже рекомендуемого минимума допускается)" aria-label="Изменить размер окна" onPointerDown={e => startResize(e, panel)}>◢</button>
  </section>
}
function ProjectionReferences({ kind, mode, branch, data, allData, onJump }: {
  kind: ContentKind; mode: 'state' | 'schema'; branch: Branch; data: DemoStore
  allData: Record<Branch, DemoStore>; onJump: (kind: ContentKind) => void
}) {
  if (!isExtraKind(kind)) return null
  return <div className="projection-sources">
    <h4>Исходные модели этого представления</h4>
    <p className="inspector-note">Собственный State окна выше хранит параметры просмотра. Показанные объекты читаются из моделей ниже — без дублирования данных. Их возможные структуры находятся в JSON Schema источников.</p>
    {EXTRA_SOURCES[kind].map(source => <details key={source}>
      <summary>{getDescriptor(source).label} · {mode === 'schema' ? 'JSON Schema' : 'State'}</summary>
      <button className="minor-btn" onClick={() => onJump(source)}>Открыть {getDescriptor(source).label}</button>
      <pre className="state-pre">{stringify(mode === 'schema' ? SCHEMAS[source] : data[source])}</pre>
      {kind === 'comparison' && mode === 'state' && <details><summary>Другая ветка · Architecture {branch === 'A' ? 'B' : 'A'}</summary><pre className="state-pre">{stringify(allData[branch === 'A' ? 'B' : 'A'][source])}</pre></details>}
    </details>)}
  </div>
}
export default function App() {
  const [branch, setBranch] = useState<Branch>('A')
  const [workspaces, setWorkspaces] = useState<Record<Branch, Workspace>>(() => ({
    A: restore(STORAGE_LAYOUT_A, 'pt006-workspace-v2', INITIAL_WORKSPACE, validateWorkspace, migrateLegacyWorkspace),
    B: restore(STORAGE_LAYOUT_B, '', INITIAL_WORKSPACE, validateWorkspace, migrateLegacyWorkspace),
  }))
  const [branchData, setBranchData] = useState<Record<Branch, DemoStore>>(() => ({
    A: restore(STORAGE_DATA_A, 'pt006-simulator-content-A-v3', initialData, validateDemo, value => migrateLegacyDemo(value, initialData)),
    B: restore(STORAGE_DATA_B, 'pt006-simulator-content-B-v3', initialDataB, validateDemo, value => migrateLegacyDemo(value, initialDataB)),
  }))
  const workspace = workspaces[branch]
  const data = branchData[branch]
  const setWorkspace = (fn: (previous: Workspace) => Workspace) =>
    setWorkspaces(prev => ({ ...prev, [branch]: fn(prev[branch]) }))
  const setData = (fn: (previous: DemoStore) => DemoStore) =>
    setBranchData(prev => ({ ...prev, [branch]: fn(prev[branch]) }))
  const [picker, setPicker] = useState<string | null>(null)
  const [inspector, setInspector] = useState<Inspector>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [rename, setRename] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [fitArmed, setFitArmed] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fitGap, setFitGap] = useState(restoreFitGap)
  const board = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLElement>(null)
  useEffect(() => { localStorage.setItem(STORAGE_LAYOUT_A, stringify(workspaces.A)); localStorage.setItem(STORAGE_LAYOUT_B, stringify(workspaces.B)) }, [workspaces])
  useEffect(() => { localStorage.setItem(STORAGE_DATA_A, stringify(branchData.A)); localStorage.setItem(STORAGE_DATA_B, stringify(branchData.B)) }, [branchData])
  useEffect(() => { localStorage.setItem(STORAGE_SETTINGS, String(fitGap)) }, [fitGap])
  const mutate: Mutate = fn => setData(prev => { const next = structuredClone(prev); fn(next); return next })
  const modify = (fn: (w: Workspace) => Workspace) => setWorkspace(prev => fn(prev))
  const screen = currentScreen(workspace)
  const { startDrag, hovered, ghost, notice, setNotice, draggedId, previewRect } = useWindowDrag({
    screen, workspace, board, stage, armedPanelId: fitArmed, fitGap,
    onFitted: () => setFitArmed(null), update: modify,
  })
  const addNewPanel = (kind?: ContentKind) => {
    const id = nextId('w'), sid = screen.id
    setWorkspace(prev => {
      const created = addPanel(prev, sid, id)
      return kind ? addContent(created, sid, id, kind) : created
    })
    setFocused(id); setPicker(kind ? null : id); setInspector(null)
  }
  const startResize = (e: ReactPointerEvent<HTMLButtonElement>, panel: Panel) => {
    e.preventDefault(); e.stopPropagation()
    const original: Rect = { ...panel.rect }
    const x = e.clientX, y = e.clientY, id = panel.id, sid = screen.id
    const move = (evt: PointerEvent) => modify(w => changeRect(w, sid, id, { ...original, w: original.w + evt.clientX - x, h: original.h + evt.clientY - y }))
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop)
  }

  const reset = () => { if (window.confirm('Сбросить демонстрационный Workspace и тестовые данные?')) { setWorkspace(() => structuredClone(INITIAL_WORKSPACE)); setData(() => structuredClone(branch === 'A' ? initialData : initialDataB)); setPicker(null); setInspector(null); setFitArmed(null); setNotice(null) } }
  const selectScreen = (id: string) => { modify(w => activateScreen(w, id)); setFocused(null); setPicker(null); setFitArmed(null); setRename(false) }
  const modeLabels: { id: InspectMode; label: string }[] = [
    { id: 'preview', label: 'Предпросмотр' },
    { id: 'state', label: 'Фактический State' },
    { id: 'schema', label: 'JSON Schema' },
  ]
  const boardWidth = Math.max(1265, ...screen.panels.map(p => p.rect.x + p.rect.w + 45)) + (ghost ? 1800 : 0)
  const boardHeight = Math.max(650, ...screen.panels.map(p => p.rect.y + p.rect.h + 48)) + (ghost ? 1800 : 0)
  return <div className="app-shell">
    <header className="top-header"><div className="brand"><div className="brand-symbol">▦</div><div><strong>Architecture Simulator</strong><small>PT-006 · scripted content fixture</small></div></div>
      <div className="branch-switch" role="group" aria-label="Выбор архитектуры">{(['A','B'] as const).map(id => <button key={id} className={branch === id ? 'branch-active' : ''} onClick={() => { setBranch(id); setPicker(null); setFocused(null); setInspector(null); setFitArmed(null) }}>Architecture {id}</button>)}</div>
      <nav className="screen-tabs" aria-label="Экраны">{workspace.screens.map(s => <div className="screen-tab-wrap" key={s.id}><button className={s.id === screen.id ? 'screen-tab current' : 'screen-tab'} onClick={() => selectScreen(s.id)}>{s.title}</button>{workspace.screens.length > 1 && <button title={'Закрыть экран '+s.title} aria-label={'Закрыть экран '+s.title} className="screen-close" onClick={() => { modify(w => removeScreen(w, s.id)); setPicker(null); setFocused(null) }}>×</button>}</div>)}<button className="new-screen" onClick={() => { modify(w => addScreen(w, nextId('screen'))); setPicker(null); setFocused(null) }} title="Новый экран">+ Экран</button></nav>
      <div className="header-actions"><button className="header-btn" onClick={() => addNewPanel()}>+ Окно</button><button className="header-btn highlighted" onClick={() => setInspector({ kind: 'requirements', mode: 'schema' })}>▦ Каталог / инспектор</button><button className="header-btn settings-trigger" aria-expanded={settingsOpen} aria-controls="workspace-settings" onClick={() => setSettingsOpen(value => !value)}><span className="settings-gear" aria-hidden="true">⚙</span><span className="settings-label"> Настройки</span></button><button className="header-btn subdued" onClick={reset} title="Сбросить демо">↺</button></div>
      {settingsOpen && <section className="settings-popover" id="workspace-settings" role="dialog" aria-label="Настройки рабочего пространства">
        <div className="settings-popover-header"><strong>⚙ Настройки Workspace</strong><button className="settings-close" aria-label="Закрыть настройки" onClick={() => setSettingsOpen(false)}>×</button></div>
        <label className="settings-field-label" htmlFor="fit-gap-range">Отступ при вписывании</label>
        <p>Расстояние между вписанным окном и краями соседних окон. 0 px — вплотную. Применяется при отпускании после ▣.</p>
        <div className="settings-input-row"><input id="fit-gap-range" aria-label="Отступ при вписывании" type="range" min="0" max="32" step="1" value={fitGap} onChange={e => setFitGap(Number(e.target.value))}/><input className="settings-number" type="number" aria-label="Отступ в пикселях" min="0" max="32" step="1" value={fitGap} onChange={e => setFitGap(Math.max(0, Math.min(32, Math.round(Number(e.target.value)))))}/><span>px</span></div>
        <div className="settings-footer"><span>0–32 px · сохраняется в браузере</span><button onClick={() => setFitGap(DEFAULT_FIT_GAP)}>Сбросить: 4 px</button></div>
      </section>}
    </header>
    <div className="context-bar"><div className="context-title"><span className="eyebrow">АКТИВНЫЙ ЭКРАН</span>{rename ? <form onSubmit={e => { e.preventDefault(); modify(w => renameScreen(w, screen.id, renameValue)); setRename(false) }}><input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => setRename(false)} /></form> : <button className="rename-screen" onClick={() => { setRename(true); setRenameValue(screen.title) }}>{screen.title} <span>✎</span></button>}<span className="context-count">{screen.panels.length} окон · {screen.panels.reduce((n, p) => n + p.tabs.length, 0)} вкладок</span></div><div className="context-hint"><span className="status-dot"/>Тяни ⠿ — само окно следует за курсором; на другом окне — обмен. ▣ — вписать при отпускании. ⚙ — отступ. Колёсико / край — прокрутка.</div></div>
    <main className="stage-scroll" ref={stage}><div className="workspace-board" ref={board} style={{ width: boardWidth, height: boardHeight }}>
      {screen.panels.length === 0 && <div className="empty-workspace"><span>▦</span><h2>Пустой экран</h2><p>Создай окно, наполни его тестовым содержимым, затем настрой расположение.</p><button className="primary-btn" onClick={() => addNewPanel()}>+ Создать первое окно</button></div>}
      {screen.panels.map(p => <WindowPanel key={p.id} panel={p} screenId={screen.id} workspace={workspace} branch={branch} data={data} allData={branchData} mutate={mutate} selected={focused === p.id} hovered={hovered === p.id} focus={() => setFocused(p.id)} modify={modify} pick={picker} setPick={setPicker} setInspector={setInspector} startResize={startResize} fitArmed={fitArmed === p.id} toggleFit={() => setFitArmed(old => old === p.id ? null : p.id)} startDrag={startDrag} isDragging={draggedId === p.id} previewRect={draggedId === p.id ? previewRect : null}/>)}
    </div></main>
    {ghost?.fit && <div className={'drag-ghost ' + (ghost.fit ? 'fitting' : '')} style={{ left: ghost.x + 14, top: ghost.y + 14 }} aria-hidden="true"><strong>{ghost.fit ? '▣ Вписать при отпускании' : '⠿ Перенос / обмен'}</strong><small>{ghost.w} × {ghost.h} px · колёсико или край поля = прокрутка</small></div>}
    {notice && <div className="drag-notice" role="status">{notice}<button onClick={() => setNotice(null)} aria-label="Скрыть уведомление">×</button></div>}
    <footer className="status-footer"><div>● Architecture {branch} · раскладка отдельно от State · закрытие окна не удаляет данные</div><div>Plan / Actual Events / Requirement Model — один экземпляр на экран · здесь только подготовленный сценарий</div></footer>
    {inspector && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setInspector(null) }}><section className="catalog-dialog" role="dialog" aria-modal="true" aria-label="Каталог содержимого и его состояния">
      <header className="catalog-header"><div><span className="eyebrow">ГЛОБАЛЬНЫЙ КАТАЛОГ</span><h2>Содержимое симулятора · демонстрационные состояния</h2><p>Независимо от окон. Предпросмотр не меняет компоновку.</p></div><button className="close-modal" onClick={() => setInspector(null)} aria-label="Закрыть каталог">×</button></header>
      <div className="catalog-main"><aside className="catalog-list">{CONTENT.map(d => <button key={d.id} className={'catalog-entry ' + (inspector.kind === d.id ? 'chosen' : '')} onClick={() => setInspector({ ...inspector, kind: d.id })}><span className="catalog-icon" style={{ color: d.accent }}>{d.icon}</span><span><b>{d.label}</b><small>{d.caption}</small></span></button>)}</aside>
      <div className="catalog-details"><div className="catalog-title"><div><h3>{getDescriptor(inspector.kind).label}</h3><p>Рекомендуемый минимум {getDescriptor(inspector.kind).minWidth} × {getDescriptor(inspector.kind).minHeight} px · {getDescriptor(inspector.kind).maxPerScreen === null ? 'несколько экземпляров' : '1 экземпляр на экран'}</p></div><span className="persisted-label">● Данные не зависят от окон</span></div>
      <div className="inspector-tabs">{modeLabels.map(t => <button className={inspector.mode === t.id ? 'active' : ''} key={t.id} onClick={() => setInspector({ ...inspector, mode: t.id })}>{t.label}</button>)}</div>
      <div className="inspector-content">
        {inspector.mode === 'preview' && <DomainContent kind={inspector.kind} branch={branch} data={data} allData={branchData} mutate={mutate} preview/>}
        {inspector.mode === 'state' && <div className="state-editor"><p className="inspector-note">Это реальный тестовый State, отдельный от схемы. Можно менять напрямую; результат проверяется по схеме.</p><JsonEdit value={data[inspector.kind]} onSave={value => { if (!matchesSchema(value, SCHEMAS[inspector.kind])) return false; setData(prev => replaceContentState(prev, inspector.kind, value) ?? prev); return true }} /></div>}
        {inspector.mode === 'schema' && <div><p className="inspector-note">JSON Schema — допустимая форма данных, <strong>не список существующих экземпляров</strong>.</p><pre className="state-pre">{stringify(SCHEMAS[inspector.kind])}</pre></div>}
        {inspector.mode !== 'preview' && <ProjectionReferences kind={inspector.kind} mode={inspector.mode} branch={branch} data={data} allData={branchData} onJump={kind => setInspector({ kind, mode: inspector.mode })}/>}
        </div>
      <div className="catalog-actions"><span>Открыто на этом экране: {countContent(workspace, screen.id, inspector.kind)}</span>{!canAddContent(workspace, screen.id, inspector.kind) ? <button className="minor-btn" onClick={() => { const panel = screen.panels.find(p => p.tabs.includes(inspector.kind)); if (panel) { setFocused(panel.id); setInspector(null) } }}>Перейти к существующему окну</button> : <button className="primary-btn" onClick={() => addNewPanel(inspector.kind)}>+ Открыть в новом окне</button>}</div>
      </div></div>
    </section></div>}
  </div>
}