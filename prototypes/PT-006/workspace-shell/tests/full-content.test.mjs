import test from 'node:test'
import assert from 'node:assert/strict'
import {emptyMaterials,emptyPlanningDetails,validateMaterials,validateData,MATERIAL_SCHEMAS,PLANNING_DETAILS_SCHEMA} from '../src/templates/content/simulation-material/model.ts'
import {validateSingleState,resolveArchitecture} from '../src/profiles/single-architecture/state.ts'
import {factualMaterials,planningDetails} from '../src/profiles/single-architecture/contentProjection.ts'
import {matchesDefaultComposition} from '../src/shell/screenTemplates.ts'
import {SCREEN_TEMPLATES,INITIAL_WORKSPACE,PREVIOUS_INITIAL_WORKSPACES} from '../src/profiles/single-architecture/workspace.ts'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE as A} from '../src/templates/content/feature-ddd-architecture-planning/template.ts'
import {SITE_REQUIREMENTS_MODEL_TEMPLATE as R} from '../src/templates/content/site-requirements-model/template.ts'
import {instantiateEntity} from '../src/shell/templateInstances.ts'
const create=()=>({version:2,architecture:instantiateEntity(A,'architecture-main','Architecture',
 {representation:'feature-ddd-planning',current:{representation:'feature-ddd',nodes:[]},steps:[]}),
 requirements:instantiateEntity(R,'requirements-main','Requirements',{representation:'site-requirements',requirements:[]}),history:[]})
test('all documented placements restored; Architecture substituted, A/B excluded',()=>{
 assert.deepEqual(SCREEN_TEMPLATES.map(t=>t.panels.length),[5,4,4,3])
 assert.deepEqual(SCREEN_TEMPLATES.map(t=>t.panels.map(p=>p.active)),[
  ['events','current','requirements','explorer','scenario'],
  ['architecturePlan','implementation','trace','impactHistory'],
  ['plan','impact','forecasts','axes'],
  ['work','hotpaths','fitness'],
 ])
 assert.equal(INITIAL_WORKSPACE.screens.length,4)
 const primary=SCREEN_TEMPLATES.flatMap(t=>t.panels.map(p=>p.active))
 assert.equal(new Set(primary).size,primary.length,'Repeated default Content kind')
 assert.ok(!JSON.stringify(SCREEN_TEMPLATES).includes('"comparison"'))
 assert.ok(!SCREEN_TEMPLATES.some(t=>t.panels.some(p=>p.tabs.includes('architecture'))))
})
test('five explicit Content sources are valid, closed and independent',()=>{
 const materials=emptyMaterials()
 assert.equal(validateMaterials(materials),true)
 const independent=structuredClone(materials)
 independent.implementation.data.files.push({id:'f',path:'src/task.ts',nodeId:'draft-node'})
 assert.equal(validateMaterials(independent),true)
 assert.deepEqual(materials.implementation.data.files,[])
 const unknown=structuredClone(materials);unknown.scenario.data.branch='A'
 assert.equal(validateMaterials(unknown),false)
 const bad=structuredClone(materials);bad.work.data.hotPaths.push({id:'h',path:'src/a.ts',touches:-1,note:''})
 assert.equal(validateMaterials(bad),false)
 const duplicate=structuredClone(materials);duplicate.trace.data.links=[
  {id:'x',requirementId:'draft',nodeId:'draft',filePath:'external.ts',note:''},
  {id:'x',requirementId:'draft2',nodeId:'draft2',filePath:'external2.ts',note:''},
 ]
 assert.equal(validateMaterials(duplicate),false)
})
test('planning details stay in the same Plan; invalid dates and unknown fields fail',()=>{
 const details=emptyPlanningDetails()
 assert.equal(validateData(details,PLANNING_DETAILS_SCHEMA),true)
 details.deadlines.push({id:'d',title:'Deadline',date:'2026-02-31',kind:'hard',source:'example'})
 assert.equal(validateData(details,PLANNING_DETAILS_SCHEMA),false)
 details.deadlines[0].date='2026-02-28'
 assert.equal(validateData(details,PLANNING_DETAILS_SCHEMA),true)
 const state=create();state.architecture.data.details=details;state.materials=emptyMaterials()
 assert.equal(validateSingleState(state),true)
 details.axesAsActual=true
 assert.equal(validateSingleState(state),false)
})
test('old v2 loads without writes or injected Content; historical absence does not fall back to live',()=>{
 const state=create(),before=JSON.stringify(state)
 assert.equal(validateSingleState(state),true)
 assert.deepEqual(factualMaterials(state,{selection:'CURRENT',selectedEventId:null}),emptyMaterials())
 assert.equal(JSON.stringify(state),before)
 state.materials=emptyMaterials();state.materials.implementation.data.files.push({id:'live',path:'live.ts'})
 state.architecture.data.details=emptyPlanningDetails()
 state.architecture.data.details.forecasts.push({id:'f',event:'Future',predictedRequirement:'Future requirement',basis:'example'})
 state.history.push({id:'past',title:'Past',recordedAt:'2026-10-12T00:00:00.000Z',architecture:{representation:'feature-ddd',nodes:[]},requirements:state.requirements.data,steps:[]})
 assert.equal(validateSingleState(state),true)
 assert.equal(factualMaterials(state,{selection:'CURRENT',selectedEventId:'past'}),null)
 assert.equal(planningDetails(state,{selection:'CURRENT',selectedEventId:'past'}),null)
 assert.equal(resolveArchitecture(state,{selection:'CURRENT',selectedEventId:'past'}).nodes.length,0)
})
test('complete explicit checkpoint captures material and Plan by value',()=>{
 const state=create();state.materials=emptyMaterials();state.architecture.data.details=emptyPlanningDetails()
 state.materials.work.data.episodes.push({id:'e',date:'2026-10-13T00:00:00.000Z',goal:'Task',activities:['test'],evidence:['authored']})
 state.history.push({id:'f',title:'Fact',recordedAt:'2026-10-13T00:00:00.000Z',
  architecture:structuredClone(state.architecture.data.current),requirements:structuredClone(state.requirements.data),steps:[],
  materials:structuredClone(state.materials),planningDetails:structuredClone(state.architecture.data.details)})
 const before=JSON.stringify(state.history)
 state.materials.work.data.episodes[0].goal='Later';state.architecture.data.details.changeAxes.push({id:'a',direction:'Later',horizon:'future',salience:'unknown',basis:'example'})
 assert.equal(JSON.stringify(state.history),before)
 assert.equal(validateSingleState(state),true)
})
test('both mistaken defaults expand despite cursor changes; custom geometry and extra tabs survive',()=>{
 for(const baseline of PREVIOUS_INITIAL_WORKSPACES){
  const changedCursor=structuredClone(baseline)
  changedCursor.activeScreenId=changedCursor.screens.at(-1).id
  assert.equal(matchesDefaultComposition(changedCursor,baseline),true)
  changedCursor.screens[0].panels[0].rect.x++
  assert.equal(matchesDefaultComposition(changedCursor,baseline),false)
 }
 assert.equal(validateData({files:[],effects:[{id:'e',stepId:'not-yet-known',path:'future.ts',action:'CREATE',reason:'draft'}]},MATERIAL_SCHEMAS.implementation),true)
})
