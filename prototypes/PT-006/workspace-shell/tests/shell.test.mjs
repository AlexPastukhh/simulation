import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
import { CONTENT, INITIAL_WORKSPACE } from '../src/profiles/architecture-simulator/workspace.ts'

const descriptors = [
  {id:'markdown:README.md',label:'README.md',caption:'Markdown',icon:'▤',minWidth:250,minHeight:220,maxPerScreen:null,accent:'#ccc'},
  {id:'markdown:DESIGN.md',label:'DESIGN.md',caption:'Markdown',icon:'▤',minWidth:250,minHeight:220,maxPerScreen:null,accent:'#ccc'},
]
const ops=createWorkspaceModel(descriptors)
const rect={x:12,y:24,w:320,h:340}
const seed=()=>({version:3,activeScreenId:'main',screens:[
  {id:'main',title:'Main',panels:[{id:'one',rect,tabs:['markdown:README.md','markdown:DESIGN.md'],active:'markdown:README.md'}]},
  {id:'other',title:'Other',panels:[{id:'two',rect:{x:700,y:600,w:310,h:330},tabs:['markdown:DESIGN.md'],active:'markdown:DESIGN.md'}]},
]})

test('generic shell resolves an inactive document tab on the active screen without changing geometry',()=>{
  const before=seed(), result=ops.openContent(before,'markdown:DESIGN.md','unused')
  assert.equal(result.created,false)
  assert.equal(result.panelId,'one')
  assert.equal(result.workspace.screens[0].panels[0].active,'markdown:DESIGN.md')
  assert.equal(result.workspace.activeScreenId,'main')
  assert.deepEqual(result.workspace.screens[0].panels[0].rect,rect)
  assert.deepEqual(before,seed())
})
test('generic shell navigates across screens when an instance is absent locally',()=>{
  const before=seed()
  before.screens[0].panels[0].tabs=['markdown:README.md']
  const target=ops.openContent(before,'markdown:DESIGN.md','unused')
  assert.equal(target.created,false)
  assert.equal(target.screenId,'other')
  assert.equal(target.panelId,'two')
  assert.equal(target.workspace.activeScreenId,'other')
})
test('two Markdown documents of the same type remain distinguishable by instance identity',()=>{
  const before=seed()
  assert.equal(ops.openContent(before,'markdown:README.md','new').panelId,'one')
  assert.equal(ops.openContent(before,'markdown:DESIGN.md','new').panelId,'one')
  assert.notEqual(descriptors[0].id,descriptors[1].id)
})
test('opening absent content creates one window and repeated open reuses it',()=>{
  const before=seed()
  before.screens[0].panels[0].tabs=[]
  before.screens[0].panels[0].active=null
  before.screens[1].panels=[]
  const first=ops.openContent(before,'markdown:DESIGN.md','new-window')
  assert.equal(first.created,true)
  const second=ops.openContent(first.workspace,'markdown:DESIGN.md','another-window')
  assert.equal(second.created,false)
  assert.equal(second.panelId,'new-window')
  assert.equal(second.workspace.screens[0].panels.length,2)
})
test('unknown content cannot create an unregistered tab or window',()=>{
  assert.equal(ops.openContent(seed(),'unknown','new-window'),null)
})
test('active-screen priority precedes other screen even when duplicate instance exists',()=>{
  const result=ops.openContent(seed(),'markdown:DESIGN.md','new')
  assert.equal(result.screenId,'main')
})
test('existing simulator layout remains valid through the generic shell model',()=>{
  const simulator=createWorkspaceModel(CONTENT)
  assert.equal(simulator.validateWorkspace(INITIAL_WORKSPACE),true)
  const plan=simulator.openContent(INITIAL_WORKSPACE,'architecturePlan','unused')
  assert.equal(plan.created,false)
  assert.equal(plan.screenId,'screen-4')
})
test('generic shell does not import simulator domain types or components',()=>{
  for(const file of ['workspace.ts','WorkspaceShell.tsx','windowDrag.ts','contracts.ts']){
    const source=readFileSync(new URL('../src/shell/'+file,import.meta.url),'utf8')
    assert.doesNotMatch(source,/profiles\/architecture-simulator|\.\.\/content\.ts|DomainContent|PlanRevision|ActualEventHistory/)
  }
})
