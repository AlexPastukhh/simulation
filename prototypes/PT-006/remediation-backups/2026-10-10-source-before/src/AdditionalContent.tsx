import type { Branch, DemoStore } from './content.ts'
import { knownRequirements } from './content.ts'
import type { ExtraKind } from './extraContent.ts'
import { actualImpacts, changesFor } from './history.ts'
import { ChangeList } from './HistoryContent.tsx'

type Props = { kind: ExtraKind; branch: Branch; data: DemoStore; allData: Record<Branch, DemoStore>; mutate: (fn: (draft: DemoStore) => void) => void; preview?: boolean }
const Badge = ({ children }: { children: React.ReactNode }) => <span className="sim-tag">{children}</span>
const Section = ({ title, desc }: { title: string; desc?: string }) => <div className="sim-extra-heading"><b>{title}</b>{desc && <small>{desc}</small>}</div>
const Line = ({ primary, secondary }: { primary: string; secondary?: string }) => <div className="sim-row"><strong>{primary}</strong>{secondary && <p>{secondary}</p>}</div>
export function isExtraKind(kind: string): kind is ExtraKind {
  return ['scenario','current','architecturePlan','forecasts','axes','hotpaths','explorer','comparison','trace','impactHistory'].includes(kind)
}
export function AdditionalContent({ kind, branch, data, allData, mutate, preview = false }: Props) {
  const patch = (fn: (d: DemoStore) => void) => { if (!preview) mutate(fn) }
  const events = data.events.records
  if (kind === 'scenario') return <div className="sim-content">
    <Section title={data.scenario.appName} desc={data.scenario.caseId} />
    <p>{data.scenario.startingPoint}</p>
    <Section title="Общие исходные ограничения" />
    {data.scenario.constraints.map((line,i) => <Line key={i} primary={line}/>)}
    <Section title="Одинаковые сценарные якоря" />
    {data.scenario.anchors.map(anchor => <Line key={anchor.id} primary={anchor.date+' · '+anchor.label} secondary={anchor.id+' · архитектурно-независимый стимул'} />)}
    <p className="sim-hint">Обе ветки используют один подготовленный случай. Время и причинные последствия — авторские фиктивные данные.</p>
  </div>

  if (kind === 'current') {
    const section = data.current.selectedSection
    const snapshot = data.architecture.snapshots.find(item => item.id === data.architecture.currentRef)
    const reqs = knownRequirements(data)
    return <div className="sim-content">
      <Section title="CURRENT · фактический срез" desc={'Architecture '+branch} />
      <div className="sim-detail"><Badge>Actual cursor {data.events.selectedId ?? 'последний'}</Badge><small>Сохранённый тестовый сценарий</small></div>
      <div className="sim-segment">
        {(['architecture','requirements','implementation'] as const).map(view => <button key={view} className={section === view ? 'is-selected' : ''} onClick={() => patch(d => { d.current.selectedSection = view })}>{view === 'architecture' ? 'Архитектура' : view === 'requirements' ? 'Требования' : 'Файлы'}</button>)}
      </div>
      {section === 'architecture' && <><Section title={'Снимок '+data.architecture.currentRef} />{snapshot?.responsibilities.map(x => <Line key={x.id} primary={x.name} secondary={x.id+' · '+x.concern}/>)}</>}
      {section === 'requirements' && <><Section title={'Известно требований: '+reqs.length} />{reqs.map(r => <Line key={r.id} primary={r.title} secondary={r.id+' · '+r.source}/>)}</>}
      {section === 'implementation' && <><Section title="Файлы CURRENT" />{data.implementation.files.map(f => <Line key={f.path} primary={f.path} secondary={f.responsibility+' · '+f.status}/>)}</>}
      <p className="sim-hint">Требования, архитектура и файлы соответствуют выбранному фактическому моменту. Выбор планового Step не исполняет его.</p>
    </div>
  }

  if (kind === 'architecturePlan') {
    const step = data.plan.steps.find(x => x.id === data.architecturePlan.selectedStepId)
    const snapshot = data.architecture.snapshots.find(x => x.id === step?.targetSnapshotRef)
    return <div className="sim-content">
      <Section title="Architecture Planning" desc={'PLAN '+data.plan.revision+' · BASE '+data.plan.basedOnActualEventRef} />
      <label className="sim-select-label">Выбрать Evolution Step
        <select value={data.architecturePlan.selectedStepId} disabled={preview} onChange={e => patch(d => { d.architecturePlan.selectedStepId = e.target.value })}>{data.plan.steps.map(step => <option key={step.id} value={step.id}>{step.id} · {step.title}</option>)}</select>
      </label>
      {step && <><div className="sim-detail"><Badge>{step.route}</Badge><span>{step.condition}</span></div>
        <Section title={snapshot?.title ?? 'Целевой снимок не найден'} desc={step.targetSnapshotRef}/>
        <div className="sim-node-grid">{snapshot?.responsibilities.map(node => <div className="sim-node" key={node.id}><Badge>{node.id}</Badge><strong>{node.name}</strong><small>{node.concern}</small></div>)}</div>
        <p className="sim-hint">Целевой снимок целиком; Step без архитектурных изменений вправе переиспользовать тот же ref.</p>
        <Section title="Планируемый эффект реализации" /><Line primary={step.implementationEffect} secondary={'impact: '+step.impactRef} />
        <label className="sim-check"><input disabled={preview} type="checkbox" checked={data.architecturePlan.showConnections} onChange={e => patch(d => { d.architecturePlan.showConnections = e.target.checked })}/> Показать связи</label>
        {data.architecturePlan.showConnections && snapshot?.connections.map((link,i) => <div className="sim-connection" key={i}>{link.from} → {link.to}</div>)}
      </>}
      <p className="sim-hint">Это Plan-проекция, не второй Plan и не факт исполнения.</p>
    </div>
  }

  if (kind === 'forecasts') {
    const planned = data.plan.anticipatedEvents
    const selectedForecast = planned.some(e => e.id === data.forecasts.selectedForecastId) ? data.forecasts.selectedForecastId : planned[0]?.id
    return <div className="sim-content">
      <Section title="Forecasts / Deadlines" desc={'Ревизия '+data.plan.revision}/>
      <p className="sim-hint">Плановые возможности, прогнозные требования, сроки и условные ветки не являются Actual Events.</p>
      {planned.map(e => <button key={e.id} className={'sim-step '+(selectedForecast === e.id?'is-selected':'')} onClick={() => patch(d => { d.forecasts.selectedForecastId = e.id })}><b>{e.date} · {e.title}</b><p>{e.consequence}</p><small>FORECAST · {e.id}</small></button>)}
      <Section title="Рассматриваемый IF-маршрут" />
      <div className="sim-segment">{[...new Set(data.plan.steps.map(s => s.route))].map(route => <button className={data.forecasts.selectedRoute === route?'is-selected':''} key={route} onClick={() => patch(d => { d.forecasts.selectedRoute = route })}>{route}</button>)}</div>
      {data.plan.steps.filter(s => s.route === data.forecasts.selectedRoute).map(s => <Line key={s.id} primary={s.title} secondary={s.condition+' · '+s.date}/>)}
      <Section title="Обязательство / срок" />
      <Line primary={data.plan.deadline.title} secondary={data.plan.deadline.date+' · запланированный дедлайн, не факт выполнения'}/>
      <p className="sim-hint">Изменения прогнозных дат и дедлайнов сохранены в PlanRevision. Выберите ревизию в Plan или откройте историю этого вида.</p>
    </div>
  }

  if (kind === 'axes') return <div className="sim-content">
    <Section title="Planned Change Axes" desc={data.plan.revision}/>
    <p className="sim-hint">Прогнозные направления возможных изменений, а не реально наблюдаемые Hot Paths.</p>
    {data.plan.changeAxes.map(axis => <button className={'sim-step '+(data.axes.selectedAxisId===axis.id?'is-selected':'')} key={axis.id} onClick={() => patch(d => { d.axes.selectedAxisId = axis.id })}><b>{axis.direction}</b><small>{axis.id} · горизонт: {axis.horizon}</small></button>)}
    <label className="sim-check"><input type="checkbox" disabled={preview} checked={data.axes.showRevisions} onChange={e => patch(d => { d.axes.showRevisions = e.target.checked })}/> Показать исторические версии</label>
    {data.axes.showRevisions && data.history.revisions.map(revision => <div className="sim-row" key={revision.id}><strong>{revision.id} · после {revision.eventId}</strong><p>{revision.plan.changeAxes.length ? revision.plan.changeAxes.map(axis => axis.direction + ' · ' + axis.horizon).join('; ') : 'Оси ещё не заданы'}</p></div>)}
  </div>

  if (kind === 'hotpaths') return <div className="sim-content">
    <Section title="Actual Hot Paths" desc="наблюдаемые изменения" />
    <p className="sim-hint">Наблюдения из подготовленного фактического материала; не прогнозы Planned Change Axes.</p>
    {data.work.actualHotPaths.map(path => <button className={'sim-step '+(data.hotpaths.selectedPath===path.path?'is-selected':'')} key={path.path} onClick={() => patch(d => { d.hotpaths.selectedPath = path.path })}><b>{path.path}</b><small>Затрагивался: {path.touches} · {path.note}</small></button>)}
    <div className="sim-detail"><Badge>ACTUAL</Badge><span>Зона {data.hotpaths.selectedPath}</span></div>
    <p className="sim-hint">Наблюдения сохранены в тестовых снимках. Откройте историю, чтобы увидеть изменение счётчиков; автоматический расчёт по произвольным событиям не добавлен.</p>
  </div>

  if (kind === 'explorer') {
    const chosen = events.find(e => e.id === (data.events.selectedId ?? events.at(-1)?.id))
    const revealed = data.requirements.items.filter(r => r.knownFrom===chosen?.id)
    const entity = revealed.find(r => r.id === data.explorer.selectedEntityRef) ?? revealed[0]
    const historyIndex = data.history.frames.findIndex(f => f.eventId === chosen?.id)
    return <div className="sim-content">
      <Section title="Event / Entity Explorer" desc="фактические связи" />
      <label className="sim-select-label">Фактическое событие
        <select disabled={preview} value={chosen?.id ?? ''} onChange={e => patch(d => { d.explorer.selectedEventId = e.target.value; d.events.selectedId = e.target.value; d.history.selectedRevisionId = null })}>{events.map(e => <option key={e.id} value={e.id}>{e.id} · {e.label}</option>)}</select>
      </label>
      {chosen && <><Line primary={chosen.day+' · '+chosen.label} secondary={chosen.provenance}/><p className="sim-hint">{chosen.note}</p></>}
      <Section title={'Впервые известные требования: '+revealed.length} />
      {revealed.length ? revealed.map(r => <button key={r.id} className={'sim-step '+(data.explorer.selectedEntityRef===r.id?'is-selected':'')} onClick={() => patch(d => { d.explorer.selectedEntityRef=r.id })}><b>{r.title}</b><small>{r.id} · известен от {r.knownFrom}</small></button>) : <p className="sim-hint">В этом событии не введён новый объект Requirement.</p>}
      <div className="sim-detail"><Badge>ENTITY</Badge><span>{entity?.id ?? 'не выбран'}</span></div>
      <Section title="Изменения State после события"/>{historyIndex >= 0 ? <ChangeList changes={changesFor(data, 'current', historyIndex)}/> : <p className="sim-hint">Для этого события не сохранён переход State.</p>}
      <p className="sim-hint">Связи объектов и изменения State относятся к сохранённому тестовому сценарию.</p>
    </div>
  }

  if (kind === 'comparison') {
    const a = allData.A, b = allData.B
    const eA = a.events.records.find(x => x.id===data.comparison.selectedAnchorId)
    const eB = b.events.records.find(x => x.id===data.comparison.selectedAnchorId)
    return <div className="sim-content">
      <Section title="Cross-Architecture Comparison" desc="одно приложение · общий стимул" />
      <label className="sim-select-label">Сценарный якорь
        <select disabled={preview} value={data.comparison.selectedAnchorId} onChange={e => patch(d => { d.comparison.selectedAnchorId=e.target.value })}>{data.scenario.anchors.map(anchor => <option key={anchor.id} value={anchor.id}>{anchor.date} · {anchor.id}</option>)}</select>
      </label>
      <Line primary={eA?.label ?? 'Общий якорь отсутствует'} secondary={eA && eB && JSON.stringify(eA)===JSON.stringify(eB) ? 'Совпадающий внешний факт A/B' : 'Внимание: не совпадает событие в A/B'} />
      <div className="sim-segment">{(['events','requirements','work'] as const).map(focus => <button key={focus} className={data.comparison.focus===focus?'is-selected':''} onClick={() => patch(d => { d.comparison.focus=focus })}>{focus}</button>)}</div>
      {(['A','B'] as const).map(id => {
        const branchState = allData[id]
        const last = branchState.events.records.find(e => e.id === branchState.events.selectedId) ?? branchState.events.records.at(-1)
        const body = data.comparison.focus === 'events'
          ? last?.label + ' · ' + last?.provenance
          : data.comparison.focus === 'requirements'
          ? knownRequirements(branchState).map(x => x.id+' '+x.title).join('; ')
          : branchState.work.episodes.map(x => x.goal+': '+x.evidence).join('; ')
        return <Line key={id} primary={'Architecture '+id+' · '+(branchState.events.selectedId ?? 'последний State')} secondary={body} />
      })}
      <p className="sim-hint">Это компактные текстовые свидетельства о двух ветках, не две диаграммы архитектур рядом. Причинный механизм авторский, не вычисляется автоматически.</p>
    </div>
  }

  if (kind === 'trace') {
    const known = knownRequirements(data)
    const selected = known.some(r => r.id === data.trace.selectedRequirementId) ? data.trace.selectedRequirementId : known[0]?.id ?? ''
    const links = data.trace.links.filter(link => link.requirementId===selected)
    return <div className="sim-content">
      <Section title="Requirement → Architecture → Files" />
      <label className="sim-select-label">Потребность
        <select disabled={preview} value={selected} onChange={e => patch(d => { d.trace.selectedRequirementId=e.target.value })}>{known.map(r => <option key={r.id} value={r.id}>{r.id} · {r.title}</option>)}</select>
      </label>
      {links.length ? links.map((link,i) => <div className="sim-trace" key={i}>
        <Badge>{link.requirementId}</Badge><span>→</span><Badge>{link.architectureRef}</Badge><span>→</span><strong>{link.filePath}</strong>
        <p>{link.note}</p><small>{data.implementation.files.some(f => f.path === link.filePath) ? 'CURRENT file' : 'PLANNED / external reference'}</small>
      </div>) : <p className="sim-hint">Для этого требования нет подготовленного соответствия.</p>}
      <p className="sim-hint">Соответствия не требуют нормализации самой Requirement Model и могут быть множественными.</p>
    </div>
  }

  const target = data.impactHistory.selectedTargetRef
  const hits = data.impact.records.filter(r => r.targetRefs.includes(target) || r.filePaths.includes(target))
  const actual = actualImpacts(data, target)
  const choices = [...new Set([...data.impact.records.flatMap(r => r.targetRefs), ...data.impact.records.flatMap(r => r.filePaths), ...data.history.frames.flatMap(f => [...(f.state.architecture.snapshots.find(s => s.id === f.state.architecture.currentRef)?.responsibilities.map(r => r.id) ?? []), ...f.state.implementation.files.map(file => file.path)])])]
  return <div className="sim-content">
    <Section title="Impact History / Future" desc="по элементу или файлу" />
    <label className="sim-select-label">Выбрать архитектурную единицу или файл
      <select disabled={preview} value={target} onChange={e => patch(d => { d.impactHistory.selectedTargetRef=e.target.value })}>{choices.map(ref => <option key={ref} value={ref}>{ref}</option>)}</select>
    </label>
    <Section title="Фактические изменения CURRENT" desc={actual.length + ' переходов в сохранённом сценарии'}/>{actual.length ? actual.map(record => <details className="history-snapshot" key={record.eventId}><summary>{record.eventId} · {record.changes.length} изменений</summary><ChangeList changes={record.changes}/></details>) : <p className="sim-hint">После исходного снимка фактических изменений выбранной цели не сохранено.</p>}
    <Section title="Route-qualified planned impacts" desc={hits.length+' записей'} />
    {hits.map(hit => <Line key={hit.id} primary={hit.stepId+' · '+hit.reason} secondary={hit.id+' · '+hit.route+' · '+hit.filePaths.join(', ')}/>)}
    <p className="sim-hint">Фактические изменения выше получены из архивных CURRENT и файлов. Плановые impacts ниже относятся к отдельным условным маршрутам и не считаются выполненными.</p>
  </div>
}
