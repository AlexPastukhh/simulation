export type ContentId = string
export type Rect = { x: number; y: number; w: number; h: number }
export type Panel = { id: string; rect: Rect; tabs: ContentId[]; active: ContentId | null }
export type Screen = { id: string; title: string; panels: Panel[] }
export type ScreenGroup = { id: string; title: string; screenIds: string[] }
export type Workspace = { version: 3; activeScreenId: string; screens: Screen[]; screenGroups?: ScreenGroup[] }
/** Templates describe placements, not copies of any profile's content data. */
export type NewWorkspaceId = (kind: 'screen' | 'panel') => string
export type ContentDescriptor = { id: ContentId; label: string; caption: string; icon: string; minWidth: number; minHeight: number; maxPerScreen: number | null; accent: string }
export const FRAME_MIN = { w: 190, h: 156 }
export function findOpenContentWindow(workspace:Workspace,contentId:ContentId):{screenId:string;panelId:string}|null {
 const active=workspace.screens.find(s=>s.id===workspace.activeScreenId)??workspace.screens[0]
 if(!active)return null
 for(const screen of [active,...workspace.screens.filter(s=>s.id!==active.id)]){
  const panel=screen.panels.find(p=>p.tabs.includes(contentId))
  if(panel)return {screenId:screen.id,panelId:panel.id}
 }
 return null
}
export function createWorkspaceModel(CONTENT: readonly ContentDescriptor[]) {
  const getDescriptor = (id: ContentId): ContentDescriptor => {
    const value=CONTENT.find(item=>item.id===id)
    if(!value) throw new Error('Unknown content: '+id)
    return value
  }
const clone = (w: Workspace): Workspace => structuredClone(w)
function screenOf(workspace: Workspace, screenId: string): Screen | undefined {
  return workspace.screens.find(s => s.id === screenId)
}
function currentScreen(w: Workspace): Screen {
  return screenOf(w, w.activeScreenId) ?? w.screens[0]
}
function countContent(w: Workspace, screenId: string, kind: ContentId): number {
  return screenOf(w, screenId)?.panels.reduce((n, p) => n + p.tabs.filter(t => t === kind).length, 0) ?? 0
}
function canAddContent(w: Workspace, screenId: string, kind: ContentId): boolean {
  const limit = getDescriptor(kind).maxPerScreen
  return limit === null || countContent(w, screenId, kind) < limit
}
function addScreen(w: Workspace, id: string, title?: string): Workspace {
  if (w.screens.some(s => s.id === id)) return w
  const copy = clone(w)
  copy.screens.push({ id, title: title || 'Экран ' + (w.screens.length + 1), panels: [] })
  copy.activeScreenId = id
  return copy
}
/** Copy only window composition: the same content IDs still address the same profile data. */
function duplicateScreen(w: Workspace, sourceId: string, makeId: NewWorkspaceId): Workspace | null {
  const source=screenOf(w,sourceId)
  if(!source) return null
  const copy=clone(w), known=new Set([...w.screens.map(s=>s.id),...w.screens.flatMap(s=>s.panels.map(p=>p.id))])
  const next=(kind:'screen'|'panel')=>{
    const id=makeId(kind)
    if(!id||known.has(id)) return null
    known.add(id)
    return id
  }
  const id=next('screen')
  if(!id) return null
  const panels: Panel[]=[]
  for(const p of source.panels){
    const panelId=next('panel')
    if(!panelId)return null
    panels.push({...structuredClone(p),id:panelId})
  }
  copy.screens.push({id,title:source.title+' — копия',panels})
  copy.activeScreenId=id
  return copy
}
function removeScreen(w: Workspace, id: string): Workspace {
  if (w.screens.length <= 1 || !screenOf(w, id)) return w
  const copy = clone(w)
  copy.screens = copy.screens.filter(s => s.id !== id)
  copy.screenGroups = copy.screenGroups?.map(g=>({...g,screenIds:g.screenIds.filter(sid=>sid!==id)})).filter(g=>g.screenIds.length>=2)
  if (copy.activeScreenId === id) copy.activeScreenId = copy.screens[0].id
  return copy
}
/** Groups only change the screen rail: they never move screens, windows or domain State. */
function saveScreenGroup(w:Workspace,id:string,title:string,screenIds:readonly string[]):Workspace|null {
  const label=title.trim()
  if(!id||!label||label.length>100||screenIds.length<2||new Set(screenIds).size!==screenIds.length)return null
  const known=new Set(w.screens.map(s=>s.id))
  if(screenIds.some(sid=>!known.has(sid)))return null
  const groups=w.screenGroups??[]
  if(groups.some(g=>g.id!==id&&g.screenIds.some(sid=>screenIds.includes(sid))))return null
  const existing=groups.some(g=>g.id===id)
  const group={id,title:label,screenIds:[...screenIds]}
  return {...w,screenGroups:existing?groups.map(g=>g.id===id?group:g):[...groups,group]}
}
function removeScreenGroup(w:Workspace,id:string):Workspace {
  if(!w.screenGroups?.some(g=>g.id===id))return w
  return {...w,screenGroups:w.screenGroups.filter(g=>g.id!==id)}
}
function activateScreen(w: Workspace, id: string): Workspace {
  if (!screenOf(w, id)) return w
  return { ...w, activeScreenId: id }
}
function renameScreen(w: Workspace, id: string, title: string): Workspace {
  if (!title.trim() || !screenOf(w, id)) return w
  const copy = clone(w)
  screenOf(copy, id)!.title = title.trim()
  return copy
}
function addPanel(w: Workspace, screenId: string, panelId: string, rect?: Rect): Workspace {
  const s = screenOf(w, screenId)
  if (!s || w.screens.some(screen => screen.id === panelId || screen.panels.some(p => p.id === panelId))) return w
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
function removePanel(w: Workspace, screenId: string, panelId: string): Workspace {
  const s = screenOf(w, screenId)
  if (!s?.panels.some(p => p.id === panelId)) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels = s.panels.filter(p => p.id !== panelId)
  return copy
}
function addContent(w: Workspace, screenId: string, panelId: string, kind: ContentId): Workspace {
  const s = screenOf(w, screenId)
  const panel = s?.panels.find(p => p.id === panelId)
  if (!panel || panel.tabs.includes(kind) || !canAddContent(w, screenId, kind)) return w
  const copy = clone(w)
  const updated = screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!
  updated.tabs.push(kind)
  updated.active = kind
  return copy
}
function removeContent(w: Workspace, screenId: string, panelId: string, kind: ContentId): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p?.tabs.includes(kind)) return w
  const copy = clone(w)
  const panel = screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!
  panel.tabs = panel.tabs.filter(t => t !== kind)
  if (panel.active === kind) panel.active = panel.tabs[0] ?? null
  return copy
}
function activateContent(w: Workspace, screenId: string, panelId: string, kind: ContentId): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p?.tabs.includes(kind)) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!.active = kind
  return copy
}
function changeRect(w: Workspace, screenId: string, panelId: string, rect: Rect): Workspace {
  const p = screenOf(w, screenId)?.panels.find(p => p.id === panelId)
  if (!p) return w
  const copy = clone(w)
  screenOf(copy, screenId)!.panels.find(p => p.id === panelId)!.rect = {
    x: Math.max(0, Math.round(rect.x)), y: Math.max(0, Math.round(rect.y)),
    w: Math.max(FRAME_MIN.w, Math.round(rect.w)), h: Math.max(FRAME_MIN.h, Math.round(rect.h)),
  }
  return copy
}
function swapPanels(w: Workspace, screenId: string, firstId: string, secondId: string): Workspace {
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
function findFreeFitRect(
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

function undersized(panel: Panel): { width: number; height: number } | null {
  if (!panel.active) return null
  const item = getDescriptor(panel.active)
  return panel.rect.w < item.minWidth || panel.rect.h < item.minHeight
    ? { width: item.minWidth, height: item.minHeight }
    : null
}
function validateWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const w = value as Workspace
  if (w.version !== 3 || !Array.isArray(w.screens) || !w.screens.length || typeof w.activeScreenId !== 'string') return false
  const ids = new Set<string>()
  for (const s of w.screens) {
    if (!s || !Array.isArray(s.panels) || typeof s.id !== 'string' || !s.id.trim() ||
        typeof s.title !== 'string' || ids.has(s.id)) return false
    ids.add(s.id)
  }
  for (const s of w.screens) {
    const counts: Partial<Record<ContentId, number>> = {}
    for (const p of s.panels) {
      if (!p || typeof p.id !== 'string' || !p.id.trim() || ids.has(p.id) ||
          !Array.isArray(p.tabs) || !p.rect ||
          ![p.rect.x, p.rect.y, p.rect.w, p.rect.h].every(Number.isFinite) ||
          p.rect.x < 0 || p.rect.y < 0 || p.rect.w < FRAME_MIN.w || p.rect.h < FRAME_MIN.h ||
          (p.active !== null && (typeof p.active !== 'string' || !p.tabs.includes(p.active))) ||
          new Set(p.tabs).size !== p.tabs.length) return false
      ids.add(p.id)
      for (const kind of p.tabs) {
        if (typeof kind !== 'string' || !CONTENT.some(d => d.id === kind)) return false
        counts[kind] = (counts[kind] ?? 0) + 1
        const max = getDescriptor(kind).maxPerScreen
        if (max !== null && counts[kind]! > max) return false
      }
    }
  }
  if(w.screenGroups!==undefined){
    if(!Array.isArray(w.screenGroups)||w.screenGroups.length>100)return false
    const groupIds=new Set<string>(),members=new Set<string>()
    const screens=new Set(w.screens.map(s=>s.id))
    for(const g of w.screenGroups){
      if(!g||typeof g.id!=='string'||!g.id.trim()||groupIds.has(g.id)||screens.has(g.id)||
        typeof g.title!=='string'||!g.title.trim()||g.title.length>100||
        !Array.isArray(g.screenIds)||g.screenIds.length<2)return false
      groupIds.add(g.id)
      for(const id of g.screenIds){
        if(typeof id!=='string'||!screens.has(id)||members.has(id))return false
        members.add(id)
      }
    }
  }
  return w.screens.some(s => s.id === w.activeScreenId)
}

  /** Reuse an existing descriptor view across screens before allocating a window. */
  function openContent(workspace: Workspace, contentId: ContentId, newPanelId: string):
    { workspace: Workspace; screenId: string; panelId: string; created: boolean } | null {
    if (!CONTENT.some(item => item.id === contentId)) return null
    const existing = findOpenContentWindow(workspace, contentId)
    if(existing)return {
      workspace: activateContent(activateScreen(workspace,existing.screenId),existing.screenId,existing.panelId,contentId),
      ...existing,created:false,
    }
    const screenId = currentScreen(workspace).id
    const created = addContent(addPanel(workspace, screenId, newPanelId), screenId, newPanelId, contentId)
    if (!created.screens.some(screen => screen.panels.some(panel => panel.id === newPanelId && panel.active === contentId))) return null
    return { workspace: created, screenId, panelId: newPanelId, created: true }
  }

  const hasDescriptor = (id:ContentId)=>CONTENT.some(d=>d.id===id)
  return {getDescriptor, hasDescriptor, currentScreen, countContent, canAddContent, addScreen, duplicateScreen, removeScreen, activateScreen, renameScreen, saveScreenGroup, removeScreenGroup, addPanel, removePanel, addContent, removeContent, activateContent, changeRect, swapPanels, findFreeFitRect, undersized, validateWorkspace, openContent}
}
