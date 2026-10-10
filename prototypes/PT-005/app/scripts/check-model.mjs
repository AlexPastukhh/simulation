import { validateStageA, validateStageB, validateStageC, validateAll } from '../src/model.ts'
const stages = [['Stage A · core conditional plan',validateStageA],['Stage B · timeline and revision history',validateStageB],['Stage C · contextual fitness',validateStageC]]
for (const [label, validate] of stages) {
 const errors=validate()
 console.log(`${errors.length?'FAIL':'PASS'} · ${label} · ${errors.length} violations`)
 errors.forEach(error=>console.error('  ',error))
 if (errors.length)process.exitCode=1
}
if (validateAll().length===0)console.log('PASS · Integration gate A/B/C')
