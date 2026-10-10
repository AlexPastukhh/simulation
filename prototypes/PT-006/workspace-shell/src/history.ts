import type { Branch, ContentStore, DemoStore, SchemaNode } from './content.ts'
import type { ContentKind } from './workspace.ts'
import { EXTRA_SOURCES } from './extraContent.ts'
import { applyFixtureMaterial } from './material.ts'

export type HistoryFrame = { eventId: string; date: string; state: ContentStore }
export type PlanRevision = {
  id: string; eventId: string; parentId: string | null; plan: ContentStore['plan']
  base: { eventId: string; requirements: ContentStore['requirements']; architecture: ContentStore['architecture']; implementation: ContentStore['implementation'] }
  snapshots: ContentStore['architecture']['snapshots']; impacts: ContentStore['impact']['records']
  fileEffects: ContentStore['implementation']['plannedEffects']; fitness: ContentStore['fitness']
}
export type HistoryStore = { version: 1; origin: 'scripted-fixture'; imported: boolean; selectedRevisionId: string | null; frames: HistoryFrame[]; revisions: PlanRevision[] }
export type StateChange = { op: 'add' | 'remove' | 'replace' | 'reorder'; path: string; entityRef?: string; before?: unknown; after?: unknown }
const copy = <T,>(value: T): T => structuredClone(value)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

/** Prepared event-linked facts, not inferred history of a user's local edits. */
export function createFixtureHistory(seed: ContentStore, branch: Branch): HistoryStore {
  const dates = ['2026-03-12', '2026-03-20', '2026-04-01', '2026-04-05', '2026-05-16']
  const frames: HistoryFrame[] = seed.events.records.map((event, index) => {
    const state = copy(seed)
    state.events = { records: copy(seed.events.records.slice(0, index + 1)), selectedId: event.id }
    state.requirements.items = state.requirements.items.filter(r => state.events.records.some(e => e.id === r.knownFrom))
    state.work.episodes = state.work.episodes.slice(0, index === 0 ? 0 : index < 3 ? 1 : index === 3 ? 2 : undefined)
    state.work.actualHotPaths = index === 0 ? [] : state.work.actualHotPaths.map(p => ({ ...p, touches: index < 3 ? 1 : p.touches }))
    if (index === 0) {
      const initial = branch + '-INITIAL'
      state.architecture.currentRef = initial
      state.architecture.selectedRef = initial
      state.architecture.snapshots = [{ id: initial, title: 'Исходная архитектура · 12 марта',
        responsibilities: branch === 'A' ? [
          { id: 'UI', name: 'Booking UI + rules', concern: 'Форма и правила бронирования' },
          { id: 'DATA', name: 'Persistence', concern: 'Доступ к данным' },
        ] : [
          { id: 'ALL', name: 'App Core', concern: 'Исходная форма и правила; аудит ещё не добавлен' },
          { id: 'DATA', name: 'Storage', concern: 'Исходный доступ к данным' },
        ], connections: [{ from: branch === 'A' ? 'UI' : 'ALL', to: 'DATA' }] }]
      state.implementation.files = branch === 'A' ? [
        { path: 'src/ui/booking.tsx', responsibility: 'UI', status: 'current' },
        { path: 'src/booking.ts', responsibility: 'UI', status: 'current' },
        { path: 'src/data/repo.ts', responsibility: 'DATA', status: 'current' },
      ] : [
        { path: 'src/app.ts', responsibility: 'ALL', status: 'current' },
        { path: 'src/legacy-storage.ts', responsibility: 'DATA', status: 'current' },
      ]
      state.plan = { revision: 'PLAN-' + branch + '-R0', basedOnActualEventRef: event.id, selectedStepId: 'S0',
        steps: [{ id: 'S0', title: 'Уточнить реализацию бронирования', date: '20 мар', route: 'BASE', condition: 'Без условия', targetSnapshotRef: initial, impactRef: 'I0', implementationEffect: 'Подготовить правила и аудит бронирования' }],
        anticipatedEvents: [], changeAxes: [], deadline: { title: 'Первый релиз бронирования', date: '15 апр' } }
      state.impact = { selectedImpactId: 'I0', records: [{ id: 'I0', stepId: 'S0', route: 'BASE', targetRefs: [branch === 'A' ? 'UI' : 'ALL'], filePaths: [branch === 'A' ? 'src/booking.ts' : 'src/app.ts'], reason: 'Исходный план работ' }] }
      state.implementation.plannedEffects = []
      state.fitness.assessments = []
      state.trace.links = state.trace.links.filter(link => link.requirementId !== 'R-A3').map(link => branch === 'A' ? { ...link, architectureRef: 'UI', filePath: 'src/booking.ts' } : link)
    } else if (index < 3) {
      state.plan.revision = 'PLAN-' + branch + '-R1'
      state.plan.basedOnActualEventRef = branch + '-02'
      state.plan.anticipatedEvents = [{ id: 'F1', date: '01 апр', title: 'Возможен корпоративный контракт', consequence: 'Возможная новая потребность; ещё не фактическое требование' }]
      state.plan.deadline = { title: 'Первый корпоративный релиз', date: '30 апр' }
      state.trace.links = state.trace.links.filter(link => link.requirementId !== 'R-A3')
    }
    if (seed.plan.materialVersion === 1) applyFixtureMaterial(state, branch)
    return { eventId: event.id, date: dates[index], state }
  })
  const revisions: PlanRevision[] = []
  for (const frame of frames) {
    if (revisions.at(-1)?.id === frame.state.plan.revision) continue
    const baseFrame = frames.find(f => f.eventId === frame.state.plan.basedOnActualEventRef)!
    const baseArchitecture = copy(baseFrame.state.architecture)
    baseArchitecture.snapshots = baseArchitecture.snapshots.filter(s => s.id === baseArchitecture.currentRef)
    baseArchitecture.selectedRef = baseArchitecture.currentRef
    revisions.push({ id: frame.state.plan.revision, eventId: frame.eventId, parentId: revisions.at(-1)?.id ?? null,
      plan: copy(frame.state.plan), base: { eventId: baseFrame.eventId, requirements: copy(baseFrame.state.requirements), architecture: baseArchitecture, implementation: { files: copy(baseFrame.state.implementation.files), plannedEffects: [] } },
      snapshots: copy(frame.state.architecture.snapshots), impacts: copy(frame.state.impact.records), fileEffects: copy(frame.state.implementation.plannedEffects), fitness: copy(frame.state.fitness) })
  }
  return { version: 1, origin: 'scripted-fixture', imported: false, selectedRevisionId: null, frames, revisions }
}

