# Документация Workspace Shell · PT-006

**Вход в техническую документацию.** PT-006 содержит универсальный Shell и **два переключаемых профиля**: Architecture Simulator и Markdown Fixture. Это подтверждённая узкая переиспользуемость Shell, но ещё не единая рабочая область с окнами разных профилей.

## Что читать

| Область | Документ | Статус |
|---|---|---|
| **Shell** — окна, вкладки, экраны, навигация, компоновка | [Shell: текущие механизмы](shell/README.md) | **CURRENT**; пустой экран и копия текущего доступны в Shell |
| **Workspace** — Context, Scope Comparison, Markdown Fixture и сохранение | [Workspace: как работает сейчас](workspace/README.md) | **CURRENT / G-CODE-04** |
| **Целевая архитектура** — многопрофильные окна одновременно, универсальные Scope/permissions | [Кандидатная модель Workspace](workspace/CANDIDATE_MODEL.md) | **CANDIDATE / за пределами G-CODE-04** |
| **Выполненный план G-CODE-01–04** — этапы, проверки, ограничения | [История плана](workspace/NEXT_CODE_PLAN_CANDIDATE.md) | **IMPLEMENTED / исторический кандидатный план** |
| **Профили** — поставщики содержимого, состояния и представлений | [Профили и контракт подключения](profiles/README.md) | **CURRENT** с явными будущими направлениями |
| **Architecture Simulator** — предметная A/B реализация | [Документация профиля](profiles/architecture-simulator/README.md) | **CURRENT** |
| **Markdown Fixture** — второй проверочный профиль без History | [Код и описание профиля](../src/profiles/markdown-fixture/README.md) | **CURRENT / G-CODE-04** |
| **Семантика данных симуляции** | [Система контента](architecture-simulator/CONTENT_SYSTEM.md) | **CURRENT** для PT-006; не принятие всей SC-001/V3A |
| **Все 18 видов симулятора** | [Каталог видов](architecture-simulator/CONTENT_VIEWS.md) | **CURRENT** для PT-006 |

[Быстрый запуск и устройство проекта](../README.md) · [Код Shell](../src/shell/README.md) · [Код профиля](../src/profiles/architecture-simulator/README.md)

## Как разделены обязанности

- **Shell**: универсальные действия с экранами, окнами, вкладками, их размещением и переходами. Не знает предметных фактов симуляции.
- **Workspace**: `Workspace v3` в TypeScript по-прежнему хранит **только раскладку**, но отдельные `ContextInstance` и контекстные адреса уже работают в общем Workspace на одном профиле. Это не готовый реестр всех профилей и Scope-инструментов.
- **Profile**: регистрирует содержимое и его представления, предоставляет предметные данные, State/Schema/History и операции. Подключены Architecture Simulator и Markdown Fixture, выбираемые по одному.
- **Scope Mechanisms**: профильный `architecture-comparison-v1` уже реализует read-only Scope двух явных Context, готовую и ручную сборку. Legacy `comparison` в старом режиме продолжает читать `allData.A/B` для совместимости. Общего межпрофильного Scope runtime нет.

## Карта каталогов

```text
src/
├── App.tsx                        # переключает два профиля в общем Shell
├── shell/                        # универсальный UI, layout и contexts.ts
└── profiles/
    ├── architecture-simulator/   # предметный State, History, рендеринг, A/B
    └── markdown-fixture/         # независимые документы без History
docs/
├── shell/                        # факты о Shell
├── workspace/                    # текущая модель + кандидатная модель и будущий кодовый план
├── profiles/                     # роль профиля и профильные входные страницы
└── architecture-simulator/       # подробные документы симулятора (сохранены пути)
tests/                             # unit и UI-smoke проверки
```

Документация **частично** повторяет структуру кода, но не моделирует несуществующие каталоги. В частности, нет самостоятельных `src/workspace/`, `src/integrations/` и универсальной `src/shell/scope-mechanisms/`; **профильная** папка `src/profiles/architecture-simulator/scope-mechanisms/` существует и содержит работающий Comparison.

## Статусы и история

**CURRENT / Git main** — реализация в опубликованном коде; **LOCAL UNPUBLISHED** — незакоммиченные изменения до публикации; **CANDIDATE** — нереализованная часть целевой модели; **HISTORICAL** — датированная итерация. С G-CODE-03 доступны общий Workspace, Context A/B, независимые копии, Context Templates, один read-only Scope Comparison и два пути его сборки. Другие Scope и межпрофильные композиции остаются CANDIDATE.

Датированные решения/проверки: [Workspace WSC-PR-01–04](../../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md), [исправления PT-006](../../PT006_REMEDIATION_2026-10-10.md). Общие кандидаты: [SC-001@v5](../../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r10](../../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md). Изменение документации не принимает их автоматически.

## Правило сопровождения

Одну смысловую истину описывает один владелец: механика Shell — в `docs/shell`, текущее состояние Workspace — в `docs/workspace`, предметные правила симуляции — в `docs/architecture-simulator`. Остальные README кратко объясняют назначение папки и ссылаются на этот источник. При смене реализации обновляют соответствующий раздел и явно датируют проверку, а не переписывают старые журналы.