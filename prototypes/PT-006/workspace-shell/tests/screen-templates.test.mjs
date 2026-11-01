import test from 'node:test'
import assert from 'node:assert/strict'
import {createWorkspaceModel} from '../src/shell/workspace.ts'
import {appendTemplateScreens,matchesWorkspaceLayout} from '../src/shell/screenTemplates.ts'
import {DESCRIPTORS,MARKDOWN_DESCRIPTOR,SCREEN_TEMPLATES,SCREEN_BUNDLES,INITIAL_WORKSPACE,PREVIOUS_INITIAL_WORKSPACE} from '../src/profiles/single-architecture/workspace.ts'
import {parseWorkspaceCommand,executeWorkspaceCommand} from '../src/shell/workspaceCommands.ts'
import {reduceShellState} from '../src/shell/workspaceDispatch.ts'
import {writePreservingInvalid,RECOVERY_PREFIX} from '../src/shell/safeStorage.ts'

const ops=createWorkspaceModel([...DESCRIPTORS,MARKDOWN_DESCRIPTOR])
const placements=(prefix,templates=SCREEN_TEMPLATES)=>templates.map(t=>({
 templateId:t.id,screenId:prefix+t.id,panelIds:t.panels.map((_p,i)=>prefix+t.id+'-p'+i),
}))
test('four-screen default covers every current view and uses one bundle source',()=>{
 assert.equal(INITIAL_WORKSPACE.screens.length,4)
 assert.deepEqual(SCREEN_BUNDLES[0].templateIds,SCREEN_TEMPLATES.map(t=>t.id))
 assert.deepEqual(INITIAL_WORKSPACE.screens.map(s=>s.title),SCREEN_TEMPLATES.map(t=>t.title))
 assert.equal(ops.validateWorkspace(INITIAL_WORKSPACE),true)
 assert.deepEqual(new Set(INITIAL_WORKSPACE.screens.flatMap(s=>s.panels.flatMap(p=>p.tabs))),
  new Set([...DESCRIPTORS,MARKDOWN_DESCRIPTOR].map(d=>d.id)))
 assert.ok(INITIAL_WORKSPACE.screens.every(s=>s.panels.every(p=>!ops.undersized(p))))
})
test('repeat bundle and individual creation preserve existing screens, groups and recipes',()=>{
 const base=ops.saveScreenGroup(structuredClone(INITIAL_WORKSPACE),'g','Работа',INITIAL_WORKSPACE.screens.slice(0,2).map(s=>s.id))
 const before=structuredClone(base),recipes=structuredClone(SCREEN_TEMPLATES)
 const first=appendTemplateScreens(base,SCREEN_TEMPLATES,placements('first-'),ops)
 const second=appendTemplateScreens(first,SCREEN_TEMPLATES,placements('second-'),ops)
 const single=appendTemplateScreens(second,SCREEN_TEMPLATES,placements('one-',[SCREEN_TEMPLATES[2]]),ops)
 assert.equal(single.screens.length,13)
 assert.deepEqual(single.screens.slice(0,4),base.screens)
 assert.deepEqual(single.screenGroups,base.screenGroups)
 assert.deepEqual(base,before);assert.deepEqual(SCREEN_TEMPLATES,recipes)
 single.screens.at(-1).panels[0].rect.x=999
 assert.notEqual(SCREEN_TEMPLATES[2].panels[0].rect.x,999)
})
test('bad later template, duplicate global IDs and incomplete windows reject the whole bundle',()=>{
 const before=structuredClone(INITIAL_WORKSPACE)
 for(const change of [
  p=>p[3].templateId='missing',
  p=>p[3].screenId=p[0].screenId,
  p=>p[3].panelIds[0]=INITIAL_WORKSPACE.screens[0].panels[0].id,
  p=>p[3].panelIds.pop(),
  p=>p[3].screenId=p[1].panelIds[0],
 ]){
  const p=placements('bad-');change(p)
  assert.equal(appendTemplateScreens(INITIAL_WORKSPACE,SCREEN_TEMPLATES,p,ops),null)
  assert.deepEqual(INITIAL_WORKSPACE,before)
 }
 const bad=structuredClone(SCREEN_TEMPLATES);bad[3].panels[0].tabs=['comparison']
 assert.equal(appendTemplateScreens(INITIAL_WORKSPACE,bad,placements('unknown-'),ops),null)
})
test('UI/Bridge share template execution, revision conflict and all-or-nothing rejection',()=>{
 const command=parseWorkspaceCommand({type:'createTemplateScreens',placements:placements('bridge-')})
 assert.ok(command)
 assert.equal(parseWorkspaceCommand({type:'createTemplateScreens',placements:[]}),null)
 assert.equal(parseWorkspaceCommand({type:'createTemplateScreens',placements:[{templateId:'x',screenId:'y',panelIds:['same','same']}]}),null)
 const state={layouts:{main:INITIAL_WORKSPACE},revision:2,bridgeReply:null}
 const run=(action)=>reduceShellState(state,action,ops,'main',INITIAL_WORKSPACE,SCREEN_TEMPLATES)
 const ui=run({type:'command',command})
 const bridge=run({type:'command',command,requestId:'ok',expectedRevision:2})
 assert.deepEqual(ui.layouts,bridge.layouts)
 assert.equal(bridge.bridgeReply.status,'applied')
 assert.equal(bridge.revision,3)
 const stale=run({type:'command',command,requestId:'old',expectedRevision:1})
 assert.deepEqual(stale.layouts,state.layouts);assert.equal(stale.bridgeReply.status,'conflict')
 const bad={...command,placements:[...command.placements,{templateId:'missing',screenId:'unused',panelIds:[]}]}
 const rejected=run({type:'command',command:bad,requestId:'bad',expectedRevision:2})
 assert.deepEqual(rejected.layouts,state.layouts);assert.equal(rejected.bridgeReply.status,'rejected')
 assert.equal(executeWorkspaceCommand(INITIAL_WORKSPACE,command,ops).ok,false)
})
test('only the exact prior default matches; changed geometry, selection and extra screens survive',()=>{
 const reordered={screens:PREVIOUS_INITIAL_WORKSPACE.screens,activeScreenId:PREVIOUS_INITIAL_WORKSPACE.activeScreenId,version:3}
 assert.ok(matchesWorkspaceLayout(reordered,PREVIOUS_INITIAL_WORKSPACE))
 for(const change of [
  w=>w.screens[0].panels[0].rect.x++,
  w=>w.screens[0].panels[0].active='history',
  w=>w.screens.push({id:'custom',title:'Мой экран',panels:[]}),
  w=>w.screens[0].title='Моё размещение',
  w=>w.extra=true,
 ]){
  const w=structuredClone(PREVIOUS_INITIAL_WORKSPACE);change(w)
  assert.equal(matchesWorkspaceLayout(w,PREVIOUS_INITIAL_WORKSPACE),false)
 }
})
test('valid predecessor bytes are archived before layout write; archive conflict or failure blocks it',()=>{
 const key='layout',raw=JSON.stringify(PREVIOUS_INITIAL_WORKSPACE,null,3),next=JSON.stringify(INITIAL_WORKSPACE)
 const preserve=s=>matchesWorkspaceLayout(JSON.parse(s),PREVIOUS_INITIAL_WORKSPACE)
 const previous=globalThis.localStorage
 try{
  for(const mode of ['success','throw','mismatch']){
   const data=new Map([[key,raw]])
   if(mode==='mismatch')data.set(RECOVERY_PREFIX+key,'older backup')
   globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{
    if(mode==='throw'&&k===RECOVERY_PREFIX+key)throw Error('denied')
    data.set(k,v)
   }}
   const ok=writePreservingInvalid(key,next,()=>true,preserve)
   assert.equal(ok,mode==='success')
   assert.equal(data.get(key),mode==='success'?next:raw)
   if(mode==='success')assert.equal(data.get(RECOVERY_PREFIX+key),raw)
   if(mode==='mismatch')assert.equal(data.get(RECOVERY_PREFIX+key),'older backup')
  }
 }finally{globalThis.localStorage=previous}
})
