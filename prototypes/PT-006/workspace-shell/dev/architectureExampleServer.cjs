const fs=require('node:fs'),http=require('node:http'),path=require('node:path')
const root=path.resolve(__dirname,'../dist')
const fixturePath=path.resolve(__dirname,'../examples/architecture-evolution.json')
const port=Number(process.env.PT006_EXAMPLE_PORT||4212)
async function main(){
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid PT006_EXAMPLE_PORT')
 const example=JSON.parse(fs.readFileSync(fixturePath,'utf8'))
 const {validateSingleState,validateNavigation}=await import('../src/profiles/single-architecture/state.ts')
 const {createWorkspaceModel}=await import('../src/shell/workspace.ts')
 const {DESCRIPTORS,MARKDOWN_DESCRIPTOR}=await import('../src/profiles/single-architecture/workspace.ts')
 if(!validateSingleState(example.state)||!validateNavigation(example.navigation,example.state)||
  !createWorkspaceModel([...DESCRIPTORS,MARKDOWN_DESCRIPTOR]).validateWorkspace(example.layout))throw Error('Invalid example data')
 if(!fs.existsSync(path.join(root,'index.html')))throw Error('Run npm run build first')
 const entries={
  'pt006-single-architecture-instances-v1':JSON.stringify(example.state),
  'pt006-single-markdown-instances-v1':JSON.stringify(example.markdown),
  'pt006-single-architecture-view-v1':JSON.stringify(example.navigation),
  'pt006-single-architecture-layout-v1':JSON.stringify(example.layout),
 }
 // Seed a new empty origin only. Existing or partial saves are never overwritten.
 const seed='<script>(()=>{const entries='+JSON.stringify(entries).replace(/</g,'\\u003c')+
 ';const keys=Object.keys(entries);let error="";try{if(keys.every(k=>localStorage.getItem(k)===null)){const written=[];try{for(const k of keys){localStorage.setItem(k,entries[k]);written.push(k);if(localStorage.getItem(k)!==entries[k])throw Error("Read-back failed")}}catch(e){for(const k of written)localStorage.removeItem(k);throw e}}else{error="Используется ранее сохранённый пример; исходник не подставляется поверх него."}}catch(e){error="Ошибка данных: "+e.message}if(error)document.addEventListener("DOMContentLoaded",()=>document.getElementById("example-notice").append(" · "+error))})()</script>'
 const style='<style>#example-notice{min-height:36px;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:6px 16px;background:#28394d;color:#e9eff8;font:12px system-ui}#example-notice a{color:#b9dfff}#root,.app-shell{height:calc(100vh - 36px)!important}</style>'
 const banner='<div id="example-notice">Учебная эволюция · 8 событий / 6 Steps · все данные и даты вымышлены. <a href="http://127.0.0.1:4197/">Рабочая версия</a></div>'
 const renderHtml=()=>fs.readFileSync(path.join(root,'index.html'),'utf8').replace('</head>',style+seed+'</head>').replace('<div id="root">',banner+'<div id="root">')
 const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}
 http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let route;try{route=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400);res.end();return}
  res.setHeader('Cache-Control','no-store');res.setHeader('X-PT006-Preview','architecture-evolution-v2')
  try{
   if(route==='/'||route==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method==='HEAD'?undefined:renderHtml());return}
   const file=path.resolve(root,'.'+route),prefix=root+path.sep
   if(!file.startsWith(prefix)){res.writeHead(403);res.end();return}
   const bytes=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:bytes)
  }catch{res.writeHead(404);res.end()}
 }).on('error',e=>{console.error(e.message);process.exitCode=1}).listen(port,'127.0.0.1',()=>console.log('PT006 EVOLUTION EXAMPLE http://127.0.0.1:'+port+'/'))
}
main().catch(e=>{console.error(e.message);process.exitCode=1})
