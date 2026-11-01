import {readFileSync,readdirSync} from 'node:fs'
import {resolve,relative,dirname,extname} from 'node:path'
import {createHash} from 'node:crypto'
import ts from 'typescript'
import type {Plugin} from 'vite'
import type {SourceFile,SourceIndex,SourceSurface,UISource} from '../src/shell/mechanics/contracts.ts'

const slash=(value:string)=>value.replaceAll('\\','/')
const hash=(text:string)=>createHash('sha256').update(text).digest('hex').slice(0,16)
const virtual='virtual:pt006-mechanics-sources',metadata='virtual:pt006-mechanics-metadata',resolved='\0'+virtual,resolvedMetadata='\0'+metadata
function callsIn(node:ts.Node):string[] {
 const calls=new Set<string>()
 const visit=(child:ts.Node)=>{
  if(ts.isCallExpression(child)||ts.isNewExpression(child)){
   const expression=child.expression
   if(ts.isIdentifier(expression))calls.add(expression.text)
   else if(ts.isPropertyAccessExpression(expression))calls.add(expression.name.text)
  }
  ts.forEachChild(child,visit)
 }
 visit(node);return [...calls]
}
function openedContent(node:ts.Node):string | undefined {
 let target:string|undefined
 const visit=(child:ts.Node)=>{
  if(ts.isCallExpression(child)&&ts.isIdentifier(child.expression)&&child.expression.text==='open'&&
    child.arguments.length===1&&ts.isStringLiteral(child.arguments[0]))target=child.arguments[0].text
  ts.forEachChild(child,visit)
 }
 visit(node)
 return target
}
export function scanMechanicsSource(module:string,text:string):SourceFile {
 const ast=ts.createSourceFile(module,text,ts.ScriptTarget.Latest,true,module.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS)
 const fingerprint=hash(text),symbols:Record<string,number>={},imports:string[]=[],surfaces:SourceSurface[]=[]
 const point=(node:ts.Node)=>ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1
 const visit=(node:ts.Node)=>{
  if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)&&!node.importClause?.isTypeOnly)imports.push(node.moduleSpecifier.text)
  if(ts.isFunctionDeclaration(node)&&node.name)symbols[node.name.text]=point(node)
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name))symbols[node.name.text]=point(node)
  if(ts.isJsxAttribute(node)&&/^on[A-Z]/.test(node.name.getText(ast))&&node.initializer&&ts.isJsxExpression(node.initializer)&&node.initializer.expression){
   const target=openedContent(node.initializer.expression)
   const element=node.parent?.parent
   const views=element&&(ts.isJsxOpeningElement(element)||ts.isJsxSelfClosingElement(element))?
    element.attributes.properties.find(p=>ts.isJsxAttribute(p)&&p.name.getText(ast)==='data-mechanics-views'):undefined
   const ownerViews=views&&ts.isJsxAttribute(views)&&views.initializer&&ts.isStringLiteral(views.initializer)?
    views.initializer.text.split('|'):[]
   const jsx=element&&ts.isJsxOpeningElement(element)&&ts.isJsxElement(element.parent)?element.parent:null
   const elementLabel=jsx?.children.filter(ts.isJsxText).map(t=>t.getText(ast).trim()).filter(Boolean).join(' ')||undefined
   surfaces.push({module,line:point(node),hash:fingerprint,surfaceId:module+':'+node.getStart(ast),
    calls:callsIn(node.initializer.expression),event:node.name.getText(ast),type:'ui',
    ...(target?{opensContent:target}:{}),...(ownerViews.length?{ownerViews}:{}),...(elementLabel?{elementLabel}:{})})
   if(ts.isIdentifier(node.initializer.expression))surfaces[surfaces.length-1].calls.push(node.initializer.expression.text)
  }
  if(ts.isCallExpression(node)||ts.isNewExpression(node)){
   const calls=callsIn(node).slice(0,1),name=calls[0]
   const type=name==='useEffect'||name==='useLayoutEffect'?'effect':name==='addEventListener'?'listener':
    ['requestAnimationFrame','setTimeout','setInterval'].includes(name)?'timer':name==='ResizeObserver'?'observer':
    ['writeContent','writePreservingInvalid'].includes(name)?'write':null
   if(type)surfaces.push({module,line:point(node),hash:fingerprint,surfaceId:module+':'+node.getStart(ast),
    calls:callsIn(node),event:name,type})
  }
  ts.forEachChild(node,visit)
 }
 visit(ast);return {path:module,text,hash:fingerprint,imports,symbols,surfaces}
}
/** Only authored src files and this app's dev code. No runtime file-reading endpoint. */
export function buildMechanicsSourceIndex(root:string):SourceIndex {
 const files:Record<string,SourceFile>={}
 const walk=(directory:string)=>{
  for(const entry of readdirSync(directory,{withFileTypes:true})){
   const file=resolve(directory,entry.name)
   if(entry.isDirectory())walk(file)
   else if(['.ts','.tsx'].includes(extname(file))&&!file.endsWith('.d.ts')){
    const module=slash(relative(root,file));files[module]=scanMechanicsSource(module,readFileSync(file,'utf8'))
   }
  }
 }
 walk(resolve(root,'src'));walk(resolve(root,'dev'))
 for(const file of Object.values(files))file.imports=file.imports.map(specifier=>
  specifier.startsWith('.')?slash(relative(root,resolve(root,dirname(file.path),specifier))):specifier)
 return {version:hash(Object.values(files).sort((a,b)=>a.path.localeCompare(b.path)).map(f=>f.path+':'+f.hash).join('\n')),files}
}
export function instrumentMechanicsUI(module:string,text:string):string {
 if(!module.endsWith('.tsx')||module.startsWith('src/shell/mechanics/'))return text
 const info=scanMechanicsSource(module,text)
 const ast=ts.createSourceFile(module,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
 const edits:{at:number;end:number;text:string}[]=[]
 let count=0
 const visit=(node:ts.Node)=>{
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const attrs=node.attributes.properties.filter(ts.isJsxAttribute)
   const observed=attrs.filter(attr=>info.surfaces.some(s=>s.type==='ui'&&s.surfaceId===module+':'+attr.getStart(ast)))
   if(observed.length&&/^[a-z]/.test(node.tagName.getText(ast))){
    const ids=observed.map(attr=>module+':'+attr.getStart(ast))
    edits.push({at:node.tagName.end,end:node.tagName.end,text:' data-mechanics-surfaces='+JSON.stringify(ids.join('|'))})
   }
   for(const attr of observed){
    const expression=(attr.initializer as ts.JsxExpression).expression!
    const surface=info.surfaces.find(s=>s.surfaceId===module+':'+attr.getStart(ast))! as UISource
    edits.push({at:expression.getStart(ast),end:expression.end,
     text:'__pt006ObserveUI('+JSON.stringify(surface)+',('+expression.getText(ast)+'))'});count++
   }
  }
  ts.forEachChild(node,visit)
 }
 visit(ast)
 if(!count)return text
 if(text.includes('__pt006ObserveUI'))throw Error('Reserved instrumentation name in '+module)
 let code=text
 for(const edit of edits.sort((a,b)=>b.at-a.at))code=code.slice(0,edit.at)+edit.text+code.slice(edit.end)
 return 'import {observeUI as __pt006ObserveUI} from "/src/shell/mechanics/runtime.ts";\n'+code
}
export function mechanicsSourcePlugin():Plugin {
 let root=''
 return {name:'pt006-mechanics-sources',enforce:'pre',
  configResolved(config){root=config.root},
  resolveId(id){return id===virtual?resolved:id===metadata?resolvedMetadata:undefined},
  load(id){
   if(id!==resolved&&id!==resolvedMetadata)return
   const index=buildMechanicsSourceIndex(root)
   if(id===resolved)return 'export default '+JSON.stringify(index)
   return 'export default '+JSON.stringify({version:index.version,files:Object.fromEntries(Object.entries(index.files).map(([path,{text:_text,...file}])=>[path,file]))})
  },
  transform(code,id){
   const path=slash(relative(root,id.split('?')[0]))
   if(path.startsWith('src/')&&path.endsWith('.tsx'))return {code:instrumentMechanicsUI(path,code),map:null}
  },
  handleHotUpdate(context){
   const path=slash(relative(root,context.file))
   if(!path.startsWith('src/')&&!path.startsWith('dev/'))return
   const modules=[resolved,resolvedMetadata].map(id=>context.server.moduleGraph.getModuleById(id)).filter(module=>!!module)
   for(const module of modules)context.server.moduleGraph.invalidateModule(module)
   if(modules.length)return [...context.modules,...modules]
  },
 }
}
