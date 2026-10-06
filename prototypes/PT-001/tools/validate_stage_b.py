import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data' / 'stage_b.json'
REPORT = ROOT / 'data' / 'stage_b_validation_report.md'
data = json.loads(DATA.read_text(encoding='utf-8'))

errors = []
warnings = []

def unique_ids(items, key, label):
    ids = [x[key] for x in items]
    dup = [k for k, v in Counter(ids).items() if v > 1]
    if dup:
        errors.append(f'{label} duplicate IDs: {dup}')
    return set(ids)

scenario_ids = unique_ids(data['scenarioEvents'], 'id', 'ScenarioEvent')
branch_ids = unique_ids(data['branches'], 'id', 'Branch')
event_ids = unique_ids(data['branchEvents'], 'id', 'BranchEvent')
semantic_ids = unique_ids(data['semanticEntities'], 'id', 'SemanticEntity')

operation_ids = []
for event in data['branchEvents']:
    operation_ids.extend(op['id'] for op in event.get('operations', []))
dupe_ops = [k for k, v in Counter(operation_ids).items() if v > 1]
if dupe_ops:
    errors.append(f'ImplementationOperation duplicate IDs: {dupe_ops}')

parents = {b['id']: b['parentId'] for b in data['branches']}
for branch_id, parent_id in parents.items():
    if parent_id is not None and parent_id not in branch_ids:
        errors.append(f'Unknown parent {parent_id} for {branch_id}')

def ancestors(branch_id):
    out = []
    seen = set()
    cur = branch_id
    while cur is not None:
        if cur in seen:
            errors.append(f'Branch cycle involving {cur}')
            break
        seen.add(cur)
        out.append(cur)
        cur = parents.get(cur)
    return out

for branch_id in branch_ids:
    ancestors(branch_id)

for event in data['branchEvents']:
    if event['branchScope'] not in branch_ids:
        errors.append(f"{event['id']} unknown branchScope {event['branchScope']}")
    for trigger in event.get('triggeredBy', []):
        if trigger not in scenario_ids:
            errors.append(f"{event['id']} unknown trigger {trigger}")
    if event['role'] == 'state_change' and not event.get('mutations'):
        errors.append(f"{event['id']} state_change has no mutations")
    if event['category'] in {'analysis', 'coordination', 'test'} and event.get('mutations'):
        errors.append(f"{event['id']} {event['category']} unexpectedly mutates state")
    if event['role'] == 'decision' and event.get('mutations'):
        errors.append(f"{event['id']} decision directly mutates state")

for mapping in data.get('representationMappings', []):
    if mapping['branchScope'] not in branch_ids:
        errors.append(f"Mapping unknown branch {mapping['branchScope']}")
    if mapping['semanticEntityId'] not in semantic_ids:
        errors.append(f"Mapping unknown semantic entity {mapping['semanticEntityId']}")
    if mapping['effectiveAfter'] not in scenario_ids:
        errors.append(f"Mapping unknown effectiveAfter {mapping['effectiveAfter']}")

episode_ids = unique_ids(data.get('workEpisodes', []), 'id', 'WorkEpisode')
event_by_id = {e['id']: e for e in data['branchEvents']}
for ep in data.get('workEpisodes', []):
    if ep['branchScope'] not in branch_ids:
        errors.append(f"{ep['id']} unknown branchScope {ep['branchScope']}")
    if ep['trigger'] not in scenario_ids:
        errors.append(f"{ep['id']} unknown trigger {ep['trigger']}")
    for ref in ep['eventRefs']:
        if ref not in event_ids:
            errors.append(f"{ep['id']} unknown event ref {ref}")
            continue
        event_scope = event_by_id[ref]['branchScope']
        if event_scope not in ancestors(ep['branchScope']):
            errors.append(f"{ep['id']} references non-inherited event {ref} ({event_scope})")

leaf_ids = ['BR-KK', 'BR-KP', 'BR-PK', 'BR-PP']
leaf_stats = {}
for leaf in leaf_ids:
    path = set(ancestors(leaf))
    events = [e for e in data['branchEvents'] if e['branchScope'] in path]
    ops = [op for e in events for op in e.get('operations', [])]
    leaf_stats[leaf] = {
        'events': len(events),
        'operations': len(ops),
        'mutating_events': sum(1 for e in events if e.get('mutations')),
        'relation_only_events': sum(1 for e in events if e.get('relations') and not e.get('mutations')),
        'operation_types': dict(sorted(Counter(op['type'] for op in ops).items())),
    }

# Diagnostic evidence for 1:N semantic representation.
cancellation_local = [m for m in data['representationMappings'] if m['branchScope'] == 'BR-C-K' and m['semanticEntityId'] == 'SEM-2' and m['mappingRole'] == 'local_copy']
cancellation_central = [m for m in data['representationMappings'] if m['branchScope'] == 'BR-C-P' and m['semanticEntityId'] == 'SEM-2' and m['mappingRole'] == 'authoritative']
if len(cancellation_local) < 3:
    warnings.append('Expected 1:N cancellation mapping has fewer than 3 local copies')
if len(cancellation_central) != 1:
    warnings.append('Expected exactly one authoritative centralized CancellationPolicy mapping')

lines = [
    '# PT-001 Stage B — Validation Report',
    '',
    '## Result',
    '',
    f"`{'PASS' if not errors else 'FAIL'}`",
    '',
    f'- errors: {len(errors)}',
    f'- warnings: {len(warnings)}',
    f"- ScenarioEvents: {len(data['scenarioEvents'])}",
    f"- BranchEvents: {len(data['branchEvents'])}",
    f"- ImplementationOperations: {len(operation_ids)}",
    f"- WorkEpisodes: {len(data.get('workEpisodes', []))}",
    f"- RepresentationMappings: {len(data.get('representationMappings', []))}",
    '',
    '## Leaf branch diagnostics',
    '',
    '| Branch | inherited events | operations | mutating events | relation-only events |',
    '|---|---:|---:|---:|---:|',
]
for leaf in leaf_ids:
    s = leaf_stats[leaf]
    lines.append(f"| {leaf} | {s['events']} | {s['operations']} | {s['mutating_events']} | {s['relation_only_events']} |")

lines += [
    '',
    'Event count is diagnostic only and is **not** treated as cost.',
    '',
    '## Cancellation representation check',
    '',
    f'- BR-C-K local copies for SEM-2: {len(cancellation_local)}',
    f'- BR-C-P authoritative representations for SEM-2: {len(cancellation_central)}',
    '',
    '## Errors',
    '',
]
lines += [f'- {x}' for x in errors] or ['- none']
lines += ['', '## Warnings', '']
lines += [f'- {x}' for x in warnings] or ['- none']
lines += [
    '',
    '## Interpretation boundary',
    '',
    'A PASS here means the Stage B dataset is internally consistent enough to proceed to UI projection.',
    'It does **not** prove that the event model, WorkEpisode model, or UI is correct.',
    'Those questions remain for Stages C–E.',
]

REPORT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('\n'.join(lines[:30]))
if errors:
    raise SystemExit(1)
