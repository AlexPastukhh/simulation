# PT-001 Stage A — Static Scenario Fixture

## Status

```text
prepared
```

This is prototype data only. It is not part of the canonical Proposal Composition.

## Stage A objective

Create a stable, architecture-neutral scenario backbone plus explicit decision forks and branch-local representation mappings.

Stage A intentionally does **not** create implementation/change events yet. Those belong to Stage B.

---

# 1. Scenario identity

```text
scenario_id: SCN-001
title: B2B Booking SaaS
comparison_mode: controlled_counterfactual
```

All `SEVT-*` events are scenario-scoped anchors shared by every branch.

Branch-local decisions and work will use separate IDs during Stage B.

---

# 2. Initial environment

```text
team_count: 1
developer_count: 4
deployable_count: 1
primary_database: PostgreSQL
traffic: low
```

These values are fixture assumptions.

---

# 3. Initial functional surface

```text
CreateBooking
CancelBooking
ChangeBookingDates
GetBooking
SearchBookings
TakePayment
RefundPayment
SellerDashboard
```

---

# 4. Tracked entities

Tracked entities are not all called `State`.

Each tracked entity has a stable identity; its state can evolve over time.

## Problem-semantic entities

| ID | Name | Kind | Initial state |
|---|---|---|---|
| SEM-1 | Booking | BusinessState | active booking lifecycle exists |
| SEM-2 | CancellationPolicy | BusinessRule | regular cancellation allowed until 48h before start |
| SEM-3 | PaymentProcessing | BusinessCapability / external interaction need | one required provider: Stripe |
| SEM-4 | Payment | BusinessState | payment/refund state stored with booking application |
| SEM-5 | SellerReporting | ReadNeed | basic seller dashboard |
| SEM-6 | BillingRetryPolicy | BusinessRule | does not yet exist |

## Organization entities

| ID | Name | Kind | Initial state |
|---|---|---|---|
| ORG-1 | ProductTeam | Team | owns Booking + Payments + Billing work |
| ORG-2 | BillingOwnership | OwnershipRelation | owned by ProductTeam |

## Environment entities

| ID | Name | Kind | Initial state |
|---|---|---|---|
| ENV-1 | SearchWorkload | WorkloadProfile | low |

## Information entities

| ID | Name | Kind | Initial state |
|---|---|---|---|
| INFO-1 | SecondProviderSignal | InformationItem | not revealed |

## External systems

| ID | Name | Kind | Initial visibility |
|---|---|---|---|
| EXT-1 | Stripe | ExternalSystem | known |
| EXT-2 | Adyen | ExternalSystem | hidden from play view until SEVT-04 |

---

# 5. Baseline architecture representations

These are branch-local architecture facts for the common root before any decision fork.

```text
branch_id: BR-ROOT
```

| ID | Representation | Represents / relates to | Relation |
|---|---|---|---|
| REP-R1 | CancelBookingHandler | SEM-2 CancellationPolicy | implements_authoritatively |
| REP-R2 | ChangeBookingDatesHandler | SEM-1 Booking | changes |
| REP-R3 | TakePaymentService | SEM-3 PaymentProcessing | implements |
| REP-R4 | StripeSdkClient | SEM-3 PaymentProcessing / EXT-1 | direct_external_dependency |
| REP-R5 | BookingPostgresSchema | SEM-1 + SEM-4 | stores |
| REP-R6 | SellerDashboardQuery | SEM-5 SellerReporting | implements |

Baseline architecture fixture:

```text
layered monolith
transaction-script leaning
direct Stripe integration
single deployable
shared PostgreSQL
```

These labels describe the fixture only; evaluator logic must not award/penalize them by name.

---

# 6. Scenario event backbone

## SEVT-01 — VIP cancellation rule

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-2 CancellationPolicy
before:
  regular >= 48h
after:
  regular >= 48h
  VIP >= 12h
