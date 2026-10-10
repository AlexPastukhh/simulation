import type { DemoStore } from './content.ts'

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="sim-row"><strong>{title}</strong><div>{children}</div></div>
export function ScenarioContextView({ data }: { data: DemoStore }) {
  const context = data.scenario.context
  if (!context) return <p className="sim-hint">Контекст динамичности и команды в этом State не задан.</p>
  return <section className="material-section"><h4>Динамичность и условия команды</h4><Row title="Изменчивость проекта"><p>{context.dynamism}</p></Row><Row title="Команда"><p>{context.organization}</p></Row><Row title="Инженерная среда"><p>{context.engineeringEnvironment}</p></Row><small>{context.source}</small></section>
}
export function PlanActivities({ data }: { data: DemoStore }) {
  const kinds: Record<string, string> = { 'test-only': 'Проверка', negotiation: 'Переговоры', waiting: 'Ожидание', coordination: 'Координация' }
  return <section className="material-section"><h4>Другая плановая работа</h4><p className="sim-hint">Эти действия не обязаны менять функцию или реализацию. Они остаются частью одного Plan.</p>
    {data.plan.activities?.length ? data.plan.activities.map(activity => <details className="history-snapshot" key={activity.id}><summary>{kinds[activity.kind] ?? activity.kind} · {activity.goal}</summary><p>{activity.date} · {activity.route}</p><p><b>Вход:</b> {activity.input}</p><p><b>Результат:</b> {activity.output}</p><p><b>Зависимости:</b> {activity.dependsOn.join(', ') || 'не заданы'}</p><small>{activity.evidence} · {activity.id}</small></details>) : <p className="sim-hint">В этом State плановые действия такого вида не заданы.</p>}
  </section>
}
export function ForecastRequirement({ forecast }: { forecast: DemoStore['plan']['anticipatedEvents'][number] }) {
  const requirement = forecast.predictedRequirement
  return requirement ? <div className="forecast-requirement"><b>Прогнозное требование: {requirement.title}</b><p>{requirement.description}</p><small>FORECAST · {requirement.id} · {requirement.evidence}</small></div> : null
}
export function ForecastDetails({ data }: { data: DemoStore }) {
  const forecast = data.plan.completionForecast, deadline = data.plan.deadline
  return <section className="material-section">
    <h4>Оценка завершения и обязательный срок</h4>
    {forecast ? <Row title={'Оценка завершения: ' + forecast.date}><p>{forecast.goal} · {forecast.route}</p><p>{forecast.basis}</p><small>{forecast.evidence} · {forecast.timeBasis}</small></Row> : <p className="sim-hint">Оценка завершения в этом State не задана.</p>}
    <Row title={'Обязательный срок: ' + deadline.date}><p>{deadline.title}</p>{deadline.previousDate && <p>Предыдущее обещание: {deadline.previousDate}</p>}<p>{deadline.reason ?? 'Сам срок не подтверждает завершение.'}</p><small>{deadline.source ?? 'Источник обязательства не задан'}</small></Row>
    <h4>Ожидания маршрутов и основания</h4>
    {data.plan.routeExpectations?.length ? data.plan.routeExpectations.map(expectation => <Row key={expectation.route} title={expectation.route + ' · ' + expectation.assessment}><p>{expectation.grounds}</p><small>Источники: {expectation.eventRefs.join(', ')}. Ожидание не исполняет Step.</small></Row>) : <p className="sim-hint">Ожидания маршрутов в этом State не заданы.</p>}
  </section>
}
const detailLabels = { planningBurden: 'Анализ и планирование', knowledge: 'Источники знания', contracts: 'Контракты', dependencies: 'Зависимости', compatibility: 'Совместимость', rollout: 'Условия выпуска', coordination: 'Координация', waiting: 'Внешнее ожидание', activeWork: 'Активная работа', timeBasis: 'Основание времени', reversibility: 'Условия отката', experimentability: 'Подготовка эксперимента', feedback: 'Обратная связь', teamAutonomy: 'Условия автономии' } as const
export function WorkDetails({ data }: { data: DemoStore }) {
  return <section className="material-section"><h4>Работа по цели и условия изменения</h4>
    {data.work.details?.length ? data.work.details.map(detail => <details className="history-snapshot" key={detail.id}><summary>{data.work.episodes.find(ep => ep.id === detail.episodeId)?.goal ?? detail.episodeId} · анализ и условия</summary><p>Цель: {detail.goalRef} · зоны: {detail.affectedAreas.join(', ')}</p><dl className="work-details">{Object.entries(detailLabels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{detail[key as keyof typeof detailLabels]}</dd></div>)}</dl>{detail.evidence.map((e, i) => <p className="sim-evidence" key={i}>{e}</p>)}</details>) : <p className="sim-hint">Детали работы в этом State не заданы.</p>}
    <h4>Затраты и происхождение оценок</h4><p className="sim-hint">Разовые и повторяющиеся обязательства различаются. Неизвестное количество не считается нулём. Аналитические линзы не суммируются как независимые затраты.</p>
    {data.work.costFacts?.map(fact => <details className="history-snapshot" key={fact.id}><summary>{fact.episodeId} · {fact.costClass} · {fact.frequency === 'recurring' ? 'повторяющееся' : 'разовое'}</summary><p>{fact.description}</p><p>Количество: {fact.quantity === null ? 'неизвестно' : fact.quantity} · единица: {fact.unit}</p><p>Источник: {fact.source}</p><small>{fact.evaluationTimeBasis}</small></details>)}
    <h4>Фактические исходы обязательных сроков</h4>
    {data.work.deadlineOutcomes?.length ? data.work.deadlineOutcomes.map(outcome => <Row key={outcome.eventRef + outcome.deadlineId} title={outcome.title + ' · ' + (outcome.outcome === 'missed' ? 'срок пропущен' : 'срок соблюдён')}><p>Обещанный срок: {outcome.dueDate} · факт: {outcome.eventRef}</p><p>{outcome.evidence}</p></Row>) : <p className="sim-hint">На выбранный момент фактический исход срока не зафиксирован.</p>}
  </section>
}
