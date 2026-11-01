const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const KEY='pt006-single-architecture-instances-v1',LAYOUT='pt006-single-architecture-layout-v1'
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-smoke-'))
const executable=process.env.PT006_BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const flags=[...JSON.parse(process.env.PT006_BROWSER_ARGS||'[]'),'--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank']
if(process.platform==='linux')flags.unshift('--no-sandbox')
const browser=cp.spawn(executable,flags,{stdio:['ignore','ignore','pipe']})
let ws,seq=0,loads=0
const pending=new Map(),errors=[]
const timer=setTimeout(()=>{browser.kill();process.exitCode=2;ws?.close()},120000)
async function connect(){
  const address=await new Promise((ok,fail)=>{
    let output=''
    browser.stderr.on('data',d=>{output+=d.toString();const m=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)ok(m[1])})
    browser.on('error',fail);browser.on('exit',code=>fail(Error('Browser exited '+code)))
  })
  const tabs=await(await fetch('http://'+new URL(address).host+'/json/list')).json()
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl)
  await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail})
  ws.onmessage=e=>{
    const d=JSON.parse(e.data)
    if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails?.text)
    if(d.method==='Page.loadEventFired')loads++
    const p=pending.get(d.id)
    if(p){pending.delete(d.id);if(d.error)p.fail(Error(JSON.stringify(d.error)));else p.ok(d.result)}
  }
}
const call=(method,params={})=>new Promise((ok,fail)=>{const id=++seq;pending.set(id,{ok,fail});ws.send(JSON.stringify({id,method,params}))})
async function run(expression){
  const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
  if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text)
  return r.result.value
}
function browserHelpers(){
  const key='pt006-single-architecture-instances-v1'
  const assert=(v,m)=>{if(!v)throw Error(m)}
  const wait=async f=>{for(let i=0;i<100;i++){if(f())return;await new Promise(r=>setTimeout(r,100))}throw Error('UI timeout')}
  const click=text=>{
    const button=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)&&!b.matches(':disabled'))
    assert(button,'Missing enabled button: '+text);button.click()
  }
  const change=(selector,value)=>{
    const element=document.querySelector(selector);assert(element,'Missing input: '+selector)
    const proto=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto,'value').set.call(element,value)
    element.dispatchEvent(new Event('input',{bubbles:true}))
  }
  window.pt006Smoke={assert,wait,click,change,state:()=>JSON.parse(localStorage.getItem(key)),
    alert:text=>[...document.querySelectorAll('[role=alert]')].some(x=>x.textContent.includes(text))}
}
async function ready(navigate=true){
 await run('('+browserHelpers.toString()+')()')
 await run("pt006Smoke.wait(()=>document.querySelector('.factual-time-bar')&&document.querySelector('.screen-tab,.screen-group-trigger'))")
 if(navigate){
  await run("(async()=>{const {wait}=pt006Smoke;const planning=[...document.querySelectorAll('.screen-tab')].find(b=>b.textContent==='Планирование');if(planning)planning.click();await wait(()=>document.querySelector('[data-plan-view]'));for(const id of ['architecturePlan','requirements','history']){if(document.querySelector('[data-content-id='+id+']'))continue;if(!document.querySelector('.top-header'))document.querySelector('.header-toggle').click();[...document.querySelectorAll('.header-btn')].find(b=>b.textContent.includes('+ Окно')).click();await wait(()=>document.querySelector('.quick-picker'));const label=id==='requirements'?'Site Requirements Model':id==='architecturePlan'?'Architecture Planning':'History';[...document.querySelectorAll('.quick-picker .pick-option')].find(b=>b.querySelector('span:nth-child(2)')?.firstChild?.textContent.trim()===label).click();await wait(()=>document.querySelector('[data-content-id='+id+']'))}})()")
 }
}
async function loaded(previous){for(let i=0;i<100;i++){if(loads>previous)return;await new Promise(r=>setTimeout(r,50))}throw Error('Page load timeout')}
async function reload(navigate=true){const previous=loads;await call('Page.reload',{ignoreCache:true});await loaded(previous);await ready(navigate)}

