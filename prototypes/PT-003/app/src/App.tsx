import { useMemo, useState } from 'react'
import './App.css'
import {
  ARCHITECTURES,
  EVOLUTION_OPTIONS,
  alignEventForArchitecture,
  actualStateAt,
  compareRevisions,
  eventById,
  eventDeltas,
  optionStatusAt,
  planKnowledge,
  revisionById,
  revisionsAvailableAt,
  selectedPlannedSnapshot,
  snapshotById,
  stepByRef,
  timelineForArchitecture,
  type ActualEvent,
  type ArchitectureId,
  type ArchitectureSnapshot,
  type EvolutionStepVersion,
  type RequirementMaterialBlock,
  type RevisionDiffItem,
} from './model'

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'actual' | 'plan' | 'new' | 'warning' | 'good' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function RequirementCard({ item }: { item: RequirementMaterialBlock }) {
  return (
    <article className={`requirement-card form-${item.form}`}>
      <div className="card-topline"><code>{item.ref}</code><Badge>{item.form}</Badge></div>
      <strong>{item.title}</strong>
      <small>{item.context}</small>
      <ul>{item.lines.map((line) => <li key={line}>{line}</li>)}</ul>
      {(item.effective || item.status) && <div className="meta-row">{item.status && <span>{item.status}</span>}{item.effective && <span>effective: {item.effective}</span>}</div>}
    </article>
  )
}

