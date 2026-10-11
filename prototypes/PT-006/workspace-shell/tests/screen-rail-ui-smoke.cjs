const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-screen-rail-'))
const edge=cp.spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],
  {stdio:['ignore','ignore','pipe']})
let ws,sequence=0
const pending=new Map(),errors=[]
const watchdog=setTimeout(()=>{edge.kill();console.error('Screen rail UI timed out');process.exit(2)},75000)
async function connect(){
 const address=await new Promise((resolve,reject)=>{
   let out=''
   edge.stderr.on('data',chunk=>{out+=chunk.toString();const match=out.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])})
   edge.on('error',reject)
 })
 const tabs=await(await fetch('http://'+new URL(address).host+'/json/list')).json()
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl)
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
 ws.onmessage=e=>{
   const message=JSON.parse(e.data)
   if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails?.exception?.description??'unknown exception')
   const waiter=pending.get(message.id)
   if(waiter){pending.delete(message.id);if(message.error)waiter.reject(Error(JSON.stringify(message.error)));else waiter.resolve(message.result)}
 }
}
const call=(method,params={})=>new Promise((resolve,reject)=>{
 const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))
})
async function run(expression){
 const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
 if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text)
 return r.result.value
}
const viewport=width=>call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false})
async function audit(){
 return run(`(async()=>{
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
   const assert=(v,m)=>{if(!v)throw Error(m)}
   const rail=document.querySelector('.screen-rail'),nav=document.querySelector('.screen-tabs')
   assert(rail&&nav,'screen rail exists separately from toolbar')
   const tabs=[...nav.querySelectorAll('.screen-tab')]
   assert(tabs.length>=8,'all architecture screens are mounted')
   const bounds=rail.getBoundingClientRect()
   assert(bounds.left>=-1&&bounds.right<=innerWidth+1,'screen rail spans viewport')
   assert(nav.scrollWidth<=nav.clientWidth+1,'no hidden horizontal scroll')
   assert(getComputedStyle(nav).flexWrap==='wrap','screen navigation wraps')
   const rows=new Set()
   for(const tab of tabs){
     const r=tab.getBoundingClientRect()
     assert(r.width>30&&r.height>=30,'clickable screen has sufficient area')
     assert(r.left>=-1&&r.right<=innerWidth+1,'screen horizontally visible: '+tab.textContent)
     assert(r.top>=bounds.top-1&&r.bottom<=bounds.bottom+1,'screen vertically visible: '+tab.textContent)
     assert(tab.scrollWidth<=tab.clientWidth+1,'screen label not clipped: '+tab.textContent)
     const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)
     assert(hit===tab||tab.contains(hit),'screen directly clickable: '+tab.textContent)
     rows.add(Math.round(r.top))
   }
   const last=tabs[tabs.length-1]
   last.click()
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
   assert(document.querySelector('.screen-tab.current')?.textContent===last.textContent,'last screen selected')
   assert(document.querySelector('.screen-tab.current')?.getAttribute('aria-current')==='page','active screen exposed')
   const stage=document.querySelector('.stage-scroll')
   assert(stage&&stage.clientHeight>=200,'workspace keeps usable height')
   return {width:innerWidth,screens:tabs.length,rows:rows.size,railHeight:Math.round(bounds.height),workspaceHeight:stage.clientHeight}
 })()`)
}
async function main(){
 await connect();await call('Runtime.enable');await call('Page.enable')
 await viewport(1600);await call('Page.navigate',{url:'http://127.0.0.1:4196/'})
 await run(`(async()=>{
   for(let i=0;i<70&&!document.querySelector('.workspace-mode-switch');i++)await new Promise(r=>setTimeout(r,100))
   const switcher=document.querySelector('.workspace-mode-switch')
   if(!switcher)throw Error('workspace mode switch missing')
   switcher.click()
   for(let i=0;i<70&&document.querySelectorAll('.screen-tab').length<8;i++)await new Promise(r=>setTimeout(r,100))
   if(document.querySelectorAll('.screen-tab').length!==8)throw Error('expected eight initial screens')
 })()`)
 const wide=await audit()
 for(let i=0;i<3;i++){
   await run(`(async()=>{
     const button=document.querySelector('.new-screen')
     button.click()
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
     const menu=document.querySelector('.screen-create-menu')
     if(!menu)throw Error('new-screen menu missing')
     const buttonRect=button.getBoundingClientRect(),menuRect=menu.getBoundingClientRect()
     if(menuRect.top<buttonRect.bottom-1||menuRect.left<0||menuRect.right>innerWidth+1||menuRect.bottom>innerHeight+1)
       throw Error('screen menu is not visible under its trigger: '+JSON.stringify({button:buttonRect.toJSON(),menu:menuRect.toJSON()}))
     const blank=[...menu.querySelectorAll('.screen-create-option')].find(x=>x.textContent.includes('Пустой экран'))
     if(!blank)throw Error('blank screen option missing')
     blank.click()
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
   })()`)
 }
 const expanded=await audit()
 if(expanded.screens!==11)throw Error('screen creation failed')
 await viewport(900);const medium=await audit()
 await viewport(740);const narrow=await audit()
 if(narrow.rows<2)throw Error('narrow display did not wrap screens')
 await run(`(async()=>{
   const tabs=[...document.querySelectorAll('.screen-tab')]
   for(let i=0;i<tabs.length;i++){
     const tab=document.querySelectorAll('.screen-tab')[i]
     const name=tab.textContent
     tab.click()
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
     if(document.querySelector('.screen-tab.current')?.textContent!==name)throw Error('Cannot select screen '+name)
   }
   const create=document.querySelector('.new-screen')
   create.click()
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
   const popup=document.querySelector('.screen-create-menu')
   const rect=popup?.getBoundingClientRect()
   if(!rect||rect.left<0||rect.right>innerWidth+1||rect.bottom>innerHeight+1)throw Error('Screen creation menu clipped at narrow width')
   popup.querySelector('.screen-create-title button').click()
 })()`)
 await call('Page.reload',{ignoreCache:true})
 await run(`(async()=>{for(let i=0;i<70&&document.querySelectorAll('.screen-tab').length<11;i++)await new Promise(r=>setTimeout(r,100));if(document.querySelectorAll('.screen-tab').length!==11)throw Error('screens not mounted after reload')})()`)
 const persisted=await audit()
 if(persisted.screens!==11)throw Error('screens not restored on reload')
 if(errors.length)throw Error('browser errors: '+errors.join('; '))
 console.log(JSON.stringify({pass:true,wide,expanded,medium,narrow,persisted,exceptions:errors},null,2))
}
main().catch(e=>{console.error(e.stack);process.exitCode=1}).finally(()=>{
 clearTimeout(watchdog);try{ws?.close()}catch{}edge.kill()
 setTimeout(()=>{try{fs.rmSync(dir,{recursive:true,force:true})}catch{/* browser releases profile asynchronously */}},850).unref()
})
