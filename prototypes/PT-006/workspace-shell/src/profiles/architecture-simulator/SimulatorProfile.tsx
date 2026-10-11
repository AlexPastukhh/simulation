import { useEffect, useRef, useState } from 'react'
import { CONTENT, INITIAL_WORKSPACE, SCREEN_TEMPLATES, getDescriptor, migrateLegacyWorkspace } from './workspace.ts'
import { scopedContentId, parseScopedContentId, scopeDescriptors, bindContextScreens, bindLegacyLayout, combineContextLayouts, instantiateContext } from '../../shell/contexts.ts'
import type { ContextTemplate, ResourceRef } from '../../shell/contexts.ts'
import { createWorkspaceModel } from '../../shell/workspace.ts'
import type { Workspace } from '../../shell/workspace.ts'
import type { ContentKind } from './workspace.ts'
import { SCHEMAS, initialData, initialDataB, validateDemo, migrateLegacyDemo, replaceContentState } from './content.ts'
import type { Branch, DemoStore } from './content.ts'
import { DomainContent } from './DomainContent.tsx'
import { isExtraKind } from './AdditionalContent.tsx'
import { EXTRA_SOURCES } from './extraContent.ts'
import { atCursor } from './history.ts'
import { StateHistory } from './HistoryContent.tsx'
import { referenceWarnings } from './references.ts'
import type { WorkspaceProfile, WorkspaceEvent, InspectorMode, InspectorActions } from '../../shell/contracts.ts'
import { createComparisonScope, validateComparisonScope, comparisonDescriptor, comparisonScreens, parseScopeContentId } from './scope-mechanisms/comparison.ts'
import type { ComparisonScope, ComparisonFocus } from './scope-mechanisms/comparison.ts'
import { ComparisonScopeView } from './scope-mechanisms/ComparisonScopeView.tsx'
type Mutate = (fn: (draft: DemoStore) => void) => void
type Inspector = { kind: ContentKind; mode: InspectorMode; contextId?: string } | null
const STORAGE_DATA_A = 'pt006-simulator-content-A-v6'
const STORAGE_DATA_B = 'pt006-simulator-content-B-v6'
const STORAGE_CONTEXT_COPIES = 'pt006-simulator-context-copies-v1'
const STORAGE_SHARED_LAYOUT = 'pt006-simulator-multicontext-layout-v1'
const STORAGE_COMPARISON_SCOPES='pt006-simulator-comparison-scopes-v1'
type NotesState={notes:string}
type SavedContext = { id: string; title: string; templateId: string; sourceId: string; state: DemoStore | NotesState }
const NOTES_DESCRIPTOR={id:'notes',label:'Требования / заметки',caption:'Минимальный Context без подготовленной истории',icon:'▤',minWidth:340,minHeight:300,maxPerScreen:1,accent:'#55c4ad'}
function restoreContextCopies(): Record<string,SavedContext> {
  try {
    const parsed:unknown=JSON.parse(localStorage.getItem(STORAGE_CONTEXT_COPIES)??'null')
    if(!parsed||typeof parsed!=='object'||(parsed as {version?:number}).version!==1)return {}
    const values=(parsed as {items?:unknown}).items
    if(!Array.isArray(values))return {}
    const result:Record<string,SavedContext>={}
    for(const entry of values){
      const value=entry as Partial<SavedContext>
      if(!value||typeof value.id!=='string'||!/^C-[a-f0-9-]{36}$/.test(value.id)||typeof value.title!=='string'||
         typeof value.templateId!=='string'||typeof value.sourceId!=='string'||!value.state||
         !(value.templateId==='architecture-evolution'?validateDemo(value.state):
           value.templateId==='minimal-planning'&&value.state&&typeof (value.state as NotesState).notes==='string')||result[value.id])return {}
      result[value.id]={id:value.id,title:value.title,templateId:value.templateId,sourceId:value.sourceId,state:value.state}
    }
    return result
  }catch{return {}}
}
const architectureContextTemplate: ContextTemplate<DemoStore> = {
  id:'architecture-evolution',profileId:'architecture-simulator',title:'Эволюция архитектуры',seed:initialData,
  screens: SCREEN_TEMPLATES,
}
function legacyAsScoped(contextId:'A'|'B'):Workspace {
  const model=createWorkspaceModel(CONTENT)
  let old=INITIAL_WORKSPACE
  try {
    const raw=localStorage.getItem('pt006-simulator-layout-'+contextId+'-v3')
    if(raw){const candidate:unknown=JSON.parse(raw);if(model.validateWorkspace(candidate))old=candidate}
    else if(contextId==='A'){
      const legacy=localStorage.getItem('pt006-workspace-v2')
      if(legacy){const migrated=migrateLegacyWorkspace(JSON.parse(legacy));if(migrated&&model.validateWorkspace(migrated))old=migrated}
    }
  }catch{/* preserved independently, use safe template for shared workspace */}
  return bindLegacyLayout(contextId,old)
}
function restore<T>(key: string, legacyKey: string | string[], initial: T, valid: (value: unknown) => value is T, migrate: (value: unknown) => T | null, upgrade?: (value: T) => T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (valid(parsed)) return upgrade ? upgrade(parsed) : parsed
    }
    for (const legacyName of typeof legacyKey === 'string' ? [legacyKey] : legacyKey) {
      const legacy = localStorage.getItem(legacyName)
      if (legacy) {
        const migrated = migrate(JSON.parse(legacy) as unknown)
        if (migrated && valid(migrated)) return migrated
      }
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
function ProjectionReferences({ kind, mode, branch, data, allData, onJump }: {
  kind: ContentKind; mode: 'state' | 'schema'; branch: Branch; data: DemoStore
  allData: Record<Branch, DemoStore>; onJump: (kind: ContentKind) => void
}) {
  if (!isExtraKind(kind) || !EXTRA_SOURCES[kind].length) return null
  return <div className="projection-sources">
    <h4>Исходные модели этого представления</h4>
    <p className="inspector-note">{kind === 'trace' ? 'Собственный State выше содержит фактические связи и параметры выбора.' : 'Собственный State окна выше хранит параметры просмотра.'} Показанные объекты читаются из моделей ниже — без дублирования данных. Их возможные структуры находятся в JSON Schema источников.</p>
    {mode === "state" && data.history.selectedRevisionId && ["architecturePlan","forecasts","axes","impactHistory"].includes(kind) && <details className="selected-plan-source"><summary>Выбранная архивная PlanRevision · отдельный плановый контекст</summary><pre className="state-pre">{stringify(data.history.revisions.find(r => r.id === data.history.selectedRevisionId))}</pre></details>}
    {EXTRA_SOURCES[kind].map(source => <details key={source}>
      <summary>{getDescriptor(source).label} · {mode === 'schema' ? 'JSON Schema' : 'State'}</summary>
      <button className="minor-btn" onClick={() => onJump(source)}>Открыть {getDescriptor(source).label}</button>
      <pre className="state-pre">{stringify(mode === 'schema' ? SCHEMAS[source] : data[source])}</pre>
      {kind === 'comparison' && mode === 'state' && <details><summary>Другая ветка · Architecture {branch === 'A' ? 'B' : 'A'}</summary><pre className="state-pre">{stringify(allData[branch === 'A' ? 'B' : 'A'][source])}</pre></details>}
    </details>)}
  </div>
}
export function useSimulatorProfile(): WorkspaceProfile & { shared: WorkspaceProfile } {
  const [branch, setBranch] = useState<Branch>('A')
  const [branchData, setBranchData] = useState<Record<Branch, DemoStore>>(() => ({
    A: restore(STORAGE_DATA_A, ['pt006-simulator-content-A-v5', 'pt006-simulator-content-A-v4', 'pt006-simulator-content-A-v3'], initialData, validateDemo, value => migrateLegacyDemo(value, initialData), value => migrateLegacyDemo(value, initialData) ?? value),
    B: restore(STORAGE_DATA_B, ['pt006-simulator-content-B-v5', 'pt006-simulator-content-B-v4', 'pt006-simulator-content-B-v3'], initialDataB, validateDemo, value => migrateLegacyDemo(value, initialDataB), value => migrateLegacyDemo(value, initialDataB) ?? value),
  }))
  const [contextCopies,setContextCopies]=useState<Record<string,SavedContext>>(restoreContextCopies)
  const [scopes,setScopes]=useState<Record<string,ComparisonScope>>(()=>{
    try {
      const parsed:unknown=JSON.parse(localStorage.getItem(STORAGE_COMPARISON_SCOPES)??'null')
      if(!parsed||typeof parsed!=='object'||(parsed as {version?:number}).version!==1)return {}
      const items=(parsed as {items?:unknown}).items
      if(!Array.isArray(items))return {}
      const resolve=(id:string):DemoStore|null =>id==='A'||id==='B'?branchData[id]:(contextCopies[id]?.templateId==='architecture-evolution'?contextCopies[id].state as DemoStore:null)
      const loaded:Record<string,ComparisonScope>={}
      for(const item of items){if(!validateComparisonScope(item,resolve)||loaded[item.id])return {};loaded[item.id]=item}
      return loaded
    }catch{return {}}
  })
  const initialScopes=useRef(scopes)
  useEffect(()=>{if(scopes!==initialScopes.current)localStorage.setItem(STORAGE_COMPARISON_SCOPES,JSON.stringify({version:1,items:Object.values(scopes)}))},[scopes])
  const [inspector, setInspector] = useState<Inspector>(null)
  const initialCopies=useRef(contextCopies)
  // A damaged persisted registry is never silently overwritten during hydration.
  useEffect(()=>{if(contextCopies!==initialCopies.current)localStorage.setItem(STORAGE_CONTEXT_COPIES,JSON.stringify({version:1,items:Object.values(contextCopies)}))},[contextCopies])
  useEffect(() => { localStorage.setItem(STORAGE_DATA_A, stringify(branchData.A)); localStorage.setItem(STORAGE_DATA_B, stringify(branchData.B)) }, [branchData])
  const setData = (fn: (previous: DemoStore) => DemoStore) =>
    setBranchData(prev => ({ ...prev, [branch]: fn(prev[branch]) }))
  const mutate: Mutate = fn => setData(prev => { const next = structuredClone(prev); fn(next); return next })
  const contextIds=['A','B',...Object.keys(contextCopies)]
  const contextStore=(id:string):DemoStore|null => {
    if(id==='A'||id==='B')return branchData[id]
    const copy=contextCopies[id]
    return copy&&validateDemo(copy.state)?copy.state:null
  }
  const readResource=(ref:ResourceRef)=>{
    if(ref.profileId!=='architecture-simulator'||ref.resourceId!=='architecture')return null
    const data=contextStore(ref.contextId)
    if(!data||!atCursor(data).available)return null
    return {ref:{...ref},capability:'architecture.read' as const,title:'Architecture '+ref.contextId,
      summary:'Сценарий '+data.scenario.caseId+'; доступные фактические якоря: '+data.scenario.anchors.length}
  }
  const mutateContext=(id:string):Mutate => fn=>{
    if(id==='A'||id==='B'){
      setBranchData(prev=>{const next=structuredClone(prev[id]);fn(next);return {...prev,[id]:next}})
    }else if(contextCopies[id]){
      setContextCopies(prev=>{const old=prev[id];if(!old||!validateDemo(old.state))return prev;const next=structuredClone(old.state);fn(next);return {...prev,[id]:{...old,state:next}}})
    }
  }
  // Resolve legacy layouts when switching into the shared mode, not only at the app's first render.
  const sharedInitialWorkspace:Workspace=combineContextLayouts([legacyAsScoped('A'),legacyAsScoped('B')])
  const createContext=(templateId='architecture-evolution')=>{
    if(templateId!=='architecture-evolution'&&templateId!=='minimal-planning')return null
    const id='C-'+crypto.randomUUID()
    if(templateId==='minimal-planning'){
      const prepared=instantiateContext<NotesState>({id:templateId,profileId:'architecture-simulator',title:'Рабочий контекст',seed:{notes:''},screens:[]},id)
      const templates=[{id:'minimal-notes',title:'Требования и заметки',panels:[{rect:{x:20,y:26,w:650,h:510},tabs:['notes'],active:'notes'}]}]
      return {id,descriptors:scopeDescriptors(id,[NOTES_DESCRIPTOR]),templates:bindContextScreens(id,templates),
        commit:()=>setContextCopies(prev=>({...prev,[id]:{id,title:prepared.title,templateId,sourceId:'',state:prepared.state}}))}
    }
    const prepared=instantiateContext({...architectureContextTemplate,seed:branchData.A},id,'A')
    return {id,descriptors:scopeDescriptors(id,CONTENT),templates:bindContextScreens(id,SCREEN_TEMPLATES),
      commit:()=>setContextCopies(prev=>({...prev,[id]:{id,title:prepared.title,templateId:prepared.templateId,sourceId:prepared.provenance??'A',state:prepared.state}}))}
  }
  const prepareComparison=(input:{leftId:string;rightId:string})=>{
    const scope=createComparisonScope('cmp-'+crypto.randomUUID(),input,contextStore)
    if(!scope)return null
    return {descriptors:[comparisonDescriptor(scope)],templates:comparisonScreens(scope),
      commit:()=>setScopes(prev=>({...prev,[scope.id]:scope}))}
  }
  const renderContextContent=(id:string,dispatch:(event:WorkspaceEvent)=>void)=>{
    const scopeId=parseScopeContentId(id)
    if(scopeId){
      const scope=scopes[scopeId]
      return scope?<ComparisonScopeView scope={scope} resolve={contextStore} onFocus={(focus:ComparisonFocus)=>setScopes(prev=>({...prev,[scopeId]:{...prev[scopeId],focus}}))}/>:null
    }
    const ref=parseScopedContentId(id)
    if(!ref||!contextIds.includes(ref.contextId))return null
    if(ref.resourceId==='notes'&&contextCopies[ref.contextId]?.templateId==='minimal-planning'){
      const copy=contextCopies[ref.contextId],state=copy.state as NotesState
      return <div className="sim-content"><h2>Требования и заметки · {ref.contextId}</h2><p>Минимальный контекст без History. Изменения сохраняются отдельно от A/B.</p>
        <textarea className="context-notes" aria-label={'Заметки '+ref.contextId} value={state.notes} onChange={event=>{
          const notes=event.target.value
          setContextCopies(prev=>({...prev,[ref.contextId]:{...prev[ref.contextId],state:{notes}}}))
        }}/></div>
    }
    if(!CONTENT.some(d=>d.id===ref.resourceId))return null
    if(ref.resourceId==='comparison')return <div className="sim-content"><p className="history-notice">В общем Workspace сравнение использует явные Scope bindings. Нажмите «⇄ Композиция» и выберите два контекста. Старый Comparison A/B сохранён в режиме отдельных раскладок.</p></div>
    const live=contextStore(ref.contextId)
    if(!live)return null
    const snapshot=atCursor(live)
    const kind=ref.resourceId as ContentKind
    const contextualDispatch=(event:WorkspaceEvent)=>dispatch({...event,target:{...event.target,contextId:ref.contextId}})
    const canShow=kind==='events'||(snapshot.available&&(kind!=='comparison'||(resolvedA.available&&resolvedB.available)))
    return <DomainContent key={id} kind={kind} branch={ref.contextId==='B'?'B':'A'} data={snapshot.data} allData={{A:resolvedA.data,B:resolvedB.data}} mutate={mutateContext(ref.contextId)} unavailable={!canShow} onWorkspaceEvent={contextualDispatch}/>
  }
  const liveData = branchData[branch]
  const resolvedA = atCursor(branchData.A), resolvedB = atCursor(branchData.B)
  const resolved = branch === 'A' ? resolvedA : resolvedB
  const data = resolved.data
  const allData = { A: resolvedA.data, B: resolvedB.data }
  const available = (kind: ContentKind) => kind === 'events' || (resolved.available && (kind !== 'comparison' || (resolvedA.available && resolvedB.available)))
  const openInspector = (kind: string, mode: InspectorMode) => setInspector({kind: kind as ContentKind, mode})
  const inspectedId=inspector?.contextId
  const inspectedLive=(inspectedId&&contextStore(inspectedId))||liveData
  const inspectedSnapshot=atCursor(inspectedLive)
  const inspectedData=inspectedSnapshot.data
  const inspectedBranch:Branch=inspectedId==='B'?'B':inspectedId?'A':branch
  const inspectedMutate=inspectedId?mutateContext(inspectedId):mutate
  const inspectedWarnings=referenceWarnings(inspectedLive)
  const inspectedAvailable=(kind:ContentKind)=>kind==='events'||(inspectedSnapshot.available&&(kind!=='comparison'||(resolvedA.available&&resolvedB.available)))
  const inspectedContentId=(kind:ContentKind)=>inspectedId?scopedContentId(inspectedId,kind):kind
  const modeLabels: {id: InspectorMode; label: string}[] = [
    {id:'preview',label:'Предпросмотр'}, {id:'state',label:'Фактический State'},
    {id:'schema',label:'JSON Schema'}, {id:'history',label:'История'},
  ]
  const renderInspector = (actions: InspectorActions) => (
    <>
    {inspector && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setInspector(null) }}><section className="catalog-dialog" role="dialog" aria-modal="true" aria-label="Каталог содержимого и его состояния">
      <header className="catalog-header"><div><span className="eyebrow">ГЛОБАЛЬНЫЙ КАТАЛОГ</span><h2>Содержимое симулятора · демонстрационные состояния</h2><p>Независимо от окон. Предпросмотр не меняет компоновку.</p></div><button className="close-modal" onClick={() => setInspector(null)} aria-label="Закрыть каталог">×</button></header>
      <div className="catalog-main"><aside className="catalog-list">{CONTENT.map(d => <button key={d.id} className={'catalog-entry ' + (inspector.kind === d.id ? 'chosen' : '')} onClick={() => setInspector({ ...inspector, kind: d.id as ContentKind })}><span className="catalog-icon" style={{ color: d.accent }}>{d.icon}</span><span><b>{d.label}</b><small>{d.caption}</small></span></button>)}</aside>
      <div className="catalog-details"><div className="catalog-title"><div><h3>{getDescriptor(inspector.kind).label}</h3><p>Рекомендуемый минимум {getDescriptor(inspector.kind).minWidth} × {getDescriptor(inspector.kind).minHeight} px · {getDescriptor(inspector.kind).maxPerScreen === null ? 'несколько экземпляров' : '1 экземпляр на экран'}</p></div><span className="persisted-label">● Данные не зависят от окон</span></div>
      <div className="inspector-tabs">{modeLabels.map(t => <button className={inspector.mode === t.id ? 'active' : ''} key={t.id} onClick={() => setInspector({ ...inspector, mode: t.id })}>{t.label}</button>)}</div>
      <div className="inspector-content">
        {inspector.mode === 'preview' && <DomainContent kind={inspector.kind} branch={inspectedBranch} data={inspectedData} allData={allData} mutate={inspectedMutate} unavailable={!inspectedAvailable(inspector.kind)} preview/>}
        {inspector.mode === 'state' && <div className="state-editor">{inspectedWarnings.length > 0 && <details open className="reference-warnings"><summary>Черновик: предупреждений о ссылках — {inspectedWarnings.length}</summary><p>JSON можно сохранить. Эти ссылки нужно проверить перед использованием материала.</p>{inspectedWarnings.map(w => <p key={w.path + w.target}><code>{w.path}</code> → {w.target}: {w.message}</p>)}</details>}<p className="inspector-note">{inspectedSnapshot.historical ? 'Сохранённый фактический State выбранного момента. Исторические данные доступны только для просмотра.' : 'Последний тестовый State. Прямое редактирование не создаёт события и не переписывает сохранённую историю.'}</p>{inspectedAvailable(inspector.kind) ? <JsonEdit value={inspectedData[inspector.kind]} readOnly={inspectedSnapshot.historical} onSave={value => { const next = replaceContentState(inspectedLive, inspector.kind, value); if (!next) return false; if(inspectedId){setContextCopies(prev=>inspectedId==='A'||inspectedId==='B'?prev:{...prev,[inspectedId]:{...prev[inspectedId],state:next}});if(inspectedId==='A'||inspectedId==='B')setBranchData(prev=>({...prev,[inspectedId]:next}))}else setData(() => next); return true }} /> : <p className="history-notice">Для этого момента нет сохранённого State.</p>}</div>}
        {inspector.mode === 'schema' && <div><p className="inspector-note">JSON Schema — допустимая форма данных, <strong>не список существующих экземпляров</strong>.</p><pre className="state-pre">{stringify(SCHEMAS[inspector.kind])}</pre></div>}
        {(inspector.mode === 'state' || inspector.mode === 'schema') && (inspector.mode === 'schema' || inspectedAvailable(inspector.kind)) && <ProjectionReferences kind={inspector.kind} mode={inspector.mode} branch={inspectedBranch} data={inspectedData} allData={allData} onJump={kind => setInspector({...inspector,kind, mode: inspector.mode })}/>}
        {inspector.mode === 'history' && <StateHistory kind={inspector.kind} branch={inspectedBranch} data={inspectedLive} allData={branchData} onSelectEvent={id => inspectedMutate(d => { d.events.selectedId = id; d.history.selectedRevisionId = null })}/>}
        </div>
      <div className="catalog-actions"><span>Открыто на этом экране: {actions.countOnScreen(inspectedContentId(inspector.kind))}</span>{!actions.canAddOnScreen(inspectedContentId(inspector.kind)) ? <button className="minor-btn" onClick={() => { actions.openContent(inspectedContentId(inspector.kind)); setInspector(null) }}>Перейти к существующему окну</button> : <button className="primary-btn" onClick={() => { actions.createWindow(inspectedContentId(inspector.kind)); setInspector(null) }}>+ Открыть в новом окне</button>}</div>
      </div></div>
    </section></div>}

    </>
  )
  const legacyProfile: WorkspaceProfile = {
    id: 'architecture-simulator',
    title: 'Architecture Simulator',
    subtitle: 'PT-006 · scripted content fixture',
    descriptors: CONTENT,
    initialWorkspace: INITIAL_WORKSPACE,
    contextId: branch,
    contexts: ['A', 'B'],
    layoutKey: context => 'pt006-simulator-layout-' + context + '-v3',
    legacyLayoutKey: context => context === 'A' ? 'pt006-workspace-v2' : '',
    migrateLayout: migrateLegacyWorkspace,
    renderHeader: () => <div className="branch-switch" role="group" aria-label="Выбор архитектуры">{(['A','B'] as const).map(id => <button key={id} className={branch === id ? 'branch-active' : ''} onClick={() => { setBranch(id); setInspector(null) }}>Architecture {id}</button>)}</div>,
    renderFactualTime: () => <div className="factual-time-bar"><span>{resolved.message}{liveData.history.imported ? ' · архив подготовленного сценария; ваши правки сохранены' : ''}</span>{(resolved.historical || liveData.history.selectedRevisionId) && <button onClick={() => mutate(d => { d.events.selectedId = null; d.history.selectedRevisionId = null })}>К последнему State</button>}</div>,
    renderContent: (kind: string, dispatch: (event: WorkspaceEvent) => void) => <DomainContent key={kind} kind={kind as ContentKind} branch={branch} data={data} allData={allData} mutate={mutate} unavailable={!available(kind as ContentKind)} onWorkspaceEvent={dispatch}/>,
    renderPanelTools: (kind: string) => <div className="edge-actions"><button title="Предпросмотр" aria-label="Предпросмотр" onClick={() => openInspector(kind,'preview')}>◉</button><button title="Фактический State" aria-label="Фактический State" onClick={() => openInspector(kind,'state')}>{'{}'}</button><button title="JSON Schema" aria-label="JSON Schema" onClick={() => openInspector(kind,'schema')}>▤</button><button title="История State" aria-label="История State" onClick={() => openInspector(kind,'history')}>↶</button></div>,
    renderInspector,
    openInspector,
    resetContent: () => { setData(() => structuredClone(branch === 'A' ? initialData : initialDataB)); setInspector(null) },
  }
  const sharedProfile:WorkspaceProfile={
    id:'architecture-simulator',
    readResource,
    title:'Architecture Simulator',
    subtitle:'Workspace · независимые Context',
    descriptors:[...contextIds.flatMap(id=>scopeDescriptors(id,contextCopies[id]?.templateId==='minimal-planning'?[NOTES_DESCRIPTOR]:CONTENT)),...Object.values(scopes).map(comparisonDescriptor)],
    initialWorkspace:sharedInitialWorkspace,
    contextId:'workspace',
    contexts:['workspace'],
    layoutKey:()=>STORAGE_SHARED_LAYOUT,
    legacyLayoutKey:()=>'', // A/B layouts are imported as copies; their original keys are untouched.
    migrateLayout:()=>null,
    renderHeader:()=> <div className="branch-switch" role="group" aria-label="Рабочие контексты">
      {contextIds.map(id=><span key={id} className="context-name" title={id}>Context {id}</span>)}
    </div>,
    renderFactualTime:()=> <div className="factual-time-bar"><span>Context A и B — независимые источники; Scope Comparison использует явные read-only привязки и не меняет State.</span></div>,
    renderContent:renderContextContent,
    renderPanelTools:(value:string)=>{
      if(parseScopeContentId(value))return null
      const ref=parseScopedContentId(value)
      if(!ref||ref.resourceId==='notes')return null
      const show=(mode:InspectorMode)=>setInspector({kind:ref.resourceId as ContentKind,mode,contextId:ref.contextId})
      return <div className="edge-actions">
        <button title="Предпросмотр" aria-label="Предпросмотр" onClick={()=>show('preview')}>◉</button>
        <button title="Фактический State" aria-label="Фактический State" onClick={()=>show('state')}>{'{}'}</button>
        <button title="JSON Schema" aria-label="JSON Schema" onClick={()=>show('schema')}>▤</button>
        <button title="История State" aria-label="История State" onClick={()=>show('history')}>↶</button>
      </div>
    },
    renderInspector,
    openInspector:(value,mode)=>{
      const ref=parseScopedContentId(value)
      if(ref&&contextIds.includes(ref.contextId))setInspector({kind:ref.resourceId as ContentKind,mode,contextId:ref.contextId})
    },
    resetContent:()=>{setInspector(null)}, // never erase context data when resetting only the shared screen layout
    resetScope:'layout-only',
    createContext,
    compositionContextIds:contextIds,
    prepareComparison,
    contextTemplateOptions:[
      {id:'architecture-evolution',title:'Эволюция архитектуры',description:'Независимый State и комплект четырёх экранов'},
      {id:'minimal-planning',title:'Минимальный контекст',description:'Один экран с требованиями и заметками, без History'},
    ],
    resolveContentAddress:target=>{
      const contextId=target.contextId
      const descriptors=contextCopies[contextId??'']?.templateId==='minimal-planning'?[NOTES_DESCRIPTOR]:CONTENT
      return contextId&&contextIds.includes(contextId)&&descriptors.some(d=>d.id===target.instanceId)
        ?scopedContentId(contextId,target.instanceId):null
    },
  }
  return {...legacyProfile,shared:sharedProfile}
}