import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
import { CONTENT, INITIAL_WORKSPACE, SCREEN_TEMPLATES, SCREEN_BUNDLES } from '../src/profiles/architecture-simulator/workspace.ts'

const ops=createWorkspaceModel(CONTENT)
const seed=()=>structuredClone(INITIAL_WORKSPACE)
const ids=()=>{let n=0;return kind=>kind+'-generated-'+(++n)}
const allIds=w=>[...w.screens.map(s=>s.id),...w.screens.flatMap(s=>s.panels.map(p=>p.id))]
const located=w=>w.screens.map(s=>({title:s.title,panels:s.panels.map(p=>({rect:p.rect,tabs:p.tabs,active:p.active}))}))

test('profile publishes four screen templates once, covering 18 kinds',()=>{
  assert.equal(SCREEN_TEMPLATES.length,4)
  assert.equal(SCREEN_BUNDLES.length,1)
  assert.deepEqual(SCREEN_BUNDLES[0].templateIds,SCREEN_TEMPLATES.map(t=>t.id))
  assert.deepEqual(SCREEN_TEMPLATES.map(t=>t.title),INITIAL_WORKSPACE.screens.map(s=>s.title))
  const kinds=SCREEN_TEMPLATES.flatMap(t=>t.panels.flatMap(p=>p.tabs))
  assert.equal(kinds.length,18)
  assert.equal(new Set(kinds).size,18)
})

test('copy duplicates window composition with fresh IDs, without mutating source',()=>{
  const before=seed(),source=structuredClone(before.screens[0])
  const next=ops.duplicateScreen(before,'screen-1',ids())
  assert.ok(next)
  assert.equal(next.screens.length,before.screens.length+1)
  assert.equal(next.activeScreenId,next.screens.at(-1).id)
  assert.equal(next.screens.at(-1).title,source.title+' — копия')
  assert.deepEqual(next.screens.at(-1).panels.map(({rect,tabs,active})=>({rect,tabs,active})),source.panels.map(({rect,tabs,active})=>({rect,tabs,active})))
  assert.equal(new Set(allIds(next)).size,allIds(next).length)
  assert.deepEqual(before.screens[0],source)
  assert.ok(ops.validateWorkspace(next))
  const again=ops.duplicateScreen(next,next.activeScreenId,ids())
  // A generator for an independent operation must still avoid IDs in existing layouts.
  assert.equal(again,null)
})

test('copy can be repeated with globally unique generated IDs',()=>{
  let n=0
  const gen=kind=>'generated-'+kind+'-'+(++n)
  let w=seed()
  w=ops.duplicateScreen(w,'screen-1',gen)
  w=ops.duplicateScreen(w,'screen-1',gen)
  assert.equal(w.screens.length,6)
  assert.equal(new Set(allIds(w)).size,allIds(w).length)
  assert.ok(ops.validateWorkspace(w))
})

test('template adds only a new screen, preserving existing screens and active data references',()=>{
  const w=seed(),original=JSON.stringify(w)
  const result=ops.addScreensFromTemplates(w,[SCREEN_TEMPLATES[2]],ids())
  assert.ok(result)
  assert.equal(result.screens.length,5)
  assert.equal(JSON.stringify(w),original)
  assert.equal(result.screens.at(-1).title,'Планирование')
  assert.deepEqual(result.screens.at(-1).panels.map(({rect,tabs,active})=>({rect,tabs,active})),SCREEN_TEMPLATES[2].panels)
  assert.ok(ops.validateWorkspace(result))
  const resolved=ops.openContent(result,'plan','not-used')
  assert.equal(resolved.created,false)
  assert.equal(resolved.screenId,result.activeScreenId)
})

test('batch adds all four atomically without disturbing saved layouts of another context',()=>{
  const a=seed(),b=seed(),beforeA=JSON.stringify(a),beforeB=JSON.stringify(b)
  const added=ops.addScreensFromTemplates(a,SCREEN_TEMPLATES,ids())
  assert.ok(added)
  assert.equal(added.screens.length,8)
  assert.equal(added.activeScreenId,added.screens[4].id)
  assert.deepEqual(located(added).slice(4),located(INITIAL_WORKSPACE))
  assert.equal(new Set(allIds(added)).size,allIds(added).length)
  assert.equal(JSON.stringify(a),beforeA)
  assert.equal(JSON.stringify(b),beforeB)
  assert.ok(ops.validateWorkspace(JSON.parse(JSON.stringify(added))))
})

test('bad templates and duplicate generated IDs are rejected without a partial screen',()=>{
  const before=seed(),original=JSON.stringify(before)
  const good=SCREEN_TEMPLATES[0]
  const variants=[
    {...good,panels:[...good.panels,{rect:{x:0,y:0,w:300,h:300},tabs:['unknown-kind'],active:'unknown-kind'}]},
    {...good,panels:[{rect:{x:0,y:0,w:100,h:140},tabs:['events'],active:'events'}]},
    {...good,panels:[{rect:{x:0,y:0,w:400,h:450},tabs:['events','events'],active:'events'}]},
    {...good,panels:[{rect:{x:0,y:0,w:400,h:450},tabs:['events'],active:'plan'}]},
    {...good,panels:[{rect:{x:0,y:0,w:400,h:450},tabs:['events'],active:'events'},{rect:{x:420,y:0,w:400,h:450},tabs:['events'],active:'events'}]},
  ]
  for(const bad of variants){
    assert.equal(ops.addScreensFromTemplates(before,[good,bad],ids()),null)
    assert.equal(JSON.stringify(before),original)
  }
  assert.equal(ops.addScreensFromTemplates(before,[],ids()),null)
  assert.equal(ops.addScreensFromTemplates(before,[good],()=> 'screen-1'),null)
  assert.equal(ops.duplicateScreen(before,'missing',ids()),null)
  assert.equal(ops.duplicateScreen(before,'screen-1',()=> 'panel-1'),null)
})

test('generic templates work with a non-simulator profile without domain types',()=>{
  const generic=createWorkspaceModel([{id:'doc.md',label:'doc',caption:'file',icon:'▤',minWidth:200,minHeight:180,maxPerScreen:1,accent:'#ccc'}])
  const init={version:3,activeScreenId:'one',screens:[{id:'one',title:'Plain',panels:[]}]}
  const t={id:'read',title:'Read',panels:[{rect:{x:10,y:10,w:320,h:290},tabs:['doc.md'],active:'doc.md'}]}
  const result=generic.addScreensFromTemplates(init,[t],ids())
  assert.ok(result)
  assert.equal(generic.openContent(result,'doc.md','unused').screenId,result.activeScreenId)
  assert.equal(generic.duplicateScreen(result,result.activeScreenId,()=> 'collision'),null)
})
