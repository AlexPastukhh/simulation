export type ContentKind = 'events' | 'plan' | 'requirements' | 'architecture' | 'impact' | 'implementation' | 'fitness' | 'work' | 'scenario' | 'current' | 'architecturePlan' | 'forecasts' | 'axes' | 'hotpaths' | 'explorer' | 'comparison' | 'trace' | 'impactHistory'
export type Rect = { x: number; y: number; w: number; h: number }
export type Panel = { id: string; rect: Rect; tabs: ContentKind[]; active: ContentKind | null }
export type Screen = { id: string; title: string; panels: Panel[] }
export type Workspace = { version: 3; activeScreenId: string; screens: Screen[] }

export type ContentDescriptor = {
  id: ContentKind
  label: string
  caption: string
  icon: string
  minWidth: number
  minHeight: number
  maxPerScreen: number | null
  accent: string
}

export const CONTENT: ContentDescriptor[] = [
  { id: 'events', label: 'Actual Events', caption: 'Факты и события по ветке, дни внутри ленты', icon: '◷', minWidth: 310, minHeight: 400, maxPerScreen: 1, accent: '#ed9259' },
  { id: 'plan', label: 'Plan', caption: 'PlanRevision · BASE · IF Steps · прогнозы', icon: '⑂', minWidth: 365, minHeight: 425, maxPerScreen: 1, accent: '#79acfc' },
  { id: 'requirements', label: 'Requirement Model', caption: 'Ненормализованные фактически известные требования', icon: '▤', minWidth: 340, minHeight: 330, maxPerScreen: 1, accent: '#55c4ad' },
  { id: 'architecture', label: 'Architecture', caption: 'CURRENT / плановые полные целевые снимки', icon: '◇', minWidth: 390, minHeight: 350, maxPerScreen: null, accent: '#b5a1ff' },
  { id: 'impact', label: 'Evolution Impact', caption: 'По выбранному Step, условной ветке и файлам', icon: '↗', minWidth: 330, minHeight: 345, maxPerScreen: null, accent: '#f4bd67' },
  { id: 'implementation', label: 'Implementation / Files', caption: 'Фактическое дерево файлов и плановые эффекты', icon: '⌘', minWidth: 350, minHeight: 350, maxPerScreen: null, accent: '#82cbf7' },
  { id: 'fitness', label: 'Evolution Fitness', caption: 'Контекстная оценка, миграции, классы затрат', icon: '▥', minWidth: 340, minHeight: 340, maxPerScreen: null, accent: '#e9af8c' },
  { id: 'work', label: 'Work Dynamics / Hot Paths', caption: 'Фактическая работа и наблюдаемые зоны изменений', icon: '↻', minWidth: 325, minHeight: 315, maxPerScreen: null, accent: '#ed92ad' },
  { id: 'scenario', label: 'Scenario / Context', caption: 'Общий исходный контекст и сценарные якоря', icon: '◉', minWidth: 330, minHeight: 300, maxPerScreen: 1, accent: '#83aedc' },
  { id: 'current', label: 'Current State', caption: 'Фактический срез: требования, архитектура, файлы', icon: '▣', minWidth: 370, minHeight: 370, maxPerScreen: 1, accent: '#5dba9e' },
  { id: 'architecturePlan', label: 'Architecture Planning', caption: 'Полный целевой снимок по Evolution Step', icon: '⌁', minWidth: 420, minHeight: 370, maxPerScreen: 1, accent: '#998af0' },
  { id: 'forecasts', label: 'Forecasts / Deadlines', caption: 'Ожидаемые события и требования, сроки, IF-маршруты', icon: '◴', minWidth: 355, minHeight: 375, maxPerScreen: 1, accent: '#d89e54' },
  { id: 'axes', label: 'Planned Change Axes', caption: 'Прогнозные направления изменений, отдельно от фактов', icon: '⇢', minWidth: 320, minHeight: 330, maxPerScreen: 1, accent: '#8ab1e9' },
  { id: 'hotpaths', label: 'Actual Hot Paths', caption: 'Наблюдавшиеся повторные изменения, без будущих прогнозов', icon: '↯', minWidth: 315, minHeight: 300, maxPerScreen: 1, accent: '#e8a184' },
  { id: 'explorer', label: 'Event / Entity Explorer', caption: 'Переход от фактического события к связанным объектам', icon: '◎', minWidth: 370, minHeight: 355, maxPerScreen: 1, accent: '#61afa4' },
  { id: 'comparison', label: 'Cross-Architecture Comparison', caption: 'Общие стимулы и объяснённые последствия A/B', icon: '⇄', minWidth: 420, minHeight: 380, maxPerScreen: 1, accent: '#77a9d5' },
  { id: 'trace', label: 'Requirement / Implementation Trace', caption: 'Связи потребностей с архитектурой и файлами', icon: '⌘', minWidth: 410, minHeight: 360, maxPerScreen: 1, accent: '#a48cce' },
  { id: 'impactHistory', label: 'Impact History / Future', caption: 'Фактические изменения CURRENT и плановые влияния по цели', icon: '↶', minWidth: 390, minHeight: 350, maxPerScreen: 1, accent: '#d1a76f' },
]
export const getDescriptor = (id: ContentKind): ContentDescriptor => CONTENT.find(item => item.id === id)!
export const FRAME_MIN = { w: 190, h: 156 }
export const INITIAL_WORKSPACE: Workspace = {
  version: 3, activeScreenId: 'screen-1', screens: [
    { id: 'screen-1', title: 'Обзор', panels: [
      { id: 'panel-1', rect: { x: 22, y: 28, w: 350, h: 745 }, tabs: ['plan'], active: 'plan' },
      { id: 'panel-2', rect: { x: 388, y: 28, w: 510, h: 355 }, tabs: ['requirements', 'architecture'], active: 'requirements' },
      { id: 'panel-3', rect: { x: 914, y: 28, w: 330, h: 745 }, tabs: ['events'], active: 'events' },
      { id: 'panel-4', rect: { x: 388, y: 399, w: 510, h: 350 }, tabs: ['fitness', 'impact'], active: 'fitness' },
    ]},
    { id: 'screen-2', title: 'Разбор изменений', panels: [
      { id: 'panel-5', rect: { x: 24, y: 28, w: 565, h: 480 }, tabs: ['architecture', 'implementation'], active: 'architecture' },
      { id: 'panel-6', rect: { x: 605, y: 28, w: 580, h: 480 }, tabs: ['impact', 'work'], active: 'impact' },
    ]},
    { id: 'screen-3', title: 'Факты и связи', panels: [
      { id: 'panel-7', rect: { x: 20, y: 26, w: 400, h: 615 }, tabs: ['current', 'scenario'], active: 'current' },
      { id: 'panel-8', rect: { x: 436, y: 26, w: 415, h: 615 }, tabs: ['explorer', 'comparison'], active: 'explorer' },
      { id: 'panel-9', rect: { x: 868, y: 26, w: 405, h: 615 }, tabs: ['trace', 'hotpaths'], active: 'trace' },
    ]},
    { id: 'screen-4', title: 'План и прогнозы', panels: [
      { id: 'panel-10', rect: { x: 20, y: 26, w: 430, h: 630 }, tabs: ['architecturePlan'], active: 'architecturePlan' },
      { id: 'panel-11', rect: { x: 466, y: 26, w: 412, h: 630 }, tabs: ['forecasts', 'axes'], active: 'forecasts' },
      { id: 'panel-12', rect: { x: 895, y: 26, w: 380, h: 630 }, tabs: ['impactHistory'], active: 'impactHistory' },
    ]},
  ],
}
const clone = (w: Workspace): Workspace => structuredClone(w)
function screenOf(workspace: Workspace, screenId: string): Screen | undefined {
  return workspace.screens.find(s => s.id === screenId)
}
export function currentScreen(w: Workspace): Screen {
  return screenOf(w, w.activeScreenId) ?? w.screens[0]
}
export function countContent(w: Workspace, screenId: string, kind: ContentKind): number {
  return screenOf(w, screenId)?.panels.reduce((n, p) => n + p.tabs.filter(t => t === kind).length, 0) ?? 0
}
export function canAddContent(w: Workspace, screenId: string, kind: ContentKind): boolean {
  const limit = getDescriptor(kind).maxPerScreen
  return limit === null || countContent(w, screenId, kind) < limit
}
export function addScreen(w: Workspace, id: string, title?: string): Workspace {
  if (w.screens.some(s => s.id === id)) return w
  const copy = clone(w)
  copy.screens.push({ id, title: title || 'Экран ' + (w.screens.length + 1), panels: [] })
  copy.activeScreenId = id
  return copy
}
export function removeScreen(w: Workspace, id: string): Workspace {
  if (w.screens.length <= 1 || !screenOf(w, id)) return w
  const copy = clone(w)
  copy.screens = copy.screens.filter(s => s.id !== id)
  if (copy.activeScreenId === id) copy.activeScreenId = copy.screens[0].id
  return copy
}
export function activateScreen(w: Workspace, id: string): Workspace {
  if (!screenOf(w, id)) return w
  return { ...w, activeScreenId: id }
}
export function renameScreen(w: Workspace, id: string, title: string): Workspace {
  if (!title.trim() || !screenOf(w, id)) return w
  const copy = clone(w)
  screenOf(copy, id)!.title = title.trim()
  return copy
}
export function addPanel(w: Workspace, screenId: string, panelId: string, rect?: Rect): Workspace {
  const s = screenOf(w, screenId)
  if (!s || w.screens.some(screen => screen.panels.some(p => p.id === panelId))) return w
  const copy = clone(w)
  let placement: Rect = { x: 24, y: 24, w: 390, h: 330 }
  if (!rect) {
    const isClear = (candidate: Rect) => s.panels.every(p =>
      candidate.x + candidate.w + 12 <= p.rect.x ||
      p.rect.x + p.rect.w + 12 <= candidate.x ||
      candidate.y + candidate.h + 12 <= p.rect.y ||
      p.rect.y + p.rect.h + 12 <= candidate.y)
    search: for (let y = 24; y < 8000; y += 38) {
      for (const x of [24, 430, 836, 1242]) {
        const candidate: Rect = { x, y, w: 390, h: 330 }
        if (isClear(candidate)) { placement = candidate; break search }
      }
    }
  }
  screenOf(copy, screenId)!.panels.push({
    id: panelId, tabs: [], active: null,
    rect: rect ?? placement,
  })
  return copy
}
export function removePanel(w: Workspace, screenId: string, panelId: string): Workspace {
  const s = screenOf(w, screenId)
  if (!s?.panels.some(p => p.id === panelId)) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels = s.panels.filter(p => p.id !== panelId)
  return copy
}
export function addContent(w: Workspace, screenId: string, panelId: string, kind: ContentKind): Workspace {
  const s = screenOf(w, screenId)
  const panel = s?.panels.find(p => p.id === panelId)
  if (!panel || panel.tabs.includes(kind) || !canAddContent(w, screenId, kind)) return w
  const copy = clone(w)
  const updated = screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!
  updated.tabs.push(kind)
  updated.active = kind
  return copy
}
export function removeContent(w: Workspace, screenId: string, panelId: string, kind: ContentKind): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p?.tabs.includes(kind)) return w
  const copy = clone(w)
  const panel = screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!
  panel.tabs = panel.tabs.filter(t => t !== kind)
  if (panel.active === kind) panel.active = panel.tabs[0] ?? null
  return copy
}
export function activateContent(w: Workspace, screenId: string, panelId: string, kind: ContentKind): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p?.tabs.includes(kind)) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!.active = kind
  return copy
}
export function changeRect(w: Workspace, screenId: string, panelId: string, rect: Rect): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!.rect = {
    x: Math.max(0, Math.round(rect.x)), y: Math.max(0, Math.round(rect.y)),
    w: Math.max(FRAME_MIN.w, Math.round(rect.w)), h: Math.max(FRAME_MIN.h, Math.round(rect.h)),
  }
  return copy
}
export function swapPanels(w: Workspace, screenId: string, firstId: string, secondId: string): Workspace {
  if (firstId === secondId) return w
  const s = screenOf(w, screenId)
  const a = s?.panels.find(p => p.id === firstId), b = s?.panels.find(p => p.id === secondId)
  if (!a || !b) return w
  const copy = clone(w), target = screenOf(copy, screenId)!
  const one = target.panels.find(p => p.id === firstId)!, two = target.panels.find(p => p.id === secondId)!
  const first = one.rect
  one.rect = two.rect
  two.rect = first
  return copy
}
/**
 * Find a gap-free rectangle near the drop point and fill it in both axes.
 * The dragged panel is excluded from obstacles. Coordinates are in workspace-board px.
 * Returns null when even the technical frame minimum does not fit.
 */
