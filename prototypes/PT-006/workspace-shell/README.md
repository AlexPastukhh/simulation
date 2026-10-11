# PT-006 · Workspace Shell и профиль Architecture Simulator

**Workspace Shell** — универсальная оболочка экранов, окон, вкладок, компоновки и навигации. **Architecture Simulator** — первый подключённый **профиль**, предоставляющий 18 предметных видов, демонстрационные State/Schema/History и альтернативные архитектуры A/B. Сейчас это прототип с **одним активным профилем**, не готовая многопрофильная платформа. **CURRENT** далее означает проверенное поведение этой версии кода; Context Instances и Scope Mechanisms остаются кандидатной архитектурой.

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
| Workspace: `layout-v3`, контексты A/B, сохранение и границы | [Workspace](docs/workspace/README.md) | **CURRENT** |
| Контексты как экземпляры, Context Templates, Prepared Contexts, Scope Mechanisms | [Кандидатная модель](docs/workspace/CANDIDATE_MODEL.md) | **CANDIDATE / ещё не реализовано** |
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

Не путайте `Workspace` в текущем TypeScript (только **раскладка интерфейса**) с обсуждаемым будущим Workspace (контексты, ресурсы, Scope Mechanisms). `src/integrations/` и `src/**/scope-mechanisms/` ещё **не существуют**.

## Экраны симуляции: реализовано сейчас

Новая раскладка при первом открытии состоит из четырёх тематических экранов: «История и факты», «Архитектура и реализация», «Планирование», «Результаты и сравнение». Все **18 видов** располагаются в отдельных стартовых окнах. Ранее сохранённые пользовательские раскладки A/B сохраняются без автоматической замены.

**«+ Экран» предлагает только две универсальные операции Shell:** пустой экран и копию текущего. Копирование повторяет размещение окон и вкладок, но не копирует и не меняет предметные State/History. Рецепты отдельных экранов и пакет из четырёх сохранены в коде профиля для будущего использования, **но не предлагаются в меню «+ Экран»**. Предлагаемый **единый Context Template** с четырьмя экранами и действием «+ Контекст» пока не реализован; см. [план следующего этапа](docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md).

Для A и B отдельно хранятся `pt006-simulator-layout-[A|B]-v3` и `pt006-simulator-content-[A|B]-v6`. Переключение ветки выбирает одновременно её данные и её целую раскладку. Профильный Comparison читает A/B напрямую; универсального механизма межконтекстных инструментов пока нет. Открытие вкладки или выбор Plan Step не создаёт фактических событий.

## Статус и история решений

- **CURRENT / экранная итерация 2026-10-11:** проверены 86/86 unit-тестов, build, lint и отдельный Edge UI smoke: меню «+ Экран» (пустой/копия), уникальные ID, сохранение раскладок и State A/B, восстановление после reload. Это **не** реализация и не проверка будущих Context/Scope API.
- **HISTORICAL / WSC 2026-10-10:** [WSC-PR-01–04](../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md) — ограниченный принятый объём Shell/профиля; на его датированном этапе прошло 79/79 тестов и ограниченный Edge smoke. [Исправления PT-006](../PT006_REMEDIATION_2026-10-10.md) хранят собственные датированные результаты.
- **CANDIDATE:** [план следующей кодовой итерации](docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md) · [SC-001@v5](../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r10](../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md), [модель Context/Scope](docs/workspace/CANDIDATE_MODEL.md).
- **История review:** [независимая проверка контента](PT006_independent_content_review_2026-10-10.md) · [инвентаризация](CONTENT_INVENTORY_REVIEW_2026-10-10.md). Они отражают прежние версии, не выдаются за текущее измерение.

[Карта кода Shell](src/shell/README.md) · [Карта кода профиля](src/profiles/architecture-simulator/README.md).