import test from 'node:test'
import assert from 'node:assert/strict'
import {writePreservingInvalid,RECOVERY_PREFIX,validStoredJson,parseStored} from '../src/shell/safeStorage.ts'
import {createWorkspaceModel,FRAME_MIN} from '../src/shell/workspace.ts'
import {CONTENT,INITIAL_WORKSPACE} from '../src/profiles/architecture-simulator/workspace.ts'
import {descriptorsForMarkdown,defaultMarkdownWorkspace,DEFAULT_MARKDOWN} from '../src/profiles/markdown-fixture/model.ts'

function withStorage(fn){
  const original=globalThis.localStorage
  const data=new Map()
  globalThis.localStorage={
    getItem:key=>data.has(key)?data.get(key):null,
    setItem:(key,v)=>{data.set(key,String(v))},
    removeItem:key=>{data.delete(key)},
  }
  try{return fn(data)}
  finally{globalThis.localStorage=original}
}
test('malformed original is archived exactly once before explicit overwrite',()=>withStorage(data=>{
  const key='layout-A',raw='INVALID_LAYOUT_BYTES'
  data.set(key,raw)
  const valid=validStoredJson(x=>typeof x==='object'&&x!==null&&x.version===3)
  assert.equal(writePreservingInvalid(key,'{"version":3}',valid),true)
  assert.equal(data.get(RECOVERY_PREFIX+key),raw)
  assert.equal(data.get(key),'{"version":3}')
  assert.equal(writePreservingInvalid(key,'{"version":3,"other":1}',valid),true)
  assert.equal(data.get(RECOVERY_PREFIX+key),raw)
  data.set(key,'SECOND_DAMAGED_VERSION')
  assert.equal(writePreservingInvalid(key,'{"version":3}',valid),false)
  assert.equal(data.get(key),'SECOND_DAMAGED_VERSION')
  assert.equal(data.get(RECOVERY_PREFIX+key),raw)
}))
test('failure to archive invalid saved bytes refuses overwrite',()=>withStorage(data=>{
  const key='data-A',raw='DAMAGED'
  data.set(key,raw)
  const originalSet=globalThis.localStorage.setItem
  globalThis.localStorage.setItem=(k,v)=>{if(k===RECOVERY_PREFIX+key)throw Error('quota');return originalSet(k,v)}
  assert.equal(writePreservingInvalid(key,'{}',()=>false),false)
  assert.equal(data.get(key),raw)
  assert.equal(data.has(RECOVERY_PREFIX+key),false)
}))
test('valid persisted key updates without creating recovery copies',()=>withStorage(data=>{
  data.set('context','{"version":1}')
  assert.equal(parseStored('context',v=>typeof v==='object'&&v?.version===1)?.version,1)
  assert.equal(writePreservingInvalid('context','{"version":1,"changed":true}',validStoredJson(v=>v?.version===1)),true)
  assert.equal(data.has(RECOVERY_PREFIX+'context'),false)
}))
test('loaded Workspace requires unique screen/panel IDs and proper geometry',()=>{
  const ops=createWorkspaceModel(CONTENT)
  assert.equal(ops.validateWorkspace(INITIAL_WORKSPACE),true)
  function corrupted(fn){const w=structuredClone(INITIAL_WORKSPACE);fn(w);return ops.validateWorkspace(w)}
  assert.equal(corrupted(w=>{w.screens[1].id=w.screens[0].id}),false)
  assert.equal(corrupted(w=>{w.screens[1].id=w.screens[0].panels[0].id}),false)
  assert.equal(corrupted(w=>{w.screens[1].id=''}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].rect.x=-1}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].rect.y=-1}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].rect.w=-1}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].rect.h=FRAME_MIN.h-1}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].tabs.push(w.screens[0].panels[0].tabs[0])}),false)
  assert.equal(corrupted(w=>{w.screens[0].panels[0].rect.x=Number.POSITIVE_INFINITY}),false)
})
test('restored Markdown with only M-2 receives valid matching default screen',()=>{
  const item={...structuredClone(DEFAULT_MARKDOWN),id:'M-2'}
  const w=defaultMarkdownWorkspace(item.id)
  const ops=createWorkspaceModel(descriptorsForMarkdown([item]))
  assert.equal(ops.validateWorkspace(w),true)
  assert.deepEqual(w.screens[0].panels[0].tabs,['context/M-2/document'])
})
