import type { ContentKind } from './workspace.ts'
import { seedExtra, EXTRA_SCHEMAS } from './extraContent.ts'
import type { SupplementalStore } from './extraContent.ts'
import { createFixtureHistory, historySchema, factualValue } from './history.ts'
import type { HistoryStore } from './history.ts'
import { applyFixtureMaterial, PLAN_MATERIAL_SCHEMAS, WORK_MATERIAL_SCHEMAS } from './material.ts'
import type { PlanMaterial, WorkMaterial } from './material.ts'

// All shapes below are illustrative scripted-fixture state, not an event interpreter.
export type Branch = 'A' | 'B'
export type EventRow = { id: string; day: string; label: string; kind: 'external' | 'work' | 'planning' | 'outcome'; provenance: string; note: string }
export type Requirement = { id: string; title: string; knownFrom: string; source: string; description: string }
export type Responsibility = { id: string; name: string; concern: string }
export type PlannedStep = { id: string; title: string; date: string; route: string; condition: string; targetSnapshotRef: string; impactRef: string; implementationEffect: string }
export type ContentStore = SupplementalStore & {
  events: { records: EventRow[]; selectedId: string | null }
  requirements: { items: Requirement[]; screens: { id: string; title: string; route: string }[]; apiEndpoints: { id: string; method: string; path: string }[] }
  architecture: { currentRef: string; selectedRef: string; selectedContext?: 'actual' | 'planned'; snapshots: { id: string; title: string; responsibilities: Responsibility[]; connections: { from: string; to: string }[] }[] }
  plan: PlanMaterial & { revision: string; basedOnActualEventRef: string; selectedStepId: string; steps: PlannedStep[]; anticipatedEvents: { id: string; date: string; title: string; consequence: string; predictedRequirement?: { id: string; title: string; description: string; evidence: string } }[]; changeAxes: { id: string; direction: string; horizon: string; salience?: string; basis?: string }[]; deadline: { title: string; date: string; id?: string; kind?: string; source?: string; reason?: string; previousDate?: string } }
  impact: { selectedImpactId: string; records: { id: string; stepId: string; route: string; targetRefs: string[]; filePaths: string[]; reason: string }[] }
  implementation: { files: { path: string; responsibility: string; status: string }[]; plannedEffects: { stepId: string; path: string; effect: string }[] }
  fitness: { assessments: { id: string; route: string; question: string; migration: string; planAlignment: string; costClasses: { migration: string; coordination: string; rework: string }; evidence: string[]; goalRef?: string; stateContext?: string }[] }
  work: WorkMaterial & { episodes: { id: string; goal: string; day: string; activities: string[]; evidence: string }[]; actualHotPaths: { path: string; touches: number; note: string }[] }
}
export type DemoStore = ContentStore & { history: HistoryStore; viewContext?: { navigationEvents?: EventRow[]; plannedSnapshots?: ContentStore['architecture']['snapshots']; factualLatest?: boolean } }
const shared: EventRow = { id: 'EXT-01', day: '01 апр', label: 'Общий сигнал о возможном контракте', kind: 'external', provenance: 'Shared scenario · одинаковый внешний стимул', note: 'Это реальный внешний сигнал; заключение контракта — отдельный исход.' }
function createBranch(branch: Branch, material = false): DemoStore {
  const a = branch === 'A'
  const current = a ? 'A-CURRENT' : 'B-CURRENT'
  const after = a ? 'A-ENTERPRISE' : 'B-ENTERPRISE'
  const seed: ContentStore = {
    ...seedExtra(branch),
    events: {
      selectedId: a ? 'A-04' : 'B-04',
      records: [
        { id: a ? 'A-01' : 'B-01', day: '12 мар', label: 'Зафиксировано исходное состояние приложения', kind: 'work', provenance: 'Fixture baseline', note: 'Исходный актуальный срез архитектуры и файлов.' },
        { id: a ? 'A-02' : 'B-02', day: '20 мар', label: a ? 'Выделен контракт API' : 'Реализация продолжается в общем модуле', kind: 'work', provenance: a ? 'Архитектура A → локальное изменение' : 'Архитектура B → связанная реализация', note: 'Вымышленное событие работ для сравнения.' },
        shared,
        { id: a ? 'A-04' : 'B-04', day: '05 апр', label: a ? 'Контракт подписан; раскрыты требования онбординга' : 'Контракт отложен; начато перепланирование', kind: 'outcome', provenance: a ? 'Готовность A → контракт → новая потребность' : 'Задержка B → контракт недоступен', note: 'Причинная ветвь иллюстративного подготовленного сценария.' },
      ],
    },
    requirements: {
      items: [
        { id: 'R-01', title: 'Бронирование через веб', knownFrom: a ? 'A-01' : 'B-01', source: 'Исходное общее требование', description: 'Пользователь оформляет и отменяет бронь.' },
        { id: 'R-02', title: 'Аудит отмен', knownFrom: a ? 'A-01' : 'B-01', source: 'Общий запрос заказчика', description: 'Сохранять след операции. Не требуется нормализация по экранам.' },
        ...(a ? [{ id: 'R-A3', title: 'Онбординг корпоративных клиентов', knownFrom: 'A-04', source: 'Последствие заключённого контракта A', description: 'Новая веточно-локальная фактически известная потребность.' }] : []),
      ],
      screens: [{ id: 'screen-booking', title: 'Форма бронирования', route: '/book' }],
      apiEndpoints: [], // Возможный тип существует в JSON Schema; фактических объектов пока нет.
    },
    architecture: {
      currentRef: current,
      selectedRef: current,
      snapshots: [
        { id: current, title: a ? 'CURRENT · Модульный контур' : 'CURRENT · Объединённый контур', responsibilities: a ? [
          { id: 'UI', name: 'Booking UI', concern: 'Пользовательские сценарии' }, { id: 'API', name: 'Booking API', concern: 'Контракт и правила' }, { id: 'DATA', name: 'Persistence', concern: 'Доступ к данным' },
        ] : [
          { id: 'ALL', name: 'App Core', concern: 'UI + правила + доступ к данным' }, { id: 'DATA', name: 'Storage', concern: 'Данные' },
        ], connections: a ? [{ from: 'UI', to: 'API' }, { from: 'API', to: 'DATA' }] : [{ from: 'ALL', to: 'DATA' }] },
        { id: after, title: 'Цель Step · корпоративный маршрут (план, не факт)', responsibilities: a ? [
          { id: 'UI', name: 'Booking UI', concern: 'Форма' }, { id: 'API', name: 'Booking API', concern: 'Правила' }, { id: 'ENT', name: 'Enterprise Onboarding', concern: 'Корпоративный онбординг' }, { id: 'DATA', name: 'Persistence', concern: 'Данные' },
        ] : [
          { id: 'ALL', name: 'App Core', concern: 'Существующие сценарии' }, { id: 'ENT', name: 'Enterprise Adapter', concern: 'Выделяемые функции' }, { id: 'DATA', name: 'Storage', concern: 'Данные' },
        ], connections: a ? [{ from: 'UI', to: 'API' }, { from: 'API', to: 'ENT' }, { from: 'ENT', to: 'DATA' }] : [{ from: 'ALL', to: 'ENT' }, { from: 'ENT', to: 'DATA' }] },
      ],
    },
    plan: {
      revision: a ? 'PLAN-A-R2' : 'PLAN-B-R2',
      basedOnActualEventRef: a ? 'A-04' : 'B-04',
      selectedStepId: 'S2',
      steps: [
        { id: 'S1', title: 'Стабилизировать бронирование', date: '22 мар', route: 'BASE', condition: 'Без условия', targetSnapshotRef: current, impactRef: 'I1', implementationEffect: 'Обновить проверки и обработку отмен в файлах' },
        { id: 'S2', title: 'Корпоративный маршрут', date: '10 апр', route: 'IF CONTRACT', condition: 'IF фактически заключён контракт', targetSnapshotRef: after, impactRef: 'I2', implementationEffect: 'Добавить обработчики и файлы онбординга' },
        { id: 'S3', title: 'Резервный маршрут', date: '12 апр', route: 'ELSE', condition: 'IF контракт не заключён', targetSnapshotRef: current, impactRef: 'I3', implementationEffect: 'Упростить интеграционный слой; архитектурный снимок переиспользован' },
      ],
      anticipatedEvents: [{ id: 'F2', date: a ? '20 апр' : '25 апр', title: a ? 'Рост корпоративных подключений' : 'Повторное обсуждение контракта', consequence: a ? 'Прогноз нагрузки после подписания; ещё не фактические подключения' : 'Контракт отложен; новая дата остаётся прогнозом' }],
      changeAxes: [{ id: 'AX1', direction: 'Частые изменения интеграционных правил', horizon: 'апрель–май' }],
      deadline: { title: 'Первый корпоративный релиз', date: a ? '30 апр' : '15 мая' },
    },
    impact: {
      selectedImpactId: 'I2',
      records: [
        { id: 'I1', stepId: 'S1', route: 'BASE', targetRefs: a ? ['API'] : ['ALL'], filePaths: a ? ['src/api/booking.ts'] : ['src/app.ts'], reason: 'Правила отмен без обязательной перестройки архитектуры' },
        { id: 'I2', stepId: 'S2', route: 'IF CONTRACT', targetRefs: a ? ['ENT', 'API'] : ['ALL', 'ENT', 'DATA'], filePaths: a ? ['src/enterprise/onboarding.ts'] : ['src/app.ts', 'src/enterprise/adapter.ts'], reason: a ? 'Локальный новый модуль' : 'Переход через общий модуль и миграцию зависимостей' },
        { id: 'I3', stepId: 'S3', route: 'ELSE', targetRefs: a ? ['API'] : ['ALL'], filePaths: a ? ['src/api/booking.ts'] : ['src/app.ts'], reason: 'Отдельная условная ветка, не суммируется с S2' },
      ],
    },
    implementation: {
      files: a ? [
        { path: 'src/ui/booking.tsx', responsibility: 'UI', status: 'current' }, { path: 'src/api/booking.ts', responsibility: 'API', status: 'current' }, { path: 'src/data/repo.ts', responsibility: 'DATA', status: 'current' },
      ] : [
        { path: 'src/app.ts', responsibility: 'ALL', status: 'current' }, { path: 'src/storage.ts', responsibility: 'DATA', status: 'current' },
      ],
      plannedEffects: [
        { stepId: 'S2', path: a ? 'src/enterprise/onboarding.ts' : 'src/enterprise/adapter.ts', effect: 'CREATE · только план' },
        { stepId: 'S3', path: a ? 'src/api/booking.ts' : 'src/app.ts', effect: 'MODIFY · альтернативный план' },
      ],
    },
    fitness: { assessments: [
      { id: 'FIT-S2', route: 'IF CONTRACT', question: 'Насколько выбранная архитектура подготовлена к корпоративному изменению?', migration: a ? 'Ограниченное расширение' : 'Нужна миграция связанностей', planAlignment: a ? 'Согласуется с подготовленным шагом' : 'Требует пересмотра последовательности работ', costClasses: { migration: a ? 'умеренная' : 'существенная', coordination: a ? 'локальная' : 'несколько зон', rework: a ? 'низкая' : 'повышенная' }, evidence: [a ? 'Новое поведение вынесено отдельно' : 'Затронут общий модуль', 'Файловая проекция Step S2', 'Условие IF CONTRACT — не фактическое исполнение'] },
    ] },
    work: {
      episodes: [
        { id: 'W1', goal: 'Подготовка бронирования', day: '20 мар', activities: ['реализация', 'проверка'], evidence: a ? 'API локализован' : 'Правила и экран делят общий модуль' },
        { id: 'W2', goal: 'Корпоративная интеграция', day: '05 апр', activities: a ? ['контракт', 'уточнение требований'] : ['координация', 'перепланирование'], evidence: a ? 'Новый спрос после контракта' : 'Работы откладываются из-за готовности' },
      ],
      actualHotPaths: [{ path: a ? 'src/api/booking.ts' : 'src/app.ts', touches: a ? 2 : 4, note: 'Наблюдавшиеся изменения; не тождественны Planned Change Axis' }],
    },
  }
  if (material) {
    if (!a) {
      seed.events.records.push({ id: 'B-05', day: '16 мая', label: 'Корпоративный релиз не завершён к обещанному сроку', kind: 'outcome', provenance: 'Связанность B → дополнительная проверка → фактическая просрочка', note: 'Авторский факт после 15 мая; оценка 18 мая не меняла обязательство' })
      seed.events.selectedId = 'B-05'
      seed.work.episodes.push({ id: 'W3', goal: 'Проверка готовности корпоративного релиза', day: '16 мая', activities: ['проверка', 'фиксация просрочки'], evidence: 'B-05: релиз не завершён к 15 мая' })
    }
    applyFixtureMaterial(seed, branch)
  }
  return { ...seed, history: createFixtureHistory(seed, branch) }
}
export const initialData = createBranch('A', true)
export const initialDataB = createBranch('B', true)
/** Requirement knowledge at a branch-local factual event selection (fixture only). */
export function knownRequirements(data: DemoStore): Requirement[] {
  const ids = data.events.records.map(event => event.id)
  const index = data.viewContext?.factualLatest || data.events.selectedId === null ? ids.length - 1 : ids.indexOf(data.events.selectedId)
  return data.requirements.items.filter(item => ids.indexOf(item.knownFrom) !== -1 &&
    ids.indexOf(item.knownFrom) <= index)
}
export type SchemaNode = { type?: string | string[]; properties?: Record<string, SchemaNode>; items?: SchemaNode; required?: string[]; enum?: string[]; additionalProperties?: boolean; description?: string }
const str = (): SchemaNode => ({ type: 'string' })
const obj = (properties: Record<string, SchemaNode>, required: string[] = []): SchemaNode => ({ type: 'object', properties, required })
const array = (item: SchemaNode): SchemaNode => ({ type: 'array', items: item })
const event = obj({ id: str(), day: str(), label: str(), kind: { type: 'string', enum: ['external', 'work', 'planning', 'outcome'] }, provenance: str(), note: str() }, ['id', 'day', 'label', 'kind', 'provenance', 'note'])
const requirementsItem = obj({ id: str(), title: str(), knownFrom: str(), source: str(), description: str() }, ['id', 'title', 'knownFrom', 'source', 'description'])
const responsibility = obj({ id: str(), name: str(), concern: str() }, ['id', 'name', 'concern'])
export const SCHEMAS: Record<ContentKind, SchemaNode> = {
  ...EXTRA_SCHEMAS,
  events: obj({ records: array(event), selectedId: { type: ['string', 'null'] } }, ['records', 'selectedId']),
  requirements: obj({ items: array(requirementsItem), screens: array(obj({ id: str(), title: str(), route: str() }, ['id','title','route'])), apiEndpoints: array(obj({ id: str(), method: str(), path: str() }, ['id','method','path'])) }, ['items','screens','apiEndpoints']),
  architecture: obj({ currentRef: str(), selectedRef: str(), selectedContext: { type: 'string', enum: ['actual','planned'] }, snapshots: array(obj({ id: str(), title: str(), responsibilities: array(responsibility), connections: array(obj({ from: str(), to: str() }, ['from','to'])) }, ['id','title','responsibilities','connections'])) }, ['currentRef','selectedRef','snapshots']),
  plan: obj({ ...PLAN_MATERIAL_SCHEMAS, revision: str(), basedOnActualEventRef: str(), selectedStepId: str(), steps: array(obj({ id: str(), title: str(), date: str(), route: str(), condition: str(), targetSnapshotRef: str(), impactRef: str(), implementationEffect: str() }, ['id','title','date','route','condition','targetSnapshotRef','impactRef','implementationEffect'])), anticipatedEvents: array(obj({ id: str(), date: str(), title: str(), consequence: str(), predictedRequirement: obj({ id: str(), title: str(), description: str(), evidence: str() }, ['id','title','description','evidence']) }, ['id','date','title','consequence'])), changeAxes: array(obj({ id: str(), direction: str(), horizon: str(), salience: str(), basis: str() }, ['id','direction','horizon'])), deadline: obj({ title: str(), date: str(), id: str(), kind: str(), source: str(), reason: str(), previousDate: str() }, ['title','date']) }, ['revision','basedOnActualEventRef','steps','selectedStepId','anticipatedEvents','changeAxes','deadline']),
  impact: obj({ selectedImpactId: str(), records: array(obj({ id: str(), stepId: str(), route: str(), targetRefs: array(str()), filePaths: array(str()), reason: str() }, ['id','stepId','route','targetRefs','filePaths','reason'])) }, ['selectedImpactId','records']),
  implementation: obj({ files: array(obj({ path: str(), responsibility: str(), status: str() }, ['path','responsibility','status'])), plannedEffects: array(obj({ stepId: str(), path: str(), effect: str() }, ['stepId','path','effect'])) }, ['files','plannedEffects']),
  fitness: obj({ assessments: array(obj({ id: str(), route: str(), question: str(), goalRef: str(), stateContext: str(), migration: str(), planAlignment: str(), costClasses: obj({ migration: str(), coordination: str(), rework: str() }, ['migration','coordination','rework']), evidence: array(str()) }, ['id','route','question','migration','planAlignment','costClasses','evidence'])) }, ['assessments']),
  work: obj({ ...WORK_MATERIAL_SCHEMAS, episodes: array(obj({ id: str(), goal: str(), day: str(), activities: array(str()), evidence: str() }, ['id','goal','day','activities','evidence'])), actualHotPaths: array(obj({ path: str(), touches: { type: 'integer' }, note: str() }, ['path','touches','note'])) }, ['episodes','actualHotPaths']),
}
export const HISTORY_SCHEMA = historySchema(SCHEMAS)
export function matchesSchema(value: unknown, schema: SchemaNode): boolean {
  const variants = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type]
  const allowed = (kind: string) => {
    if (kind === 'null') return value === null
    if (kind === 'array') return Array.isArray(value)
    if (kind === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
    if (kind === 'integer') return typeof value === 'number' && Number.isInteger(value)
    return typeof value === kind
  }
  if (variants.length && !variants.some(allowed)) return false
  if (schema.enum && !schema.enum.includes(value as string)) return false
  if (Array.isArray(value) && schema.items) return value.every(v => matchesSchema(v, schema.items!))
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const fields = value as Record<string, unknown>
    if (schema.required?.some(field => !(field in fields))) return false
    for (const [name, field] of Object.entries(fields)) {
      const child = schema.properties?.[name]
      if (child && !matchesSchema(field, child)) return false
      if (!child && schema.additionalProperties === false) return false
    }
  }
  return true
}
export function validateDemo(value: unknown): value is DemoStore {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const state = value as Record<string, unknown>
  return Object.entries(SCHEMAS).every(([kind, schema]) => matchesSchema(state[kind], schema)) && validateHistory(state.history)
}
function validateHistory(value: unknown): value is HistoryStore {
  if (!matchesSchema(value, HISTORY_SCHEMA)) return false
  const history = value as HistoryStore
  if (history.version !== 1 || history.frames.length === 0) return false
  if (new Set(history.frames.map(f => f.eventId)).size !== history.frames.length || new Set(history.revisions.map(r => r.id)).size !== history.revisions.length) return false
  if (history.frames.some((f, i) => !/^\d{4}-\d{2}-\d{2}$/.test(f.date) || (i > 0 && f.date < history.frames[i - 1].date) || f.state.events.records.at(-1)?.id !== f.eventId)) return false
  if (history.revisions.some((r, i) => r.id !== r.plan.revision || r.parentId !== (history.revisions[i - 1]?.id ?? null) || r.base.eventId !== r.plan.basedOnActualEventRef || !history.frames.some(f => f.eventId === r.eventId) || !history.frames.some(f => f.eventId === r.base.eventId) || r.plan.steps.some(s => !r.snapshots.some(a => a.id === s.targetSnapshotRef) || !r.impacts.some(impact => impact.id === s.impactRef && impact.stepId === s.id)))) return false
  return history.selectedRevisionId === null || history.revisions.some(r => r.id === history.selectedRevisionId)
}
/** Direct manual edits to example content State, independent of Workspace. */
export function replaceContentState<K extends ContentKind>(state: DemoStore, kind: K, value: unknown): DemoStore | null {
  if (!matchesSchema(value, SCHEMAS[kind])) return null
  const copy = structuredClone(state)
  Object.assign(copy, { [kind]: structuredClone(value) })
  return validateDemo(copy) ? copy : null
}
/**
 * Upgrades only previous simulator fixtures with all eight original content slices.
 * Old generic UI demos must never become fictional factual simulator records.
 * Missing new view states are seeded; existing scenario facts are preserved.
 */
