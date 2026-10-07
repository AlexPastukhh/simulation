export type ArchitectureId = 'policyEarly' | 'handlerFirst'
export type ActualScope = 'shared' | 'branch'
export type ActualRole = 'knowledge' | 'planning' | 'implementation' | 'experiment'
export type OptionStatus = 'known' | 'triggered' | 'instantiated'

export type RequirementMaterialBlock = {
  ref: string
  form: 'scenario' | 'requirement' | 'constraint' | 'uncertainty' | 'note'
  context: string
  title: string
  lines: string[]
  effective?: string
  status?: string
}

export type BehaviorResponsibilityUnit = {
  id: string
  title: string
  responsibility: string[]
  requirementRefs: string[]
  provenance?: 'existing' | 'architecture-introduced'
}

export type ArchitectureDependency = {
  from: string
  to: string
  label: string
}

export type ArchitectureSnapshot = {
  id: string
  title: string
  summary: string
  brus: BehaviorResponsibilityUnit[]
  dependencies: ArchitectureDependency[]
  notes: string[]
}

export type EvolutionImpact = {
  targetId: string
  change: 'add' | 'modify' | 'remove' | 'split' | 'replace' | 'rewire' | 'migrate'
  description: string
}

export type EvolutionStepVersion = {
  ref: string
  lineageId: string
  version: number
  title: string
  rationale: string
  requirementRefs: string[]
  predecessorRefs: string[]
  targetSnapshotRef: string
  impacts: EvolutionImpact[]
  revisedFrom?: string
  realizedByEventId?: string
}

export type EvolutionMapRevision = {
  id: string
  architectureId: ArchitectureId
  label: string
  createdByEventId: string
  basedOnActualEventId: string
  baseArchitectureSnapshotRef: string
  parentRevisionId?: string
  stepVersionRefs: string[]
}

export type EvolutionOption = {
  id: string
  title: string
  knownAtEventId: string
  trigger: string
  rationale: string
  intendedTransformation: string
  expectedUnaffected: string[]
  instantiatedStepByArchitecture: Partial<Record<ArchitectureId, string>>
}

export type ActualMutation =
  | { kind: 'requirement-upsert'; value: RequirementMaterialBlock; delta: string }
  | { kind: 'current-architecture-set'; architectureId: ArchitectureId; snapshotRef: string; delta: string }
  | { kind: 'plan-revision-create'; architectureId: ArchitectureId; revisionId: string; delta: string }
  | { kind: 'option-status'; optionId: string; status: OptionStatus; delta: string }

export type ActualEvent = {
  id: string
  logicalOrder: number
  comparisonKey: string
  scope: ActualScope
  branch?: ArchitectureId
  role: ActualRole
  title: string
  description: string
  mutations: ActualMutation[]
}

export type ActualState = {
  requirements: RequirementMaterialBlock[]
  currentArchitectureSnapshotRef: string
  availablePlanRevisionIds: string[]
  activePlanRevisionId?: string
  optionStatuses: Record<string, OptionStatus>
}

export const ARCHITECTURES: Record<ArchitectureId, { label: string; short: string; description: string }> = {
  policyEarly: {
    label: 'Architecture A · explicit policy boundary early',
    short: 'Policy boundary early',
    description: 'Eligibility policy is separated during the first planned change. This adds structure earlier but gives later policy variants a local home.',
  },
  handlerFirst: {
    label: 'Architecture B · keep policy inside booking action',
    short: 'Handler first',
    description: 'The first change stays simple: booking actions own cancellation eligibility. Policy extraction is deliberately postponed until a known later requirement needs it.',
  },
}

const req = (block: RequirementMaterialBlock): RequirementMaterialBlock => block
const bru = (unit: BehaviorResponsibilityUnit): BehaviorResponsibilityUnit => unit
const snap = (snapshot: ArchitectureSnapshot): ArchitectureSnapshot => snapshot
const step = (value: EvolutionStepVersion): EvolutionStepVersion => value

export const INITIAL_REQUIREMENTS: RequirementMaterialBlock[] = [
  req({
    ref: 'Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]',
    form: 'requirement',
    context: 'Scenario: customer cancels booking · Step: confirm cancellation',
    title: 'Customer cancellation eligibility',
    lines: ['Customer may cancel while the booking is inside the current cancellation window.', 'After success the operator-facing status must show Cancelled.'],
  }),
  req({
    ref: 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]',
    form: 'requirement',
    context: 'Scenario: admin cancels booking · Step: confirm cancellation',
    title: 'Admin can cancel an eligible booking',
    lines: ['Admin uses the same currently-known eligibility rule as the customer flow.', 'No bypass behavior is known yet.'],
  }),
  req({
    ref: 'ProductNote[cancellation-status-visible]',
    form: 'note',
    context: 'Booking details / operational visibility',
    title: 'Final cancellation status remains visible',
    lines: ['Booking details show the final cancellation state after completion.'],
  }),
  req({
    ref: 'FutureRequirement[product-specific-window]',
    form: 'constraint',
    context: 'Known future commercial rule',
    title: 'Cancellation window will vary by booking product',
    lines: ['The rule is known now but becomes effective next quarter.', 'Architecture may prepare now or migrate later.'],
    effective: 'next quarter',
    status: 'known now · effective later',
  }),
  req({
    ref: 'Experiment[confirmation-surface]',
    form: 'uncertainty',
    context: 'Usability experiment',
    title: 'Confirmation surface is not committed yet',
    lines: ['Acceptable variants: separate confirmation page or inline drawer.', 'The experiment result is not known yet.'],
    status: 'open experiment',
  }),
]

export const UNEXPECTED_REQUIREMENT = req({
  ref: 'Scenario[AdminCancellation]/Step[Confirm]/requirement[override-with-reason]',
  form: 'requirement',
  context: 'Unexpected admin-policy requirement discovered after the first implementation',
  title: 'Authorized admin may bypass the normal window with a recorded reason',
  lines: ['The operator must enter a reason.', 'Authorized admin cancellation may bypass the normal customer window.', 'This requirement was not known when Plan R1 was created.'],
  status: 'newly known',
})

