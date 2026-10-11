import test from 'node:test'
import assert from 'node:assert/strict'
import { initialData, initialDataB, SCHEMAS, matchesSchema, replaceContentState, validateDemo, migrateLegacyDemo, knownRequirements } from '../src/profiles/architecture-simulator/content.ts'
import { CONTENT, INITIAL_WORKSPACE } from '../src/profiles/architecture-simulator/workspace.ts'

test('content catalog contains simulator surfaces, not object and collection data primitives', () => {
  assert.deepEqual(CONTENT.map(d => d.id), ['events', 'plan', 'requirements', 'architecture', 'impact', 'implementation', 'fitness', 'work', 'scenario', 'current', 'architecturePlan', 'forecasts', 'axes', 'hotpaths', 'explorer', 'comparison', 'trace', 'impactHistory'])
  assert.equal(CONTENT.some(d => d.id === 'collection' || d.id === 'json' || d.id === 'notes'), false)
})
test('full JSON Schema describes possible object types even when current collection is empty', () => {
  const endpoint = SCHEMAS.requirements.properties.apiEndpoints
  assert.equal(endpoint.type, 'array')
  assert.equal(endpoint.items.type, 'object')
  assert.deepEqual(Object.keys(endpoint.items.properties), ['id', 'method', 'path'])
  assert.equal(initialData.requirements.apiEndpoints.length, 0)
  assert.equal(initialData.requirements.items[0].id, 'R-01')
})
test('both branch fixtures validate against their own content schema', () => {
  assert.equal(validateDemo(initialData), true)
  assert.equal(validateDemo(initialDataB), true)
  assert.equal(INITIAL_WORKSPACE.version, 3)
})
test('shared exogenous event is identical, branch outcomes are different and attributed', () => {
  const a = initialData.events.records.find(e => e.id === 'EXT-01')
  const b = initialDataB.events.records.find(e => e.id === 'EXT-01')
  assert.deepEqual(a, b)
  assert.notEqual(initialData.events.records.at(-1).label, initialDataB.events.records.at(-1).label)
  assert.ok(initialData.events.records.at(-1).provenance.includes('→'))
  assert.ok(initialDataB.events.records.at(-1).provenance.includes('→'))
})
test('requirement knowledge follows selected branch-local actual cursor, not plan forecasts', () => {
  const a = structuredClone(initialData)
  a.events.selectedId = 'EXT-01'
  assert.equal(knownRequirements(a).some(r => r.id === 'R-A3'), false)
  a.events.selectedId = 'A-04'
  assert.equal(knownRequirements(a).some(r => r.id === 'R-A3'), true)
  assert.equal(knownRequirements(initialDataB).some(r => r.id === 'R-A3'), false)
  assert.equal(knownRequirements(a).some(r => r.title === a.plan.anticipatedEvents[0].title), false)
})
test('Plan Step is not an Actual Event; conditional step has full target snapshot and implementation effect', () => {
  const s2 = initialData.plan.steps.find(s => s.id === 'S2')
  const s3 = initialData.plan.steps.find(s => s.id === 'S3')
  assert.equal(initialData.events.records.some(e => e.id === 'S2'), false)
  assert.ok(initialData.architecture.snapshots.some(s => s.id === s2.targetSnapshotRef))
  assert.ok(s2.implementationEffect.length > 0)
  assert.equal(s3.targetSnapshotRef, initialData.architecture.currentRef)
  assert.ok(s3.implementationEffect.length > 0)
  assert.notEqual(s2.route, s3.route)
})
test('fitness keeps migration, plan alignment and cost classes separate, without scalar winner', () => {
  const fitness = initialData.fitness.assessments[0]
  assert.ok(fitness.migration)
  assert.ok(fitness.planAlignment)
  assert.deepEqual(Object.keys(fitness.costClasses), ['migration','coordination','rework'])
  assert.equal(Object.prototype.hasOwnProperty.call(fitness, 'score'), false)
})
test('direct State update is schema checked and independent of Workspace and the other architecture', () => {
  const beforeA = structuredClone(initialData)
  const beforeB = structuredClone(initialDataB)
  const change = structuredClone(beforeA.requirements)
  change.apiEndpoints.push({ id: 'API-1', method: 'GET', path: '/health' })
  const next = replaceContentState(beforeA, 'requirements', change)
  assert.ok(next)
  assert.equal(next.requirements.apiEndpoints.length, 1)
  assert.equal(beforeA.requirements.apiEndpoints.length, 0)
  assert.deepEqual(beforeB, initialDataB)
  assert.equal(validateDemo(next), true)
  assert.equal(CONTENT.length, 18)
})
test('invalid direct State update is rejected', () => {
  assert.equal(matchesSchema({ items: {}, screens: [], apiEndpoints: [] }, SCHEMAS.requirements), false)
  assert.equal(replaceContentState(initialData, 'requirements', { items: 'wrong' }), null)
})
test('old generic demo data is not silently reinterpreted as simulator history', () => {
  assert.equal(migrateLegacyDemo({ collection: { items: [{ id: 'z' }] } }), null)
})
test('all registered content types have independently inspectable State and possible JSON Schema', () => {
  for (const descriptor of CONTENT) {
    const kind = descriptor.id
    assert.ok(Object.prototype.hasOwnProperty.call(initialData, kind), kind + ' State must exist')
    assert.ok(Object.prototype.hasOwnProperty.call(SCHEMAS, kind), kind + ' Schema must exist')
    assert.equal(matchesSchema(initialData[kind], SCHEMAS[kind]), true, kind)
    assert.equal(matchesSchema(initialDataB[kind], SCHEMAS[kind]), true, kind + ' B')
  }
  assert.equal(Object.keys(SCHEMAS).length, CONTENT.length)
})
test('CURRENT, planned snapshot and independent view selection do not imply Step execution', () => {
  const a = structuredClone(initialData)
  const current = a.architecture.currentRef
  const cursor = a.events.selectedId
  a.architecturePlan.selectedStepId = 'S2'
  a.current.selectedSection = 'implementation'
  a.impactHistory.selectedTargetRef = 'API'
  assert.equal(a.architecture.currentRef, current)
  assert.equal(a.events.selectedId, cursor)
  assert.notEqual(a.plan.steps.find(s => s.id === 'S2').targetSnapshotRef, current)
  assert.equal(validateDemo(a), true)
})
test('cross-branch comparison preserves same shared anchor, not a second independent simulation', () => {
  assert.deepEqual(initialData.scenario.anchors, initialDataB.scenario.anchors)
  assert.equal(initialData.comparison.selectedAnchorId, 'EXT-01')
  assert.equal(initialDataB.comparison.selectedAnchorId, 'EXT-01')
  assert.equal(initialData.scenario.caseId, initialDataB.scenario.caseId)
  assert.notDeepEqual(initialData.work.episodes, initialDataB.work.episodes)
})
test('old v3 simulator state is upgraded without dropping user-edited original State', () => {
  const legacyA = structuredClone(initialData)
  legacyA.events.selectedId = 'EXT-01'
  legacyA.requirements.apiEndpoints.push({ id: 'CUSTOM', method: 'GET', path: '/my-api' })
  for (const name of ['scenario','current','architecturePlan','forecasts','axes','hotpaths','explorer','comparison','trace','impactHistory']) delete legacyA[name]
  const updated = migrateLegacyDemo(legacyA, initialData)
  assert.ok(updated)
  assert.equal(updated.events.selectedId, 'EXT-01')
  assert.equal(updated.requirements.apiEndpoints[0].id, 'CUSTOM')
  assert.equal(updated.architecturePlan.selectedStepId, 'S2')
  assert.equal(validateDemo(updated), true)
})
test('historical generic demo state is not upgraded as domain evidence', () => {
  assert.equal(migrateLegacyDemo({ events: { records: [] }, notes: { text: 'abc' } }, initialData), null)
})

