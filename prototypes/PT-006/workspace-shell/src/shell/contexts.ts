import type { Workspace, ScreenTemplate, ContentDescriptor } from './workspace.ts'

/** Identities are separate even if the current layout encodes a binding in tab IDs.
 * The encoding is internal to layout-v3; domain resources never use tab IDs as IDs. */
export type ResourceRef = { profileId: string; contextId: string; resourceId: string }
export type ContextInstance<T> = { id: string; profileId: string; title: string; state: T; templateId: string; provenance?: string; history?: unknown }
export type ContextTemplate<T> = { id: string; profileId: string; title: string; seed: T; screens: ScreenTemplate[] }
const PREFIX='context/'
export function scopedContentId(contextId:string,resourceId:string):string {
  if(!contextId||!resourceId)throw new Error('Context and resource IDs are required')
  return PREFIX+encodeURIComponent(contextId)+'/'+encodeURIComponent(resourceId)
}
export function parseScopedContentId(value:string):{contextId:string;resourceId:string}|null {
  if(!value.startsWith(PREFIX))return null
  const parts=value.slice(PREFIX.length).split('/')
  if(parts.length!==2||!parts[0]||!parts[1])return null
  try {
    const contextId=decodeURIComponent(parts[0]), resourceId=decodeURIComponent(parts[1])
    return contextId&&resourceId&&scopedContentId(contextId,resourceId)===value?{contextId,resourceId}:null
  }catch{return null}
}
export function instantiateContext<T>(template:ContextTemplate<T>,id:string,source?:string):ContextInstance<T> {
  if(!id||!template.id||!template.profileId)throw new Error('A context needs an ID and a template')
  return {id,profileId:template.profileId,title:template.title,state:structuredClone(template.seed),templateId:template.id,...(source?{provenance:source}:{})}
}
/** A template's windows point at this context, not at the original data. */
export function bindContextScreens(contextId:string,templates:readonly ScreenTemplate[]):ScreenTemplate[] {
  return templates.map(t=>({...t,id:contextId+'::'+t.id,title:t.title+' · '+contextId,
    panels:t.panels.map(p=>({...p,rect:{...p.rect},tabs:p.tabs.map(kind=>scopedContentId(contextId,kind)),
      active:p.active===null?null:scopedContentId(contextId,p.active)}))}))
}
export function scopeDescriptors(contextId:string,items:readonly ContentDescriptor[]):ContentDescriptor[] {
  return items.map(d=>({...d,id:scopedContentId(contextId,d.id),label:contextId+' · '+d.label,
    caption:'Контекст '+contextId+' — '+d.caption}))
}
/** Non-destructive import of a pre-existing per-branch layout. */
export function bindLegacyLayout(contextId:string,layout:Workspace):Workspace {
  return {version:3,activeScreenId:contextId+'::'+layout.activeScreenId,
    screens:layout.screens.map(s=>({id:contextId+'::'+s.id,title:contextId+' · '+s.title,
      panels:s.panels.map(p=>({id:contextId+'::'+p.id,rect:{...p.rect},
        tabs:p.tabs.map(kind=>scopedContentId(contextId,kind)),
        active:p.active===null?null:scopedContentId(contextId,p.active)}))}))}
}
export function combineContextLayouts(layouts:readonly Workspace[]):Workspace {
  const screens=layouts.flatMap(w=>w.screens)
  if(!screens.length)throw new Error('At least one context screen is required')
  const seen=new Set<string>()
  for(const s of screens) {
    if(seen.has(s.id))throw new Error('Duplicate screen ID '+s.id)
    seen.add(s.id)
    for(const p of s.panels){
      if(seen.has(p.id))throw new Error('Duplicate panel ID '+p.id)
      seen.add(p.id)
    }
  }
  return {version:3,activeScreenId:layouts[0].activeScreenId,screens:structuredClone(screens)}
}
