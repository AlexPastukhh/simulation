import { useMemo, useState } from 'react'
import './App.css'
import {
  BRANCHES,
  alignEventForBranch,
  changedIds,
  changedLayers,
  coveragesForFeature,
  eventById,
  eventDelta,
  requirementsForOwner,
  ruleRequirementIds,
  scenarioRequirementIds,
  screensForWidget,
  snapshotAt,
  timelineForBranch,
  widgetsForScreen,
  type BranchId,
  type LayerId,
  type ProductRequirement,
  type ProductTab,
  type SimulationEvent,
} from './model'

function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'scenario' | 'branch' | 'trigger' | 'done' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

function Delta({ layer, lines }: { layer: LayerId; lines?: string[] }) {
  if (!lines?.length) return null
  return (
    <div className={`delta delta-${layer}`}>
      <strong>THIS EVENT</strong>
      <div>{lines.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}</div>
    </div>
  )
}

function RequirementCard({ requirement, changed }: { requirement: ProductRequirement; changed: boolean }) {
  return (
    <article className={`requirement-card ${changed ? 'changed-now' : ''}`}>
      <div className="card-topline">
        <code>{requirement.id}</code>
        <Tag tone={requirement.trigger && requirement.trigger !== 'user action' ? 'trigger' : 'neutral'}>{requirement.kind}</Tag>
      </div>
      <strong>{requirement.title}</strong>
      <small>{requirement.ownerLabel}</small>
      <p>{requirement.context}</p>
      {requirement.trigger && <div className="trigger-line"><span>trigger</span><b>{requirement.trigger}</b></div>}
      <ul>{requirement.behavior.map((item) => <li key={item}>{item}</li>)}</ul>
      {!!requirement.ruleIds?.length && <div className="rule-links">rules: {requirement.ruleIds.join(', ')}</div>}
    </article>
  )
}

