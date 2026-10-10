/* PT-005: authored, deterministic semantic fixture. No runtime randomizer or scheduling optimizer. */
export type ArchitectureId = 'policy' | 'handler'
export type Condition = 'contract_signed' | 'contract_lost'
export type DateISO = string
export type StepRef = string
export type Requirement = { id: string; title: string; detail: string; kind: 'known' | 'fact-conditional' }
export type Module = { id: string; name: string; responsibility: string; files: string[] }
export type ArchitectureSnapshot = { id: string; title: string; modules: Module[]; connections: string[] }
export type EvolutionStep = { ref: StepRef; title: string; date: DateISO; kind: 'implementation' | 'refactoring' | 'migration'; target: string; effect: string; files: string[]; plannedWork: string[]; revisedFrom?: StepRef; requirementIds: string[] }
export type PlanRoute = { id: Condition; label: string; condition: string; steps: StepRef[] }
export type ChangeAxis = { name: string; salience: 'high' | 'medium' | 'low'; outlook: string }
export type PlanRevision = { id: string; architecture: ArchitectureId; created: DateISO; baseEventId: string; knowledgeCutoff: DateISO; from?: string; forecastCompletion: DateISO; externalDeadline: DateISO; integrationDeadline: DateISO; expectation: string; axes: ChangeAxis[]; anticipated: { id: string; label: string; effect: string; predictedRequirementId?: string }[]; commonSteps: StepRef[]; routes: PlanRoute[]; otherActivities: string[]; note: string }
export type ActualEvent = { id: string; architecture: ArchitectureId; date: DateISO; label: string; kind: 'baseline' | 'plan' | 'implementation' | 'external' | 'consequence' | 'requirement' | 'agreement'; sharedAnchor?: string; architectureRef: string; codeRef: string; requirementAdded?: string; planCreated?: string; resolved?: Condition; reason?: string }
export type FitnessEvidence = { architecture: ArchitectureId; route: Condition; migration: string; alignment: string; work: string[]; caution: string }
export type ScenarioAnchor = { id: string; date: DateISO; label: string; explanation: string }

