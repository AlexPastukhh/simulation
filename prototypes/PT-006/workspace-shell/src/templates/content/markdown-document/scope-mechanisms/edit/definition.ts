import type {MechanicDefinition} from '../../../../../shell/mechanics/contracts.ts'
export const MARKDOWN_EDIT: MechanicDefinition = {
 id:'markdown-document.edit',kind:'scope',title:'Редактирование Markdown',
 description:'Самостоятельные Markdown Content Instances. Writer проверяет структуру и stale bytes и подтверждает read-back.',
 level:'content',effects:['content.write','browser.content.write'],
 sources:[{module:'src/profiles/single-architecture/SingleMarkdown.tsx',symbol:'update'},
  {module:'src/profiles/single-architecture/contentStorage.ts',symbol:'writeContent'}],
 bindings:[{module:'src/profiles/single-architecture/SingleMarkdown.tsx',calls:['update']}],
}
