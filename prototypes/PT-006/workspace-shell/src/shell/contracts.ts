import type { ReactNode } from 'react'
import type { ContentDescriptor, Workspace } from './workspace.ts'

export type ContentAddress = { profileId: string; instanceId: string }
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
  onContextChanged?: () => void
}
