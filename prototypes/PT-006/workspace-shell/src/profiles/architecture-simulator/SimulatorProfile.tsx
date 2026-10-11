import { useEffect, useState } from 'react'
import { CONTENT, INITIAL_WORKSPACE, getDescriptor, migrateLegacyWorkspace } from './workspace.ts'
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
type Mutate = (fn: (draft: DemoStore) => void) => void
type Inspector = { kind: ContentKind; mode: InspectorMode } | null
const STORAGE_DATA_A = 'pt006-simulator-content-A-v6'
const STORAGE_DATA_B = 'pt006-simulator-content-B-v6'
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
export function useSimulatorProfile(): WorkspaceProfile {
  const [branch, setBranch] = useState<Branch>('A')
  const [branchData, setBranchData] = useState<Record<Branch, DemoStore>>(() => ({
    A: restore(STORAGE_DATA_A, ['pt006-simulator-content-A-v5', 'pt006-simulator-content-A-v4', 'pt006-simulator-content-A-v3'], initialData, validateDemo, value => migrateLegacyDemo(value, initialData), value => migrateLegacyDemo(value, initialData) ?? value),
    B: restore(STORAGE_DATA_B, ['pt006-simulator-content-B-v5', 'pt006-simulator-content-B-v4', 'pt006-simulator-content-B-v3'], initialDataB, validateDemo, value => migrateLegacyDemo(value, initialDataB), value => migrateLegacyDemo(value, initialDataB) ?? value),
  }))
  const [inspector, setInspector] = useState<Inspector>(null)
  useEffect(() => { localStorage.setItem(STORAGE_DATA_A, stringify(branchData.A)); localStorage.setItem(STORAGE_DATA_B, stringify(branchData.B)) }, [branchData])
  const setData = (fn: (previous: DemoStore) => DemoStore) =>
    setBranchData(prev => ({ ...prev, [branch]: fn(prev[branch]) }))
  const mutate: Mutate = fn => setData(prev => { const next = structuredClone(prev); fn(next); return next })
  const liveData = branchData[branch]
  const warnings = referenceWarnings(liveData)
  const resolvedA = atCursor(branchData.A), resolvedB = atCursor(branchData.B)
  const resolved = branch === 'A' ? resolvedA : resolvedB
  const data = resolved.data
  const allData = { A: resolvedA.data, B: resolvedB.data }
  const available = (kind: ContentKind) => kind === 'events' || (resolved.available && (kind !== 'comparison' || (resolvedA.available && resolvedB.available)))
  const openInspector = (kind: string, mode: InspectorMode) => setInspector({kind: kind as ContentKind, mode})
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
        {inspector.mode === 'preview' && <DomainContent kind={inspector.kind} branch={branch} data={data} allData={allData} mutate={mutate} unavailable={!available(inspector.kind)} preview/>}
        {inspector.mode === 'state' && <div className="state-editor">{warnings.length > 0 && <details open className="reference-warnings"><summary>Черновик: предупреждений о ссылках — {warnings.length}</summary><p>JSON можно сохранить. Эти ссылки нужно проверить перед использованием материала.</p>{warnings.map(w => <p key={w.path + w.target}><code>{w.path}</code> → {w.target}: {w.message}</p>)}</details>}<p className="inspector-note">{resolved.historical ? 'Сохранённый фактический State выбранного момента. Исторические данные доступны только для просмотра.' : 'Последний тестовый State. Прямое редактирование не создаёт события и не переписывает сохранённую историю.'}</p>{available(inspector.kind) ? <JsonEdit value={data[inspector.kind]} readOnly={resolved.historical} onSave={value => { const next = replaceContentState(liveData, inspector.kind, value); if (!next) return false; setData(() => next); return true }} /> : <p className="history-notice">Для этого момента нет сохранённого State.</p>}</div>}
        {inspector.mode === 'schema' && <div><p className="inspector-note">JSON Schema — допустимая форма данных, <strong>не список существующих экземпляров</strong>.</p><pre className="state-pre">{stringify(SCHEMAS[inspector.kind])}</pre></div>}
        {(inspector.mode === 'state' || inspector.mode === 'schema') && (inspector.mode === 'schema' || available(inspector.kind)) && <ProjectionReferences kind={inspector.kind} mode={inspector.mode} branch={branch} data={data} allData={allData} onJump={kind => setInspector({ kind, mode: inspector.mode })}/>}
        {inspector.mode === 'history' && <StateHistory kind={inspector.kind} branch={branch} data={liveData} allData={branchData} onSelectEvent={id => mutate(d => { d.events.selectedId = id; d.history.selectedRevisionId = null })}/>}
        </div>
      <div className="catalog-actions"><span>Открыто на этом экране: {actions.countOnScreen(inspector.kind)}</span>{!actions.canAddOnScreen(inspector.kind) ? <button className="minor-btn" onClick={() => { actions.openContent(inspector.kind); setInspector(null) }}>Перейти к существующему окну</button> : <button className="primary-btn" onClick={() => { actions.createWindow(inspector.kind); setInspector(null) }}>+ Открыть в новом окне</button>}</div>
      </div></div>
    </section></div>}

    </>
  )
  return {
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
}