```

Visible at occurrence.

---

## SEVT-02 — ChangeDates must obey cancellation policy

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-2 CancellationPolicy
before applicability:
  CancelBooking
after applicability:
  CancelBooking
  ChangeBookingDates
```

This event creates the first useful architectural decision opportunity.

---

## SEVT-03 — Admin cancellation must obey same policy

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-2 CancellationPolicy
after applicability:
  CancelBooking
  ChangeBookingDates
  AdminCancel
```

---

## SEVT-04 — Second provider signal revealed

```text
scope: scenario
role: information
category: external_system
```

Mutation:

```text
target: INFO-1 SecondProviderSignal
before: not revealed
after:
  kind: forecast
  subject: second payment provider
  candidate: Adyen
  confidence: medium
  commitment: none
```

Important:

`SEVT-04` does **not** mutate `SEM-3 PaymentProcessing` into a two-provider requirement.

It only changes information available to decisions.

---

## SEVT-05 — Second provider becomes committed requirement

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-3 PaymentProcessing
before required providers:
  Stripe
after required providers:
  Stripe
  Adyen
```

In Play Mode this event is not visible before its occurrence.

---

## SEVT-06 — Billing ownership changes

```text
scope: scenario
role: state_change
category: organization
```

Mutations:

```text
ORG-2 BillingOwnership:
  before: ProductTeam
  after: BillingTeam

organization:
  create ORG-3 BillingTeam
```

This changes organization state only. It does not automatically extract a service or change deployment topology.

---

## SEVT-07 — Billing retry workflow required

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-6 BillingRetryPolicy
before: absent
after:
  failed billing attempts require retry behavior
```

---

## SEVT-08 — Cancellation window changes again

```text
scope: scenario
role: stimulus
category: requirement
```

Mutation:

```text
target: SEM-2 CancellationPolicy
before:
  VIP >= 12h
after:
  VIP >= 24h
```

This event is intentionally repetitive: it tests repeated change to the same business knowledge.

---

# 7. Information visibility

Authoring data contains the full scenario, but Play Mode visibility is constrained.

| Scenario event | Visible before event? | Why |
|---|---:|---|
| SEVT-01 | no | first occurrence |
| SEVT-02 | no | future requirement |
| SEVT-03 | no | future requirement |
| SEVT-04 | no | information reveal itself |
| SEVT-05 | no | not committed at SEVT-04 |
| SEVT-06 | no | future organization change |
| SEVT-07 | no | future requirement |
| SEVT-08 | no | future requirement |

After `SEVT-04`, the visible information includes `INFO-1` forecast but not the future fact that `SEVT-05` will occur.

---

# 8. Decision fork DF-01 — Cancellation knowledge placement

Decision becomes available after `SEVT-02` has been revealed and analyzed.

## DF-01-K — KEEP local rule placement

Intent:

```text
Do not introduce a shared CancellationPolicy representation.
Implement required behavior in the handlers that need it.
```

Resulting branch prefix:

```text
BR-C-K
```

Expected representation mapping after Stage B implementation:

```text
SEM-2 CancellationPolicy
  -> CancelBookingHandler
  -> ChangeBookingDatesHandler
```

After SEVT-03 it may become:

```text
SEM-2
  -> CancelBookingHandler
  -> ChangeBookingDatesHandler
  -> AdminCancelHandler
```

This is the prototype's 1:N duplicated representation case.

## DF-01-P — Centralize policy

Intent:

```text
Create one authoritative CancellationPolicy representation and make use cases consume it.
```

Resulting branch prefix:

```text
BR-C-P
```

Expected mapping:

```text
SEM-2 CancellationPolicy
  -> CancellationPolicy component [authoritative]

consumers:
  CancelBookingHandler
  ChangeBookingDatesHandler
  later AdminCancelHandler
