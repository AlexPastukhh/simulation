import {useEffect,useRef,useState} from 'react'
import type {WorkspaceProfile} from '../../shell/contracts.ts'
import {parseScopedContentId} from '../../shell/contexts.ts'
import {writePreservingInvalid,validStoredJson} from '../../shell/safeStorage.ts'
import {DEFAULT_MARKDOWN, MARKDOWN_ID, MARKDOWN_STORE, MARKDOWN_LAYOUT,validMarkdownState,descriptorsForMarkdown,markdownTemplate,defaultMarkdownWorkspace,readMarkdown} from './model.ts'
import type {MarkdownContext,MarkdownState} from './model.ts'

function restoreMarkdown():MarkdownState {
  try {
    const raw=localStorage.getItem(MARKDOWN_STORE)
    if(!raw)return {version:1,items:[structuredClone(DEFAULT_MARKDOWN)]}
    const value:unknown=JSON.parse(raw)
    if(validMarkdownState(value))return value
  }catch{ /* fallback without overwriting an invalid payload */ }
  return {version:1,items:[structuredClone(DEFAULT_MARKDOWN)]}
}
export function useMarkdownProfile():WorkspaceProfile {
  const [state,setState]=useState<MarkdownState>(restoreMarkdown)
  const initialized=useRef(state)
  useEffect(()=>{
    if(state!==initialized.current){
      writePreservingInvalid(MARKDOWN_STORE,JSON.stringify(state),validStoredJson(validMarkdownState))
      initialized.current=state
    }
  },[state])
  const setDocument=(contextId:string,field:'title'|'body',value:string)=>{
    setState(prev=>({...prev,items:prev.items.map(item=>item.id===contextId?{
      ...item,document:{...item.document,[field]:value}
    }:item)}))
  }
  const profile:WorkspaceProfile={
    id:MARKDOWN_ID,
    title:'Markdown Fixture',
    subtitle:'Проверочный независимый профиль · без History',
    contextId:'workspace',
    contexts:['workspace'],
    descriptors:descriptorsForMarkdown(state.items),
    initialWorkspace:defaultMarkdownWorkspace(state.items[0].id),
    layoutKey:()=>MARKDOWN_LAYOUT,
    legacyLayoutKey:()=>'', // No Architecture migration is permitted.
    migrateLayout:()=>null,
    contextTemplateOptions:[{id:'markdown-document',title:'Markdown-документ',description:'Отдельный Context и один редактируемый документ'}],
    createContext:(templateId='markdown-document')=>{
      if(templateId!=='markdown-document'||state.items.length>=64)return null
      const id='M-'+crypto.randomUUID()
      const item:MarkdownContext={id,title:'Новый документ',document:{title:'Новый документ',body:'# Новые заметки'}}
      return {id,descriptors:descriptorsForMarkdown([item]),templates:markdownTemplate(id),
        commit:()=>setState(prev=>({...prev,items:[...prev.items,item]}))}
    },
    resolveContentAddress:({profileId,contextId,instanceId})=>
      profileId===MARKDOWN_ID&&instanceId==='document'&&state.items.some(x=>x.id===contextId)
        ?'context/'+encodeURIComponent(contextId!)+'/document':null,
    readResource:ref=>readMarkdown(ref,state.items),
    renderHeader:()=> <span className="markdown-fixture-title">Markdown Fixture · {state.items.length} Context</span>,
    renderFactualTime:()=> <div className="factual-time-bar"><span>Markdown не использует Actual Events, PlanRevision или History; данные хранятся отдельно.</span></div>,
    renderContent:id=>{
      const ref=parseScopedContentId(id)
      const item=ref?.resourceId==='document'?state.items.find(x=>x.id===ref.contextId):null
      if(!item)return <div className="sim-content">Недоступный ресурс Markdown</div>
      return <div className="markdown-fixture-content" data-markdown-context={item.id}>
        <label>Заголовок<input aria-label={'Заголовок '+item.id} value={item.document.title}
          onChange={event=>setDocument(item.id,'title',event.target.value)}/></label>
        <label>Markdown<textarea aria-label={'Markdown '+item.id} value={item.document.body}
          onChange={event=>setDocument(item.id,'body',event.target.value)}/></label>
        <section className="markdown-fixture-preview"><strong>Текстовый предпросмотр</strong>
          <pre>{item.document.body}</pre></section>
      </div>
    },
    renderPanelTools:()=>null,
    renderInspector:()=>null,
    openInspector:()=>{},
    resetContent:()=>{}, // Only the layout can be reset, not the document.
    resetScope:'layout-only'
  }
  return profile
}