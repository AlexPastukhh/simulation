/** A Content Template defines data shape; an Instance owns editable data. */
export type TemplateLevel = 'content'
export type TemplateDefinition = {
  id: string
  version: number
  profileId: string
  title: string
  description?: string
  level: TemplateLevel
  fields: readonly string[]
  capabilities: readonly string[]
}
export type InstanceOrigin = { kind:string; sourceId?:string }
export type EntityInstance<T=unknown> = {
  id: string
  templateId: string
  templateVersion: number
  level: TemplateLevel
  title: string
  data: T
  origin: InstanceOrigin
}
export type EntityInstanceSummary = Omit<EntityInstance,'data'> & { dataPresent:boolean }
export type TemplateCatalog = {
  templates: TemplateDefinition[]
  instances: EntityInstanceSummary[]
}
const nonempty=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0
const hasFields=(data:unknown,fields:readonly string[]):boolean=>
  !!data&&typeof data==='object'&&fields.every(key=>Object.prototype.hasOwnProperty.call(data,key))

/** Explicit creation without implicit demo fixtures. */
export function instantiateEntity<T>(template:TemplateDefinition,id:string,title:string,data:T,
  origin:InstanceOrigin={kind:'template'}):EntityInstance<T> {
  if(!nonempty(id)||!nonempty(title))throw new Error('Instance ID/title required')
  if(!hasFields(data,template.fields))throw new Error('Instance data lacks template fields')
  return {id,title,templateId:template.id,templateVersion:template.version,
    level:template.level,data:structuredClone(data),origin:{...origin}}
}
export function summarizeInstance(instance:EntityInstance):EntityInstanceSummary {
  const {data,...metadata}=instance
  return {...metadata,dataPresent:data!==null&&data!==undefined}
}
export function createTemplateCatalog(templates:readonly TemplateDefinition[],
  instances:readonly EntityInstanceSummary[]):TemplateCatalog {
  const defined=new Map<string,TemplateDefinition>()
  for(const t of templates){
    if(!nonempty(t.id)||!nonempty(t.profileId)||!nonempty(t.title)||!Number.isInteger(t.version)||
      t.version<1||!Array.isArray(t.fields)||!Array.isArray(t.capabilities)||defined.has(t.id))
      throw new Error('Invalid or duplicate template')
    defined.set(t.id,t)
  }
  const ids=new Set<string>()
  for(const instance of instances){
    const t=defined.get(instance.templateId)
    if(!nonempty(instance.id)||ids.has(instance.id)||!t||
      t.level!==instance.level||t.version!==instance.templateVersion)
      throw new Error('Unresolvable or duplicate entity instance')
    ids.add(instance.id)
  }
  return {templates:templates.map(t=>({...t,fields:[...t.fields],capabilities:[...t.capabilities]})),
  instances:instances.map(i=>({...i,origin:{...i.origin}}))}
}
