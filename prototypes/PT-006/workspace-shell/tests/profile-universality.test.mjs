import test from 'node:test'
import assert from 'node:assert/strict'
import {MARKDOWN_ID,DEFAULT_MARKDOWN,validMarkdownState,descriptorsForMarkdown,markdownTemplate,defaultMarkdownWorkspace,readMarkdown} from '../src/profiles/markdown-fixture/model.ts'
import {resolveReadOnlyResource,inspectResources,resourcesSupport} from '../src/shell/resourceProviders.ts'
import {scopedContentId} from '../src/shell/contexts.ts'
import {createWorkspaceModel} from '../src/shell/workspace.ts'
import {initialData,initialDataB} from '../src/profiles/architecture-simulator/content.ts'
import {createComparisonScope} from '../src/profiles/architecture-simulator/scope-mechanisms/comparison.ts'
const fixture=structuredClone(DEFAULT_MARKDOWN)
const docs=[fixture]
const md={profileId:MARKDOWN_ID,readResource:ref=>readMarkdown(ref,docs)}
const arch={profileId:'architecture-simulator',readResource:ref=>{
  if(ref.profileId!=='architecture-simulator'||ref.resourceId!=='architecture'||!['A','B'].includes(ref.contextId))return null
  return {ref:{...ref},capability:'architecture.read',title:'Architecture '+ref.contextId,summary:'A/B prepared data'}
}}
const a={profileId:'architecture-simulator',contextId:'A',resourceId:'architecture'}
const b={profileId:'architecture-simulator',contextId:'B',resourceId:'architecture'}
const m={profileId:MARKDOWN_ID,contextId:'M-1',resourceId:'document'}

test('second profile has independent state and no mandatory History',()=>{
  assert.equal(validMarkdownState({version:1,items:docs}),true)
  assert.equal('history' in fixture,false)
  assert.equal('scenario' in fixture,false)
  assert.equal(validMarkdownState({version:1,items:[fixture,fixture]}),false)
  assert.equal(validMarkdownState({version:1,items:[{...fixture,document:{title:'X',body:undefined}}]}),false)
  assert.equal(readMarkdown({...m,resourceId:'architecture'},docs),null)
  assert.equal(readMarkdown({...m,profileId:'architecture-simulator'},docs),null)
})
test('second profile uses generic Workspace screens, placements and copies',()=>{
  const base=defaultMarkdownWorkspace()
  assert.ok(createWorkspaceModel(descriptorsForMarkdown(docs)).validateWorkspace(base))
  const other={id:'M-2',title:'Independent',document:{title:'Other',body:'# Different'}}
  const ops=createWorkspaceModel(descriptorsForMarkdown([...docs,other]))
  let n=0
  const placed=ops.addScreensFromTemplates(base,markdownTemplate(other.id),kind=>kind+'-'+(++n))
  assert.ok(placed)
  assert.ok(ops.validateWorkspace(placed))
  assert.equal(placed.screens.length,2)
  assert.equal(placed.screens[1].panels[0].active,scopedContentId('M-2','document'))
  const copied=ops.duplicateScreen(placed,placed.screens[1].id,kind=>kind+'-copy-'+(++n))
  assert.ok(copied)
  assert.equal(copied.screens.length,3)
  assert.equal(copied.screens[2].panels[0].active,scopedContentId('M-2','document'))
  assert.equal(base.screens.length,1)
})
test('federated provider reads resources from two profiles without mixing capability',()=>{
  const providers=[arch,md]
  assert.equal(resolveReadOnlyResource(a,providers).capability,'architecture.read')
  assert.equal(resolveReadOnlyResource(m,providers).capability,'document.read')
  const mixed=inspectResources(a,m,providers)
  assert.ok(mixed)
  assert.deepEqual(mixed.allowedEffects,['read'])
  assert.equal(mixed.left.ref.profileId,'architecture-simulator')
  assert.equal(mixed.right.ref.profileId,MARKDOWN_ID)
  assert.equal(resourcesSupport([a,b],providers,['architecture.read','architecture.read']),true)
  assert.equal(resourcesSupport([a,m],providers,['architecture.read','architecture.read']),false)
  assert.equal(resourcesSupport([m,m],providers,['architecture.read','architecture.read']),false)
  assert.equal(resolveReadOnlyResource(m,[md,md]),null)
  assert.equal(resolveReadOnlyResource({...m,contextId:'absent'},providers),null)
  const spoofed={profileId:MARKDOWN_ID,readResource:()=>({ref:{...a},capability:'architecture.read',title:'spoof',summary:'spoof'})}
  assert.equal(resolveReadOnlyResource(m,[spoofed]),null)
  const snapshot=resolveReadOnlyResource(m,providers)
  snapshot.title='modified'
  assert.notEqual(readMarkdown(m,docs).title,'modified')
})
test('Architecture Comparison still rejects Markdown context',()=>{
  const resolve=id=>id==='A'?structuredClone(initialData):id==='B'?structuredClone(initialDataB):null
  assert.ok(createComparisonScope('cmp-test',{leftId:'A',rightId:'B'},resolve))
  assert.equal(createComparisonScope('cmp-test',{leftId:'A',rightId:'M-1'},resolve),null)
  assert.equal(resourcesSupport([a,m],[arch,md],['architecture.read','architecture.read']),false)
})