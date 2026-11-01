import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {validateSingleState,validateNavigation,resolveArchitecture} from '../src/profiles/single-architecture/state.ts'
import {INITIAL_WORKSPACE,DESCRIPTORS,MARKDOWN_DESCRIPTOR,PREVIOUS_INITIAL_WORKSPACES} from '../src/profiles/single-architecture/workspace.ts'
import {createWorkspaceModel} from '../src/shell/workspace.ts'
import {matchesDefaultComposition} from '../src/shell/screenTemplates.ts'
const fixture=JSON.parse(readFileSync(new URL('../examples/architecture-evolution.json',import.meta.url),'utf8'))
test('saved evolution example validates and matches the unique default',()=>{
 assert.equal(validateSingleState(fixture.state),true)
 assert.equal(validateNavigation(fixture.navigation,fixture.state),true)
 assert.equal(createWorkspaceModel([...DESCRIPTORS,MARKDOWN_DESCRIPTOR]).validateWorkspace(fixture.layout),true)
 assert.deepEqual(fixture.layout,INITIAL_WORKSPACE)
 const active=fixture.layout.screens.flatMap(s=>s.panels.map(p=>p.active))
 assert.equal(active.length,16);assert.equal(new Set(active).size,16)
 assert.equal(PREVIOUS_INITIAL_WORKSPACES.at(-1).screens.flatMap(s=>s.panels).length,17)
 assert.equal(matchesDefaultComposition(PREVIOUS_INITIAL_WORKSPACES.at(-1),PREVIOUS_INITIAL_WORKSPACES.at(-1)),true)
})
test('six distinct future targets stay separate from the four-node CURRENT and actual files',()=>{
 const {state}=fixture,plan=state.architecture.data
 assert.equal(plan.current.nodes.length,4)
 assert.deepEqual(plan.steps.map(s=>s.target.nodes.length),[6,8,11,14,17,20])
 for(const step of plan.steps){
  assert.equal(resolveArchitecture(state,{selection:step.id,selectedEventId:null}).nodes.length,step.target.nodes.length)
  const effects=state.materials.implementation.data.effects.filter(e=>e.stepId===step.id)
  assert.ok(effects.length>=2)
  for(const effect of effects){
   assert.ok(step.target.nodes.some(n=>n.id===effect.nodeId))
   if(effect.action==='CREATE')assert.ok(!state.materials.implementation.data.files.some(f=>f.path===effect.path))
  }
 }
 assert.equal(resolveArchitecture(state,{selection:'CURRENT',selectedEventId:null}).nodes.length,4)
})
test('eight chronological historical facts preserve knowledge and actual additions, changes and removal',()=>{
 const {history}=fixture.state;assert.equal(history.length,8)
 assert.deepEqual(history.map(e=>e.architecture.nodes.length),[0,2,2,3,3,4,4,4])
 assert.ok(history.every((e,i)=>!i||e.recordedAt>history[i-1].recordedAt))
 assert.ok(history[3].architecture.nodes.some(n=>n.id==='service-inline-comment'))
 assert.ok(!history[4].architecture.nodes.some(n=>n.id==='service-inline-comment'))
 assert.ok(history[4].architecture.nodes.some(n=>n.id==='entity-comment'))
 assert.notEqual(history[1].architecture.nodes.find(n=>n.id==='aggregate-task').title,history[2].architecture.nodes.find(n=>n.id==='aggregate-task').title)
 assert.ok(history.slice(0,7).every(e=>!e.steps.some(s=>s.id==='step-webhooks')))
 assert.ok(history.slice(0,6).every(e=>!e.requirements.requirements.some(r=>r.id==='req-retry')))
 for(const event of history){
  assert.ok(!event.materials.implementation.data.files.some(f=>f.path==='src/notifications/email.ts'))
  for(const episode of event.materials.work.data.episodes)assert.ok(episode.date<=event.recordedAt)
  for(const effect of event.materials.implementation.data.effects)assert.ok(event.steps.some(s=>s.id===effect.stepId))
  for(const link of event.materials.trace.data.links)assert.ok(event.requirements.requirements.some(r=>r.id===link.requirementId))
 }
})
test('latest fact agrees with CURRENT while older facts retain their own Plan and sources',()=>{
 const {state}=fixture,last=state.history.at(-1)
 assert.deepEqual(last.architecture,state.architecture.data.current)
 assert.deepEqual(last.requirements,state.requirements.data)
 assert.deepEqual(last.steps,state.architecture.data.steps)
 assert.deepEqual(last.materials,state.materials)
 assert.deepEqual(last.planningDetails,state.architecture.data.details)
 assert.equal(state.history[1].steps.length,1)
 assert.equal(state.history[1].materials.implementation.data.files.length,2)
 assert.equal(state.history[1].planningDetails.forecasts.length,0)
 assert.equal(state.architecture.data.details.forecasts.length,3)
})
