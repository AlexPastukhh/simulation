export type Relation = {
  entityId?: string
  representationKey?: string
  organizationId?: string
  targetId?: string
  type: string
}

export type Mutation = {
  targetType?: string
  representationKey?: string
  targetId?: string
  targetKind?: string
  mutationType: string
  delta: string
}

export type Operation = {
  id: string
  type: string
  target?: string
  from?: string
  to?: string
  source?: string
}

export type ScenarioEvent = {
  id: string
  order: number
  role: string
  category: string
  title: string
  relations?: Relation[]
  semanticMutations?: Mutation[]
}

export type BranchEvent = {
  id: string
  branchScope: string
  triggeredBy: string[]
  sequenceWithinTrigger: number
  provenance: string
  role: string
  category: string
  title: string
  relations: Relation[]
  mutations: Mutation[]
  operations: Operation[]
}

export type Branch = {
  id: string
  parentId: string | null
  decisions: Record<string, string>
}

export type SemanticEntity = { id: string; name: string }

export type RepresentationMapping = {
  branchScope: string
  effectiveAfter: string
  semanticEntityId: string
  representationKey: string
  mappingRole: string
}

export type WorkEpisode = {
  id: string
  branchScope: string
  trigger: string
  eventRefs: string[]
}

export type StageData = {
  prototypeId: string
  stage: string
  status: string
  scenarioId: string
  branches: Branch[]
  scenarioEvents: ScenarioEvent[]
  semanticEntities: SemanticEntity[]
  branchEvents: BranchEvent[]
  representationMappings: RepresentationMapping[]
  workEpisodes: WorkEpisode[]
}

export function branchPath(data: StageData, branchId: string): string[] {
  const parent = new Map(data.branches.map((branch) => [branch.id, branch.parentId]))
  const path: string[] = []
  const seen = new Set<string>()
  let current: string | null | undefined = branchId
  while (current) {
    if (seen.has(current)) break
    seen.add(current)
    path.push(current)
    current = parent.get(current)
  }
  return path.reverse()
}

export function branchEventsFor(data: StageData, branchId: string): BranchEvent[] {
  const path = branchPath(data, branchId)
  const depth = new Map(path.map((id, index) => [id, index]))
  const scenarioOrder = new Map(data.scenarioEvents.map((event) => [event.id, event.order]))
  return data.branchEvents
    .filter((event) => path.includes(event.branchScope))
    .sort((a, b) => {
      const ao = scenarioOrder.get(a.triggeredBy[0]) ?? 999
      const bo = scenarioOrder.get(b.triggeredBy[0]) ?? 999
      if (ao !== bo) return ao - bo
      const ad = depth.get(a.branchScope) ?? 999
      const bd = depth.get(b.branchScope) ?? 999
      if (ad !== bd) return ad - bd
      return a.sequenceWithinTrigger - b.sequenceWithinTrigger
    })
}

export function responsesFor(
  data: StageData,
  branchId: string,
  scenarioEventId: string,
): BranchEvent[] {
  return branchEventsFor(data, branchId).filter((event) => event.triggeredBy.includes(scenarioEventId))
}

export function operationCount(data: StageData, branchId: string): number {
  return branchEventsFor(data, branchId).reduce((sum, event) => sum + event.operations.length, 0)
}

export function operationBreakdown(data: StageData, branchId: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const event of branchEventsFor(data, branchId)) {
    for (const op of event.operations) result[op.type] = (result[op.type] ?? 0) + 1
  }
  return result
}

export function mappingsForEntity(data: StageData, branchId: string, entityId: string) {
  const path = branchPath(data, branchId)
  return data.representationMappings.filter(
    (mapping) => path.includes(mapping.branchScope) && mapping.semanticEntityId === entityId,
  )
}

export function branchEntityEvents(data: StageData, branchId: string, entityId: string) {
  return branchEventsFor(data, branchId).filter((event) =>
    event.relations.some((relation) => relation.entityId === entityId) ||
    event.mutations.some((mutation) => mutation.targetId === entityId),
  )
}

export function scenarioEntityEvents(data: StageData, entityId: string) {
  return data.scenarioEvents.filter((event) =>
    event.relations?.some((relation) => relation.entityId === entityId || relation.targetId === entityId) ||
    event.semanticMutations?.some((mutation) => mutation.targetId === entityId),
  )
}

export function effectiveMappingKeys(data: StageData, branchId: string, entityId: string): string[] {
  const eventsByOrder = new Map(data.scenarioEvents.map((event) => [event.id, event.order]))
  return mappingsForEntity(data, branchId, entityId)
    .sort((a, b) => (eventsByOrder.get(a.effectiveAfter) ?? 0) - (eventsByOrder.get(b.effectiveAfter) ?? 0))
    .map((mapping) => `${mapping.representationKey} · ${mapping.mappingRole}`)
}
