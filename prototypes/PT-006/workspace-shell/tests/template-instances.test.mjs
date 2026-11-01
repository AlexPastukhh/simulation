import test from 'node:test'
import assert from 'node:assert/strict'
import {instantiateEntity,summarizeInstance,createTemplateCatalog} from '../src/shell/templateInstances.ts'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE as architecture} from '../src/templates/content/feature-ddd-architecture-planning/template.ts'
const model=()=>({representation:'feature-ddd-planning',current:{representation:'feature-ddd',nodes:[]},steps:[]})
test('content instances have independent data and stable identity',()=>{
 const data=model()
 const a=instantiateEntity(architecture,'architecture-main','Architecture',data)
 a.data.current.nodes.push({id:'feature-a',title:'A',kind:'feature'})
 assert.equal(data.current.nodes.length,0)
 assert.equal(a.templateId,architecture.id)
 assert.deepEqual(a.origin,{kind:'template'})
})
test('instance creation requires identity and declared data fields',()=>{
 assert.throws(()=>instantiateEntity(architecture,'','Architecture',model()),/ID/);
 assert.throws(()=>instantiateEntity(architecture,'id','Architecture',{nodes:[]}),/fields/);
})
test('catalog returns summaries without copying data into metadata',()=>{
 const instance=instantiateEntity(architecture,'architecture-main','Architecture',model())
 const catalog=createTemplateCatalog([architecture],[summarizeInstance(instance)])
 assert.equal(catalog.instances[0].dataPresent,true)
 assert.equal('data' in catalog.instances[0],false)
 assert.throws(()=>createTemplateCatalog([architecture,architecture],[]),/template/i)
 assert.throws(()=>createTemplateCatalog([architecture],[summarizeInstance(instance),summarizeInstance(instance)]),/instance/i)
})
