import type { ResourceRef } from '../../../shell/contexts.ts'
import type { ContentDescriptor, ScreenTemplate } from '../../../shell/workspace.ts'
import type { DemoStore } from '../content.ts'
import { knownRequirements } from '../content.ts'
import { atCursor } from '../history.ts'
import { scopedContentId } from '../../../shell/contexts.ts'

export const COMPARISON_MECHANISM='architecture-comparison-v1'
export type ComparisonFocus='events'|'requirements'|'work'
export type ComparisonScope={
  id:string
  mechanismId:typeof COMPARISON_MECHANISM
  participants:{left:ResourceRef;right:ResourceRef}
  allowedEffects:['read']
  presentation:{contentId:string}
  focus:ComparisonFocus
}
export type ComparisonScopeInput={leftId:string;rightId:string}
export const scopeContentId=(id:string)=>'scope/'+encodeURIComponent(id)
export const parseScopeContentId=(value:string):string|null=>{
  if(!value.startsWith('scope/'))return null
  const part=value.slice(6)
  if(!part||part.includes('/'))return null
  try {const parsed=decodeURIComponent(part);return parsed&&scopeContentId(parsed)===value?parsed:null}catch{return null}
}
export function compatibleContexts(input:ComparisonScopeInput,resolve:(id:string)=>DemoStore|null):{ok:true;left:DemoStore;right:DemoStore}|{ok:false;reason:string}{
  if(!input.leftId||!input.rightId||input.leftId===input.rightId)return {ok:false,reason:'Нужны два разных контекста'}
  const left=resolve(input.leftId),right=resolve(input.rightId)
  if(!left||!right)return {ok:false,reason:'Один из контекстов не предоставляет Architecture'}
  if(left.scenario.caseId!==right.scenario.caseId)return {ok:false,reason:'Разные предметные сценарии'}
  const l=left.scenario.anchors.map(a=>a.id).sort().join('|'),r=right.scenario.anchors.map(a=>a.id).sort().join('|')
  if(!l||l!==r)return {ok:false,reason:'Нет совместимых сценарных якорей'}
  if(!atCursor(left).available||!atCursor(right).available)return {ok:false,reason:'Для одного контекста недоступен выбранный фактический срез'}
  return {ok:true,left,right}
}
export function createComparisonScope(id:string,input:ComparisonScopeInput,resolve:(id:string)=>DemoStore|null):ComparisonScope|null{
  if(!id||id.includes('/')||!compatibleContexts(input,resolve).ok)return null
  const ref=(contextId:string):ResourceRef=>({profileId:'architecture-simulator',contextId,resourceId:'architecture'})
  return {id,mechanismId:COMPARISON_MECHANISM,participants:{left:ref(input.leftId),right:ref(input.rightId)},
    allowedEffects:['read'],presentation:{contentId:scopeContentId(id)},focus:'events'}
}
export function validateComparisonScope(value:unknown,resolve:(id:string)=>DemoStore|null):value is ComparisonScope{
  if(!value||typeof value!=='object')return false
  const s=value as ComparisonScope
  if(typeof s.id!=='string'||!s.id.startsWith('cmp-')||s.id.includes('/')||
    s.mechanismId!==COMPARISON_MECHANISM||s.presentation?.contentId!==scopeContentId(s.id)||
    !Array.isArray(s.allowedEffects)||s.allowedEffects.length!==1||s.allowedEffects[0]!=='read'||
    !['events','requirements','work'].includes(s.focus))return false
  const a=s.participants?.left,b=s.participants?.right
  if(!a||!b||a.profileId!=='architecture-simulator'||b.profileId!=='architecture-simulator'||
    a.resourceId!=='architecture'||b.resourceId!=='architecture')return false
  return compatibleContexts({leftId:a.contextId,rightId:b.contextId},resolve).ok
}
export function comparisonDescriptor(scope:ComparisonScope):ContentDescriptor{
  return {id:scope.presentation.contentId,label:'Comparison · '+scope.participants.left.contextId+' / '+scope.participants.right.contextId,
    caption:'Scope read-only · два явно выбранных контекста',icon:'⇄',minWidth:420,minHeight:380,maxPerScreen:1,accent:'#77a9d5'}
}
/** Ready and manual paths call exactly this composition factory. */
export function comparisonScreens(scope:ComparisonScope):ScreenTemplate[]{
  const a=scopedContentId(scope.participants.left.contextId,'architecture')
  const b=scopedContentId(scope.participants.right.contextId,'architecture')
  return [{id:'comparison-'+scope.id,title:'Сравнение · '+scope.participants.left.contextId+' / '+scope.participants.right.contextId,
    panels:[
      {rect:{x:20,y:26,w:600,h:540},tabs:[a],active:a},
      {rect:{x:638,y:26,w:600,h:540},tabs:[b],active:b},
      {rect:{x:20,y:586,w:900,h:465},tabs:[scope.presentation.contentId],active:scope.presentation.contentId},
    ]}]
}
export function comparisonReadout(scope:ComparisonScope,resolve:(id:string)=>DemoStore|null):{left:string;right:string;leftText:string;rightText:string}|null{
  if(!validateComparisonScope(scope,resolve))return null
  const left=atCursor(resolve(scope.participants.left.contextId)!).data
  const right=atCursor(resolve(scope.participants.right.contextId)!).data
  const detail=(data:DemoStore)=>{
    switch(scope.focus){
      case 'requirements':return knownRequirements(data).map(r=>r.id+' · '+r.title).join('; ')||'Нет известных требований'
      case 'work':return data.work.episodes.map(w=>w.goal+': '+w.evidence).join('; ')||'Нет работы'
      case 'events':{
        const last=data.events.records.find(e=>e.id===data.events.selectedId)??data.events.records.at(-1)
        return last?last.label+' · '+last.provenance:'Нет доступных событий'
      }
    }
  }
  return {left:scope.participants.left.contextId,right:scope.participants.right.contextId,leftText:detail(left),rightText:detail(right)}
}