```

Stage B must generate the concrete migration/change events; Stage A only defines the intended branch state.

---

# 9. Decision fork DF-02 — Payment dependency boundary

Decision becomes available after `SEVT-04` information reveal, before `SEVT-05` occurs.

DF-02 is evaluated independently under both DF-01 parent branches.

## DF-02-K — KEEP direct provider dependency

Intent:

```text
Keep direct Stripe dependency until a second provider is actually required.
```

## DF-02-P — Introduce PaymentPort proactively

Intent:

```text
Introduce a provider boundary now using only currently known information.
```

Expected pre-SEVT-05 representation:

```text
SEM-3 PaymentProcessing
  -> PaymentPort [authoritative dependency boundary]
  -> StripeAdapter
  -> Stripe
```

Again, Stage B must produce the actual implementation events and cost facts.

---

# 10. Branch tree

Using two independent decision forks produces four leaf branches:

```text
BR-ROOT
   |
   +-- DF-01-K --> BR-C-K
   |                |
   |                +-- DF-02-K --> BR-KK
   |                +-- DF-02-P --> BR-KP
   |
   +-- DF-01-P --> BR-C-P
                    |
                    +-- DF-02-K --> BR-PK
                    +-- DF-02-P --> BR-PP
```

Meaning:

| Branch | Cancellation decision | Payment decision |
|---|---|---|
| BR-KK | KEEP local | KEEP direct |
| BR-KP | KEEP local | introduce port |
| BR-PK | centralize policy | KEEP direct |
| BR-PP | centralize policy | introduce port |

Why four leaves instead of one simple A/B pair:

- it prevents cancellation and payment decisions from being causally conflated;
- UI may still compare only two selected leaves at a time;
- paired comparisons can hold one decision constant.

Examples:

```text
Cancellation effect with payment held direct:
BR-KK vs BR-PK

Cancellation effect with payment held port:
BR-KP vs BR-PP

Payment effect with cancellation held local:
BR-KK vs BR-KP

Payment effect with cancellation held centralized:
BR-PK vs BR-PP
```

---

# 11. Stage A invariants

Stage B must preserve:

1. one identity per `SEVT-*` ScenarioEvent across all branches;
2. ScenarioEvents have no branch-local duplication;
3. branch decisions/work receive separate branch-scoped IDs;
4. `SEM-*` identities remain stable across branches;
5. `REP-*` architecture representations may differ by branch;
6. information reveal is not equivalent to future requirement occurrence;
7. architecture decisions do not automatically happen because a DecisionOpportunity exists;
8. KEEP remains valid;
9. no architecture label directly contributes cost;
10. future scenario events remain hidden in Play Mode until revealed/occurred.

---

# 12. Stage A checks

## Check A-1 — Architecture-neutral scenario backbone

Pass condition:
`SEVT-*` describes problem, organization or information changes without prescribing the architectural response.

Current fixture assessment:
`pass provisionally`.

## Check A-2 — Shared anchor identity

Pass condition:
each external event has exactly one scenario-level ID.

Current fixture assessment:
`pass provisionally`.

## Check A-3 — Decision isolation

Pass condition:
the two architecture decisions can be varied independently.

Current fixture assessment:
`pass provisionally` via four-leaf branch tree.

## Check A-4 — Semantic identity survives branch differences

Pass condition:
`SEM-2` and `SEM-3` retain identity while representations change.

Current fixture assessment:
`pass provisionally`; requires Stage B/C validation.

## Check A-5 — No hindsight leakage

Pass condition:
`SEVT-04` reveals only a forecast; `SEVT-05` remains hidden until occurrence.

Current fixture assessment:
`pass provisionally`.

---

# 13. Stage A outcome

Stage A fixture is prepared.

No PT-001 test question is marked fully supported yet.

Provisional checks only establish that the fixture can proceed to Stage B without an obvious contradiction.

Next:

```text
Stage B — generate branch-scoped decisions, activities, mutations and ImplementationOperations from the same shared ScenarioEvents.
```
