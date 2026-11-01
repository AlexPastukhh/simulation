import test from 'node:test'
import assert from 'node:assert/strict'
import {createMechanicsRuntime,observeUI} from '../src/shell/mechanics/runtime.ts'
import {CORE_MECHANICS} from '../src/shell/mechanics/core.ts'
import {createWorkspaceModel,findOpenContentWindow} from '../src/shell/workspace.ts'
import {reduceShellState} from '../src/shell/workspaceDispatch.ts'
import {scanMechanicsSource,instrumentMechanicsUI,buildMechanicsSourceIndex} from '../dev/mechanicsSourcePlugin.ts'
import {collectOpenContentLinks} from '../src/shell/mechanics/openContentLinks.ts'
import {INITIAL_WORKSPACE} from '../src/profiles/single-architecture/workspace.ts'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
const index={version:'test-build',files:{'src/fixture.tsx':{path:'src/fixture.tsx',hash:'fixture-code',imports:[],symbols:{navigate:5},surfaces:[]}}}
const source={module:'src/fixture.tsx',line:5,hash:'fixture-code',surfaceId:'src/fixture.tsx:42',calls:['navigate'],event:'onClick'}
function runtime(){
 const value=createMechanicsRuntime(index)
 value.configure({definitions:CORE_MECHANICS,connections:[{id:'core:ui',definitionId:'core.ui',title:'UI',
  scope:{id:'fixture-profile',level:'workspace',title:'Fixture without DDD'},participants:[],presentation:[],persistence:'memory',read:()=>({available:true})}]})
 return value
}
test('recording is opt-in; wrappers preserve identity of returned Promise and execute once',async()=>{
 const value=runtime();let calls=0
 const promise=Promise.resolve('ok')
 assert.equal(value.invoke(source,null,()=>{calls++;return promise}),promise)
 assert.equal(calls,1);assert.equal(value.getTrace().length,0)
 value.setRecording(true)
 assert.equal(value.invoke(source,null,()=>{calls++;return promise}),promise)
 await promise;await Promise.resolve()
 assert.equal(calls,2);assert.equal(value.getTrace().length,1)
 assert.equal(value.getTrace()[0].outcome,'returned')
 assert.equal(value.getTrace()[0].source.hash,'fixture-code')
})
test('a failing callback is not retried; broken subscriber and unavailable read do not alter action',()=>{
 const value=runtime();value.setRecording(true)
 value.subscribe(()=>{throw Error('diagnostic subscriber')})
 let calls=0
 assert.throws(()=>value.invoke(source,null,()=>{calls++;throw Error('original')}),/original/)
 assert.equal(calls,1);assert.equal(value.getTrace()[0].outcome,'failed')
 assert.deepEqual(value.read({read:()=>{throw Error('read')}}),{available:false,reason:'Состояние этого подключения недоступно'})
})
test('nested callbacks retain correlation; records remain bounded and clearing does not invoke actions',()=>{
 const value=runtime();value.setRecording(true)
 let calls=0
 const handler=observeUI(source,()=>{calls++;return 12})
 assert.equal(value.invoke(source,null,()=>handler()),12)
 assert.equal(calls,1);assert.equal(value.getTrace().length,2)
 assert.equal(value.getTrace()[1].parentId,value.getTrace()[0].id)
 for(let i=0;i<240;i++)value.emit('core:ui','fixture','observed',{i})
 assert.equal(value.getTrace().length,200)
 value.clear();assert.equal(value.getTrace().length,0);assert.equal(calls,1)
})
test('core visibility works in a second profile without architecture imports or Scope definitions',()=>{
 const value=runtime()
 assert.ok(value.getCatalog().definitions.some(d=>d.id==='core.open-content'))
 assert.equal(value.getCatalog().definitions.filter(d=>d.kind==='scope').length,0)
 assert.equal(value.getCatalog().connections[0].scope.id,'fixture-profile')
 value.setRecording(true);value.invoke(source,null,()=>true)
 assert.equal(value.getTrace()[0].connectionId,'core:ui')
})
test('reducer acknowledgement records a rejection without executing twice or touching layout',()=>{
 const ops=createWorkspaceModel([]),workspace={version:3,activeScreenId:'a',screens:[{id:'a',title:'A',panels:[]}]}
 const state={layouts:{fixture:workspace},revision:0,bridgeReply:null}
 const rejected=reduceShellState(state,{type:'command',traceId:'rejected',command:{type:'removeScreen',screenId:'missing'}},ops,'fixture',workspace)
 assert.equal(rejected.revision,0);assert.equal(rejected.layouts,state.layouts)
 assert.equal(rejected.mechanicsReplies[0].status,'rejected')
 let called=0
 const applied=reduceShellState(state,{type:'modify',traceId:'once',update:w=>{called++;return {...w,activeScreenId:'a'}}},ops,'fixture',workspace)
 assert.equal(called,1);assert.equal(applied.revision,1)
 assert.equal(applied.mechanicsReplies[0].status,'applied')
})
test('source scan ignores comments/strings; intrinsic handlers are stamped and delegated callbacks preserve source',()=>{
 const text="import {useEffect} from 'react'; // onClick={fake()}\nconst note='onChange={fake()}';\nexport function Example(){useEffect(()=>()=>{},[]);return <button onClick={()=>navigate('CURRENT')}>Open</button>}"
 const file=scanMechanicsSource('src/fixture.tsx',text)
 assert.equal(file.surfaces.filter(s=>s.type==='ui').length,1)
 assert.equal(file.surfaces.filter(s=>s.type==='effect').length,1)
 assert.ok(file.surfaces[0].hash)
 const changed=instrumentMechanicsUI('src/fixture.tsx',text)
 assert.equal((changed.match(/__pt006ObserveUI\(/g)||[]).length,1)
 assert.ok(changed.includes('data-mechanics-surfaces'))
 assert.ok(changed.includes('navigate'))
 assert.equal(instrumentMechanicsUI('src/shell/mechanics/Panel.tsx',text),text)
})

test('connection targets come from actual JSX handlers, without a second route list',()=>{
 const code="function Example(){return <><button onClick={()=>open('architecturePlan')}>Открыть архитектуру</button><button onClick={()=>open('trace')}>Trace</button><button onClick={()=>navigate('CURRENT')}>Текущее</button></>}"
 const surfaces=scanMechanicsSource('src/fixture.tsx',code).surfaces.filter(s=>s.type==='ui')
 assert.deepEqual(surfaces.map(s=>s.opensContent),['architecturePlan','trace',undefined])
 const transformed=instrumentMechanicsUI('src/fixture.tsx',code)
 assert.match(transformed,/"opensContent":"architecturePlan"/)
 assert.match(transformed,/"opensContent":"trace"/)
 assert.equal((transformed.match(/__pt006ObserveUI\(/g)||[]).length,3)
})
test('core open lookup and Inspector location use the same real Workspace ordering',()=>{
 const w={version:3,activeScreenId:'planning',screens:[
  {id:'architecture',title:'Архитектура',panels:[{id:'arch-window',active:'architecturePlan',tabs:['architecturePlan'],rect:{x:0,y:0,w:400,h:400}}]},
  {id:'planning',title:'Планирование',panels:[{id:'plan-window',active:'plan',tabs:['plan','architecturePlan'],rect:{x:0,y:0,w:400,h:400}}]},
 ]}
 assert.deepEqual(findOpenContentWindow(w,'architecturePlan'),{screenId:'planning',panelId:'plan-window'})
 assert.equal(findOpenContentWindow(w,'trace'),null)
 const ops=createWorkspaceModel([{id:'architecturePlan',label:'Architecture Planning',caption:'',icon:'',minWidth:300,minHeight:200,maxPerScreen:null,accent:''}])
 const opened=ops.openContent(w,'architecturePlan','new-window')
 assert.equal(opened.created,false)
 assert.equal(opened.panelId,findOpenContentWindow(w,'architecturePlan').panelId)
 assert.equal(opened.workspace.screens.flatMap(s=>s.panels).length,2)
})

test('source index keeps declared view owner and literal target from the actual button',()=>{
 const code='function Example(){return <button data-mechanics-views="plan|history" onClick={()=>open(\'trace\')}>Открыть связи</button>}'
 const [surface]=scanMechanicsSource('src/fixture.tsx',code).surfaces
 assert.deepEqual(surface.ownerViews,['plan','history'])
 assert.equal(surface.opensContent,'trace')
 assert.equal(surface.elementLabel,'Открыть связи')
})
test('open-content links include all four screens without mounting other screens',()=>{
 const root=resolve(fileURLToPath(new URL('../',import.meta.url)))
 const index=buildMechanicsSourceIndex(root)
 const workspace=structuredClone(INITIAL_WORKSPACE)
 workspace.activeScreenId='screen-application-architecture'
 const before=structuredClone(workspace)
 const links=collectOpenContentLinks(workspace,index)
 const screens=new Set(links.map(link=>link.screenId))
 assert.equal(workspace.screens.length,4)
 assert.equal(screens.size,4)
 assert.ok(links.some(link=>link.viewId==='implementation'&&link.source.opensContent==='impactHistory'))
 assert.ok(links.some(link=>link.viewId==='plan'&&link.source.opensContent==='architecturePlan'))
 assert.ok(links.some(link=>link.viewId==='current'&&link.source.opensContent==='requirements'))
 assert.ok(links.some(link=>link.viewId==='events'&&link.source.opensContent==='explorer'))
 assert.ok(links.some(link=>link.viewId==='work'&&link.source.opensContent==='fitness'))
 assert.ok(links.every(link=>link.source.elementLabel&&link.panelId&&link.source.line))
 const plan=links.find(link=>link.viewId==='plan'&&link.source.opensContent==='architecturePlan')
 assert.equal(plan.active,false)
 assert.deepEqual(findOpenContentWindow(workspace,plan.source.opensContent),{
  screenId:'screen-application-architecture',panelId:'window-application-architecture-1',
 })
 const mirrored=structuredClone(workspace)
 const source=workspace.screens.find(s=>s.id===plan.screenId)
 mirrored.screens.push({...structuredClone(source),id:'mirrored-planning',
  panels:source.panels.map((panel,i)=>({...structuredClone(panel),id:'mirror-'+i}))})
 assert.ok(collectOpenContentLinks(mirrored,index).length>links.length)
 assert.deepEqual(workspace,before)
})
