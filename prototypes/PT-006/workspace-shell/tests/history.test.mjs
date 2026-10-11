import test from 'node:test'
import assert from 'node:assert/strict'
import { initialData, initialDataB, replaceContentState, migrateLegacyDemo, validateDemo } from '../src/profiles/architecture-simulator/content.ts'
import { atCursor, plannedView, changesFor, diffState, actualImpacts } from '../src/profiles/architecture-simulator/history.ts'

test('earlier factual cursor restores architecture, files, requirements, work and Plan together', () => {
  const data = structuredClone(initialData)
  data.events.selectedId = 'A-01'
  const result = atCursor(data)
  assert.equal(result.available, true)
  assert.equal(result.historical, true)
  assert.equal(result.data.architecture.currentRef, 'A-INITIAL')
  assert.equal(result.data.architecture.snapshots[0].responsibilities.some(r => r.id === 'API'), false)
  assert.equal(result.data.implementation.files.some(f => f.path === 'src/booking.ts'), true)
  assert.equal(result.data.implementation.files.some(f => f.path === 'src/api/booking.ts'), false)
  assert.equal(result.data.requirements.items.some(r => r.id === 'R-A3'), false)
  assert.equal(result.data.work.episodes.length, 0)
  assert.equal(result.data.plan.revision, 'PLAN-A-R0')
  assert.deepEqual(data.architecture, initialData.architecture)
})
test('actual API extraction records creation, deletion and changed field values', () => {
  const changes = changesFor(initialData, 'current', 1)
  assert.ok(changes.some(c => c.op === 'add' && c.entityRef === 'A-CURRENT' && c.after.responsibilities.some(r => r.id === 'API')))
  assert.ok(actualImpacts(initialData, 'API').some(record => record.changes.some(c => c.op === 'add' && c.entityRef === 'API')))
  assert.ok(changes.some(c => c.op === 'add' && c.entityRef === 'src/api/booking.ts'))
  assert.ok(changes.some(c => c.op === 'remove' && c.entityRef === 'src/booking.ts'))
  assert.ok(changes.some(c => c.op === 'replace' && c.path.endsWith('currentRef') && c.before === 'A-INITIAL' && c.after === 'A-CURRENT'))
})
test('new requirement enters State only at its actual revealing event', () => {
  const changes = changesFor(initialData, 'requirements', 3)
  assert.equal(changes.length, 1)
  assert.equal(changes[0].op, 'add')
  assert.equal(changes[0].entityRef, 'R-A3')
  assert.equal(changes[0].after.knownFrom, 'A-04')
  assert.equal(changesFor(initialData, 'requirements', 2).length, 0)
})
test('branch B earlier file tree restores old storage file before its rename', () => {
  const data = structuredClone(initialDataB)
  data.events.selectedId = 'B-01'
  assert.ok(atCursor(data).data.implementation.files.some(f => f.path === 'src/legacy-storage.ts'))
  data.events.selectedId = 'B-02'
  assert.ok(atCursor(data).data.implementation.files.some(f => f.path === 'src/storage.ts'))
  assert.equal(atCursor(data).data.implementation.files.some(f => f.path === 'src/legacy-storage.ts'), false)
})
test('PlanRevision lineage keeps previous deadline and frozen BASE after direct latest edits', () => {
  const data = structuredClone(initialDataB)
  const r1 = data.history.revisions.find(r => r.id === 'PLAN-B-R1')
  const r2 = data.history.revisions.find(r => r.id === 'PLAN-B-R2')
  assert.equal(r2.parentId, r1.id)
  assert.equal(r1.plan.deadline.date, '30 апр')
  assert.equal(r2.plan.deadline.date, '15 мая')
  assert.equal(r2.base.eventId, 'B-04')
  const saved = structuredClone(r2.base)
  data.implementation.files.length = 0
  data.requirements.items[0].title = 'Локальная правка'
  assert.deepEqual(r2.base, saved)
  assert.ok(r2.base.implementation.files.length > 0)
})
test('selecting archived plan changes planned view, never factual cursor or CURRENT', () => {
  const data = structuredClone(initialData)
  data.history.selectedRevisionId = 'PLAN-A-R0'
  const view = plannedView(atCursor(data).data)
  assert.equal(view.plan.revision, 'PLAN-A-R0')
  assert.equal(view.plan.steps[0].targetSnapshotRef, 'A-INITIAL')
  assert.equal(view.architecture.currentRef, initialData.architecture.currentRef)
  assert.equal(view.events.selectedId, 'A-04')
  assert.deepEqual(view.implementation.files, initialData.implementation.files)
  assert.equal(data.plan.revision, 'PLAN-A-R2')
})
test('direct latest edits remain visible and never overwrite archived event snapshots', () => {
  const source = structuredClone(initialData)
  const value = structuredClone(source.requirements)
  value.items[0].title = 'Редактирование последнего State'
  const next = replaceContentState(source, 'requirements', value)
  assert.equal(atCursor(next).data.requirements.items[0].title, value.items[0].title)
  assert.deepEqual(next.history, source.history)
  next.events.selectedId = 'A-01'
  assert.notEqual(atCursor(next).data.requirements.items[0].title, value.items[0].title)
})
test('no snapshot or changed event identity never silently substitutes latest State', () => {
  const data = structuredClone(initialData)
  data.events.records.splice(1, 0, { ...data.events.records[0], id: 'CUSTOM' })
  data.events.selectedId = 'CUSTOM'
  assert.equal(atCursor(data).available, false)
  data.events.selectedId = 'A-01'
  data.events.records[0].label = 'Совсем другое событие'
  assert.equal(atCursor(data).available, false)
})
test('actual impact ignores planned ENT snapshot addition and alternative future paths', () => {
  assert.equal(actualImpacts(initialData, 'ENT').length, 0)
  assert.equal(actualImpacts(initialData, 'src/enterprise/onboarding.ts').length, 0)
  assert.ok(actualImpacts(initialData, 'API').some(x => x.eventId === 'A-02'))
})
test('array identities avoid fictitious changes from reordering and preserve before/after', () => {
  const a = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }]
  const b = [{ id: 'b', n: 2 }, { id: 'a', n: 3 }]
  const changes = diffState(a, b, 'items')
  assert.deepEqual(changes, [{ op: 'replace', path: 'items[id=a].n', entityRef: 'a', before: 1, after: 3 }])
})
test('older saved data migrates without fabricating a history of custom edits', () => {
  const old = structuredClone(initialData)
  delete old.history
  old.requirements.items[0].title = 'Мои данные'
  const next = migrateLegacyDemo(old)
  assert.ok(next)
  assert.equal(next.requirements.items[0].title, 'Мои данные')
  assert.equal(next.history.imported, true)
  assert.notEqual(next.history.frames[0].state.requirements.items[0].title, 'Мои данные')
  assert.equal(validateDemo(next), true)
})
test('invalid revision lineage and missing archived target snapshots are rejected', () => {
  const data = structuredClone(initialData)
  data.history.revisions[1].parentId = 'MISSING'
  assert.equal(validateDemo(data), false)
  data.history = structuredClone(initialData.history)
  data.history.revisions[1].snapshots = []
  assert.equal(validateDemo(data), false)
})

test('actual impact history never includes a transition after the selected factual cursor', () => {
  const data = structuredClone(initialData)
  data.events.selectedId = 'A-01'
  assert.equal(actualImpacts(atCursor(data).data, 'API').length, 0)
  data.events.selectedId = 'A-02'
  assert.deepEqual(actualImpacts(atCursor(data).data, 'API').map(r => r.eventId), ['A-02'])
})
