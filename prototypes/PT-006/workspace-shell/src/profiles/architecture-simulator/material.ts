import type { Branch, ContentStore, SchemaNode } from './content.ts'

export type ScenarioContext = { dynamism: string; organization: string; engineeringEnvironment: string; source: string }
export type PlanMaterial = {
  materialVersion?: number
  activities?: { id: string; kind: string; goal: string; date: string; route: string; dependsOn: string[]; input: string; output: string; evidence: string }[]
  completionForecast?: { goal: string; route: string; date: string; basis: string; evidence: string; timeBasis: string }
  routeExpectations?: { route: string; assessment: string; grounds: string; eventRefs: string[] }[]
}
export type WorkMaterial = {
  details?: { id: string; episodeId: string; goalRef: string; affectedAreas: string[]; planningBurden: string; knowledge: string; contracts: string; dependencies: string; compatibility: string; rollout: string; coordination: string; waiting: string; activeWork: string; timeBasis: string; reversibility: string; experimentability: string; feedback: string; teamAutonomy: string; evidence: string[] }[]
  costFacts?: { id: string; episodeId: string; costClass: string; quantity: number | null; unit: string; frequency: 'once' | 'recurring'; source: string; evaluationTimeBasis: string; description: string }[]
  deadlineOutcomes?: { deadlineId: string; title: string; dueDate: string; eventRef: string; outcome: 'met' | 'missed'; evidence: string }[]
}
const str = (): SchemaNode => ({ type: 'string' })
const obj = (properties: Record<string, SchemaNode>): SchemaNode => ({ type: 'object', properties, required: Object.keys(properties) })
const arr = (items: SchemaNode): SchemaNode => ({ type: 'array', items })
export const CONTEXT_SCHEMA = obj({ dynamism: str(), organization: str(), engineeringEnvironment: str(), source: str() })
export const PLAN_MATERIAL_SCHEMAS: Record<string, SchemaNode> = {
  materialVersion: { type: 'integer' },
  activities: arr(obj({ id: str(), kind: str(), goal: str(), date: str(), route: str(), dependsOn: arr(str()), input: str(), output: str(), evidence: str() })),
  completionForecast: obj({ goal: str(), route: str(), date: str(), basis: str(), evidence: str(), timeBasis: str() }),
  routeExpectations: arr(obj({ route: str(), assessment: str(), grounds: str(), eventRefs: arr(str()) })),
}
export const WORK_MATERIAL_SCHEMAS: Record<string, SchemaNode> = {
  details: arr(obj({ id: str(), episodeId: str(), goalRef: str(), affectedAreas: arr(str()), planningBurden: str(), knowledge: str(), contracts: str(), dependencies: str(), compatibility: str(), rollout: str(), coordination: str(), waiting: str(), activeWork: str(), timeBasis: str(), reversibility: str(), experimentability: str(), feedback: str(), teamAutonomy: str(), evidence: arr(str()) })),
  costFacts: arr(obj({ id: str(), episodeId: str(), costClass: str(), quantity: { type: ['number', 'null'] }, unit: str(), frequency: { type: 'string', enum: ['once', 'recurring'] }, source: str(), evaluationTimeBasis: str(), description: str() })),
  deadlineOutcomes: arr(obj({ deadlineId: str(), title: str(), dueDate: str(), eventRef: str(), outcome: { type: 'string', enum: ['met', 'missed'] }, evidence: str() })),
}

