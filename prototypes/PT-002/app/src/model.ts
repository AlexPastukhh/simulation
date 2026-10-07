export type BranchId = 'shared' | 'separate'
export type LayerId = 'required' | 'design' | 'current' | 'plan'
export type ProductTab = 'scenarios' | 'screens' | 'widgets' | 'requirements' | 'rules'

export type ScenarioStep = {
  id: string
  label: string
  screenId?: string
  widgetId?: string
  requirementId?: string
}

export type Scenario = {
  id: string
  actor: string
  title: string
  steps: ScenarioStep[]
}

export type Screen = { id: string; title: string }
export type Widget = { id: string; title: string }
export type WidgetPlacement = { id: string; screenId: string; widgetId: string }

export type ProductRequirement = {
  id: string
  kind: 'screen' | 'widget' | 'functional'
  ownerType: 'screen' | 'widget' | 'functional-context'
  ownerId: string
  ownerLabel: string
  title: string
  context: string
  trigger?: string
  behavior: string[]
  ruleIds?: string[]
}

export type BusinessRule = {
  id: string
  title: string
  statement: string
}

export type FeatureDesign = {
  id: string
  title: string
  mode: string
  note: string
}

export type RequirementCoverage = {
  id: string
  requirementId: string
  featureId: string
  role: 'primary' | 'supporting' | 'variation'
}

export type RealizationUnit = {
  id: string
  title: string
  detail: string
  fulfills: string[]
}

export type PlanItem = {
  id: string
  title: string
  status: 'planned' | 'done'
  detail: string
}

export type Snapshot = {
  scenarios: Scenario[]
  screens: Screen[]
  widgets: Widget[]
  placements: WidgetPlacement[]
  requirements: ProductRequirement[]
  rules: BusinessRule[]
  features: FeatureDesign[]
  coverage: RequirementCoverage[]
  realization: RealizationUnit[]
  plan: PlanItem[]
}

export type MutationCollection = keyof Snapshot
export type StateEntity = Snapshot[MutationCollection][number]

export type EventMutation = {
  layer: LayerId
  collection: MutationCollection
  op: 'upsert' | 'remove'
  targetId: string
  value?: StateEntity
  delta: string
}

export type EventRelation = {
  type: string
  fromId: string
  toId: string
  note?: string
}

export type SimulationEvent = {
  id: string
  logicalOrder: number
  comparisonKey: string
  scope: 'scenario' | 'branch'
  branch?: BranchId
  role: 'requirement' | 'decision' | 'planning' | 'implementation'
  title: string
  description: string
  triggeredBy?: string[]
  relations: EventRelation[]
  mutations: EventMutation[]
}

export const BRANCHES: Record<BranchId, { label: string; short: string; description: string }> = {
  shared: {
    label: 'Group into shared features',
    short: 'Shared grouping',
    description: 'Customer/admin cancellation share one Feature; hold expiry becomes another trigger/variation of an already-existing hold-release Feature.',
  },
  separate: {
    label: 'Keep specialized features',
    short: 'Specialized grouping',
    description: 'Customer/admin cancellation stay separate; hold expiry gets its own Feature while the existing hold-release Feature remains unchanged.',
  },
}

const scenario = (event: Omit<SimulationEvent, 'scope' | 'relations'> & { relations?: EventRelation[] }): SimulationEvent => ({
  ...event,
  scope: 'scenario',
  relations: event.relations ?? [],
})

const branch = (branchId: BranchId, event: Omit<SimulationEvent, 'scope' | 'branch' | 'relations'> & { relations?: EventRelation[] }): SimulationEvent => ({
  ...event,
  scope: 'branch',
  branch: branchId,
  relations: event.relations ?? [],
})

const upsert = <T extends StateEntity>(layer: LayerId, collection: MutationCollection, value: T, delta: string): EventMutation => ({
  layer,
  collection,
  op: 'upsert',
  targetId: value.id,
  value,
  delta,
})

const requirement = (value: ProductRequirement, delta: string) => upsert('required', 'requirements', value, delta)
const rule = (value: BusinessRule, delta: string) => upsert('required', 'rules', value, delta)
const scenarioMutation = (value: Scenario, delta: string) => upsert('required', 'scenarios', value, delta)
const screen = (value: Screen, delta: string) => upsert('required', 'screens', value, delta)
const widget = (value: Widget, delta: string) => upsert('required', 'widgets', value, delta)
const placement = (value: WidgetPlacement, delta: string) => upsert('required', 'placements', value, delta)
const feature = (value: FeatureDesign, delta: string) => upsert('design', 'features', value, delta)
const coverage = (value: RequirementCoverage, delta: string) => upsert('design', 'coverage', value, delta)
const realization = (value: RealizationUnit, delta: string) => upsert('current', 'realization', value, delta)
const plan = (value: PlanItem, delta: string) => upsert('plan', 'plan', value, delta)

