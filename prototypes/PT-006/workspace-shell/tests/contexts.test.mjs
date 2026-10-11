import test from 'node:test'
import assert from 'node:assert/strict'
import {scopeDescriptors,scopedContentId,parseScopedContentId,bindContextScreens,bindLegacyLayout,combineContextLayouts,instantiateContext} from '../src/shell/contexts.ts'
import {createWorkspaceModel} from '../src/shell/workspace.ts'
import {CONTENT,INITIAL_WORKSPACE,SCREEN_TEMPLATES} from '../src/profiles/architecture-simulator/workspace.ts'

const multi=()=>createWorkspaceModel(['A','B'].flatMap(id=>scopeDescriptors(id,CONTENT)))
const ids=()=>{let n=0;return kind=>'next-'+kind+'-'+(++n)}

test('resource identities keep context distinct from kind and visual placement',()=>{
  const a=scopedContentId('A','architecture'),b=scopedContentId('B','architecture')
  assert.notEqual(a,b)
  assert.deepEqual(parseScopedContentId(a),{contextId:'A',resourceId:'architecture'})
  assert.deepEqual(parseScopedContentId(scopedContentId('copy/a','draft x')),{contextId:'copy/a',resourceId:'draft x'})
  for(const bad of ['architecture','context//architecture','context/A/','context/A/b/c','context/%gg/architecture','context/A/%61rchitecture']){
    assert.equal(parseScopedContentId(bad),null,bad)
  }
  assert.throws(()=>scopedContentId('','architecture'))
})

test('prepared context starts as a copy, and a minimal context needs no history',()=>{
  const seed={requirements:[{id:'r-1',title:'First'}]}
  const template={id:'plain',profileId:'synthetic',title:'Planning',seed,screens:[]}
  const a=instantiateContext(template,'C-1')
  const b=instantiateContext(template,'C-2','source-C')
  a.state.requirements[0].title='Changed'
  assert.equal(b.state.requirements[0].title,'First')
  assert.equal(seed.requirements[0].title,'First')
  assert.equal(a.history,undefined)
  assert.equal(b.provenance,'source-C')
})

test('scoping legacy A/B layout preserves IDs, geometry, original content and branch state',()=>{
  const a=bindLegacyLayout('A',INITIAL_WORKSPACE)
  const b=bindLegacyLayout('B',INITIAL_WORKSPACE)
  const joined=combineContextLayouts([a,b])
  assert.equal(joined.version,3)
  assert.equal(joined.screens.length,8)
  assert.equal(joined.activeScreenId,'A::screen-1')
  assert.equal(joined.screens[0].panels[0].active,scopedContentId('A','events'))
  assert.equal(joined.screens[4].panels[0].active,scopedContentId('B','events'))
  assert.deepEqual(joined.screens[0].panels[0].rect,INITIAL_WORKSPACE.screens[0].panels[0].rect)
  assert.equal(INITIAL_WORKSPACE.screens[0].panels[0].active,'events')
  assert.ok(multi().validateWorkspace(joined))
  assert.notEqual(joined.screens[0].id,joined.screens[4].id)
})

test('A and B ordinary architecture windows coexist on the same screen',()=>{
  const ops=multi()
  const base=combineContextLayouts([bindLegacyLayout('A',INITIAL_WORKSPACE),bindLegacyLayout('B',INITIAL_WORKSPACE)])
  const target='A::screen-2'
  const before=JSON.stringify(base)
  const added=ops.addContent(ops.addPanel(base,target,'B-other',{x:20,y:880,w:610,h:420}),target,'B-other',scopedContentId('B','architecture'))
  assert.ok(ops.validateWorkspace(added))
  const onScreen=added.screens.find(s=>s.id===target).panels.flatMap(p=>p.tabs)
  assert.ok(onScreen.includes(scopedContentId('A','architecture')))
  assert.ok(onScreen.includes(scopedContentId('B','architecture')))
  assert.equal(JSON.stringify(base),before)
  const jumped=ops.openContent(added,scopedContentId('B','architecture'),'not-used')
  assert.equal(jumped.created,false)
  assert.equal(jumped.screenId,target)
})

test('one context template creates four screens atomically, not copies of another context data',()=>{
  const ops=createWorkspaceModel(['A','B','C-1'].flatMap(id=>scopeDescriptors(id,CONTENT)))
  const base=combineContextLayouts([bindLegacyLayout('A',INITIAL_WORKSPACE),bindLegacyLayout('B',INITIAL_WORKSPACE)])
  const templates=bindContextScreens('C-1',SCREEN_TEMPLATES)
  assert.equal(templates.length,4)
  const after=ops.addScreensFromTemplates(base,templates,ids())
  assert.ok(after)
  assert.equal(after.screens.length,12)
  assert.equal(after.activeScreenId,after.screens[8].id)
  assert.equal(after.screens.slice(8).flatMap(s=>s.panels.flatMap(p=>p.tabs)).length,18)
  assert.ok(after.screens.slice(8).flatMap(s=>s.panels.flatMap(p=>p.tabs)).every(id=>parseScopedContentId(id).contextId==='C-1'))
  assert.equal(base.screens.length,8)
  assert.ok(ops.validateWorkspace(after))
})

test('invalid mixed-context placement fails atomically',()=>{
  const ops=multi()
  const base=combineContextLayouts([bindLegacyLayout('A',INITIAL_WORKSPACE),bindLegacyLayout('B',INITIAL_WORKSPACE)])
  const bad=bindContextScreens('missing',SCREEN_TEMPLATES)
  assert.equal(ops.addScreensFromTemplates(base,bad,ids()),null)
  assert.equal(base.screens.length,8)
  assert.throws(()=>combineContextLayouts([bindLegacyLayout('A',INITIAL_WORKSPACE),bindLegacyLayout('A',INITIAL_WORKSPACE)]))
})
