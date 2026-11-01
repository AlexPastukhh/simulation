import type {MechanicDefinition} from '../../../../../../../shell/mechanics/contracts.ts'
export const HISTORY_PLAN_NAVIGATION: MechanicDefinition = {
 id:'single-architecture.history-plan-navigation',kind:'scope',title:'Event / Step → состояние группы экранов',
 description:'Один курсор связанных представлений одной архитектуры. Повторные наборы зеркальные; просмотр не исполняет Step и не изменяет сохранённые факты.',
 level:'screen-group',effects:['scope.navigation.write','view.project','browser.view.write'],
 sources:[{module:'src/templates/profiles/single-architecture/screen-groups/application-architecture/scope-mechanisms/history-and-plan-navigation/mechanic.ts',symbol:'changeHistoryPlanNavigation'},
  {module:'src/profiles/single-architecture/state.ts',symbol:'resolveArchitecture'},
  {module:'src/profiles/single-architecture/contentProjection.ts'}],
 bindings:[{module:'src/profiles/single-architecture/SingleArchitectureProfile.tsx',calls:['navigate']}],
}
