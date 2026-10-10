import type { Branch, DemoStore } from './content.ts'
import { HISTORY_SCHEMA } from './content.ts'
import { changesFor, diffState, factualValue, historySources } from './history.ts'
import type { StateChange } from './history.ts'
import { getDescriptor } from './workspace.ts'
import type { ContentKind } from './workspace.ts'

const json = (value: unknown) => value === undefined ? '—' : JSON.stringify(value, null, 2)
const labels = { add: 'Добавлен', remove: 'Удалён', replace: 'Изменён', reorder: 'Порядок изменён' }
function Value({ value }: { value: unknown }) {
  return typeof value === 'object' && value !== null
    ? <details className="history-value"><summary>{Array.isArray(value) ? 'Коллекция · ' + value.length : 'Объект'}</summary><pre>{json(value)}</pre></details>
    : <code>{json(value)}</code>
}
export function ChangeList({ changes }: { changes: StateChange[] }) {
  if (!changes.length) return <p className="sim-hint">Содержательные поля не менялись. Выбор вкладок и объектов в историю симуляции не входит.</p>
  return <div className="history-changes">{changes.map((change, i) => <article className={'history-change ' + change.op} key={change.path + i}>
    <div className="history-change-title"><span className="sim-tag">{labels[change.op]}</span><code>{change.path}</code></div>
    <div className="history-values"><div><small>Было</small><Value value={change.before}/></div><div><small>Стало</small><Value value={change.after}/></div></div>
  </article>)}</div>
}

export function StateHistory({ kind, branch, data, allData, onSelectEvent }: {
  kind: ContentKind; branch: Branch; data: DemoStore; allData: Record<Branch, DemoStore>; onSelectEvent: (id: string) => void
}) {
  const index = data.history.frames.findIndex(f => f.eventId === (data.events.selectedId ?? data.history.frames.at(-1)?.eventId))
  const frame = data.history.frames[index]
  const sources = historySources(kind)
  const otherBranch = branch === 'A' ? 'B' : 'A'
  const other = allData[otherBranch]
  const otherIndex = frame ? other.history.frames.findLastIndex(f => f.date <= frame.date) : -1
  const counterpart = other.history.frames[otherIndex]
  return <div className="state-history">
    <p className="inspector-note">Сохранённые снимки тестового сценария после фактических событий. Выбор момента меняет связанные окна. Прямые JSON-правки и параметры просмотра не выдаются за события.</p>
    {data.history.imported && <p className="history-notice">Ваш прежний State сохранён. Исторические снимки добавлены из подготовленного сценария; они не восстанавливают историю ваших локальных правок.</p>}
    <label className="sim-select-label">State после события
      <select value={frame?.eventId ?? ''} onChange={e => onSelectEvent(e.target.value)}>
        {!frame && <option value="">Для выбранного события снимка нет</option>}
        {data.history.frames.map(f => <option key={f.eventId} value={f.eventId}>{f.state.events.records.at(-1)?.day} · {f.eventId} · {f.state.events.records.at(-1)?.label}</option>)}
      </select>
    </label>
    {frame ? <>
      <h4>{frame.date} · Architecture {branch} · {frame.eventId}</h4>
      <ChangeList changes={changesFor(data, kind, index)}/>
      <details className="history-snapshot"><summary>Полный сохранённый State источников</summary>{sources.map(source => <div key={source}><h4>{getDescriptor(source).label}</h4><pre className="state-pre">{json(factualValue(frame.state, source))}</pre></div>)}</details>
      {kind === 'comparison' && <section className="history-counterpart"><h4>Architecture {otherBranch} · {counterpart?.eventId ?? 'снимка на этот момент нет'}</h4>{counterpart && <><ChangeList changes={changesFor(other, kind, otherIndex)}/><details><summary>State второй архитектуры на этот момент</summary>{sources.map(source => <pre className="state-pre" key={source}>{json(factualValue(counterpart.state, source))}</pre>)}</details></>}</section>}
    </> : <p className="history-notice">Фактический снимок для выбранного события отсутствует. Последний State можно посмотреть отдельно.</p>}
    <details className="history-snapshot"><summary>JSON Schema исторических снимков и PlanRevision</summary><pre className="state-pre">{json(HISTORY_SCHEMA)}</pre></details>
  </div>
}

export function PlanHistory({ data, actualRevision, mutate, preview = false }: { data: DemoStore; actualRevision: string; mutate: (fn: (draft: DemoStore) => void) => void; preview?: boolean }) {
  const id = data.history.selectedRevisionId ?? data.plan.revision
  const revision = data.history.revisions.find(r => r.id === id)
  const parent = data.history.revisions.find(r => r.id === revision?.parentId)
  return <section className="plan-history">
    <label className="sim-select-label">PlanRevision
      <select aria-label="История PlanRevision" value={data.history.selectedRevisionId ?? ''} disabled={preview} onChange={e => mutate(d => { d.history.selectedRevisionId = e.target.value || null })}>
        <option value="">По выбранному фактическому моменту · {actualRevision}</option>
        {data.history.revisions.map(r => <option key={r.id} value={r.id}>{r.id} · после {r.eventId}</option>)}
      </select>
    </label>
    <p className="sim-hint">Выбор архивной ревизии меняет плановые представления. Фактический момент и CURRENT остаются на выбранном событии.</p>
    {revision ? <>
      <div className="sim-detail"><span className="sim-tag">{revision.id}</span><span>{revision.parentId ? 'Предыдущая: ' + revision.parentId : 'Исходная ревизия'} · событие {revision.eventId}</span></div>
      <details className="history-snapshot"><summary>Что изменилось в PlanRevision</summary><ChangeList changes={diffState(parent ? { ...parent.plan, selectedStepId: undefined } : undefined, { ...revision.plan, selectedStepId: undefined }, 'plan')}/></details>
      <details className="history-snapshot"><summary>Неизменяемый BASE · {revision.base.eventId}</summary><p className="sim-hint">Полный сохранённый исходный срез этой ревизии; не подставляется из текущего State.</p><pre className="state-pre">{json(revision.base)}</pre></details>
      <details className="history-snapshot"><summary>Сохранённый JSON ревизии</summary><pre className="state-pre">{json(revision)}</pre></details>
    </> : <p className="history-notice">Этот Plan изменён напрямую и не является сохранённой исторической ревизией.</p>}
  </section>
}
