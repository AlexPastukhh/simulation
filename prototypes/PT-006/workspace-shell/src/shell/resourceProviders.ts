import type { ResourceRef } from './contexts.ts'

/** Read-only provider boundary: capabilities belong to profiles, never a Shell enum. */
export type ResourceSnapshot={
  ref:ResourceRef
  capability:string
  title:string
  summary:string
}
export type ResourceProvider={
  profileId:string
  readResource:(ref:ResourceRef)=>ResourceSnapshot|null
}
export function resolveReadOnlyResource(ref:ResourceRef,providers:readonly ResourceProvider[]):ResourceSnapshot|null {
  if(!ref.profileId||!ref.contextId||!ref.resourceId)return null
  const matches=providers.filter(p=>p.profileId===ref.profileId)
  if(matches.length!==1)return null
  const snapshot=matches[0].readResource(ref)
  if(!snapshot||snapshot.ref.profileId!==ref.profileId||snapshot.ref.contextId!==ref.contextId||
    snapshot.ref.resourceId!==ref.resourceId||typeof snapshot.capability!=='string'||!snapshot.capability.trim()||
    typeof snapshot.title!=='string'||typeof snapshot.summary!=='string')return null
  return structuredClone(snapshot)
}
/** Read-only inspection can span profile boundaries; it is not a domain Comparison. */
export function inspectResources(left:ResourceRef,right:ResourceRef,providers:readonly ResourceProvider[]){
  const a=resolveReadOnlyResource(left,providers),b=resolveReadOnlyResource(right,providers)
  if(!a||!b)return null
  return {left:a,right:b,allowedEffects:['read'] as const}
}
/** Caller owns applicability rules and requests the exact semantic capabilities. */
export function resourcesSupport(refs:readonly ResourceRef[],providers:readonly ResourceProvider[],required:readonly string[]):boolean {
  if(!refs.length||refs.length!==required.length)return false
  return refs.every((ref,index)=>resolveReadOnlyResource(ref,providers)?.capability===required[index])
}