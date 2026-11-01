import test from 'node:test'
import assert from 'node:assert/strict'
import {writePreservingInvalid,RECOVERY_PREFIX} from '../src/shell/safeStorage.ts'
function storage(t,entries=[],setOverride){
  const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage')
  const data=new Map(entries)
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
    getItem:key=>data.get(key)??null,
    setItem:(key,value)=>setOverride?setOverride(key,value,data):data.set(key,value),
  }})
  t.after(()=>{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage})
  return data
}
test('save success requires read-back and does not alter unrelated content keys',t=>{
  const data=storage(t,[['content','keep']])
  assert.equal(writePreservingInvalid('layout','new layout',()=>true),true)
  assert.equal(data.get('layout'),'new layout')
  assert.equal(data.get('content'),'keep')
})
test('damaged layout is archived before replacement, and a different damaged version is preserved',t=>{
  const data=storage(t,[['layout','first broken']])
  assert.equal(writePreservingInvalid('layout','replacement',()=>false),true)
  assert.equal(data.get(RECOVERY_PREFIX+'layout'),'first broken')
  data.set('layout','second broken')
  assert.equal(writePreservingInvalid('layout','another replacement',()=>false),false)
  assert.equal(data.get('layout'),'second broken')
  assert.equal(data.get(RECOVERY_PREFIX+'layout'),'first broken')
})
test('quota and ignored writes report failure while preserving the previous value',t=>{
  const data=storage(t,[['layout','previous']],()=>{throw Error('Quota exceeded')})
  assert.equal(writePreservingInvalid('layout','next',()=>true),false)
  assert.equal(data.get('layout'),'previous')
  globalThis.localStorage.setItem=()=>{}
  assert.equal(writePreservingInvalid('layout','next',()=>true),false)
  assert.equal(data.get('layout'),'previous')
})
test('failed recovery archive never overwrites the damaged original',t=>{
  const data=storage(t,[['layout','damaged']],()=>{throw Error('Archive unavailable')})
  assert.equal(writePreservingInvalid('layout','next',()=>false),false)
  assert.equal(data.get('layout'),'damaged')
  assert.equal(data.has(RECOVERY_PREFIX+'layout'),false)
})
test('read-only settings and inaccessible storage return failure without throwing',t=>{
  storage(t,[],()=>{throw Error('Denied')})
  assert.equal(writePreservingInvalid('setting','4',()=>true),false)
  globalThis.localStorage.getItem=()=>{throw Error('Denied')}
  assert.equal(writePreservingInvalid('setting','4',()=>true),false)
})
