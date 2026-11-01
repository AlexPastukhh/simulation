import type {MechanicCatalog,MechanicDefinition,MechanicConnection,MechanicObserver,MechanicTrace,TraceToken,UISource,SourceMetadata,MechanicSource} from './contracts.ts'

const hosts = new WeakMap<Element, MechanicsRuntime>()
let current: {runtime: MechanicsRuntime; token: TraceToken | null} | null = null
const clock = () => typeof performance === 'undefined' ? Date.now() : performance.now()
const brief = (value: unknown): unknown => {
 if(typeof value === 'string') return value.slice(0,500)
 if(Array.isArray(value)) return value.slice(0,40).map(brief)
 if(value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0,30).map(([k,v])=>[k,brief(v)]))
 return value
}
export type MechanicsRuntime = ReturnType<typeof createMechanicsRuntime>
export function createMechanicsRuntime(index: SourceMetadata, limit = 200) {
 let catalog: MechanicCatalog = {definitions:[],connections:[]}
 let recording = false, revision = 0, sequence = 0
 let trace: MechanicTrace[] = []
 const subscribers = new Set<()=>void>()
 const changed = () => {revision++; for(const fn of subscribers) try{fn()}catch{/* Diagnostics cannot fail an operation. */}}
 const sourceVersion = (source?: MechanicSource): MechanicSource | undefined => source ? {
  ...source, hash: source.hash ?? index.files[source.module]?.hash,
  line: source.line ?? (source.symbol ? index.files[source.module]?.symbols[source.symbol] : undefined),
 } : undefined
 const start: MechanicObserver['start'] = (connectionId,action,source,detail={}) => {
  if(!recording) return null
  const token: TraceToken = {id:'call-'+(++sequence),started:clock(),...(current?.runtime===runtime&&current.token?{parentId:current.token.id}:{})}
  trace=[...trace,{id:token.id,parentId:token.parentId,at:new Date().toISOString(),connectionId,action,
   outcome:'invoked' as const,detail:brief(detail) as Record<string,unknown>,source:sourceVersion(source),version:index.version}].slice(-limit)
  changed(); return token
 }
 const finish: MechanicObserver['finish'] = (token,outcome,detail={}) => {
  if(!token || !recording) return
  const found=trace.find(row=>row.id===token.id)
  if(!found) return
  trace=trace.map(row=>row.id===token.id?{...row,outcome,duration:Math.max(0,clock()-token.started),
   detail:{...row.detail,...brief(detail) as Record<string,unknown>}}:row)
  changed()
 }
 const runtime = {
  start,finish,
  emit: ((connectionId,action,outcome,detail,source)=>{
   const token=start(connectionId,action,source,detail); finish(token,outcome)
  }) as MechanicObserver['emit'],
  configure(next: MechanicCatalog) {catalog=next;changed()},
  getCatalog: ()=>catalog,
  setSourceIndex(next:SourceMetadata) {if(next!==index){index=next;changed()}},
  getRevision: ()=>revision,
  getSourceVersion: ()=>index.version,
  subscribe(fn:()=>void) {subscribers.add(fn);return ()=>{subscribers.delete(fn)}},
  isRecording: ()=>recording,
  setRecording(value:boolean) {recording=value;changed()},
  clear() {trace=[];changed()},
  getTrace: ()=>trace,
  read(connection: MechanicConnection) {try{return connection.read()}catch{return {available:false,reason:'Состояние этого подключения недоступно'}}},
  definition(id:string): MechanicDefinition | undefined {return catalog.definitions.find(d=>d.id===id)},
  connectionFor(source: UISource,element?: Element | null): MechanicConnection | undefined {
   const matches=catalog.definitions.filter(d=>[...d.bindings,...(catalog.uiBindings??[]).filter(b=>b.definitionId===d.id)].some(b=>b.module===source.module&&b.calls.some(call=>source.calls.includes(call))))
   const localId=element?.closest('[data-mechanics-connection]')?.getAttribute('data-mechanics-connection')
   const local=catalog.connections.find(c=>c.id===localId)
   if(local && (source.calls.includes('setTarget') || matches.some(d=>d.id===local.definitionId)))return local
   return catalog.connections.find(c=>matches.some(d=>d.id===c.definitionId)) ??
    catalog.connections.find(c=>c.id==='core:ui')
  },
  invoke<T>(source: UISource,element: Element | null,execute:()=>T): T {
   const connection=runtime.connectionFor(source,element)
   const token=start(connection?.id ?? 'unbound',source.event,source,{
    panelId:element?.closest('[data-panel-id]')?.getAttribute('data-panel-id')??null,
    viewId:element?.closest('[data-mechanics-view]')?.getAttribute('data-mechanics-view')??null,
   })
   const previous=current; current={runtime,token}
   let result:T
   try{result=execute()}catch(error){finish(token,'failed',{reason:error instanceof Error?error.message:String(error)});throw error}
   finally{current=previous}
   if(result && typeof (result as {then?:unknown}).then === 'function') {
    finish(token,'pending')
    void Promise.resolve(result).then(
     ()=>finish(token,'returned',{note:'Callback завершён; сохранение подтверждается отдельной записью writer.'}),
     error=>finish(token,'failed',{reason:error instanceof Error?error.message:String(error)}),
    )
   } else finish(token,'returned',{note:'Callback вызван; это не подтверждение сохранения или видимого результата.'})
   return result
  },
 }
 return runtime
}
export function attachMechanicsHost(element: Element,runtime: MechanicsRuntime) {
 hosts.set(element,runtime)
 return ()=>{if(hosts.get(element)===runtime)hosts.delete(element)}
}
/** Build-time wrapper. Calls the original function exactly once and returns its original value. */
export function observeUI<T extends (...args: never[])=>unknown>(source: UISource,handler: T | null | undefined): T | null | undefined {
 if(typeof handler !== 'function') return handler
 return function(this: unknown,...args: Parameters<T>) {
  const event=args[0] as {currentTarget?:unknown} | undefined
  const element=typeof Element!=='undefined'&&event?.currentTarget instanceof Element?event.currentTarget:null
  const host=element?.closest('[data-mechanics-host]')
  const runtime=(host?hosts.get(host):undefined) ?? current?.runtime
  if(!runtime)return handler.apply(this,args)
  return runtime.invoke(source,element,()=>handler.apply(this,args))
 } as T
}

