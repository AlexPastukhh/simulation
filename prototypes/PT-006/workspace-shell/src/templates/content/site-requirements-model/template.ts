import type {TemplateDefinition} from '../../../shell/templateInstances.ts'

/** Reusable Content Template, not a simulation and not a mandatory site screen graph. */
export const SITE_REQUIREMENTS_MODEL_TEMPLATE:TemplateDefinition={
  id:'site-requirements-model',
  version:1,
  profileId:'single-architecture',
  title:'Site Requirements Model',
  description:'Акторы/цели/сценарии, текст и acceptance; необязательные экраны, виджеты, Behavior Units.',
  level:'content',
  fields:['representation','requirements'],
  capabilities:['requirements.read','requirements.describe','requirements.site','requirements.write'],
}
