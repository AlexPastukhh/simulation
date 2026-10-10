// Independent view/inspection state. Canonical planned facts stay in Plan;
 // actual event facts stay in Actual Events. This is an illustrative fixture.
export type ExtraKind = 'scenario' | 'current' | 'architecturePlan' | 'forecasts' | 'axes' | 'hotpaths' | 'explorer' | 'comparison' | 'trace' | 'impactHistory'
export type SupplementalStore = {
  scenario: {
    caseId: string; appName: string; startingPoint: string; constraints: string[];
    anchors: { id: string; date: string; label: string }[]; selectedAnchorId: string
  }
  current: { selectedSection: 'requirements' | 'architecture' | 'implementation' }
  architecturePlan: { selectedStepId: string; showConnections: boolean }
  forecasts: { selectedForecastId: string; selectedRoute: string }
  axes: { selectedAxisId: string; showRevisions: boolean }
  hotpaths: { selectedPath: string }
  explorer: { selectedEventId: string; selectedEntityRef: string }
  comparison: { selectedAnchorId: string; focus: 'events' | 'requirements' | 'work' }
  trace: { selectedRequirementId: string; links: { requirementId: string; architectureRef: string; filePath: string; note: string }[] }
  impactHistory: { selectedTargetRef: string }
}
export type Schema = {
  type?: string | string[]; properties?: Record<string, Schema>; items?: Schema
  required?: string[]; enum?: string[]; additionalProperties?: boolean; description?: string
}
const str = (): Schema => ({ type: 'string' })
const obj = (props: Record<string, Schema>, required = Object.keys(props)): Schema => ({ type: 'object', properties: props, required })
const arr = (value: Schema): Schema => ({ type: 'array', items: value })
export const EXTRA_SCHEMAS: Record<ExtraKind, Schema> = {
  scenario: obj({ caseId: str(), appName: str(), startingPoint: str(), constraints: arr(str()), anchors: arr(obj({ id: str(), date: str(), label: str() })), selectedAnchorId: str() }),
  current: obj({ selectedSection: { type: 'string', enum: ['requirements','architecture','implementation'] } }),
  architecturePlan: obj({ selectedStepId: str(), showConnections: { type: 'boolean' } }),
  forecasts: obj({ selectedForecastId: str(), selectedRoute: str() }),
  axes: obj({ selectedAxisId: str(), showRevisions: { type: 'boolean' } }),
  hotpaths: obj({ selectedPath: str() }),
  explorer: obj({ selectedEventId: str(), selectedEntityRef: str() }),
  comparison: obj({ selectedAnchorId: str(), focus: { type: 'string', enum: ['events','requirements','work'] } }),
  trace: obj({ selectedRequirementId: str(), links: arr(obj({ requirementId: str(), architectureRef: str(), filePath: str(), note: str() })) }),
  impactHistory: obj({ selectedTargetRef: str() }),
}
export function seedExtra(branch: 'A'|'B'): SupplementalStore {
  const a = branch === 'A'
  return {
    scenario: {
      caseId: 'CASE-BOOKING',
      appName: 'Система онлайн-бронирования',
      startingPoint: 'Одно приложение, общие исходные запросы и ограничения. Архитектуры A/B — альтернативные способы реализации.',
      constraints: ['Одинаковый внешний сигнал о контракте', 'Нельзя задним числом переносить прогнозы в факты', 'Вымышленная причинность и время показаны как авторские предположения'],
      anchors: [{ id: 'EXT-01', date: '01 апр', label: 'Общий внешний сигнал: корпоративный контракт возможен' }],
      selectedAnchorId: 'EXT-01',
    },
    current: { selectedSection: 'architecture' },
    architecturePlan: { selectedStepId: 'S2', showConnections: true },
    forecasts: { selectedForecastId: 'F1', selectedRoute: 'IF CONTRACT' },
    axes: { selectedAxisId: 'AX1', showRevisions: true },
    hotpaths: { selectedPath: a ? 'src/api/booking.ts' : 'src/app.ts' },
    explorer: { selectedEventId: a ? 'A-04' : 'B-04', selectedEntityRef: a ? 'R-A3' : 'R-01' },
    comparison: { selectedAnchorId: 'EXT-01', focus: 'events' },
    trace: {
      selectedRequirementId: 'R-01',
      links: [
        { requirementId: 'R-01', architectureRef: a ? 'API' : 'ALL', filePath: a ? 'src/api/booking.ts' : 'src/app.ts', note: 'Подготовленная связь потребности, ответственности и файла' },
        { requirementId: 'R-02', architectureRef: a ? 'API' : 'ALL', filePath: a ? 'src/api/booking.ts' : 'src/app.ts', note: 'Аудит может покрываться общей или отдельной ответственностью' },
        ...(a ? [{ requirementId: 'R-A3', architectureRef: 'ENT', filePath: 'src/enterprise/onboarding.ts', note: 'Плановая целевая проекция: файла в CURRENT нет' }] : []),
      ],
    },
    impactHistory: { selectedTargetRef: a ? 'API' : 'ALL' },
  }
}

/** Canonical data sources read by each projection. The view's own State
 * stores selection/configuration; source objects remain in their owning model. */
export const EXTRA_SOURCES: Record<ExtraKind, Array<'events'|'plan'|'requirements'|'architecture'|'impact'|'implementation'|'fitness'|'work'>> = {
  scenario: ['events'],
  current: ['events','requirements','architecture','implementation'],
  architecturePlan: ['plan','architecture','impact'],
  forecasts: ['plan'],
  axes: ['plan'],
  hotpaths: ['work'],
  explorer: ['events','requirements'],
  comparison: ['events','requirements','work'],
  trace: ['requirements','architecture','implementation'],
  impactHistory: ['impact','plan'],
}
