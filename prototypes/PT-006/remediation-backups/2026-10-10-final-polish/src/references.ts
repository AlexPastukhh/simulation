import type { DemoStore } from './content.ts'

export type ReferenceWarning = { path: string; target: string; message: string }
/** Draft diagnostics only. Structural validation and saving remain separate. */
export function referenceWarnings(data: DemoStore): ReferenceWarning[] {
  const warnings: ReferenceWarning[] = []
  const warn = (path: string, target: string, message: string) => warnings.push({ path, target, message })
  const events = new Set(data.events.records.map(e => e.id))
  const snapshots = new Set(data.architecture.snapshots.map(s => s.id))
  const steps = new Set(data.plan.steps.map(s => s.id))
  const routes = new Set(data.plan.steps.map(s => s.route))
  const units = new Set(data.architecture.snapshots.flatMap(s => s.responsibilities.map(r => r.id)))
  const files = new Set([...data.implementation.files.map(f => f.path), ...data.implementation.plannedEffects.map(f => f.path)])
  const requirements = new Set(data.requirements.items.map(r => r.id))
  if (!snapshots.has(data.architecture.currentRef)) warn('architecture.currentRef', data.architecture.currentRef, 'CURRENT не найден')
  if (!events.has(data.plan.basedOnActualEventRef)) warn('plan.basedOnActualEventRef', data.plan.basedOnActualEventRef, 'Событие BASE не найдено')
  for (const step of data.plan.steps) {
    if (!snapshots.has(step.targetSnapshotRef)) warn('plan.steps[' + step.id + '].targetSnapshotRef', step.targetSnapshotRef, 'Цель Step не найдена')
    const impact = data.impact.records.find(i => i.id === step.impactRef)
    if (!impact || impact.stepId !== step.id || impact.route !== step.route) warn('plan.steps[' + step.id + '].impactRef', step.impactRef, 'Impact не найден или относится к другому Step / route')
  }
  for (const effect of data.implementation.plannedEffects) if (!steps.has(effect.stepId)) warn('implementation.plannedEffects', effect.stepId, 'Step файлового эффекта не найден')
  for (const requirement of data.requirements.items) if (!events.has(requirement.knownFrom)) warn('requirements.items[' + requirement.id + '].knownFrom', requirement.knownFrom, 'Фактическое событие знания не найдено')
  for (const [index, link] of data.trace.links.entries()) {
    if (!requirements.has(link.requirementId)) warn('trace.links[' + index + '].requirementId', link.requirementId, 'Фактическое требование не найдено')
    if (!units.has(link.architectureRef)) warn('trace.links[' + index + '].architectureRef', link.architectureRef, 'Ответственность не найдена в текущих / плановых снимках')
    if (!files.has(link.filePath)) warn('trace.links[' + index + '].filePath', link.filePath, 'Файл не найден среди текущих файлов / плановых эффектов')
  }
  const activities = new Set(data.plan.activities?.map(activity => activity.id) ?? [])
  for (const activity of data.plan.activities ?? []) {
    if (!routes.has(activity.route)) warn('plan.activities[' + activity.id + '].route', activity.route, 'Маршрут не найден')
    for (const dependency of activity.dependsOn) if (!activities.has(dependency) && !steps.has(dependency)) warn('plan.activities[' + activity.id + '].dependsOn', dependency, 'Зависимость не найдена')
  }
  for (const expectation of data.plan.routeExpectations ?? []) {
    if (!routes.has(expectation.route)) warn('plan.routeExpectations.route', expectation.route, 'Маршрут не найден')
    for (const event of expectation.eventRefs) if (!events.has(event)) warn('plan.routeExpectations.eventRefs', event, 'Источник ожидания не найден')
  }
  for (const impact of data.impact.records) {
    if (!steps.has(impact.stepId)) warn('impact.records[' + impact.id + '].stepId', impact.stepId, 'Step не найден')
    for (const ref of impact.targetRefs) if (!units.has(ref)) warn('impact.records[' + impact.id + '].targetRefs', ref, 'Ответственность не найдена')
    for (const ref of impact.filePaths) if (!files.has(ref)) warn('impact.records[' + impact.id + '].filePaths', ref, 'Файл эффекта не найден')
  }
  for (const assessment of data.fitness.assessments) if (!routes.has(assessment.route)) warn('fitness.assessments[' + assessment.id + '].route', assessment.route, 'Маршрут оценки не найден')
  const episodes = new Set(data.work.episodes.map(ep => ep.id))
  for (const detail of data.work.details ?? []) if (!episodes.has(detail.episodeId)) warn('work.details[' + detail.id + '].episodeId', detail.episodeId, 'Эпизод работы не найден')
  for (const fact of data.work.costFacts ?? []) if (!episodes.has(fact.episodeId)) warn('work.costFacts[' + fact.id + '].episodeId', fact.episodeId, 'Эпизод затрат не найден')
  for (const outcome of data.work.deadlineOutcomes ?? []) {
    if (!events.has(outcome.eventRef)) warn('work.deadlineOutcomes.eventRef', outcome.eventRef, 'Событие результата не найдено')
    if (!data.history.revisions.some(r => r.plan.deadline.id === outcome.deadlineId)) warn('work.deadlineOutcomes.deadlineId', outcome.deadlineId, 'Обязательство не найдено в ревизиях')
  }
  return warnings
}
