import type { ResourceRef } from '../../shell/contexts.ts'
import {scopeDescriptors,scopedContentId} from '../../shell/contexts.ts'
import type { ContentDescriptor,Workspace,ScreenTemplate } from '../../shell/workspace.ts'
import type {ResourceSnapshot} from '../../shell/resourceProviders.ts'

export const MARKDOWN_ID='markdown-fixture'
export const MARKDOWN_STORE='pt006-markdown-contexts-v1'
export const MARKDOWN_LAYOUT='pt006-markdown-layout-v1'
export type MarkdownContext={id:string;title:string;document:{title:string;body:string}}
export type MarkdownState={version:1;items:MarkdownContext[]}
export const DEFAULT_MARKDOWN:MarkdownContext={id:'M-1',title:'Пример Markdown',document:{title:'Заметки проекта',body:'# Требования\n\n- Сохранить независимый контекст\n- Проверить универсальность Shell'}}
export const MARKDOWN_DOCUMENT:ContentDescriptor={id:'document',label:'Markdown',caption:'Независимый документ без истории и симуляции',icon:'▤',minWidth:300,minHeight:260,maxPerScreen:1,accent:'#77cfb4'}
export function validMarkdownState(value:unknown):value is MarkdownState {
  if(!value||typeof value!=='object')return false
  const state=value as MarkdownState
  if(state.version!==1||!Array.isArray(state.items)||!state.items.length||state.items.length>64)return false
  const found=new Set<string>()
  for(const item of state.items){
    if(!item||typeof item.id!=='string'||!/^M-[a-zA-Z0-9-]{1,50}$/.test(item.id)||found.has(item.id)||
      typeof item.title!=='string'||item.title.length>160||typeof item.document?.title!=='string'||
      typeof item.document.body!=='string'||item.document.body.length>500000)return false
    found.add(item.id)
  }
  return true
}
export function descriptorsForMarkdown(items:readonly MarkdownContext[]):ContentDescriptor[] {
  return items.flatMap(item=>scopeDescriptors(item.id,[MARKDOWN_DOCUMENT]))
}
export function markdownTemplate(id:string):ScreenTemplate[] {
  return [{id:'markdown-document',title:'Документ · '+id,panels:[{
    rect:{x:24,y:28,w:770,h:590},tabs:[scopedContentId(id,'document')],active:scopedContentId(id,'document')
  }]}]
}
export function defaultMarkdownWorkspace():Workspace {
  return {version:3,activeScreenId:'markdown-screen-1',screens:[{
    id:'markdown-screen-1',title:'Документ · M-1',panels:[{
      id:'markdown-panel-1',rect:{x:24,y:28,w:770,h:590},
      tabs:[scopedContentId('M-1','document')],active:scopedContentId('M-1','document')
    }]
  }]}
}
export function readMarkdown(ref:ResourceRef,items:readonly MarkdownContext[]):ResourceSnapshot|null {
  if(ref.profileId!==MARKDOWN_ID||ref.resourceId!=='document')return null
  const data=items.find(i=>i.id===ref.contextId)
  return data?{ref:{...ref},capability:'document.read',title:data.document.title,summary:data.document.body.slice(0,220)}:null
}