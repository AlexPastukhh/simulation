import test from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_WORKSPACE, activateScreen, addContent, addPanel, addScreen, canAddContent, changeRect, countContent, currentScreen, removeContent, removePanel, removeScreen, swapPanels, findFreeFitRect, undersized, validateWorkspace, migrateLegacyWorkspace } from '../src/workspace.ts'

const seed = () => structuredClone(INITIAL_WORKSPACE)
test('default workspace is valid and has four independent screens', () => {
  const s = seed()
  assert.equal(validateWorkspace(s), true)
  assert.equal(s.screens.length, 4)
  assert.equal(currentScreen(s).title, 'Обзор')
})
test('creating a screen activates a new empty layout', () => {
  const s = addScreen(seed(), 'screen-new', 'Мой экран')
  assert.equal(s.activeScreenId, 'screen-new')
  assert.equal(s.screens.at(-1).panels.length, 0)
  assert.equal(INITIAL_WORKSPACE.screens.length, 4)
})
test('creating a blank panel does not create content state or tabs', () => {
  const s = addPanel(seed(), 'screen-1', 'p-new')
  const panel = s.screens[0].panels.find(p => p.id === 'p-new')
  assert.deepEqual(panel.tabs, [])
  assert.equal(panel.active, null)
})
test('singleton events cannot be duplicated in same screen', () => {
  const s = addPanel(seed(), 'screen-1', 'p-new')
  assert.equal(canAddContent(s, 'screen-1', 'events'), false)
  const duplicate = addContent(s, 'screen-1', 'p-new', 'events')
  assert.equal(duplicate, s)
  assert.equal(countContent(duplicate, 'screen-1', 'events'), 1)
})
test('same singleton kind can appear in another screen', () => {
  const s = addPanel(seed(), 'screen-2', 'new-events')
  const added = addContent(s, 'screen-2', 'new-events', 'events')
  assert.equal(countContent(added, 'screen-1', 'events'), 1)
  assert.equal(countContent(added, 'screen-2', 'events'), 1)
})
test('non-singleton content can exist in several panels', () => {
  const s = addPanel(seed(), 'screen-1', 'p-new')
  const added = addContent(s, 'screen-1', 'p-new', 'architecture')
  assert.equal(countContent(added, 'screen-1', 'architecture'), 2)
})
test('adding a tab keeps panel identity and selects added kind', () => {
  const s = addContent(seed(), 'screen-1', 'panel-2', 'work')
  const p = s.screens[0].panels.find(p => p.id === 'panel-2')
  assert.deepEqual(p.tabs, ['requirements', 'architecture', 'work'])
  assert.equal(p.active, 'work')
})
test('closing a tab frees singleton capacity without deleting panels', () => {
  const s = removeContent(seed(), 'screen-1', 'panel-3', 'events')
  assert.equal(canAddContent(s, 'screen-1', 'events'), true)
  assert.equal(s.screens[0].panels.find(p => p.id === 'panel-3').active, null)
})
test('closing a panel releases its singleton type', () => {
  const s = removePanel(seed(), 'screen-1', 'panel-1')
  assert.equal(canAddContent(s, 'screen-1', 'plan'), true)
  assert.equal(s.screens[0].panels.length, 3)
})
test('full swap exchanges both positions and sizes without changing ids or tabs', () => {
  const s = seed(), beforeA = structuredClone(s.screens[0].panels[0]), beforeB = structuredClone(s.screens[0].panels[1])
  const changed = swapPanels(s, 'screen-1', beforeA.id, beforeB.id)
  const a = changed.screens[0].panels[0], b = changed.screens[0].panels[1]
  assert.deepEqual(a.rect, beforeB.rect)
  assert.deepEqual(b.rect, beforeA.rect)
  assert.equal(a.id, beforeA.id)
  assert.deepEqual(a.tabs, beforeA.tabs)
  assert.equal(b.id, beforeB.id)
  assert.deepEqual(b.tabs, beforeB.tabs)
  assert.deepEqual(s.screens[0].panels[0].rect, beforeA.rect)
})
test('resizing below recommended minimum is allowed and explicitly detectable', () => {
  const s = changeRect(seed(), 'screen-1', 'panel-1', { x: 100, y: 100, w: 200, h: 170 })
  const p = s.screens[0].panels[0]
  assert.equal(p.rect.w, 200)
  assert.deepEqual(undersized(p), { width: 365, height: 425 })
})
test('hard frame minimum prevents a window becoming unselectable', () => {
  const s = changeRect(seed(), 'screen-1', 'panel-1', { x: -20, y: -30, w: 8, h: 12 })
  const p = s.screens[0].panels[0]
  assert.equal(p.rect.w, 190)
  assert.equal(p.rect.h, 156)
  assert.equal(p.rect.x, 0)
  assert.equal(p.rect.y, 0)
})
test('switching screen preserves the untouched layout and state references', () => {
  const s = activateScreen(seed(), 'screen-2')
  assert.equal(s.activeScreenId, 'screen-2')
  assert.equal(s.screens[0].panels.length, 4)
  assert.equal(s.screens[1].panels.length, 2)
})
test('detects corrupted persisted workspace with duplicated singleton', () => {
  const s = seed()
  s.screens[0].panels[1].tabs.push('events')
  assert.equal(validateWorkspace(s), false)
})