export function migrateLegacyDemo(raw: unknown, seed: DemoStore = initialData): DemoStore | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const source = raw as Record<string, unknown>
  const previousKeys = ['events','plan','requirements','architecture','impact','implementation','fitness','work'] as const
  if (!previousKeys.every(key => matchesSchema(source[key], SCHEMAS[key]))) return null
  const branch = seed.events.records[0].id.startsWith('A-') ? 'A' : 'B'
  const legacy = createBranch(branch)
  const v4 = structuredClone(legacy)
  v4.plan.revision = branch === 'A' ? 'PLAN-A-R1' : 'PLAN-B-R2'
  v4.plan.basedOnActualEventRef = branch === 'A' ? 'A-02' : 'B-04'
  v4.plan.anticipatedEvents = [{ id: 'F1', date: '01 апр', title: 'Возможен корпоративный контракт', consequence: 'Прогноз: конкретная потребность в онбординге, но ещё не факт' }]
  v4.plan.deadline.date = '30 апр'
  const sameFacts = (reference: DemoStore) => previousKeys.every(key => JSON.stringify(factualValue(source as ContentStore, key)) === JSON.stringify(factualValue(reference, key))) &&
    (['scenario','trace'] as const).every(key => !source[key] || (matchesSchema(source[key], SCHEMAS[key]) && JSON.stringify(factualValue(source as ContentStore, key)) === JSON.stringify(factualValue(reference, key))))
  const existingHistory = validateHistory(source.history) ? structuredClone(source.history) : null
  const historyUntouched = !existingHistory || JSON.stringify({ ...existingHistory, selectedRevisionId: null }) === JSON.stringify(legacy.history)
  const updateFixture = historyUntouched && (sameFacts(legacy) || sameFacts(v4))
  const result = structuredClone(seed)
  if (!updateFixture) {
    for (const key of previousKeys) Object.assign(result, { [key]: structuredClone(source[key]) })
    for (const key of Object.keys(EXTRA_SCHEMAS) as (keyof SupplementalStore)[]) {
      if (matchesSchema(source[key], EXTRA_SCHEMAS[key])) Object.assign(result, { [key]: structuredClone(source[key]) })
    }
    if (existingHistory) result.history = existingHistory
    result.history.imported = result.history.imported || !sameFacts(legacy)
  } else {
    // Preserve UI choices, while replacing only an unchanged authored fixture.
    for (const key of Object.keys(SCHEMAS) as ContentKind[]) {
      const value = source[key]
      if (!value || typeof value !== 'object' || Array.isArray(value) || !matchesSchema(value, SCHEMAS[key])) continue
      const choices = Object.fromEntries(Object.entries(value).filter(([name]) => name.startsWith('selected') || name.startsWith('show')))
      Object.assign(result[key], choices)
    }
    if (existingHistory) result.history.selectedRevisionId = existingHistory.selectedRevisionId
  }
  return validateDemo(result) ? result : null
}

export const nextId = (prefix: string) => prefix + '-' + Math.random().toString(36).slice(2, 8)
