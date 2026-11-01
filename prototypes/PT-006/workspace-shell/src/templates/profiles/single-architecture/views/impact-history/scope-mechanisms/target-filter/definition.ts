import type {MechanicDefinition} from '../../../../../../../shell/mechanics/contracts.ts'
export const IMPACT_TARGET_FILTER: MechanicDefinition = {
 id:'single-architecture.impact-target-filter',kind:'scope',title:'Impact History → цель влияния',
 description:'Локальный фильтр архитектурного элемента или файла. Отсутствующий в срезе target означает «Все изменения», без скрытого фильтра другого вида.',
 level:'view',effects:['view.local-filter'],
 sources:[{module:'src/profiles/single-architecture/MaterialViews.tsx',symbol:'MaterialView'}],
 bindings:[{module:'src/profiles/single-architecture/MaterialViews.tsx',calls:['setTarget']}],
}
