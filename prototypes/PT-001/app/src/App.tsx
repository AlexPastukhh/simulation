import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  branchEntityEvents,
  branchEventsFor,
  effectiveMappingKeys,
  operationBreakdown,
  operationCount,
  responsesFor,
  scenarioEntityEvents,
  type BranchEvent,
  type ScenarioEvent,
  type StageData,
} from './model'

type View = 'stream' | 'entity' | 'compare'
type Selection = { kind: 'scenario' | 'branch'; id: string } | null

const LEAVES = ['BR-KK', 'BR-KP', 'BR-PK', 'BR-PP']

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>
}

function EventCard({
  event,
  selected,
  onClick,
}: {
  event: ScenarioEvent | BranchEvent
  selected: boolean
  onClick: () => void
}) {
  const scenario = 'order' in event
  return (
    <button
      className={`event-card ${scenario ? 'scenario' : 'branch'} ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="event-meta">
        <strong>{event.id}</strong>
        <Tag>{scenario ? 'scenario' : event.branchScope}</Tag>
        <Tag>{event.role}</Tag>
        <Tag>{event.category}</Tag>
      </div>
      <div className="event-title">{event.title}</div>
      {!scenario && (
        <div className="event-foot">
          {event.relations.length} relations · {event.mutations.length} mutations · {event.operations.length} ops
        </div>
      )}
    </button>
  )
}

function Inspector({ data, selection }: { data: StageData; selection: Selection }) {
  if (!selection) return <div className="empty">Select an event from the stream.</div>
  const event =
    selection.kind === 'scenario'
      ? data.scenarioEvents.find((item) => item.id === selection.id)
      : data.branchEvents.find((item) => item.id === selection.id)
  if (!event) return <div className="empty">Event not found.</div>
  const scenario = 'order' in event
  const relations = event.relations ?? []
  const mutations = scenario ? event.semanticMutations ?? [] : event.mutations
  const operations = scenario ? [] : event.operations
  return (
    <div className="inspector">
      <div className="eyebrow">{scenario ? 'Scenario event' : 'Branch event'}</div>
      <h2>{event.title}</h2>
      <div className="tag-row">
        <Tag>{event.id}</Tag>
        <Tag>{event.role}</Tag>
        <Tag>{event.category}</Tag>
        {!scenario && <Tag>{event.branchScope}</Tag>}
      </div>

      <section>
        <h3>Relations</h3>
        {relations.length ? (
          <div className="fact-list">
            {relations.map((relation, index) => (
              <div className="fact" key={`${relation.type}-${index}`}>
                <code>{relation.type}</code>
                <span>
                  {relation.entityId ?? relation.representationKey ?? relation.organizationId ?? relation.targetId ?? '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No relations.</p>
        )}
      </section>

      <section>
        <h3>Authoritative mutations</h3>
        {mutations.length ? (
          <div className="fact-list">
            {mutations.map((mutation, index) => (
              <div className="fact mutation" key={`${mutation.mutationType}-${index}`}>
                <code>{mutation.mutationType}</code>
                <span>{mutation.representationKey ?? mutation.targetId ?? '—'}</span>
                <small>{mutation.delta}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No mutation. This event can still be related to tracked entities.</p>
        )}
      </section>

      {!scenario && (
        <section>
          <h3>Implementation operations</h3>
          {operations.length ? (
            <div className="fact-list">
              {operations.map((operation) => (
                <div className="fact" key={operation.id}>
                  <code>{operation.id}</code>
                  <span>{operation.type}</span>
                  <small>{operation.target ?? `${operation.from ?? ''} → ${operation.to ?? ''}`}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No implementation operations.</p>
          )}
        </section>
      )}
    </div>
  )
}

function StreamView({ data }: { data: StageData }) {
  const [branch, setBranch] = useState('BR-KK')
  const [selection, setSelection] = useState<Selection>({ kind: 'scenario', id: 'SEVT-01' })
  return (
    <div className="view-grid">
      <div className="panel stream-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Event Stream</div>
            <h2>Shared anchors + branch response</h2>
          </div>
          <select value={branch} onChange={(event) => setBranch(event.target.value)}>
            {LEAVES.map((id) => <option key={id}>{id}</option>)}
          </select>
        </div>
        <div className="stream">
          {data.scenarioEvents.map((scenario) => (
            <div className="stream-group" key={scenario.id}>
              <EventCard
                event={scenario}
                selected={selection?.kind === 'scenario' && selection.id === scenario.id}
                onClick={() => setSelection({ kind: 'scenario', id: scenario.id })}
              />
              <div className="response-stack">
                {responsesFor(data, branch, scenario.id).map((response) => (
                  <EventCard
                    key={response.id}
                    event={response}
                    selected={selection?.kind === 'branch' && selection.id === response.id}
                    onClick={() => setSelection({ kind: 'branch', id: response.id })}
                  />
                ))}
                {!responsesFor(data, branch, scenario.id).length && (
                  <div className="no-response">No branch-generated response in fixture</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel sticky-panel">
        <Inspector data={data} selection={selection} />
      </div>
    </div>
  )
}

function EntityView({ data }: { data: StageData }) {
  const [branch, setBranch] = useState('BR-PK')
  const [entityId, setEntityId] = useState('SEM-2')
  const entity = data.semanticEntities.find((item) => item.id === entityId)
  const semanticHistory = scenarioEntityEvents(data, entityId)
  const branchHistory = branchEntityEvents(data, branch, entityId)
  const mappings = effectiveMappingKeys(data, branch, entityId)
  return (
    <div className="entity-layout">
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Entity Explorer</div>
            <h2>{entity?.name ?? entityId}</h2>
          </div>
          <div className="control-row">
            <select value={entityId} onChange={(event) => setEntityId(event.target.value)}>
              {data.semanticEntities.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}
            </select>
            <select value={branch} onChange={(event) => setBranch(event.target.value)}>
              {LEAVES.map((id) => <option key={id}>{id}</option>)}
            </select>
          </div>
        </div>

        <div className="entity-summary">
          <div className="stat"><span>Semantic events</span><strong>{semanticHistory.length}</strong></div>
          <div className="stat"><span>Related branch events</span><strong>{branchHistory.length}</strong></div>
          <div className="stat"><span>Representation mappings</span><strong>{mappings.length}</strong></div>
        </div>

        <div className="three-col">
          <section>
            <h3>Semantic history</h3>
            {semanticHistory.map((event) => (
              <div className="history-item" key={event.id}>
                <Tag>{event.id}</Tag>
                <strong>{event.title}</strong>
                {(event.semanticMutations ?? []).filter((m) => m.targetId === entityId).map((m, i) => <small key={i}>{m.delta}</small>)}
              </div>
            ))}
            {!semanticHistory.length && <p className="muted">No semantic events in this fixture.</p>}
          </section>

          <section>
            <h3>Related activity / mutation</h3>
            {branchHistory.map((event) => (
              <div className="history-item" key={event.id}>
                <div><Tag>{event.id}</Tag> <Tag>{event.mutations.length ? 'mutation' : 'relation only'}</Tag></div>
                <strong>{event.title}</strong>
                <small>{event.category} · {event.branchScope}</small>
              </div>
            ))}
            {!branchHistory.length && <p className="muted">No branch activity references this entity.</p>}
          </section>

          <section>
            <h3>Representation history</h3>
            {mappings.map((mapping, index) => (
              <div className="history-item" key={`${mapping}-${index}`}>
                <strong>{mapping}</strong>
              </div>
            ))}
            {!mappings.length && <p className="muted">No explicit mapping in this fixture.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

function ResponseMini({ events }: { events: BranchEvent[] }) {
  if (!events.length) return <div className="no-response compact">—</div>
  return (
    <div className="mini-stack">
      {events.map((event) => (
        <div className="mini-event" key={event.id}>
          <span>{event.id}</span>
          <strong>{event.title}</strong>
          <small>{event.operations.length} ops · {event.mutations.length} mutations</small>
        </div>
      ))}
    </div>
  )
}

function CompareView({ data }: { data: StageData }) {
  const [left, setLeft] = useState('BR-KK')
  const [right, setRight] = useState('BR-PK')
  const leftEvents = branchEventsFor(data, left)
  const rightEvents = branchEventsFor(data, right)
  const leftOps = operationCount(data, left)
  const rightOps = operationCount(data, right)
  const leftBreakdown = operationBreakdown(data, left)
  const rightBreakdown = operationBreakdown(data, right)
  const operationTypes = [...new Set([...Object.keys(leftBreakdown), ...Object.keys(rightBreakdown)])].sort()
  return (
    <div className="compare-layout">
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Dynamics Compare</div>
            <h2>Same ScenarioEvents, different branch response</h2>
          </div>
          <div className="control-row">
            <select value={left} onChange={(event) => setLeft(event.target.value)}>{LEAVES.map((id) => <option key={id}>{id}</option>)}</select>
            <span className="versus">vs</span>
            <select value={right} onChange={(event) => setRight(event.target.value)}>{LEAVES.map((id) => <option key={id}>{id}</option>)}</select>
          </div>
        </div>

        <div className="compare-stats">
          <div className="branch-summary">
            <Tag>{left}</Tag>
            <strong>{leftEvents.length} inherited events</strong>
            <span>{leftOps} implementation operations</span>
          </div>
          <div className="comparison-note">Event count is diagnostic, not cost.</div>
          <div className="branch-summary right">
            <Tag>{right}</Tag>
            <strong>{rightEvents.length} inherited events</strong>
            <span>{rightOps} implementation operations</span>
          </div>
        </div>

        <div className="compare-table">
          {data.scenarioEvents.map((scenario) => (
            <div className="compare-row" key={scenario.id}>
              <div className="compare-cell"><ResponseMini events={responsesFor(data, left, scenario.id)} /></div>
              <div className="anchor-cell"><Tag>{scenario.id}</Tag><strong>{scenario.title}</strong></div>
              <div className="compare-cell"><ResponseMini events={responsesFor(data, right, scenario.id)} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="eyebrow">Raw operation evidence</div>
        <h2>Operation-type breakdown</h2>
        <div className="op-grid">
          <strong>Operation</strong><strong>{left}</strong><strong>{right}</strong>
          {operationTypes.map((type) => (
            <div className="op-row" key={type}>
              <code>{type}</code>
              <span>{leftBreakdown[type] ?? 0}</span>
              <span>{rightBreakdown[type] ?? 0}</span>
            </div>
          ))}
        </div>
        <p className="muted">No scalar cost is shown in Stage C yet; this panel deliberately stays on raw evidence.</p>
      </div>
    </div>
  )
}

function App() {
  const [data, setData] = useState<StageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('stream')

  useEffect(() => {
    fetch('/stage_b.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load stage_b.json (${response.status})`)
        return response.json()
      })
      .then(setData)
      .catch((reason) => setError(String(reason)))
  }, [])

  const subtitle = useMemo(() => {
    if (!data) return 'Loading prototype dataset…'
    return `${data.prototypeId} · ${data.scenarioId} · ${data.scenarioEvents.length} shared ScenarioEvents · ${data.branchEvents.length} BranchEvents`
  }, [data])

  if (error) return <main className="shell"><div className="fatal">{error}</div></main>

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Disposable prototype · Stage C</div>
          <h1>Architecture Evolution Explorer</h1>
          <p>{subtitle}</p>
        </div>
        <div className="status-pill">canonical plan unchanged</div>
      </header>

      <nav className="tabs">
        <button className={view === 'stream' ? 'active' : ''} onClick={() => setView('stream')}>Event Stream</button>
        <button className={view === 'entity' ? 'active' : ''} onClick={() => setView('entity')}>Entity Explorer</button>
        <button className={view === 'compare' ? 'active' : ''} onClick={() => setView('compare')}>Dynamics Compare</button>
      </nav>

      {!data ? (
        <div className="panel loading">Loading stage_b.json…</div>
      ) : view === 'stream' ? (
        <StreamView data={data} />
      ) : view === 'entity' ? (
        <EntityView data={data} />
      ) : (
        <CompareView data={data} />
      )}
    </main>
  )
}

export default App