function ProductSurface({
  tab,
  onTab,
  snapshot,
  changed,
  delta,
}: {
  tab: ProductTab
  onTab: (tab: ProductTab) => void
  snapshot: ReturnType<typeof snapshotAt>
  changed: string[]
  delta?: string[]
}) {
  return (
    <section className="state-panel product-panel">
      <div className="state-panel-head">
        <div>
          <div className="eyebrow">Required Product Semantics</div>
          <h2>Requirement Surface</h2>
          <p>Scenario-shared truth. Branch selection must not rewrite these requirements.</p>
        </div>
        <div className="count-badge">{snapshot.requirements.length} requirements</div>
      </div>
      <Delta layer="required" lines={delta} />
      <div className="subtabs">
        {(['scenarios', 'screens', 'widgets', 'requirements', 'rules'] as ProductTab[]).map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => onTab(item)}>{item}</button>
        ))}
      </div>

      {tab === 'scenarios' && (
        <div className="scenario-grid">
          {snapshot.scenarios.map((scenario) => (
            <article className="scenario-card" key={scenario.id}>
              <div className="card-topline"><code>{scenario.id}</code><Tag tone="scenario">{scenario.actor}</Tag></div>
              <strong>{scenario.title}</strong>
              <ol>{scenario.steps.map((step) => (
                <li key={step.id}>
                  <b>{step.label}</b>
                  <span>{[step.screenId, step.widgetId, step.requirementId].filter(Boolean).join(' · ')}</span>
                </li>
              ))}</ol>
              <small>derived requirements: {scenarioRequirementIds(snapshot, scenario.id).join(', ') || 'none'}</small>
            </article>
          ))}
          {!snapshot.scenarios.length && <div className="empty-state">No revealed scenarios yet.</div>}
        </div>
      )}

      {tab === 'screens' && (
        <div className="screen-grid">
          {snapshot.screens.map((screen) => {
            const widgets = widgetsForScreen(snapshot, screen.id)
            const reqs = requirementsForOwner(snapshot, 'screen', screen.id)
            return (
              <article className="screen-card" key={screen.id}>
                <div className="card-topline"><code>{screen.id}</code><Tag>screen</Tag></div>
                <strong>{screen.title}</strong>
                <div className="widget-stack">
                  {widgets.map((widget) => <span key={widget.id}>{widget.title}<small>{screensForWidget(snapshot, widget.id).length > 1 ? 'reused' : ''}</small></span>)}
                </div>
                <small>requirements: {reqs.map((req) => req.id).join(', ') || 'none'}</small>
              </article>
            )
          })}
          {!snapshot.screens.length && <div className="empty-state">No revealed screens yet.</div>}
        </div>
      )}

      {tab === 'widgets' && (
        <div className="widget-grid">
          {snapshot.widgets.map((widget) => {
            const screens = screensForWidget(snapshot, widget.id)
            const reqs = requirementsForOwner(snapshot, 'widget', widget.id)
            return (
              <article className="widget-card" key={widget.id}>
                <div className="card-topline"><code>{widget.id}</code><Tag>widget</Tag></div>
                <strong>{widget.title}</strong>
                <p>used on: {screens.map((screen) => screen.title).join(', ') || 'none'}</p>
                <small>requirements: {reqs.map((req) => req.id).join(', ') || 'none'}</small>
              </article>
            )
          })}
          {!snapshot.widgets.length && <div className="empty-state">No revealed widgets yet.</div>}
        </div>
      )}

      {tab === 'requirements' && (
        <div className="requirements-grid">
          {snapshot.requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} changed={changed.includes(requirement.id)} />
          ))}
          {!snapshot.requirements.length && <div className="empty-state">No revealed requirements yet.</div>}
        </div>
      )}

      {tab === 'rules' && (
        <div className="rules-grid">
          {snapshot.rules.map((rule) => (
            <article className={`rule-card ${changed.includes(rule.id) ? 'changed-now' : ''}`} key={rule.id}>
              <div className="card-topline"><code>{rule.id}</code><Tag>BusinessRule</Tag></div>
              <strong>{rule.title}</strong>
              <p>{rule.statement}</p>
              <small>used by requirements: {ruleRequirementIds(snapshot, rule.id).join(', ') || 'none'}</small>
            </article>
          ))}
          {!snapshot.rules.length && <div className="empty-state">No revealed BusinessRules yet.</div>}
        </div>
      )}
    </section>
  )
}

function FeatureModel({ snapshot, branch, delta, changed }: { snapshot: ReturnType<typeof snapshotAt>; branch: BranchId; delta?: string[]; changed: string[] }) {
  const requirements = new Map(snapshot.requirements.filter((item) => item.kind === 'functional').map((item) => [item.id, item]))
  return (
    <section className={`state-panel compact-panel ${changed.includes('design') ? 'layer-changed' : ''}`}>
      <div className="state-panel-head">
        <div><div className="eyebrow">Branch Functional Design</div><h2>Feature Model</h2></div>
        <Tag tone="branch">{BRANCHES[branch].short}</Tag>
      </div>
      <p className="panel-intro">Feature boundaries belong to the branch, not to the Requirement Surface.</p>
      <Delta layer="design" lines={delta} />
      <div className="feature-stack">
        {snapshot.features.map((feature) => {
          const coverages = coveragesForFeature(snapshot, feature.id)
          return (
            <article className="feature-card" key={feature.id}>
              <div className="card-topline"><code>{feature.id}</code><Tag tone="branch">{feature.mode}</Tag></div>
              <strong>{feature.title}</strong>
              <div className="coverage-row">
                {coverages.map((item) => {
                  const req = requirements.get(item.requirementId)
                  const nonUi = req?.trigger && req.trigger !== 'user action'
                  return <span key={item.id} className={nonUi ? 'non-ui-coverage' : ''}>{item.requirementId} · {item.role}{nonUi ? ' · non-UI' : ''}</span>
                })}
              </div>
              <p>{feature.note}</p>
            </article>
          )
        })}
        {!snapshot.features.length && <div className="empty-state">No branch Feature Model chosen yet.</div>}
      </div>
    </section>
  )
}

