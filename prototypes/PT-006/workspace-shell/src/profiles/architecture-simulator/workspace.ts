import { createWorkspaceModel } from '../../shell/workspace.ts'
import type { Workspace, ContentDescriptor } from '../../shell/workspace.ts'
export type { Rect, Panel, Screen, Workspace, ContentDescriptor } from '../../shell/workspace.ts'
export type ContentKind = 'events' | 'plan' | 'requirements' | 'architecture' | 'impact' | 'implementation' | 'fitness' | 'work' | 'scenario' | 'current' | 'architecturePlan' | 'forecasts' | 'axes' | 'hotpaths' | 'explorer' | 'comparison' | 'trace' | 'impactHistory'



export const CONTENT: ContentDescriptor[] = [
  { id: 'events', label: 'Actual Events', caption: 'Факты и события по ветке, дни внутри ленты', icon: '◷', minWidth: 310, minHeight: 400, maxPerScreen: 1, accent: '#ed9259' },
  { id: 'plan', label: 'Plan', caption: 'PlanRevision · BASE · IF Steps · прогнозы', icon: '⑂', minWidth: 365, minHeight: 425, maxPerScreen: 1, accent: '#79acfc' },
  { id: 'requirements', label: 'Requirement Model', caption: 'Ненормализованные фактически известные требования', icon: '▤', minWidth: 340, minHeight: 330, maxPerScreen: 1, accent: '#55c4ad' },
  { id: 'architecture', label: 'Architecture', caption: 'CURRENT / плановые полные целевые снимки', icon: '◇', minWidth: 390, minHeight: 350, maxPerScreen: null, accent: '#b5a1ff' },
  { id: 'impact', label: 'Evolution Impact', caption: 'По выбранному Step, условной ветке и файлам', icon: '↗', minWidth: 330, minHeight: 345, maxPerScreen: null, accent: '#f4bd67' },
  { id: 'implementation', label: 'Implementation / Files', caption: 'Фактическое дерево файлов и плановые эффекты', icon: '⌘', minWidth: 350, minHeight: 350, maxPerScreen: null, accent: '#82cbf7' },
  { id: 'fitness', label: 'Evolution Fitness', caption: 'Контекстная оценка, миграции, классы затрат', icon: '▥', minWidth: 340, minHeight: 340, maxPerScreen: null, accent: '#e9af8c' },
  { id: 'work', label: 'Work Dynamics / Hot Paths', caption: 'Фактическая работа и наблюдаемые зоны изменений', icon: '↻', minWidth: 325, minHeight: 315, maxPerScreen: null, accent: '#ed92ad' },
  { id: 'scenario', label: 'Scenario / Context', caption: 'Общий исходный контекст и сценарные якоря', icon: '◉', minWidth: 330, minHeight: 300, maxPerScreen: 1, accent: '#83aedc' },
  { id: 'current', label: 'Current State', caption: 'Фактический срез: требования, архитектура, файлы', icon: '▣', minWidth: 370, minHeight: 370, maxPerScreen: 1, accent: '#5dba9e' },
  { id: 'architecturePlan', label: 'Architecture Planning', caption: 'Полный целевой снимок по Evolution Step', icon: '⌁', minWidth: 420, minHeight: 370, maxPerScreen: 1, accent: '#998af0' },
  { id: 'forecasts', label: 'Forecasts / Deadlines', caption: 'Ожидаемые события и требования, сроки, IF-маршруты', icon: '◴', minWidth: 355, minHeight: 375, maxPerScreen: 1, accent: '#d89e54' },
  { id: 'axes', label: 'Planned Change Axes', caption: 'Прогнозные направления изменений, отдельно от фактов', icon: '⇢', minWidth: 320, minHeight: 330, maxPerScreen: 1, accent: '#8ab1e9' },
  { id: 'hotpaths', label: 'Actual Hot Paths', caption: 'Наблюдавшиеся повторные изменения, без будущих прогнозов', icon: '↯', minWidth: 315, minHeight: 300, maxPerScreen: 1, accent: '#e8a184' },
  { id: 'explorer', label: 'Event / Entity Explorer', caption: 'Переход от фактического события к связанным объектам', icon: '◎', minWidth: 370, minHeight: 355, maxPerScreen: 1, accent: '#61afa4' },
  { id: 'comparison', label: 'Cross-Architecture Comparison', caption: 'Общие стимулы и объяснённые последствия A/B', icon: '⇄', minWidth: 420, minHeight: 380, maxPerScreen: 1, accent: '#77a9d5' },
  { id: 'trace', label: 'Requirement / Implementation Trace', caption: 'Связи потребностей с архитектурой и файлами', icon: '⌘', minWidth: 410, minHeight: 360, maxPerScreen: 1, accent: '#a48cce' },
  { id: 'impactHistory', label: 'Impact History / Future', caption: 'Фактические изменения CURRENT и плановые влияния по цели', icon: '↶', minWidth: 390, minHeight: 350, maxPerScreen: 1, accent: '#d1a76f' },
]
export const INITIAL_WORKSPACE: Workspace = {
  version: 3, activeScreenId: 'screen-1', screens: [
    { id: 'screen-1', title: 'Обзор', panels: [
      { id: 'panel-1', rect: { x: 22, y: 28, w: 350, h: 745 }, tabs: ['plan'], active: 'plan' },
      { id: 'panel-2', rect: { x: 388, y: 28, w: 510, h: 355 }, tabs: ['requirements', 'architecture'], active: 'requirements' },
      { id: 'panel-3', rect: { x: 914, y: 28, w: 330, h: 745 }, tabs: ['events'], active: 'events' },
      { id: 'panel-4', rect: { x: 388, y: 399, w: 510, h: 350 }, tabs: ['fitness', 'impact'], active: 'fitness' },
    ]},
    { id: 'screen-2', title: 'Разбор изменений', panels: [
      { id: 'panel-5', rect: { x: 24, y: 28, w: 565, h: 480 }, tabs: ['architecture', 'implementation'], active: 'architecture' },
      { id: 'panel-6', rect: { x: 605, y: 28, w: 580, h: 480 }, tabs: ['impact', 'work'], active: 'impact' },
    ]},
    { id: 'screen-3', title: 'Факты и связи', panels: [
      { id: 'panel-7', rect: { x: 20, y: 26, w: 400, h: 615 }, tabs: ['current', 'scenario'], active: 'current' },
      { id: 'panel-8', rect: { x: 436, y: 26, w: 415, h: 615 }, tabs: ['explorer', 'comparison'], active: 'explorer' },
      { id: 'panel-9', rect: { x: 868, y: 26, w: 405, h: 615 }, tabs: ['trace', 'hotpaths'], active: 'trace' },
    ]},
    { id: 'screen-4', title: 'План и прогнозы', panels: [
      { id: 'panel-10', rect: { x: 20, y: 26, w: 430, h: 630 }, tabs: ['architecturePlan'], active: 'architecturePlan' },
      { id: 'panel-11', rect: { x: 466, y: 26, w: 412, h: 630 }, tabs: ['forecasts', 'axes'], active: 'forecasts' },
      { id: 'panel-12', rect: { x: 895, y: 26, w: 380, h: 630 }, tabs: ['impactHistory'], active: 'impactHistory' },
    ]},
  ],
}

export const {currentScreen,countContent,canAddContent,addScreen,removeScreen,activateScreen,renameScreen,addPanel,removePanel,addContent,removeContent,activateContent,changeRect,swapPanels,findFreeFitRect,undersized,validateWorkspace,getDescriptor} = createWorkspaceModel(CONTENT)
/** Old generic demo tabs are not simulation facts; preserve geometry, clear tab placements. */
export function migrateLegacyWorkspace(raw: unknown): Workspace | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  if (![1, 2].includes(source.version as number) || !Array.isArray(source.screens)) return null
  try {
    const migrated = structuredClone(raw) as Workspace
    migrated.version = 3
    for (const screen of migrated.screens) {
      for (const panel of screen.panels) {
        panel.tabs = []
        panel.active = null
      }
    }
    return validateWorkspace(migrated) ? migrated : null
  } catch { return null }
}
