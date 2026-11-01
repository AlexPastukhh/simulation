import test from 'node:test'
import assert from 'node:assert/strict'
import {FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE} from '../src/templates/content/feature-ddd-architecture-planning/template.ts'
import {validateFeatureArchitecture,validateArchitecturePlanning} from '../src/templates/content/feature-ddd-architecture-planning/model.ts'
import {SITE_REQUIREMENTS_MODEL_TEMPLATE} from '../src/templates/content/site-requirements-model/template.ts'
import {validateSiteRequirementsModel} from '../src/templates/content/site-requirements-model/model.ts'
import {instantiateEntity} from '../src/shell/templateInstances.ts'

test('architecture planning and site requirements are distinct reusable Content classes',()=>{
  const a=FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE
  const r=SITE_REQUIREMENTS_MODEL_TEMPLATE
  assert.notEqual(a.id,r.id)
  assert.equal(a.level,'content')
  assert.equal(r.level,'content')
  assert.equal(a.profileId,r.profileId)
  assert.equal(a.fields.includes('representation'),true)
  assert.equal(r.fields.includes('requirements'),true)
})
test('one Feature/DDD class can have different filled instances, including shared DDD assets',()=>{
  const model={representation:'feature-ddd',nodes:[
    {id:'booking',kind:'feature',title:'Бронирование'},
    {id:'booking-aggregate',kind:'aggregate',title:'Booking',parentId:'booking'},
    {id:'audit',kind:'shared-service',title:'Audit',usedByFeatureIds:['booking']},
  ]}
  assert.equal(validateFeatureArchitecture(model),true)
  assert.equal(validateFeatureArchitecture(model),true)
  const a=instantiateEntity(FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE,'A-arch','Architecture A',{representation:'feature-ddd-planning',current:model,steps:[]})
  const b=instantiateEntity(FEATURE_DDD_ARCHITECTURE_PLANNING_TEMPLATE,'B-arch','Architecture B',{representation:'feature-ddd-planning',current:model,steps:[]})
  b.data.current.nodes[0].title='Отдельный план'
  assert.equal(a.data.current.nodes[0].title,'Бронирование')
  assert.equal(validateArchitecturePlanning(a.data),true)
})
test('site requirements allow text-only and repeated occurrences without compulsory widgets/screens',()=>{
  const r={representation:'site-requirements',requirements:[
    {id:'req-1',text:'Поддержать отмену бронирования'},
    {id:'req-2',text:'Поддержать отмену бронирования'},
  ]}
  assert.equal(validateSiteRequirementsModel(r),true)
  const instance=instantiateEntity(SITE_REQUIREMENTS_MODEL_TEMPLATE,'site-requirements','Требования сайта',r)
  assert.deepEqual(instance.data.requirements.map(x=>x.text),
    ['Поддержать отмену бронирования','Поддержать отмену бронирования'])
  assert.equal(validateSiteRequirementsModel(instance.data),true)
  assert.equal(validateSiteRequirementsModel({...r,requirements:[{id:'dup',text:'A'},{id:'dup',text:'B'}]}),false)
})


test('identical Widget and Behavior Unit occurrences on two Screens remain separate',()=>{
  const model={representation:'site-requirements',requirements:[
    {id:'r-1',text:'Подтверждать заказ'},
    {id:'r-2',text:'Подтверждать заказ'},
  ],artifacts:[
    {id:'scenario-1',kind:'scenario',title:'Заказ'},
    {id:'actor-1',kind:'actor',title:'Покупатель'},
    {id:'goal-1',kind:'goal',title:'Оформить заказ'},
    {id:'step-1',kind:'step',title:'Проверить состав'},
    {id:'screen-1',kind:'screen',title:'Заказ'},
    {id:'screen-2',kind:'screen',title:'Повторить заказ'},
    {id:'widget-1',kind:'widget',title:'Подтвердить',parentOccurrenceId:'screen-1',
      requirementIds:['r-1','r-2']},
    {id:'widget-2',kind:'widget',title:'Подтвердить',parentOccurrenceId:'screen-2',
      requirementIds:['r-2']},
    {id:'behavior-1',kind:'behavior-unit',title:'Проверить заказ',parentOccurrenceId:'widget-1'},
    {id:'behavior-2',kind:'behavior-unit',title:'Проверить заказ',parentOccurrenceId:'widget-2'},
  ]}
  assert.equal(validateSiteRequirementsModel(model),true)
  const instance=instantiateEntity(SITE_REQUIREMENTS_MODEL_TEMPLATE,'site-A','Сайт',model)
  const byId=id=>instance.data.artifacts.find(a=>a.id===id)
  byId('widget-1').title='Изменено только первое появление'
  assert.equal(byId('widget-2').title,'Подтвердить')
  assert.notEqual(byId('behavior-1').id,byId('behavior-2').id)
  assert.deepEqual(instance.data.artifacts.filter(a=>a.kind==='widget')
    .map(a=>a.parentOccurrenceId),['screen-1','screen-2'])
  assert.deepEqual(byId('widget-1').requirementIds,['r-1','r-2'])
  assert.equal('contexts' in instance.data,false)
  assert.equal(instance.data.artifacts.some(a=>'contextRefs' in a||
    'statedSameAsOccurrenceIds' in a),false)
})

