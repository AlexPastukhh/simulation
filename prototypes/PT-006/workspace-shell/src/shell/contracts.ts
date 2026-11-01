import type { ReactNode } from 'react'
import type { ContentDescriptor, Workspace } from './workspace.ts'
import type { TemplateCatalog } from './templateInstances.ts'
import type { ScreenTemplate, ScreenTemplateBundle } from './screenTemplates.ts'
import type {MechanicCatalog,MechanicObserver} from './mechanics/contracts.ts'
export type ContentLocation={panelId:string;screenId:string;viewId:string}

export type WorkspaceProfile = {
  id: string
  title: string
  subtitle: string
  descriptors: ContentDescriptor[]
  initialWorkspace: Workspace
  previousInitialWorkspaces?: readonly Workspace[]
  previousLayoutArchiveKey?: string
  screenTemplates?: readonly ScreenTemplate[]
  screenBundles?: readonly ScreenTemplateBundle[]
  /** Metadata for templates and persisted Content Instances. */
  getTemplateCatalog?: () => TemplateCatalog
  workspaceId: string
  layoutKey: (workspaceId: string) => string
  renderFactualTime: () => ReactNode
  getMechanicsCatalog?: (locations:readonly ContentLocation[]) => MechanicCatalog
  attachMechanics?: (observer:MechanicObserver) => (()=>void)
  renderContent: (id: string, open: (descriptorId:string)=>void, location?:ContentLocation) => ReactNode
}