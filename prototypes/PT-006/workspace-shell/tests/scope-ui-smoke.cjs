const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const userData=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-scope-ui-'))
const edge=cp.spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+userData,'about:blank'],{stdio:['ignore','ignore','pipe']})
let ws,seq=0
const pending=new Map(),errors=[]
const timeout=setTimeout(()=>{edge.kill();console.error('Scope UI timeout');process.exit(2)},75000)
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
    const job=pending.get(v.id);if(job){pending.delete(v.id);if(v.error)job.reject(Error(JSON.stringify(v.error)));else job.resolve(v.result)}
  }
}
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
async function evaluate(expression){
  const res=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
  if(res.exceptionDetails)throw Error(res.exceptionDetails.exception?.description??res.exceptionDetails.text)
  return res.result.value
}
async function main(){
  await connect();await call('Runtime.enable');await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride',{width:1720,height:1080,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://127.0.0.1:4196/'})
  const created=await evaluate(`(async()=>{
    const wait=async(fn)=>{for(let i=0;i<70;i++){if(fn())return;await new Promise(r=>setTimeout(r,100))}throw Error('Expected element missing')}
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
    const assert=(ok,msg)=>{if(!ok)throw Error(msg)}
    await wait(()=>document.querySelector('.workspace-mode-switch'))
    const originalA=localStorage.getItem('pt006-simulator-content-A-v6')
    const originalB=localStorage.getItem('pt006-simulator-content-B-v6')
    document.querySelector('.workspace-mode-switch').click()
    await wait(()=>document.querySelector('.compose-trigger'))
    const initialScreens=document.querySelectorAll('.screen-tab').length
    assert(initialScreens===8,'Eight initial A/B screens')
    // Ready route: one action creates A+B bindings, two architecture views and comparison result.
    document.querySelector('.compose-trigger').click();await settle()
    assert(document.querySelector('.composition-create-menu'),'Composition editor')
    assert(document.querySelector('.composition-create-menu').textContent.includes('Готовая A+B'),'Ready selection visible')
    document.querySelector('.compose-submit').click()
    await wait(()=>document.querySelectorAll('.screen-tab').length===9)
    await settle()
    let scopes=JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1'))
    assert(scopes.items.length===1,'Exactly one ready Scope')
    const ready=scopes.items[0]
    assert(ready.allowedEffects.join(',')==='read','Only read permission')
    assert(ready.participants.left.contextId==='A'&&ready.participants.right.contextId==='B','Ready A/B bindings')
    assert(document.querySelector('.scope-comparison'),'Visible Scope result')
    const active=JSON.parse(localStorage.getItem('pt006-simulator-multicontext-layout-v1')).screens.at(-1)
    assert(active.panels.length===3,'A, B and Comparison windows')
    assert(active.panels[0].active==='context/A/architecture'&&active.panels[1].active==='context/B/architecture','Bound source windows')
    assert(active.panels[2].active===ready.presentation.contentId,'Result window points to Scope instance')
    assert(localStorage.getItem('pt006-simulator-content-A-v6')===originalA,'Ready composition never edits A')
    assert(localStorage.getItem('pt006-simulator-content-B-v6')===originalB,'Ready composition never edits B')
    const focus=[...document.querySelectorAll('.scope-comparison .sim-segment button')].find(x=>x.textContent==='requirements')
    assert(focus,'Scope focus switch')
    focus.click();await settle()
    scopes=JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1'))
    assert(scopes.items[0].focus==='requirements','View choice saved to scope metadata')
    assert(localStorage.getItem('pt006-simulator-content-A-v6')===originalA,'Changing Scope focus never edits A')
    assert(localStorage.getItem('pt006-simulator-content-B-v6')===originalB,'Changing Scope focus never edits B')
    // Manual route: build the A/B source windows one at a time on a fresh screen.
    document.querySelector('.new-screen').click();await settle()
    const blank=[...document.querySelectorAll('.screen-create-option')].find(b=>b.textContent.includes('Пустой экран'))
    assert(blank,'Generic blank screen menu');blank.click()
    await wait(()=>document.querySelectorAll('.screen-tab').length===10)
    await settle()
    const createSource=async context=>{
      const open=[...document.querySelectorAll('.header-btn')].find(b=>b.textContent.includes('+ Окно'))
      assert(open,'Generic window control');open.click();await settle()
      const option=[...document.querySelectorAll('.quick-picker .pick-option')].find(b=>b.textContent.includes(context+' · Architecture')&&!b.disabled)
      assert(option,'Context '+context+' Architecture available');option.click();await settle()
    }
    await createSource('B');await createSource('A')
    assert(document.querySelectorAll('.window-panel').length===2,'Two source views placed manually')
    document.querySelector('.compose-trigger').click();await settle()
    const manual=[...document.querySelectorAll('.composition-create-menu button')].find(x=>x.textContent==='Ручная сборка')
    assert(manual,'Manual route');manual.click();await settle()
    const left=document.querySelector('select[aria-label="Первый контекст"]')
    const right=document.querySelector('select[aria-label="Второй контекст"]')
    assert(left&&right,'Separate source selection steps')
    left.value='B';left.dispatchEvent(new Event('change',{bubbles:true}))
    right.value='A';right.dispatchEvent(new Event('change',{bubbles:true}));await settle()
    document.querySelector('.compose-submit').click()
    await wait(()=>JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1')).items.length===2)
    await settle()
    assert(document.querySelectorAll('.screen-tab').length===10,'Manual route retains current screen')
    scopes=JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1'))
    assert(scopes.items.length===2,'Manual Scope separately persisted')
    const manualScope=scopes.items[1]
    assert(manualScope.participants.left.contextId==='B'&&manualScope.participants.right.contextId==='A','Manual explicit bindings')
    assert(document.querySelector('.scope-comparison').textContent.includes('Источник слева: B'),'Reverse sources read in result')
    const second=JSON.parse(localStorage.getItem('pt006-simulator-multicontext-layout-v1')).screens.at(-1)
    assert(second.panels.length===3,'Manual route added just one result window')
    assert(second.panels[0].active==='context/B/architecture'&&second.panels[1].active==='context/A/architecture','Manually placed sources preserved')
    assert(second.panels[2].active===manualScope.presentation.contentId,'Only Scope result added after manual assembly')
    // Negative: identical sources, no state or new layout created.
    document.querySelector('.compose-trigger').click();await settle()
    const sameLeft=document.querySelector('select[aria-label="Первый контекст"]')
    const sameRight=document.querySelector('select[aria-label="Второй контекст"]')
    sameLeft.value='A';sameLeft.dispatchEvent(new Event('change',{bubbles:true}))
    sameRight.value='A';sameRight.dispatchEvent(new Event('change',{bubbles:true}));await settle()
    document.querySelector('.compose-submit').click();await settle()
    assert(document.querySelector('.drag-notice')?.textContent.includes('Сравнение недоступно'),'Inapplicable pair refused')
    assert(JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1')).items.length===2,'No partial Scope created')
    assert(document.querySelectorAll('.screen-tab').length===10,'No partial screen created')
    assert(localStorage.getItem('pt006-simulator-content-A-v6')===originalA,'A unchanged')
    assert(localStorage.getItem('pt006-simulator-content-B-v6')===originalB,'B unchanged')
    return {ready:ready.id,manual:manualScope.id,readyAndManual:true,readOnly:true,refused:true}
  })()`)
  await call('Page.reload',{ignoreCache:true})
  const restored=await evaluate(`(async()=>{
    for(let i=0;i<70&&!document.querySelector('.compose-trigger');i++)await new Promise(r=>setTimeout(r,100))
    const assert=(ok,msg)=>{if(!ok)throw Error(msg)}
    const scopes=JSON.parse(localStorage.getItem('pt006-simulator-comparison-scopes-v1'))
    assert(scopes.items.length===2,'Both scopes reload')
    assert(scopes.items[0].focus==='requirements','Scope view-local selection reloads')
    assert(document.querySelectorAll('.screen-tab').length===10,'Both composition screens restored')
    const workspace=JSON.parse(localStorage.getItem('pt006-simulator-multicontext-layout-v1'))
    assert(workspace.screens.at(-1).panels[2].active===scopes.items[1].presentation.contentId,'Manual scope reference persists')
    assert(document.querySelector('.scope-comparison'),'Scope result after reload')
    return {scopes:scopes.items.length,screens:workspace.screens.length,selectedFocus:scopes.items[0].focus}
  })()`)
  console.log(JSON.stringify({created,restored,exceptions:errors},null,2))
  if(errors.length)throw Error('Browser exceptions: '+errors.join('; '))
}
main().catch(error=>{console.error(error.stack);process.exitCode=1}).finally(()=>{
  clearTimeout(timeout);try{ws?.close()}catch{};edge.kill();setTimeout(()=>fs.rmSync(userData,{recursive:true,force:true}),800).unref()
})
