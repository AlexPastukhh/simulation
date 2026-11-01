import type {SingleState,Navigation} from './state.ts'
import type {MaterialInstances,MaterialData,PlanningDetails} from '../../templates/content/simulation-material/model.ts'
import {emptyMaterials,emptyPlanningDetails} from '../../templates/content/simulation-material/model.ts'
export type MaterialRow=Record<string,unknown>
export const materialRows=(data:MaterialData|PlanningDetails|undefined,key:string):MaterialRow[]=>
 Array.isArray(data?.[key])?data[key] as MaterialRow[]:[]
export function factualMaterials(state:SingleState,view:Navigation):MaterialInstances|null{
 const snapshot=state.history.find(e=>e.id===view.selectedEventId)
 return snapshot?snapshot.materials??null:state.materials??emptyMaterials()
}
export function planningDetails(state:SingleState,view:Navigation):PlanningDetails|null{
 const snapshot=state.history.find(e=>e.id===view.selectedEventId)
 return snapshot?snapshot.planningDetails??null:state.architecture.data.details??emptyPlanningDetails()
}
