# PT-006 · Workspace Shell и профиль Architecture Simulator

**Workspace Shell** — универсальная оболочка экранов, окон, вкладок, компоновки и навигации. **Architecture Simulator** — первый подключённый **профиль**, предоставляющий 18 предметных видов, демонстрационные State/Schema/History и альтернативные архитектуры A/B. Сейчас это прототип с **одним активным профилем**, не готовая многопрофильная платформа. **CURRENT** далее означает проверенное поведение этой версии кода. **Context Instances и Context Templates уже доступны в рамках одного профиля; Scope Mechanisms и межпрофильная композиция остаются кандидатами.**

**Начните с [карты документации](docs/README.md).** Она разделяет действующий Shell, текущий Workspace, кандидатные контексты/Scope Mechanisms и профиль симулятора.

## Запуск

```powershell
cd C:\Users\alexa\Repos\simulation\prototypes\PT-006\workspace-shell
npm run dev -- --port 4196 --strictPort
npm test
npm run build
npm run lint
```

Откройте http://127.0.0.1:4196/

## Архитектура и документация

| Область | Основной документ | Статус |
|---|---|---|
| Shell: экран, окно, вкладка, `open-content`, пустой экран, копия текущего, drag/fit | [Shell](docs/shell/README.md) | **CURRENT** |
| Workspace: независимые Context A/B, два представления рядом, копии State, минимальный Context без History | [Workspace](docs/workspace/README.md) | **CURRENT / G-CODE-02** |
| Оставшаяся архитектура: Scope Mechanisms, готовые/ручные композиции и интеграция профилей | [Кандидатная модель](docs/workspace/CANDIDATE_MODEL.md) | **CANDIDATE / G-CODE-03–04** |
| Подключаемые поставщики содержимого | [Profiles](docs/profiles/README.md) | **CURRENT** |
| Предметная A/B симуляция | [Architecture Simulator](docs/profiles/architecture-simulator/README.md) | **CURRENT** |
| Факты/планы/история и связи | [Система контента](docs/architecture-simulator/CONTENT_SYSTEM.md) | **CURRENT для PT-006** |
| Описания всех 18 видов | [Каталог](docs/architecture-simulator/CONTENT_VIEWS.md) | **CURRENT для PT-006** |

## Структура исходников

```text
src/
├── App.tsx                        # один профиль → один WorkspaceShell
├── main.tsx
├── shell/
│   ├── contracts.ts               # профиль и события
│   ├── workspace.ts               # layout/screens/panels/tabs
│   ├── contexts.ts                # Context/ResourceRef/Template и адреса
│   ├── WorkspaceShell.tsx
│   └── windowDrag.ts
└── profiles/
    └── architecture-simulator/
        ├── SimulatorProfile.tsx    # A/B и обработчики
        ├── content.ts             # доменные State и Schema
        ├── history.ts             # подготовленная History
        ├── workspace.ts           # виды и стартовые экраны
        └── ...                    # рендеринг, данные, стили
docs/
├── README.md                      # общий индекс
├── shell/                         # текущий Shell
├── workspace/                     # текущий layout + кандидатная модель
├── profiles/                      # роль профиля и профильная документация
└── architecture-simulator/        # подробные предметные материалы, прежние пути
tests/                              # unit и UI-smoke
```

Тип `Workspace` по-прежнему описывает **раскладку**, а отдельный слой `contexts.ts` и профиль управляют Context/ResourceRef/Template. В общем Workspace можно открыть разные Context на одном экране. Полноценного Scope Engine пока нет. `src/integrations/` и `src/**/scope-mechanisms/` ещё **не существуют**.

## Экраны симуляции: реализовано сейчас

Новая раскладка при первом открытии состоит из четырёх тематических экранов: «История и факты», «Архитектура и реализация», «Планирование», «Результаты и сравнение». Все **18 видов** располагаются в отдельных стартовых окнах. Ранее сохранённые пользовательские раскладки A/B сохраняются без автоматической замены.

**«+ Экран»** создаёт пустой экран или копию текущего, не копируя State/History. **«⊞ Общий Workspace»** открывает отдельную многоконтекстную раскладку; обычные виды Architecture A и B можно показать рядом. **«+ Контекст» → «Эволюция архитектуры»** создаёт независимую копию State и **комплект четырёх экранов**; **«Минимальный контекст»** создаёт заметки/требования без History. Подробности — в [документации Workspace](docs/workspace/README.md).

**Старый режим A/B** сохраняет `pt006-simulator-layout-[A|B]-v3` и `pt006-simulator-content-[A|B]-v6`. **Общий Workspace** имеет новый ключ layout и отдельное хранилище копий, не удаляя старые A/B данные. Профильный Comparison читает A/B напрямую; универсального механизма межконтекстных инструментов пока нет. Открытие вкладки или выбор Plan Step не создаёт фактических событий.

## Статус и история решений

- **CURRENT / G-CODE-02 (2026-10-11):** проверены **92/92 unit-теста**, build и lint, Edge UI smoke старого Shell и **отдельный context-ui-smoke**: A/B на одном Screen, адресные переходы, редактирование копии независимо от A, минимальные заметки без History, восстановление после reload. Это **не** проверка будущего Scope Engine.
- **HISTORICAL / G-CODE-01, 2026-10-11:** экранная итерация прошла 86/86 unit-тестов, build/lint и Edge smoke. Реализовано «+ Экран» с пустым экраном/копией и 4 стартовых экрана.
- **HISTORICAL / WSC 2026-10-10:** [WSC-PR-01–04](../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md) — ограниченный принятый объём Shell/профиля; на его датированном этапе прошло 79/79 тестов и ограниченный Edge smoke. [Исправления PT-006](../PT006_REMEDIATION_2026-10-10.md) хранят собственные датированные результаты.
- **CANDIDATE:** [план следующей кодовой итерации](docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md) · [SC-001@v5](../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r10](../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md), [модель Context/Scope](docs/workspace/CANDIDATE_MODEL.md).
- **История review:** [независимая проверка контента](PT006_independent_content_review_2026-10-10.md) · [инвентаризация](CONTENT_INVENTORY_REVIEW_2026-10-10.md). Они отражают прежние версии, не выдаются за текущее измерение.

[Карта кода Shell](src/shell/README.md) · [Карта кода профиля](src/profiles/architecture-simulator/README.md).