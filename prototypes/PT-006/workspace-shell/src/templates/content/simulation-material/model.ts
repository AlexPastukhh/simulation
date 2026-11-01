import type {EntityInstance,TemplateDefinition} from '../../../shell/templateInstances.ts'
import {instantiateEntity} from '../../../shell/templateInstances.ts'
export type JsonSchema={type:string|string[];properties?:Record<string,JsonSchema>;required?:string[];additionalProperties?:boolean;items?:JsonSchema;enum?:unknown[];minLength?:number;format?:string;minimum?:number}
const text:JsonSchema={type:'string'},id:JsonSchema={type:'string',minLength:1},date:JsonSchema={type:'string',format:'date'},stamp:JsonSchema={type:'string',format:'date-time'}
const list=(items:JsonSchema):JsonSchema=>({type:'array',items})
const obj=(properties:Record<string,JsonSchema>,required=Object.keys(properties)):JsonSchema=>({type:'object',properties,required,additionalProperties:false})
const strings=list(text)
export function validateData(value:unknown,schema:JsonSchema):boolean{
 const actual=value===null?'null':Array.isArray(value)?'array':typeof value
 if(!(Array.isArray(schema.type)?schema.type:[schema.type]).includes(actual)||schema.enum&&!schema.enum.includes(value))return false
 if(actual==='number')return Number.isFinite(value)&&(schema.minimum===undefined||Number(value)>=schema.minimum)
 if(actual==='string'){
  const s=value as string
  if(schema.minLength&&s.trim().length<schema.minLength)return false
  if(schema.format==='date')return /^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s
  if(schema.format==='date-time')return Number.isFinite(Date.parse(s))&&new Date(s).toISOString()===s
 }
 if(actual==='array'){
  const a=value as unknown[]
  if(a.length>2000||!a.every(v=>schema.items&&validateData(v,schema.items)))return false
  const ids=a.flatMap(v=>v&&typeof v==='object'&&'id'in v?[String(v.id)]:[])
  return new Set(ids).size===ids.length
 }
 if(actual==='object'){
  const r=value as Record<string,unknown>
  return !schema.required?.some(k=>!Object.hasOwn(r,k))&&Object.entries(r).every(([k,v])=>schema.properties?.[k]?validateData(v,schema.properties[k]):schema.additionalProperties!==false)
 }
 return true
}
export const PLANNING_DETAILS_SCHEMA=obj({
 activities:list(obj({id,title:text,kind:text,stepId:text},['id','title','kind'])),
 forecasts:list(obj({id,event:text,predictedRequirement:text,basis:text,route:text},['id','event','predictedRequirement','basis'])),
 routeExpectations:list(obj({id,route:text,condition:text,expectation:text,basis:text})),
 deadlines:list(obj({id,title:text,date,kind:{type:'string',enum:['hard','soft']},source:text})),
 completionForecasts:list(obj({id,date,basis:text,scope:text})),
 changeAxes:list(obj({id,direction:text,horizon:text,salience:text,basis:text})),
})
export type PlanningDetails=Record<string,unknown>
export const emptyPlanningDetails=():PlanningDetails=>({activities:[],forecasts:[],routeExpectations:[],deadlines:[],completionForecasts:[],changeAxes:[]})
const definitions={
 scenario:{title:'Scenario / Environment',schema:obj({title:text,benefit:text,concept:text,actors:strings,path:strings,constraints:strings,context:obj({dynamicity:text,organization:text,engineering:text})}),empty:()=>({title:'',benefit:'',concept:'',actors:[],path:[],constraints:[],context:{dynamicity:'',organization:'',engineering:''}})},
 implementation:{title:'Implementation / Files',schema:obj({
 files:list(obj({id,path:id,nodeId:text,note:text},['id','path'])),
 effects:list(obj({id,stepId:id,path:id,action:{type:'string',enum:['CREATE','MODIFY','DELETE']},nodeId:text,reason:text},['id','stepId','path','action','reason'])),
 }),empty:()=>({files:[],effects:[]})},
 work:{title:'Work Dynamics',schema:obj({
 episodes:list(obj({id,date:stamp,goal:text,activities:strings,evidence:strings})),
 hotPaths:list(obj({id,path:id,touches:{type:'number',minimum:0},note:text})),
 costFacts:list(obj({id,goal:text,kind:text,quantity:{type:['number','null']},unit:text,source:text,note:text})),
 deadlineOutcomes:list(obj({id,deadlineId:text,date,result:{type:'string',enum:['met','missed','changed','unknown']},evidence:text})),
 }),empty:()=>({episodes:[],hotPaths:[],costFacts:[],deadlineOutcomes:[]})},
 fitness:{title:'Evolution Fitness',schema:obj({
 assessments:list(obj({id,goal:text,context:id,route:text,question:text,migration:text,planAlignment:text,oneOffCost:text,repeatedCost:text,reworkCost:text,coordinationCost:text,waitingCost:text,evidence:strings})),
 }),empty:()=>({assessments:[]})},
 trace:{title:'Requirement / Implementation Trace',schema:obj({
 links:list(obj({id,requirementId:id,nodeId:id,filePath:id,note:text})),
 }),empty:()=>({links:[]})},
}
export type MaterialKind=keyof typeof definitions
export type MaterialData=Record<string,unknown>
export type MaterialInstances={ [K in MaterialKind]:EntityInstance<MaterialData> }
export const MATERIAL_KINDS=Object.keys(definitions) as MaterialKind[]
export const MATERIAL_SCHEMAS=Object.fromEntries(MATERIAL_KINDS.map(k=>[k,definitions[k].schema])) as Record<MaterialKind,JsonSchema>
export const MATERIAL_TEMPLATES=Object.fromEntries(MATERIAL_KINDS.map(k=>[k,{
 id:'single-'+k,version:1,profileId:'single-architecture',title:definitions[k].title,level:'content',
 fields:Object.keys(definitions[k].schema.properties!),capabilities:[k+'.read',k+'.write'],
}])) as unknown as Record<MaterialKind,TemplateDefinition>
export function emptyMaterials():MaterialInstances{
 return Object.fromEntries(MATERIAL_KINDS.map(k=>[k,instantiateEntity(MATERIAL_TEMPLATES[k],'material-'+k,definitions[k].title,definitions[k].empty())])) as unknown as MaterialInstances
}
export function validateMaterials(value:unknown):value is MaterialInstances{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==MATERIAL_KINDS.length)return false
 const map=value as Record<string,unknown>
 return MATERIAL_KINDS.every(k=>{
  const v=map[k] as EntityInstance|undefined,t=MATERIAL_TEMPLATES[k]
  return !!v&&v.id==='material-'+k&&v.templateId===t.id&&v.templateVersion===1&&v.level==='content'&&
   typeof v.title==='string'&&v.title.trim().length>0&&!!v.origin&&typeof v.origin.kind==='string'&&
   v.origin.kind.trim().length>0&&validateData(v.data,MATERIAL_SCHEMAS[k])
 })
}
