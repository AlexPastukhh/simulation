import {useEffect,useState} from 'react'
import {startCurrentMechanics} from '../../shell/mechanics/runtime.ts'
import type {JsonSchema} from '../../templates/content/simulation-material/model.ts'
export function SourceEditor({title,value,schema,readOnly,save}:{
 title:string;value:unknown;schema:JsonSchema;readOnly:boolean;save:(value:unknown)=>Promise<boolean>
}){
 const serialized=JSON.stringify(value,null,2)
 const [draft,setDraft]=useState(serialized),[error,setError]=useState('')
 useEffect(()=>{setDraft(serialized);setError('')},[serialized])
 return <details className="source-inspector"><summary>State / JSON Schema · {title}</summary>
  <details><summary>JSON Schema</summary><pre>{JSON.stringify({$schema:'https://json-schema.org/draft/2020-12/schema',...schema},null,2)}</pre></details>
  <fieldset disabled={readOnly}><label>Данные источника<textarea aria-label={'State '+title} value={draft} onChange={e=>setDraft(e.target.value)}/></label>
   <button className="minor-btn" onClick={async()=>{
    const settle=startCurrentMechanics('source-editor-save',{module:'src/profiles/single-architecture/SourceEditor.tsx',symbol:'SourceEditor'})
    try{const saved=await save(JSON.parse(draft) as unknown);if(saved)setError('');else setError('Не сохранено: проверьте структуру и сообщение об отказе записи.');settle(saved?'returned':'rejected',{writerResult:saved})}
    catch{setError('Некорректный JSON. Исходные данные сохранены.');settle('rejected',{reason:'Некорректный JSON или отказ callback записи'})}
   }}>Сохранить данные {title}</button>
  </fieldset>{readOnly&&<p className="sim-hint">Исторический источник доступен только для чтения.</p>}
  {error&&<p role="alert">{error}</p>}
 </details>
}
