import type { Workspace } from './workspace.ts'
import type { WorkspaceCommand } from './workspaceCommands.ts'
import type { ScreenTemplate } from './screenTemplates.ts'
import { executeWorkspaceCommand } from './workspaceCommands.ts'
import type { createWorkspaceModel } from './workspace.ts'
export type BridgeReply = {
 requestId:string;status:'applied'|'rejected'|'conflict';revision:number
 affectedScreenIds?:string[];code?:string;message?:string
}
export type MechanicsReply={traceId:string;status:'applied'|'rejected'|'conflict'|'noop';revision:number;code?:string;message?:string}
export type ShellState = {
 layouts:Record<string,Workspace>;revision:number;bridgeReply:BridgeReply|null
 mechanicsReplies?:readonly MechanicsReply[]
}
export type ShellAction =
 | {type:'modify';update:(workspace:Workspace)=>Workspace;traceId?:string}
 | {type:'command';command:WorkspaceCommand;requestId?:string;expectedRevision?:number;traceId?:string}
type Ops=ReturnType<typeof createWorkspaceModel>
/** Pure reducer. Diagnostics are values in its result, never a callback or second execution. */
export function reduceShellState(state:ShellState,action:ShellAction,ops:Ops,workspaceId:string,
 initialWorkspace:Workspace,screenTemplates:readonly ScreenTemplate[]=[]):ShellState {
 const reply=(next:ShellState,status:MechanicsReply['status'],code?:string,message?:string):ShellState=>
  action.traceId?{...next,mechanicsReplies:[...(state.mechanicsReplies??[]),
   {traceId:action.traceId,status,revision:next.revision,...(code?{code,message}:{})}].slice(-64)}:next
 const current=state.layouts[workspaceId]??initialWorkspace
 if(action.type==='modify'){
  const next=action.update(current)
  if(next===current)return reply(state,'noop')
  return reply({...state,revision:state.revision+1,layouts:{...state.layouts,[workspaceId]:next}},'applied')
 }
 const requestId=action.requestId
 if(requestId!==undefined&&action.expectedRevision!==state.revision){
  return reply({...state,bridgeReply:{requestId,status:'conflict',revision:state.revision,
   code:'REVISION_CONFLICT',message:'Workspace изменился после чтения'}},'conflict','REVISION_CONFLICT','Workspace изменился после чтения')
 }
 const result=executeWorkspaceCommand(current,action.command,ops,screenTemplates)
 if(!result.ok){
  return reply(requestId===undefined?state:{...state,bridgeReply:{requestId,status:'rejected',revision:state.revision,
   code:result.code,message:result.message}},'rejected',result.code,result.message)
 }
 const revision=state.revision+1
 return reply({...state,layouts:{...state.layouts,[workspaceId]:result.workspace},revision,
  bridgeReply:requestId===undefined?state.bridgeReply:{requestId,status:'applied',revision,affectedScreenIds:result.affectedScreenIds}},'applied')
}