export function findFreeFitRect(
  workspace: Workspace,
  screenId: string,
  panelId: string,
  point: { x: number; y: number },
  bounds: { w: number; h: number },
  gutter = 12,
): Rect | null {
  const screen = screenOf(workspace, screenId)
  if (!screen?.panels.some(panel => panel.id === panelId) ||
      ![point.x, point.y, bounds.w, bounds.h].every(Number.isFinite) ||
      bounds.w < FRAME_MIN.w || bounds.h < FRAME_MIN.h) return null
  const width = Math.floor(bounds.w), height = Math.floor(bounds.h)
  const obstacles = screen.panels.filter(panel => panel.id !== panelId).map(panel => ({
    x0: Math.max(0, panel.rect.x - gutter),
    x1: Math.min(width, panel.rect.x + panel.rect.w + gutter),
    y0: Math.max(0, panel.rect.y - gutter),
    y1: Math.min(height, panel.rect.y + panel.rect.h + gutter),
  })).filter(r => r.x0 < r.x1 && r.y0 < r.y1)
  const cuts = [...new Set([0, width, ...obstacles.flatMap(r => [r.x0, r.x1])])].sort((a, b) => a - b)
  let best: { rect: Rect; distance: number; area: number; centerDistance: number } | null = null
  for (let left = 0; left < cuts.length; left++) {
    for (let right = left + 1; right < cuts.length; right++) {
      const x = cuts[left], w = cuts[right] - x
      if (w < FRAME_MIN.w) continue
      const covered = obstacles.filter(r => r.x0 < x + w && r.x1 > x)
        .map(r => ({ start: r.y0, end: r.y1 })).sort((a, b) => a.start - b.start)
      let top = 0
      const consider = (end: number) => {
        const h = end - top
        if (h < FRAME_MIN.h) return
        const rect = { x, y: top, w, h }
        const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.w))
        const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.h))
        const distance = dx * dx + dy * dy
        const area = w * h
        const centerDistance = Math.abs(point.x - (x + w / 2)) + Math.abs(point.y - (top + h / 2))
        if (!best || distance < best.distance ||
            (distance === best.distance && area > best.area) ||
            (distance === best.distance && area === best.area && centerDistance < best.centerDistance)) {
          best = { rect, distance, area, centerDistance }
        }
      }
      for (const interval of covered) {
        if (interval.start > top) consider(interval.start)
        top = Math.max(top, interval.end)
      }
      consider(height)
    }
  }
  return (best as { rect: Rect } | null)?.rect ?? null
}

