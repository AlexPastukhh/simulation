/**
 * Site Requirements Model Content class.
 * Requirements are intentionally not normalized into Screen/Widget/Feature owners.
 */
export type SiteRequirementOccurrence = {
  id:string
  text:string
  acceptance?:string[]
  knownFromEventId?:string
  uncertainty?:string
}

export const SITE_ARTIFACT_KINDS = [
 'actor','goal','scenario','step','screen','widget','behavior-unit','api-contract','workflow','other',
] as const
export type SiteArtifactKind = (typeof SITE_ARTIFACT_KINDS)[number]
/**
 * ONE requirement-side occurrence, not a reusable Widget/Behavior Unit definition.
 * Equal kind/title/behavior never merges IDs. Multiple requirements may describe
 * this same *occurrence* without making it shared across two product placements.
 */
export type SiteRequirementArtifact = {
  id:string
  kind:SiteArtifactKind
  title:string
  /** One optional product placement. A second appearance has its own occurrence ID. */
  parentOccurrenceId?:string
  /** Traceability to statements: N:M does not imply a shared implementation. */
  requirementIds?:string[]
}
export type SiteRequirementsModel = {
  representation:'site-requirements'
  requirements:SiteRequirementOccurrence[]
  /** Optional product-side material; empty for text-only requirements. */
  artifacts?:SiteRequirementArtifact[]
}

const nonblank=(text:unknown):text is string=>typeof text==='string'&&text.trim().length>0
const unique=(values:readonly string[])=>new Set(values).size===values.length
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const onlyFields=(v:Record<string,unknown>,fields:readonly string[])=>Object.keys(v).every(key=>fields.includes(key))
const optionalText=(v:unknown)=>v===undefined||typeof v==='string'

/** Validate the closed v1 shape, occurrence identity and explicit placement links. */
export function validateSiteRequirementsModel(model:unknown):model is SiteRequirementsModel {
  if(!record(model)||!onlyFields(model,['representation','requirements','artifacts'])||
    model.representation!=='site-requirements'||!Array.isArray(model.requirements)||
    !model.requirements.every(r=>record(r)&&
      onlyFields(r,['id','text','acceptance','knownFromEventId','uncertainty'])&&
      nonblank(r.id)&&nonblank(r.text)&&
      (r.acceptance===undefined||(Array.isArray(r.acceptance)&&r.acceptance.every(text=>typeof text==='string')))&&
      optionalText(r.knownFromEventId)&&optionalText(r.uncertainty)))return false
  const requirements=model.requirements as SiteRequirementOccurrence[]
  if(!unique(requirements.map(r=>r.id)))return false

  const rawArtifacts=model.artifacts===undefined?[]:model.artifacts
  if(!Array.isArray(rawArtifacts)||!rawArtifacts.every(a=>record(a)&&
    onlyFields(a,['id','kind','title','parentOccurrenceId','requirementIds'])&&
    nonblank(a.id)&&nonblank(a.title)&&typeof a.kind==='string'&&
    SITE_ARTIFACT_KINDS.includes(a.kind as SiteArtifactKind)))return false
  const artifacts=rawArtifacts as SiteRequirementArtifact[]
  if(!unique(artifacts.map(a=>a.id)))return false

  const byId=new Map(artifacts.map(a=>[a.id,a]))
  const requirementIds=new Set(requirements.map(r=>r.id))
  const refsValid=(refs:unknown)=>
    refs===undefined||(Array.isArray(refs)&&refs.every(ref=>nonblank(ref)&&requirementIds.has(ref))&&unique(refs))

  for(const artifact of artifacts){
    if(!refsValid(artifact.requirementIds))return false
    const parent=artifact.parentOccurrenceId
    if(parent!==undefined&&(!nonblank(parent)||parent===artifact.id||!byId.has(parent)))return false
    const visited=new Set([artifact.id])
    let cursor=parent
    while(cursor!==undefined){
      if(visited.has(cursor))return false
      visited.add(cursor)
      cursor=byId.get(cursor)?.parentOccurrenceId
    }
  }
  return true
}
