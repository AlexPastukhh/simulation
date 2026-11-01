import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
import { reduceShellState } from '../src/shell/workspaceDispatch.ts'

const ops=createWorkspaceModel([])
const initial={version:3,activeScreenId:'a',screens:[
  {id:'a',title:'Первый',panels:[]},
  {id:'b',title:'Второй',panels:[]},
]}
const start=()=>({layouts:{workspace:structuredClone(initial)},revision:0,bridgeReply:null})
const run=(state,action)=>reduceShellState(state,action,ops,'workspace',initial)

test('UI and external commands share one revision counter',()=>{
  const ui=run(start(),{type:'command',command:{type:'renameScreen',screenId:'a',title:'Новый'}})
  assert.equal(ui.revision,1)
  assert.equal(ui.layouts.workspace.screens[0].title,'Новый')
  const external=run(ui,{type:'command',command:{type:'activateScreen',screenId:'b'},
    expectedRevision:1,requestId:'r1'})
  assert.equal(external.revision,2)
  assert.equal(external.bridgeReply.status,'applied')
  assert.equal(external.layouts.workspace.activeScreenId,'b')
})
test('old revision fails without modifying current workspace',()=>{
  const first=run(start(),{type:'modify',update:w=>({...w,activeScreenId:'b'})})
  const rejected=run(first,{type:'command',command:{type:'removeScreen',screenId:'a'},
    expectedRevision:0,requestId:'r2'})
  assert.equal(rejected.bridgeReply.status,'conflict')
  assert.equal(rejected.revision,first.revision)
  assert.deepEqual(rejected.layouts,first.layouts)
})
test('failed command is acknowledged without changing layout',()=>{
  const rejected=run(start(),{type:'command',command:{type:'removeScreen',screenId:'not-here'},
    expectedRevision:0,requestId:'r3'})
  assert.equal(rejected.bridgeReply.status,'rejected')
  assert.equal(rejected.bridgeReply.code,'NOT_FOUND')
  assert.deepEqual(rejected.layouts,start().layouts)
})
