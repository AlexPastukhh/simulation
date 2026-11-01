import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
import { parseWorkspaceCommand, executeWorkspaceCommand } from '../src/shell/workspaceCommands.ts'

const ops=createWorkspaceModel([])
const screen=(id)=>({id,title:id,panels:[]})
const fixture=()=>({
  version:3,activeScreenId:'b1',
  screens:[screen('a1','A'),screen('b1','B'),screen('b2','B'),screen('a2','A')],
  screenGroups:[{id:'g1',title:'Группа',screenIds:['a1','b1','b2']}],
})
const command=(w,c)=>executeWorkspaceCommand(w,parseWorkspaceCommand(c),ops)

test('only known, well-formed commands enter from external input',()=>{
  assert.deepEqual(parseWorkspaceCommand({type:'renameScreen',screenId:'a1',title:' Новое '}),
    {type:'renameScreen',screenId:'a1',title:'Новое'})
  for(const bad of [null,{},'renameScreen',{type:'unknown'},
    {type:'renameScreen',screenId:'a1',title:' '},
    {type:'removeScreen',screenId:null},
    {type:'removeScreensByContext',contextId:'old-architecture'}]){
    assert.equal(parseWorkspaceCommand(bad),null)
  }
})
test('UI-style rename and external rename share the same operation',()=>{
  const original=fixture()
  const next=command(original,{type:'renameScreen',screenId:'a1',title:'Рабочий экран'})
  assert.equal(next.ok,true)
  assert.equal(next.workspace.screens[0].title,'Рабочий экран')
  assert.equal(original.screens[0].title,'a1')
  assert.deepEqual(next.affectedScreenIds,['a1'])
  assert.equal(command(next.workspace,{type:'renameScreen',screenId:'a1',title:'Рабочий экран'}).code,'NO_CHANGE')
})

test('create, activate, and remove screens preserve valid Workspace',()=>{
  const original=fixture()
  const created=command(original,{type:'createScreen',screenId:'new'})
  assert.equal(created.ok,true)
  assert.equal(created.workspace.activeScreenId,'new')
  assert.equal(created.workspace.screens.at(-1).id,'new')
  assert.equal(ops.validateWorkspace(created.workspace),true)
  const activated=command(created.workspace,{type:'activateScreen',screenId:'a2'})
  assert.equal(activated.workspace.activeScreenId,'a2')
  const removed=command(activated.workspace,{type:'removeScreen',screenId:'new'})
  assert.equal(removed.workspace.screens.length,4)
  assert.equal(command(removed.workspace,{type:'removeScreen',screenId:'missing'}).code,'NOT_FOUND')
})

test('refuses to remove the last remaining screen',()=>{
  const lone={version:3,activeScreenId:'only',screens:[screen('only','B')]}
  assert.equal(command(lone,{type:'removeScreen',screenId:'only'}).code,'LAST_SCREEN')
  assert.equal(lone.screens.length,1)
})

test('external commands manage panels and tabs without bypassing descriptor rules',()=>{
  const model=createWorkspaceModel([{id:'doc',label:'Doc',caption:'',icon:'',minWidth:190,minHeight:156,maxPerScreen:1,accent:''}])
  const w={version:3,activeScreenId:'first',screens:[{id:'first',title:'First',panels:[]}]}
  const apply=(current,command)=>executeWorkspaceCommand(current,parseWorkspaceCommand(command),model)
  const added=apply(w,{type:'addPanel',screenId:'first',panelId:'p1',contentId:'doc'})
  assert.equal(added.ok,true)
  assert.deepEqual(added.workspace.screens[0].panels[0].tabs,['doc'])
  assert.equal(apply(added.workspace,{type:'addPanel',screenId:'first',panelId:'p2',contentId:'doc'}).ok,false)
  assert.equal(apply(added.workspace,{type:'addContent',screenId:'first',panelId:'p1',contentId:'unknown'}).code,'UNKNOWN_CONTENT')
  const removed=apply(added.workspace,{type:'removeContent',screenId:'first',panelId:'p1',contentId:'doc'})
  assert.equal(removed.workspace.screens[0].panels[0].active,null)
  const closed=apply(removed.workspace,{type:'removePanel',screenId:'first',panelId:'p1'})
  assert.equal(closed.workspace.screens[0].panels.length,0)
})

test('external commands create groups and duplicate screens preserving source',()=>{
  const source=fixture()
  const grouped=command(source,{type:'saveScreenGroup',groupId:'new-group',title:'Plan',screenIds:['a1','a2']})
  assert.equal(grouped.ok,false,'An already grouped screen cannot enter another group')
  const without=command(source,{type:'removeScreenGroup',groupId:'g1'})
  assert.equal(without.ok,true)
  const withGroup=command(without.workspace,{type:'saveScreenGroup',groupId:'g2',title:'Plan',screenIds:['a1','a2']})
  assert.equal(withGroup.ok,true)
  assert.equal(withGroup.workspace.screenGroups[0].title,'Plan')
  const copy=command(withGroup.workspace,{type:'duplicateScreen',sourceId:'a1',screenId:'copy',panelIds:[]})
  assert.equal(copy.ok,true)
  assert.equal(copy.workspace.screens.at(-1).title,'a1 — копия')
  assert.equal(source.screens.length,4)
})
