import type {EntityInstance} from '../../shell/templateInstances.ts'
import {validateMaterials,validateData,PLANNING_DETAILS_SCHEMA} from '../../templates/content/simulation-material/model.ts'
import type {MaterialInstances,PlanningDetails} from '../../templates/content/simulation-material/model.ts'
import type {FeatureArchitecture,ArchitecturePlanning,EvolutionStep} from '../../templates/content/feature-ddd-architecture-planning/model.ts'
import type {SiteRequirementsModel} from '../../templates/content/site-requirements-model/model.ts'
import {validateFeatureArchitecture,validateArchitecturePlanning,validateEvolutionSteps} from '../../templates/content/feature-ddd-architecture-planning/model.ts'
import {validateSiteRequirementsModel} from '../../templates/content/site-requirements-model/model.ts'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE as ARCHITECTURE} from '../../templates/content/feature-ddd-architecture-planning/template.ts'
import {SITE_REQUIREMENTS_MODEL_TEMPLATE as REQUIREMENTS} from '../../templates/content/site-requirements-model/template.ts'

export type ActualCheckpoint={id:string;title:string;recordedAt:string;architecture:FeatureArchitecture;requirements:SiteRequirementsModel;steps:EvolutionStep[];materials?:MaterialInstances;planningDetails?:PlanningDetails}
export type SingleState={
 version:2
 architecture:EntityInstance<ArchitecturePlanning>
 requirements:EntityInstance<SiteRequirementsModel>
 history:ActualCheckpoint[]
 materials?:MaterialInstances
}
export type Navigation={selection:string;selectedEventId:string|null}
export const CURRENT_VIEW:Navigation={selection:'CURRENT',selectedEventId:null}
const nonblank=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
function instance(value:unknown,id:string,templateId:string,version:number):value is EntityInstance {
 return record(value)&&value.id===id&&value.templateId===templateId&&
  value.templateVersion===version&&value.level==='content'&&nonblank(value.title)&&
  record(value.origin)&&nonblank(value.origin.kind)
}
function validHistory(value:unknown):value is ActualCheckpoint[] {
 if(!Array.isArray(value)||value.length>200)return false
 const ids=new Set<string>()
 for(const event of value){
  if(!record(event)||!nonblank(event.id)||ids.has(event.id)||!nonblank(event.title)||
   typeof event.recordedAt!=='string'||!Number.isFinite(Date.parse(event.recordedAt))||
   new Date(event.recordedAt).toISOString()!==event.recordedAt||
   !validateFeatureArchitecture(event.architecture)||!validateSiteRequirementsModel(event.requirements)||
   !validateEvolutionSteps(event.steps)||
   (event.materials!==undefined&&!validateMaterials(event.materials))||
   (event.planningDetails!==undefined&&!validateData(event.planningDetails,PLANNING_DETAILS_SCHEMA)))return false
  ids.add(event.id)
 }
 return true
}
export function validateSingleState(value:unknown):value is SingleState {
 return record(value)&&value.version===2&&
  instance(value.architecture,'architecture-main',ARCHITECTURE.id,ARCHITECTURE.version)&&
  instance(value.requirements,'requirements-main',REQUIREMENTS.id,REQUIREMENTS.version)&&
  validateArchitecturePlanning(value.architecture.data)&&validateSiteRequirementsModel(value.requirements.data)&&
  validHistory(value.history)&&(value.materials===undefined||validateMaterials(value.materials))
}
export function validateNavigation(value:unknown,state:SingleState):value is Navigation {
 if(!record(value)||!nonblank(value.selection)||
  (value.selectedEventId!==null&&(!nonblank(value.selectedEventId)||
   !state.history.some(event=>event.id===value.selectedEventId))))return false
 const historical=state.history.find(event=>event.id===value.selectedEventId)
 return value.selection==='CURRENT'||(historical?.steps??state.architecture.data.steps)
  .some(step=>step.id===value.selection)
}
export function normalizeNavigation(value:unknown,state:SingleState):Navigation {
 return validateNavigation(value,state)?{selection:value.selection,selectedEventId:value.selectedEventId}:
  {...CURRENT_VIEW}
}
/** Only the application's preceding single-architecture v1 save is accepted; no legacy Context formats. */
export function decodeSingleState(value:unknown):SingleState|null {
 if(validateSingleState(value))return value
 if(!record(value)||value.version!==1||
  !instance(value.architecture,'architecture-main',ARCHITECTURE.id,1)||
  !instance(value.requirements,'requirements-main',REQUIREMENTS.id,REQUIREMENTS.version)||
  !validateFeatureArchitecture(value.architecture.data)||!validateEvolutionSteps(value.steps)||
  !validateSiteRequirementsModel(value.requirements.data)||
  (value.history!==undefined&&!validHistory(value.history)))return null
 const state:SingleState={
  version:2,
  architecture:{...value.architecture,templateVersion:ARCHITECTURE.version,
   data:{representation:'feature-ddd-planning',current:structuredClone(value.architecture.data),steps:structuredClone(value.steps)}},
  requirements:structuredClone(value.requirements) as EntityInstance<SiteRequirementsModel>,
  history:structuredClone(value.history??[]) as ActualCheckpoint[],
 }
 return validateNavigation({selection:value.selection,selectedEventId:value.selectedEventId??null},state)?state:null
}
/** CURRENT resolves directly to fact, never via a Step with a reserved ID. */
export function resolveArchitecture(state:SingleState,view:Navigation):FeatureArchitecture {
 const historical=state.history.find(event=>event.id===view.selectedEventId)
 const planning=state.architecture.data
 const factual=historical?.architecture??planning.current
 if(view.selection==='CURRENT')return factual
 return (historical?.steps??planning.steps).find(step=>step.id===view.selection)?.target??factual
}
