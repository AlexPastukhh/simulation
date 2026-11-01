import type {Navigation,SingleState} from '../../../../../../../profiles/single-architecture/state.ts'
import {normalizeNavigation} from '../../../../../../../profiles/single-architecture/state.ts'
import {writePreservingInvalid} from '../../../../../../../shell/safeStorage.ts'
export const NAVIGATION_KEY='pt006-single-architecture-view-v1'
/** Scope settings only. The caller publishes the cursor even when browser persistence fails. */
export function changeHistoryPlanNavigation(next:Navigation,state:SingleState,publish:(value:Navigation)=>void) {
 const value=normalizeNavigation(next,state)
 publish(value)
 return {value,persisted:writePreservingInvalid(NAVIGATION_KEY,JSON.stringify(value),()=>true)}
}
