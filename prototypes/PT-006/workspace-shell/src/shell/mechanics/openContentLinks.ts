import type {SourceMetadata,UISource} from './contracts.ts'
import type {Workspace} from '../workspace.ts'

export type OpenContentLink={
 screenId:string;screenTitle:string;panelId:string;viewId:string;active:boolean;source:UISource
}
/** Source declarations describe possible buttons; Workspace locations describe where their views are placed. */
export function collectOpenContentLinks(workspace:Workspace,index:SourceMetadata):OpenContentLink[] {
 const routes=Object.values(index.files).flatMap(file=>file.surfaces.filter(surface=>
  surface.type==='ui'&&surface.opensContent&&surface.ownerViews?.length)) as UISource[]
 const links:OpenContentLink[]=[]
 for(const screen of workspace.screens){
  for(const panel of screen.panels){
   for(const viewId of panel.tabs){
    for(const source of routes){
     if(source.ownerViews?.includes(viewId))links.push({
      screenId:screen.id,screenTitle:screen.title,panelId:panel.id,viewId,
      active:screen.id===workspace.activeScreenId&&panel.active===viewId,source,
     })
    }
   }
  }
 }
 return links
}