/** Diagnostic view read only; it never creates a functional connection from DOM. */
export function readMountedMechanicsState(connectionId:string):Record<string,unknown> {
 if(typeof document==='undefined')return {mounted:false,available:true,localState:'Не mounted; фильтр не сохранён'}
 const element=[...document.querySelectorAll<HTMLElement>('[data-mechanics-connection]')].find(e=>e.dataset.mechanicsConnection===connectionId)
 if(!element)return {mounted:false,available:true,localState:'Не mounted; фильтр не сохранён'}
 const select=element.querySelector('select')
 return {mounted:true,available:true,...JSON.parse(element.dataset.mechanicsLocalState??'{}') as Record<string,unknown>,
  effectiveTarget:select?.value??null,label:select?.selectedOptions[0]?.textContent??null}
}

/** Capture the current UI chain before an async local validation/save leaves the event stack. */
export function startCurrentMechanics(action:string,source:MechanicSource) {
 const active=current
 if(!active)return (_outcome:import('./contracts.ts').MechanicOutcome,_detail?:Record<string,unknown>)=>{}
 const owner=active.runtime.getTrace().find(row=>row.id===active.token?.id)?.connectionId??'core:ui'
 const token=active.runtime.start(owner,action,source)
 return (outcome:import('./contracts.ts').MechanicOutcome,detail?:Record<string,unknown>)=>active.runtime.finish(token,outcome,detail)
}

export function observeMechanicsElement(element:Element,connectionId:string,action:string,detail:Record<string,unknown>,source:MechanicSource) {
 const host=element.closest('[data-mechanics-host]')
 if(host)hosts.get(host)?.emit(connectionId,action,'observed',detail,source)
}
