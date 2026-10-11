import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { createWorkspaceModel } from './workspace.ts'
const { changeRect, findFreeFitRect, swapPanels } = createWorkspaceModel([])
import type { Panel, Rect, Screen, Workspace } from './workspace.ts'

type Ghost = { x: number; y: number; w: number; h: number; fit: boolean }
type Pointer = { x: number; y: number }
type Args = {
  screen: Screen
  workspace: Workspace
  board: RefObject<HTMLDivElement | null>
  stage: RefObject<HTMLElement | null>
  armedPanelId: string | null
  fitGap: number
  onFitted: () => void
  update: (fn: (value: Workspace) => Workspace) => void
}

export function edgeScrollVelocity(pointer: number, start: number, end: number, edge = 66): number {
  if (pointer < start - 20 || pointer > end + 20) return 0
  if (pointer < start + edge) return -Math.ceil((start + edge - pointer) / 4)
  if (pointer > end - edge) return Math.ceil((pointer - (end - edge)) / 4)
  return 0
}

/** Convert the pointer into the final window rectangle without losing the grab offset. */
export function draggedRectAt(pointer: Pointer, boardOrigin: Pointer, grabOffset: Pointer, original: Rect): Rect {
  return {
    ...original,
    x: Math.max(0, Math.round(pointer.x - boardOrigin.x - grabOffset.x)),
    y: Math.max(0, Math.round(pointer.y - boardOrigin.y - grabOffset.y)),
  }
}

