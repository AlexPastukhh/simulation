import type {TemplateDefinition} from '../../../shell/templateInstances.ts'

/** Registered Content Template for the single editable architecture. */
export const FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE:TemplateDefinition={
  id:'feature-ddd-architecture-planning',
  version:2,
  profileId:'single-architecture',
  title:'Feature/DDD Architecture Planning',
  description:'Фичи, агрегаты, сущности, value objects, shared capabilities/services и их связи.',
  level:'content',
  fields:['representation','current','steps'],
  capabilities:['architecture.read','architecture.plan','architecture.feature-ddd','architecture.write'],
}