test('projection schemas expose referenced canonical model State without duplicating source facts', async () => {
  const { EXTRA_SOURCES } = await import('../src/profiles/architecture-simulator/extraContent.ts')
  // The UI uses the extra-source table to render original source State and schema.
  for (const [projection, sources] of Object.entries(EXTRA_SOURCES)) {
    assert.ok(CONTENT.some(d => d.id === projection))
    assert.equal(sources.length > 0, projection !== 'scenario', projection + ' names consumed sources; own scenario facts stay in its State')
    for (const source of sources) {
      assert.ok(Object.prototype.hasOwnProperty.call(initialData, source))
      assert.ok(Object.prototype.hasOwnProperty.call(SCHEMAS, source))
    }
  }
  assert.equal(EXTRA_SOURCES.forecasts.includes('plan'), true)
  assert.equal(EXTRA_SOURCES.current.includes('architecture'), true)
  assert.equal(EXTRA_SOURCES.impactHistory.includes('impact'), true)
})
test('sample screen layouts together expose every content type, including new ones', async () => {
  const { INITIAL_WORKSPACE } = await import('../src/profiles/architecture-simulator/workspace.ts')
  const visible = new Set(INITIAL_WORKSPACE.screens.flatMap(s => s.panels.flatMap(p => p.tabs)))
  assert.deepEqual([...visible].sort(), CONTENT.map(d => d.id).sort())
})
