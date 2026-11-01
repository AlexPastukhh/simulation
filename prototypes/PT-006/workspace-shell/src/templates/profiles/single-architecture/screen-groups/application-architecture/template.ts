import type {ScreenTemplate,ScreenTemplateBundle} from '../../../../../shell/screenTemplates.ts'
export const APPLICATION_ARCHITECTURE_GROUP_TEMPLATE={
 id:'application-architecture-workflow',title:'Архитектура приложения · 4 экрана',
 description:'История и факты → Архитектура и реализация → Планирование → Работа и результаты',
}
export function applicationArchitectureScreenBundle(templates:readonly ScreenTemplate[]):ScreenTemplateBundle {
 return {...APPLICATION_ARCHITECTURE_GROUP_TEMPLATE,templateIds:templates.map(template=>template.id)}
}
