import test from 'node:test'
import assert from 'node:assert/strict'
import {validateSingleState,decodeSingleState,validateNavigation,normalizeNavigation,resolveArchitecture,CURRENT_VIEW} from '../src/profiles/single-architecture/state.ts'
import {instantiateEntity} from '../src/shell/templateInstances.ts'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE as A} from '../src/templates/content/feature-ddd-architecture-planning/template.ts'
import {SITE_REQUIREMENTS_MODEL_TEMPLATE as R} from '../src/templates/content/site-requirements-model/template.ts'
const architecture=title=>({representation:'feature-ddd',nodes:[{id:'f',kind:'feature',title}]})
const step=(title='Planned')=>({id:'step-1',title:'Step',target:architecture(title)})
const fixture=()=>({
 version:2,
 architecture:instantiateEntity(A,'architecture-main','Architecture',
  {representation:'feature-ddd-planning',current:architecture('Working fact'),steps:[step()]}),
 requirements:instantiateEntity(R,'requirements-main','Requirements',
  {representation:'site-requirements',requirements:[{id:'r',text:'Requirement'}]}),
 history:[{id:'fact-1',title:'Checkpoint',recordedAt:'2026-10-13T07:00:00.000Z',
  architecture:architecture('Historical fact'),requirements:{representation:'site-requirements',requirements:[]},steps:[step('Historical planned')]}],
})
const v1=()=>{
 const current=fixture()
 return {version:1,architecture:{...current.architecture,templateVersion:1,data:current.architecture.data.current},
  requirements:current.requirements,history:current.history,steps:current.architecture.data.steps,
  selection:'step-1',selectedEventId:null}
}
test('Plan data is owned by the Architecture Planning Instance, not the view or root state',()=>{
 const state=fixture()
 assert.equal(validateSingleState(state),true)
 assert.equal(state.architecture.templateVersion,2)
 assert.equal('steps' in state,false)
 assert.equal('selection' in state,false)
 assert.equal(state.architecture.data.current.nodes[0].title,'Working fact')
 assert.equal(state.architecture.data.steps[0].target.nodes[0].title,'Planned')
})
test('new single-architecture v1 upgrades losslessly in memory, without mutating the source',()=>{
 const old=v1(),before=JSON.stringify(old),state=decodeSingleState(old)
 assert.ok(state);assert.equal(validateSingleState(state),true)
 assert.deepEqual(state.architecture.data.current,old.architecture.data)
 assert.deepEqual(state.architecture.data.steps,old.steps)
 assert.deepEqual(state.requirements,old.requirements)
 assert.deepEqual(state.history,old.history)
 state.architecture.data.steps[0].target.nodes[0].title='Changed'
 assert.equal(JSON.stringify(old),before)
 const minimal=v1();delete minimal.history;delete minimal.selectedEventId
 assert.deepEqual(decodeSingleState(minimal).history,[])
})
test('unsupported old saves and invalid old cursors are rejected without a legacy importer',()=>{
 for(const mutate of [
  s=>s.version=5,s=>s.architecture.templateVersion=99,s=>s.selectedEventId='missing',
  s=>s.selectedEventId=42,s=>s.selection='missing',s=>s.steps[0].id='CURRENT',
  s=>s.requirements.data.sameAs='other',
 ]){
  const old=v1();mutate(old);const before=JSON.stringify(old)
  assert.equal(decodeSingleState(old),null);assert.equal(JSON.stringify(old),before)
 }
})
test('live and historical Steps reject reserved, empty, duplicate IDs and invalid targets equally',()=>{
 for(const steps of [
  [{...step(),id:'CURRENT'}],[{...step(),id:''}],[{...step(),title:' '}],[step(),step()],
  [{...step(),target:{representation:'feature-ddd',nodes:[{id:'f',title:'F',kind:'banana'}]}}],
 ])for(const place of ['live','historical']){
  const state=fixture()
  if(place==='live')state.architecture.data.steps=steps
  else state.history[0].steps=steps
  const before=JSON.stringify(state)
  assert.equal(validateSingleState(state),false)
  assert.equal(JSON.stringify(state),before)
 }
})
test('History still rejects invalid recorded dates, duplicate events and invalid subject models',()=>{
 for(const mutate of [
  s=>s.history[0].recordedAt='nonsense',s=>s.history[0].recordedAt='2026-02-30T07:00:00.000Z',
  s=>s.history[0].recordedAt=42,s=>s.history[0].title='',s=>s.history.push(structuredClone(s.history[0])),
 ]){
  const state=fixture();mutate(state);assert.equal(validateSingleState(state),false)
 }
})
test('view validation is separate from domain validation and malformed views fall back to CURRENT',()=>{
 const state=fixture(),before=JSON.stringify(state)
 for(const view of [{selection:'missing',selectedEventId:null},
  {selection:'CURRENT',selectedEventId:42},{selection:'CURRENT',selectedEventId:'missing'}]){
  assert.equal(validateNavigation(view,state),false)
  assert.deepEqual(normalizeNavigation(view,state),CURRENT_VIEW)
 }
 assert.equal(validateSingleState(state),true);assert.equal(JSON.stringify(state),before)
})
test('four live/historical factual/planned projections do not mutate any subject data',()=>{
 const state=fixture(),before=JSON.stringify(state)
 for(const [selectedEventId,selection,title] of [
  [null,'CURRENT','Working fact'],[null,'step-1','Planned'],
  ['fact-1','CURRENT','Historical fact'],['fact-1','step-1','Historical planned'],
 ]){
  const view={selectedEventId,selection};assert.equal(validateNavigation(view,state),true)
  assert.equal(resolveArchitecture(state,view).nodes[0].title,title)
 }
 state.architecture.data.steps[0].id='CURRENT'
 assert.equal(resolveArchitecture(state,CURRENT_VIEW).nodes[0].title,'Working fact')
 state.architecture.data.steps[0].id='step-1'
 assert.equal(JSON.stringify(state),before)
})
test('forbidden requirements fields reject working and historical data without rewriting it',()=>{
 for(const place of ['live','historical']){
  const state=fixture(),data={representation:'site-requirements',requirements:[],artifacts:[
   {id:'w1',kind:'widget',title:'Button',sameAs:'w2'},{id:'w2',kind:'widget',title:'Button'},
  ]}
  if(place==='live')state.requirements.data=data
  else state.history[0].requirements=data
  const raw=JSON.stringify(state)
  assert.equal(validateSingleState(JSON.parse(raw)),false);assert.equal(JSON.stringify(state),raw)
 }
})
