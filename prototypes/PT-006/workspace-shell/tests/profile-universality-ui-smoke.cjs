const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const userData=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-markdown-ui-'))
const edge=cp.spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+userData,'about:blank'],
  {stdio:['ignore','ignore','pipe']})
let ws,seq=0
const pending=new Map(),errors=[]
const timeout=setTimeout(()=>{edge.kill();console.error('Markdown UI timed out');process.exit(2)},75000)
async function connect(){
  const address=await new Promise((resolve,reject)=>{
    let output=''
    edge.stderr.on('data',data=>{output+=data.toString();const m=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)resolve(m[1])})
    edge.on('error',reject);edge.on('exit',code=>reject(Error('Edge exited '+code)))
  })
  const tabs=await(await fetch('http://'+new URL(address).host+'/json/list')).json()
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
  ws.onmessage=event=>{
    const v=JSON.parse(event.data)
    if(v.method==='Runtime.exceptionThrown')errors.push(v.params.exceptionDetails?.exception?.description??'Browser exception')
    const job=pending.get(v.id)
    if(job){pending.delete(v.id);if(v.error)job.reject(Error(JSON.stringify(v.error)));else job.resolve(v.result)}
  }
}
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
async function evaluate(expression){
  const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text)
  return result.result.value
}
async function main(){
  await connect();await call('Runtime.enable');await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride',{width:1720,height:1080,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://127.0.0.1:4196/'})
  const initial=await evaluate(String.raw`(async()=>{
    const wait=async(fn)=>{for(let i=0;i<70;i++){if(fn())return;await new Promise(r=>setTimeout(r,100))}throw Error('Missing target UI')}
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
    const assert=(ok,msg)=>{if(!ok)throw Error(msg)}
    await wait(()=>document.querySelector('.markdown-profile-switch'))
    const a=localStorage.getItem('pt006-simulator-content-A-v6')
    const b=localStorage.getItem('pt006-simulator-content-B-v6')
    const legacy=localStorage.getItem('pt006-simulator-layout-A-v3')
    document.querySelector('.markdown-profile-switch').click()
    await wait(()=>document.querySelector('.markdown-fixture-content'))
    await settle()
    assert(document.querySelector('.brand')?.textContent.includes('Markdown Fixture'),'Second profile title appears in same Shell')
    assert(document.querySelectorAll('.screen-tab').length===1,'Markdown initial layout')
    assert(document.querySelector('.markdown-fixture-content')?.dataset.markdownContext==='M-1','Independent Markdown Context')
    assert(!document.querySelector('.compose-trigger'),'Architecture Comparison not offered')
    assert(!document.querySelector('.branch-switch'),'Architecture branch switch absent')
    const start=localStorage.getItem('pt006-markdown-contexts-v1')
    assert(start===null,'Clean Markdown fixture does not manufacture initial State on open')
    const edit=(element,value)=>{
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(element,value)
      element.dispatchEvent(new Event('input',{bubbles:true}))
    }
    const body=document.querySelector('textarea[aria-label="Markdown M-1"]')
    assert(body,'Markdown editor')
    edit(body,'# Verified Markdown\n\nIndependent document')
    await settle()
    let state=JSON.parse(localStorage.getItem('pt006-markdown-contexts-v1'))
    assert(state.items[0].document.body.includes('Verified Markdown'),'Markdown content saved independently')
    document.querySelector('.create-context').click();await settle()
    assert(document.querySelector('.context-create-menu')?.textContent.includes('Markdown-документ'),'Second profile context template')
    document.querySelector('.context-create-menu .screen-create-option').click()
    await wait(()=>document.querySelectorAll('.screen-tab').length===2)
    await settle()
    state=JSON.parse(localStorage.getItem('pt006-markdown-contexts-v1'))
    assert(state.items.length===2,'Independent second Markdown Context')
    const second=state.items[1].id
    assert(document.querySelector('.markdown-fixture-content')?.dataset.markdownContext===second,'New Context selected')
    edit(document.querySelector('textarea[aria-label="Markdown '+second+'"]'),'# Other document')
    await settle()
    state=JSON.parse(localStorage.getItem('pt006-markdown-contexts-v1'))
    assert(state.items[0].document.body.includes('Verified Markdown'),'Editing second did not change first')
    assert(state.items[1].document.body==='# Other document','Second Markdown persisted')
    document.querySelector('.new-screen').click();await settle()
    const copy=[...document.querySelectorAll('.screen-create-option')].find(x=>x.textContent.includes('Копия текущего'))
    assert(copy,'Generic Shell copy available on second profile')
    copy.click()
    await wait(()=>document.querySelectorAll('.screen-tab').length===3)
    await settle()
    assert(localStorage.getItem('pt006-simulator-content-A-v6')===a,'Markdown does not touch Architecture A')
    assert(localStorage.getItem('pt006-simulator-content-B-v6')===b,'Markdown does not touch Architecture B')
    assert(localStorage.getItem('pt006-simulator-layout-A-v3')===legacy,'Markdown does not touch A layout')
    const layout=JSON.parse(localStorage.getItem('pt006-markdown-layout-v1'))
    assert(layout.screens.length===3,'Markdown layout has its own key')
    return {contextCount:2,screens:3,second,architectureUntouched:true}
  })()`)
  await call('Page.reload',{ignoreCache:true})
  const restored=await evaluate(`(async()=>{
    const wait=async(fn)=>{for(let i=0;i<70;i++){if(fn())return;await new Promise(r=>setTimeout(r,100))}throw Error('No restored UI')}
    const assert=(ok,msg)=>{if(!ok)throw Error(msg)}
    await wait(()=>document.querySelector('.markdown-fixture-content'))
    assert(document.querySelectorAll('.screen-tab').length===3,'Restored second profile layout')
    assert(document.querySelector('.markdown-fixture-content')?.querySelector('textarea')?.value==='# Other document','Restored Markdown editor body')
    document.querySelector('.markdown-profile-switch').click()
    await wait(()=>document.querySelector('.compose-trigger'))
    assert(document.querySelectorAll('.screen-tab').length===8,'Architecture mode still available with 8 A/B screens')
    assert(document.querySelector('.compose-trigger'),'Architecture Scope returns intact')
    document.querySelector('.markdown-profile-switch').click()
    await wait(()=>document.querySelector('.markdown-fixture-content'))
    assert(document.querySelectorAll('.screen-tab').length===3,'Markdown layout restored after switching profiles')
    return {restored:true,architectureIntact:true,markdownReopened:true}
  })()`)
  console.log(JSON.stringify({initial,restored,exceptions:errors},null,2))
  if(errors.length)throw Error('Browser exceptions: '+errors.join('; '))
}
main().catch(e=>{console.error(e.stack);process.exitCode=1}).finally(()=>{
  clearTimeout(timeout);try{ws?.close()}catch{};edge.kill();setTimeout(()=>{try{fs.rmSync(userData,{recursive:true,force:true})}catch{/* Edge may still release files after close */}},800).unref()
})
