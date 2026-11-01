import type { Panel, Workspace } from './workspace.ts'
import type { createWorkspaceModel } from './workspace.ts'

/** Layout recipes reference existing views; they never instantiate Content. */
export type ScreenTemplate = {
  id: string
  title: string
  description: string
  panels: Omit<Panel, 'id'>[]
}
export type ScreenTemplateBundle = {
  id: string
  title: string
  description: string
  templateIds: string[]
}
export type ScreenTemplatePlacement = {
  templateId: string
  screenId: string
  panelIds: string[]
}
type Ops = ReturnType<typeof createWorkspaceModel>

/** Validate the complete proposed layout before returning any of its screens. */
export function appendTemplateScreens(
  workspace: Workspace, templates: readonly ScreenTemplate[],
  placements: readonly ScreenTemplatePlacement[], ops: Ops,
): Workspace | null {
  if (!placements.length) return null
  const next = structuredClone(workspace)
  for (const placement of placements) {
    const template = templates.find(t => t.id === placement.templateId)
    if (!template || placement.panelIds.length !== template.panels.length) return null
    next.screens.push({
      id: placement.screenId, title: template.title,
      panels: template.panels.map((panel, index) => ({
        ...structuredClone(panel), id: placement.panelIds[index],
      })),
    })
  }
  next.activeScreenId = placements[0].screenId
  return ops.validateWorkspace(next) ? next : null
}

/** Match only the known untouched default, including IDs, geometry and all fields. */
export function matchesWorkspaceLayout(value: unknown, expected: Workspace): boolean {
  const canonical = (input: unknown) => JSON.stringify(input, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item)
  return canonical(value) === canonical(expected)
}

/** A cursor change is not a custom composition; geometry, tabs and extra fields still must match. */
export function matchesDefaultComposition(value:Workspace,expected:Workspace):boolean {
  const candidate=structuredClone(expected)
  candidate.activeScreenId=value.activeScreenId
  for(const screen of candidate.screens)for(const panel of screen.panels){
    const actual=value.screens.find(s=>s.id===screen.id)?.panels.find(p=>p.id===panel.id)
    if(actual&&panel.tabs.includes(actual.active??''))panel.active=actual.active
  }
  return matchesWorkspaceLayout(value,candidate)
}