export function undersized(panel: Panel): { width: number; height: number } | null {
  if (!panel.active) return null
  const item = getDescriptor(panel.active)
  return panel.rect.w < item.minWidth || panel.rect.h < item.minHeight
    ? { width: item.minWidth, height: item.minHeight }
    : null
}
export function validateWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const w = value as Workspace
  if (w.version !== 3 || !Array.isArray(w.screens) || !w.screens.length || typeof w.activeScreenId !== 'string') return false
  const ids = new Set<string>()
  for (const s of w.screens) {
    if (!s || !Array.isArray(s.panels) || typeof s.id !== 'string' || typeof s.title !== 'string') return false
    const counts: Partial<Record<ContentKind, number>> = {}
    for (const p of s.panels) {
      if (!p || ids.has(p.id) || !Array.isArray(p.tabs) || !p.rect ||
          ![p.rect.x, p.rect.y, p.rect.w, p.rect.h].every(Number.isFinite)) return false
      ids.add(p.id)
      if (p.active !== null && !p.tabs.includes(p.active)) return false
      for (const kind of p.tabs) {
        if (!CONTENT.some(d => d.id === kind)) return false
        counts[kind] = (counts[kind] ?? 0) + 1
        const max = getDescriptor(kind).maxPerScreen
        if (max !== null && counts[kind]! > max) return false
      }
    }
  }
  return w.screens.some(s => s.id === w.activeScreenId)
}

