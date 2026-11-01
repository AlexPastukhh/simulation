import {MARKDOWN_DESCRIPTOR} from './workspace.ts'
import {useEffect,useRef,useState} from 'react'
import {readContent,writeContent,serializeContentWrite,watchContentChanges} from './contentStorage.ts'
import type {MechanicObserver,MechanicConnection} from '../../shell/mechanics/contracts.ts'
import {MARKDOWN_EDIT} from '../../templates/content/markdown-document/scope-mechanisms/edit/definition.ts'
import type {ContentDescriptor} from '../../shell/workspace.ts'
import type {EntityInstance,TemplateDefinition} from '../../shell/templateInstances.ts'
import {instantiateEntity} from '../../shell/templateInstances.ts'

const KEY='pt006-single-markdown-instances-v1'
type MarkdownData={title:string;body:string}
type MarkdownRecord=EntityInstance<MarkdownData>
export const MARKDOWN_TEMPLATE:TemplateDefinition={
 id:'single-markdown-document',version:1,profileId:'single-architecture',
 title:'Markdown Document',level:'content',fields:['title','body'],
 capabilities:['document.read','document.write'],
}
const valid=(value:unknown):value is MarkdownRecord[]=>{
 if(!Array.isArray(value)||value.length>64)return false
 const ids=new Set<string>()
 for(const item of value){
  if(!item||typeof item.id!=='string'||!item.id.trim()||ids.has(item.id)||
    item.templateId!==MARKDOWN_TEMPLATE.id||item.templateVersion!==1||
    item.level!=='content'||typeof item.title!=='string'||!item.origin||typeof item.origin.kind!=='string'||typeof item.data?.title!=='string'||typeof item.data.body!=='string'||
    item.data.body.length>500000)return false
  ids.add(item.id)
 }
 return true
}
const load=()=>readContent(KEY,value=>valid(value)?value:null,()=>[])
export function useSingleMarkdown() {
 const [initial]=useState(load)
 const [documents,setDocuments]=useState(initial.value)
 const [error,setError]=useState(initial.error)
 const documentsRef=useRef(documents)
 const savedRaw=useRef(initial.raw)

 const observerRef=useRef<MechanicObserver|null>(null)
 const update=(mutate:(items:MarkdownRecord[])=>void)=>{
  const observer=observerRef.current
  const token=observer?.start('markdown:content-edit','markdown-write',MARKDOWN_EDIT.sources[0],{phase:'Ожидание writer/Web Lock'})??null
  const reject=(message:string)=>{setError(message);observer?.finish(token,'rejected',{reason:message});return false}
  return serializeContentWrite(KEY,()=>{
   if(initial.error)return reject(initial.error)
   const next=structuredClone(documentsRef.current)
   mutate(next)
   if(!valid(next))return reject('Ошибка проверки Markdown. Изменение отменено.')
   const result=writeContent(KEY,next,savedRaw.current)
   if(!result.ok)return reject(result.error)
   savedRaw.current=result.raw
   documentsRef.current=next;setDocuments(next);setError('')
   observer?.finish(token,'saved',{storageKey:KEY,documentCount:next.length,readBack:true})
   return true
  }).catch(()=>reject('Не удалось сохранить Markdown. Изменение отменено.'))
 }
 useEffect(()=>watchContentChanges(KEY,()=>savedRaw.current,message=>{setError(message);observerRef.current?.emit('markdown:content-edit','external-content-change','observed',{reason:message},{module:'src/profiles/single-architecture/contentStorage.ts',symbol:'watchContentChanges'})}),[])
 const descriptors:ContentDescriptor[]=[MARKDOWN_DESCRIPTOR]
 return {
  documents,error,descriptors,
  attachMechanics:(observer:MechanicObserver)=>{observerRef.current=observer;return()=>{if(observerRef.current===observer)observerRef.current=null}},
  connection:{id:'markdown:content-edit',definitionId:MARKDOWN_EDIT.id,title:'Markdown Content writer',
   scope:{id:KEY,level:'content',title:'Самостоятельные документы Markdown'},
   participants:documents.map(doc=>({role:'document',ref:doc.id})),presentation:['markdown-documents'],persistence:KEY,
   read:()=>({available:!initial.error,reason:initial.error||null,documents:documentsRef.current.map(doc=>doc.id),guardCheckedAgainAtWrite:true})} satisfies MechanicConnection,
  render:()=> <div className="sim-content">
   <div className="sim-section-head"><strong>Markdown</strong></div>
   {error&&<p role="alert" className="history-notice">{error}</p>}
   {documents.map(doc=><section key={doc.id} className="sim-detail stacked">
     <strong>{doc.id}</strong>
     <input aria-label={'Название Markdown '+doc.id} value={doc.data.title} onChange={e=>{const title=e.target.value;void update(items=>{const d=items.find(d=>d.id===doc.id);if(d){d.title=title;d.data.title=title}})}}/>
     <textarea aria-label={'Markdown '+doc.id} value={doc.data.body} onChange={e=>{const body=e.target.value;void update(items=>{const d=items.find(d=>d.id===doc.id);if(d)d.data.body=body})}}/>
     <pre>{doc.data.body}</pre>
     <button className="minor-btn" onClick={()=>update(items=>items.splice(items.findIndex(d=>d.id===doc.id),1))}>Удалить документ</button>
   </section>)}
   <button className="minor-btn" onClick={()=>update(items=>{const id='md-'+crypto.randomUUID();items.push(instantiateEntity(MARKDOWN_TEMPLATE,id,'Новый документ',{title:'Новый документ',body:''}))})}>+ Markdown</button>
  </div>,
 }
}
