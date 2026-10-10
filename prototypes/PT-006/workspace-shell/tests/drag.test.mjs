import test from 'node:test'
import assert from 'node:assert/strict'
import { edgeScrollVelocity, draggedRectAt } from '../src/windowDrag.ts'

test('drag held near any viewport edge produces auto-scroll in either axis', () => {
  assert.ok(edgeScrollVelocity(5, 0, 600) < 0)
  assert.ok(edgeScrollVelocity(597, 0, 600) > 0)
  assert.equal(edgeScrollVelocity(300, 0, 600), 0)
  assert.equal(edgeScrollVelocity(710, 0, 600), 0)
})

test('live drag starts without jumping under the cursor', () => {
  const original = { x: 380, y: 70, w: 520, h: 310 }
  const offset = { x: 31, y: 14 }
  const origin = { x: 120, y: 130 }
  const start = { x: 531, y: 214 }
  assert.deepEqual(draggedRectAt(start, origin, offset, original), original)
  assert.deepEqual(draggedRectAt({ x: 616, y: 256 }, origin, offset, original),
    { x: 465, y: 112, w: 520, h: 310 })
  assert.deepEqual(original, { x: 380, y: 70, w: 520, h: 310 })
})
test('wheel scroll changes board coordinates but window stays underneath the held cursor', () => {
  const original = { x: 380, y: 70, w: 520, h: 310 }
  const pointer = { x: 616, y: 256 }
  const grab = { x: 31, y: 14 }
  assert.deepEqual(draggedRectAt(pointer, { x: 70, y: 110 }, grab, original),
    { x: 515, y: 132, w: 520, h: 310 })
})
test('release near canvas origin clamps preview and final position identically', () => {
  const result = draggedRectAt({ x: 8, y: 8 }, { x: 0, y: 0 },
    { x: 25, y: 14 }, { x: 200, y: 100, w: 320, h: 250 })
  assert.deepEqual(result, { x: 0, y: 0, w: 320, h: 250 })
})
