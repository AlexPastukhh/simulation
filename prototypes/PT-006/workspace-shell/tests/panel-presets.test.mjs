import test from 'node:test'
import assert from 'node:assert/strict'
import {createWorkspaceModel} from '../src/shell/workspace.ts'
import {capturePanelPreset,placePanelPreset,isPanelPresetStore} from '../src/shell/panelPresets.ts'

const descriptors=[
  {id:'A',label:'A',caption:'',icon:'',minWidth:220,minHeight:160,maxPerScreen:1,accent:''},
  {id:'B',label:'B',caption:'',icon:'',minWidth:390,minHeight:300,maxPerScreen:1,accent:''},
]
const ops=createWorkspaceModel(descriptors)
const workspace=()=>({version:3,activeScreenId:'target',screens:[
  {id:'source',title:'Source',panels:[{id:'original',rect:{x:10,y:10,w:430,h:310},tabs:['A','B'],active:'A'}]},
  {id:'target',title:'Target',panels:[]},
]})
const preset=()=>capturePanelPreset(workspace().screens[0].panels[0],'template-1','A/B')

test('panel preset captures the tab composition and size, not domain data',()=>{
  const template=preset()
  assert.deepEqual(template,{id:'template-1',title:'A/B',tabs:['A','B'],active:'A',size:{w:430,h:310}})
  assert.equal(isPanelPresetStore({version:1,items:[template]}),true)
  assert.equal(isPanelPresetStore({version:1,items:[template,template]}),false)
  assert.equal(isPanelPresetStore({version:1,items:[{...template,tabs:['A','A']}]}),false)
})
test('panel preset opens all tabs in order with original selection, without modifying source',()=>{
  const original=workspace()
  const result=placePanelPreset(original,'target','copy-panel',preset(),ops)
  assert.equal(result.ok,true)
  const copy=result.workspace.screens[1].panels[0]
  assert.deepEqual(copy.tabs,['A','B'])
  assert.equal(copy.active,'A')
  assert.deepEqual({w:copy.rect.w,h:copy.rect.h},{w:430,h:310})
  assert.deepEqual(original.screens[1].panels,[])
})
test('no partial panel is created when content is occupied or missing',()=>{
  const original=workspace()
  const already={...original,screens:[original.screens[0],{
    ...original.screens[1],panels:[{id:'taken',rect:{x:0,y:0,w:410,h:310},tabs:['A'],active:'A'}],
  }]}
  assert.equal(placePanelPreset(already,'target','new',preset(),ops).ok,false)
  assert.equal(already.screens[1].panels.length,1)
  assert.equal(placePanelPreset(original,'target','new',{...preset(),tabs:['missing'],active:'missing'},ops).ok,false)
  assert.equal(original.screens[1].panels.length,0)
})
test('panel presets preserve valid empty windows',()=>{
  const empty=capturePanelPreset({id:'empty',tabs:[],active:null,rect:{x:0,y:0,w:390,h:330}},'empty-preset','Empty')
  assert.equal(isPanelPresetStore({version:1,items:[empty]}),true)
  const result=placePanelPreset(workspace(),'target','empty-copy',empty,ops)
  assert.equal(result.ok,true)
  assert.equal(result.workspace.screens[1].panels[0].active,null)
})