export function historySchema(schemas: Record<ContentKind, SchemaNode>): SchemaNode {
  const str = { type: 'string' }, nullable = { type: ['string', 'null'] }
  const frame = { type: 'object', required: ['eventId', 'date', 'state'], properties: { eventId: str, date: str, state: { type: 'object', required: Object.keys(schemas), properties: schemas } } }
  const revision = { type: 'object', required: ['id', 'eventId', 'parentId', 'plan', 'base', 'snapshots', 'impacts', 'fileEffects', 'fitness'], properties: {
    id: str, eventId: str, parentId: nullable, plan: schemas.plan,
    base: { type: 'object', required: ['eventId', 'requirements', 'architecture', 'implementation'], properties: { eventId: str, requirements: schemas.requirements, architecture: schemas.architecture, implementation: schemas.implementation } },
    snapshots: schemas.architecture.properties!.snapshots, impacts: schemas.impact.properties!.records, fileEffects: schemas.implementation.properties!.plannedEffects, fitness: schemas.fitness,
  } }
  return { type: 'object', required: ['version', 'origin', 'imported', 'selectedRevisionId', 'frames', 'revisions'], properties: {
    version: { type: 'integer' }, origin: { type: 'string', enum: ['scripted-fixture'] }, imported: { type: 'boolean' }, selectedRevisionId: nullable,
    frames: { type: 'array', items: frame }, revisions: { type: 'array', items: revision },
  } }
}