function CurrentRealization({ snapshot, delta, changed }: { snapshot: ReturnType<typeof snapshotAt>; delta?: string[]; changed: string[] }) {
  return (
    <section className={`state-panel compact-panel ${changed.includes('current') ? 'layer-changed' : ''}`}>
      <div className="state-panel-head"><div><div className="eyebrow">Current Realization</div><h2>Conceptual implementation</h2></div><div className="count-badge">{snapshot.realization.length} units</div></div>
      <p className="panel-intro">What exists now — not what is merely required or planned.</p>
      <Delta layer="current" lines={delta} />
      <div className="realization-stack">
        {snapshot.realization.map((unit) => (
          <article className="realization-card" key={unit.id}>
            <code>{unit.id}</code><strong>{unit.title}</strong><p>{unit.detail}</p><small>represents: {unit.fulfills.join(', ')}</small>
          </article>
        ))}
        {!snapshot.realization.length && <div className="empty-state">No implementation represented at this point.</div>}
      </div>
    </section>
  )
}

function TeamPlan({ snapshot, delta, changed }: { snapshot: ReturnType<typeof snapshotAt>; delta?: string[]; changed: string[] }) {
  return (
    <section className={`state-panel compact-panel ${changed.includes('plan') ? 'layer-changed' : ''}`}>
      <div className="state-panel-head"><div><div className="eyebrow">Team Plan</div><h2>Intended work</h2></div><div className="count-badge">{snapshot.plan.filter((item) => item.status === 'planned').length} open</div></div>
      <p className="panel-intro">A plan can change without pretending implementation already happened.</p>
      <Delta layer="plan" lines={delta} />
      <div className="plan-stack">
        {snapshot.plan.map((item) => (
          <article className={`plan-card status-${item.status}`} key={item.id}>
            <div className="card-topline"><code>{item.id}</code><Tag tone={item.status === 'done' ? 'done' : 'neutral'}>{item.status}</Tag></div>
            <strong>{item.title}</strong><p>{item.detail}</p>
          </article>
        ))}
        {!snapshot.plan.length && <div className="empty-state">No recorded plan at this point.</div>}
      </div>
    </section>
  )
}

function RawEventFacts({ event }: { event: SimulationEvent }) {
  return (
    <details className="raw-event">
      <summary>Canonical event facts · {event.mutations.length} mutations · {event.relations.length} relations</summary>
      {!!event.triggeredBy?.length && <p><b>triggered by:</b> {event.triggeredBy.join(', ')}</p>}
      {!!event.relations.length && <ul>{event.relations.map((rel, index) => <li key={`${rel.type}-${index}`}>{rel.type}: {rel.fromId} → {rel.toId}{rel.note ? ` · ${rel.note}` : ''}</li>)}</ul>}
      <ul>{event.mutations.map((mutation, index) => <li key={`${mutation.targetId}-${index}`}><b>{mutation.layer}</b> · {mutation.collection} · {mutation.op} {mutation.targetId} · {mutation.delta}</li>)}</ul>
    </details>
  )
}

