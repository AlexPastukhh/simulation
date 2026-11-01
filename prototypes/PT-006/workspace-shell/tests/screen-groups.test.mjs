import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
const CONTENT=[{id:'architecturePlan',label:'Architecture',caption:'',icon:'',minWidth:300,minHeight:250,maxPerScreen:null,accent:''}]
const INITIAL_WORKSPACE={version:3,activeScreenId:'a',screens:[{id:'a',title:'A',panels:[]},{id:'b',title:'B',panels:[]},{id:'c',title:'C',panels:[]},{id:'d',title:'D',panels:[]}] }

const ops=createWorkspaceModel(CONTENT)
const seed=()=>structuredClone(INITIAL_WORKSPACE)
const ids=()=>seed().screens.map(s=>s.id)

test('group at least two existing screens without modifying data or layout',()=>{
  const w=seed(),[a,b]=ids()
  const grouped=ops.saveScreenGroup(w,'group-1','Работа над архитектурой',[a,b])
  assert.ok(grouped)
  assert.ok(ops.validateWorkspace(grouped))
  assert.deepEqual(grouped.screens,w.screens)
  assert.deepEqual(grouped.screenGroups,[{id:'group-1',title:'Работа над архитектурой',screenIds:[a,b]}])
  assert.equal(w.screenGroups,undefined)
})
test('reject empty, repeated, unknown or conflicting memberships',()=>{
  const w=seed(),[a,b,c]=ids()
  assert.equal(ops.saveScreenGroup(w,'x','',[a,b]),null)
  assert.equal(ops.saveScreenGroup(w,'x','One',[a]),null)
  assert.equal(ops.saveScreenGroup(w,'x','One',[a,a]),null)
  assert.equal(ops.saveScreenGroup(w,'x','One',[a,'missing']),null)
  const grouped=ops.saveScreenGroup(w,'x','One',[a,b])
  const updated=ops.saveScreenGroup(grouped,'x','Again',[c,b])
  assert.deepEqual(updated.screenGroups,[{id:'x',title:'Again',screenIds:[c,b]}])
  assert.deepEqual(grouped.screenGroups,[{id:'x',title:'One',screenIds:[a,b]}])
  assert.equal(ops.saveScreenGroup(grouped,'y','Conflict',[b,c]),null)
  assert.equal(ops.saveScreenGroup(grouped,'x','Wrong',[a,'missing']),null)
})
test('edit and remove a group while retaining all its screens',()=>{
  const w=seed(),[a,b,c]=ids()
  const first=ops.saveScreenGroup(w,'x','One',[a,b])
  const edited=ops.saveScreenGroup(first,'x','New name',[b,c])
  assert.equal(edited.screenGroups.length,1)
  assert.deepEqual(edited.screenGroups[0].screenIds,[b,c])
  const removed=ops.removeScreenGroup(edited,'x')
  assert.deepEqual(removed.screenGroups,[])
  assert.deepEqual(removed.screens,w.screens)
})
test('when a screen is deleted, groups are updated or dissolved',()=>{
  const w=seed(),[a,b,c]=ids()
  const grouped=ops.saveScreenGroup(w,'x','Three',[a,b,c])
  const after=ops.removeScreen(grouped,a)
  assert.deepEqual(after.screenGroups[0].screenIds,[b,c])
  const last=ops.removeScreen(after,b)
  assert.deepEqual(last.screenGroups,[])
  assert.ok(ops.validateWorkspace(last))
})
test('group validation refuses corrupted saved layouts without a migration rewrite',()=>{
  const w=seed(),[a,b,c]=ids()
  const correct=ops.saveScreenGroup(w,'x','Group',[a,b])
  assert.ok(ops.validateWorkspace(correct))
  for(const value of [
    [{id:'x',title:'bad',screenIds:[a,a]}],
    [{id:'x',title:'bad',screenIds:['unknown',b]}],
    [{id:'x',title:'bad',screenIds:[a,b]},{id:'y',title:'bad',screenIds:[b,c]}],
    [{id:'x',title:'bad',screenIds:[a,b]},{id:'x',title:'bad',screenIds:[c]}],
  ])assert.equal(ops.validateWorkspace({...w,screenGroups:value}),false)
})