/** Full factual projection at an archived event. UI selections are not replayed as facts. */
export function atCursor(live: DemoStore): { data: DemoStore; available: boolean; historical: boolean; message: string } {
  const latest = live.history.frames.at(-1)
  const selected = live.events.selectedId ?? latest?.eventId
  const frame = live.history.frames.find(f => f.eventId === selected)
  const event = live.events.records.find(e => e.id === selected)
  const archivedEvent = frame?.state.events.records.at(-1)
  if (live.events.selectedId === null || (selected === latest?.eventId && same(event, archivedEvent))) return { data: { ...live, viewContext: { navigationEvents: live.events.records, factualLatest: true } }, available: true, historical: false, message: 'Последний State · прямые правки не создают фактические события' }
  if (!frame || !event || !same(event, archivedEvent)) return { data: live, available: false, historical: true, message: 'Для этого события нет соответствующего сохранённого снимка. Другой State не подставляется.' }
  const data: DemoStore = { ...copy(frame.state), history: live.history, viewContext: { navigationEvents: copy(live.events.records), factualLatest: false } }
  data.events.selectedId = selected ?? null
  for (const kind of Object.keys(EXTRA_SOURCES) as (keyof typeof EXTRA_SOURCES)[]) {
    if (kind !== 'scenario' && kind !== 'trace') Object.assign(data, { [kind]: copy(live[kind]) })
  }
  data.current = copy(live.current)
  data.trace.selectedRequirementId = live.trace.selectedRequirementId
  data.architecture.selectedRef = data.architecture.snapshots.some(s => s.id === live.architecture.selectedRef) ? live.architecture.selectedRef : data.architecture.currentRef
  data.architecture.selectedContext = live.architecture.selectedContext
  data.plan.selectedStepId = data.plan.steps.some(s => s.id === live.plan.selectedStepId) ? live.plan.selectedStepId : data.plan.steps[0]?.id ?? ''
  data.architecturePlan.selectedStepId = data.plan.steps.some(s => s.id === live.architecturePlan.selectedStepId) ? live.architecturePlan.selectedStepId : data.plan.steps[0]?.id ?? ''
  data.impact.selectedImpactId = data.impact.records.some(i => i.id === live.impact.selectedImpactId) ? live.impact.selectedImpactId : data.impact.records[0]?.id ?? ''
  return { data, available: true, historical: true, message: 'Сохранённый State после ' + selected + ' · только просмотр' }
}

/** Viewing an old PlanRevision never changes the factual cursor or CURRENT. */
export function plannedView(data: DemoStore): DemoStore {
  const revision = data.history.revisions.find(r => r.id === data.history.selectedRevisionId)
  if (!revision) return data
  const plan = copy(revision.plan)
  plan.selectedStepId = plan.steps.some(s => s.id === data.plan.selectedStepId) ? data.plan.selectedStepId : plan.steps[0]?.id ?? ''
  const architecture = { ...data.architecture }
  const selectedContext = architecture.selectedContext ?? (architecture.selectedRef === architecture.currentRef ? 'actual' : 'planned')
  if (selectedContext === 'planned' && !revision.snapshots.some(s => s.id === architecture.selectedRef)) architecture.selectedRef = plan.steps.find(s => s.id === plan.selectedStepId)?.targetSnapshotRef ?? ''
  return { ...data, plan, architecture, viewContext: { ...data.viewContext, plannedSnapshots: copy(revision.snapshots) },
    architecturePlan: { ...data.architecturePlan, selectedStepId: plan.steps.some(s => s.id === data.architecturePlan.selectedStepId) ? data.architecturePlan.selectedStepId : plan.selectedStepId },
    impact: { records: copy(revision.impacts), selectedImpactId: revision.impacts.some(r => r.id === data.impact.selectedImpactId) ? data.impact.selectedImpactId : revision.impacts[0]?.id ?? '' },
    implementation: { ...data.implementation, plannedEffects: copy(revision.fileEffects) }, fitness: copy(revision.fitness) }
}

export function navigationEvents(data: DemoStore) { return data.viewContext?.navigationEvents ?? data.events.records }
export function planningSnapshots(data: DemoStore) { return data.viewContext?.plannedSnapshots ?? data.architecture.snapshots }
export function resolveSnapshot(data: DemoStore, ref: string, context: 'actual' | 'planned') {
  return context === 'actual' ? data.architecture.snapshots.find(s => s.id === ref && ref === data.architecture.currentRef) : planningSnapshots(data).find(s => s.id === ref)
}

