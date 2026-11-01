import {validateData,PLANNING_DETAILS_SCHEMA} from '../simulation-material/model.ts'
import type {PlanningDetails} from '../simulation-material/model.ts'

/** Architecture is an explicit graph, never inferred from requirement titles. */
export const ARCHITECTURE_NODE_KINDS = [
 'feature','aggregate','entity','value-object','shared-capability','shared-service','cross-cutting-concern',
] as const
export type ArchitectureNodeKind = (typeof ARCHITECTURE_NODE_KINDS)[number]

export type FeatureArchitectureNode = {
  id:string
  kind:ArchitectureNodeKind
  title:string
  parentId?:string
  usedByFeatureIds?:string[]
}

export type FeatureArchitecture = {
  representation:'feature-ddd'
  nodes:FeatureArchitectureNode[]
}

const nonblank=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0
/** Structural validation before persisting or rendering an instance. */
export function validateFeatureArchitecture(model:unknown):model is FeatureArchitecture {
 if(!model||typeof model!=='object')return false
 const m=model as Partial<FeatureArchitecture>
 if(m.representation!=='feature-ddd'||!Array.isArray(m.nodes))return false
 const ids=new Set<string>()
 for(const node of m.nodes){
  if(!node||!nonblank(node.id)||ids.has(node.id)||!ARCHITECTURE_NODE_KINDS.includes(node.kind)||!nonblank(node.title))return false
  ids.add(node.id)
 }
 const byId=new Map(m.nodes.map(node=>[node.id,node]))
 for(const node of m.nodes){
  if(node.parentId!==undefined&&(!nonblank(node.parentId)||node.parentId===node.id||!ids.has(node.parentId)))return false
  if(node.usedByFeatureIds!==undefined&&(!Array.isArray(node.usedByFeatureIds)||
    new Set(node.usedByFeatureIds).size!==node.usedByFeatureIds.length||
    !node.usedByFeatureIds.every(id=>nonblank(id)&&byId.get(id)?.kind==='feature')))return false
  const visited=new Set<string>([node.id])
  let parent=node.parentId
  while(parent!==undefined){
   if(visited.has(parent))return false
   visited.add(parent)
   parent=byId.get(parent)?.parentId
  }
 }
 return true
}

/** A Plan owns CURRENT and its targets. Navigation and the cross-content History archive are separate. */
export type EvolutionStep={id:string;title:string;target:FeatureArchitecture}
export type ArchitecturePlanning={
 representation:'feature-ddd-planning'
 current:FeatureArchitecture
 steps:EvolutionStep[]
 details?:PlanningDetails
}
export function validateEvolutionSteps(value:unknown):value is EvolutionStep[] {
 if(!Array.isArray(value))return false
 const ids=new Set<string>()
 for(const step of value){
  if(!step||!nonblank(step.id)||step.id==='CURRENT'||ids.has(step.id)||
   !nonblank(step.title)||!validateFeatureArchitecture(step.target))return false
  ids.add(step.id)
 }
 return true
}
export function validateArchitecturePlanning(value:unknown):value is ArchitecturePlanning {
 if(!value||typeof value!=='object')return false
 const planning=value as Partial<ArchitecturePlanning>
 return planning.representation==='feature-ddd-planning'&&
  validateFeatureArchitecture(planning.current)&&validateEvolutionSteps(planning.steps)&&
  (planning.details===undefined||validateData(planning.details,PLANNING_DETAILS_SCHEMA))
}