/** Authored examples use only knowledge available in the selected frame. */
export function applyFixtureMaterial(state: ContentStore, branch: Branch): void {
  const a = branch === 'A'
  const phase = state.plan.revision.endsWith('R0') ? 0 : state.plan.revision.endsWith('R1') ? 1 : 2
  const eventRef = state.plan.basedOnActualEventRef
  state.scenario.context = {
    dynamism: phase === 0 ? 'Корпоративное направление ещё не определено' : phase === 1 ? 'Интеграционный спрос меняется; договор ещё возможен' : a ? 'Договор уточнил спрос: онбординг и масштабирование' : 'Договор отложен; важнее совместимость и снижение связанности',
    organization: 'Одинаковые небольшие команды продукта, UI/API и данных; различаются границы кода',
    engineeringEnvironment: 'Одинаковые CI и тестовая среда. Условия автономии зависят от контрактов кода',
    source: 'Авторский контекст CASE-BOOKING; не измерение производительности',
  }
  state.plan.materialVersion = 1
  state.plan.activities = phase === 0 ? [{ id: 'PW-VERIFY', kind: 'test-only', goal: 'Проверить отмену и аудит', date: '19 мар', route: 'BASE', dependsOn: [], input: 'R-01 / R-02, исходные файлы', output: 'Отчёт о проверке; код не изменяется', evidence: 'Плановая проверка, не Evolution Step' }] : [
    { id: 'PW-TALK', kind: 'negotiation', goal: 'Уточнить корпоративный контракт', date: phase === 1 ? '01 апр' : a ? '06 апр' : '25 апр', route: 'IF CONTRACT', dependsOn: [], input: 'Запрос заказчика и текущая готовность', output: 'Решение и границы обязательства', evidence: 'Плановое намерение; Actual Event хранится отдельно' },
    { id: 'PW-VERIFY', kind: 'test-only', goal: 'Проверить совместимость и отмену', date: phase === 1 ? '28 апр' : a ? '27 апр' : '13 мая', route: 'IF CONTRACT', dependsOn: ['S2'], input: 'Результат S2 и контракт', output: 'Отчёт; проверка не меняет реализацию', evidence: 'Авторская плановая проверка' },
    { id: 'PW-WAIT', kind: 'waiting', goal: 'Дождаться обратной связи', date: 'после PW-TALK', route: 'IF CONTRACT', dependsOn: ['PW-TALK'], input: 'Переданное предложение', output: 'Ответ заказчика', evidence: 'Внешнее ожидание отдельно от активного времени' },
    { id: 'PW-COORD', kind: 'coordination', goal: 'Согласовать резервный выпуск', date: 'после решения о контракте', route: 'ELSE', dependsOn: [], input: 'R-01 / R-02', output: 'Границы резервной проверки', evidence: 'Координация без обязательного изменения кода' },
  ]
  state.plan.routeExpectations = phase === 0 ? [{ route: 'BASE', assessment: 'Подготовлен исходный маршрут', grounds: 'Известны начальные запросы', eventRefs: [eventRef] }] : [
    { route: 'IF CONTRACT', assessment: phase === 1 ? 'Возможен, исход неизвестен' : a ? 'Условие подтверждено; Step ещё не исполнен' : 'Менее вероятен на текущем горизонте', grounds: phase === 1 ? 'Предварительное обсуждение без подписанного договора' : a ? 'A-04: договор и конкретные запросы' : 'B-04: недостаточная готовность, договор отложен', eventRefs: [eventRef] },
    { route: 'ELSE', assessment: phase === 1 ? 'Подготовлен как резерв' : a ? 'Резерв при смене обстоятельств' : 'Предпочтителен на текущем горизонте', grounds: phase === 1 ? 'Исход переговоров неизвестен' : a ? 'Не суммируется с основным маршрутом' : 'Сначала стабилизировать связанную реализацию', eventRefs: [eventRef] },
  ]
  state.plan.completionForecast = { goal: phase === 0 ? 'Первый релиз бронирования' : 'Первый корпоративный релиз', route: phase === 0 ? 'BASE' : 'IF CONTRACT', date: phase === 0 ? '12 апр' : phase === 1 ? '27 апр' : a ? '28 апр' : '18 мая', basis: phase === 2 && !a ? 'Миграция и проверка; оценка выходит за обещанный срок' : 'Условная оценка после реализации и проверки', evidence: eventRef + ' / авторский Plan', timeBasis: 'authored assumption; effort и календарная длительность не измерены' }
  state.plan.deadline = { ...state.plan.deadline, id: phase === 0 ? 'D-BOOKING' : 'D-CORP', kind: 'commitment', source: 'Авторское соглашение случая', reason: phase === 2 && !a ? 'B-04: обещание пересогласовано с 30 апр на 15 мая; отдельно от оценки 18 мая' : 'Смена оценки не меняет обязательство', ...(phase === 2 && !a ? { previousDate: '30 апр' } : {}) }
  if (phase === 1) state.plan.anticipatedEvents[0].predictedRequirement = { id: 'PRED-ONBOARDING', title: 'Онбординг корпоративного клиента', description: 'При договоре потребуется подключение; детали ещё не предъявлены', evidence: 'Предварительное обсуждение; FORECAST / IF CONTRACT' }
  if (phase === 2 && a) state.plan.anticipatedEvents[0].predictedRequirement = { id: 'PRED-BULK', title: 'Массовое подключение корпоративных клиентов', description: 'Возможная потребность при росте подключений; пока не предъявлена', evidence: 'Прогноз после A-04, не фактическое требование' }
  state.plan.changeAxes = phase === 0 ? [] : [{ id: 'AX1', direction: phase === 1 ? 'Изменения интеграционных правил' : a ? 'Рост онбординга и вариативность подключения' : 'Стабилизация контрактов и сокращение связанности', horizon: phase === 1 ? 'апрель' : a ? 'апрель–май' : 'май', salience: phase === 1 ? 'возможная' : 'высокая', basis: eventRef + ': новая информация; прошлый прогноз сохранён' }]
  state.work.details = state.work.episodes.map(ep => ({
    id: 'DETAIL-' + ep.id, episodeId: ep.id, goalRef: ep.id === 'W1' ? 'R-01 / R-02' : a ? 'R-A3' : 'возможный корпоративный контракт', affectedAreas: a ? ['API', 'UI'] : ['ALL', 'DATA'],
    planningBurden: a ? 'Локальный анализ API' : 'Сопоставить UI, правила и хранение', knowledge: 'Требования и файлы этого момента', contracts: a ? 'Граница Booking API' : 'Пересечение UI- и storage-контрактов', dependencies: a ? 'UI → API → DATA' : 'ALL → DATA; несколько связанных зон', compatibility: 'Сохранить отмену и аудит', rollout: 'Проверка старых сценариев в тестовой среде', coordination: a ? 'API согласует контракт с UI' : 'Согласование нескольких зон', waiting: ep.id === 'W1' ? 'Внешнее ожидание не зафиксировано' : a ? 'Ответ на уточнение требований' : 'Готовность и решение заказчика', activeWork: ep.activities.join(', ') + '; время не измерено', timeBasis: 'Авторское событие ' + ep.day + '; длительность неизвестна',
    reversibility: a ? 'Локальный откат при сохранённом API-контракте' : 'Откат затрагивает связанные сценарии', experimentability: a ? 'Изолированная проверка API' : 'Подготовка интеграционной проверки', feedback: 'Проверка и ответ заказчика', teamAutonomy: a ? 'Локальная граница допускает независимую проверку' : 'Независимость ограничена общими контрактами', evidence: [ep.evidence, state.scenario.context!.source],
  }))
  state.work.costFacts = state.work.episodes.flatMap(ep => [
    { id: 'COST-' + ep.id, episodeId: ep.id, costClass: 'active work', quantity: null, unit: 'человеко-дни', frequency: 'once' as const, source: ep.id + ': ' + ep.evidence, evaluationTimeBasis: 'authored / unknown duration', description: 'Работа зафиксирована; численная стоимость неизвестна' },
    { id: 'RECUR-' + ep.id, episodeId: ep.id, costClass: 'coordination', quantity: null, unit: 'согласование изменения', frequency: 'recurring' as const, source: ep.id + ' / контракт', evaluationTimeBasis: 'при затронутом изменении; частота неизвестна', description: a ? 'Повторная проверка API-контракта' : 'Повторное согласование связанных зон; линзы не суммируются как отдельные цены' },
  ])
  state.work.deadlineOutcomes = state.events.records.some(e => e.id === 'B-05') ? [{ deadlineId: 'D-CORP', title: 'Первый корпоративный релиз', dueDate: '15 мая', eventRef: 'B-05', outcome: 'missed', evidence: '16 мая: релиз не завершён к пересогласованному обещанию' }] : []
  state.fitness.assessments = state.fitness.assessments.filter(item => item.id !== 'FIT-S3')
  for (const item of state.fitness.assessments) { item.goalRef = a && phase === 2 ? 'R-A3' : 'PRED-ONBOARDING / условный запрос'; item.stateContext = state.plan.revision + ' / плановый target, не выполненная работа' }
  if (phase > 0) state.fitness.assessments.push({ id: 'FIT-S3', route: 'ELSE', question: 'Сохранить бронирование без корпоративной миграции?', migration: a ? 'Снимок тот же; реализация меняется' : 'Упрощение общего слоя; связанность остаётся', planAlignment: phase === 1 ? 'Подготовленный резерв' : a ? 'Резерв при смене условий' : 'Приоритет стабилизации', costClasses: { migration: 'отдельная оценка резервного пути', coordination: a ? 'локальная' : 'несколько зон', rework: 'не суммируется с IF CONTRACT' }, evidence: ['S3 / I3', eventRef, 'Контракты и проверка старых сценариев'], goalRef: 'R-01 / R-02', stateContext: state.plan.revision + ' / ELSE; авторское допущение' })
}
