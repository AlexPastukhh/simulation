/** Preserve the exact previous bytes when recovery needs to replace invalid saved data.
 * No write takes place during hydration. If archiving fails, the original is left untouched. */
export const RECOVERY_PREFIX = 'pt006-recovery-original-v1:'
export function parseStored<T>(key:string,valid:(value:unknown)=>value is T):T|null {
  try {
    const raw=localStorage.getItem(key)
    if(raw===null)return null
    const value:unknown=JSON.parse(raw)
    return valid(value)?value:null
  }catch{return null}
}
export function writePreservingInvalid(
  key:string,
  next:string,
  validExistingRaw:(raw:string)=>boolean,
):boolean {
  try {
    const previous=localStorage.getItem(key)
    if(previous===next)return true
    if(previous!==null&&!validExistingRaw(previous)){
      const backupKey=RECOVERY_PREFIX+key
      const existingBackup=localStorage.getItem(backupKey)
      if(existingBackup===null){
        localStorage.setItem(backupKey,previous)
        if(localStorage.getItem(backupKey)!==previous)return false
      }else if(existingBackup!==previous){
        // Never overwrite the only recovery copy for an earlier damaged version.
        // Reject a second destructive replacement instead.
        return false
      }
    }
    localStorage.setItem(key,next)
    return true
  }catch{return false}
}
export function validStoredJson<T>(valid:(value:unknown)=>value is T):(raw:string)=>boolean {
  return raw=>{
    try{return valid(JSON.parse(raw) as unknown)}
    catch{return false}
  }
}