function cancellationPfr(id: 'PFR-C1' | 'PFR-A1', admin = false): ProductRequirement {
  return {
    id,
    kind: 'functional',
    ownerType: 'functional-context',
    ownerId: admin ? 'CTX-ADMIN-CANCEL' : 'CTX-CUSTOMER-CANCEL',
    ownerLabel: admin ? 'Admin cancellation context' : 'Customer cancellation context',
    title: 'Cancel eligible booking',
    context: admin ? 'Admin · AdminBookingDetails · BookingActions' : 'Customer · BookingDetails · BookingActions',
    trigger: 'user action',
    behavior: ['Evaluate cancellation eligibility', 'Transition Booking to Cancelled when allowed', 'Durably record the result'],
    ruleIds: ['BR-CANCEL'],
  }
}

function divergedAdminPfr(): ProductRequirement {
  return {
    id: 'PFR-A1',
    kind: 'functional',
    ownerType: 'functional-context',
    ownerId: 'CTX-ADMIN-CANCEL',
    ownerLabel: 'Admin cancellation context',
    title: 'Cancel booking with admin override',
    context: 'Admin · AdminBookingDetails · BookingActions',
    trigger: 'user action',
    behavior: ['Accept an operator reason', 'Evaluate cancellation with admin override', 'Allow bypass of the normal customer window', 'Durably record the result'],
    ruleIds: ['BR-CANCEL', 'BR-ADMIN-OVERRIDE'],
  }
}