export const RESOLVED_EXPERIMENT = req({
  ref: 'Experiment[confirmation-surface]',
  form: 'uncertainty',
  context: 'Usability experiment',
  title: 'Confirmation surface resolved: inline drawer',
  lines: ['Experiment result selects the inline drawer.', 'The requirement knowledge changed; architecture still changes only after a Planning Event.'],
  status: 'resolved at E06',
})

const A0 = snap({
  id: 'A0',
  title: 'Legacy booking cancellation',
  summary: 'Customer cancellation exists; admin cancellation is not implemented yet. Eligibility logic sits in BookingActions.',
  brus: [
    bru({ id: 'BRU-BOOKING-ACTIONS', title: 'BookingActions', responsibility: ['Customer cancellation command', 'Current cancellation-window check'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]'], provenance: 'existing' }),
    bru({ id: 'BRU-STATUS', title: 'CancellationStatus', responsibility: ['Expose final cancellation state'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'existing' }),
  ],
  dependencies: [{ from: 'BRU-BOOKING-ACTIONS', to: 'BRU-STATUS', label: 'writes final cancellation state' }],
  notes: ['Same factual starting architecture for both alternatives.'],
})

const A1_POLICY = snap({
  id: 'A1-POLICY',
  title: 'Admin cancellation with explicit policy responsibility',
  summary: 'Admin cancellation is added and eligibility responsibility is extracted early.',
  brus: [
    bru({ id: 'BRU-BOOKING-ACTIONS', title: 'BookingActions', responsibility: ['Customer cancellation command', 'Admin cancellation command'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]', 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]'], provenance: 'existing' }),
    bru({ id: 'BRU-CANCEL-POLICY', title: 'CancellationPolicy', responsibility: ['Evaluate current cancellation window'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]', 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]', 'FutureRequirement[product-specific-window]'], provenance: 'architecture-introduced' }),
    bru({ id: 'BRU-STATUS', title: 'CancellationStatus', responsibility: ['Expose final cancellation state'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'existing' }),
  ],
  dependencies: [
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-POLICY', label: 'asks eligibility' },
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-STATUS', label: 'writes final state' },
  ],
  notes: ['Policy boundary exists before product-specific windows become effective.'],
})

const A1_HANDLER = snap({
  id: 'A1-HANDLER',
  title: 'Admin cancellation kept inside BookingActions',
  summary: 'Admin cancellation is added without introducing a separate policy responsibility.',
  brus: [
    bru({ id: 'BRU-BOOKING-ACTIONS', title: 'BookingActions', responsibility: ['Customer cancellation command', 'Admin cancellation command', 'Current cancellation-window check'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]', 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]'], provenance: 'existing' }),
    bru({ id: 'BRU-STATUS', title: 'CancellationStatus', responsibility: ['Expose final cancellation state'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'existing' }),
  ],
  dependencies: [{ from: 'BRU-BOOKING-ACTIONS', to: 'BRU-STATUS', label: 'writes final state' }],
  notes: ['Policy extraction remains a planned later migration for the known product-window change.'],
})

const A2_POLICY = snap({
  id: 'A2-POLICY',
  title: 'Product-specific windows',
  summary: 'The existing policy responsibility gains product-specific cancellation windows.',
  brus: [
    ...A1_POLICY.brus.map((unit) => unit.id === 'BRU-CANCEL-POLICY'
      ? bru({ ...unit, responsibility: ['Evaluate cancellation window by booking product'] })
      : unit),
  ],
  dependencies: A1_POLICY.dependencies,
  notes: ['This target existed in R1 and can remain unchanged in R2 because the unexpected admin override is scheduled after it.'],
})

const A2_POLICY_OVERRIDE = snap({
  id: 'A2-POLICY-OVERRIDE',
  title: 'Product windows + admin override',
  summary: 'Admin bypass is added as a variation inside the existing policy responsibility.',
  brus: A2_POLICY.brus.map((unit) => unit.id === 'BRU-CANCEL-POLICY'
    ? bru({ ...unit, responsibility: ['Evaluate cancellation window by booking product', 'Allow authorized admin bypass when a reason is recorded'], requirementRefs: [...unit.requirementRefs, UNEXPECTED_REQUIREMENT.ref] })
    : unit),
  dependencies: A2_POLICY.dependencies,
  notes: ['Unexpected behavior is localized to CancellationPolicy plus reason capture in the booking action.'],
})

const A3_POLICY_V1 = snap({
  id: 'A3-POLICY-V1',
  title: 'Cancellation audit on original plan',
  summary: 'Audit records policy outcome under the knowledge available to Plan R1.',
  brus: [
    ...A2_POLICY.brus,
    bru({ id: 'BRU-CANCEL-AUDIT', title: 'CancellationAudit', responsibility: ['Record cancellation outcome'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...A2_POLICY.dependencies, { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-AUDIT', label: 'records cancellation outcome' }],
  notes: ['Does not contain the later unknown admin-reason semantics.'],
})

const A3_POLICY_V2 = snap({
  id: 'A3-POLICY-V2',
  title: 'Cancellation audit after admin override discovery',
  summary: 'Audit also records admin bypass reason, so the old full target snapshot cannot be reused unchanged.',
  brus: [
    ...A2_POLICY_OVERRIDE.brus,
    bru({ id: 'BRU-CANCEL-AUDIT', title: 'CancellationAudit', responsibility: ['Record cancellation outcome', 'Record admin bypass reason when present'], requirementRefs: ['ProductNote[cancellation-status-visible]', UNEXPECTED_REQUIREMENT.ref], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...A2_POLICY_OVERRIDE.dependencies, { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-AUDIT', label: 'records outcome + optional admin reason' }],
  notes: ['Same conceptual audit step, new exact step version because the full target snapshot changed.'],
})

const A4_POLICY_UI = snap({
  id: 'A4-POLICY-UI',
  title: 'Inline confirmation drawer',
  summary: 'The experiment option is activated after its factual result is known and a new plan revision is created.',
  brus: [
    ...A3_POLICY_V2.brus,
    bru({ id: 'BRU-CANCEL-PRESENTATION', title: 'CancellationPresentation', responsibility: ['Render inline confirmation drawer'], requirementRefs: ['Experiment[confirmation-surface]'], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...A3_POLICY_V2.dependencies, { from: 'BRU-CANCEL-PRESENTATION', to: 'BRU-BOOKING-ACTIONS', label: 'invokes cancellation command' }],
  notes: ['Option activation changes presentation responsibility; domain cancellation policy remains intact.'],
})

const B2_OLD = snap({
  id: 'B2-OLD',
  title: 'Planned policy extraction for product windows',
  summary: 'Original R1 target: extract eligibility only when product-specific windows become effective.',
  brus: [
    bru({ id: 'BRU-BOOKING-ACTIONS', title: 'BookingActions', responsibility: ['Customer cancellation command', 'Admin cancellation command'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]', 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]'], provenance: 'existing' }),
    bru({ id: 'BRU-CANCEL-POLICY', title: 'CancellationPolicy', responsibility: ['Evaluate cancellation window by booking product'], requirementRefs: ['FutureRequirement[product-specific-window]'], provenance: 'architecture-introduced' }),
    bru({ id: 'BRU-STATUS', title: 'CancellationStatus', responsibility: ['Expose final cancellation state'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'existing' }),
  ],
  dependencies: [
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-POLICY', label: 'asks eligibility' },
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-STATUS', label: 'writes final state' },
  ],
  notes: ['Original future target knows nothing about admin bypass.'],
})

const B2_NEW = snap({
  id: 'B2-NEW',
  title: 'Earlier, broader policy extraction',
  summary: 'Unexpected admin bypass forces the extraction step to change scope and target state.',
  brus: [
    bru({ id: 'BRU-BOOKING-ACTIONS', title: 'BookingActions', responsibility: ['Customer cancellation command', 'Admin cancellation command', 'Capture admin bypass reason'], requirementRefs: ['Scenario[CancelBooking]/Step[Confirm]/requirement[customer-eligibility]', 'Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]', UNEXPECTED_REQUIREMENT.ref], provenance: 'existing' }),
    bru({ id: 'BRU-CANCEL-POLICY', title: 'CancellationPolicy', responsibility: ['Evaluate cancellation window by booking product', 'Allow authorized admin bypass when a reason is recorded'], requirementRefs: ['FutureRequirement[product-specific-window]', UNEXPECTED_REQUIREMENT.ref], provenance: 'architecture-introduced' }),
    bru({ id: 'BRU-STATUS', title: 'CancellationStatus', responsibility: ['Expose final cancellation state'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'existing' }),
  ],
  dependencies: [
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-POLICY', label: 'asks eligibility + override decision' },
    { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-STATUS', label: 'writes final state' },
  ],
  notes: ['The planned migration now has to absorb an unforeseen variation as well as the known product-window change.'],
})

const B2_MIGRATION = snap({
  id: 'B2-MIGRATION',
  title: 'Temporary compatibility during extraction',
  summary: 'Old in-handler checks and the new policy coexist while call sites are migrated.',
  brus: [
    ...B2_NEW.brus,
    bru({ id: 'BRU-LEGACY-ELIGIBILITY', title: 'LegacyEligibilityCompatibility', responsibility: ['Keep old handler checks valid during migration'], requirementRefs: [], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...B2_NEW.dependencies, { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-LEGACY-ELIGIBILITY', label: 'temporary compatibility path' }],
  notes: ['Temporary duplication is explicit and later retired.'],
})

const B3_OLD = snap({
  id: 'B3-OLD',
  title: 'Audit after original extraction',
  summary: 'Original R1 audit target after the known product-window migration.',
  brus: [
    ...B2_OLD.brus,
    bru({ id: 'BRU-CANCEL-AUDIT', title: 'CancellationAudit', responsibility: ['Record cancellation outcome'], requirementRefs: ['ProductNote[cancellation-status-visible]'], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...B2_OLD.dependencies, { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-AUDIT', label: 'records outcome' }],
  notes: ['Original target excludes admin bypass reason.'],
})

const B3_NEW = snap({
  id: 'B3-NEW',
  title: 'Retire compatibility + audit bypass reason',
  summary: 'The later target changes because the new requirement and temporary migration must both be absorbed.',
  brus: [
    ...B2_NEW.brus,
    bru({ id: 'BRU-CANCEL-AUDIT', title: 'CancellationAudit', responsibility: ['Record cancellation outcome', 'Record admin bypass reason when present'], requirementRefs: ['ProductNote[cancellation-status-visible]', UNEXPECTED_REQUIREMENT.ref], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...B2_NEW.dependencies, { from: 'BRU-BOOKING-ACTIONS', to: 'BRU-CANCEL-AUDIT', label: 'records outcome + optional admin reason' }],
  notes: ['LegacyEligibilityCompatibility is gone: the state is intentionally non-monotonic.'],
})

const B4_UI = snap({
  id: 'B4-UI',
  title: 'Inline confirmation drawer',
  summary: 'The resolved UI option is appended after the replanned migration path.',
  brus: [
    ...B3_NEW.brus,
    bru({ id: 'BRU-CANCEL-PRESENTATION', title: 'CancellationPresentation', responsibility: ['Render inline confirmation drawer'], requirementRefs: ['Experiment[confirmation-surface]'], provenance: 'architecture-introduced' }),
  ],
  dependencies: [...B3_NEW.dependencies, { from: 'BRU-CANCEL-PRESENTATION', to: 'BRU-BOOKING-ACTIONS', label: 'invokes cancellation command' }],
  notes: ['Presentation option is independent of the policy-migration strategy.'],
})

export const ARCHITECTURE_SNAPSHOTS: Record<string, ArchitectureSnapshot> = Object.fromEntries([
  A0, A1_POLICY, A1_HANDLER, A2_POLICY, A2_POLICY_OVERRIDE, A3_POLICY_V1, A3_POLICY_V2, A4_POLICY_UI,
  B2_OLD, B2_NEW, B2_MIGRATION, B3_OLD, B3_NEW, B4_UI,
].map((item) => [item.id, item]))

export const STEP_VERSIONS: Record<string, EvolutionStepVersion> = Object.fromEntries([
  step({
    ref: 'STEP-ADMIN-POLICY@v1', lineageId: 'STEP-ADMIN-POLICY', version: 1,
    title: 'Add admin cancellation + explicit policy boundary',
    rationale: 'Implement the known admin flow and prepare the already-known future product-window variation.',
    requirementRefs: ['Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]', 'FutureRequirement[product-specific-window]'],
    predecessorRefs: [], targetSnapshotRef: 'A1-POLICY',
    impacts: [
      { targetId: 'BRU-BOOKING-ACTIONS', change: 'modify', description: 'Add admin cancellation command.' },
      { targetId: 'BRU-CANCEL-POLICY', change: 'add', description: 'Extract cancellation eligibility responsibility.' },
    ], realizedByEventId: 'A-E03',
  }),
  step({
    ref: 'STEP-PRODUCT-WINDOWS-A@v1', lineageId: 'STEP-PRODUCT-WINDOWS-A', version: 1,
    title: 'Add product-specific cancellation windows',
    rationale: 'Known future rule becomes active.',
    requirementRefs: ['FutureRequirement[product-specific-window]'], predecessorRefs: ['STEP-ADMIN-POLICY@v1'], targetSnapshotRef: 'A2-POLICY',
    impacts: [{ targetId: 'BRU-CANCEL-POLICY', change: 'modify', description: 'Evaluate window by booking product.' }],
  }),
  step({
    ref: 'STEP-ADMIN-OVERRIDE-A@v1', lineageId: 'STEP-ADMIN-OVERRIDE-A', version: 1,
    title: 'Add admin override policy variation',
    rationale: 'Newly discovered admin bypass fits the existing policy responsibility.',
    requirementRefs: [UNEXPECTED_REQUIREMENT.ref], predecessorRefs: ['STEP-PRODUCT-WINDOWS-A@v1'], targetSnapshotRef: 'A2-POLICY-OVERRIDE',
    impacts: [
      { targetId: 'BRU-CANCEL-POLICY', change: 'modify', description: 'Add authorized bypass rule.' },
      { targetId: 'BRU-BOOKING-ACTIONS', change: 'modify', description: 'Capture operator reason.' },
    ],
  }),
  step({
    ref: 'STEP-AUDIT-A@v1', lineageId: 'STEP-AUDIT-A', version: 1,
    title: 'Add cancellation audit', rationale: 'Original plan records cancellation outcomes.',
    requirementRefs: ['ProductNote[cancellation-status-visible]'], predecessorRefs: ['STEP-PRODUCT-WINDOWS-A@v1'], targetSnapshotRef: 'A3-POLICY-V1',
    impacts: [{ targetId: 'BRU-CANCEL-AUDIT', change: 'add', description: 'Record cancellation outcomes.' }],
  }),
  step({
    ref: 'STEP-AUDIT-A@v2', lineageId: 'STEP-AUDIT-A', version: 2,
    title: 'Add cancellation audit + admin reason', rationale: 'Same conceptual audit step, revised because its full target snapshot now includes the unforeseen admin-override semantics.',
    requirementRefs: ['ProductNote[cancellation-status-visible]', UNEXPECTED_REQUIREMENT.ref], predecessorRefs: ['STEP-ADMIN-OVERRIDE-A@v1'], targetSnapshotRef: 'A3-POLICY-V2',
    impacts: [{ targetId: 'BRU-CANCEL-AUDIT', change: 'add', description: 'Record cancellation outcome and optional admin bypass reason.' }], revisedFrom: 'STEP-AUDIT-A@v1',
  }),
  step({
    ref: 'STEP-UI-DRAWER-A@v1', lineageId: 'STEP-UI-DRAWER-A', version: 1,
    title: 'Adopt inline confirmation drawer', rationale: 'Instantiate the known Evolution Option only after the experiment result is factual and planning updates the map.',
    requirementRefs: ['Experiment[confirmation-surface]'], predecessorRefs: ['STEP-AUDIT-A@v2'], targetSnapshotRef: 'A4-POLICY-UI',
    impacts: [{ targetId: 'BRU-CANCEL-PRESENTATION', change: 'add', description: 'Introduce presentation responsibility for inline drawer.' }],
  }),
  step({
    ref: 'STEP-ADMIN-HANDLER@v1', lineageId: 'STEP-ADMIN-HANDLER', version: 1,
    title: 'Add admin cancellation inside BookingActions', rationale: 'Keep the first change simple and postpone policy extraction until the known future rule needs it.',
    requirementRefs: ['Scenario[AdminCancellation]/Step[Confirm]/requirement[admin-cancel]'], predecessorRefs: [], targetSnapshotRef: 'A1-HANDLER',
    impacts: [{ targetId: 'BRU-BOOKING-ACTIONS', change: 'modify', description: 'Add admin command and keep eligibility check local.' }], realizedByEventId: 'B-E03',
  }),
  step({
    ref: 'STEP-EXTRACT-POLICY-B@v1', lineageId: 'STEP-EXTRACT-POLICY-B', version: 1,
    title: 'Extract policy for product-specific windows', rationale: 'Original planned migration when the known future product-window rule becomes effective.',
    requirementRefs: ['FutureRequirement[product-specific-window]'], predecessorRefs: ['STEP-ADMIN-HANDLER@v1'], targetSnapshotRef: 'B2-OLD',
    impacts: [{ targetId: 'BRU-BOOKING-ACTIONS', change: 'split', description: 'Move eligibility decisions into CancellationPolicy.' }],
  }),
  step({
    ref: 'STEP-EXTRACT-POLICY-B@v2', lineageId: 'STEP-EXTRACT-POLICY-B', version: 2,
    title: 'Extract policy earlier with admin override', rationale: 'The unforeseen admin bypass changes the migration scope and full target snapshot.',
    requirementRefs: ['FutureRequirement[product-specific-window]', UNEXPECTED_REQUIREMENT.ref], predecessorRefs: ['STEP-ADMIN-HANDLER@v1'], targetSnapshotRef: 'B2-NEW',
    impacts: [
      { targetId: 'BRU-BOOKING-ACTIONS', change: 'split', description: 'Move eligibility + override decision into CancellationPolicy.' },
      { targetId: 'BRU-CANCEL-POLICY', change: 'add', description: 'Own product windows and admin bypass rule.' },
    ], revisedFrom: 'STEP-EXTRACT-POLICY-B@v1',
  }),
  step({
    ref: 'STEP-MIGRATION-B@v1', lineageId: 'STEP-MIGRATION-B', version: 1,
    title: 'Run compatibility migration', rationale: 'Keep old handler checks temporarily while callers move to the extracted policy.',
    requirementRefs: [UNEXPECTED_REQUIREMENT.ref], predecessorRefs: ['STEP-EXTRACT-POLICY-B@v2'], targetSnapshotRef: 'B2-MIGRATION',
    impacts: [{ targetId: 'BRU-LEGACY-ELIGIBILITY', change: 'add', description: 'Temporary compatibility responsibility.' }],
  }),
  step({
    ref: 'STEP-AUDIT-B@v1', lineageId: 'STEP-AUDIT-B', version: 1,
    title: 'Add cancellation audit', rationale: 'Original R1 audit after policy extraction.',
    requirementRefs: ['ProductNote[cancellation-status-visible]'], predecessorRefs: ['STEP-EXTRACT-POLICY-B@v1'], targetSnapshotRef: 'B3-OLD',
    impacts: [{ targetId: 'BRU-CANCEL-AUDIT', change: 'add', description: 'Record cancellation outcome.' }],
  }),
  step({
    ref: 'STEP-AUDIT-B@v2', lineageId: 'STEP-AUDIT-B', version: 2,
    title: 'Retire compatibility + audit admin reason', rationale: 'The changed migration and new requirement alter the later target state as well.',
    requirementRefs: ['ProductNote[cancellation-status-visible]', UNEXPECTED_REQUIREMENT.ref], predecessorRefs: ['STEP-MIGRATION-B@v1'], targetSnapshotRef: 'B3-NEW',
    impacts: [
      { targetId: 'BRU-LEGACY-ELIGIBILITY', change: 'remove', description: 'Retire temporary compatibility path.' },
      { targetId: 'BRU-CANCEL-AUDIT', change: 'add', description: 'Record outcome and optional admin reason.' },
    ], revisedFrom: 'STEP-AUDIT-B@v1',
  }),
  step({
    ref: 'STEP-UI-DRAWER-B@v1', lineageId: 'STEP-UI-DRAWER-B', version: 1,
    title: 'Adopt inline confirmation drawer', rationale: 'Instantiate the known option after experiment + planning events.',
    requirementRefs: ['Experiment[confirmation-surface]'], predecessorRefs: ['STEP-AUDIT-B@v2'], targetSnapshotRef: 'B4-UI',
    impacts: [{ targetId: 'BRU-CANCEL-PRESENTATION', change: 'add', description: 'Introduce presentation responsibility for inline drawer.' }],
  }),
].map((item) => [item.ref, item]))

const PLAN_REVISION_LIST: EvolutionMapRevision[] = [
  {
    id: 'A-R1', architectureId: 'policyEarly', label: 'R1 · original plan', createdByEventId: 'A-E02', basedOnActualEventId: 'E01', baseArchitectureSnapshotRef: 'A0',
    stepVersionRefs: ['STEP-ADMIN-POLICY@v1', 'STEP-PRODUCT-WINDOWS-A@v1', 'STEP-AUDIT-A@v1'],
  },
  {
    id: 'A-R2', architectureId: 'policyEarly', label: 'R2 · after unexpected admin override', createdByEventId: 'A-E05', basedOnActualEventId: 'E04', baseArchitectureSnapshotRef: 'A1-POLICY', parentRevisionId: 'A-R1',
    stepVersionRefs: ['STEP-PRODUCT-WINDOWS-A@v1', 'STEP-ADMIN-OVERRIDE-A@v1', 'STEP-AUDIT-A@v2'],
  },
  {
    id: 'A-R3', architectureId: 'policyEarly', label: 'R3 · option activated', createdByEventId: 'A-E07', basedOnActualEventId: 'E06', baseArchitectureSnapshotRef: 'A1-POLICY', parentRevisionId: 'A-R2',
    stepVersionRefs: ['STEP-PRODUCT-WINDOWS-A@v1', 'STEP-ADMIN-OVERRIDE-A@v1', 'STEP-AUDIT-A@v2', 'STEP-UI-DRAWER-A@v1'],
  },
  {
    id: 'B-R1', architectureId: 'handlerFirst', label: 'R1 · original plan', createdByEventId: 'B-E02', basedOnActualEventId: 'E01', baseArchitectureSnapshotRef: 'A0',
    stepVersionRefs: ['STEP-ADMIN-HANDLER@v1', 'STEP-EXTRACT-POLICY-B@v1', 'STEP-AUDIT-B@v1'],
  },
  {
    id: 'B-R2', architectureId: 'handlerFirst', label: 'R2 · after unexpected admin override', createdByEventId: 'B-E05', basedOnActualEventId: 'E04', baseArchitectureSnapshotRef: 'A1-HANDLER', parentRevisionId: 'B-R1',
    stepVersionRefs: ['STEP-EXTRACT-POLICY-B@v2', 'STEP-MIGRATION-B@v1', 'STEP-AUDIT-B@v2'],
  },
  {
    id: 'B-R3', architectureId: 'handlerFirst', label: 'R3 · option activated', createdByEventId: 'B-E07', basedOnActualEventId: 'E06', baseArchitectureSnapshotRef: 'A1-HANDLER', parentRevisionId: 'B-R2',
    stepVersionRefs: ['STEP-EXTRACT-POLICY-B@v2', 'STEP-MIGRATION-B@v1', 'STEP-AUDIT-B@v2', 'STEP-UI-DRAWER-B@v1'],
  },
]

export const PLAN_REVISIONS: Record<string, EvolutionMapRevision> = Object.fromEntries(PLAN_REVISION_LIST.map((item) => [item.id, item]))

export const EVOLUTION_OPTIONS: EvolutionOption[] = [{
  id: 'OPT-CONFIRMATION-DRAWER',
  title: 'Switch cancellation confirmation to inline drawer',
  knownAtEventId: 'E01',
  trigger: 'Usability experiment selects inline drawer.',
  rationale: 'Known uncertainty should preserve option value without pretending the outcome is already planned.',
  intendedTransformation: 'Introduce/replace presentation responsibility; cancellation policy and status behavior should remain unaffected.',
  expectedUnaffected: ['CancellationPolicy', 'CancellationStatus', 'CancellationAudit'],
  instantiatedStepByArchitecture: { policyEarly: 'STEP-UI-DRAWER-A@v1', handlerFirst: 'STEP-UI-DRAWER-B@v1' },
}]

const shared = (event: Omit<ActualEvent, 'scope'>): ActualEvent => ({ ...event, scope: 'shared' })
const branch = (architectureId: ArchitectureId, event: Omit<ActualEvent, 'scope' | 'branch'>): ActualEvent => ({ ...event, scope: 'branch', branch: architectureId })

export const ACTUAL_EVENTS: ActualEvent[] = [
  shared({
    id: 'E01', logicalOrder: 10, comparisonKey: 'initial-knowledge', role: 'knowledge',
    title: 'Initial factual state + known requirements',
    description: 'Both alternatives start from the same realized architecture and the same requirement knowledge.',
    mutations: [
      ...INITIAL_REQUIREMENTS.map((value) => ({ kind: 'requirement-upsert' as const, value, delta: `known: ${value.ref}` })),
      { kind: 'current-architecture-set', architectureId: 'policyEarly', snapshotRef: 'A0', delta: 'CURRENT = A0' },
      { kind: 'current-architecture-set', architectureId: 'handlerFirst', snapshotRef: 'A0', delta: 'CURRENT = A0' },
      { kind: 'option-status', optionId: 'OPT-CONFIRMATION-DRAWER', status: 'known', delta: 'confirmation UI option is known, outcome unresolved' },
    ],
  }),
  branch('policyEarly', {
    id: 'A-E02', logicalOrder: 20, comparisonKey: 'plan-r1', role: 'planning', title: 'Create Plan R1',
    description: 'R1 is anchored to factual E01 / A0 and cannot later move with CURRENT.',
    mutations: [{ kind: 'plan-revision-create', architectureId: 'policyEarly', revisionId: 'A-R1', delta: 'create A-R1 BASE=E01/A0' }],
  }),
  branch('handlerFirst', {
    id: 'B-E02', logicalOrder: 20, comparisonKey: 'plan-r1', role: 'planning', title: 'Create Plan R1',
    description: 'R1 is anchored to factual E01 / A0 and cannot later move with CURRENT.',
    mutations: [{ kind: 'plan-revision-create', architectureId: 'handlerFirst', revisionId: 'B-R1', delta: 'create B-R1 BASE=E01/A0' }],
  }),
  branch('policyEarly', {
    id: 'A-E03', logicalOrder: 30, comparisonKey: 'implement-first-step', role: 'implementation', title: 'Implement first planned step',
    description: 'Actual CURRENT advances to A1-POLICY. Historical A-R1 still has BASE A0.',
    mutations: [{ kind: 'current-architecture-set', architectureId: 'policyEarly', snapshotRef: 'A1-POLICY', delta: 'CURRENT A0 -> A1-POLICY' }],
  }),
  branch('handlerFirst', {
    id: 'B-E03', logicalOrder: 30, comparisonKey: 'implement-first-step', role: 'implementation', title: 'Implement first planned step',
    description: 'Actual CURRENT advances to A1-HANDLER. Historical B-R1 still has BASE A0.',
    mutations: [{ kind: 'current-architecture-set', architectureId: 'handlerFirst', snapshotRef: 'A1-HANDLER', delta: 'CURRENT A0 -> A1-HANDLER' }],
  }),
  shared({
    id: 'E04', logicalOrder: 40, comparisonKey: 'unexpected-admin-override', role: 'knowledge',
    title: 'Unexpected admin override requirement appears',
    description: 'This was not known when R1 was created. Requirement Model changes; plans do not change yet.',
    mutations: [{ kind: 'requirement-upsert', value: UNEXPECTED_REQUIREMENT, delta: `new requirement: ${UNEXPECTED_REQUIREMENT.ref}` }],
  }),
  branch('policyEarly', {
    id: 'A-E05', logicalOrder: 50, comparisonKey: 'replan-r2', role: 'planning', title: 'Create Plan R2',
    description: 'R2 is based on factual E04 / A1-POLICY. One old future step version survives unchanged; later full target state is revised.',
    mutations: [{ kind: 'plan-revision-create', architectureId: 'policyEarly', revisionId: 'A-R2', delta: 'create A-R2 BASE=E04/A1-POLICY' }],
  }),
  branch('handlerFirst', {
    id: 'B-E05', logicalOrder: 50, comparisonKey: 'replan-r2', role: 'planning', title: 'Create Plan R2',
    description: 'R2 is based on factual E04 / A1-HANDLER. The postponed extraction path is materially rewritten.',
    mutations: [{ kind: 'plan-revision-create', architectureId: 'handlerFirst', revisionId: 'B-R2', delta: 'create B-R2 BASE=E04/A1-HANDLER' }],
  }),
  shared({
    id: 'E06', logicalOrder: 60, comparisonKey: 'experiment-result', role: 'experiment',
    title: 'Usability experiment selects inline drawer',
    description: 'Known uncertainty resolves factually. No architecture step is inserted until a Planning Event creates a new map revision.',
    mutations: [
      { kind: 'requirement-upsert', value: RESOLVED_EXPERIMENT, delta: 'Experiment[confirmation-surface] -> inline drawer selected' },
      { kind: 'option-status', optionId: 'OPT-CONFIRMATION-DRAWER', status: 'triggered', delta: 'option trigger is now true' },
    ],
  }),
  branch('policyEarly', {
    id: 'A-E07', logicalOrder: 70, comparisonKey: 'plan-r3-option', role: 'planning', title: 'Create Plan R3 and instantiate option',
    description: 'R3 reuses all R2 step versions and appends a concrete UI Evolution Step.',
    mutations: [
      { kind: 'plan-revision-create', architectureId: 'policyEarly', revisionId: 'A-R3', delta: 'create A-R3 BASE=E06/A1-POLICY' },
      { kind: 'option-status', optionId: 'OPT-CONFIRMATION-DRAWER', status: 'instantiated', delta: 'option instantiated as STEP-UI-DRAWER-A@v1' },
    ],
  }),
  branch('handlerFirst', {
    id: 'B-E07', logicalOrder: 70, comparisonKey: 'plan-r3-option', role: 'planning', title: 'Create Plan R3 and instantiate option',
    description: 'R3 reuses all R2 step versions and appends a concrete UI Evolution Step.',
    mutations: [
      { kind: 'plan-revision-create', architectureId: 'handlerFirst', revisionId: 'B-R3', delta: 'create B-R3 BASE=E06/A1-HANDLER' },
      { kind: 'option-status', optionId: 'OPT-CONFIRMATION-DRAWER', status: 'instantiated', delta: 'option instantiated as STEP-UI-DRAWER-B@v1' },
    ],
  }),
]

export function timelineForArchitecture(architectureId: ArchitectureId): ActualEvent[] {
  return ACTUAL_EVENTS
    .filter((event) => event.scope === 'shared' || event.branch === architectureId)
    .sort((a, b) => a.logicalOrder - b.logicalOrder || a.id.localeCompare(b.id))
}

export function eventById(eventId: string): ActualEvent {
  const event = ACTUAL_EVENTS.find((item) => item.id === eventId)
  if (!event) throw new Error(`Unknown ActualEvent ${eventId}`)
  return event
}

export function alignEventForArchitecture(eventId: string, target: ArchitectureId): string {
  const current = eventById(eventId)
  if (current.scope === 'shared') return current.id
  const exact = ACTUAL_EVENTS.find((item) => item.scope === 'branch' && item.branch === target && item.comparisonKey === current.comparisonKey)
  if (exact) return exact.id
  const timeline = timelineForArchitecture(target)
  const prior = timeline.filter((item) => item.logicalOrder <= current.logicalOrder).at(-1)
  return prior?.id ?? timeline[0].id
}

function emptyActualState(): ActualState {
  return { requirements: [], currentArchitectureSnapshotRef: 'A0', availablePlanRevisionIds: [], optionStatuses: {} }
}

function upsertRequirement(requirements: RequirementMaterialBlock[], block: RequirementMaterialBlock) {
  const index = requirements.findIndex((item) => item.ref === block.ref)
  if (index >= 0) requirements[index] = block
  else requirements.push(block)
}

export function actualStateAt(architectureId: ArchitectureId, eventId: string): ActualState {
  const selected = eventById(eventId)
  const state = emptyActualState()
  for (const event of timelineForArchitecture(architectureId)) {
    if (event.logicalOrder > selected.logicalOrder) break
    for (const mutation of event.mutations) {
      if (mutation.kind === 'requirement-upsert') upsertRequirement(state.requirements, mutation.value)
      if (mutation.kind === 'current-architecture-set' && mutation.architectureId === architectureId) state.currentArchitectureSnapshotRef = mutation.snapshotRef
      if (mutation.kind === 'plan-revision-create' && mutation.architectureId === architectureId) {
        state.availablePlanRevisionIds.push(mutation.revisionId)
        state.activePlanRevisionId = mutation.revisionId
      }
      if (mutation.kind === 'option-status') state.optionStatuses[mutation.optionId] = mutation.status
    }
    if (event.id === eventId) break
  }
  return state
}

export function requirementKnowledgeAt(architectureId: ArchitectureId, eventId: string): RequirementMaterialBlock[] {
  return actualStateAt(architectureId, eventId).requirements
}

export function snapshotById(snapshotId: string): ArchitectureSnapshot {
  const snapshot = ARCHITECTURE_SNAPSHOTS[snapshotId]
  if (!snapshot) throw new Error(`Unknown ArchitectureSnapshot ${snapshotId}`)
  return snapshot
}

export function stepByRef(stepRef: string): EvolutionStepVersion {
  const item = STEP_VERSIONS[stepRef]
  if (!item) throw new Error(`Unknown EvolutionStep version ${stepRef}`)
  return item
}

export function revisionById(revisionId: string): EvolutionMapRevision {
  const revision = PLAN_REVISIONS[revisionId]
  if (!revision) throw new Error(`Unknown EvolutionMapRevision ${revisionId}`)
  return revision
}

export function revisionsAvailableAt(architectureId: ArchitectureId, eventId: string): EvolutionMapRevision[] {
  return actualStateAt(architectureId, eventId).availablePlanRevisionIds.map(revisionById)
}

export function planKnowledge(revisionId: string): RequirementMaterialBlock[] {
  const revision = revisionById(revisionId)
  return requirementKnowledgeAt(revision.architectureId, revision.basedOnActualEventId)
}

export function selectedPlannedSnapshot(revisionId: string, stepRef?: string): ArchitectureSnapshot {
  const revision = revisionById(revisionId)
  if (!stepRef) return snapshotById(revision.baseArchitectureSnapshotRef)
  if (!revision.stepVersionRefs.includes(stepRef)) throw new Error(`${stepRef} is not part of ${revisionId}`)
  return snapshotById(stepByRef(stepRef).targetSnapshotRef)
}

export type RevisionDiffItem = {
  kind: 'realized' | 'reused' | 'revised' | 'inserted' | 'removed'
  lineageId: string
  fromRef?: string
  toRef?: string
  title: string
}

export function compareRevisions(previousId: string, nextId: string): RevisionDiffItem[] {
  const previous = revisionById(previousId)
  const next = revisionById(nextId)
  const nextByLineage = new Map(next.stepVersionRefs.map((ref) => [stepByRef(ref).lineageId, ref]))
  const previousByLineage = new Map(previous.stepVersionRefs.map((ref) => [stepByRef(ref).lineageId, ref]))
  const nextBaseEvent = eventById(next.basedOnActualEventId)
  const result: RevisionDiffItem[] = []

  for (const fromRef of previous.stepVersionRefs) {
    const from = stepByRef(fromRef)
    const toRef = nextByLineage.get(from.lineageId)
    if (toRef === fromRef) {
      result.push({ kind: 'reused', lineageId: from.lineageId, fromRef, toRef, title: from.title })
      continue
    }
    if (toRef) {
      result.push({ kind: 'revised', lineageId: from.lineageId, fromRef, toRef, title: stepByRef(toRef).title })
      continue
    }
    const realized = from.realizedByEventId ? eventById(from.realizedByEventId).logicalOrder <= nextBaseEvent.logicalOrder : false
    result.push({ kind: realized ? 'realized' : 'removed', lineageId: from.lineageId, fromRef, title: from.title })
  }

  for (const toRef of next.stepVersionRefs) {
    const to = stepByRef(toRef)
    if (!previousByLineage.has(to.lineageId)) result.push({ kind: 'inserted', lineageId: to.lineageId, toRef, title: to.title })
  }

  return result
}

export function eventDeltas(eventId: string): string[] {
  return eventById(eventId).mutations.map((mutation) => mutation.delta)
}

export function optionStatusAt(architectureId: ArchitectureId, eventId: string, optionId: string): OptionStatus | undefined {
  return actualStateAt(architectureId, eventId).optionStatuses[optionId]
}

export function validateFixture(): string[] {
  const errors: string[] = []
  const allEventIds = ACTUAL_EVENTS.map((event) => event.id)
  if (new Set(allEventIds).size !== allEventIds.length) errors.push('ActualEvent IDs are not globally unique.')

  for (const architectureId of Object.keys(ARCHITECTURES) as ArchitectureId[]) {
    const r1 = architectureId === 'policyEarly' ? revisionById('A-R1') : revisionById('B-R1')
    const r2 = architectureId === 'policyEarly' ? revisionById('A-R2') : revisionById('B-R2')
    const r3 = architectureId === 'policyEarly' ? revisionById('A-R3') : revisionById('B-R3')
    if (r1.baseArchitectureSnapshotRef !== 'A0' || r1.basedOnActualEventId !== 'E01') errors.push(`${architectureId}: R1 base is not immutable E01/A0.`)
    if (planKnowledge(r1.id).some((item) => item.ref === UNEXPECTED_REQUIREMENT.ref)) errors.push(`${architectureId}: R1 sees the future unexpected requirement.`)
    if (!planKnowledge(r2.id).some((item) => item.ref === UNEXPECTED_REQUIREMENT.ref)) errors.push(`${architectureId}: R2 does not see the discovered requirement.`)
    if (planKnowledge(r2.id).find((item) => item.ref === 'Experiment[confirmation-surface]')?.status === 'resolved at E06') errors.push(`${architectureId}: R2 sees future experiment result.`)
    if (planKnowledge(r3.id).find((item) => item.ref === 'Experiment[confirmation-surface]')?.status !== 'resolved at E06') errors.push(`${architectureId}: R3 does not see experiment result at its BASE.`)
    const currentAtE03 = actualStateAt(architectureId, architectureId === 'policyEarly' ? 'A-E03' : 'B-E03').currentArchitectureSnapshotRef
    if (currentAtE03 !== r2.baseArchitectureSnapshotRef) errors.push(`${architectureId}: R2 base does not match factual CURRENT after the first implementation.`)
  }

  const aDiff = compareRevisions('A-R1', 'A-R2')
  const bDiff = compareRevisions('B-R1', 'B-R2')
  if (!aDiff.some((item) => item.kind === 'reused')) errors.push('Architecture A does not demonstrate exact Step-version reuse.')
  if (!aDiff.some((item) => item.kind === 'revised')) errors.push('Architecture A does not demonstrate revised Step lineage.')
  if (!bDiff.some((item) => item.kind === 'revised')) errors.push('Architecture B does not demonstrate broad step revision.')
  if (!bDiff.some((item) => item.kind === 'inserted')) errors.push('Architecture B does not demonstrate inserted migration work.')

  const sharedCursors = ['E01', 'E04', 'E06']
  for (const eventId of sharedCursors) {
    const aReq = JSON.stringify(requirementKnowledgeAt('policyEarly', eventId))
    const bReq = JSON.stringify(requirementKnowledgeAt('handlerFirst', eventId))
    if (aReq !== bReq) errors.push(`Requirement Model differs across architectures at ${eventId}.`)
  }

  for (const revision of Object.values(PLAN_REVISIONS)) {
    if (!ARCHITECTURE_SNAPSHOTS[revision.baseArchitectureSnapshotRef]) errors.push(`${revision.id}: missing BASE snapshot.`)
    for (const stepRef of revision.stepVersionRefs) {
      const item = STEP_VERSIONS[stepRef]
      if (!item) errors.push(`${revision.id}: missing ${stepRef}.`)
      else if (!ARCHITECTURE_SNAPSHOTS[item.targetSnapshotRef]) errors.push(`${stepRef}: missing target snapshot.`)
    }
  }

  for (const item of Object.values(STEP_VERSIONS)) {
    if (item.revisedFrom) {
      const previous = STEP_VERSIONS[item.revisedFrom]
      if (!previous) errors.push(`${item.ref}: revisedFrom target missing.`)
      else if (previous.lineageId !== item.lineageId || previous.version >= item.version) errors.push(`${item.ref}: invalid revision lineage.`)
    }
  }

  return errors
}