test('automatic placement finds a free area rather than covering old windows', () => {
  const before = seed()
  const added = addPanel(before, 'screen-1', 'new-auto')
  const candidate = added.screens[0].panels.at(-1).rect
  for (const p of before.screens[0].panels) {
    const separated = candidate.x + candidate.w + 12 <= p.rect.x ||
      p.rect.x + p.rect.w + 12 <= candidate.x ||
      candidate.y + candidate.h + 12 <= p.rect.y ||
      p.rect.y + p.rect.h + 12 <= candidate.y
    assert.equal(separated, true, 'new panel must not overlap ' + p.id)
  }
})
test('closing a screen preserves other screens and resets active id', () => {
  const before = seed()
  const after = removeScreen(before, 'screen-1')
  assert.equal(after.screens.length, 3)
  assert.equal(after.screens[0].id, 'screen-2')
  assert.equal(after.activeScreenId, 'screen-2')
  assert.equal(before.screens.length, 4)
})
test('one remaining screen cannot be closed', () => {
  const one = removeScreen(removeScreen(removeScreen(seed(), 'screen-2'), 'screen-3'), 'screen-4')
  assert.equal(removeScreen(one, 'screen-1'), one)
})

test('size warning only applies to active tab, not hidden content tabs', () => {
  const s = seed()
  const panel = s.screens[0].panels[1]
  assert.equal(undersized(panel), null)
  panel.active = 'architecture'
  panel.rect.h = 335
  assert.deepEqual(undersized(panel), { width: 390, height: 350 })
})
test('legacy generic layouts preserve window geometry but do not invent domain placements', () => {
  const old = seed()
  old.version = 1
  old.screens[0].panels[1].tabs[0] = 'collection'
  old.screens[0].panels[1].active = 'collection'
  old.screens[1].panels[1].tabs = ['json', 'notes']
  old.screens[1].panels[1].active = 'json'
  const geom = old.screens.map(screen => screen.panels.map(p => structuredClone(p.rect)))
  const migrated = migrateLegacyWorkspace(old)
  assert.ok(migrated)
  assert.equal(migrated.version, 3)
  assert.deepEqual(migrated.screens.map(screen => screen.panels.map(p => p.rect)), geom)
  assert.ok(migrated.screens.every(screen => screen.panels.every(panel => panel.active === null && panel.tabs.length === 0)))
  assert.equal(validateWorkspace(migrated), true)
})
test('collection and json are not available as independent content types', () => {
  assert.equal(validateWorkspace({ ...seed(), version: 3, screens: [{
    id: 'bad', title: 'Bad', panels: [{ id: 'b', tabs: ['collection'], active: 'collection', rect: { x: 0, y: 0, w: 500, h: 500 } }],
  }], activeScreenId: 'bad' }), false)
})