/** Mouse-wheel and edge scrolling work throughout a live, pointer-based drag. */
export function useWindowDrag({ screen, workspace, board, stage, armedPanelId, fitGap, onFitted, update }: Args) {
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [previewRect, setPreviewRect] = useState<Rect | null>(null)
  const dragging = useRef<{
    id: string; x: number; y: number; startX: number; startY: number
    offset: Pointer; moved: boolean
  } | null>(null)

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>, panel: Panel) => {
    if (e.button !== 0 || dragging.current) return
    const scroll = stage.current
    const boardElement = board.current
    if (!scroll || !boardElement) return
    e.preventDefault()
    e.stopPropagation()
    const fit = armedPanelId === panel.id
    const panelBox = e.currentTarget.closest<HTMLElement>('.window-panel')?.getBoundingClientRect()
    const boardBox = boardElement.getBoundingClientRect()
    const offset = panelBox
      ? { x: e.clientX - panelBox.left, y: e.clientY - panelBox.top }
      : { x: e.clientX - boardBox.left - panel.rect.x, y: e.clientY - boardBox.top - panel.rect.y }
    dragging.current = {
      id: panel.id, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY,
      offset, moved: false,
    }
    setNotice(null)

    const syncPreview = () => {
      const active = dragging.current
      const bounds = board.current?.getBoundingClientRect()
      if (!active?.moved || !bounds) return
      const next = draggedRectAt({ x: active.x, y: active.y }, { x: bounds.left, y: bounds.top }, active.offset, panel.rect)
      setPreviewRect(previous =>
        previous && previous.x === next.x && previous.y === next.y ? previous : next)
      setGhost(previous =>
        previous && previous.x === active.x && previous.y === active.y ? previous :
          { x: active.x, y: active.y, w: panel.rect.w, h: panel.rect.h, fit })
      if (fit) return
      const px = active.x - bounds.left
      const py = active.y - bounds.top
      const target = [...screen.panels].reverse().find(p => p.id !== panel.id &&
        px >= p.rect.x && px <= p.rect.x + p.rect.w &&
        py >= p.rect.y && py <= p.rect.y + p.rect.h)
      setHovered(previous => previous === (target?.id ?? null) ? previous : target?.id ?? null)
    }

    const wheel = (evt: WheelEvent) => {
      if (!dragging.current) return
      evt.preventDefault()
      evt.stopPropagation() // keep drag-board scrolling separate from tab-strip wheel scrolling
      const scale = evt.deltaMode === 1 ? 18 : evt.deltaMode === 2 ? scroll.clientHeight : 1
      scroll.scrollBy(evt.deltaX * scale, evt.deltaY * scale)
      requestAnimationFrame(syncPreview)
    }
    const move = (evt: PointerEvent) => {
      const active = dragging.current
      if (!active) return
      active.x = evt.clientX
      active.y = evt.clientY
      if (!active.moved && Math.hypot(active.x - active.startX, active.y - active.startY) >= 5) {
        active.moved = true
        setDraggedId(panel.id)
      }
      syncPreview()
    }

    let frame = 0
    const tick = () => {
      const active = dragging.current
      if (!active) return
      if (active.moved) {
        const r = scroll.getBoundingClientRect()
        if (active.x >= r.left - 20 && active.x <= r.right + 20 &&
            active.y >= r.top - 20 && active.y <= r.bottom + 20) {
          const dx = edgeScrollVelocity(active.x, r.left, r.right)
          const dy = edgeScrollVelocity(active.y, r.top, r.bottom)
          if (dx || dy) scroll.scrollBy(dx, dy)
        }
        syncPreview()
      }
      frame = requestAnimationFrame(tick)
    }

    const cleanup = () => {
      dragging.current = null
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('wheel', wheel, true)
      window.removeEventListener('keydown', keydown)
      setGhost(null)
      setHovered(null)
      setDraggedId(null)
      setPreviewRect(null)
    }
    const cancel = () => cleanup()
    const release = (evt: PointerEvent) => {
      const bounds = board.current?.getBoundingClientRect()
      const active = dragging.current
      if (active?.moved && bounds) {
        const point = { x: evt.clientX - bounds.left, y: evt.clientY - bounds.top }
        if (fit) {
          // Temporary drag-only overscan is not part of the space to fill.
          const naturalW = Math.max(1265, scroll.scrollLeft + scroll.clientWidth,
            ...screen.panels.map(p => p.rect.x + p.rect.w + 36))
          const naturalH = Math.max(650, scroll.scrollTop + scroll.clientHeight,
            ...screen.panels.map(p => p.rect.y + p.rect.h + 36))
          const rect = findFreeFitRect(workspace, screen.id, panel.id, point,
            { w: Math.min(bounds.width, naturalW), h: Math.min(bounds.height, naturalH) }, fitGap)
          if (rect) {
            update(w => changeRect(w, screen.id, panel.id, rect))
            onFitted()
            setNotice('Окно вписано: ' + rect.w + ' × ' + rect.h + ' px · отступ ' + fitGap + ' px.')
          } else {
            setNotice('Нет свободной области от 190 × 156 px. Окно не изменено.')
          }
        } else {
          const target = [...screen.panels].reverse().find(p => p.id !== panel.id &&
            point.x >= p.rect.x && point.x <= p.rect.x + p.rect.w &&
            point.y >= p.rect.y && point.y <= p.rect.y + p.rect.h)
          if (target) update(w => swapPanels(w, screen.id, panel.id, target.id))
          else update(w => changeRect(w, screen.id, panel.id, draggedRectAt(
            { x: evt.clientX, y: evt.clientY }, { x: bounds.left, y: bounds.top }, active.offset, panel.rect)))
        }
      }
      cleanup()
    }
    const keydown = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') { evt.preventDefault(); cleanup() }
      else if (evt.key === 'PageDown') { evt.preventDefault(); scroll.scrollBy(0, scroll.clientHeight * .7) }
      else if (evt.key === 'PageUp') { evt.preventDefault(); scroll.scrollBy(0, -scroll.clientHeight * .7) }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('wheel', wheel, { capture: true, passive: false })
    window.addEventListener('keydown', keydown)
    frame = requestAnimationFrame(tick)
  }

  return { startDrag, ghost, hovered, notice, setNotice, draggedId, previewRect }
}