async function mechanicsMain(){
 await connect();await call('Runtime.enable');await call('Page.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false})
 const previous=loads;await call('Page.navigate',{url:process.env.PT006_MECHANICS_URL||'http://127.0.0.1:4212/'});await loaded(previous);await ready(false)
 const stateRaw=await run('localStorage.getItem('+JSON.stringify(KEY)+')')
 if(!stateRaw)throw Error('Run against seeded example')
 await run(`(async()=>{
  const {assert,wait,click}=pt006Smoke
  const layout=JSON.parse(localStorage.getItem('pt006-single-architecture-layout-v1'))
  assert(layout.screens.length===4&&layout.screens.flatMap(s=>s.panels).length===16,'Default changed')
  const before=JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(key=>[key,localStorage.getItem(key)])))
  document.querySelector('.mechanics-trigger').click()
  await wait(()=>document.querySelector('.mechanics-inspector'))
  assert(getComputedStyle(document.querySelector('.mechanics-inspector')).position==='fixed','Inspector CSS missing')
  const inspector=document.querySelector('.mechanics-inspector')
  assert(inspector.textContent.includes('Core + Scope'),'Mechanic types missing')
  const openConnection=[...inspector.querySelectorAll('.mechanics-list button')].find(b=>b.textContent.includes('Открыть Content'))
  assert(openConnection,'Core open-content connection missing');openConnection.click()
  await wait(()=>inspector.querySelectorAll('.mechanics-link-row').length>=8)
  assert(inspector.textContent.includes('экран «Планирование»')&&inspector.textContent.includes('экран «История и факты»')&&inspector.textContent.includes('экран «Работа и результаты»'),'Other screens missing from links')
  assert(inspector.textContent.includes('Открыть выбранную архитектуру')&&inspector.textContent.includes('Открыть историю влияния'),'Real button labels missing')
  const connection=[...inspector.querySelectorAll('.mechanics-list button')].find(b=>b.textContent.includes('общий Event/Step'))
  assert(connection,'Navigation connection missing');connection.click()
  await wait(()=>inspector.querySelector('.mechanics-detail')?.textContent.includes('shared-mirrors'))
  assert(inspector.textContent.includes('architecture-main')&&inspector.textContent.includes('requirements-main'),'Participants missing')
  assert(inspector.textContent.includes('scope.navigation.write'),'Allowed effects missing')
  assert(JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(key=>[key,localStorage.getItem(key)])))===before,'Inspector read wrote storage')
  const code=[...inspector.querySelectorAll('.mechanics-source-links button')].find(b=>b.textContent.includes('changeHistoryPlanNavigation'))
  assert(code,'Real implementation source missing');code.click()
  await wait(()=>document.querySelector('.mechanics-code')?.textContent.includes('function changeHistoryPlanNavigation'))
  assert(document.querySelector('.mechanics-code').textContent.includes('normalizeNavigation'),'Source not current')
  assert(inspector.textContent.includes('Source hash'),'Source version missing')
  ;[...inspector.querySelectorAll('button')].find(b=>b.textContent==='Выбрать элемент').click()
  await wait(()=>document.querySelector('.mechanics-inspector.is-picking'))
  const cursor=localStorage.getItem('pt006-single-architecture-view-v1')
  const fact=[...document.querySelectorAll('.panel-body button')].find(b=>b.textContent.includes('demo-fact-mvp'))
  fact.click()
  await wait(()=>!document.querySelector('.mechanics-inspector.is-picking'))
  assert(localStorage.getItem('pt006-single-architecture-view-v1')===cursor,'Pick executed action')
  ;[...inspector.querySelectorAll('nav button')].find(b=>b.textContent==='Вызовы').click()
  await wait(()=>inspector.querySelector('nav button[aria-pressed=true]')?.textContent==='Вызовы')
  ;[...inspector.querySelectorAll('button')].find(b=>b.textContent==='Записывать вызовы').click()
  fact.click()
  await wait(()=>document.querySelector('.factual-time-bar').textContent.includes('HISTORY'))
  await wait(()=>[...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='saved'&&row.textContent.includes('change-navigation')))
  await wait(()=>inspector.textContent.includes('projection-commit'))
  click('Вернуться к рабочей архитектуре');click('Планирование')
  await wait(()=>document.querySelector('[data-plan-view]'))
  ;[...document.querySelector('[data-plan-view]').querySelectorAll('button')].find(b=>b.textContent.includes('step-notifications')).click()
  click('Открыть выбранную архитектуру')
  await wait(()=>document.querySelector('[data-architecture-view=planned]'))
  await wait(()=>[...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='saved'&&row.textContent.includes('core:open')&&row.textContent.includes('openContent')))
  assert(JSON.parse(localStorage.getItem('pt006-single-architecture-layout-v1')).screens.flatMap(s=>s.panels).length===16,'Core open duplicated a window')
  assert(inspector.textContent.includes('coalescedCommit'),'Reducer/persistence acknowledgement missing')
  ;[...inspector.querySelectorAll('nav button')].find(b=>b.textContent==='Покрытие').click()
  await wait(()=>inspector.querySelector('nav button[aria-pressed=true]')?.textContent==='Покрытие')
  assert(inspector.textContent.includes('source audit'),'Coverage limitations missing')
 })()`)
 if(await run('localStorage.getItem('+JSON.stringify(KEY)+')')!==stateRaw)throw Error('Observability/navigation changed domain')
 const screenshotDir=fs.mkdtempSync(path.join(os.tmpdir(),'pt006-mechanics-visual-'))
 await run(`(async()=>{const inspector=document.querySelector('.mechanics-inspector');[...inspector.querySelectorAll('nav button')].find(b=>b.textContent==='Подключено').click();await pt006Smoke.wait(()=>inspector.querySelector('nav button[aria-pressed=true]')?.textContent==='Подключено');[...inspector.querySelectorAll('.mechanics-list button')].find(b=>b.textContent.includes('общий Event/Step')).click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))})()`)
 const shot=await call('Page.captureScreenshot',{format:'png'})
 const screenshot=path.join(screenshotDir,'mechanics.png');fs.writeFileSync(screenshot,Buffer.from(shot.data,'base64'))
 const custom=await run('JSON.parse(localStorage.getItem('+JSON.stringify(LAYOUT)+'))')
 const historyScreen=custom.screens.find(s=>s.panels.some(p=>p.tabs.includes('explorer')))
 const explorer=historyScreen.panels.find(p=>p.tabs.includes('explorer'))
 explorer.tabs.push('impactHistory');explorer.active='explorer'
 historyScreen.panels.push({...structuredClone(explorer),id:'mechanics-second-explorer',tabs:['explorer'],active:'explorer',rect:{x:1300,y:26,w:420,h:400}})
 custom.activeScreenId=historyScreen.id
 await run('localStorage.setItem('+JSON.stringify(LAYOUT)+','+JSON.stringify(JSON.stringify(custom))+');localStorage.setItem("pt006-single-architecture-view-v1",JSON.stringify({selection:"CURRENT",selectedEventId:null}))')
 await reload(false)
 await run(`(async()=>{
  const {assert,wait,click}=pt006Smoke
  const windows=[...document.querySelectorAll('.window-panel')].filter(p=>p.querySelector('[data-material-view=explorer]'))
  assert(windows.length===2,'Separate Explorer occurrences missing')
  const first=windows.find(p=>p.dataset.panelId!=='mechanics-second-explorer'),second=windows.find(p=>p.dataset.panelId==='mechanics-second-explorer')
  const select=first.querySelector('[aria-label="Объект события"]')
  const req=[...select.options].find(o=>o.value.startsWith('requirement:')).value
  select.value=req;select.dispatchEvent(new Event('change',{bubbles:true}))
  await wait(()=>JSON.parse(first.querySelector('[data-mechanics-local-state]').dataset.mechanicsLocalState).requestedTarget===req)
  assert(second.querySelector('[aria-label="Объект события"]').value!==req,'Filters shared across windows')
  first.querySelector('[data-content-id=impactHistory] button').click()
  await wait(()=>first.querySelector('[data-material-view=impactHistory]'))
  const impact=first.querySelector('[aria-label="Цель истории влияния"]')
  const planned=[...first.querySelectorAll('.material-section')].find(s=>s.querySelector('h4')?.textContent.includes('PLANNED'))
  assert(impact.value===''&&planned.querySelectorAll('.material-card').length===12,'Foreign filter still hides planned records')
  const saved=pt006Smoke.state(),oldPaths=saved.history.find(event=>event.id==='demo-fact-mvp').materials.implementation.data.files.map(f=>f.path)
  const path=saved.materials.implementation.data.files.find(f=>!oldPaths.includes(f.path)).path
  impact.value='file:'+path;impact.dispatchEvent(new Event('change',{bubbles:true}))
  click('demo-fact-mvp')
  await wait(()=>document.querySelector('.factual-time-bar').textContent.includes('demo-fact-mvp'))
  assert(impact.value===''&&impact.selectedOptions[0].textContent==='Все изменения','Missing target is a hidden filter')
  click('Вернуться к рабочей архитектуре');click('Работа и результаты')
  await wait(()=>document.querySelector('[data-material-view=work]'))
  document.querySelector('.mechanics-trigger').click();await wait(()=>document.querySelector('.mechanics-inspector'))
  const inspector=document.querySelector('.mechanics-inspector')
  ;[...inspector.querySelectorAll('nav button')].find(b=>b.textContent==='Вызовы').click()
  await wait(()=>inspector.querySelector('nav button[aria-pressed=true]')?.textContent==='Вызовы')
  ;[...inspector.querySelectorAll('button')].find(b=>b.textContent==='Записывать вызовы').click()
  document.querySelector('[data-material-view=work] .source-inspector').open=true
  const before=localStorage.getItem('pt006-single-architecture-instances-v1')
  pt006Smoke.change('[aria-label="State Work Dynamics"]','{}')
  await new Promise(resolve=>requestAnimationFrame(resolve))
  click('Сохранить данные Work Dynamics')
  await wait(()=>[...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='rejected'&&row.textContent.includes('source-editor-save')))
  assert(localStorage.getItem('pt006-single-architecture-instances-v1')===before,'Failed validation changed Content')
  assert([...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='rejected'&&row.textContent.includes('content-write'))===false,'Pre-schema rejection was falsely recorded as writer call')
  const external=JSON.parse(before);external.architecture.data.current.nodes[0].title='External test change'
  const externalRaw=JSON.stringify(external);localStorage.setItem('pt006-single-architecture-instances-v1',externalRaw)
  pt006Smoke.change('[aria-label="State Work Dynamics"]',JSON.stringify(pt006Smoke.state().materials.work.data))
  await new Promise(resolve=>requestAnimationFrame(resolve))
  click('Сохранить данные Work Dynamics')
  await wait(()=>[...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='rejected'&&row.textContent.includes('content-write')&&row.textContent.includes('другой вкладке')))
  assert(localStorage.getItem('pt006-single-architecture-instances-v1')===externalRaw,'Stale writer overwrote external data')
  assert(![...inspector.querySelectorAll('.mechanics-trace-row')].some(row=>row.dataset.traceOutcome==='saved'&&row.textContent.includes('content-write')),'Rejected writer was marked saved')
 })()`)
 if(errors.length)throw Error('Browser errors: '+errors.join(';'))
 console.log(JSON.stringify({inspectorConnections:true,sourceVersion:true,pickDoesNotExecute:true,coreOpenObserved:true,
  navigationReadBackAndProjection:true,scopeFiltersIsolated:true,missingTargetUsesAll:true,invalidAndStaleWritesRejected:true,
  domainBytesUnchangedUntilExplicitExternalTest:true,screenshot,errors},null,2))
}
mechanicsMain().catch(error=>{console.error(error.stack);process.exitCode=1}).finally(async()=>{
 clearTimeout(timer);try{ws?.close()}catch{};browser.kill();await new Promise(resolve=>setTimeout(resolve,600))
 try{fs.rmSync(dir,{recursive:true,force:true})}catch{}
})
