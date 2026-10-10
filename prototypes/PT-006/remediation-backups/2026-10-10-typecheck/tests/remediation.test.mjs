import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { initialData, initialDataB, SCHEMAS, matchesSchema, knownRequirements, migrateLegacyDemo, replaceContentState, validateDemo } from '../src/content.ts'
import { atCursor, navigationEvents, plannedView, resolveSnapshot, diffState, changesFor, factualValue, historySources } from '../src/history.ts'
import { referenceWarnings } from '../src/references.ts'

test('archived target and factual CURRENT with the same ID resolve independently', () => {
  const data = structuredClone(initialData)
  const original = data.history.revisions[1].snapshots.find(s => s.id === data.architecture.currentRef).responsibilities.find(r => r.id === 'API').concern
  data.architecture.snapshots.find(s => s.id === data.architecture.currentRef).responsibilities.find(r => r.id === 'API').concern = 'EDITED CURRENT'
  data.history.selectedRevisionId = 'PLAN-A-R1'
  const view = plannedView(atCursor(data).data)
  assert.equal(resolveSnapshot(view, data.architecture.currentRef, 'actual').responsibilities.find(r => r.id === 'API').concern, 'EDITED CURRENT')
  assert.equal(resolveSnapshot(view, data.architecture.currentRef, 'planned').responsibilities.find(r => r.id === 'API').concern, original)
  assert.deepEqual(view.implementation.files, data.implementation.files)
  assert.equal(view.events.selectedId, 'A-04')
})
test('archived knowledge survives live reordering and complete navigation stays separate', () => {
  const data = structuredClone(initialData)
  data.events.records.reverse()
  data.events.selectedId = 'A-02'
  const view = atCursor(data)
  assert.equal(view.available, true)
  assert.deepEqual(knownRequirements(view.data).map(r => r.id), ['R-01','R-02'])
  assert.deepEqual(view.data.events.records.map(e => e.id), ['A-01','A-02'])
  assert.deepEqual(navigationEvents(view.data).map(e => e.id), data.events.records.map(e => e.id))
  data.events.selectedId = 'A-01' // last live row after reorder is still the first archived moment.
  assert.equal(atCursor(data).data.architecture.currentRef, 'A-INITIAL')
  data.events.selectedId = null
  assert.equal(knownRequirements(atCursor(data).data).length, 3)
})
test('missing or changed last event cannot masquerade as an archived moment', () => {
  const data = structuredClone(initialData)
  data.events.records.push({ ...data.events.records[0], id: 'UNKNOWN_LAST' })
  data.events.selectedId = 'UNKNOWN_LAST'
  assert.equal(atCursor(data).available, false)
  data.events.selectedId = 'A-04'
  data.events.records.find(e => e.id === 'A-04').note = 'changed identity'
  assert.equal(atCursor(data).available, false)
})
test('ordered events and Steps report order without fictitious field replacements', () => {
  for (const [items,path] of [[initialData.events.records,'events.records'],[initialData.plan.steps,'plan.steps']]) {
    const changes = diffState(items, [...items].reverse(), path)
    assert.equal(changes.length, 1)
    assert.equal(changes[0].op, 'reorder')
    assert.deepEqual(changes[0].before, items.map(x => x.id))
    assert.deepEqual(changes[0].after, [...items].reverse().map(x => x.id))
  }
  assert.deepEqual(diffState(initialData.requirements.items, [...initialData.requirements.items].reverse(), 'requirements.items'), [])
})
test('projection history includes architecture, files and owned trace facts', () => {
  for (const kind of ['impactHistory','explorer']) {
    const changes = changesFor(initialData, kind, 1)
    assert.ok(changes.some(c => c.path.startsWith('architecture.')))
    assert.ok(changes.some(c => c.entityRef === 'src/api/booking.ts'))
  }
  const data = structuredClone(initialData)
  data.history.frames[2].state.trace.links[0].note = 'TRACE ONLY FACT'
  assert.ok(changesFor(data, 'trace', 2).some(c => c.path === 'trace.links[0].note' && c.after === 'TRACE ONLY FACT'))
  const state = structuredClone(initialData)
  state.trace.selectedRequirementId = 'R-A3'
  assert.deepEqual(factualValue(state, 'trace'), factualValue(initialData, 'trace'))
  assert.ok(historySources('trace').includes('trace'))
  assert.deepEqual(factualValue(initialData, 'current'), {})
})
test('new planning material remains planned; route and deadline history retain grounds', () => {
  for (const data of [initialData,initialDataB]) {
    assert.ok(data.plan.activities.some(a => a.kind === 'waiting'))
    assert.ok(data.plan.activities.every(a => !('targetSnapshotRef' in a)))
    const [r0,r1,r2] = data.history.revisions
    assert.equal(r0.plan.routeExpectations.length, 1)
    assert.ok(r1.plan.anticipatedEvents[0].predictedRequirement)
    assert.equal(r1.base.requirements.items.some(r => r.id.startsWith('PRED-')), false)
    assert.notEqual(r1.plan.routeExpectations[0].assessment, r2.plan.routeExpectations[0].assessment)
    assert.notEqual(r1.plan.changeAxes[0].direction, r2.plan.changeAxes[0].direction)
    assert.ok(r2.plan.changeAxes[0].basis.includes(r2.plan.basedOnActualEventRef))
    assert.equal(data.fitness.assessments.some(a => a.route === 'ELSE'), true)
  }
  assert.equal(initialDataB.plan.deadline.date, '15 мая')
  assert.equal(initialDataB.plan.completionForecast.date, '18 мая')
  assert.equal(initialDataB.history.revisions[1].plan.deadline.date, '30 апр')
})
test('deadline miss is a later authored fact, absent at B-04', () => {
  const data = structuredClone(initialDataB)
  assert.equal(data.work.deadlineOutcomes[0].eventRef, 'B-05')
  assert.equal(data.work.deadlineOutcomes[0].outcome, 'missed')
  data.events.selectedId = 'B-04'
  assert.deepEqual(atCursor(data).data.work.deadlineOutcomes, [])
  assert.equal(atCursor(data).data.work.episodes.length, 2)
})
test('work provenance distinguishes unknown quantity and recurring obligation, with Schema', () => {
  const data = initialDataB
  assert.ok(data.work.details[0].contracts && data.work.details[0].reversibility && data.work.details[0].teamAutonomy)
  assert.ok(data.work.costFacts.some(f => f.frequency === 'recurring' && f.quantity === null && f.source && f.unit && f.evaluationTimeBasis))
  const work = structuredClone(data.work)
  work.costFacts[0].quantity = 'unknown string'
  assert.equal(matchesSchema(work, SCHEMAS.work), false)
})
test('v5 upgrades only untouched fixtures, preserving choices and custom histories', () => {
  for (const [branch,seed] of [['A',initialData],['B',initialDataB]]) {
    const old = JSON.parse(fs.readFileSync(new URL('./fixtures/content-v5-' + branch + '.json', import.meta.url), 'utf8'))
    old.events.selectedId = 'EXT-01'
    old.history.selectedRevisionId = 'PLAN-' + branch + '-R1'
    old.current.selectedSection = 'implementation'
    const next = migrateLegacyDemo(old, seed)
    assert.ok(next.plan.activities?.length)
    assert.equal(next.events.selectedId, 'EXT-01')
    assert.equal(next.history.selectedRevisionId, old.history.selectedRevisionId)
    assert.equal(next.current.selectedSection, 'implementation')
    assert.equal(validateDemo(next), true)
    const changed = structuredClone(old)
    changed.requirements.items[0].title = 'MY CUSTOM REQUIREMENT'
    changed.history.frames[0].state.requirements.items[0].description = 'MY CUSTOM ARCHIVE'
    const migrated = migrateLegacyDemo(changed, seed)
    assert.equal(migrated.requirements.items[0].title, 'MY CUSTOM REQUIREMENT')
    assert.deepEqual(migrated.history.frames, changed.history.frames)
    assert.deepEqual(migrated.history.revisions, changed.history.revisions)
    assert.equal(migrated.history.imported, true)
    assert.equal(migrated.plan.activities, undefined)
  }
})
test('reference problems are visible warnings while structurally valid drafts remain editable', () => {
  assert.deepEqual(referenceWarnings(initialData), [])
  assert.deepEqual(referenceWarnings(initialDataB), [])
  const plan = structuredClone(initialData.plan)
  plan.steps[1].targetSnapshotRef = 'MISSING_TARGET'
  plan.activities[0].dependsOn = ['MISSING_ACTIVITY']
  const next = replaceContentState(initialData, 'plan', plan)
  assert.ok(next)
  const warnings = referenceWarnings(next)
  assert.ok(warnings.some(w => w.target === 'MISSING_TARGET' && w.path.includes('targetSnapshotRef')))
  assert.ok(warnings.some(w => w.target === 'MISSING_ACTIVITY'))
})
