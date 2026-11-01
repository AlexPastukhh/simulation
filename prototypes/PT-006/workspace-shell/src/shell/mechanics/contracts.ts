export type MechanicSource = { module: string; symbol?: string; line?: number; hash?: string; surfaceId?: string }
export type MechanicDefinition = {
 id: string; kind: 'core' | 'scope'; title: string; description: string
 level: 'workspace' | 'screen-group' | 'screen' | 'window' | 'content' | 'view'
 effects: readonly string[]
 sources: readonly MechanicSource[]
 /** Actual entry points called by UI bindings. Not a second list of buttons. */
 bindings: readonly { module: string; calls: readonly string[] }[]
}
export type MechanicConnection = {
 id: string; definitionId: string; title: string
 scope: { id: string; level: MechanicDefinition['level']; title: string; parentId?:string }
 participants: readonly { role: string; ref: string }[]
 presentation: readonly string[]
 persistence: string
 read: () => Record<string, unknown>
}
export type MechanicOutcome = 'invoked' | 'returned' | 'pending' | 'observed' | 'saved' | 'rejected' | 'failed' | 'cancelled' | 'noop'
export type TraceToken = { id: string; started: number; parentId?: string }
export type MechanicTrace = {
 id: string; parentId?: string; at: string; duration?: number
 connectionId: string; action: string; outcome: MechanicOutcome
 detail: Record<string, unknown>; source?: MechanicSource; version: string
}
export type UISource = MechanicSource & { surfaceId: string; calls: string[]; event: string; opensContent?: string; ownerViews?: string[]; elementLabel?: string }
export type SourceSurface = UISource & { type: 'ui' | 'effect' | 'listener' | 'timer' | 'observer' | 'write' }
export type SourceFile = { path: string; text: string; hash: string; imports: string[]; symbols: Record<string, number>; surfaces: SourceSurface[] }
export type SourceMetadata = { version:string;files:Record<string,Omit<SourceFile,'text'>> }
export type SourceIndex = { version: string; files: Record<string, SourceFile> }
export type MechanicCatalog = { definitions: readonly MechanicDefinition[]; connections: readonly MechanicConnection[]; uiBindings?:readonly {definitionId:string;module:string;calls:readonly string[]}[] }
export type MechanicObserver = {
 start: (connectionId: string, action: string, source?: MechanicSource, detail?: Record<string, unknown>) => TraceToken | null
 finish: (token: TraceToken | null, outcome: MechanicOutcome, detail?: Record<string, unknown>) => void
 emit: (connectionId: string, action: string, outcome: MechanicOutcome, detail?: Record<string, unknown>, source?: MechanicSource) => void
}