/** Keeps geometry from v1/v2 while clearing non-equivalent generic demo placements. */
export function migrateLegacyWorkspace(raw: unknown): Workspace | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  if (![1, 2].includes(source.version as number) || !Array.isArray(source.screens)) return null
  try {
    const copy = structuredClone(raw) as Workspace
    copy.version = 3
    // Generic demo views are NOT semantically equivalent to simulator projections.
    // Preserve screens/windows/geometry, but require explicit content reassignment.
    const remap: Record<string, ContentKind | null> = {}
    for (const screen of copy.screens) {
      const seen = new Set<ContentKind>()
      for (const panel of screen.panels) {
        const oldTabs = panel.tabs as unknown as string[]
        const newTabs: ContentKind[] = []
        for (const key of oldTabs) {
          const kind = remap[key]
          if (!kind || newTabs.includes(kind)) continue
          const max = getDescriptor(kind).maxPerScreen
          if (max !== null && seen.has(kind)) continue
          newTabs.push(kind)
          if (max !== null) seen.add(kind)
        }
        const oldActive = panel.active as string | null
        const selected = oldActive ? remap[oldActive] : null
        panel.tabs = newTabs
        panel.active = selected && newTabs.includes(selected) ? selected : newTabs[0] ?? null
      }
    }
    return validateWorkspace(copy) ? copy : null
  } catch { return null }
}
