import {useState} from 'react'
import type {ReactNode} from 'react'
import type {SingleState,Navigation} from './state.ts'
import type {MaterialKind,PlanningDetails} from '../../templates/content/simulation-material/model.ts'
import {MATERIAL_SCHEMAS,PLANNING_DETAILS_SCHEMA} from '../../templates/content/simulation-material/model.ts'
import {SourceEditor} from './SourceEditor.tsx'
import {materialRows,factualMaterials,planningDetails} from './contentProjection.ts'
type Row=Record<string,unknown>
const labels:Record<string,string>={
 id:'ID',title:'Название',path:'Путь',nodeId:'Архитектурный элемент',stepId:'Step',action:'Действие',reason:'Основание',
 event:'Ожидаемое событие',predictedRequirement:'Прогнозная потребность',basis:'Основание',route:'Маршрут',condition:'Условие',expectation:'Ожидание',
 date:'Дата',kind:'Вид',source:'Источник',scope:'Объём',direction:'Направление',horizon:'Горизонт',salience:'Значимость',
 goal:'Цель',activities:'Работа',evidence:'Evidence',quantity:'Количество',unit:'Единица',note:'Пояснение',touches:'Число изменений',
 deadlineId:'Срок',result:'Фактический исход',context:'Контекст',question:'Вопрос оценки',migration:'Миграция',
 planAlignment:'Соответствие историческому плану',oneOffCost:'Разовые затраты',repeatedCost:'Повторные затраты',reworkCost:'Переделка',
 coordinationCost:'Координация',waitingCost:'Ожидание',requirementId:'Требование',filePath:'Файл',benefit:'Польза',
 concept:'Концепция',actors:'Участники',constraints:'Ограничения',parentId:'Владелец',usedByFeatureIds:'Используют Features',acceptance:'Условия приёмки',uncertainty:'Неопределённость',added:'Добавлено',removed:'Удалено',changed:'Изменено',architecture:'Архитектура',files:'Файлы',dynamicity:'Динамичность',organization:'Организация',engineering:'Инженерная среда',
}
function Value({value}:{value:unknown}):ReactNode{
 if(value===null||value===undefined)return <span className="sim-hint">неизвестно</span>
 if(Array.isArray(value))return value.length?<ul>{value.map((item,i)=><li key={i}><Value value={item}/></li>)}</ul>:<span className="sim-hint">нет записей</span>
 if(typeof value==='object')return <Fields value={value as Row}/>
 return value===''?<span className="sim-hint">не заполнено</span>:String(value)
}
function Fields({value}:{value:Row}){
 return <dl className="material-fields">{Object.entries(value).map(([key,item])=><div key={key}><dt>{labels[key]??key}</dt><dd><Value value={item}/></dd></div>)}</dl>
}
function Section({title,items,extra}:{title:string;items:Row[];extra?:(row:Row)=>ReactNode}){
 return <section className="material-section"><h4>{title}</h4>{items.length?
  items.map((row,index)=><article className="material-card" key={String(row.id??index)}><Fields value={row}/>{extra?.(row)}</article>):
  <p className="sim-hint">Записей нет. Данные не вычисляются и не подставляются автоматически.</p>}</section>
}
export function PlanMaterial({value,open}:{value:PlanningDetails|null;open:(id:string)=>void}){
 if(!value)return <p className="history-notice">Подробности этого исторического Plan не записаны. Live Plan не подставляется.</p>
 return <>
  <Section title="Работа в Plan, включая подготовку и ожидание" items={materialRows(value,'activities')}/>
  <p className="sim-hint">Прогнозы: {materialRows(value,'forecasts').length} · маршруты: {materialRows(value,'routeExpectations').length} · сроки: {materialRows(value,'deadlines').length} · оценки завершения: {materialRows(value,'completionForecasts').length}. Подробности — в Forecasts / Deadlines.</p>
  <button className="minor-btn" data-mechanics-views="plan" onClick={()=>open('forecasts')}>Открыть прогнозы и сроки</button>
  <p className="sim-hint">Направления изменений: {materialRows(value,'changeAxes').length}. Подробности — в Planned Change Axes.</p>
  <button className="minor-btn" data-mechanics-views="plan" onClick={()=>open('axes')}>Открыть направления изменений</button>
 </>
}
export function MaterialView({id,state,view,open,saveMaterial,savePlanning,connectionId}:{
 id:string;state:SingleState;view:Navigation;open:(id:string)=>void;connectionId?:string;
 saveMaterial:(kind:MaterialKind,data:unknown)=>Promise<boolean>;savePlanning:(data:unknown)=>Promise<boolean>
}){
 const [target,setTarget]=useState('')
 const historical=state.history.find(e=>e.id===view.selectedEventId)
 const sources=factualMaterials(state,view),plan=planningDetails(state,view)
 const architecture=historical?.architecture??state.architecture.data.current
 const requirements=historical?.requirements??state.requirements.data
 const steps=historical?.steps??state.architecture.data.steps
 const material=(kind:MaterialKind)=>sources?.[kind].data
 const rows=(kind:MaterialKind,key:string)=>materialRows(material(kind),key)
 const files=rows('implementation','files'),effects=rows('implementation','effects').filter(e=>view.selection==='CURRENT'||e.stepId===view.selection)
 const names:Record<string,string>={current:'Current State',scenario:'Scenario / Environment',implementation:'Implementation / Files',
  impact:'Evolution Impact',forecasts:'Forecasts / Deadlines',axes:'Planned Change Axes',work:'Work Dynamics',
  hotpaths:'Actual Hot Paths',fitness:'Evolution Fitness',explorer:'Event / Entity Explorer',trace:'Requirement / Implementation Trace',impactHistory:'Impact History / Future'}
 const owners:Partial<Record<string,MaterialKind>>={scenario:'scenario',implementation:'implementation',impact:'implementation',work:'work',hotpaths:'work',fitness:'fitness',trace:'trace'}
 const owner=owners[id],planOwner=id==='forecasts'||id==='axes'
 const missing=owner&&!sources||planOwner&&!plan
 let body:ReactNode
 if(missing)body=<p className="history-notice">В этом историческом снимке источник не записан. Рабочие данные вместо него не подставляются.</p>
 else if(id==='current')body=<>
  <span className="sim-tag">CURRENT · ACTUAL</span>
  <p>{architecture.nodes.length} архитектурных элементов · {requirements.requirements.length} требований · {sources?files.length:'не записано'} файлов</p>
  <Section title="Фактическая архитектура" items={architecture.nodes as unknown as Row[]}/>
  <Section title="Фактически известные требования" items={requirements.requirements as unknown as Row[]}/>
  {sources?<Section title="Фактические файлы" items={files}/>:<p className="history-notice">Файловый источник в снимке не записан.</p>}
  <button className="minor-btn" data-mechanics-views="current" onClick={()=>open('architecturePlan')}>Открыть Architecture Planning</button>
  <button className="minor-btn" data-mechanics-views="current" onClick={()=>open('requirements')}>Открыть Requirements</button>
  <button className="minor-btn" data-mechanics-views="current" onClick={()=>open('implementation')}>Открыть Files</button>
 </>
 else if(id==='scenario')body=<Fields value={material('scenario')!}/>
 else if(id==='implementation'||id==='impact')body=<>
  {id==='implementation'&&<Section title="ACTUAL · фактические файлы" items={files}/>}
  <Section title={'PLANNED · файловые эффекты '+(view.selection==='CURRENT'?'всех Steps':view.selection)} items={effects} extra={r=><>
   <p className="sim-hint">Плановый эффект не создаёт фактический файл.</p>
   {!steps.some(s=>s.id===r.stepId)&&<p className="history-notice">Step не найден: черновая ссылка.</p>}
  </>}/>
  <button className="minor-btn" data-mechanics-views="implementation|impact" onClick={()=>open('impactHistory')}>Открыть историю влияния</button>
 </>
 else if(id==='forecasts')body=<>
  <Section title="FORECAST · события и потребности" items={materialRows(plan??undefined,'forecasts')}/>
  <Section title="Маршруты и условия" items={materialRows(plan??undefined,'routeExpectations')}/>
  <Section title="Обязательные / целевые сроки" items={materialRows(plan??undefined,'deadlines')}/>
  <Section title="Оценки завершения — отдельно от обещаний" items={materialRows(plan??undefined,'completionForecasts')}/>
 </>
 else if(id==='axes')body=<Section title="PLANNED · направления будущих изменений" items={materialRows(plan??undefined,'changeAxes')}/>
 else if(id==='hotpaths')body=<Section title="ACTUAL · наблюдаемые повторные изменения" items={rows('work','hotPaths')}/>
 else if(id==='work')body=<>
  <Section title="ACTUAL · работа по целям" items={rows('work','episodes')}/>
  <Section title="Затраты и происхождение · unknown ≠ 0" items={rows('work','costFacts')}/>
  <Section title="ACTUAL · исходы сроков" items={rows('work','deadlineOutcomes')}/>
  <button className="minor-btn" data-mechanics-views="work" onClick={()=>open('fitness')}>Открыть Evolution Fitness</button>
  <button className="minor-btn" data-mechanics-views="work" onClick={()=>open('hotpaths')}>Открыть Actual Hot Paths</button>
 </>
 else if(id==='fitness')body=<Section title="Контекстные оценки · без общего рейтинга" items={rows('fitness','assessments')}/>
 else if(id==='trace')body=<Section title="Явные соответствия · не нормализация требований" items={rows('trace','links')} extra={r=><>
  <span className="sim-tag">{files.some(f=>f.path===r.filePath)?'ACTUAL FILE':effects.some(e=>e.path===r.filePath)?'PLANNED FILE':'UNRESOLVED FILE'}</span>
  {(!requirements.requirements.some(q=>q.id===r.requirementId)||!architecture.nodes.some(n=>n.id===r.nodeId))&&<p className="history-notice">Ссылка не разрешена в выбранном факте; черновик сохраняется.</p>}
 </>}/>
 else if(id==='explorer'){
  const objects=[
   ...architecture.nodes.map(row=>({key:'node:'+row.id,title:'Архитектура · '+row.title,row:row as unknown as Row})),
   ...requirements.requirements.map(row=>({key:'requirement:'+row.id,title:'Требование · '+row.text,row:row as unknown as Row})),
   ...files.map(row=>({key:'file:'+row.path,title:'Файл · '+row.path,row})),
  ]
  const selected=objects.find(object=>object.key===target)??objects[0]
  const related=rows('trace','links').filter(row=>selected&&(selected.key==='node:'+row.nodeId||
   selected.key==='requirement:'+row.requirementId||selected.key==='file:'+row.filePath))
  body=<>
   <h3>{historical?.title??'Рабочий CURRENT'}</h3><p>{historical?.recordedAt??'Фактический снимок не выбран'}</p>
   <label className="architecture-selector">Объект этого среза<select aria-label="Объект события" value={selected?.key??''} onChange={e=>setTarget(e.target.value)}>
    {!objects.length&&<option value="">Объектов нет</option>}
    {objects.map(object=><option key={object.key} value={object.key}>{object.title}</option>)}
   </select></label>
   <Section title="Выбранный объект фактического среза" items={selected?[selected.row]:[]}/>
   <Section title="Известные в этом срезе связи объекта" items={related}/>
   {!sources&&<p className="history-notice">Исторические Files/Trace не записаны; live-данные не подставляются.</p>}
   <p className="sim-hint">Обзор всего среза находится в Current State. Explorer разбирает один объект и его связи; выбор не создаёт Actual Event.</p>
  </>
 }
 else if(id==='impactHistory'){
  const history=state.history.slice(0,historical?state.history.findIndex(e=>e.id===historical.id)+1:undefined)
  const changes=history.map((event,i)=>{
   const previous=i?history[i-1]:null
   const beforeFiles=previous?.materials?materialRows(previous.materials.implementation.data,'files'):null
   const afterFiles=event.materials?materialRows(event.materials.implementation.data,'files'):null
   return {id:event.id,date:event.recordedAt,title:event.title,
    architecture:previous?{
     added:event.architecture.nodes.filter(n=>!previous.architecture.nodes.some(p=>p.id===n.id)),
     removed:previous.architecture.nodes.filter(n=>!event.architecture.nodes.some(p=>p.id===n.id)),
     changed:event.architecture.nodes.filter(n=>previous.architecture.nodes.some(p=>p.id===n.id&&JSON.stringify(p)!==JSON.stringify(n))),
    }:'Исходный сохранённый снимок. Без предшественника CREATE не доказан.',
    files:beforeFiles&&afterFiles?{
     added:afterFiles.filter(f=>!beforeFiles.some(p=>p.path===f.path)),
     removed:beforeFiles.filter(f=>!afterFiles.some(p=>p.path===f.path)),
     changed:afterFiles.filter(f=>beforeFiles.some(p=>p.path===f.path&&JSON.stringify(p)!==JSON.stringify(f))),
    }:afterFiles??'Исторический файловый источник не записан'}
  })
  const activeTarget=architecture.nodes.some(n=>target==='node:'+n.id)||files.some(f=>target==='file:'+f.path)?target:''
  const key=activeTarget.startsWith('node:')?'node':'file',ref=activeTarget.slice(5)
  const filtered=activeTarget?changes.map(change=>({...change,
   architecture:key==='node'&&typeof change.architecture==='object'?Object.fromEntries(Object.entries(change.architecture).map(([k,a])=>[k,a.filter(n=>n.id===ref)])):change.architecture,
   files:key==='file'&&change.files&&typeof change.files==='object'&&!Array.isArray(change.files)?Object.fromEntries(Object.entries(change.files).map(([k,a])=>[k,a.filter(f=>f.path===ref)])):change.files,
  })):changes
  body=<><label>Ответственность или файл<select aria-label="Цель истории влияния" value={activeTarget} onChange={e=>setTarget(e.target.value)}><option value="">Все изменения</option>
   {architecture.nodes.map(n=><option key={n.id} value={'node:'+n.id}>{n.title}</option>)}
   {files.map(f=><option key={String(f.path)} value={'file:'+String(f.path)}>{String(f.path)}</option>)}
  </select></label><Section title="ACTUAL · изменения между сохранёнными фактами" items={filtered}/>
   <Section title="PLANNED · отдельные будущие влияния" items={effects.filter(e=>!activeTarget||(key==='node'?e.nodeId===ref:e.path===ref))}/></>
 }
 return <div className="sim-content" data-material-view={id} data-mechanics-view={id} data-mechanics-connection={connectionId} data-mechanics-local-state={JSON.stringify({requestedTarget:target})}>
  <div className="sim-section-head"><strong>{names[id]}</strong><span className="sim-tag">{historical?'HISTORY · READ ONLY':'WORKING'}</span></div>
  {body}
  {owner&&sources&&<SourceEditor key={owner+'-'+(historical?.id??'live')} title={names[owner]} value={sources[owner].data} schema={MATERIAL_SCHEMAS[owner]} readOnly={!!historical} save={value=>saveMaterial(owner,value)}/>}
  {planOwner&&plan&&<SourceEditor key={'plan-'+(historical?.id??'live')} title="Plan details" value={plan} schema={PLANNING_DETAILS_SCHEMA} readOnly={!!historical} save={savePlanning}/>}
 </div>
}
