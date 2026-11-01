import test from 'node:test'
import assert from 'node:assert/strict'
import {readContent,writeContent,serializeContentWrite,watchContentChanges} from '../src/profiles/single-architecture/contentStorage.ts'
function storage(t,entries=[]){
 const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),data=new Map(entries)
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{
  getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),
 }})
 t.after(()=>{if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage})
 return data
}
test('hydration never writes absent, empty, damaged or unsupported saved bytes',t=>{
 const data=storage(t)
 const decode=value=>typeof value?.text==='string'?value:null
 assert.deepEqual(readContent('a',decode,()=>({text:''})).value,{text:''})
 for(const raw of ['', '{broken', '{"version":9}']){
  data.set('a',raw);assert.ok(readContent('a',decode,()=>({text:''})).error);assert.equal(data.get('a'),raw)
 }
})
test('stale Content writers refuse both existing and newly created external saves',t=>{
 const data=storage(t,[['a','old']])
 assert.equal(writeContent('a',{text:'first'},'old').ok,true)
 const newest=data.get('a')
 assert.equal(writeContent('a',{text:'second'},'old').ok,false);assert.equal(data.get('a'),newest)
 assert.equal(writeContent('a',{text:'new blank'},null).ok,false);assert.equal(data.get('a'),newest)
})
test('first v1 upgrade archives exact original bytes before replacement',t=>{
 const raw=' {\n "version":1\n}\n',data=storage(t,[['a',raw]])
 const saved=writeContent('a',{version:2},raw,'original')
 assert.equal(saved.ok,true);assert.equal(data.get('original'),raw);assert.equal(data.get('a'),saved.raw)
 assert.equal(writeContent('a',{version:2,title:'edit'},saved.raw).ok,true)
 assert.equal(data.get('original'),raw)
})
test('failed or conflicting archive leaves both subject and existing archive untouched',t=>{
 const data=storage(t,[['a','v1'],['original','earlier original']])
 assert.equal(writeContent('a',{version:2},'v1','original').ok,false)
 assert.equal(data.get('a'),'v1');assert.equal(data.get('original'),'earlier original')
 data.delete('original')
 globalThis.localStorage.setItem=()=>{throw Error('Quota')}
 assert.equal(writeContent('a',{version:2},'v1','original').ok,false)
 assert.equal(data.get('a'),'v1');assert.equal(data.has('original'),false)
})
test('ignored writes or inaccessible storage do not report successful Content commits',t=>{
 const data=storage(t,[['a','old']])
 globalThis.localStorage.setItem=()=>{}
 assert.equal(writeContent('a',{text:'next'},'old').ok,false);assert.equal(data.get('a'),'old')
 globalThis.localStorage.getItem=()=>{throw Error('Denied')}
 assert.equal(writeContent('a',{text:'next'},'old').ok,false)
 assert.ok(readContent('a',x=>x,()=>({})).error)
})
test('participating concurrent writers use one Web Lock and reject the stale second commit',async t=>{
 const data=storage(t,[['a','old']]),descriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator')
 let queue=Promise.resolve();const names=[]
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:(name,write)=>{
  names.push(name);const next=queue.then(write);queue=next.then(()=>{},()=>{});return next
 }}}})
 t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'navigator',descriptor);else delete globalThis.navigator})
 const first=serializeContentWrite('a',()=>writeContent('a',{text:'first'},'old'))
 const second=serializeContentWrite('a',()=>writeContent('a',{text:'second'},'old'))
 const results=await Promise.all([first,second])
 assert.equal(results[0].ok,true);assert.equal(results[1].ok,false)
 assert.deepEqual(names,['pt006-content:a','pt006-content:a']);assert.equal(JSON.parse(data.get('a')).text,'first')
})
test('storage change notifications ignore UI keys, report conflicts safely, and unsubscribe',t=>{
 const data=storage(t,[['a','old']]),descriptor=Object.getOwnPropertyDescriptor(globalThis,'window')
 let listener,removed=false;const messages=[]
 Object.defineProperty(globalThis,'window',{configurable:true,value:{
  addEventListener:(name,callback)=>{assert.equal(name,'storage');listener=callback},
  removeEventListener:(name,callback)=>{removed=callback===listener},
 }})
 t.after(()=>{if(descriptor)Object.defineProperty(globalThis,'window',descriptor);else delete globalThis.window})
 const stop=watchContentChanges('a',()=> 'old',message=>messages.push(message))
 listener({key:'view'});listener({key:'a'});assert.equal(messages.length,0)
 data.set('a','new');listener({key:'a'});assert.equal(messages.length,1)
 globalThis.localStorage.getItem=()=>{throw Error('Denied')}
 assert.doesNotThrow(()=>listener({key:'a'}));assert.equal(messages.length,2)
 stop();assert.equal(removed,true)
})
