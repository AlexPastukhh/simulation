import {useEffect,useRef,useState} from 'react'
import {useSingleMarkdown,MARKDOWN_TEMPLATE} from './SingleMarkdown.tsx'
import type {WorkspaceProfile} from '../../shell/contracts.ts'
import type {MechanicObserver,MechanicConnection} from '../../shell/mechanics/contracts.ts'
import {readMountedMechanicsState} from '../../shell/mechanics/runtime.ts'
import {HISTORY_PLAN_NAVIGATION} from '../../templates/profiles/single-architecture/screen-groups/application-architecture/scope-mechanisms/history-and-plan-navigation/definition.ts'
import {changeHistoryPlanNavigation,NAVIGATION_KEY} from '../../templates/profiles/single-architecture/screen-groups/application-architecture/scope-mechanisms/history-and-plan-navigation/mechanic.ts'
import {APPLICATION_ARCHITECTURE_GROUP_TEMPLATE} from '../../templates/profiles/single-architecture/screen-groups/application-architecture/template.ts'
import {CONTENT_EDIT} from '../../templates/profiles/single-architecture/scope-mechanisms/content-edit/definition.ts'
import {EXPLORER_SELECTION} from '../../templates/profiles/single-architecture/views/explorer/scope-mechanisms/object-selection/definition.ts'
import {IMPACT_TARGET_FILTER} from '../../templates/profiles/single-architecture/views/impact-history/scope-mechanisms/target-filter/definition.ts'
import {MARKDOWN_EDIT} from '../../templates/content/markdown-document/scope-mechanisms/edit/definition.ts'
import {DESCRIPTORS,INITIAL_WORKSPACE,PREVIOUS_INITIAL_WORKSPACES,SCREEN_TEMPLATES,SCREEN_BUNDLES,LAYOUT_ARCHIVE_KEY} from './workspace.ts'
import {createTemplateCatalog,instantiateEntity,summarizeInstance} from '../../shell/templateInstances.ts'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE} from '../../templates/content/feature-ddd-architecture-planning/template.ts'
import {SITE_REQUIREMENTS_MODEL_TEMPLATE} from '../../templates/content/site-requirements-model/template.ts'
import {validateSingleState,decodeSingleState,resolveArchitecture,normalizeNavigation,CURRENT_VIEW} from './state.ts'
import type {SingleState,Navigation} from './state.ts'
import {readContent,writeContent,serializeContentWrite,watchContentChanges} from './contentStorage.ts'
import {ARCHITECTURE_NODE_KINDS} from '../../templates/content/feature-ddd-architecture-planning/model.ts'
import {SITE_ARTIFACT_KINDS} from '../../templates/content/site-requirements-model/model.ts'
import type {FeatureArchitecture,ArchitectureNodeKind} from '../../templates/content/feature-ddd-architecture-planning/model.ts'
import type {SiteArtifactKind} from '../../templates/content/site-requirements-model/model.ts'
import {MaterialView,PlanMaterial} from './MaterialViews.tsx'
import {SourceEditor} from './SourceEditor.tsx'
import {planningDetails} from './contentProjection.ts'
import {emptyMaterials,emptyPlanningDetails,validateData,MATERIAL_SCHEMAS,MATERIAL_TEMPLATES,PLANNING_DETAILS_SCHEMA} from '../../templates/content/simulation-material/model.ts'
import type {MaterialKind} from '../../templates/content/simulation-material/model.ts'

