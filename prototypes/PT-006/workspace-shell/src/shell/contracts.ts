import type { ReactNode } from 'react'
import type { ContentDescriptor, Workspace, ScreenTemplate, ScreenTemplateBundle } from './workspace.ts'

export type ContentAddress = { profileId: string; instanceId: string; contextId?: string }
export type WorkspaceEvent = { type: 'open-content'; target: ContentAddress }
export type InspectorMode = 'preview' | 'state' | 'schema' | 'history'
export type InspectorActions = {
  countOnScreen: (id: string) => number
  canAddOnScreen: (id: string) => boolean
  createWindow: (id: string) => void
  openContent: (id: string) => void
}
export type WorkspaceProfile = {
  id: string
  title: string
  subtitle: string
  descriptors: ContentDescriptor[]
  initialWorkspace: Workspace
  screenTemplates?: ScreenTemplate[]
  screenBundles?: ScreenTemplateBundle[]
  /** A Context Template creates independent profile state, then Shell places its screens atomically. */
  contextTemplateOptions?: { id: string; title: string; description?: string }[]
  createContext?: (templateId?: string) => { id: string; descriptors: ContentDescriptor[]; templates: ScreenTemplate[]; commit: () => void } | null
  /** Map a structured Context resource address to the private layout tab ID. */
  resolveContentAddress?: (target: ContentAddress) => string | null
  contextId: string
  contexts: string[]
  layoutKey: (contextId: string) => string
  legacyLayoutKey: (contextId: string) => string
  migrateLayout: (raw: unknown) => Workspace | null
  renderHeader: () => ReactNode
  renderFactualTime: () => ReactNode
  renderContent: (id: string, dispatch: (event: WorkspaceEvent) => void) => ReactNode
  renderPanelTools: (id: string) => ReactNode
  renderInspector: (actions: InspectorActions) => ReactNode
  openInspector: (id: string, mode: InspectorMode) => void
  resetContent: () => void
  resetScope?: 'layout-only' | 'layout-and-content'
  onContextChanged?: () => void
}