function ArchitectureView({ snapshot, label, tone = 'actual' }: { snapshot: ArchitectureSnapshot; label: string; tone?: 'actual' | 'plan' }) {
  return (
    <section className={`panel architecture-panel ${tone}`}>
      <div className="panel-head">
        <div><div className="eyebrow">{label}</div><h2>{snapshot.title}</h2><p>{snapshot.summary}</p></div>
        <Badge tone={tone}>{snapshot.id}</Badge>
      </div>
      <div className="bru-grid">
        {snapshot.brus.map((unit) => (
          <article className="bru-card" key={unit.id}>
            <div className="card-topline"><code>{unit.id}</code><Badge>{unit.provenance ?? 'existing'}</Badge></div>
            <strong>{unit.title}</strong>
            <ul>{unit.responsibility.map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="trace-list">{unit.requirementRefs.map((ref) => <span key={ref}>{ref}</span>)}</div>
          </article>
        ))}
      </div>
      {!!snapshot.dependencies.length && (
        <div className="dependency-list">
          {snapshot.dependencies.map((dep) => <span key={`${dep.from}-${dep.to}-${dep.label}`}><code>{dep.from}</code> → <code>{dep.to}</code> · {dep.label}</span>)}
        </div>
      )}
      {!!snapshot.notes.length && <div className="snapshot-notes">{snapshot.notes.map((note) => <span key={note}>{note}</span>)}</div>}
    </section>
  )
}

function diffStatusForStep(diff: RevisionDiffItem[], stepRef: string) {
  return diff.find((item) => item.toRef === stepRef)?.kind
}

function StepButton({
  step,
  selected,
  status,
  realized,
  onClick,
}: {
  step: EvolutionStepVersion
  selected: boolean
  status?: RevisionDiffItem['kind']
  realized: boolean
  onClick: () => void
}) {
  return (
    <button className={`step-button ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="step-button-top"><code>{step.ref}</code>{realized ? <Badge tone="actual">realized</Badge> : status ? <Badge tone={status === 'reused' ? 'good' : status === 'revised' ? 'warning' : 'new'}>{status}</Badge> : <Badge tone="plan">planned</Badge>}</div>
      <strong>{step.title}</strong>
      <small>{step.targetSnapshotRef}</small>
    </button>
  )
}

function PlanWorkbench({
  architectureId,
  actualEventId,
  selectedRevisionId,
  onRevision,
}: {
  architectureId: ArchitectureId
  actualEventId: string
  selectedRevisionId?: string
  onRevision: (id: string) => void
}) {
  const state = actualStateAt(architectureId, actualEventId)
  const revisions = revisionsAvailableAt(architectureId, actualEventId)
  const revision = selectedRevisionId ? revisionById(selectedRevisionId) : undefined
  const [selectedStepRef, setSelectedStepRef] = useState<string | undefined>()
  const effectiveStepRef = revision && selectedStepRef && revision.stepVersionRefs.includes(selectedStepRef) ? selectedStepRef : undefined

  if (!revision) {
    return (
      <section className="panel plan-panel empty-plan">
        <div className="eyebrow">Planned evolution</div>
        <h2>No plan revision exists yet</h2>
        <p>Select the Planning Event that creates R1.</p>
      </section>
    )
  }

  const baseEvent = eventById(revision.basedOnActualEventId)
  const baseKnowledge = planKnowledge(revision.id)
  const plannedSnapshot = selectedPlannedSnapshot(revision.id, effectiveStepRef)
  const parentDiff = revision.parentRevisionId ? compareRevisions(revision.parentRevisionId, revision.id) : []
  const selectedStep = effectiveStepRef ? stepByRef(effectiveStepRef) : undefined
  const currentEvent = eventById(actualEventId)
  const disruption = revision.parentRevisionId ? parentDiff : []
  const counts = Object.fromEntries(['realized', 'reused', 'revised', 'inserted', 'removed'].map((kind) => [kind, disruption.filter((item) => item.kind === kind).length]))

  return (
    <section className="plan-workbench">
      <section className="panel plan-panel">
        <div className="panel-head plan-head">
          <div>
            <div className="eyebrow">Evolution Map Revision</div>
            <h2>{revision.label}</h2>
            <p>Stored BASE is immutable. CURRENT may move independently as factual implementation progresses.</p>
          </div>
          <select value={revision.id} onChange={(event) => { setSelectedStepRef(undefined); onRevision(event.target.value) }}>
            {revisions.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
          </select>
        </div>

        <div className="base-current-row">
          <article>
            <span>PLAN BASE</span>
            <strong>{revision.baseArchitectureSnapshotRef}</strong>
            <small>based on {baseEvent.id} · {baseEvent.title}</small>
          </article>
          <div className="arrow">≠</div>
          <article>
            <span>ACTUAL CURRENT @ {currentEvent.id}</span>
            <strong>{state.currentArchitectureSnapshotRef}</strong>
            <small>{currentEvent.title}</small>
          </article>
        </div>

        <div className="knowledge-strip">
          <strong>Plan knowledge @ BASE</strong>
          <span>{baseKnowledge.length} material blocks</span>
          <span>actual cursor knows {state.requirements.length}</span>
          {state.requirements.length > baseKnowledge.length && <Badge tone="warning">later knowledge excluded from historical plan</Badge>}
        </div>

        {!!revision.parentRevisionId && (
          <div className="disruption-row">
            <span>vs {revision.parentRevisionId}</span>
            {Object.entries(counts).map(([kind, count]) => <b key={kind} className={`diff-${kind}`}>{kind} {count}</b>)}
          </div>
        )}

        <div className="map-row">
          <button className={`base-node ${!effectiveStepRef ? 'selected' : ''}`} onClick={() => setSelectedStepRef(undefined)}>
            <code>BASE</code><strong>{revision.baseArchitectureSnapshotRef}</strong><small>{revision.basedOnActualEventId}</small>
          </button>
          {revision.stepVersionRefs.map((ref) => {
            const item = stepByRef(ref)
            const realized = item.realizedByEventId ? eventById(item.realizedByEventId).logicalOrder <= currentEvent.logicalOrder : false
            return <StepButton key={ref} step={item} selected={effectiveStepRef === ref} status={diffStatusForStep(parentDiff, ref)} realized={realized} onClick={() => setSelectedStepRef(ref)} />
          })}
        </div>

        {selectedStep && (
          <div className="step-inspector">
            <div><strong>{selectedStep.ref}</strong>{selectedStep.revisedFrom && <span>REVISED_FROM {selectedStep.revisedFrom}</span>}</div>
            <p>{selectedStep.rationale}</p>
            <div className="impact-grid">
              {selectedStep.impacts.map((impact) => <article key={`${impact.targetId}-${impact.change}`}><Badge tone="plan">{impact.change}</Badge><code>{impact.targetId}</code><span>{impact.description}</span></article>)}
            </div>
          </div>
        )}
      </section>

      <ArchitectureView snapshot={plannedSnapshot} label={selectedStep ? `PLANNED SNAPSHOT after ${selectedStep.ref}` : `PLAN BASE snapshot @ ${revision.basedOnActualEventId}`} tone="plan" />
    </section>
  )
}

function EvolutionOptions({ architectureId, eventId }: { architectureId: ArchitectureId; eventId: string }) {
  return (
    <section className="panel option-panel">
      <div className="panel-head"><div><div className="eyebrow">Known uncertainty</div><h2>Evolution Options</h2><p>An option is not a planned Step until factual trigger + Planning Event instantiate it.</p></div></div>
      <div className="option-grid">
        {EVOLUTION_OPTIONS.map((option) => {
          const status = optionStatusAt(architectureId, eventId, option.id) ?? 'known'
          return (
            <article key={option.id}>
              <div className="card-topline"><code>{option.id}</code><Badge tone={status === 'known' ? 'neutral' : status === 'triggered' ? 'warning' : 'good'}>{status}</Badge></div>
              <strong>{option.title}</strong>
              <p><b>trigger:</b> {option.trigger}</p>
              <p>{option.intendedTransformation}</p>
              <small>expected unaffected: {option.expectedUnaffected.join(', ')}</small>
              {status === 'instantiated' && <div className="instantiated">instantiated as {option.instantiatedStepByArchitecture[architectureId]}</div>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function EventRail({ events, selectedId, onSelect }: { events: ActualEvent[]; selectedId: string; onSelect: (id: string) => void }) {
  const selected = eventById(selectedId)
  return (
    <aside className="event-rail">
      <div className="event-rail-head"><div className="eyebrow">Actual Event History</div><h2>Factual cursor</h2><p>Planned steps never advance this cursor by themselves.</p></div>
      <div className="event-list">
        {events.map((event) => {
          const state = event.logicalOrder < selected.logicalOrder ? 'past' : event.logicalOrder > selected.logicalOrder ? 'future' : 'selected'
          return (
            <button key={event.id} className={`event-card ${state} ${event.scope}`} onClick={() => onSelect(event.id)}>
              <div className="event-card-head"><code>{event.id}</code><Badge tone={event.scope === 'shared' ? 'actual' : 'plan'}>{event.scope}</Badge><Badge>{event.role}</Badge></div>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
              <small>{eventDeltas(event.id).join(' · ')}</small>
              {state === 'selected' && <span className="cursor-marker">CURRENT CURSOR</span>}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default function App() {
  const [architectureId, setArchitectureId] = useState<ArchitectureId>('policyEarly')
  const [actualEventId, setActualEventId] = useState('A-E05')
  const state = useMemo(() => actualStateAt(architectureId, actualEventId), [architectureId, actualEventId])
  const timeline = useMemo(() => timelineForArchitecture(architectureId), [architectureId])
  const revisions = useMemo(() => revisionsAvailableAt(architectureId, actualEventId), [architectureId, actualEventId])
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>('A-R1')
  const validRevisionIds = new Set(revisions.map((item) => item.id))
  const effectiveRevisionId = selectedRevisionId && validRevisionIds.has(selectedRevisionId) ? selectedRevisionId : state.activePlanRevisionId
  const currentSnapshot = snapshotById(state.currentArchitectureSnapshotRef)
  const selectedEvent = eventById(actualEventId)

  const switchArchitecture = (next: ArchitectureId) => {
    const alignedEvent = alignEventForArchitecture(actualEventId, next)
    setArchitectureId(next)
    setActualEventId(alignedEvent)
    const nextState = actualStateAt(next, alignedEvent)
    setSelectedRevisionId(nextState.activePlanRevisionId)
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">PT-003 · Requirement / Architecture / Evolution Map</div>
          <h1>Actual history and planned evolution without hindsight</h1>
          <p>One non-normalized Requirement Model. Factual CURRENT. Immutable plan BASE. Versioned planned Steps.</p>
        </div>
        <Badge tone="actual">prototype · no VE promotion</Badge>
      </header>

      <section className="control-bar">
        <div className="architecture-control">
          <span>Architecture alternative</span>
          {(Object.keys(ARCHITECTURES) as ArchitectureId[]).map((id) => <button key={id} className={architectureId === id ? 'active' : ''} onClick={() => switchArchitecture(id)}>{ARCHITECTURES[id].short}</button>)}
        </div>
        <div className="cursor-summary"><span>ACTUAL CURSOR</span><strong>{selectedEvent.id} · {selectedEvent.title}</strong><small>CURRENT = {state.currentArchitectureSnapshotRef}</small></div>
      </section>

      <section className="architecture-explainer"><strong>{ARCHITECTURES[architectureId].label}</strong><span>{ARCHITECTURES[architectureId].description}</span><b>Requirement truth is shared at aligned factual cursors.</b></section>

      <div className="workbench">
        <section className="main-canvas">
          <section className="panel requirement-panel">
            <div className="panel-head"><div><div className="eyebrow">Requirement Model @ {selectedEvent.id}</div><h2>Known product material</h2><p>Non-normalized factual knowledge. Selecting a planned Step does not change this model.</p></div><Badge tone="actual">{state.requirements.length} blocks</Badge></div>
            <div className="requirement-grid">{state.requirements.map((item) => <RequirementCard item={item} key={item.ref} />)}</div>
          </section>

          <ArchitectureView snapshot={currentSnapshot} label={`FACTUAL CURRENT @ ${selectedEvent.id}`} />

          <PlanWorkbench architectureId={architectureId} actualEventId={actualEventId} selectedRevisionId={effectiveRevisionId} onRevision={setSelectedRevisionId} />

          <EvolutionOptions architectureId={architectureId} eventId={actualEventId} />
        </section>

        <EventRail events={timeline} selectedId={actualEventId} onSelect={setActualEventId} />
      </div>
    </main>
  )
}
