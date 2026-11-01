import type {MechanicDefinition} from '../../../../../shell/mechanics/contracts.ts'
export const CONTENT_EDIT: MechanicDefinition = {
 id:'single-architecture.content-edit',kind:'scope',title:'Редактирование предметных Content',
 description:'Изменяет реальные владельцы Architecture Planning, Requirements и Materials. History read-only; validation, Web Lock, stale bytes и read-back проверяются writer.',
 level:'content',effects:['content.write','browser.content.write','history.create.explicit'],
 sources:[{module:'src/profiles/single-architecture/SingleArchitectureProfile.tsx',symbol:'update'},
  {module:'src/profiles/single-architecture/contentStorage.ts',symbol:'serializeContentWrite'},
  {module:'src/profiles/single-architecture/contentStorage.ts',symbol:'writeContent'}],
 bindings:[{module:'src/profiles/single-architecture/SingleArchitectureProfile.tsx',calls:['update','updateArch','saveMaterial','savePlanning','onSave']},
  {module:'src/profiles/single-architecture/SourceEditor.tsx',calls:['save']}],
}
