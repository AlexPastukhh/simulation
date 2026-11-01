const fs=require('node:fs'),cp=require('node:child_process'),os=require('node:os'),path=require('node:path')
const KEY='pt006-single-architecture-instances-v1',LAYOUT='pt006-single-architecture-layout-v1'
const url=process.env.PT006_SMOKE_URL||'http://127.0.0.1:4197/'
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
async function main(){
  await connect();await call('Runtime.enable');await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false})
  const previous=loads;await call('Page.navigate',{url});await loaded(previous);await ready()
  const {INITIAL_WORKSPACE,PREVIOUS_INITIAL_WORKSPACE,LAYOUT_ARCHIVE_KEY}=await import('../src/profiles/single-architecture/workspace.ts')
  const backupKey=LAYOUT_ARCHIVE_KEY
  const previousLayoutRaw=JSON.stringify(PREVIOUS_INITIAL_WORKSPACE,null,3)
  await run("pt006Smoke.assert(document.querySelectorAll('.screen-tab').length===4,'Four-screen default missing')")
  // Read-only expansion of the exact predecessor default; subject data stays untouched.
  await run('localStorage.setItem('+JSON.stringify(LAYOUT)+','+JSON.stringify(previousLayoutRaw)+')')
  await reload(false)
  await run("pt006Smoke.assert(document.querySelectorAll('.screen-tab').length===4,'Prior default was not expanded')")
  if(await run('localStorage.getItem('+JSON.stringify(LAYOUT)+')')!==previousLayoutRaw)throw Error('Hydration rewrote original layout')
  await run("(async()=>{const {click,wait,assert}=pt006Smoke;click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));const menu=document.getElementById('screen-create-menu');assert(menu.querySelectorAll('.screen-create-option').length===7,'Individual templates or bundle missing');menu.querySelector('button.screen-create-option').click();await wait(()=>document.querySelectorAll('.screen-tab').length===8&&JSON.parse(localStorage.getItem('pt006-single-architecture-layout-v1')).screens.length===8)})()")
  if(await run('localStorage.getItem('+JSON.stringify(backupKey)+')')!==previousLayoutRaw)throw Error('Prior layout bytes not archived')
  await run("(async()=>{const {click,wait,assert}=pt006Smoke;click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));document.getElementById('screen-create-menu').querySelector('button.screen-create-option').click();await wait(()=>document.querySelectorAll('.screen-tab').length===12);click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));[...document.getElementById('screen-create-menu').querySelectorAll('button')].find(b=>b.querySelector('strong')?.textContent.includes('Планирование')).click();await wait(()=>document.querySelectorAll('.screen-tab').length===13);const layout=JSON.parse(localStorage.getItem('pt006-single-architecture-layout-v1'));const ids=layout.screens.flatMap(s=>[s.id,...s.panels.map(p=>p.id)]);assert(new Set(ids).size===ids.length,'Template creation reused IDs');assert(localStorage.getItem('pt006-single-architecture-instances-v1')===null&&localStorage.getItem('pt006-single-markdown-instances-v1')===null,'Layout created Content')})()")
  await reload(false)
  await run("pt006Smoke.assert(document.querySelectorAll('.screen-tab').length===13,'Template set not restored')")
  // Custom composition is preserved, including group membership and active screen.
  const custom=structuredClone(PREVIOUS_INITIAL_WORKSPACE)
  custom.screens.push({id:'custom',title:'Мой экран',panels:[]})
  custom.activeScreenId='custom';custom.screenGroups=[{id:'custom-group',title:'Моя группа',screenIds:custom.screens.map(s=>s.id)}]
  const customRaw=JSON.stringify(custom)
  await run('localStorage.setItem('+JSON.stringify(LAYOUT)+','+JSON.stringify(customRaw)+')')
  await reload(false)
  if(await run('localStorage.getItem('+JSON.stringify(LAYOUT)+')')!==customRaw)throw Error('Custom layout changed during hydration')
  await run("pt006Smoke.assert(document.querySelector('.screen-group-trigger')?.textContent.includes('Моя группа'),'Custom group lost')")
  // A different archive blocks replacement rather than overwriting an earlier backup.
  await run('localStorage.setItem('+JSON.stringify(LAYOUT)+','+JSON.stringify(previousLayoutRaw)+');localStorage.setItem('+JSON.stringify(backupKey)+',"earlier backup")')
  await reload(false)
  await run("(async()=>{const {click,wait,alert}=pt006Smoke;click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));document.getElementById('screen-create-menu').querySelector('button.screen-create-option').click();await wait(()=>alert('Не удалось сохранить размещение'))})()")
  if(await run('localStorage.getItem('+JSON.stringify(LAYOUT)+')')!==previousLayoutRaw)throw Error('Archive conflict replaced original layout')
  if(await run('localStorage.getItem('+JSON.stringify(backupKey)+')')!=='earlier backup')throw Error('Archive overwritten')
  await run('localStorage.removeItem('+JSON.stringify(backupKey)+');localStorage.setItem('+JSON.stringify(LAYOUT)+','+JSON.stringify(JSON.stringify(INITIAL_WORKSPACE))+')')
  await reload()
  await run("localStorage.setItem('pt006-markdown-contexts-v1','legacy-marker')")
  await reload()
  await run("(async()=>{const {assert,click,change,wait,state}=pt006Smoke;assert(localStorage.getItem('pt006-single-markdown-instances-v1')===null,'Unexpected Markdown import');assert(!document.querySelector('.create-context,.compose-trigger'),'Legacy controls');click('+ Архитектурный элемент');await wait(()=>state()?.architecture.data.current.nodes.length===1);change('[aria-label^=\"Название узла\"]','FACTUAL BEFORE');await wait(()=>state().architecture.data.current.nodes[0].title==='FACTUAL BEFORE');click('+ Evolution Step');await wait(()=>document.querySelector('[data-architecture-view=planned]'));change('[aria-label^=\"Название узла\"]','PLANNED TARGET');await wait(()=>state().architecture.data.steps[0].target.nodes[0].title==='PLANNED TARGET');assert(state().architecture.data.current.nodes[0].title==='FACTUAL BEFORE','Step changed CURRENT');click('+ Требование');click('+ Occurrence');await wait(()=>state().requirements.data.requirements.length===1&&state().requirements.data.artifacts.length===1);document.querySelector('[data-content-id=history] button').click();await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('+ Зафиксировать фактический снимок')));click('+ Зафиксировать фактический снимок');await wait(()=>state().history.length===1);assert(state().history[0].architecture.nodes[0].title==='FACTUAL BEFORE','Snapshot recorded planned target');const snapshot=JSON.stringify(state().history[0]);click(state().history[0].id);await wait(()=>document.querySelector('[data-architecture-view=current] fieldset:disabled'));assert(document.querySelector('[aria-label^=\"Название узла\"]').value==='FACTUAL BEFORE','Historical CURRENT is not factual');assert(document.querySelector('[aria-label^=\"Требование\"]').matches(':disabled'),'Historical requirements editable');document.querySelector('[data-content-id=plan] button').click();await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes(state().architecture.data.steps[0].id)));click(state().architecture.data.steps[0].id);await wait(()=>document.querySelector('[data-architecture-view=planned]'));assert(document.querySelector('[aria-label^=\"Название узла\"]').value==='PLANNED TARGET','Historical Step target missing');assert(document.querySelector('[aria-label^=\"Название узла\"]').matches(':disabled'),'Historical Step editable');document.querySelector('[data-content-id=history] button').click();await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Вернуться к рабочей архитектуре')));click('Вернуться к рабочей архитектуре');await wait(()=>document.querySelector('[data-architecture-view=current]')&&!document.querySelector('[data-architecture-view=current] fieldset:disabled'));change('[aria-label^=\"Название узла\"]','FACTUAL AFTER');await wait(()=>state().architecture.data.current.nodes[0].title==='FACTUAL AFTER');assert(JSON.stringify(state().history[0])===snapshot,'Working edit changed checkpoint');click('+ Окно');await wait(()=>document.querySelector('.quick-picker'));click('Markdown');await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('+ Markdown')));click('+ Markdown');await wait(()=>document.querySelector('[aria-label^=\"Markdown md-\"]'));change('[aria-label^=\"Markdown md-\"]','# Independent Markdown');await wait(()=>JSON.parse(localStorage.getItem('pt006-single-markdown-instances-v1'))[0].data.body==='# Independent Markdown')})()")
  await reload()
  const baseline=await run("({state:pt006Smoke.state(),raw:localStorage.getItem('pt006-single-architecture-instances-v1'),layout:localStorage.getItem('pt006-single-architecture-layout-v1'),panels:document.querySelectorAll('.window-panel').length})")
  await run("pt006Smoke.assert(pt006Smoke.state().architecture.data.current.nodes[0].title==='FACTUAL AFTER','CURRENT restore failed');pt006Smoke.assert(document.querySelector('[aria-label^=\"Markdown md-\"]').value==='# Independent Markdown','Markdown restore failed')")
  // Exercise the supported predecessor form in this isolated browser profile.
  const previousV1={version:1,architecture:{...baseline.state.architecture,templateVersion:1,data:baseline.state.architecture.data.current},requirements:baseline.state.requirements,steps:baseline.state.architecture.data.steps,history:baseline.state.history,selection:'CURRENT',selectedEventId:null}
  const previousRaw=JSON.stringify(previousV1)
  await run('localStorage.removeItem("pt006-single-architecture-view-v1");localStorage.setItem('+JSON.stringify(KEY)+','+JSON.stringify(previousRaw)+')')
  await reload()
  await run("pt006Smoke.assert(localStorage.getItem('pt006-single-architecture-instances-v1')==="+JSON.stringify(previousRaw)+",'Hydration rewrote v1');document.querySelector('[data-content-id=history] button').click()")
  await run("pt006Smoke.wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('+ Зафиксировать')))")
  await run("pt006Smoke.click(pt006Smoke.state().history[0].id)")
  await run("pt006Smoke.wait(()=>document.querySelector('[data-architecture-view=current] fieldset:disabled'))")
  await run("pt006Smoke.assert(localStorage.getItem('pt006-single-architecture-instances-v1')==="+JSON.stringify(previousRaw)+",'Navigation rewrote v1');pt006Smoke.click('Вернуться к рабочей архитектуре')")
  await run("pt006Smoke.wait(()=>!document.querySelector('[data-architecture-view=current] fieldset:disabled'))")
  await run("pt006Smoke.click('+ Архитектурный элемент');pt006Smoke.wait(()=>pt006Smoke.state().version===2)")
  await run("pt006Smoke.assert(localStorage.getItem('pt006-single-architecture-original-v1')==="+JSON.stringify(previousRaw)+",'Original v1 bytes not archived');pt006Smoke.assert(pt006Smoke.state().architecture.data.current.nodes.length===2,'Migration lost CURRENT')")
  await run('localStorage.setItem('+JSON.stringify(KEY)+','+JSON.stringify(baseline.raw)+')')
  await reload()
  const failures=[
    ['reserved History CURRENT',s=>{s.history[0].steps[0].id='CURRENT'}],
    ['forbidden sameAs',s=>{s.requirements.data.artifacts.push({id:'w1',kind:'widget',title:'Button',sameAs:'w2'},{id:'w2',kind:'widget',title:'Button'})}],
    ['invalid acceptance',s=>{s.requirements.data.requirements[0].acceptance=42}],
  ]
  for(const [label,mutate] of failures){
    const bad=structuredClone(baseline.state);mutate(bad);const raw=JSON.stringify(bad)
    await run('localStorage.setItem('+JSON.stringify(KEY)+','+JSON.stringify(raw)+')')
    await reload()
    await run("(async()=>{const {wait,assert,alert,click}=pt006Smoke;await wait(()=>alert('неподдерживаемую структуру'));click('+ Архитектурный элемент');await wait(()=>alert('Редактирование заблокировано'));assert(document.querySelectorAll('[aria-label^=\"Название узла\"]').length===0,'Rejected save rendered nodes')})()")
    if(await run('localStorage.getItem('+JSON.stringify(KEY)+')')!==raw)throw Error('Rejected save overwritten: '+label)
  }
  await run('localStorage.setItem('+JSON.stringify(KEY)+',"")')
  await reload()
  await run("pt006Smoke.assert(pt006Smoke.alert('Не удалось прочитать сохранение'),'Empty damaged save warning hidden');pt006Smoke.assert(localStorage.getItem('pt006-single-architecture-instances-v1')==='', 'Empty save overwritten')")
  await run('localStorage.setItem('+JSON.stringify(KEY)+',"{broken JSON")')
  await reload()
  await run("pt006Smoke.assert(pt006Smoke.alert('Не удалось прочитать сохранение'),'Unreadable save warning hidden');pt006Smoke.assert(localStorage.getItem('pt006-single-architecture-instances-v1')==='{broken JSON','Corrupt bytes overwritten')")
  await run('localStorage.setItem('+JSON.stringify(KEY)+','+JSON.stringify(baseline.raw)+')')
  await reload()
  await run("window.__pt006OriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='pt006-single-architecture-instances-v1')throw new DOMException('Quota','QuotaExceededError');return window.__pt006OriginalSet.call(this,k,v)}")
  await run("(async()=>{const {click,wait,assert,alert}=pt006Smoke;click('+ Архитектурный элемент');await wait(()=>alert('Не удалось сохранить'));assert(document.querySelectorAll('[aria-label^=\"Название узла\"]').length===1,'Failed write changed UI');document.querySelector('.header-toggle').click();await wait(()=>!document.querySelector('.top-header'));assert(document.querySelector('.factual-time-bar [role=alert]').getBoundingClientRect().height>0,'Failure hidden with header')})()")
  if(await run('localStorage.getItem('+JSON.stringify(KEY)+')')!==baseline.raw)throw Error('Quota failure changed domain bytes')
  await run("Storage.prototype.setItem=window.__pt006OriginalSet")
  await reload()
  await run("window.__pt006OriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='pt006-single-architecture-layout-v1')throw new DOMException('Quota','QuotaExceededError');return window.__pt006OriginalSet.call(this,k,v)}")
  await run("(async()=>{const {click,wait,assert,alert}=pt006Smoke;click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));click('Пустой экран');await wait(()=>alert('Не удалось сохранить размещение'));assert(document.querySelectorAll('.screen-tab').length===5,'Layout command did not apply in memory')})()")
  if(await run('localStorage.getItem('+JSON.stringify(LAYOUT)+')')!==baseline.layout)throw Error('Failed layout save replaced original')
  await run("Storage.prototype.setItem=window.__pt006OriginalSet")
  await reload()
  await run("pt006Smoke.assert(document.querySelectorAll('.screen-tab').length===4,'Failed layout unexpectedly restored');['pt006-workspace-settings-v1','workspace-shell-view-mode-v1','pt006-shell-header-hidden-v1'].forEach(k=>localStorage.removeItem(k))")
  const injection=await call('Page.addScriptToEvaluateOnNewDocument',{source:"const nativeSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(['pt006-workspace-settings-v1','workspace-shell-view-mode-v1','pt006-shell-header-hidden-v1'].includes(k))throw new DOMException('Denied','SecurityError');return nativeSet.call(this,k,v)}"})
  await reload()
  await run("(async()=>{const {wait,assert,alert}=pt006Smoke;await wait(()=>alert('Не удалось сохранить настройки'));assert(document.querySelectorAll('.window-panel').length===8,'Storage denial unmounted Shell');assert(localStorage.getItem('pt006-markdown-contexts-v1')==='legacy-marker','Legacy bytes changed')})()")
  await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier})
  await reload()
  await run("pt006Smoke.assert(!pt006Smoke.alert('Не удалось сохранить'),'Recovered storage still reports error')")
  const subjects=await run("({architecture:localStorage.getItem('pt006-single-architecture-instances-v1'),markdown:localStorage.getItem('pt006-single-markdown-instances-v1')})")
  await run("(async()=>{const {click,wait,assert}=pt006Smoke;if(!document.querySelector('.top-header'))document.querySelector('.header-toggle').click();click('+ Экран');await wait(()=>document.getElementById('screen-create-menu'));const menu=document.getElementById('screen-create-menu');const box=menu.getBoundingClientRect();assert(box.left>=0&&box.right<=innerWidth,'Template menu outside viewport');menu.querySelector('button.screen-create-option').click();await wait(()=>document.querySelectorAll('.screen-tab').length===8);for(const title of ['История и факты','Архитектура и реализация','Планирование','Работа и результаты']){[...document.querySelectorAll('.screen-tab')].filter(b=>b.textContent===title).at(-1).click();await new Promise(r=>setTimeout(r,150));assert(document.querySelectorAll('.window-panel').length>=2,'Screen content missing: '+title);assert([...document.querySelectorAll('.window-panel')].every(p=>{const r=p.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),'Windows outside wide viewport: '+title)}})()")
  const afterTemplates=await run("({architecture:localStorage.getItem('pt006-single-architecture-instances-v1'),markdown:localStorage.getItem('pt006-single-markdown-instances-v1')})")
  if(JSON.stringify(subjects)!==JSON.stringify(afterTemplates))throw Error('Creating populated screen set changed Content bytes')
  await reload()
  const afterReload=await run("({architecture:localStorage.getItem('pt006-single-architecture-instances-v1'),markdown:localStorage.getItem('pt006-single-markdown-instances-v1')})")
  if(JSON.stringify(subjects)!==JSON.stringify(afterReload))throw Error('Screen reload changed populated Content')
  if(errors.length)throw Error('Browser exceptions: '+errors.join(';'))
  console.log(JSON.stringify({fourScreenTemplate:true,repeatedAndIndividualCreation:true,customLayoutPreserved:true,populatedContentBytesPreserved:true,wideViewportChecked:true,predecessorLayoutArchived:true,currentStepHistory:true,independentMarkdown:true,rejectedSavedDataPreserved:true,visibleContentAndLayoutErrors:true,settingsDeniedStartup:true,errors},null,2))
}
async function fullContentMain(){
 await connect();await call('Runtime.enable');await call('Page.enable')
 await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false})
 const before=loads;await call('Page.navigate',{url});await loaded(before);await ready(false)
 const inventory=[],screenshots=[]
 const capture=process.env.PT006_CAPTURE_SCREENS==='1'
 const captureDir=capture?fs.mkdtempSync(path.join(os.tmpdir(),'pt006-full-views-')):null
 for(const [title,count] of [['История и факты',5],['Архитектура и реализация',4],['Планирование',4],['Работа и результаты',3]]){
  const result=await run("(async()=>{const {assert,wait}=pt006Smoke;const title="+JSON.stringify(title)+",count="+count+";[...document.querySelectorAll('.screen-tab')].find(b=>b.textContent===title).click();await wait(()=>document.querySelectorAll('.window-panel').length===count);assert([...document.querySelectorAll('.window-panel')].every(p=>p.querySelector('.panel-body')?.textContent.trim().length>15),'Empty renderer: '+title);assert(!document.querySelector('[data-content-id=architecture],[data-content-id=comparison]'),'Removed view returned');return {title,windows:count,content:[...document.querySelectorAll('.content-tab')].map(t=>t.dataset.contentId)}})()")
  inventory.push(result)
  if(captureDir){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const file=path.join(captureDir,'screen-'+inventory.length+'.png');fs.writeFileSync(file,Buffer.from(shot.data,'base64'));screenshots.push(file)}
 }
 const raw=await run("localStorage.getItem('pt006-single-architecture-instances-v1')")
 const contentKinds=inventory.flatMap(screen=>screen.content)
 if(new Set(contentKinds).size!==contentKinds.length)throw Error('Repeated Content kind in default screens')
 await run("(async()=>{const {assert,click,wait,state}=pt006Smoke;assert(state().architecture.data.steps.length===6&&state().history.length===8,'Evolution route incomplete');click('Архитектура и реализация');await wait(()=>document.querySelector('[aria-label=\"Состояние архитектуры\"]'));for(const step of state().architecture.data.steps){const select=document.querySelector('[aria-label=\"Состояние архитектуры\"]');select.value=step.id;select.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('[data-architecture-view=planned]')&&document.querySelectorAll('[aria-label^=\"Название узла\"]').length===step.target.nodes.length);assert(!document.querySelector('[data-material-view=implementation] .material-section').textContent.includes('email.ts'),'Future file became actual')}for(const fact of state().history){click('История и факты');await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes(fact.id)));click(fact.id);await wait(()=>document.querySelector('.factual-time-bar').textContent.includes(fact.id));assert(document.querySelector('[data-material-view=current]').textContent.includes(fact.architecture.nodes.length+' архитектурных элементов'),'Historical summary wrong: '+fact.id);click('Архитектура и реализация');await wait(()=>document.querySelector('[data-architecture-view=current] fieldset:disabled'));assert(document.querySelectorAll('[aria-label^=\"Название узла\"]').length===fact.architecture.nodes.length,'Historical nodes wrong: '+fact.id);assert(document.querySelector('[aria-label=\"Состояние архитектуры\"]').options.length===fact.steps.length+1,'Historical Plan leaked future Steps');const actual=document.querySelector('[data-material-view=implementation] .material-section');assert(actual.querySelectorAll('.material-card').length===fact.materials.implementation.data.files.length,'Historical files wrong: '+fact.id)}click('История и факты');await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Вернуться к рабочей архитектуре')));click('Вернуться к рабочей архитектуре');click('Планирование');await wait(()=>document.querySelector('[data-plan-view]'));assert(!document.querySelector('[data-architecture-view]'),'Architecture Planning still repeated');const selected=[...document.querySelector('[data-plan-view]').querySelectorAll('button')].find(b=>b.textContent.includes('step-webhooks'));selected.click();await wait(()=>document.querySelector('.factual-time-bar').textContent.includes('step-webhooks'));const layoutBefore=localStorage.getItem('pt006-single-architecture-layout-v1');click('Открыть выбранную архитектуру');await wait(()=>document.querySelector('[data-architecture-view=planned]')&&document.querySelectorAll('[aria-label^=\"Название узла\"]').length===20);assert(JSON.parse(localStorage.getItem('pt006-single-architecture-layout-v1')).screens.flatMap(s=>s.panels).length===16,'Open architecture duplicated a window');assert(JSON.parse(layoutBefore).screens.flatMap(s=>s.panels).length===16,'Initial layout wrong');click('Планирование');await wait(()=>document.querySelector('[data-plan-view]'));assert([...document.querySelector('[data-plan-view]').querySelectorAll('h4')].every(h=>!h.textContent.includes('FORECAST')&&!h.textContent.includes('направления')),'Plan repeats detailed Forecast/Axes');click('Открыть прогнозы и сроки');await wait(()=>document.querySelector('[data-content-id=forecasts].active'));assert(document.querySelectorAll('.window-panel').length===4,'Forecast opened duplicate window');click('Открыть направления изменений');await wait(()=>document.querySelector('[data-content-id=axes].active'));assert(document.querySelectorAll('.window-panel').length===4,'Axes opened duplicate window')})()")
 if(await run("localStorage.getItem('pt006-single-architecture-instances-v1')")!==raw)throw Error('Evolution browsing changed Content')
 await run("(async()=>{const {click,wait,assert}=pt006Smoke;click('Архитектура и реализация');await wait(()=>document.querySelector('[aria-label=\"Состояние архитектуры\"]'));const select=document.querySelector('[aria-label=\"Состояние архитектуры\"]');select.value='step-notifications';select.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('[data-architecture-view=planned]'));assert(document.querySelectorAll('[aria-label^=\"Название узла\"]').length===6,'Planning target missing');const actual=[...document.querySelector('[data-material-view=implementation]').querySelectorAll('.material-section')].find(s=>s.querySelector('h4').textContent.includes('ACTUAL'));assert(!actual.textContent.includes('src/notifications/email.ts'),'Planned file became actual');assert(document.querySelector('[data-material-view=trace]').textContent.includes('PLANNED FILE'),'Trace lost planned distinction')})()")
 if(await run("localStorage.getItem('pt006-single-architecture-instances-v1')")!==raw)throw Error('Step navigation changed Content')
 await run("(async()=>{const {click,wait,assert}=pt006Smoke;click('История и факты');await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('demo-fact-mvp')));click('demo-fact-mvp');await wait(()=>document.querySelector('.factual-time-bar').textContent.includes('HISTORY'));assert(document.querySelector('[data-material-view=current]').textContent.includes('2 архитектурных элементов'),'Current State used live architecture');click('Архитектура и реализация');await wait(()=>document.querySelector('[data-architecture-view=current] fieldset:disabled'));assert(document.querySelectorAll('[aria-label^=\"Название узла\"]').length===2,'Historical architecture wrong');assert(!document.querySelector('[data-material-view=implementation]').textContent.includes('src/tasks/comment.ts'),'Historical files leaked live data');assert(document.querySelector('[data-material-view=impactHistory]').textContent.includes('Исходный сохранённый снимок'),'Baseline misclassified as CREATE')})()")
 if(await run("localStorage.getItem('pt006-single-architecture-instances-v1')")!==raw)throw Error('Historical navigation changed Content')
 await run("(async()=>{const {click,wait,assert}=pt006Smoke;const before=localStorage.getItem('pt006-single-architecture-instances-v1');click('История и факты');await wait(()=>document.querySelector('[aria-label=\"Объект события\"]'));const select=document.querySelector('[aria-label=\"Объект события\"]');select.value='file:src/tasks/task.ts';select.dispatchEvent(new Event('change',{bubbles:true}));await wait(()=>document.querySelector('[data-material-view=explorer] .material-section').textContent.includes('src/tasks/task.ts'));const detail=document.querySelector('[data-material-view=explorer] .material-section');assert(detail.querySelectorAll('.material-card').length===1,'Explorer repeats entire Current State');assert(!detail.textContent.includes('email.ts'),'Explorer leaked a future file');assert(localStorage.getItem('pt006-single-architecture-instances-v1')===before,'Explorer selection wrote Content')})()")
 await run("(async()=>{const {click,wait}=pt006Smoke;click('История и факты');await wait(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Вернуться к рабочей архитектуре')));click('Вернуться к рабочей архитектуре');click('Работа и результаты');await wait(()=>document.querySelector('[data-material-view=work]'));document.querySelector('[data-material-view=work] .source-inspector').open=true})()")
 await run("(async()=>{const {state,change,click,wait,assert}=pt006Smoke;const work=structuredClone(state().materials.work.data);work.episodes[0].goal='Проверенный учебный ввод';change('[aria-label=\"State Work Dynamics\"]',JSON.stringify(work));click('Сохранить данные Work Dynamics');await wait(()=>state().materials.work.data.episodes[0].goal==='Проверенный учебный ввод');assert(state().history[0].materials.work.data.episodes[0].goal!=='Проверенный учебный ввод','Editing work rewrote history');document.querySelector('[data-content-id=markdown-documents] button').click();await wait(()=>document.querySelector('[aria-label=\"Markdown md-example-guide\"]'));assert(document.querySelector('[aria-label=\"Markdown md-example-guide\"]').value.includes('полный Workspace'),'Guide not updated')})()")
 await reload(false)
 await run("pt006Smoke.assert(pt006Smoke.state().materials.work.data.episodes[0].goal==='Проверенный учебный ввод','Material source not restored')")
 await run("(async()=>{const {click,wait,assert}=pt006Smoke;const before=localStorage.getItem('pt006-single-architecture-instances-v1');click('История и факты');await wait(()=>document.querySelector('[data-content-id=events]'));const originalPanels=document.querySelectorAll('.window-panel').length;click('Открыть разбор события в Explorer');await wait(()=>document.querySelector('[data-content-id=explorer] button').closest('.content-tab').classList.contains('active'));assert(document.querySelectorAll('.window-panel').length===originalPanels,'Existing Explorer not reused');assert(localStorage.getItem('pt006-single-architecture-instances-v1')===before,'Open view wrote facts')})()")
 if(errors.length)throw Error('Browser errors: '+errors.join(';'))
 console.log(JSON.stringify({fullInventory:inventory,screenshots,uniqueDefaultViews:true,sixStepsAndEightHistoricalEvents:true,planLinksReuseWindows:true,focusedEventExplorer:true,architectureSelector:true,factualAndPlannedFiles:true,historicalSourcesIsolated:true,sourceEditAndReload:true,navigationReusesWindow:true,errors},null,2))
}

(process.env.PT006_SMOKE_MODE==='full-content'?fullContentMain:main)().catch(e=>{console.error(e.stack);process.exitCode=1}).finally(async()=>{
  clearTimeout(timer);try{ws?.close()}catch{}
  browser.kill();await new Promise(resolve=>setTimeout(resolve,600))
  try{fs.rmSync(dir,{recursive:true,force:true})}catch{}
})
