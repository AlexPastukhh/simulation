const fs = require('node:fs')
const cp = require('node:child_process')
const os = require('node:os')
const path = require('node:path')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'workspace-ui-smoke-'))
const edgeBinary = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const edge = cp.spawn(edgeBinary, ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {stdio:['ignore','ignore','pipe']})
const errors = []
let ws
let serial = 0
const pending = new Map()
const timeout = setTimeout(() => {console.error('UI smoke timeout');edge.kill();process.exit(2)}, 75000)
async function connect() {
  const address = await new Promise((resolve,reject) => {
    let out = ''
    edge.stderr.on('data', data => {out += data.toString(); const match=out.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)resolve(match[1])})
    edge.on('error',reject);edge.on('exit',code=>reject(Error('Edge exited '+code)))
  })
  const tabs = await (await fetch('http://'+new URL(address).host+'/json/list')).json()
  ws = new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl)
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
  ws.onmessage=event=>{
    const data=JSON.parse(event.data)
    if(data.method==='Runtime.exceptionThrown') errors.push(data.params.exceptionDetails?.exception?.description ?? 'JavaScript exception')
    const active=pending.get(data.id)
    if(active){pending.delete(data.id);if(data.error)active.reject(Error(JSON.stringify(data.error)));else active.resolve(data.result)}
  }
}
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})
async function evaluate(expression) {
  const response=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})
  if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text)
  return response.result.value
}
async function main() {
  await connect()
  await call('Runtime.enable')
  await call('Page.enable')
  await call('Emulation.setDeviceMetricsOverride',{width:1600,height:1050,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://127.0.0.1:4196/'})
  const result=await evaluate(`(async()=>{
    const wait=async test=>{for(let i=0;i<60;i++){if(test())return;await new Promise(r=>setTimeout(r,100))}throw Error('Missing expected UI')}
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
    const assert=(truth,message)=>{if(!truth)throw Error(message)}
    const button=(where,text)=>{const target=[...document.querySelectorAll(where)].find(el=>el.textContent.trim()===text);assert(target,'Missing button '+text);target.click();return target}
    await wait(()=>document.querySelector('.plan-history'))
    assert(document.querySelectorAll('.window-panel').length===4,'Initial windows')
    const first=document.querySelector('[data-panel-id="panel-3"] .workspace-open-link')
    assert(first,'Event navigation action')
    first.click();await settle()
    assert([...document.querySelectorAll('.screen-tab.current')].some(el=>el.textContent.includes('Факты и связи')),'Navigate across screens')
    assert(document.querySelector('[data-panel-id="panel-8"] .sim-extra-heading').textContent.includes('Explorer'),'Explorer displayed')
    assert(document.querySelector('[data-panel-id="panel-8"] .window-focus-flash'),'Flash shown')
    button('.header-actions button','Просмотр');await settle()
    assert(document.querySelector('.app-shell.view-mode'),'View mode activated')
    assert(getComputedStyle(document.querySelector('.panel-header')).display==='none','Window chrome hidden')
    assert(document.querySelector('.sim-content'),'Content survives view mode')
    button('.screen-tab','Обзор');await settle()
    document.querySelector('[data-panel-id="panel-3"] .workspace-open-link').click();await settle()
    assert([...document.querySelectorAll('.screen-tab.current')].some(el=>el.textContent.includes('Факты и связи')),'Navigation works with chrome hidden')
    assert(document.querySelector('.view-mode [data-panel-id="panel-8"] .window-focus-flash'),'Flash in view mode')
    const persisted=localStorage.getItem('workspace-shell-view-mode-v1')
    assert(persisted==='1','View mode persisted')
    return {initialWindows:4,openContentCrossScreen:true,focusPulse:true,viewMode:true,navigationInViewMode:true,persistedMode:persisted}
  })()`)
  const headerPoint=await evaluate(`(()=>{const r=document.querySelector('.context-title').getBoundingClientRect();const stage=document.querySelector('.stage-scroll');return {x:r.left+Math.min(40,r.width/2),y:r.top+r.height/2,before:stage.scrollTop,max:stage.scrollHeight-stage.clientHeight}})()`)
  if(headerPoint.max<100)throw Error('Natural Workspace has no panning range')
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:headerPoint.x,y:headerPoint.y})
  await call('Input.dispatchMouseEvent',{type:'mouseWheel',x:headerPoint.x,y:headerPoint.y,deltaY:175,deltaX:0})
  await new Promise(resolve=>setTimeout(resolve,160))
  const mouseScroll=await evaluate('document.querySelector(".stage-scroll").scrollTop')
  if(mouseScroll<=headerPoint.before)throw Error('Native mouse wheel on main header did not scroll the board: '+JSON.stringify({headerPoint,mouseScroll}))
  await call('Page.reload',{ignoreCache:true})
  const reload=await evaluate(`(async()=>{for(let i=0;i<60&&!document.querySelector('.plan-history');i++)await new Promise(r=>setTimeout(r,100));return {viewMode:document.querySelector('.app-shell')?.classList.contains('view-mode'),panelHeader:getComputedStyle(document.querySelector('.panel-header')).display}})()`)
  if(!reload.viewMode||reload.panelHeader!=='none')throw Error('Persisted view mode did not restore')
  const extra=await evaluate(`(async()=>{
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))
    const assert=(ok,msg)=>{if(!ok)throw Error(msg)}
    const click=(select,text)=>{const b=[...document.querySelectorAll(select)].find(el=>el.textContent.trim()===text);assert(b,'Button '+text);b.click()}
    click('.header-actions button','Обычный режим');await settle()
    click('.screen-tab','Обзор');await settle()
    const panel=document.querySelector('[data-panel-id="panel-2"]')
    const {CONTENT}=await import('/src/profiles/architecture-simulator/workspace.ts')
    for(const kind of ['work','implementation','impact']){
      panel.querySelector('button[aria-label="Добавить содержимое"]').click();await settle()
      const label=CONTENT.find(x=>x.id===kind).label
      const choice=[...panel.querySelectorAll('.pick-option')].find(el=>el.textContent.includes(label))
      assert(choice&&!choice.disabled,'Picker option '+kind)
      choice.click();await settle()
    }
    const tabs=panel.querySelector('.tab-strip')
    assert(tabs.scrollWidth>tabs.clientWidth,'Tabs should overflow')
    tabs.scrollLeft=0
    const wheel=new WheelEvent('wheel',{deltaY:180,bubbles:true,cancelable:true})
    tabs.dispatchEvent(wheel);await settle()
    assert(tabs.scrollLeft>0,'Ordinary wheel scrolls horizontally')
    assert(wheel.defaultPrevented,'Wheel capture prevents board scrolling')
    const ctrlWheel=new WheelEvent('wheel',{deltaY:90,ctrlKey:true,bubbles:true,cancelable:true})
    tabs.dispatchEvent(ctrlWheel)
    assert(!ctrlWheel.defaultPrevented,'Ctrl+wheel remains free')
    const scrollValue=tabs.scrollLeft
    const viewport=document.querySelector('.stage-scroll')
    const board=document.querySelector('.workspace-board')
    assert(board.clientHeight>=viewport.clientHeight+295,'Natural workspace has vertical panning room')
    viewport.scrollTop=0
    const wholeBarWheel=new WheelEvent('wheel',{deltaY:170,bubbles:true,cancelable:true})
    document.querySelector('.context-title').dispatchEvent(wholeBarWheel);await settle()
    assert(wholeBarWheel.defaultPrevented,'Wheel on lower main header is handled')
    assert(viewport.scrollTop>0,'Lower main header scrolls natural workspace without artificial height')
    viewport.scrollTop=0
    board.style.height=(viewport.clientHeight+1500)+'px' // additional space for edge tests
    tabs.scrollLeft=tabs.scrollWidth-tabs.clientWidth
    const edgeWheel=new WheelEvent('wheel',{deltaY:140,bubbles:true,cancelable:true})
    tabs.dispatchEvent(edgeWheel);await settle()
    assert(edgeWheel.defaultPrevented,'Wheel is trapped at the horizontal end')
    assert(viewport.scrollTop===0,'No scroll chaining from tab edge to board')
    const header=panel.querySelector('.panel-header')
    const headerWheel=new WheelEvent('wheel',{deltaY:90,bubbles:true,cancelable:true})
    header.dispatchEvent(headerWheel);await settle()
    assert(headerWheel.defaultPrevented,'Whole window header traps the wheel')
    assert(viewport.scrollTop===0,'Window header does not scroll the board')
    const noOverflowHeader=document.querySelector('[data-panel-id="panel-3"] .panel-header')
    const noOverflowWheel=new WheelEvent('wheel',{deltaY:90,bubbles:true,cancelable:true})
    noOverflowHeader.dispatchEvent(noOverflowWheel);await settle()
    assert(noOverflowWheel.defaultPrevented,'Header without overflow also traps the wheel')
    assert(viewport.scrollTop===0,'No scroll chaining when there is no tab overflow')
    const rail=document.querySelector('.workspace-scroll-zone')
    assert(rail&&getComputedStyle(rail).height==='18px','Visible wheel zone in lower shell header')
    const railWheel=new WheelEvent('wheel',{deltaY:175,bubbles:true,cancelable:true})
    rail.dispatchEvent(railWheel);await settle()
    assert(railWheel.defaultPrevented,'Shell header wheel is captured')
    assert(viewport.scrollTop>0,'Shell header wheel scrolls the workspace')
    viewport.scrollTop=viewport.scrollHeight
    const railAtEdge=new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true})
    rail.dispatchEvent(railAtEdge)
    assert(railAtEdge.defaultPrevented,'Shell header also prevents chain at scroll boundary')
    const ctrlRailWheel=new WheelEvent('wheel',{deltaY:100,ctrlKey:true,bubbles:true,cancelable:true})
    rail.dispatchEvent(ctrlRailWheel)
    assert(!ctrlRailWheel.defaultPrevented,'Shell header preserves Ctrl+wheel')
    click('.branch-switch button','Architecture B');await settle()
    const other=document.querySelector('[data-panel-id="panel-2"]')
    assert(other.querySelectorAll('.content-tab').length===2,'Separate B layout')
    click('.branch-switch button','Architecture A');await settle()
    assert(document.querySelector('[data-panel-id="panel-2"]').querySelectorAll('.content-tab').length===5,'Restored A layout')
    return {wheelScrollLeft:scrollValue,ctrlWheelAvailable:true,branchLayoutsIndependent:true,windowHeaderStopsChaining:true,shellHeaderZoneScrollsWorkspace:true}
  })()`)
  console.log(JSON.stringify({...result,nativeHeaderWheel:{before:headerPoint.before,after:mouseScroll,max:headerPoint.max},reload,extra,exceptions:errors},null,2))
  if(errors.length)throw Error('Browser exceptions: '+errors.join('; '))
}
main().catch(error=>{console.error(error.stack);process.exitCode=1}).finally(()=>{
  clearTimeout(timeout);try{ws?.close()}catch{};edge.kill()
  setTimeout(()=>{fs.rmSync(profile,{recursive:true,force:true})},800).unref()
})