export const ARCHITECTURES: Record<ArchitectureId, { label: string; strategy: string; tradeoff: string }> = {
  policy: { label: 'A · Policy boundary', strategy: 'Выделить правила в самостоятельную границу заранее', tradeoff: 'Ранняя подготовка требует работы, но локализует интеграции.' },
  handler: { label: 'B · Handler first', strategy: 'Улучшать существующий обработчик, откладывая выделение политики', tradeoff: 'Меньше начальных изменений, но расширение может вызвать миграцию.' },
}
export const ARCH_IDS: ArchitectureId[] = ['policy', 'handler']
export const ANCHORS: ScenarioAnchor[] = [
  { id: 'world-start', date: '2026-03-01', label: 'Общее начало', explanation: 'Одинаковые продуктовые потребности и начальная реализация.' },
  { id: 'budget-signal', date: '2026-03-15', label: 'Сигнал о бюджете', explanation: 'Один внешний сигнал для обеих архитектур; меняет ожидания, но не означает отказ.' },
  { id: 'client-window', date: '2026-04-01', label: 'Окно клиента', explanation: 'Одна независимая коммерческая возможность; готовность влияет на её результат.' },
]
export const DATES = ['2026-03-01','2026-03-03','2026-03-08','2026-03-15','2026-03-16','2026-03-22','2026-03-29','2026-04-01','2026-04-02','2026-04-09','2026-04-10'] as const
export const REQUIREMENTS: Record<string, Requirement> = {
  'R-BASE': { id: 'R-BASE', title: 'Клиент может отменить бронирование', detail: 'Текущие правила сроков отмены; без корпоративной интеграции.', kind: 'known' },
  'R-ENTERPRISE': { id: 'R-ENTERPRISE', title: 'Корпоративный клиент может запросить onboarding API', detail: 'Конкретный прогноз Plan R1: если договор состоится, потребуется подключение и правила корпоративной отмены.', kind: 'fact-conditional' },
  'R-ONBOARDING': { id: 'R-ONBOARDING', title: 'Требование onboarding API от подписавшего клиента', detail: 'Фактически получено только в ветке A после заключения договора 2 апреля.', kind: 'fact-conditional' },
}
const module = (id: string, name: string, responsibility: string, files: string[]): Module => ({ id,name,responsibility,files })
export const SNAPSHOTS: Record<string, ArchitectureSnapshot> = {
  base: { id: 'base', title: 'A0 · Общая исходная архитектура', modules: [module('booking','BookingActions','Обрабатывает отмены и текущие правила',['src/booking/BookingActions.ts']),module('status','CancellationStatus','Показывает конечный статус отмены',['src/booking/CancellationStatus.ts'])], connections: ['BookingActions → CancellationStatus'] },
  policyReady: { id: 'policyReady', title: 'A1 · Выделенная CancellationPolicy', modules: [module('booking','BookingActions','Оркестрирует отмены',['src/booking/BookingActions.ts']),module('policy','CancellationPolicy','Содержит правила отмены',['src/policy/CancellationPolicy.ts']),module('status','CancellationStatus','Показывает статус',['src/booking/CancellationStatus.ts'])], connections: ['BookingActions → CancellationPolicy','BookingActions → CancellationStatus'] },
  policyEnterprise: { id:'policyEnterprise', title:'A2 · Корпоративная интеграция',modules:[module('booking','BookingActions','Оркестрирует отмены',['src/booking/BookingActions.ts']),module('policy','CancellationPolicy','Правила разных клиентов',['src/policy/CancellationPolicy.ts']),module('status','CancellationStatus','Показывает статус',['src/booking/CancellationStatus.ts']),module('integration','EnterpriseAdapter','Онбординг корпоративного клиента',['src/integrations/EnterpriseAdapter.ts'])],connections:['BookingActions → CancellationPolicy','EnterpriseAdapter → CancellationPolicy','BookingActions → CancellationStatus'] },
  handlerEnterprise: { id:'handlerEnterprise',title:'B2 · Вынужденное выделение политики',modules:[module('booking','BookingActions','Оркестрирует отмены',['src/booking/BookingActions.ts']),module('policy','CancellationPolicy','Выделена из обработчика при миграции',['src/policy/CancellationPolicy.ts']),module('status','CancellationStatus','Показывает статус',['src/booking/CancellationStatus.ts']),module('integration','EnterpriseAdapter','Интеграция после миграции',['src/integrations/EnterpriseAdapter.ts'])],connections:['BookingActions → CancellationPolicy','EnterpriseAdapter → CancellationPolicy','BookingActions → CancellationStatus'] },
}
const step = (ref: StepRef,title:string,date:DateISO,kind:EvolutionStep['kind'],target:string,effect:string,files:string[],plannedWork:string[],requirementIds:string[],revisedFrom?:string):EvolutionStep=>({ref,title,date,kind,target,effect,files,plannedWork,requirementIds,revisedFrom})
export const STEPS: Record<StepRef,EvolutionStep> = {
  'A-S1@v1':step('A-S1@v1','Выделить CancellationPolicy','2026-03-08','refactoring','policyReady','Правила вынесены из BookingActions.',['src/policy/CancellationPolicy.ts','src/booking/BookingActions.ts'],['рефакторинг','регрессионные тесты'],['R-BASE']),
  'A-S2@v1':step('A-S2@v1','Подготовить поддержку enterprise','2026-03-29','implementation','policyReady','Добавлен механизм конфигурации клиентов без структурного изменения архитектуры.',['src/policy/CancellationPolicy.ts'],['реализация','тесты'],['R-BASE']),
  'A-S3@v1':step('A-S3@v1','Подключить корпоративный onboarding','2026-04-12','implementation','policyEnterprise','Создан adapter и расширены правила политики.',['src/integrations/EnterpriseAdapter.ts','src/policy/CancellationPolicy.ts'],['реализация','контрактные тесты'],['R-ENTERPRISE']),
  'A-S4@v1':step('A-S4@v1','Улучшить обычную отмену','2026-04-12','implementation','policyReady','Уточнение UX без enterprise интеграции.',['src/booking/BookingActions.ts'],['UX проверка','реализация'],['R-BASE']),
  'B-S1@v1':step('B-S1@v1','Локально улучшить BookingActions','2026-03-08','refactoring','base','Изменены ветвления и тесты в обработчике. Архитектура по-прежнему A0.',['src/booking/BookingActions.ts'],['локальный рефакторинг','тесты'],['R-BASE']),
  'B-S2@v1':step('B-S2@v1','Подготовить enterprise в обработчике','2026-03-30','implementation','base','Добавлены правила без выделения нового модуля.',['src/booking/BookingActions.ts'],['реализация','тесты','координация'],['R-BASE']),
  'B-S2@v2':step('B-S2@v2','Подготовить enterprise в обработчике','2026-04-09','implementation','base','Тот же намеренный эффект, но изменены плановая дата и зависимости по результатам задержки.',['src/booking/BookingActions.ts'],['повторная проверка','реализация','тесты'],['R-BASE'],'B-S2@v1'),
  'B-S3@v1':step('B-S3@v1','Мигрировать правила и интегрировать onboarding','2026-04-19','migration','handlerEnterprise','Выделение политики становится обязательной предпосылкой корпоративной интеграции.',['src/booking/BookingActions.ts','src/policy/CancellationPolicy.ts','src/integrations/EnterpriseAdapter.ts'],['миграция','совместимость','контрактные тесты','координация'],['R-ENTERPRISE']),
  'B-S4@v1':step('B-S4@v1','Продолжить локальную разработку','2026-04-15','implementation','base','Меняется поведение обработчика, архитектурные связи прежние.',['src/booking/BookingActions.ts'],['реализация','регрессионные тесты'],['R-BASE']),
}
const routesA:PlanRoute[]=[{id:'contract_signed',label:'Если договор подписан',condition:'Фактическое подписание договора после общего окна клиента',steps:['A-S3@v1']},{id:'contract_lost',label:'Если договор не подписан',condition:'Фактический отказ / упущенная возможность',steps:['A-S4@v1']}]
const routesB:PlanRoute[]=[{id:'contract_signed',label:'Если договор подписан',condition:'Фактическое подписание договора после общего окна клиента',steps:['B-S3@v1']},{id:'contract_lost',label:'Если договор не подписан',condition:'Фактический отказ / упущенная возможность',steps:['B-S4@v1']}]
const anticipated=[{id:'POT-CONTRACT',label:'Возможен корпоративный контракт 1 апреля',effect:'При подписании потребуются onboarding и интеграция; условные Steps готовы, но не выполнены.',predictedRequirementId:'R-ENTERPRISE'}]
const commonAxes:ChangeAxis[]=[{name:'Правила отмены',salience:'high',outlook:'Изменения часто, нужна локализация.'},{name:'Корпоративные интеграции',salience:'medium',outlook:'Возможна новая интеграция при сделке.'}]
const lowerAxes:ChangeAxis[]=[{name:'Правила отмены',salience:'high',outlook:'Динамичность проекта сохраняется.'},{name:'Корпоративные интеграции',salience:'low',outlook:'Бюджетный сигнал снижает ожидаемую значимость, не исключая возможность.'}]
const plan=(id:string,architecture:ArchitectureId,created:string,baseEventId:string,from:string|undefined,forecastCompletion:string,expectation:string,axes:ChangeAxis[],commonSteps:string[],routes:PlanRoute[],note:string,integrationDeadline='2026-04-20'):PlanRevision=>({id,architecture,created,baseEventId,knowledgeCutoff:created,from,forecastCompletion,externalDeadline:'2026-04-01',integrationDeadline,expectation,axes,anticipated,commonSteps,routes,otherActivities:['Подготовить регрессионный набор','Согласовать критерии готовности к клиентскому окну'],note})
export const PLANS: Record<string,PlanRevision> = {
  'A-R1':plan('A-R1','policy','2026-03-03','A-E00',undefined,'2026-03-29','Подписание вероятнее отказа',commonAxes,['A-S1@v1','A-S2@v1'],routesA,'План создан без знания результата окна клиента.'),
  'A-R2':plan('A-R2','policy','2026-03-16','A-E03','A-R1','2026-03-29','Подписание стало менее вероятным',lowerAxes,['A-S1@v1','A-S2@v1'],routesA,'Изменены ожидания, не исполнены условные Steps.'),
  'A-R3':plan('A-R3','policy','2026-04-10','A-E07','A-R2','2026-03-29','Договор подписан — route A применим',lowerAxes,['A-S1@v1','A-S2@v1'],routesA,'Клиент согласовал новый срок интеграции; старые даты R1/R2 сохранены.','2026-04-25'),
  'B-R1':plan('B-R1','handler','2026-03-03','B-E00',undefined,'2026-03-30','Подписание вероятнее отказа',commonAxes,['B-S1@v1','B-S2@v1'],routesB,'Миграция при onboarding возможна, но отложена.'),
  'B-R2':plan('B-R2','handler','2026-03-22','B-E04','B-R1','2026-04-09','Подписание стало менее вероятным',lowerAxes,['B-S1@v1','B-S2@v2'],routesB,'Прогноз завершения сдвинут, внешний дедлайн 1 апреля НЕ изменён.'),
}
const evt=(id:string,architecture:ArchitectureId,date:string,label:string,kind:ActualEvent['kind'],architectureRef:string,codeRef:string,extra:Partial<ActualEvent>={}):ActualEvent=>({id,architecture,date,label,kind,architectureRef,codeRef,...extra})
export const ACTUAL_EVENTS:Record<ArchitectureId,ActualEvent[]> = {
 policy:[
 evt('A-E00','policy','2026-03-01','Общее начало','baseline','base','code-v0',{sharedAnchor:'world-start'}),
 evt('A-E01','policy','2026-03-03','Команда утверждает Plan R1','plan','base','code-v0',{planCreated:'A-R1'}),
 evt('A-E02','policy','2026-03-08','Реализован S1 · Policy boundary','implementation','policyReady','code-a1',{reason:'Выделение ответственности в отдельный модуль.'}),
 evt('A-E03','policy','2026-03-15','Общий сигнал о сокращении бюджета','external','policyReady','code-a1',{sharedAnchor:'budget-signal'}),
 evt('A-E04','policy','2026-03-16','Команда пересматривает прогноз, Plan R2','plan','policyReady','code-a1',{planCreated:'A-R2'}),
 evt('A-E05','policy','2026-03-29','Готовность к enterprise окну достигнута','implementation','policyReady','code-a2',{reason:'Подготовленная политика позволила локально добавить настройки клиентов.'}),
 evt('A-E06','policy','2026-04-01','Общее окно клиента: договор подписан','consequence','policyReady','code-a2',{sharedAnchor:'client-window',resolved:'contract_signed',reason:'Система была готова 29 марта; контракт получен именно вследствие готовности.'}),
 evt('A-E06b','policy','2026-04-02','Клиент фактически требует onboarding API','requirement','policyReady','code-a2',{requirementAdded:'R-ONBOARDING'}),
 evt('A-E07','policy','2026-04-10','Клиент согласовал перенос срока интеграции','agreement','policyReady','code-a2',{planCreated:'A-R3',reason:'Перенесён именно договорной срок интеграции, а не задним числом срок готовности 1 апреля.'}),
 ],
 handler:[
 evt('B-E00','handler','2026-03-01','Общее начало','baseline','base','code-v0',{sharedAnchor:'world-start'}),
 evt('B-E01','handler','2026-03-03','Команда утверждает Plan R1','plan','base','code-v0',{planCreated:'B-R1'}),
 evt('B-E02','handler','2026-03-08','Реализован S1 · code-only refactor','implementation','base','code-b1',{reason:'Изменение кода в BookingActions без структурной смены архитектуры.'}),
 evt('B-E03','handler','2026-03-15','Общий сигнал о сокращении бюджета','external','base','code-b1',{sharedAnchor:'budget-signal'}),
 evt('B-E04','handler','2026-03-22','Обнаружена задержка, утверждён Plan R2','plan','base','code-b1',{planCreated:'B-R2',reason:'Дополнительные связанные проверки в обработчике сдвинули прогноз с 30 марта на 9 апреля.'}),
 evt('B-E05','handler','2026-04-01','Общее окно клиента: договор потерян','consequence','base','code-b1',{sharedAnchor:'client-window',resolved:'contract_lost',reason:'Подготовка не завершена к общему внешнему сроку. Не добавляем требования клиента в B.'}),
 evt('B-E06','handler','2026-04-09','Реализован S2, но слишком поздно','implementation','base','code-b2',{reason:'Работа завершена после общего коммерческого окна.'}),
 ],
}
export const FITNESS: FitnessEvidence[] = [
 { architecture:'policy',route:'contract_signed',migration:'Дорогая вынужденная миграция не требуется: граница правил создана заранее.',alignment:'EnterpriseAdapter соответствует прогнозируемому маршруту Plan.',work:['Ранее оплачено выделение политики','Локальная интеграция и контрактные тесты'],caution:'Раннее выделение политики имеет подготовительную стоимость.' },
 { architecture:'policy',route:'contract_lost',migration:'Миграция не требуется, но ранняя подготовка могла оказаться невостребованной.',alignment:'Ветка обычной отмены не конфликтует с выбранной границей.',work:['Небольшая доработка UI','Поддержка заранее созданной границы'],caution:'Не считать подготовленность безусловным преимуществом.' },
 { architecture:'handler',route:'contract_signed',migration:'Для корпоративных правил нужна переносная миграция из BookingActions.',alignment:'Подготовленная ветка выполнима, но конфликтует с накопленной реализацией внутри обработчика.',work:['Извлечение правил','Миграция и совместимость','Контрактные тесты и координация'],caution:'Миграция дорогая, потому что в этом сценарии она поздняя и затрагивает несколько связей.' },
 { architecture:'handler',route:'contract_lost',migration:'Выделение политики сейчас не требуется.',alignment:'Локальное развитие соответствует текущей реализации.',work:['Реализация в BookingActions','Регрессионные тесты'],caution:'Не штрафовать архитектуру за отсутствие ненужной в этой ветке миграции.' },
]
export function eventsUntil(a:ArchitectureId,date:DateISO):ActualEvent[]{return ACTUAL_EVENTS[a].filter(e=>e.date<=date)}
export function actualAt(a:ArchitectureId,date:DateISO):ActualEvent {const events=eventsUntil(a,date); return events[events.length-1]??ACTUAL_EVENTS[a][0]}
export function knownRequirements(a:ArchitectureId,date:DateISO):Requirement[]{const ids=new Set(['R-BASE']); for(const e of eventsUntil(a,date))if(e.requirementAdded)ids.add(e.requirementAdded);return [...ids].map(id=>REQUIREMENTS[id])}
export function planKnowledge(plan:PlanRevision):Requirement[]{return knownRequirements(plan.architecture,ACTUAL_EVENTS[plan.architecture].find(e=>e.id===plan.baseEventId)!.date)}
export function availablePlans(a:ArchitectureId,date:DateISO):PlanRevision[]{return Object.values(PLANS).filter(p=>p.architecture===a&&p.created<=date).sort((x,y)=>x.created.localeCompare(y.created))}
export function selectedPlan(a:ArchitectureId,date:DateISO,selectedId:string):PlanRevision|undefined{const ps=availablePlans(a,date);return ps.find(p=>p.id===selectedId)??ps[ps.length-1]}
export function routeApplicability(a:ArchitectureId,date:DateISO,route:Condition):'unresolved'|'applicable'|'excluded' {const resolved=eventsUntil(a,date).find(e=>e.resolved)?.resolved;return resolved===undefined?'unresolved':resolved===route?'applicable':'excluded'}
export function fitness(a:ArchitectureId,route:Condition):FitnessEvidence{return FITNESS.find(f=>f.architecture===a&&f.route===route)!}
export function compareBranches(date:DateISO){return ARCH_IDS.map(a=>({architecture:a,current:actualAt(a,date),requirements:knownRequirements(a,date),resolved:eventsUntil(a,date).find(e=>e.resolved)?.resolved}))}
export function validateStageA():string[]{const errors:string[]=[];for(const a of ARCH_IDS){const r=PLANS[a==='policy'?'A-R1':'B-R1'];if(!r||r.routes.length!==2)errors.push(`${a}: missing two IF routes`);if(r.anticipated[0]?.predictedRequirementId!=='R-ENTERPRISE')errors.push('missing predicted demand');for(const sr of [...r.commonSteps,...r.routes.flatMap(x=>x.steps)]){const s=STEPS[sr];if(!s||!SNAPSHOTS[s.target]||!s.effect||s.files.length===0)errors.push(`${sr}: missing planned complete architecture or implementation effect`)}if(routeApplicability(a,'2026-03-15','contract_signed')!=='unresolved')errors.push('route applied before fact');if(knownRequirements(a,'2026-03-15').length!==1)errors.push('predicted demand leaked into fact')}
 if(STEPS['B-S1@v1'].target!=='base')errors.push('code-only step did not preserve architecture');if(!ANCHORS.every(s=>ACTUAL_EVENTS.policy.some(e=>e.sharedAnchor===s.id)&&ACTUAL_EVENTS.handler.some(e=>e.sharedAnchor===s.id)))errors.push('shared external anchors not symmetric');return errors}
