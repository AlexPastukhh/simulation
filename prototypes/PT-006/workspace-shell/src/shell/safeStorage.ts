/** Preserve exact previous bytes for invalid data or an explicitly requested layout upgrade.
 * No write takes place during hydration. If archiving fails, the original is left untouched. */
export const RECOVERY_PREFIX = 'pt006-recovery-original-v1:'
export function writePreservingInvalid(
  key:string,
  next:string,
  validExistingRaw:(raw:string)=>boolean,
  preserveExistingRaw?:(raw:string)=>boolean|string,
):boolean {
  try {
    const previous=localStorage.getItem(key)
    if(previous===next)return true
    const preserve=previous!==null?preserveExistingRaw?.(previous):false
    if(previous!==null&&(!validExistingRaw(previous)||preserve)){
      const backupKey=typeof preserve==='string'?preserve:RECOVERY_PREFIX+key
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
    return localStorage.getItem(key)===next
  }catch{return false}
}
export function validStoredJson<T>(valid:(value:unknown)=>value is T):(raw:string)=>boolean {
  return raw=>{
    try{return valid(JSON.parse(raw) as unknown)}
    catch{return false}
  }
}
