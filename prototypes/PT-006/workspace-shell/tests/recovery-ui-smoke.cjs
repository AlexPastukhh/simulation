const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-recovery-ui-'))
const edge=cp.spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
 ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+folder,'about:blank'],
 {stdio:['ignore','ignore','pipe']})
let ws,seq=0
const jobs=new Map(),errors=[]
const timeout=setTimeout(()=>{console.error('Recovery UI timeout');edge.kill();process.exit(2)},75000)
async function connect(){
 const addr=await new Promise((resolve,reject)=>{
   let output=''
   edge.stderr.on('data',data=>{output+=data.toString();const m=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)resolve(m[1])})
   edge.on('error',reject)
 })
 const tabs=await(await fetch('http://'+new URL(addr).host+'/json/list')).json()
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl)
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
 ws.onmessage=e=>{
   const msg=JSON.parse(e.data)
   if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails?.exception?.description??'exception')
   const job=jobs.get(msg.id)
   if(job){jobs.delete(msg.id);if(msg.error)job.reject(Error(JSON.stringify(msg.error)));else job.resolve(msg.result)}
 }
}
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;jobs.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
async function run(expression){
 const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text)
 return r.result.value
}
async function reload(){await call('Page.reload',{ignoreCache:true})}
async function main(){
 await connect();await call('Page.enable');await call('Runtime.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1720,height:1080,deviceScaleFactor:1,mobile:false})
 await call('Page.navigate',{url:'http://127.0.0.1:4196/'})
 await run(`(async()=>{for(let i=0;i<80&&!document.querySelector('.markdown-profile-switch');i++)await new Promise(r=>setTimeout(r,100));return 'ready'})()`)
 const seed=await run(`(()=>{
   localStorage.setItem('pt006-workspace-mode-v1','markdown')
   localStorage.setItem('pt006-markdown-contexts-v1',JSON.stringify({version:1,items:[
     {id:'M-2',title:'Recovered markdown',document:{title:'Recovered markdown',body:'# Original document'}}]}))
   localStorage.setItem('pt006-simulator-content-A-v6','DAMAGED_A_STATE_BYTES')
   localStorage.setItem('pt006-simulator-layout-A-v3','DAMAGED_A_LAYOUT_BYTES')
   return true
 })()`)
 await reload()
 const markdown=await run(`(async()=>{
   const assert=(v,m)=>{if(!v)throw Error(m)}
   for(let i=0;i<80&&!document.querySelector('.markdown-fixture-content');i++)await new Promise(r=>setTimeout(r,100))
   assert(document.querySelector('.markdown-fixture-content')?.dataset.markdownContext==='M-2','restored M-2')
   assert(document.querySelector('textarea[aria-label="Markdown M-2"]')?.value==='# Original document','original M-2 data')
   assert(localStorage.getItem('pt006-simulator-content-A-v6')==='DAMAGED_A_STATE_BYTES','corrupt inactive A retained')
   assert(localStorage.getItem('pt006-markdown-layout-v1')===null,'initial Markdown layout is read-only')
   return {restored:'M-2',inActiveDataUntouched:true,hydrationReadOnly:true}
 })()`)
 await run("localStorage.setItem('pt006-workspace-mode-v1','legacy')")
 await reload()
 const layout=await run(`(async()=>{
   const assert=(v,m)=>{if(!v)throw Error(m)}
   for(let i=0;i<80&&!document.querySelector('.new-screen');i++)await new Promise(r=>setTimeout(r,100))
   assert(localStorage.getItem('pt006-simulator-layout-A-v3')==='DAMAGED_A_LAYOUT_BYTES','damaged layout still untouched')
   assert(localStorage.getItem('pt006-simulator-content-A-v6')==='DAMAGED_A_STATE_BYTES','damaged state still untouched')
   document.querySelector('.new-screen').click()
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
   const blank=[...document.querySelectorAll('.screen-create-option')].find(el=>el.textContent.includes('Пустой экран'))
   assert(blank,'blank screen')
   blank.click()
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
   const prefix='pt006-recovery-original-v1:'
   assert(localStorage.getItem(prefix+'pt006-simulator-layout-A-v3')==='DAMAGED_A_LAYOUT_BYTES','backup exact original layout')
   assert(JSON.parse(localStorage.getItem('pt006-simulator-layout-A-v3')).screens.length>=2,'recovered layout after explicit edit')
   assert(localStorage.getItem('pt006-simulator-content-A-v6')==='DAMAGED_A_STATE_BYTES','still no A State write')
   return {archivedOriginalLayout:true,editedLayoutSaved:true,corruptedStatePreserved:true}
 })()`)
 await run(`(async()=>{
    const content=await import('/src/profiles/architecture-simulator/content.ts')
    const scope=await import('/src/profiles/architecture-simulator/scope-mechanisms/comparison.ts')
    const goodScope=scope.createComparisonScope('cmp-recovered',{leftId:'A',rightId:'B'},
      id=>id==='A'?content.initialData:id==='B'?content.initialDataB:null)
    if(!goodScope)throw Error('scope fixture not applicable')
    const ctxId='C-11111111-1111-4111-8111-111111111111'
    const goodContext={id:ctxId,title:'Recovered notes',templateId:'minimal-planning',sourceId:'',state:{notes:'keep this'}}
    const contextJson=JSON.stringify({version:1,items:[goodContext,{id:'invalid-context'}]})
    const scopeJson=JSON.stringify({version:1,items:[goodScope,{id:'invalid-scope'}]})
    localStorage.setItem('pt006-simulator-context-copies-v1',contextJson)
    localStorage.setItem('pt006-simulator-comparison-scopes-v1',scopeJson)
    localStorage.setItem('pt006-workspace-mode-v1','contexts')
    return {contextJson,scopeJson,ctxId,scopeId:goodScope.id}
 })()`)
 await reload()
 const registries=await run(`(async()=>{
   const assert=(v,m)=>{if(!v)throw Error(m)}
   for(let i=0;i<80&&!document.querySelector('.compose-trigger');i++)await new Promise(r=>setTimeout(r,100))
   assert(document.body.innerText.includes('Context C-11111111-1111-4111-8111-111111111111'),'valid Context was salvaged')
   assert(JSON.parse(localStorage.getItem('pt006-simulator-context-copies-v1')).items.length===2,'no unsolicited registry rewrite')
   assert(JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1')).items.length===2,'no unsolicited Scope rewrite')
   document.querySelector('.create-context').click()
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
   const note=[...document.querySelectorAll('.context-create-menu .screen-create-option')].find(b=>b.textContent.includes('Минимальный'))
   assert(note,'minimal notes context template');note.click()
   await new Promise(done=>setTimeout(done,300))
   const newCtx=JSON.parse(localStorage.getItem('pt006-simulator-context-copies-v1'))
   assert(newCtx.items.length===2,'one old valid Context plus one new')
   assert(newCtx.items.some(x=>x.id==='C-11111111-1111-4111-8111-111111111111'),'original valid Context preserved')
   assert(localStorage.getItem('pt006-recovery-original-v1:pt006-simulator-context-copies-v1')!==null,'original mixed registry archived')
   document.querySelector('.compose-trigger').click()
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
   document.querySelector('.compose-submit').click()
   await new Promise(done=>setTimeout(done,350))
   const scopes=JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1'))
   assert(scopes.items.length===2,'old valid + newly bound scope')
   assert(scopes.items.some(x=>x.id==='cmp-recovered'),'old good scope salvaged')
   assert(localStorage.getItem('pt006-recovery-original-v1:pt006-simulator-comparison-scopes-v1')!==null,'mixed scope registry archived')
   return {validContextsAndScopesSalvaged:true,bothRawRegistriesBackedUp:true}
 })()`)
 console.log(JSON.stringify({seed,markdown,layout,registries,exceptions:errors},null,2))
 if(errors.length)throw Error('Browser exceptions '+errors.join('; '))
}
main().catch(e=>{console.error(e.stack);process.exitCode=1}).finally(()=>{
 clearTimeout(timeout);try{ws?.close()}catch{}edge.kill();setTimeout(()=>fs.rmSync(folder,{recursive:true,force:true}),900).unref()
})
