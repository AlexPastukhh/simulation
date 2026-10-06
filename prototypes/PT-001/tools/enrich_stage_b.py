import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'stage_b.json'

data = json.loads(DATA.read_text(encoding='utf-8'))

data['organizationEntities'] = [
    {'id': 'ORG-1', 'name': 'ProductTeam', 'kind': 'Team'},
    {'id': 'ORG-2', 'name': 'BillingOwnership', 'kind': 'OwnershipRelation'},
    {'id': 'ORG-3', 'name': 'BillingTeam', 'kind': 'Team', 'createdBy': 'SEVT-06'},
]

for event in data['branchEvents']:
    for relation in event.get('relations', []):
        if relation.get('organizationId') == 'ORG-BILLING':
            relation['organizationId'] = 'ORG-3'

# Stable ordering inside one branch response to one ScenarioEvent.
counters = {}
for event in data['branchEvents']:
    trigger = event['triggeredBy'][0]
    key = (event['branchScope'], trigger)
    counters[key] = counters.get(key, 0) + 1
    event['sequenceWithinTrigger'] = counters[key]

data['representationMappings'] = [
    {'branchScope':'BR-ROOT','effectiveAfter':'SEVT-01','semanticEntityId':'SEM-2','representationKey':'CANCEL_HANDLER','mappingRole':'authoritative'},

    {'branchScope':'BR-C-K','effectiveAfter':'SEVT-02','semanticEntityId':'SEM-2','representationKey':'CANCEL_HANDLER','mappingRole':'local_copy'},
    {'branchScope':'BR-C-K','effectiveAfter':'SEVT-02','semanticEntityId':'SEM-2','representationKey':'CHANGE_DATES_HANDLER','mappingRole':'local_copy'},
    {'branchScope':'BR-C-K','effectiveAfter':'SEVT-03','semanticEntityId':'SEM-2','representationKey':'ADMIN_CANCEL_HANDLER','mappingRole':'local_copy'},

    {'branchScope':'BR-C-P','effectiveAfter':'SEVT-02','semanticEntityId':'SEM-2','representationKey':'CANCELLATION_POLICY','mappingRole':'authoritative'},
    {'branchScope':'BR-C-P','effectiveAfter':'SEVT-02','semanticEntityId':'SEM-2','representationKey':'CANCEL_HANDLER','mappingRole':'consumer'},
    {'branchScope':'BR-C-P','effectiveAfter':'SEVT-02','semanticEntityId':'SEM-2','representationKey':'CHANGE_DATES_HANDLER','mappingRole':'consumer'},
    {'branchScope':'BR-C-P','effectiveAfter':'SEVT-03','semanticEntityId':'SEM-2','representationKey':'ADMIN_CANCEL_HANDLER','mappingRole':'consumer'},

    {'branchScope':'BR-KP','effectiveAfter':'SEVT-04','semanticEntityId':'SEM-3','representationKey':'PAYMENT_PORT','mappingRole':'authoritative_boundary'},
    {'branchScope':'BR-KP','effectiveAfter':'SEVT-04','semanticEntityId':'SEM-3','representationKey':'STRIPE_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-PP','effectiveAfter':'SEVT-04','semanticEntityId':'SEM-3','representationKey':'PAYMENT_PORT','mappingRole':'authoritative_boundary'},
    {'branchScope':'BR-PP','effectiveAfter':'SEVT-04','semanticEntityId':'SEM-3','representationKey':'STRIPE_ADAPTER','mappingRole':'adapter'},

    {'branchScope':'BR-KK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'PAYMENT_PORT','mappingRole':'authoritative_boundary'},
    {'branchScope':'BR-KK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'STRIPE_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-KK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'ADYEN_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-PK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'PAYMENT_PORT','mappingRole':'authoritative_boundary'},
    {'branchScope':'BR-PK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'STRIPE_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-PK','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'ADYEN_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-KP','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'ADYEN_ADAPTER','mappingRole':'adapter'},
    {'branchScope':'BR-PP','effectiveAfter':'SEVT-05','semanticEntityId':'SEM-3','representationKey':'ADYEN_ADAPTER','mappingRole':'adapter'},
]

scenario_semantics = {
    'SEVT-01': {'relations':[{'entityId':'SEM-2','type':'changes_semantics'}], 'semanticMutations':[{'targetId':'SEM-2','targetKind':'BusinessRule','mutationType':'modify','delta':'add VIP >= 12h cancellation rule'}]},
    'SEVT-02': {'relations':[{'entityId':'SEM-2','type':'changes_applicability'}], 'semanticMutations':[{'targetId':'SEM-2','targetKind':'BusinessRule','mutationType':'modify','delta':'apply policy to ChangeBookingDates'}]},
    'SEVT-03': {'relations':[{'entityId':'SEM-2','type':'changes_applicability'}], 'semanticMutations':[{'targetId':'SEM-2','targetKind':'BusinessRule','mutationType':'modify','delta':'apply policy to AdminCancel'}]},
    'SEVT-04': {'relations':[{'targetId':'INFO-1','type':'reveals'}], 'semanticMutations':[{'targetId':'INFO-1','targetKind':'InformationItem','mutationType':'modify','delta':'reveal medium-confidence second-provider forecast'}]},
    'SEVT-05': {'relations':[{'entityId':'SEM-3','type':'changes_requirement'}], 'semanticMutations':[{'targetId':'SEM-3','targetKind':'BusinessCapability','mutationType':'modify','delta':'require Stripe + Adyen'}]},
    'SEVT-06': {'relations':[{'targetId':'ORG-2','type':'changes_ownership'}], 'semanticMutations':[{'targetId':'ORG-2','targetKind':'OwnershipRelation','mutationType':'modify','delta':'Billing ownership ProductTeam -> BillingTeam'},{'targetId':'ORG-3','targetKind':'Team','mutationType':'create','delta':'create BillingTeam'}]},
    'SEVT-07': {'relations':[{'entityId':'SEM-6','type':'creates_requirement'}], 'semanticMutations':[{'targetId':'SEM-6','targetKind':'BusinessRule','mutationType':'create','delta':'failed billing attempts require retry behavior'}]},
    'SEVT-08': {'relations':[{'entityId':'SEM-2','type':'changes_semantics'}], 'semanticMutations':[{'targetId':'SEM-2','targetKind':'BusinessRule','mutationType':'modify','delta':'VIP cancellation window 12h -> 24h'}]},
}
for event in data['scenarioEvents']:
    event.update(scenario_semantics[event['id']])

data['workEpisodes'] = [
    {'id':'WE-ROOT-01','branchScope':'BR-ROOT','trigger':'SEVT-01','eventRefs':['BE-R-01','BE-R-02','BE-R-03']},
    {'id':'WE-CK-02','branchScope':'BR-C-K','trigger':'SEVT-02','eventRefs':['BE-CK-01','BE-CK-02','BE-CK-03']},
    {'id':'WE-CP-02','branchScope':'BR-C-P','trigger':'SEVT-02','eventRefs':['BE-CP-01','BE-CP-02','BE-CP-03']},
    {'id':'WE-CK-03','branchScope':'BR-C-K','trigger':'SEVT-03','eventRefs':['BE-CK-04']},
    {'id':'WE-CP-03','branchScope':'BR-C-P','trigger':'SEVT-03','eventRefs':['BE-CP-04']},
    {'id':'WE-KK-05','branchScope':'BR-KK','trigger':'SEVT-05','eventRefs':['BE-KK-02','BE-KK-03']},
    {'id':'WE-KP-05','branchScope':'BR-KP','trigger':'SEVT-05','eventRefs':['BE-KP-03']},
    {'id':'WE-PK-05','branchScope':'BR-PK','trigger':'SEVT-05','eventRefs':['BE-PK-02','BE-PK-03']},
    {'id':'WE-PP-05','branchScope':'BR-PP','trigger':'SEVT-05','eventRefs':['BE-PP-03']},
    {'id':'WE-CK-08','branchScope':'BR-C-K','trigger':'SEVT-08','eventRefs':['BE-CK-05']},
    {'id':'WE-CP-08','branchScope':'BR-C-P','trigger':'SEVT-08','eventRefs':['BE-CP-05']},
]

DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'enriched {DATA}')
print(f"branchEvents={len(data['branchEvents'])}")
print(f"representationMappings={len(data['representationMappings'])}")
print(f"workEpisodes={len(data['workEpisodes'])}")
