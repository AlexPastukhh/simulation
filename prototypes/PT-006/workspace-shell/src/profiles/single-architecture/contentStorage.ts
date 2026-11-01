/** Shared read / guarded commit for the two real Content stores. */
export function readContent<T>(key:string,decode:(value:unknown)=>T|null,empty:()=>T):
 {value:T;raw:string|null;error:string} {
 let raw:string|null=null
 try {
  raw=localStorage.getItem(key)
  if(raw===null)return {value:empty(),raw,error:''}
  const value=decode(JSON.parse(raw) as unknown)
  return value!==null?{value,raw,error:''}:
   {value:empty(),raw,error:'Сохранение имеет неподдерживаемую структуру. Исходные данные не перезаписаны.'}
 }catch{return {value:empty(),raw,error:'Не удалось прочитать сохранение. Оно не будет перезаписано.'}}
}
export function writeContent(key:string,value:unknown,expectedRaw:string|null,archiveKey?:string):
 {ok:true;raw:string}|{ok:false;error:string} {
 try {
  if(localStorage.getItem(key)!==expectedRaw)return {ok:false,
   error:'Сохранение изменилось в другой вкладке. Перезагрузите страницу перед редактированием.'}
  const raw=JSON.stringify(value)
  if(archiveKey&&expectedRaw!==null){
   const archived=localStorage.getItem(archiveKey)
   if(archived===null){
    localStorage.setItem(archiveKey,expectedRaw)
    if(localStorage.getItem(archiveKey)!==expectedRaw)throw Error('Archive read-back failed')
   }else if(archived!==expectedRaw)return {ok:false,
    error:'Не удалось сохранить исходную копию v1. Существующая копия и данные не изменены.'}
  }
  localStorage.setItem(key,raw)
  if(localStorage.getItem(key)!==raw)throw Error('Read-back failed')
  return {ok:true,raw}
 }catch{return {ok:false,error:'Не удалось сохранить. Проверьте доступность хранилища браузера.'}}
}
/** Web Locks serialize participating tabs. Without them the byte comparison still rejects stale sessions. */
export async function serializeContentWrite<T>(key:string,write:()=>T):Promise<T> {
 if(typeof navigator!=='undefined'&&navigator.locks)
  return navigator.locks.request('pt006-content:'+key,write)
 return write()
}
export function watchContentChanges(key:string,expectedRaw:()=>string|null,onConflict:(message:string)=>void) {
 const changed=(event:StorageEvent)=>{
  if(event.key!==key&&event.key!==null)return
  try {
   if(localStorage.getItem(key)!==expectedRaw())
    onConflict('Сохранение изменилось в другой вкладке. Перезагрузите страницу перед редактированием.')
  }catch{onConflict('Не удалось прочитать сохранение. Перезагрузите страницу перед редактированием.')}
 }
 window.addEventListener('storage',changed)
 return ()=>window.removeEventListener('storage',changed)
}