export const EVENTS: SimulationEvent[] = [
  scenario({
    id: 'S01', logicalOrder: 10, comparisonKey: 'customer-requirement', role: 'requirement',
    title: 'Customer cancellation requirement',
    description: 'Customer journey crosses SearchResults and BookingDetails, then uses the reusable BookingActions widget.',
    mutations: [
      screen({ id: 'SCR-SEARCH', title: 'SearchResults' }, '+ Screen SearchResults'),
      screen({ id: 'SCR-BOOKING', title: 'BookingDetails' }, '+ Screen BookingDetails'),
      widget({ id: 'W-BOOKING-LIST', title: 'BookingList' }, '+ Widget BookingList'),
      widget({ id: 'W-BOOKING-SUMMARY', title: 'BookingSummary' }, '+ Widget BookingSummary'),
      widget({ id: 'W-BOOKING-ACTIONS', title: 'BookingActions' }, '+ Widget BookingActions'),
      placement({ id: 'WP-SEARCH-LIST', screenId: 'SCR-SEARCH', widgetId: 'W-BOOKING-LIST' }, '+ BookingList on SearchResults'),
      placement({ id: 'WP-BOOKING-SUMMARY', screenId: 'SCR-BOOKING', widgetId: 'W-BOOKING-SUMMARY' }, '+ BookingSummary on BookingDetails'),
      placement({ id: 'WP-BOOKING-ACTIONS', screenId: 'SCR-BOOKING', widgetId: 'W-BOOKING-ACTIONS' }, '+ BookingActions on BookingDetails'),
      requirement(cancellationPfr('PFR-C1'), '+ PFR-C1 customer cancellation'),
      requirement({ id: 'SR-BOOKING-RESULT', kind: 'screen', ownerType: 'screen', ownerId: 'SCR-BOOKING', ownerLabel: 'BookingDetails', title: 'Reflect cancellation result', context: 'BookingDetails', behavior: ['After successful cancellation show Booking as Cancelled'] }, '+ BookingDetails result requirement'),
      requirement({ id: 'WR-BOOKING-ACTIONS', kind: 'widget', ownerType: 'widget', ownerId: 'W-BOOKING-ACTIONS', ownerLabel: 'BookingActions', title: 'Expose available actions', context: 'Reusable widget', behavior: ['Show Cancel only when cancellation is available'] }, '+ BookingActions availability requirement'),
      rule({ id: 'BR-CANCEL', title: 'CancellationPolicy', statement: 'Cancellation eligibility is a shared business rule; representation is architecture-specific.' }, '+ CancellationPolicy BusinessRule'),
      scenarioMutation({
        id: 'SC-CANCEL', actor: 'Customer', title: 'Customer finds and cancels a booking',
        steps: [
          { id: 'ST-C1', label: 'Find booking', screenId: 'SCR-SEARCH', widgetId: 'W-BOOKING-LIST' },
          { id: 'ST-C2', label: 'Open booking details', screenId: 'SCR-BOOKING', widgetId: 'W-BOOKING-SUMMARY' },
          { id: 'ST-C3', label: 'Request cancellation', screenId: 'SCR-BOOKING', widgetId: 'W-BOOKING-ACTIONS', requirementId: 'PFR-C1' },
          { id: 'ST-C4', label: 'See updated booking status', screenId: 'SCR-BOOKING', widgetId: 'W-BOOKING-SUMMARY' },
        ],
      }, '+ cross-Screen customer cancellation Scenario'),
    ],
  }),
  scenario({
    id: 'S02', logicalOrder: 20, comparisonKey: 'admin-requirement', role: 'requirement',
    title: 'Admin cancellation: same behavior',
    description: 'A second independent PFR currently has the same behavior in an admin context and reuses BookingActions.',
    mutations: [
      screen({ id: 'SCR-ADMIN', title: 'AdminBookingDetails' }, '+ Screen AdminBookingDetails'),
      placement({ id: 'WP-ADMIN-ACTIONS', screenId: 'SCR-ADMIN', widgetId: 'W-BOOKING-ACTIONS' }, '+ BookingActions on AdminBookingDetails'),
      placement({ id: 'WP-ADMIN-SUMMARY', screenId: 'SCR-ADMIN', widgetId: 'W-BOOKING-SUMMARY' }, '+ BookingSummary on AdminBookingDetails'),
      requirement(cancellationPfr('PFR-A1', true), '+ PFR-A1 admin cancellation with currently identical behavior'),
      requirement({ id: 'SR-ADMIN-BOOKING', kind: 'screen', ownerType: 'screen', ownerId: 'SCR-ADMIN', ownerLabel: 'AdminBookingDetails', title: 'Show current booking state', context: 'AdminBookingDetails', behavior: ['Display current booking status and available actions'] }, '+ AdminBookingDetails state requirement'),
      scenarioMutation({
        id: 'SC-ADMIN-CANCEL', actor: 'Admin', title: 'Admin cancels a booking',
        steps: [
          { id: 'ST-A1', label: 'Open admin booking details', screenId: 'SCR-ADMIN', widgetId: 'W-BOOKING-SUMMARY' },
          { id: 'ST-A2', label: 'Request cancellation', screenId: 'SCR-ADMIN', widgetId: 'W-BOOKING-ACTIONS', requirementId: 'PFR-A1' },
          { id: 'ST-A3', label: 'See updated booking status', screenId: 'SCR-ADMIN', widgetId: 'W-BOOKING-SUMMARY' },
        ],
      }, '+ admin cancellation Scenario'),
    ],
  }),
  scenario({
    id: 'S03', logicalOrder: 30, comparisonKey: 'hold-release-requirement', role: 'requirement',
    title: 'Release booking hold when it is no longer needed',
    description: 'An internal-process requirement establishes hold-release functionality before the expiry requirement exists.',
    mutations: [
      requirement({ id: 'PFR-H0', kind: 'functional', ownerType: 'functional-context', ownerId: 'CTX-HOLD-RELEASE', ownerLabel: 'Booking hold lifecycle', title: 'Release booking hold', context: 'Internal booking lifecycle', trigger: 'internal process: booking confirmed or hold explicitly released', behavior: ['Release reserved inventory', 'Mark the hold as Released'] }, '+ PFR-H0 hold release'),
      scenarioMutation({ id: 'SC-HOLD-RELEASE', actor: 'Internal process', title: 'Release an obsolete booking hold', steps: [{ id: 'ST-H0', label: 'Booking lifecycle requests release', requirementId: 'PFR-H0' }] }, '+ internal hold-release Scenario'),
    ],
  }),

  branch('shared', {
    id: 'B-SH-INIT-DESIGN', logicalOrder: 40, comparisonKey: 'initial-design', role: 'decision', triggeredBy: ['S03'],
    title: 'Shared branch chooses initial Feature Model',
    description: 'Cancellation PFRs are grouped; hold release gets its own Feature.',
    mutations: [
      feature({ id: 'F-CANCEL', title: 'CancelBooking', mode: 'shared Feature', note: 'One functional boundary covers both current cancellation contexts.' }, '+ Feature CancelBooking'),
      coverage({ id: 'COV-C1-CANCEL', requirementId: 'PFR-C1', featureId: 'F-CANCEL', role: 'primary' }, 'PFR-C1 -> CancelBooking'),
      coverage({ id: 'COV-A1-CANCEL', requirementId: 'PFR-A1', featureId: 'F-CANCEL', role: 'primary' }, 'PFR-A1 -> CancelBooking'),
      feature({ id: 'F-RELEASE-HOLD', title: 'ReleaseBookingHold', mode: 'hold-release Feature', note: 'Established from PFR-H0 before the expiry requirement exists.' }, '+ Feature ReleaseBookingHold'),
      coverage({ id: 'COV-H0-RELEASE', requirementId: 'PFR-H0', featureId: 'F-RELEASE-HOLD', role: 'primary' }, 'PFR-H0 -> ReleaseBookingHold'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-INIT-DESIGN', logicalOrder: 40, comparisonKey: 'initial-design', role: 'decision', triggeredBy: ['S03'],
    title: 'Specialized branch chooses initial Feature Model',
    description: 'Customer/admin cancellation stay separate; hold release gets its own Feature.',
    mutations: [
      feature({ id: 'F-CUSTOMER-CANCEL', title: 'CustomerCancelBooking', mode: 'specialized Feature', note: 'Customer cancellation evolves independently.' }, '+ Feature CustomerCancelBooking'),
      feature({ id: 'F-ADMIN-CANCEL', title: 'AdminCancelBooking', mode: 'specialized Feature', note: 'Admin cancellation evolves independently.' }, '+ Feature AdminCancelBooking'),
      coverage({ id: 'COV-C1-CUSTOMER', requirementId: 'PFR-C1', featureId: 'F-CUSTOMER-CANCEL', role: 'primary' }, 'PFR-C1 -> CustomerCancelBooking'),
      coverage({ id: 'COV-A1-ADMIN', requirementId: 'PFR-A1', featureId: 'F-ADMIN-CANCEL', role: 'primary' }, 'PFR-A1 -> AdminCancelBooking'),
      feature({ id: 'F-RELEASE-HOLD', title: 'ReleaseBookingHold', mode: 'hold-release Feature', note: 'Established from PFR-H0 before the expiry requirement exists.' }, '+ Feature ReleaseBookingHold'),
      coverage({ id: 'COV-H0-RELEASE', requirementId: 'PFR-H0', featureId: 'F-RELEASE-HOLD', role: 'primary' }, 'PFR-H0 -> ReleaseBookingHold'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-INIT-PLAN', logicalOrder: 50, comparisonKey: 'initial-plan', role: 'planning', triggeredBy: ['S03'],
    title: 'Plan shared initial implementation', description: 'TeamPlan changes before CurrentRealization.',
    mutations: [
      plan({ id: 'PL-I1', title: 'Implement shared CancelBooking', status: 'planned', detail: 'Cover PFR-C1 + PFR-A1 in one functional unit.' }, '+ plan shared CancelBooking'),
      plan({ id: 'PL-I2', title: 'Implement ReleaseBookingHold', status: 'planned', detail: 'Cover PFR-H0 before hold-expiry behavior exists.' }, '+ plan ReleaseBookingHold'),
      plan({ id: 'PL-I3', title: 'Wire reusable BookingActions', status: 'planned', detail: 'Both booking screens invoke the chosen cancellation Feature Model.' }, '+ plan BookingActions wiring'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-INIT-PLAN', logicalOrder: 50, comparisonKey: 'initial-plan', role: 'planning', triggeredBy: ['S03'],
    title: 'Plan specialized initial implementation', description: 'TeamPlan changes before CurrentRealization.',
    mutations: [
      plan({ id: 'PL-I1', title: 'Implement CustomerCancelBooking', status: 'planned', detail: 'Cover PFR-C1.' }, '+ plan CustomerCancelBooking'),
      plan({ id: 'PL-I2', title: 'Implement AdminCancelBooking', status: 'planned', detail: 'Cover PFR-A1.' }, '+ plan AdminCancelBooking'),
      plan({ id: 'PL-I3', title: 'Implement ReleaseBookingHold', status: 'planned', detail: 'Cover PFR-H0 before hold-expiry behavior exists.' }, '+ plan ReleaseBookingHold'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-INIT-IMPL', logicalOrder: 60, comparisonKey: 'initial-implementation', role: 'implementation', triggeredBy: ['S03'],
    title: 'Implement shared initial Feature Model', description: 'CurrentRealization catches up with the accepted design.',
    mutations: [
      realization({ id: 'R-CANCEL', title: 'CancelBookingHandler', detail: 'Shared functional entry for customer + admin cancellation.', fulfills: ['F-CANCEL'] }, '+ CancelBookingHandler'),
      realization({ id: 'R-POLICY', title: 'CancellationPolicy', detail: 'One authoritative business-rule representation.', fulfills: ['BR-CANCEL'] }, '+ CancellationPolicy representation'),
      realization({ id: 'R-HOLD', title: 'ReleaseBookingHoldHandler', detail: 'Existing hold-release behavior from PFR-H0.', fulfills: ['F-RELEASE-HOLD'] }, '+ ReleaseBookingHoldHandler'),
      plan({ id: 'PL-I1', title: 'Implement shared CancelBooking', status: 'done', detail: 'Cover PFR-C1 + PFR-A1 in one functional unit.' }, 'initial CancelBooking plan -> done'),
      plan({ id: 'PL-I2', title: 'Implement ReleaseBookingHold', status: 'done', detail: 'Cover PFR-H0 before hold-expiry behavior exists.' }, 'initial hold-release plan -> done'),
      plan({ id: 'PL-I3', title: 'Wire reusable BookingActions', status: 'done', detail: 'Both booking screens invoke the chosen cancellation Feature Model.' }, 'initial UI wiring plan -> done'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-INIT-IMPL', logicalOrder: 60, comparisonKey: 'initial-implementation', role: 'implementation', triggeredBy: ['S03'],
    title: 'Implement specialized initial Feature Model', description: 'CurrentRealization catches up with the accepted design.',
    mutations: [
      realization({ id: 'R-CUSTOMER', title: 'CustomerCancelHandler', detail: 'Customer-specific cancellation entry.', fulfills: ['F-CUSTOMER-CANCEL'] }, '+ CustomerCancelHandler'),
      realization({ id: 'R-ADMIN', title: 'AdminCancelHandler', detail: 'Admin-specific cancellation entry.', fulfills: ['F-ADMIN-CANCEL'] }, '+ AdminCancelHandler'),
      realization({ id: 'R-POLICY-C', title: 'Cancellation rule representation · customer', detail: 'Represents BR-CANCEL in the customer path.', fulfills: ['BR-CANCEL'] }, '+ customer CancellationPolicy representation'),
      realization({ id: 'R-POLICY-A', title: 'Cancellation rule representation · admin', detail: 'Represents BR-CANCEL in the admin path.', fulfills: ['BR-CANCEL'] }, '+ admin CancellationPolicy representation'),
      realization({ id: 'R-HOLD', title: 'ReleaseBookingHoldHandler', detail: 'Existing hold-release behavior from PFR-H0.', fulfills: ['F-RELEASE-HOLD'] }, '+ ReleaseBookingHoldHandler'),
      plan({ id: 'PL-I1', title: 'Implement CustomerCancelBooking', status: 'done', detail: 'Cover PFR-C1.' }, 'customer plan -> done'),
      plan({ id: 'PL-I2', title: 'Implement AdminCancelBooking', status: 'done', detail: 'Cover PFR-A1.' }, 'admin plan -> done'),
      plan({ id: 'PL-I3', title: 'Implement ReleaseBookingHold', status: 'done', detail: 'Cover PFR-H0 before hold-expiry behavior exists.' }, 'hold-release plan -> done'),
    ],
  }),

  scenario({
    id: 'S04', logicalOrder: 70, comparisonKey: 'hold-expiry-requirement', role: 'requirement',
    title: 'Booking hold expires automatically', description: 'A later time-triggered requirement appears after ReleaseBookingHold already exists in both branches.',
    mutations: [
      requirement({ id: 'PFR-H1', kind: 'functional', ownerType: 'functional-context', ownerId: 'CTX-HOLD-EXPIRY', ownerLabel: 'Booking hold lifecycle', title: 'Expire unconfirmed hold', context: 'System lifecycle · no Screen/Widget', trigger: 'time reaches hold.expires_at', behavior: ['Transition unconfirmed hold to Expired', 'Release reserved inventory'] }, '+ PFR-H1 time-triggered hold expiry'),
      scenarioMutation({ id: 'SC-HOLD-EXPIRY', actor: 'Time / scheduler', title: 'Unconfirmed hold expires', steps: [{ id: 'ST-H1', label: 'Expiration time arrives', requirementId: 'PFR-H1' }] }, '+ hold-expiry Scenario'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-EXPIRY-DESIGN', logicalOrder: 80, comparisonKey: 'expiry-design', role: 'decision', triggeredBy: ['S04'],
    title: 'Map expiry into existing ReleaseBookingHold', description: 'The existing Feature gains another trigger/variation; PFR-H1 remains independently traceable.',
    mutations: [
      feature({ id: 'F-RELEASE-HOLD', title: 'ReleaseBookingHold', mode: 'existing Feature + expiry variation', note: 'PFR-H0 established the Feature; PFR-H1 adds a time-triggered expiry variation.' }, 'ReleaseBookingHold gains expiry variation'),
      coverage({ id: 'COV-H1-RELEASE', requirementId: 'PFR-H1', featureId: 'F-RELEASE-HOLD', role: 'variation' }, 'PFR-H1 -> existing ReleaseBookingHold (variation)'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-EXPIRY-DESIGN', logicalOrder: 80, comparisonKey: 'expiry-design', role: 'decision', triggeredBy: ['S04'],
    title: 'Create separate ExpireBookingHold Feature', description: 'The existing ReleaseBookingHold stays unchanged; expiry gets an independent Feature boundary.',
    mutations: [
      feature({ id: 'F-EXPIRE-HOLD', title: 'ExpireBookingHold', mode: 'separate non-UI Feature', note: 'PFR-H1 receives its own Feature while F-RELEASE-HOLD remains mapped only from PFR-H0.' }, '+ Feature ExpireBookingHold'),
      coverage({ id: 'COV-H1-EXPIRE', requirementId: 'PFR-H1', featureId: 'F-EXPIRE-HOLD', role: 'primary' }, 'PFR-H1 -> ExpireBookingHold'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-EXPIRY-PLAN', logicalOrder: 90, comparisonKey: 'expiry-plan', role: 'planning', triggeredBy: ['S04'],
    title: 'Plan expiry variation', description: 'Plan changes; CurrentRealization still has only the pre-expiry ReleaseBookingHold behavior.',
    mutations: [plan({ id: 'PL-E1', title: 'Add expiry trigger/variation to ReleaseBookingHold', status: 'planned', detail: 'Implement PFR-H1 without creating a new Feature boundary.' }, '+ expiry variation plan')],
  }),
  branch('separate', {
    id: 'B-SP-EXPIRY-PLAN', logicalOrder: 90, comparisonKey: 'expiry-plan', role: 'planning', triggeredBy: ['S04'],
    title: 'Plan ExpireBookingHold', description: 'Plan changes; CurrentRealization still has no expiry implementation.',
    mutations: [plan({ id: 'PL-E1', title: 'Implement ExpireBookingHold', status: 'planned', detail: 'Create a separate time-triggered functional entry for PFR-H1.' }, '+ ExpireBookingHold plan')],
  }),
  branch('shared', {
    id: 'B-SH-EXPIRY-IMPL', logicalOrder: 100, comparisonKey: 'expiry-implementation', role: 'implementation', triggeredBy: ['S04'],
    title: 'Implement expiry variation', description: 'The existing ReleaseBookingHold realization gains the time-triggered expiry behavior.',
    mutations: [
      realization({ id: 'R-HOLD', title: 'ReleaseBookingHoldHandler', detail: 'Existing hold-release behavior now also handles the expiry trigger/variation.', fulfills: ['F-RELEASE-HOLD'] }, 'ReleaseBookingHoldHandler gains expiry behavior'),
      plan({ id: 'PL-E1', title: 'Add expiry trigger/variation to ReleaseBookingHold', status: 'done', detail: 'Implement PFR-H1 without creating a new Feature boundary.' }, 'expiry variation plan -> done'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-EXPIRY-IMPL', logicalOrder: 100, comparisonKey: 'expiry-implementation', role: 'implementation', triggeredBy: ['S04'],
    title: 'Implement ExpireBookingHold', description: 'A new realization is added while ReleaseBookingHold remains unchanged.',
    mutations: [
      realization({ id: 'R-EXPIRE-HOLD', title: 'ExpireBookingHoldHandler', detail: 'Separate time-triggered functional entry for PFR-H1.', fulfills: ['F-EXPIRE-HOLD'] }, '+ ExpireBookingHoldHandler'),
      plan({ id: 'PL-E1', title: 'Implement ExpireBookingHold', status: 'done', detail: 'Create a separate time-triggered functional entry for PFR-H1.' }, 'ExpireBookingHold plan -> done'),
    ],
  }),

  scenario({
    id: 'S05', logicalOrder: 110, comparisonKey: 'admin-divergence', role: 'requirement',
    title: 'Admin cancellation diverges', description: 'Admin cancellation now requires operator reason and may bypass the normal customer window.',
    mutations: [
      requirement(divergedAdminPfr(), 'PFR-A1 gains admin override behavior'),
      requirement({ id: 'SR-ADMIN-REASON', kind: 'screen', ownerType: 'screen', ownerId: 'SCR-ADMIN', ownerLabel: 'AdminBookingDetails', title: 'Collect operator reason', context: 'AdminBookingDetails · BookingActions placement', behavior: ['Require an operator reason before admin cancellation'] }, '+ AdminBookingDetails operator-reason requirement'),
      rule({ id: 'BR-ADMIN-OVERRIDE', title: 'AdminCancellationOverride', statement: 'Authorized admin cancellation may bypass the normal customer window when an operator reason is recorded.' }, '+ AdminCancellationOverride BusinessRule'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-ADMIN-DESIGN', logicalOrder: 120, comparisonKey: 'admin-design', role: 'decision', triggeredBy: ['S05'],
    title: 'Retain shared Feature with explicit admin variation', description: 'The shared boundary changes to represent the new admin-specific variation explicitly.',
    mutations: [feature({ id: 'F-CANCEL', title: 'CancelBooking', mode: 'shared Feature + context variation', note: 'Shared boundary retained; admin-specific behavior becomes an explicit variation point.' }, 'CancelBooking gains explicit admin variation')],
  }),
  branch('shared', {
    id: 'B-SH-ADMIN-PLAN', logicalOrder: 130, comparisonKey: 'admin-plan', role: 'planning', triggeredBy: ['S05'],
    title: 'Plan shared admin variation', description: 'Plan changes while CurrentRealization remains pre-divergence.',
    mutations: [
      plan({ id: 'PL-A1', title: 'Add admin variation to CancelBooking', status: 'planned', detail: 'Introduce admin override/reason without changing customer behavior.' }, '+ shared admin-variation plan'),
      plan({ id: 'PL-A2', title: 'Update AdminBookingDetails', status: 'planned', detail: 'Collect operator reason in the admin context.' }, '+ admin screen plan'),
      plan({ id: 'PL-A3', title: 'Verify shared combinations', status: 'planned', detail: 'Customer + admin paths share one Feature with variation.' }, '+ shared verification plan'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-ADMIN-PLAN', logicalOrder: 130, comparisonKey: 'admin-plan', role: 'planning', triggeredBy: ['S05'],
    title: 'Plan isolated admin change', description: 'Feature boundaries do not change; only the admin Feature needs implementation work.',
    mutations: [
      plan({ id: 'PL-A1', title: 'Change AdminCancelBooking', status: 'planned', detail: 'Only the admin Feature needs functional change.' }, '+ admin Feature change plan'),
      plan({ id: 'PL-A2', title: 'Update AdminBookingDetails', status: 'planned', detail: 'Collect operator reason in the admin context.' }, '+ admin screen plan'),
      plan({ id: 'PL-A3', title: 'Verify admin path', status: 'planned', detail: 'Customer Feature remains structurally untouched.' }, '+ admin verification plan'),
    ],
  }),
  branch('shared', {
    id: 'B-SH-ADMIN-IMPL', logicalOrder: 140, comparisonKey: 'admin-implementation', role: 'implementation', triggeredBy: ['S05'],
    title: 'Implement shared admin variation', description: 'CurrentRealization gains the admin-specific variation and rule representation.',
    mutations: [
      realization({ id: 'R-CANCEL', title: 'CancelBookingHandler', detail: 'Shared entry with explicit admin override/reason variation; customer behavior retained.', fulfills: ['F-CANCEL'] }, 'shared cancellation realization gains admin variation'),
      realization({ id: 'R-ADMIN-RULE', title: 'AdminCancellationOverride', detail: 'Admin-only business-rule representation used by the shared cancellation Feature.', fulfills: ['BR-ADMIN-OVERRIDE'] }, '+ AdminCancellationOverride realization'),
      plan({ id: 'PL-A1', title: 'Add admin variation to CancelBooking', status: 'done', detail: 'Introduce admin override/reason without changing customer behavior.' }, 'shared admin-variation plan -> done'),
      plan({ id: 'PL-A2', title: 'Update AdminBookingDetails', status: 'done', detail: 'Collect operator reason in the admin context.' }, 'admin screen plan -> done'),
      plan({ id: 'PL-A3', title: 'Verify shared combinations', status: 'done', detail: 'Customer + admin paths share one Feature with variation.' }, 'shared verification plan -> done'),
    ],
  }),
  branch('separate', {
    id: 'B-SP-ADMIN-IMPL', logicalOrder: 140, comparisonKey: 'admin-implementation', role: 'implementation', triggeredBy: ['S05'],
    title: 'Implement isolated admin change', description: 'Only the admin cancellation realization changes; customer cancellation remains untouched.',
    mutations: [
      realization({ id: 'R-ADMIN', title: 'AdminCancelHandler', detail: 'Admin-specific entry now supports operator reason and window bypass.', fulfills: ['F-ADMIN-CANCEL'] }, 'AdminCancelHandler gains override/reason behavior'),
      realization({ id: 'R-ADMIN-RULE', title: 'AdminCancellationOverride', detail: 'Admin-only business-rule representation.', fulfills: ['BR-ADMIN-OVERRIDE'] }, '+ AdminCancellationOverride realization'),
      plan({ id: 'PL-A1', title: 'Change AdminCancelBooking', status: 'done', detail: 'Only the admin Feature needs functional change.' }, 'admin Feature plan -> done'),
      plan({ id: 'PL-A2', title: 'Update AdminBookingDetails', status: 'done', detail: 'Collect operator reason in the admin context.' }, 'admin screen plan -> done'),
      plan({ id: 'PL-A3', title: 'Verify admin path', status: 'done', detail: 'Customer Feature remains structurally untouched.' }, 'admin verification plan -> done'),
    ],
  }),
]

export function timelineForBranch(branchId: BranchId): SimulationEvent[] {
  return EVENTS.filter((event) => event.scope === 'scenario' || event.branch === branchId).sort((a, b) => a.logicalOrder - b.logicalOrder || a.id.localeCompare(b.id))
}

export function eventById(eventId: string): SimulationEvent {
  const event = EVENTS.find((item) => item.id === eventId)
  if (!event) throw new Error(`Unknown event ${eventId}`)
  return event
}

export function alignEventForBranch(eventId: string, targetBranch: BranchId): string {
  const current = eventById(eventId)
  if (current.scope === 'scenario') return current.id
  const exact = EVENTS.find((item) => item.scope === 'branch' && item.branch === targetBranch && item.comparisonKey === current.comparisonKey)
  if (exact) return exact.id
  const trigger = current.triggeredBy?.[0]
  if (trigger && EVENTS.some((item) => item.id === trigger && item.scope === 'scenario')) return trigger
  const timeline = timelineForBranch(targetBranch)
  const prior = timeline.filter((item) => item.logicalOrder <= current.logicalOrder).at(-1)
  return prior?.id ?? timeline[0].id
}

function emptySnapshot(): Snapshot {
  return { scenarios: [], screens: [], widgets: [], placements: [], requirements: [], rules: [], features: [], coverage: [], realization: [], plan: [] }
}

function applyMutation(snapshot: Snapshot, mutation: EventMutation) {
  const collection = snapshot[mutation.collection] as Array<{ id: string }>
  const index = collection.findIndex((entry) => entry.id === mutation.targetId)
  if (mutation.op === 'remove') {
    if (index >= 0) collection.splice(index, 1)
    return
  }
  if (!mutation.value) throw new Error(`Upsert mutation ${mutation.targetId} has no value`)
  if (index >= 0) collection[index] = mutation.value as never
  else collection.push(mutation.value as never)
}

export function snapshotAt(branchId: BranchId, eventId: string): Snapshot {
  const selected = eventById(eventId)
  const snapshot = emptySnapshot()
  for (const event of timelineForBranch(branchId)) {
    if (event.logicalOrder > selected.logicalOrder) break
    for (const mutation of event.mutations) applyMutation(snapshot, mutation)
    if (event.id === eventId) break
  }
  return snapshot
}

export function eventDelta(eventId: string): Partial<Record<LayerId, string[]>> {
  const event = eventById(eventId)
  const result: Partial<Record<LayerId, string[]>> = {}
  for (const mutation of event.mutations) {
    const lines = result[mutation.layer] ?? []
    lines.push(mutation.delta)
    result[mutation.layer] = lines
  }
  return result
}

export function changedIds(eventId: string): string[] {
  return [...new Set(eventById(eventId).mutations.map((mutation) => mutation.targetId))]
}

export function changedLayers(eventId: string): LayerId[] {
  return [...new Set(eventById(eventId).mutations.map((mutation) => mutation.layer))]
}

export function widgetsForScreen(snapshot: Snapshot, screenId: string): Widget[] {
  const ids = snapshot.placements.filter((placement) => placement.screenId === screenId).map((placement) => placement.widgetId)
  return snapshot.widgets.filter((widgetItem) => ids.includes(widgetItem.id))
}

export function screensForWidget(snapshot: Snapshot, widgetId: string): Screen[] {
  const ids = snapshot.placements.filter((placement) => placement.widgetId === widgetId).map((placement) => placement.screenId)
  return snapshot.screens.filter((screenItem) => ids.includes(screenItem.id))
}

export function requirementsForOwner(snapshot: Snapshot, ownerType: ProductRequirement['ownerType'], ownerId: string): ProductRequirement[] {
  return snapshot.requirements.filter((req) => req.ownerType === ownerType && req.ownerId === ownerId)
}

export function scenarioRequirementIds(snapshot: Snapshot, scenarioId: string): string[] {
  const scenarioItem = snapshot.scenarios.find((item) => item.id === scenarioId)
  if (!scenarioItem) return []
  const ids = new Set<string>()
  for (const step of scenarioItem.steps) {
    if (step.requirementId) ids.add(step.requirementId)
    if (step.screenId) for (const req of requirementsForOwner(snapshot, 'screen', step.screenId)) ids.add(req.id)
    if (step.widgetId) for (const req of requirementsForOwner(snapshot, 'widget', step.widgetId)) ids.add(req.id)
  }
  return [...ids]
}

export function ruleRequirementIds(snapshot: Snapshot, ruleId: string): string[] {
  return snapshot.requirements.filter((req) => req.ruleIds?.includes(ruleId)).map((req) => req.id)
}

export function coveragesForFeature(snapshot: Snapshot, featureId: string): RequirementCoverage[] {
  return snapshot.coverage.filter((item) => item.featureId === featureId)
}
