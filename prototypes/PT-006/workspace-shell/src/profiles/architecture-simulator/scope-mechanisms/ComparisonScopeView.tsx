import type { DemoStore } from '../content.ts'
import { comparisonReadout } from './comparison.ts'
import type { ComparisonFocus, ComparisonScope } from './comparison.ts'

export function ComparisonScopeView({scope,resolve,onFocus}:{
  scope:ComparisonScope
  resolve:(id:string)=>DemoStore|null
  onFocus:(focus:ComparisonFocus)=>void
}){
  const pair=comparisonReadout(scope,resolve)
  if(!pair)return <div className="sim-content"><p className="history-notice">Scope неприменим: источники отсутствуют или несовместимы. Данные не менялись.</p></div>
  return <div className="sim-content scope-comparison" data-scope-id={scope.id}>
    <h2>Cross-Architecture Comparison</h2>
    <p className="sim-hint">Источник слева: <b>{pair.left}</b> · источник справа: <b>{pair.right}</b></p>
    <p className="sim-hint">Механизм {scope.mechanismId} · разрешённый эффект: <b>только чтение</b>. Изменение выбора ниже сохраняется в Scope, а не в контекстах.</p>
    <div className="sim-segment">{(['events','requirements','work'] as const).map(focus=><button key={focus}
      className={scope.focus===focus?'is-selected':''} aria-pressed={scope.focus===focus}
      onClick={()=>onFocus(focus)}>{focus}</button>)}</div>
    <div className="sim-row"><strong>Architecture {pair.left}</strong><p>{pair.leftText}</p></div>
    <div className="sim-row"><strong>Architecture {pair.right}</strong><p>{pair.rightText}</p></div>
    <p className="sim-hint">Сопоставление — описание известных различий, а не автоматическое причинное вычисление и не исполнение Evolution Steps.</p>
  </div>
}