const STORAGE_KEY='pt006-single-architecture-instances-v1'
const ORIGINAL_V1_KEY='pt006-single-architecture-original-v1'
function fresh():SingleState {
 return {version:2,
  architecture:instantiateEntity(FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE,'architecture-main','Архитектура',
   {representation:'feature-ddd-planning',current:{representation:'feature-ddd',nodes:[]},steps:[]}),
  materials:emptyMaterials(),requirements:instantiateEntity(SITE_REQUIREMENTS_MODEL_TEMPLATE,'requirements-main','Требования',
   {representation:'site-requirements',requirements:[]}),history:[]}
}
function restore() {
 const loaded=readContent(STORAGE_KEY,decodeSingleState,fresh)
 let view={...CURRENT_VIEW},viewError='',migrate=false
 try {
  const prior=loaded.raw!==null&&!loaded.error?JSON.parse(loaded.raw):null
  migrate=prior?.version===1
  const raw=localStorage.getItem(NAVIGATION_KEY)
  view=normalizeNavigation(raw!==null?JSON.parse(raw):migrate?
   {selection:prior.selection,selectedEventId:prior.selectedEventId??null}:CURRENT_VIEW,loaded.value)
 }catch{viewError='Не удалось прочитать выбор представления. Открыт CURRENT.'}
 return {...loaded,view,viewError,migrate}
}
function TextEditor({value,onSave,label}:{value:string;onSave:(text:string)=>void;label:string}) {
 return <input aria-label={label} value={value} onChange={e=>onSave(e.target.value)}/>
}
export function useSingleArchitectureProfile():WorkspaceProfile {
 const markdown=useSingleMarkdown()
 const [initial]=useState(restore)
 const [state,setState]=useState<SingleState>(initial.value)
 const [view,setView]=useState<Navigation>(initial.view)
 const [error,setError]=useState(initial.error)
 const [viewError,setViewError]=useState(initial.viewError)
 const stateRef=useRef(state),viewRef=useRef(view)
 const saved=useRef({raw:initial.raw,migrate:initial.migrate})

 const observerRef=useRef<MechanicObserver|null>(null)
 const navigationId='single-architecture:application-architecture'
 const editId='single-architecture:content-edit'
 const editBlockReason=()=>initial.error?
  'Сохранение повреждено. Редактирование заблокировано, чтобы не перезаписать данные.':
  viewRef.current.selectedEventId!==null?'Исторический снимок доступен только для просмотра.':''
 const navigate=(next:Navigation)=>{
  const observer=observerRef.current
  const token=observer?.start(navigationId,'change-navigation',HISTORY_PLAN_NAVIGATION.sources[0],{requested:next})??null
  const result=changeHistoryPlanNavigation(next,stateRef.current,value=>{viewRef.current=value;setView(value)})
  setViewError(result.persisted?'':'Не удалось сохранить выбор представления. Просмотр доступен в этой вкладке.')
  observer?.finish(token,result.persisted?'saved':'rejected',{cursor:result.value,domainChanged:false,
   ...(result.persisted?{}:{reason:'Курсор применён в этой вкладке; browser read-back не подтверждён.'})})
 }
 const update=(next:(previous:SingleState)=>SingleState,onSaved?:()=>void)=>{
  const observer=observerRef.current
  const token=observer?.start(editId,'content-write',CONTENT_EDIT.sources[0],{phase:'Ожидание writer/Web Lock'})??null
  const reject=(message:string)=>{setError(message);observer?.finish(token,'rejected',{reason:message});return false}
  return serializeContentWrite(STORAGE_KEY,()=>{
   const blocked=editBlockReason()
   if(blocked)return reject(blocked)
   const candidate=next(structuredClone(stateRef.current))
   if(!validateSingleState(candidate))return reject('Изменение не прошло проверку. Данные не изменены.')
   const result=writeContent(STORAGE_KEY,candidate,saved.current.raw,saved.current.migrate?ORIGINAL_V1_KEY:undefined)
   if(!result.ok)return reject(result.error)
   saved.current={raw:result.raw,migrate:false}
   stateRef.current=candidate;setState(candidate);setError('')
   observer?.finish(token,'saved',{storageKey:STORAGE_KEY,validation:true,readBack:true,historyCount:candidate.history.length})
   onSaved?.()
   return true
  }).catch(()=>reject('Не удалось сохранить. Проверьте доступность хранилища браузера.'))
 }
 useEffect(()=>watchContentChanges(STORAGE_KEY,()=>saved.current.raw,message=>{setError(message);observerRef.current?.emit(editId,'external-content-change','observed',{reason:message},{module:'src/profiles/single-architecture/contentStorage.ts',symbol:'watchContentChanges'})}),[])
 useEffect(()=>{document.title='PT-006 · Single Architecture'},[])
 useEffect(()=>{observerRef.current?.emit(navigationId,'projection-commit','observed',{cursor:view,nodeCount:resolveArchitecture(state,view).nodes.length,domainChanged:false},{module:'src/profiles/single-architecture/MaterialViews.tsx',symbol:'MaterialView'})},[state,view])
 const historical=state.history.find(event=>event.id===view.selectedEventId)
 const shownSteps=historical?.steps??state.architecture.data.steps
 const displayed=resolveArchitecture(state,view)
 const updateArch=(modify:(data:FeatureArchitecture)=>void)=>{
   if(historical){setError('Исторический снимок доступен только для просмотра.');observerRef.current?.emit(editId,'architecture-write','rejected',{reason:editBlockReason()});return}
   update(prev=>{
     const target=view.selection==='CURRENT'?prev.architecture.data.current:prev.architecture.data.steps.find(s=>s.id===view.selection)?.target
     if(target)modify(target)
     return prev
   })
 }
 const saveMaterial=(kind:MaterialKind,data:unknown)=>{
   if(!validateData(data,MATERIAL_SCHEMAS[kind])){setError('Неверная структура '+MATERIAL_TEMPLATES[kind].title);return Promise.resolve(false)}
   return update(s=>{s.materials??=emptyMaterials();s.materials[kind].data=data as Record<string,unknown>;return s})
 }
 const savePlanning=(data:unknown)=>{
   if(!validateData(data,PLANNING_DETAILS_SCHEMA)){setError('Неверная структура Plan details');return Promise.resolve(false)}
   return update(s=>{s.architecture.data.details=data as Record<string,unknown>;return s})
 }
 const renderArchitecture=()=> <div className="sim-content" data-architecture-view={view.selection==='CURRENT'?'current':'planned'}>
   <div className="sim-section-head"><strong>Architecture Planning</strong><span className="sim-tag">{view.selection==='CURRENT'?'CURRENT · ACTUAL':'PLANNED · '+view.selection}</span></div>
   <label className="architecture-selector">Показать состояние
     <select aria-label="Состояние архитектуры" value={view.selection} onChange={e=>navigate({...view,selection:e.target.value})}>
       <option value="CURRENT">CURRENT · фактическая архитектура</option>
       {shownSteps.map(step=><option key={step.id} value={step.id}>{step.id} · {step.title}</option>)}
     </select>
   </label>
   <div className="architecture-outline" aria-label="Структура архитектуры">
     {displayed.nodes.map(node=><article key={node.id} className="architecture-node">
       <small>{node.kind} · {node.id}</small><strong>{node.title}</strong>
       {node.parentId&&<span>Владелец: {displayed.nodes.find(n=>n.id===node.parentId)?.title}</span>}
       {!!node.usedByFeatureIds?.length&&<span>Используют: {node.usedByFeatureIds.map(id=>displayed.nodes.find(n=>n.id===id)?.title).join(', ')}</span>}
     </article>)}
   </div>
   <p className="sim-hint">Одна модель Feature/DDD. Каждый шаг имеет независимый целевой снимок. Выбор шага не изменяет CURRENT.</p>
   <fieldset disabled={!!historical} className='sim-detail stacked'>
   {displayed.nodes.map(node=><div className="sim-detail stacked" key={node.id}>
     <strong>{node.id}</strong>
     <select aria-label={'Тип узла '+node.id} value={node.kind} onChange={e=>{const kind=e.target.value as ArchitectureNodeKind;void updateArch(data=>{const target=data.nodes.find(n=>n.id===node.id);if(target)target.kind=kind})}}>
       {ARCHITECTURE_NODE_KINDS.map(kind=><option key={kind} value={kind}>{kind}</option>)}
     </select>
     <TextEditor label={'Название узла '+node.id} value={node.title} onSave={title=>updateArch(data=>{const target=data.nodes.find(n=>n.id===node.id);if(target)target.title=title})}/>
     <label>Владелец (необязательно)
      <select aria-label={'Parent ID '+node.id} value={node.parentId??''} onChange={e=>{const parentId=e.target.value;void updateArch(data=>{const target=data.nodes.find(n=>n.id===node.id);if(target){if(parentId)target.parentId=parentId;else delete target.parentId}})}}>
       <option value="">Нет</option>
       {displayed.nodes.filter(other=>other.id!==node.id).map(other=><option key={other.id} value={other.id}>{other.title} · {other.id}</option>)}
      </select>
     </label>
     {node.kind!=='feature'&&displayed.nodes.some(other=>other.kind==='feature')&&<fieldset>
       <legend>Используют Features</legend>
       {displayed.nodes.filter(other=>other.kind==='feature').map(feature=><label key={feature.id}>
         <input type="checkbox" checked={node.usedByFeatureIds?.includes(feature.id)??false} onChange={e=>{const checked=e.target.checked;void updateArch(data=>{
           const current=data.nodes.find(n=>n.id===node.id);if(!current)return;const ids=new Set(current.usedByFeatureIds??[])
           if(checked)ids.add(feature.id);else ids.delete(feature.id)
           if(ids.size)current.usedByFeatureIds=[...ids];else delete current.usedByFeatureIds
         })}}/>
         {feature.title}
       </label>)}
     </fieldset>}
     <button className="minor-btn" onClick={()=>updateArch(data=>{data.nodes=data.nodes.filter(n=>n.id!==node.id);for(const n of data.nodes){if(n.parentId===node.id)delete n.parentId;n.usedByFeatureIds=n.usedByFeatureIds?.filter(id=>id!==node.id)}})}>Удалить узел</button>
   </div>)}
   <button className="minor-btn" onClick={()=>updateArch(data=>data.nodes.push({id:'node-'+crypto.randomUUID().slice(0,8),kind:'feature',title:'Новая Feature'}))}>+ Архитектурный элемент</button>
   </fieldset>
 </div>
 const renderRequirements=(open:(id:string)=>void)=> <div className="sim-content">
   <div className="sim-section-head"><strong>Site Requirements Model</strong></div>
   <p className="sim-hint">Каждый occurrence независим. Одинаковость не фиксируется.</p>
   <fieldset disabled={!!historical} className='sim-detail stacked'>
   {(historical?.requirements??state.requirements.data).requirements.map(item=><div className="sim-detail stacked" key={item.id}>
     <small>{item.id}</small><textarea aria-label={'Требование '+item.id} value={item.text} onChange={e=>{const text=e.target.value;void update(s=>{const r=s.requirements.data.requirements.find(x=>x.id===item.id);if(r)r.text=text;return s})}}/>
     <button className="minor-btn" onClick={()=>update(s=>{s.requirements.data.requirements=s.requirements.data.requirements.filter(r=>r.id!==item.id);for(const a of s.requirements.data.artifacts??[])a.requirementIds=a.requirementIds?.filter(id=>id!==item.id);return s})}>Удалить требование</button>
   </div>)}
   <button className="minor-btn" onClick={()=>update(s=>{s.requirements.data.requirements.push({id:'req-'+crypto.randomUUID().slice(0,8),text:'Новое требование'});return s})}>+ Требование</button>
   {((historical?.requirements??state.requirements.data).artifacts??[]).map(item=><div className="sim-detail stacked" key={item.id}>
     <small>{item.id}</small><select value={item.kind} aria-label={'Вид occurrence '+item.id} onChange={e=>{const kind=e.target.value as SiteArtifactKind;void update(s=>{const a=s.requirements.data.artifacts?.find(x=>x.id===item.id);if(a)a.kind=kind;return s})}}>{SITE_ARTIFACT_KINDS.map(k=><option key={k} value={k}>{k}</option>)}</select>
     <TextEditor label={'Название occurrence '+item.id} value={item.title} onSave={title=>update(s=>{const a=s.requirements.data.artifacts?.find(x=>x.id===item.id);if(a)a.title=title;return s})}/>
     <button className="minor-btn" onClick={()=>update(s=>{s.requirements.data.artifacts=s.requirements.data.artifacts?.filter(a=>a.id!==item.id);for(const a of s.requirements.data.artifacts??[])if(a.parentOccurrenceId===item.id)delete a.parentOccurrenceId;return s})}>Удалить occurrence</button>
   </div>)}
   <button className="minor-btn" onClick={()=>update(s=>{(s.requirements.data.artifacts??=[]).push({id:'occ-'+crypto.randomUUID().slice(0,8),kind:'screen',title:'Новый occurrence'});return s})}>+ Occurrence</button>
   </fieldset>
   <button className="minor-btn" data-mechanics-views="requirements" onClick={()=>open('trace')}>Открыть связи требований</button>
 </div>
 const renderPlan=(open:(id:string)=>void)=> <div className="sim-content" data-plan-view>
   <div className="sim-section-head"><strong>Plan</strong></div>
   <button className={'minor-btn '+(view.selection==='CURRENT'?'is-selected':'')} onClick={()=>navigate({...view,selection:'CURRENT'})}>CURRENT · реализованная архитектура</button>
   {shownSteps.map(step=><div className="sim-detail stacked" key={step.id}>
      <button className="minor-btn" onClick={()=>navigate({...view,selection:step.id})}>{view.selection===step.id?'● ':'○ '}{step.id}</button>
      <fieldset disabled={!!historical}><TextEditor label={'Название шага '+step.id} value={step.title} onSave={title=>update(s=>{const target=s.architecture.data.steps.find(x=>x.id===step.id);if(target)target.title=title;return s})}/>
      <button className="minor-btn" onClick={()=>update(s=>{s.architecture.data.steps=s.architecture.data.steps.filter(x=>x.id!==step.id);return s},()=>{if(viewRef.current.selection===step.id)navigate({...viewRef.current,selection:'CURRENT'})})}>Удалить шаг</button></fieldset>
   </div>)}
   <button className="minor-btn" disabled={!!historical} onClick={()=>{const id='step-'+crypto.randomUUID().slice(0,8);void update(s=>{s.architecture.data.steps.push({id,title:'Новый шаг',target:structuredClone(s.architecture.data.steps.find(x=>x.id===view.selection)?.target??s.architecture.data.current)});return s},()=>navigate({selection:id,selectedEventId:null}))}}>+ Evolution Step</button>
   <button className="minor-btn" data-mechanics-views="plan" onClick={()=>open('architecturePlan')}>Открыть выбранную архитектуру</button>
   <section className="material-section"><h4>Плановая работа и ожидания</h4>
     {<PlanMaterial value={planningDetails(state,view)} open={open}/>}
     {!historical?.id&&<SourceEditor title="Plan details" value={state.architecture.data.details??emptyPlanningDetails()} schema={PLANNING_DETAILS_SCHEMA} readOnly={false} save={savePlanning}/>}
     {historical&&historical.planningDetails&&<SourceEditor title="Plan details" value={historical.planningDetails} schema={PLANNING_DETAILS_SCHEMA} readOnly={true} save={savePlanning}/>}
   </section>
   <p className="sim-hint">Шаг — плановый целевой снимок, а не фактическое событие.</p>
 </div>
 const renderHistory=(label='History',open?:(id:string)=>void)=> <div className="sim-content">
   <div className="sim-section-head"><strong>{label}</strong></div>
   <p className="sim-hint">Фактические снимки создаются только по явному действию. Выбор старого снимка не изменяет CURRENT и план.</p>
   <button className="minor-btn" onClick={()=>navigate({...CURRENT_VIEW})}>
     {historical?'Вернуться к рабочей архитектуре':'● Рабочая архитектура'}
   </button>
   <button className="minor-btn" disabled={!!historical} onClick={()=>update(s=>{
     (s.history??=[]).push({
       id:'fact-'+crypto.randomUUID().slice(0,8),
       title:'Зафиксированная архитектура',
       recordedAt:new Date().toISOString(),
       architecture:structuredClone(s.architecture.data.current),
       requirements:structuredClone(s.requirements.data),
       steps:structuredClone(s.architecture.data.steps),
       materials:structuredClone(s.materials??emptyMaterials()),
       planningDetails:structuredClone(s.architecture.data.details??emptyPlanningDetails()),
     })
     return s
   })}>+ Зафиксировать фактический снимок</button>
   {(state.history??[]).map(record=><button key={record.id} className={'minor-btn '+(historical?.id===record.id?'is-selected':'')}
     onClick={()=>navigate({selectedEventId:record.id,selection:'CURRENT'})}>
     {historical?.id===record.id?'● ':'○ '}{record.title} · {record.recordedAt.slice(0,16)} · {record.id}
   </button>)}
   {open&&<button className="minor-btn" data-mechanics-views="events|history" onClick={()=>open('explorer')}>Открыть разбор события в Explorer</button>}
 </div>
 const profile:WorkspaceProfile={
   id:'single-architecture',title:'Архитектура приложения',subtitle:'Одна архитектура · Content Instances',
   descriptors:[...DESCRIPTORS,...markdown.descriptors],initialWorkspace:INITIAL_WORKSPACE,
   previousInitialWorkspaces:PREVIOUS_INITIAL_WORKSPACES,previousLayoutArchiveKey:LAYOUT_ARCHIVE_KEY,screenTemplates:SCREEN_TEMPLATES,screenBundles:SCREEN_BUNDLES,workspaceId:'single-architecture',
   layoutKey:()=> 'pt006-single-architecture-layout-v1',
   renderFactualTime:()=> <div className="factual-time-bar">Одна архитектура · {historical?'HISTORY · '+historical.id:view.selection==='CURRENT'?'CURRENT':view.selection}{(error||viewError)&&<strong role="alert"> · {[error,viewError].filter(Boolean).join(' · ')}</strong>}</div>,
   renderContent:(id,open,location)=>id==='plan'?renderPlan(open):id==='architecturePlan'?renderArchitecture():id==='requirements'?renderRequirements(open):id==='history'||id==='events'?renderHistory(id==='events'?'Actual Events':'History',open):id==='markdown-documents'?markdown.render():
     <MaterialView key={id} id={id} state={state} view={view} open={open} saveMaterial={saveMaterial} savePlanning={savePlanning} connectionId={location&&['explorer','impactHistory'].includes(id)?'view:'+location.panelId+':'+id:undefined}/>,
   attachMechanics:observer=>{observerRef.current=observer;const cleanup=markdown.attachMechanics(observer);return()=>{if(observerRef.current===observer)observerRef.current=null;cleanup()}},
   getMechanicsCatalog:locations=>{
    const sourceRefs=()=>[stateRef.current.architecture,stateRef.current.requirements,...Object.values(stateRef.current.materials??emptyMaterials())]
    const connections:MechanicConnection[]=[{
     id:navigationId,definitionId:HISTORY_PLAN_NAVIGATION.id,title:'Архитектура приложения · общий Event/Step cursor',
     scope:{id:navigationId,level:'screen-group',title:'Связанные представления четырёх экранов и их зеркал'},
     participants:sourceRefs().map(source=>({role:source.templateId,ref:source.id})),presentation:DESCRIPTORS.map(d=>d.id),
     persistence:NAVIGATION_KEY+' · отдельно от Content и layout',
     read:()=>({available:true,templateId:APPLICATION_ARCHITECTURE_GROUP_TEMPLATE.id,cursor:viewRef.current,policy:'shared-mirrors',layoutGroupsDoNotRebind:true,domainChangedByNavigation:false}),
    },{
     id:editId,definitionId:CONTENT_EDIT.id,title:'Writer Architecture / Requirements / Materials',
     scope:{id:STORAGE_KEY,level:'content',title:'Участники предметного сохранения'},
     participants:sourceRefs().map(source=>({role:source.templateId,ref:source.id})),presentation:DESCRIPTORS.map(d=>d.id),
     persistence:STORAGE_KEY+' · исходные bytes и optional migration archive',
     read:()=>({available:!editBlockReason(),reason:editBlockReason()||null,selectedEventId:viewRef.current.selectedEventId,webLocks:typeof navigator!=='undefined'&&!!navigator.locks,guardCheckedAgainAtWrite:true}),
    },markdown.connection]
    for(const location of locations){
     const definition=location.viewId==='explorer'?EXPLORER_SELECTION:location.viewId==='impactHistory'?IMPACT_TARGET_FILTER:null
     if(!definition)continue
     const id='view:'+location.panelId+':'+location.viewId
     connections.push({id,definitionId:definition.id,title:definition.title+' · '+location.panelId,
      scope:{id,parentId:location.panelId,level:'view',title:location.viewId+' в отдельном окне'},
      participants:sourceRefs().map(source=>({role:source.templateId,ref:source.id})),presentation:[location.viewId],
      persistence:'Только память mounted view; смена вида/закрытие сбрасывает фильтр',read:()=>readMountedMechanicsState(id)})
    }
    return {definitions:[HISTORY_PLAN_NAVIGATION,CONTENT_EDIT,MARKDOWN_EDIT,EXPLORER_SELECTION,IMPACT_TARGET_FILTER],connections,
     uiBindings:[{definitionId:'core.open-content',module:'src/profiles/single-architecture/SingleArchitectureProfile.tsx',calls:['open']},
       {definitionId:'core.open-content',module:'src/profiles/single-architecture/MaterialViews.tsx',calls:['open']}]}
   },
   getTemplateCatalog:()=>createTemplateCatalog([FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE,SITE_REQUIREMENTS_MODEL_TEMPLATE,MARKDOWN_TEMPLATE,...Object.values(MATERIAL_TEMPLATES)],[summarizeInstance(state.architecture),summarizeInstance(state.requirements),...markdown.documents.map(summarizeInstance),...Object.values(state.materials??emptyMaterials()).map(summarizeInstance)]),
 }
 return profile
}