test('fit-drop fills a free middle strip in both width and height', () => {
  const w = { version: 2, activeScreenId: 'main', screens: [{ id: 'main', title: 'Test', panels: [
    { id: 'source', rect: { x: 0, y: 0, w: 240, h: 200 }, tabs: ['notes'], active: 'notes' },
    { id: 'left', rect: { x: 0, y: 0, w: 200, h: 600 }, tabs: [], active: null },
    { id: 'right', rect: { x: 500, y: 0, w: 200, h: 600 }, tabs: [], active: null },
  ] }] }
  const before = structuredClone(w)
  const target = findFreeFitRect(w, 'main', 'source', { x: 350, y: 300 }, { w: 700, h: 600 })
  assert.deepEqual(target, { x: 212, y: 0, w: 276, h: 600 })
  assert.deepEqual(w, before, 'arming and calculating must not modify geometry')
  const placed = changeRect(w, 'main', 'source', target)
  assert.deepEqual(placed.screens[0].panels[0].rect, target)
  assert.deepEqual(placed.screens[0].panels[1].rect, before.screens[0].panels[1].rect)
})
test('fit excludes the dragged panel from obstacles', () => {
  const w = { version: 2, activeScreenId: 's', screens: [{ id: 's', title: 'S', panels: [
    { id: 'drag', rect: { x: 100, y: 100, w: 220, h: 210 }, tabs: [], active: null },
  ] }] }
  assert.deepEqual(findFreeFitRect(w, 's', 'drag', { x: 160, y: 160 }, { w: 620, h: 500 }),
    { x: 0, y: 0, w: 620, h: 500 })
})
test('fit respects both axes, gutters and existing panel identity', () => {
  const before = seed()
  const chosen = findFreeFitRect(before, 'screen-1', 'panel-4', { x: 500, y: 580 }, { w: 1265, h: 900 })
  assert.ok(chosen)
  assert.ok(chosen.w >= 190 && chosen.h >= 156)
  for (const p of before.screens[0].panels.filter(p => p.id !== 'panel-4')) {
    const separated = chosen.x + chosen.w + 12 <= p.rect.x ||
      p.rect.x + p.rect.w + 12 <= chosen.x ||
      chosen.y + chosen.h + 12 <= p.rect.y ||
      p.rect.y + p.rect.h + 12 <= chosen.y
    assert.equal(separated, true, 'must not intersect ' + p.id)
  }
})
test('fit returns null for cramped spaces without changing any panel', () => {
  const w = { version: 2, activeScreenId: 's', screens: [{ id: 's', title: 'S', panels: [
    { id: 'source', rect: { x: 0, y: 0, w: 190, h: 156 }, tabs: [], active: null },
    { id: 'cover', rect: { x: 0, y: 0, w: 500, h: 400 }, tabs: [], active: null },
  ] }] }
  assert.equal(findFreeFitRect(w, 's', 'source', { x: 240, y: 200 }, { w: 500, h: 400 }), null)
})
test('fit returns null when the dragged window is not on this screen', () => {
  assert.equal(findFreeFitRect(seed(), 'screen-1', 'unknown', { x: 1, y: 1 }, { w: 800, h: 800 }), null)
})

test('fit gap is configurable and can put a fitted window immediately next to neighbours', () => {
  const w = { version: 2, activeScreenId: 's', screens: [{ id: 's', title: 'S', panels: [
    { id: 'drag', rect: { x: 10, y: 10, w: 230, h: 210 }, tabs: [], active: null },
    { id: 'left', rect: { x: 0, y: 0, w: 200, h: 600 }, tabs: [], active: null },
    { id: 'right', rect: { x: 500, y: 0, w: 200, h: 600 }, tabs: [], active: null },
  ] }] }
  const point = { x: 350, y: 300 }
  const bounds = { w: 700, h: 600 }
  assert.deepEqual(findFreeFitRect(w, 's', 'drag', point, bounds, 0), { x: 200, y: 0, w: 300, h: 600 })
  assert.deepEqual(findFreeFitRect(w, 's', 'drag', point, bounds, 4), { x: 204, y: 0, w: 292, h: 600 })
  assert.deepEqual(findFreeFitRect(w, 's', 'drag', point, bounds, 16), { x: 216, y: 0, w: 268, h: 600 })
})