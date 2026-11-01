import {useEffect,useLayoutEffect,useMemo,useState,useSyncExternalStore} from 'react'
import sourceIndex from 'virtual:pt006-mechanics-sources'
import type {MechanicsRuntime} from './runtime.ts'
import {findOpenContentWindow} from '../workspace.ts'
import {collectOpenContentLinks} from './openContentLinks.ts'
import type {Workspace,ContentDescriptor} from '../workspace.ts'
import type {MechanicSource,UISource} from './contracts.ts'
import './styles.css'
export type MechanicsTarget={panelId:string;viewId:string;screenId:string}
type MountedBinding={source:UISource;connectionId:string;label:string;disabled:boolean;panelId:string|null;viewId:string|null}
const outcomes:Record<string,string>={invoked:'Вызван',returned:'Callback завершён',pending:'Ожидание',
 observed:'Наблюдалось',saved:'Read-back подтверждён',rejected:'Отклонено',failed:'Ошибка',cancelled:'Отменено',noop:'Без изменения'}
export function MechanicsInspector({runtime,host,target,workspace,descriptors,onClose}:{
 runtime:MechanicsRuntime;host:HTMLElement|null;target:MechanicsTarget|null
 workspace:Workspace;descriptors:readonly ContentDescriptor[];onClose:()=>void
}){
 useSyncExternalStore(runtime.subscribe,runtime.getRevision)
 const [page,setPage]=useState<'connections'|'definitions'|'sources'|'trace'|'coverage'>('connections')
 const [kind,setKind]=useState<'all'|'core'|'scope'>('all')
 const [selected,setSelected]=useState<string|null>(null)
 const [source,setSource]=useState<MechanicSource|null>(null)
 const [query,setQuery]=useState('')
 const [pick,setPick]=useState(false)
 const [showAllOpenLinks,setShowAllOpenLinks]=useState(false)
 const [bindings,setBindings]=useState<MountedBinding[]>([])
 const catalog=runtime.getCatalog()
 useEffect(()=>{
  if(!host)return
  let frame=0
  const refresh=()=>{
   frame=0
   const found:MountedBinding[]=[]
   for(const element of host.querySelectorAll<HTMLElement>('[data-mechanics-surfaces]')){
    if(element.closest('.mechanics-inspector'))continue
    const panel=element.closest<HTMLElement>('[data-panel-id]')
    if(target&&panel?.dataset.panelId!==target.panelId)continue
    for(const id of (element.dataset.mechanicsSurfaces??'').split('|')){
     const module=id.slice(0,id.lastIndexOf(':'))
     const surface=sourceIndex.files[module]?.surfaces.find(s=>s.surfaceId===id)
     if(surface)found.push({source:surface,connectionId:runtime.connectionFor(surface,element)?.id??'unbound',
      label:element.getAttribute('aria-label')??element.getAttribute('title')??element.textContent?.trim().slice(0,90)??element.tagName,
      disabled:element.matches(':disabled'),panelId:panel?.dataset.panelId??null,
      viewId:element.closest<HTMLElement>('[data-mechanics-view]')?.dataset.mechanicsView??null})
    }
   }
   setBindings(found)
  }
  const observer=new MutationObserver(records=>{if(records.every(r=>(r.target instanceof Element?r.target:r.target.parentElement)?.closest('.mechanics-inspector')))return;if(!frame)frame=requestAnimationFrame(refresh)})
  observer.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','value','data-mechanics-local-state']})
  refresh()
  return()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame)}
 },[host,runtime,target])
 useLayoutEffect(()=>{
  if(!pick||!host)return
  const suppress=(event:PointerEvent)=>{if(event.target instanceof Element&&!event.target.closest('.mechanics-inspector')&&host.contains(event.target)){event.preventDefault();event.stopImmediatePropagation()}}
  const inspect=(event:MouseEvent)=>{
   if(!(event.target instanceof Element)||event.target.closest('.mechanics-inspector')||!host.contains(event.target))return
   event.preventDefault();event.stopImmediatePropagation()
   const element=event.target.closest<HTMLElement>('[data-mechanics-surfaces]')
   const id=element?.dataset.mechanicsSurfaces?.split('|')[0]
   const module=id?.slice(0,id.lastIndexOf(':'))
   const surface=module&&sourceIndex.files[module]?.surfaces.find(s=>s.surfaceId===id)
   if(surface){setSource(surface);setSelected(runtime.connectionFor(surface,element)?.id??null);setPage('sources')}
   else{setSource(null);setPage('coverage')}
   setPick(false)
  }
  document.addEventListener('pointerdown',suppress,true);document.addEventListener('click',inspect,true)
  return()=>{document.removeEventListener('pointerdown',suppress,true);document.removeEventListener('click',inspect,true)}
 },[pick,host,runtime])
 useEffect(()=>{
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){if(pick)setPick(false);else onClose()}}
  window.addEventListener('keydown',escape)
  return()=>window.removeEventListener('keydown',escape)
 },[pick,onClose])
 const definitions=catalog.definitions.filter(d=>kind==='all'||d.kind===kind)
 const connections=catalog.connections.filter(c=>definitions.some(d=>d.id===c.definitionId)&&
  (!target||((runtime.definition(c.definitionId)?.kind==='core'||c.presentation.includes(target.viewId))&&(c.scope.level!=='view'||c.scope.parentId===target.panelId))))
 const connection=connections.find(c=>c.id===selected)??connections[0]
 const definition=connection&&runtime.definition(connection.definitionId)
 const connectedBindings=bindings.filter(binding=>binding.connectionId===connection?.id)
 const openLinks=connection?.definitionId==='core.open-content'
  ? collectOpenContentLinks(workspace,sourceIndex).filter(link=>!target||showAllOpenLinks||link.panelId===target.panelId):[]
 const contentLabel=(id:string)=>descriptors.find(d=>d.id===id)?.label??id
 const screenFor=(panelId:string|null)=>workspace.screens.find(s=>s.panels.some(p=>p.id===panelId))
 const sourceFile=source&&sourceIndex.files[source.module]
 const stale=!!(source?.hash&&sourceFile&&source.hash!==sourceFile.hash)
 const graph=useMemo(()=>{
  if(!sourceFile)return []
  const seen=new Set<string>(),visit=(module:string)=>{
   if(seen.has(module)||!sourceIndex.files[module])return
   seen.add(module);for(const dependency of sourceIndex.files[module].imports)visit(dependency)
  }
  visit(sourceFile.path);return [...seen]
 },[sourceFile])
 const openSource=(ref:MechanicSource)=>{setSource(ref);setPage('sources')}
 const sourceButtons=(refs:readonly MechanicSource[])=>refs.map((ref,i)=>
  <button key={ref.module+':'+i} onClick={()=>openSource(ref)}>{ref.module}{ref.symbol?' · '+ref.symbol:''}</button>)
 const rowState=connection?runtime.read(connection):null
 const allSurfaces=Object.values(sourceIndex.files).filter(f=>!f.path.startsWith('src/shell/mechanics/')).flatMap(f=>f.surfaces)
 const native=allSurfaces.filter(s=>s.type!=='ui')
 return <aside className={'mechanics-inspector '+(pick?'is-picking':'')} role="dialog" aria-label="Механики визуализации" aria-modal="false">
  <header><div><strong>Механики</strong><small>{target?'Окно '+target.panelId+' · '+target.viewId:'Workspace · '+catalog.connections.length+' подключений'}</small></div><button aria-label="Закрыть механики" onClick={onClose}>×</button></header>
  <div className="mechanics-tools"><button aria-pressed={pick} onClick={()=>setPick(v=>!v)}>{pick?'Нажми на элемент · действие не выполнится':'Выбрать элемент'}</button>
   <select aria-label="Тип механик" value={kind} onChange={e=>setKind(e.target.value as typeof kind)}><option value="all">Core + Scope</option><option value="core">Core</option><option value="scope">Scope</option></select></div>
  <nav aria-label="Разделы механик">{(['connections','definitions','sources','trace','coverage'] as const).map(id=>
   <button key={id} aria-pressed={page===id} onClick={()=>setPage(id)}>{({connections:'Подключено',definitions:'Определения',sources:'Исходники',trace:'Вызовы',coverage:'Покрытие'})[id]}</button>)}</nav>
  <div className="mechanics-scroll">
   {page==='connections'&&<>
    <p>Подключения существуют отдельно от открытых окон. Перемещение окна и группировка rail не меняют их участников.</p>
    <div className="mechanics-list">{connections.map(c=><button key={c.id} className={connection?.id===c.id?'chosen':''} onClick={()=>setSelected(c.id)}>
     <b>{c.title}</b><small>{runtime.definition(c.definitionId)?.kind.toUpperCase()} · {c.scope.level} · {c.id}</small></button>)}</div>
    {connection&&definition&&<section className="mechanics-detail">
     <h3>{definition.title}</h3><p>{definition.description}</p>
     <dl><dt>Определение</dt><dd>{definition.id}</dd><dt>Scope подключения</dt><dd>{connection.scope.title} · {connection.scope.id}</dd>
      <dt>Разрешённые эффекты</dt><dd>{definition.effects.join(', ')}</dd><dt>Хранение настроек</dt><dd>{connection.persistence}</dd></dl>
     <h4>Участники</h4><ul>{connection.participants.map(p=><li key={p.role+':'+p.ref}><b>{p.role}</b> → {p.ref}</li>)}</ul>
     <h4>Результат / представления</h4><p>{connection.presentation.join(', ')||'Служебный эффект, без отдельного Content'}</p>
     <h4>Состояние и доступность сейчас</h4><pre>{JSON.stringify(rowState,null,2)}</pre>
     <h4>Действующий код</h4><div className="mechanics-source-links">{sourceButtons(definition.sources)}</div>
    </section>}
    {connection?.definitionId==='core.open-content'?<>
     <h4>Кнопки открытия Content {target&&!showAllOpenLinks?'этого окна':'во всём Workspace'} ({openLinks.length})</h4>
     {target&&<button onClick={()=>setShowAllOpenLinks(v=>!v)}>{showAllOpenLinks?'Только это окно':'Показать все экраны'}</button>}
     <p>Связи размещённых представлений{target&&!showAllOpenLinks?' выбранного окна':' всех экранов'}, включая неактивные вкладки. Названия кнопок и цели взяты из JSX текущей сборки. Несмонтированные кнопки — предусмотренные кодом точки входа, а не подтверждённые текущие DOM-элементы или вызовы.</p>
     {!openLinks.length&&<p>В размещённых представлениях нет зарегистрированных кнопок открытия Content.</p>}
     {openLinks.map((link,i)=>{
      const mounted=bindings.find(b=>b.source.surfaceId===link.source.surfaceId&&b.panelId===link.panelId&&b.viewId===link.viewId)
      const destination=link.source.opensContent!
      const existing=findOpenContentWindow(workspace,destination)
      const existingScreen=existing&&workspace.screens.find(s=>s.id===existing.screenId)
      const activeScreen=workspace.screens.find(s=>s.id===workspace.activeScreenId)
      return <article className="mechanics-link-row" key={link.source.surfaceId+':'+link.panelId+':'+link.viewId+':'+i}>
       <strong>{mounted?.label??link.source.elementLabel??'Кнопка открытия Content'}</strong>
       <small>Где: экран «{link.screenTitle}» · окно {link.panelId} · Content «{contentLabel(link.viewId)}»</small>
       <small>{mounted?mounted.disabled?'Смонтирована · недоступна':'Смонтирована · доступность действия определяется обработчиком':link.active?'Предусмотрена в коде · сейчас не смонтирована':'Предусмотрена в коде · другой экран или неактивная вкладка'}</small>
       <p>Открывает → <b>{contentLabel(destination)}</b> ({destination}). {existing
        ? 'Существующее окно '+existing.panelId+' · экран «'+existingScreen?.title+'».'
        : 'При выполнении будет создано окно на активном экране «'+(activeScreen?.title??'текущий')+'».'}</p>
       <button onClick={()=>openSource(link.source)}>Исходник кнопки</button>
      </article>
     })}
    </>:<>
     <h4>Элементы этого подключения на текущем экране ({connectedBindings.length})</h4>
     <p>Наблюдаемые DOM-элементы. Другие экраны здесь не смонтированы; отсутствие элемента не означает отсутствие подключения.</p>
     {!connectedBindings.length&&<p>В текущей области нет открытых элементов этого подключения.</p>}
     {connectedBindings.map((b,i)=>{
      const owner=screenFor(b.panelId)
      return <article className="mechanics-link-row" key={b.source.surfaceId+':'+b.panelId+':'+i}>
       <strong>{b.label||b.source.event}</strong>{b.disabled&&<small>Элемент недоступен</small>}
       <small>Где: {owner?'экран «'+owner.title+'» · окно '+b.panelId+' · '+(b.viewId?'Content «'+contentLabel(b.viewId)+'»':'управление окном'):'управление Workspace'}</small>
       <p>Обработчик: {b.source.event} · вызовы в коде: {b.source.calls.join(', ')||'не определены'}. Точный результат смотри в «Вызовы».</p>
       <button onClick={()=>{setSelected(b.connectionId);openSource(b.source)}}>Исходник элемента</button>
      </article>
     })}
    </>}
   </>}
   {page==='definitions'&&<>
    <p>Библиотека кода. Наличие определения не означает, что оно подключено или было вызвано.</p>
    {definitions.map(d=><section className="mechanics-detail" key={d.id}><h3>{d.title}</h3><small>{d.kind.toUpperCase()} · {d.level} · {d.id}</small>
     <p>{d.description}</p><p>Эффекты: {d.effects.join(', ')}</p><p>Подключений: {catalog.connections.filter(c=>c.definitionId===d.id).length}</p>
     <div className="mechanics-source-links">{sourceButtons(d.sources)}</div></section>)}
   </>}
   {page==='sources'&&<>
    <p>Исходники TS/TSX этой загруженной сборки. Наблюдающие обёртки находятся в runtime; код здесь читается, не исполняется.</p>
    <input aria-label="Поиск исходника" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Модуль или символ"/>
    <select aria-label="Модуль исходника" value={source?.module??''} onChange={e=>setSource({module:e.target.value})}>
     <option value="">Выберите модуль</option>
     {Object.values(sourceIndex.files).filter(file=>(file.path+' '+Object.keys(file.symbols).join(' ')).toLowerCase().includes(query.toLowerCase())).map(file=><option key={file.path} value={file.path}>{file.path}</option>)}
    </select>
    {sourceFile&&<><h3>{sourceFile.path}</h3><small>Source hash {sourceFile.hash} · Index {sourceIndex.version}</small>
     {stale?<p className="mechanics-warning">Этот вызов относится к другому исходнику. Старый текст не сохранён; новый код не выдаётся за код прошлого вызова.</p>:
      <pre className="mechanics-code" tabIndex={0}>{sourceFile.text.split('\n').map((line,i)=><span key={i} className={i+1===(source?.line??(source?.symbol?sourceFile.symbols[source.symbol]:undefined))?'source-line selected':'source-line'}><i>{i+1}</i>{line+'\n'}</span>)}</pre>}
     <h4>Локальные зависимости ({graph.length})</h4><div className="mechanics-source-links">{sourceButtons(graph.filter(p=>p!==sourceFile.path).map(module=>({module})))}</div>
     <h4>Внешние зависимости</h4><p>{sourceFile.imports.filter(p=>!sourceIndex.files[p]).join(', ')||'нет прямых'}</p></>}
   </>}
   {page==='trace'&&<>
    <div className="mechanics-tools"><button aria-pressed={runtime.isRecording()} onClick={()=>runtime.setRecording(!runtime.isRecording())}>{runtime.isRecording()?'Остановить запись':'Записывать вызовы'}</button><button onClick={()=>runtime.clear()}>Очистить</button></div>
    <p>До включения запись не велась. Только последние 200 вызовов в памяти; domain/History и внешние сервисы журнал не изменяет.</p>
    {runtime.getTrace().length===0&&<p>Вызовов нет. Включи запись и выполни действие в Workspace.</p>}
    {[...runtime.getTrace()].reverse().map(row=><article className="mechanics-trace-row" key={row.id} data-trace-outcome={row.outcome}>
     <strong>{outcomes[row.outcome]} · {row.action}</strong><small>{row.connectionId} · {row.id}{row.parentId?' ← '+row.parentId:''} · {row.at}{row.duration===undefined?'':' · '+row.duration.toFixed(1)+' ms'}</small>
     <pre>{JSON.stringify(row.detail,null,2)}</pre>{row.source&&<button onClick={()=>openSource(row.source!)}>Код вызова</button>}
    </article>)}
   </>}
   {page==='coverage'&&<>
    <h3>Что действительно видно</h3>
    <p>В текущей области DOM: {bindings.length} привязок UI, {bindings.filter(b=>b.connectionId==='unbound').length} без известного подключения. Источник обработчика привязан при сборке автоматически.</p>
    <p>В исходниках приложения: {allSurfaces.filter(s=>s.type==='ui').length} UI callbacks и {native.length} мест effects/listeners/timers/observers/writes. Число мест не означает число исполнений.</p>
    <p>Command/reducer, navigation, guarded content writes, layout/settings read-back и drag отмечают фактические результаты отдельно от UI callback.</p>
    <p className="mechanics-warning">Рендеры React, внутренности библиотек и каждый промежуточный callback native listener не трассируются пошагово. Их прикладные исходники и места подключения ниже доступны. Действия до включения записи не восстановлены. Наличие Scope readout не доказывает прохождения всей цепочки.</p>
    <h4>Нативные и фоновые места — source audit</h4>
    {native.map(s=><button className="mechanics-binding" key={s.surfaceId} onClick={()=>openSource(s)}><b>{s.type} · {s.event}</b><small>{s.module}:{s.line} · источник доступен; исполнение смотри в журнале</small></button>)}
   </>}
  </div>
 </aside>
}