function EventRail({ events, selectedEventId, onSelect }: { events: SimulationEvent[]; selectedEventId: string; onSelect: (id: string) => void }) {
  const selectedIndex = events.findIndex((event) => event.id === selectedEventId)
  return (
    <aside className="event-rail">
      <div className="event-rail-head">
        <div className="eyebrow">Event History</div>
        <h2>Time cursor</h2>
        <p>Full history visible · replay mode</p>
      </div>
      <div className="event-list">
        {events.map((event, index) => {
          const selected = event.id === selectedEventId
          const past = index < selectedIndex
          const future = index > selectedIndex
          const layers = changedLayers(event.id)
          return (
            <button
              key={event.id}
              className={`timeline-event ${selected ? 'selected' : ''} ${past ? 'past' : ''} ${future ? 'future' : ''} ${event.scope}`}
              onClick={() => onSelect(event.id)}
            >
              <span className="event-dot" />
              <div className="event-card-head"><code>{event.id}</code><Tag tone={event.scope}>{event.scope}</Tag><Tag>{event.role}</Tag></div>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
              <small>{layers.join(' + ') || 'relation only'}</small>
              {selected && <span className="now-marker">NOW</span>}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default function App() {
  const [branch, setBranch] = useState<BranchId>('shared')
  const [selectedEventId, setSelectedEventId] = useState('B-SH-INIT-IMPL')
  const [tab, setTab] = useState<ProductTab>('requirements')
  const events = useMemo(() => timelineForBranch(branch), [branch])
  const selectedEvent = eventById(selectedEventId)
  const selectedIndex = events.findIndex((event) => event.id === selectedEventId)
  const snapshot = useMemo(() => snapshotAt(branch, selectedEventId), [branch, selectedEventId])
  const deltas = eventDelta(selectedEventId)
  const changed = changedIds(selectedEventId)
  const layers = changedLayers(selectedEventId)

  const switchBranch = (nextBranch: BranchId) => {
    const aligned = alignEventForBranch(selectedEventId, nextBranch)
    setBranch(nextBranch)
    setSelectedEventId(aligned)
  }

  const move = (offset: number) => {
    const next = events[Math.max(0, Math.min(events.length - 1, selectedIndex + offset))]
    if (next) setSelectedEventId(next.id)
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">PT-002 · Requirement Surface / Feature Model</div>
          <h1>Architecture Evolution State Canvas</h1>
          <p>Same requirements. Different correct functional decomposition. Event-controlled replay.</p>
        </div>
        <div className="mode-pill">REPLAY MODE · future visible</div>
      </header>

      <section className="control-bar">
        <div className="branch-control">
          <span>Architecture branch</span>
          {(Object.keys(BRANCHES) as BranchId[]).map((id) => (
            <button key={id} className={branch === id ? 'active' : ''} onClick={() => switchBranch(id)}>{BRANCHES[id].label}</button>
          ))}
        </div>
        <div className="time-control">
          <button disabled={selectedIndex <= 0} onClick={() => move(-1)}>←</button>
          <div><strong>T{selectedIndex + 1} · after {selectedEvent.id}</strong><span>{selectedIndex + 1}/{events.length} applied</span></div>
          <button disabled={selectedIndex >= events.length - 1} onClick={() => move(1)}>→</button>
        </div>
      </section>

      <section className="branch-explainer">
        <strong>{BRANCHES[branch].short}</strong>
        <span>{BRANCHES[branch].description}</span>
        <b>Requirement Surface stays identical across branches.</b>
      </section>

      <div className="workbench">
        <section className="state-canvas">
          <div className="canvas-head"><div><div className="eyebrow">System State at T{selectedIndex + 1}</div><h2>Accumulated state + selected-event delta</h2></div><div className="selected-event-summary"><span>{selectedEvent.id}</span><strong>{selectedEvent.title}</strong></div></div>
          <ProductSurface tab={tab} onTab={setTab} snapshot={snapshot} changed={changed} delta={deltas.required} />
          <div className="secondary-grid">
            <FeatureModel snapshot={snapshot} branch={branch} delta={deltas.design} changed={layers} />
            <CurrentRealization snapshot={snapshot} delta={deltas.current} changed={layers} />
            <TeamPlan snapshot={snapshot} delta={deltas.plan} changed={layers} />
          </div>
          <RawEventFacts event={selectedEvent} />
        </section>
        <EventRail events={events} selectedEventId={selectedEventId} onSelect={setSelectedEventId} />
      </div>
    </main>
  )
}