const ORDERED_COLLECTIONS = new Set(['events.records', 'plan.steps', 'plan.activities'])

export function diffState(before: unknown, after: unknown, path = '$', entityRef?: string): StateChange[] {
  if (same(before, after)) return []
  if (Array.isArray(before) && Array.isArray(after)) {
    const items = [...before, ...after]
    const key = ['id', 'path'].find(k => items.length > 0 && items.every(v => object(v) && typeof v[k] === 'string') && [before, after].every(a => new Set(a.map(v => v[k])).size === a.length))
    if (key) {
      const refs = [...new Set(items.map(v => String(v[key])))]
      const changes = refs.flatMap(ref => diffState(before.find(v => v[key] === ref), after.find(v => v[key] === ref), path + '[' + key + '=' + ref + ']', ref))
      if (ORDERED_COLLECTIONS.has(path.replace(/^\$\./, ''))) {
        const prior = before.map(v => String(v[key])), next = after.map(v => String(v[key]))
        if (!same(prior.filter(id => next.includes(id)), next.filter(id => prior.includes(id)))) changes.unshift({ op: 'reorder', path: path + '.$order', before: prior, after: next })
      }
      return changes
    }
    return Array.from({ length: Math.max(before.length, after.length) }, (_, i) => i).flatMap(i => diffState(before[i], after[i], path + '[' + i + ']', entityRef))
  }
  if (object(before) && object(after)) return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(key => diffState(before[key], after[key], path + '.' + key, entityRef))
  if (before === undefined) return [{ op: 'add', path, entityRef, after: copy(after) }]
  if (after === undefined) return [{ op: 'remove', path, entityRef, before: copy(before) }]
  return [{ op: 'replace', path, entityRef, before: copy(before), after: copy(after) }]
}

/** Excludes selection/configuration fields from simulation State history. */
export function factualValue(state: ContentStore, kind: ContentKind): unknown {
  if (kind in EXTRA_SOURCES && kind !== 'scenario' && kind !== 'trace') return {}
  const value = copy(state[kind]) as Record<string, unknown>
  for (const key of ['selectedId', 'selectedRef', 'selectedContext', 'selectedStepId', 'selectedImpactId', 'selectedRequirementId', 'selectedAnchorId']) delete value[key]
  return value
}
export function historySources(kind: ContentKind): ContentKind[] {
  if (kind === 'scenario') return ['scenario']
  if (kind === 'trace') return ['trace', ...EXTRA_SOURCES.trace]
  return kind in EXTRA_SOURCES ? EXTRA_SOURCES[kind as keyof typeof EXTRA_SOURCES] : [kind]
}
export function changesFor(data: DemoStore, kind: ContentKind, index: number): StateChange[] {
  const frame = data.history.frames[index]
  if (!frame) return []
  const previous = data.history.frames[index - 1]
  return historySources(kind).flatMap(source => diffState(previous ? factualValue(previous.state, source) : undefined, factualValue(frame.state, source), source))
}
export function actualImpacts(data: DemoStore, target: string): Array<{ eventId: string; changes: StateChange[] }> {
  const cursor = data.events.selectedId ?? data.history.frames.at(-1)?.eventId
  const index = data.history.frames.findIndex(frame => frame.eventId === cursor)
  const frames = cursor === data.history.frames.at(-1)?.eventId || data.viewContext?.factualLatest ? data.history.frames : data.history.frames.slice(0, index + 1)
  return frames.flatMap((frame, index) => {
    const previous = data.history.frames[index - 1]
    if (!previous) return []
    const before = { architecture: previous.state.architecture.snapshots.find(s => s.id === previous.state.architecture.currentRef), files: previous.state.implementation.files }
    const after = { architecture: frame.state.architecture.snapshots.find(s => s.id === frame.state.architecture.currentRef), files: frame.state.implementation.files }
    const changes = diffState(before, after)
      .filter(change => change.entityRef === target || [change.before, change.after].some(v => object(v) && (v.id === target || v.path === target || v.responsibility === target)))
    return changes.length ? [{ eventId: frame.eventId, changes }] : []
  })
}