test('removed context and equivalence fields are rejected, even as runtime input',()=>{
  const base={representation:'site-requirements',
    requirements:[{id:'r',text:'Использовать тот же виджет'}],
    artifacts:[{id:'w1',kind:'widget',title:'Кнопка'},
      {id:'w2',kind:'widget',title:'Кнопка'}]}
  assert.equal(validateSiteRequirementsModel(base),true)
  assert.equal(validateSiteRequirementsModel({...base,contexts:[]}),false)
  assert.equal(validateSiteRequirementsModel({...base,requirements:[
    {...base.requirements[0],contextRefs:['scenario']},
  ]}),false)
  assert.equal(validateSiteRequirementsModel({...base,artifacts:[
    {...base.artifacts[0],contextRefs:[]},base.artifacts[1],
  ]}),false)
  assert.equal(validateSiteRequirementsModel({...base,artifacts:[
    {...base.artifacts[0],statedSameAsOccurrenceIds:['w2']},base.artifacts[1],
  ]}),false)
})

test('invalid occurrence references do not silently normalize product placements',()=>{
  const base={representation:'site-requirements',
    requirements:[{id:'r',text:'Confirm order'}],
    artifacts:[
      {id:'s1',kind:'screen',title:'Screen 1'},
      {id:'s2',kind:'screen',title:'Screen 2'},
      {id:'w1',kind:'widget',title:'Button',parentOccurrenceId:'s1'},
      {id:'w2',kind:'widget',title:'Button',parentOccurrenceId:'s2'},
    ]}
  const withArtifacts=artifacts=>({...base,artifacts})
  assert.equal(validateSiteRequirementsModel(base),true)
  assert.equal(validateSiteRequirementsModel(withArtifacts([
    ...base.artifacts,{id:'w1',kind:'widget',title:'Same ID, second placement',parentOccurrenceId:'s2'},
  ])),false)
  assert.equal(validateSiteRequirementsModel(withArtifacts(
    base.artifacts.map(a=>a.id==='w2'?{...a,parentOccurrenceId:['s1','s2']}:a))),false)
  assert.equal(validateSiteRequirementsModel(withArtifacts(
    base.artifacts.map(a=>a.id==='w2'?{...a,parentOccurrenceId:'absent'}:a))),false)
  assert.equal(validateSiteRequirementsModel(withArtifacts(
    base.artifacts.map(a=>a.id==='w2'?{...a,requirementIds:['absent']}:a))),false)
  assert.equal(validateSiteRequirementsModel(withArtifacts(
    base.artifacts.map(a=>a.id==='s1'?{...a,parentOccurrenceId:'w1'}:a))),false)
})

test('closed requirement shapes reject sameAs, canonical objects and unknown fields at every level',()=>{
  const base={representation:'site-requirements',requirements:[{id:'r',text:'R'}],artifacts:[
    {id:'w1',kind:'widget',title:'Button'},{id:'w2',kind:'widget',title:'Button'},
  ]}
  for(const field of ['sameAs','canonicalId','canonicalOccurrence','contexts','contextRefs','statedSameAsOccurrenceIds']){
    assert.equal(validateSiteRequirementsModel({...base,[field]:[]}),false,field+' on model')
    assert.equal(validateSiteRequirementsModel({...base,requirements:[{...base.requirements[0],[field]:'w2'}]}),false,field+' on requirement')
    assert.equal(validateSiteRequirementsModel({...base,artifacts:[{...base.artifacts[0],[field]:'w2'},base.artifacts[1]]}),false,field+' on artifact')
  }
  assert.equal(validateSiteRequirementsModel({...base,artifacts:null}),false)
  assert.equal(validateSiteRequirementsModel(null),false)
  assert.equal(validateSiteRequirementsModel('site-requirements'),false)
})
test('declared optional requirement fields accept their types and reject malformed saved values',()=>{
  const base={representation:'site-requirements',requirements:[{
    id:'r',text:'R',acceptance:['Observed outcome'],uncertainty:'Open question',knownFromEventId:'fact-1',
  }]}
  assert.equal(validateSiteRequirementsModel(base),true)
  for(const [field,bad] of [['acceptance',42],['acceptance',['ok',42]],['acceptance',null],
    ['uncertainty',{}],['knownFromEventId',[]]]){
    assert.equal(validateSiteRequirementsModel({...base,requirements:[{...base.requirements[0],[field]:bad}]}),false)
  }
})