export function validateStageB():string[]{const errors:string[]=[];const b1=PLANS['B-R1'];const b2=PLANS['B-R2'];if(b1.externalDeadline!=='2026-04-01'||b2.externalDeadline!==b1.externalDeadline||b2.forecastCompletion!=='2026-04-09')errors.push('forecast and immutable external deadline conflated');if(b1.commonSteps[1]!=='B-S2@v1'||b2.commonSteps[1]!=='B-S2@v2'||STEPS['B-S2@v2'].revisedFrom!=='B-S2@v1')errors.push('step version lineage broken');if(PLANS['A-R1'].axes[1].salience==='low'||PLANS['A-R2'].axes[1].salience!=='low')errors.push('historical axes mutated');if(PLANS['A-R1'].integrationDeadline!=='2026-04-20'||PLANS['A-R3'].integrationDeadline!=='2026-04-25')errors.push('renegotiated deadline has no history');if(knownRequirements('policy','2026-04-02').length!==2||knownRequirements('handler','2026-04-09').length!==1)errors.push('branch-local requirement facts broken');if(planKnowledge(PLANS['A-R1']).length!==1||planKnowledge(PLANS['A-R3']).length!==2)errors.push('plan knowledge leaked across revisions');if(routeApplicability('policy','2026-04-02','contract_signed')!=='applicable'||routeApplicability('handler','2026-04-02','contract_signed')!=='excluded')errors.push('resolved routes incorrect');return errors}
export function validateStageC():string[]{const errors:string[]=[];for(const a of ARCH_IDS)for(const route of ['contract_signed','contract_lost'] as Condition[]){const f=fitness(a,route);if(!f?.migration||!f.alignment||!f.work.length||!f.caution)errors.push(`${a}/${route} missing auditable fitness`)}if(!fitness('handler','contract_signed').migration.includes('миграц'))errors.push('migration tradeoff absent');if(routeApplicability('handler','2026-04-09','contract_signed')!=='excluded')errors.push('excluded route presented as realized');return errors}
export function validateAll():string[]{return [...validateStageA(),...validateStageB(),...validateStageC()]}
