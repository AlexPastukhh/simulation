import type { ContentKind } from './workspace.ts'
import { knownRequirements } from './content.ts'
import { AdditionalContent, isExtraKind } from './AdditionalContent.tsx'
import type { Branch, DemoStore } from './content.ts'
import { plannedView, navigationEvents, planningSnapshots, resolveSnapshot } from './history.ts'
import { PlanHistory } from './HistoryContent.tsx'
import { PlanActivities, ForecastDetails, ForecastRequirement, WorkDetails } from './MaterialContent.tsx'

export type Mutate = (fn: (draft: DemoStore) => void) => void
type Props = { kind: ContentKind; branch: Branch; data: DemoStore; allData: Record<Branch, DemoStore>; mutate: Mutate; preview?: boolean; unavailable?: boolean }
const Tag = ({ children, tone = '' }: { children: React.ReactNode; tone?: string }) => <span className={'sim-tag '+tone}>{children}</span>
const Hint = ({ children }: { children: React.ReactNode }) => <p className="sim-hint">{children}</p>
const Row = ({ title, meta, children }: { title: string; meta?: string; children?: React.ReactNode }) => <article className="sim-row"><div className="sim-row-main"><strong>{title}</strong>{meta && <small>{meta}</small>}</div>{children}</article>

export function DomainContent({ kind, branch, data: factualData, allData, mutate, preview = false, unavailable = false }: Props) {
  if (unavailable && kind !== 'events') return <div className="sim-content"><p className="history-notice">Для выбранного события нет сохранённого состояния. Выберите доступный снимок в истории или вернитесь к последнему State.</p></div>
  const data = ['plan', 'architecture', 'architecturePlan', 'forecasts', 'axes', 'impact', 'implementation', 'fitness', 'impactHistory'].includes(kind) ? plannedView(factualData) : factualData
  if (isExtraKind(kind)) return <AdditionalContent kind={kind} branch={branch} data={data} allData={allData} mutate={mutate} preview={preview} />
  const selectedStep = data.plan.steps.find(s => s.id === data.plan.selectedStepId)
  const chosenImpact = data.impact.records.find(i => i.id === data.impact.selectedImpactId)
  const snapshotContext = data.architecture.selectedContext ?? (data.architecture.selectedRef === data.architecture.currentRef ? 'actual' : 'planned')
  const snapshot = resolveSnapshot(data, data.architecture.selectedRef, snapshotContext)
  const selectStep = (id: string) => {
    if (preview) return
    mutate(d => {
      const step = data.plan.steps.find(s => s.id === id)
      if (!step) return
      d.plan.selectedStepId = id
      d.impact.selectedImpactId = step.impactRef
      d.architecture.selectedRef = step.targetSnapshotRef
      d.architecture.selectedContext = 'planned'
    })
  }
  const heading = (label: string, pill?: string) => <div className="sim-section-head"><strong>{label}</strong>{pill && <Tag>{pill}</Tag>}</div>

  if (kind === 'events') return <div className="sim-content">
    {heading('Фактическая лента', 'ветка '+branch)}
    <Hint>Каждая запись — факт подготовленного сценария. Общие внешние события имеют один ID.</Hint>
    {navigationEvents(data).map(e => <button key={e.id}
      className={'sim-event '+(data.events.selectedId === e.id ? 'is-selected' : '')}
      onClick={() => !preview && mutate(d => { d.events.selectedId = e.id; d.history.selectedRevisionId = null })}>
      <span className="sim-date">{e.day}</span><span className="sim-event-text"><strong>{e.label}</strong><small>{e.id} · {e.provenance}</small></span>
      <span className="sim-kind">{e.kind}</span>
    </button>)}
    <div className="sim-detail"><Tag tone="actual">ACTUAL</Tag><span>Выбран: {data.events.selectedId ?? 'последний доступный'}</span></div>
    <Hint>Выбранный момент раскрывает сохранённый State требований, архитектуры, файлов, работ и Plan. История ограничена подготовленными событиями тестового сценария.</Hint>
  </div>

  if (kind === 'requirements') {
    const items = knownRequirements(data)
    return <div className="sim-content">
      {heading('Requirement Model', items.length+' известных')}
      <Hint>Ненормализованные фактические требования. Прогнозы Plan не попадают сюда автоматически.</Hint>
      {items.map(item => <Row key={item.id} title={item.title} meta={item.id+' · '+item.source}><p>{item.description}</p></Row>)}
      {heading('Прочие объекты State')}
      <div className="sim-stat-grid"><div><b>{data.requirements.screens.length}</b><small>screens</small></div><div><b>{data.requirements.apiEndpoints.length}</b><small>apiEndpoints</small></div></div>
      <Hint>Тип API Endpoint возможен по JSON Schema, но в этом фактическом State экземпляров может быть ноль.</Hint>
    </div>
  }

  if (kind === 'plan') return <div className="sim-content">
    {heading('PlanRevision', data.plan.revision)}
    <PlanHistory data={data} actualRevision={factualData.plan.revision} mutate={mutate} preview={preview}/>
    <div className="sim-detail"><Tag>BASE · {data.plan.basedOnActualEventRef}</Tag><span>Не равен CURRENT</span></div>
    <Hint>Step — планируемое изменение реализации. Условие делает маршрут применимым, но не исполняет Step.</Hint>
    <div className="sim-timeline">
      {data.plan.steps.map(step => <button key={step.id} className={'sim-step '+(step.id===data.plan.selectedStepId?'is-selected':'')} onClick={() => selectStep(step.id)}>
        <div className="sim-step-head"><Tag>{step.id}</Tag><b>{step.title}</b><small>{step.date}</small></div>
        <div className="sim-condition">{step.condition}</div>
        <small>{step.route} · target: {step.targetSnapshotRef}</small>
      </button>)}
    </div>
    {selectedStep && <div className="sim-detail stacked"><strong>Эффект выбранного Step {selectedStep.id}</strong><span>{selectedStep.implementationEffect}</span><small>Целевой ArchitectureSnapshot целиком: {selectedStep.targetSnapshotRef}</small></div>}
    <PlanActivities data={data}/>
    {heading('Прогнозы и сроки')}
    {data.plan.anticipatedEvents.map(e => <Row key={e.id} title={e.title} meta={e.date+' · FORECAST'}><p>{e.consequence}</p><ForecastRequirement forecast={e}/></Row>)}
    {data.plan.changeAxes.map(axis => <Row key={axis.id} title={axis.direction} meta={'Planned Change Axis · '+axis.horizon}/>)}
    <ForecastDetails data={data}/>
  </div>

  if (kind === 'architecture' && !snapshot) return <div className="sim-content"><p className="history-notice">Архитектурный снимок не найден в этом State.</p></div>
  if (kind === 'architecture') return <div className="sim-content">
    {heading('Architecture Snapshot', snapshotContext === 'actual' ? 'ACTUAL' : 'PLANNED')}
    <label className="sim-select-label">Показать снимок
      <select disabled={preview} value={snapshotContext + ':' + data.architecture.selectedRef} onChange={e => mutate(d => { const split = e.target.value.indexOf(':'); d.architecture.selectedContext = e.target.value.slice(0, split) as 'actual' | 'planned'; d.architecture.selectedRef = e.target.value.slice(split + 1) })}>
        {data.architecture.snapshots.filter(s => s.id === data.architecture.currentRef).map(s => <option key={'actual:' + s.id} value={'actual:' + s.id}>ACTUAL · {s.title}</option>)}
        {planningSnapshots(data).map(s => <option key={'planned:' + s.id} value={'planned:' + s.id}>PLANNED · {s.title}</option>)}
      </select>
    </label>
    <Hint>{snapshot.title}. Плановый снимок не считается осуществлённым.</Hint>
    <div className="sim-node-grid">{snapshot.responsibilities.map(item => <div className="sim-node" key={item.id}><Tag>{item.id}</Tag><strong>{item.name}</strong><small>{item.concern}</small></div>)}</div>
    {heading('Связи')}
    {snapshot.connections.map((link, i) => <div className="sim-connection" key={i}>{link.from} <span>→</span> {link.to}</div>)}
    <div className="sim-detail"><Tag>CURR</Tag><span>Фактический snapshot: {data.architecture.currentRef}</span></div>
  </div>

  if (kind === 'impact') return <div className="sim-content">
    {heading('Evolution Impact', chosenImpact?.route)}
    <Hint>Влияние одной плановой операции, а не сумма взаимоисключающих IF/ELSE веток.</Hint>
    <div className="sim-chip-row">{data.impact.records.map(item => <button className={'sim-chip '+(item.id===data.impact.selectedImpactId?'is-selected':'')} key={item.id} onClick={() => !preview && mutate(d => { d.impact.selectedImpactId = item.id })}>{item.stepId} / {item.id}</button>)}</div>
    {chosenImpact && <><Row title={chosenImpact.reason} meta={chosenImpact.id+' · '+chosenImpact.route}/>
      {heading('Затронутые ответственности')}
      <div className="sim-chip-row">{chosenImpact.targetRefs.map(ref => <Tag key={ref}>{ref}</Tag>)}</div>
      {heading('Файловый impact')}
      {chosenImpact.filePaths.map(path => <div key={path} className="sim-file">{path}</div>)}
    </>}
    <Hint>Forward consistency учитывает только выбранный условный маршрут, не все альтернативы сразу.</Hint>
  </div>

  if (kind === 'implementation') return <div className="sim-content">
    {heading('Implementation Model', 'fake project tree')}
    <Hint>Фактически известные файлы; плановые изменения ниже показаны отдельно.</Hint>
    <div className="sim-files">{data.implementation.files.map(file => <div className="sim-file" key={file.path}><span>▤</span><div><strong>{file.path}</strong><small>{file.responsibility} · {file.status}</small></div></div>)}</div>
    {heading('Planned file effects')}
    {data.implementation.plannedEffects.map(effect => <Row key={effect.stepId+effect.path} title={effect.path} meta={effect.stepId}><Tag tone="forecast">{effect.effect}</Tag></Row>)}
    <Hint>Плановые CREATE/MODIFY здесь не означают наличия файла в CURRENT.</Hint>
  </div>

  if (kind === 'fitness') return <div className="sim-content">
    {heading('Evolution Fitness', 'без общего балла')}
    <Hint>Контекстные наблюдения и свидетельства; не универсальный рейтинг архитектур.</Hint>
    {data.fitness.assessments.map(item => <div key={item.id} className="sim-assessment">
      <div className="sim-detail"><Tag>{item.route}</Tag><small>{item.id}</small></div>
      <h4>{item.question}</h4><p>Цель: {item.goalRef ?? "не задана"}</p><small>{item.stateContext ?? "Контекст оценки не задан"}</small>
      <Row title="Миграция" meta={item.migration}/>
      <Row title="Соответствие Plan" meta={item.planAlignment}/>
      {heading('Отдельные классы затрат')}
      <div className="sim-stat-grid">{Object.entries(item.costClasses).map(([key,value]) => <div key={key}><small>{key}</small><strong>{value}</strong></div>)}</div>
      {heading('Evidence')}
      {item.evidence.map((e,i) => <p className="sim-evidence" key={i}>• {e}</p>)}
    </div>)}
  </div>

  return <div className="sim-content">
    {heading('Work Dynamics', 'ACTUAL')}
    <Hint>Работа по целям, включая координацию, проверки и задержки — не обязательно Evolution Steps.</Hint>
    {data.work.episodes.map(ep => <Row title={ep.goal} meta={ep.id+' · '+ep.day} key={ep.id}>
      <div className="sim-chip-row">{ep.activities.map(a => <Tag key={a}>{a}</Tag>)}</div><p>{ep.evidence}</p>
    </Row>)}
    <WorkDetails data={data}/>
    {heading('Actual Hot Paths')}
    {data.work.actualHotPaths.map(path => <Row key={path.path} title={path.path} meta={'Изменений: '+path.touches}><p>{path.note}</p></Row>)}
    <Hint>Наблюдавшийся Actual Hot Path не заменяет прогноз Planned Change Axis из Plan.</Hint>
  </div>
}
