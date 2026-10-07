import {
  compareRevisions,
  planKnowledge,
  actualStateAt,
  validateFixture,
  UNEXPECTED_REQUIREMENT,
} from '../src/model.ts'

const errors = validateFixture()
if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`)
  process.exit(1)
}

const summarize = (items) => Object.fromEntries(['realized', 'reused', 'revised', 'inserted', 'removed'].map((kind) => [kind, items.filter((item) => item.kind === kind).length]))

console.log('PT-003 invariant suite: PASS')
console.log('A R1 -> R2:', summarize(compareRevisions('A-R1', 'A-R2')))
console.log('B R1 -> R2:', summarize(compareRevisions('B-R1', 'B-R2')))
console.log('R1 knows unexpected requirement:', planKnowledge('A-R1').some((item) => item.ref === UNEXPECTED_REQUIREMENT.ref))
console.log('R2 knows unexpected requirement:', planKnowledge('A-R2').some((item) => item.ref === UNEXPECTED_REQUIREMENT.ref))
console.log('A CURRENT after first implementation:', actualStateAt('policyEarly', 'A-E03').currentArchitectureSnapshotRef)
