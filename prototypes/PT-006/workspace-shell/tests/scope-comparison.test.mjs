import test from 'node:test'
import assert from 'node:assert/strict'
import { initialData,initialDataB } from '../src/profiles/architecture-simulator/content.ts'
import { createWorkspaceModel } from '../src/shell/workspace.ts'
import { CONTENT, INITIAL_WORKSPACE } from '../src/profiles/architecture-simulator/workspace.ts'
import { bindLegacyLayout,combineContextLayouts,scopeDescriptors } from '../src/shell/contexts.ts'
import { COMPARISON_MECHANISM,scopeContentId,parseScopeContentId,compatibleContexts,createComparisonScope,validateComparisonScope,comparisonDescriptor,comparisonScreens,comparisonReadout } from '../src/profiles/architecture-simulator/scope-mechanisms/comparison.ts'

const sources={A:structuredClone(initialData),B:structuredClone(initialDataB),'C-1':structuredClone(initialData)}
const resolve=id=>sources[id]??null
const create=(leftId='A',rightId='B')=>createComparisonScope('cmp-example',{leftId,rightId},resolve)
const freshIds=()=>{let n=0;return kind=>'new-'+kind+'-'+(++n)}
const base=()=>combineContextLayouts([bindLegacyLayout('A',INITIAL_WORKSPACE),bindLegacyLayout('B',INITIAL_WORKSPACE)])

test('comparison scope contains explicit resource bindings, read-only capability and presentation',()=>{
  const scope=create()
  assert.ok(scope)
  assert.equal(scope.mechanismId,COMPARISON_MECHANISM)
  assert.deepEqual(scope.allowedEffects,['read'])
  assert.deepEqual(scope.participants.left,{profileId:'architecture-simulator',contextId:'A',resourceId:'architecture'})
  assert.deepEqual(scope.participants.right,{profileId:'architecture-simulator',contextId:'B',resourceId:'architecture'})
  assert.deepEqual(scope.presentation,{contentId:scopeContentId(scope.id)})
  assert.equal(parseScopeContentId(scopeContentId(scope.id)),scope.id)
  assert.equal(validateComparisonScope(scope,resolve),true)
  assert.equal(parseScopeContentId('scope/%5A'),null)
  assert.equal(parseScopeContentId('scope/'),null)
})

test('applicability rejects missing, identical, incompatible, or unavailable sources',()=>{
  assert.equal(compatibleContexts({leftId:'A',rightId:'A'},resolve).ok,false)
  assert.equal(compatibleContexts({leftId:'A',rightId:'not-found'},resolve).ok,false)
  assert.equal(createComparisonScope('cmp-test',{leftId:'A',rightId:'minimal-notes'},resolve),null)
  const different=structuredClone(initialData);different.scenario.caseId='different-case'
  assert.equal(compatibleContexts({leftId:'A',rightId:'bad'},id=>id==='bad'?different:resolve(id)).ok,false)
  const anchorChanged=structuredClone(initialData);anchorChanged.scenario.anchors[0].id='foreign'
  assert.equal(compatibleContexts({leftId:'A',rightId:'bad'},id=>id==='bad'?anchorChanged:resolve(id)).ok,false)
  assert.equal(validateComparisonScope({...create(),allowedEffects:['write']},resolve),false)
  assert.equal(validateComparisonScope({...create(),participants:{left:{...create().participants.left,profileId:'other'},right:create().participants.right}},resolve),false)
})

test('ready and manual paths use same composition factory and do not mutate source State',()=>{
  const beforeA=JSON.stringify(sources.A),beforeB=JSON.stringify(sources.B)
  const ready=create(),manual=create('A','B')
  assert.deepEqual(comparisonScreens(ready),comparisonScreens(manual))
  const descriptors=['A','B'].flatMap(id=>scopeDescriptors(id,CONTENT))
  const model=createWorkspaceModel([...descriptors,comparisonDescriptor(ready)])
  const start=base(),screens=comparisonScreens(ready)
  const combined=model.addScreensFromTemplates(start,screens,freshIds())
  assert.ok(combined)
  assert.equal(combined.screens.length,start.screens.length+1)
  const p=combined.screens.at(-1).panels
  assert.deepEqual(p.map(panel=>panel.active),['context/A/architecture','context/B/architecture',ready.presentation.contentId])
  assert.ok(model.validateWorkspace(combined))
  assert.equal(JSON.stringify(start),JSON.stringify(base()))
  assert.equal(JSON.stringify(sources.A),beforeA)
  assert.equal(JSON.stringify(sources.B),beforeB)
})

test('read-only result uses selected bound sources rather than fixed A/B data',()=>{
  const copied=create('C-1','B')
  assert.ok(copied)
  sources['C-1'].events.selectedId=sources['C-1'].events.records[0].id
  const before=JSON.stringify(sources)
  const first=comparisonReadout(copied,resolve)
  const reverse=comparisonReadout(create('B','C-1'),resolve)
  assert.equal(first.left,'C-1')
  assert.equal(first.right,'B')
  assert.equal(reverse.left,'B')
  assert.ok(first.leftText.includes(sources['C-1'].events.records[0].label))
  assert.equal(first.leftText,reverse.rightText)
  copied.focus='requirements'
  assert.ok(comparisonReadout(copied,resolve).leftText)
  copied.focus='work'
  assert.ok(comparisonReadout(copied,resolve).rightText)
  assert.equal(JSON.stringify(sources),before) // read-only Scope never changes participants
})

test('layout placement and scope reject unsafe templates without partial mutation',()=>{
  const original=base(),before=JSON.stringify(original)
  const scope=create()
  const model=createWorkspaceModel([...['A','B'].flatMap(id=>scopeDescriptors(id,CONTENT)),comparisonDescriptor(scope)])
  const bad=structuredClone(comparisonScreens(scope))
  bad[0].panels[0].tabs=['context/missing/architecture']
  assert.equal(model.addScreensFromTemplates(original,bad,freshIds()),null)
  assert.equal(JSON.stringify(original),before)
})
