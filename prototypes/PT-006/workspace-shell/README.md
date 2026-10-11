# PT-006 · Workspace Shell и профиль Architecture Simulator

**Workspace Shell** — универсальная оболочка экранов, окон, вкладок, компоновки и навигации. **Architecture Simulator** — первый подключённый **профиль**, предоставляющий 18 предметных видов, демонстрационные State/Schema/History и альтернативные архитектуры A/B. В приложении **два переключаемых профиля** — Architecture Simulator и Markdown Fixture; одновременно активен один. Это ещё не общий Workspace с окнами обоих профилей. **CURRENT** далее означает проверенное поведение этой версии кода. **Context Instances, Context Templates и один профильный read-only Scope Comparison уже доступны; другие Scope Mechanisms и межпрофильная композиция остаются кандидатами.**

**Начните с [карты документации](docs/README.md).** Она разделяет действующий Shell, текущий Workspace и реализованный read-only Comparison Scope, остающиеся кандидаты общей Scope/Integration-архитектуры и профиль симулятора.

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
| Workspace: Context A/B, Scope Comparison, второй Markdown Profile | [Workspace](docs/workspace/README.md) | **CURRENT / G-CODE-04** |
| Оставшаяся архитектура: одновременные межпрофильные окна, общий Scope Engine, права записи | [Кандидатная модель](docs/workspace/CANDIDATE_MODEL.md) | **CANDIDATE / после G-CODE-04** |
| Подключаемые поставщики содержимого | [Profiles](docs/profiles/README.md) | **CURRENT** |
| Предметная A/B симуляция | [Architecture Simulator](docs/profiles/architecture-simulator/README.md) | **CURRENT** |
| Факты/планы/история и связи | [Система контента](docs/architecture-simulator/CONTENT_SYSTEM.md) | **CURRENT для PT-006** |
| Описания всех 18 видов | [Каталог](docs/architecture-simulator/CONTENT_VIEWS.md) | **CURRENT для PT-006** |

## Структура исходников

```text
src/
├── App.tsx                        # переключаемые Architecture и Markdown в одном Shell
├── main.tsx
├── shell/
│   ├── contracts.ts               # профиль и события
│   ├── workspace.ts               # layout/screens/panels/tabs
│   ├── contexts.ts                # Context/ResourceRef/Template и адреса
│   ├── resourceProviders.ts       # read-only контракт ресурсов разных профилей
│   ├── safeStorage.ts             # guard и архив невалидных сохранений перед заменой
│   ├── WorkspaceShell.tsx
│   └── windowDrag.ts
└── profiles/
    └── architecture-simulator/
        ├── SimulatorProfile.tsx    # A/B и обработчики
        ├── content.ts             # доменные State и Schema
        ├── history.ts             # подготовленная History
        ├── workspace.ts           # виды и стартовые экраны
        ├── scope-mechanisms/       # Comparison с явными Scope bindings
        └── ...                    # рендеринг, данные, стили
    └── markdown-fixture/          # проверочный профиль с документом без History
docs/
├── README.md                      # общий индекс
├── shell/                         # текущий Shell
├── workspace/                     # текущий layout + кандидатная модель
├── profiles/                      # роль профиля и профильная документация
└── architecture-simulator/        # подробные предметные материалы, прежние пути
tests/                              # unit и UI-smoke
```

Тип `Workspace` по-прежнему описывает **раскладку**, а отдельный слой `contexts.ts` и профиль управляют Context/ResourceRef/Template. В общем Workspace можно открыть разные Context на одном экране. Полноценного универсального Scope Engine пока нет. Профильная папка `src/profiles/architecture-simulator/scope-mechanisms/` уже существует, а `src/integrations/` и универсальная Shell Scope-папка — ещё нет.

## Второй профиль и границы универсальности

Кнопка **«▤ Markdown Profile»** открывает проверочный профиль с независимыми Markdown Context и документами **без** History. Создание Context, пустой/скопированный экран, редактирование и сохранение используют те же механизмы Shell; вернуться в симуляцию можно через **«← Симулятор»**. Профили имеют отдельные ключи данных и layout. Read-only контракт [ResourceProvider](src/shell/resourceProviders.ts) позволяет тестам разрешить ссылки на ресурсы обоих профилей с проверкой семантических возможностей; Architecture Comparison **отвергает Markdown**.

**Не реализовано:** одновременная компоновка окон Architecture и Markdown на одном Workspace Screen и общий межпрофильный Scope Engine. Этот результат **подтверждает проверяемую универсальность Shell**, но не завершение всей кандидатной платформы.

## Экраны симуляции: реализовано сейчас

Новая раскладка при первом открытии состоит из четырёх тематических экранов: «История и факты», «Архитектура и реализация», «Планирование», «Результаты и сравнение». Все **18 видов** располагаются в отдельных стартовых окнах. Ранее сохранённые пользовательские раскладки A/B сохраняются без автоматической замены.

**«+ Экран»** создаёт пустой экран или копию текущего, не копируя State/History. **«⊞ Общий Workspace»** открывает отдельную многоконтекстную раскладку; обычные виды Architecture A и B можно показать рядом. **«+ Контекст» → «Эволюция архитектуры»** создаёт независимую копию State и **комплект четырёх экранов**; **«Минимальный контекст»** создаёт заметки/требования без History. Подробности — в [документации Workspace](docs/workspace/README.md).

**Старый режим A/B** сохраняет `pt006-simulator-layout-[A|B]-v3` и `pt006-simulator-content-[A|B]-v6`. **Общий Workspace** имеет новый ключ layout и отдельное хранилище копий, не удаляя старые A/B данные. В старом режиме исторический Comparison читает A/B напрямую; в общем Workspace новый read-only Scope Comparison использует **явные привязки двух Context**. Готовый путь создаёт экран целиком, ручной связывает уже открытые Architecture без изменений источников. Открытие вкладки или выбор Plan Step не создаёт фактических событий.

## Статус и история решений

- **CURRENT / recovery hardening (2026-10-11):** загрузка A/B, Markdown, Layout, Context и Scope больше не перезаписывает прежние записи при открытии. При редактировании невалидные исходные bytes архивируются под `pt006-recovery-original-v1:<key>` до записи. Исправлено восстановление Markdown при отсутствии M-1, усилен `validateWorkspace`, валидные Context/Scope восстанавливаются отдельно от битых. **106 unit-тестов, build/lint и пять Edge smoke** с негативными сценариями, включая контроль неизменности A/B. Подробнее — [правила восстановления](docs/workspace/README.md).

- **CURRENT / G-CODE-04 (2026-10-11):** второй Markdown Fixture Profile, отдельные Context и сохранение без History, read-only контракты двух профилей. **101/101 unit**, build/lint, все 4 Edge UI smoke (legacy, Context, Scope, Markdown), подтверждена неизменность A/B. Межпрофильные окна одновременно **не реализованы**.
- **HISTORICAL / G-CODE-03 (2026-10-11):** **97/97 unit**, build, lint и три Edge smoke (старые раскладки, Context Instances, Scope Comparison). Проверены read-only bindings, готовая A+B и ручная сборка, отказ несовместимой/одинаковой паре, сохранение Scope после reload и неизменность фактических State A/B.
- **HISTORICAL / G-CODE-02 (2026-10-11):** проверены **92/92 unit-теста**, build и lint, Edge UI smoke старого Shell и **отдельный context-ui-smoke**: A/B на одном Screen, адресные переходы, редактирование копии независимо от A, минимальные заметки без History, восстановление после reload. Это **не** проверка будущего Scope Engine.
- **HISTORICAL / G-CODE-01, 2026-10-11:** экранная итерация прошла 86/86 unit-тестов, build/lint и Edge smoke. Реализовано «+ Экран» с пустым экраном/копией и 4 стартовых экрана.
- **HISTORICAL / WSC 2026-10-10:** [WSC-PR-01–04](../PT006_WORKSPACE_INTERACTIONS_2026-10-10.md) — ограниченный принятый объём Shell/профиля; на его датированном этапе прошло 79/79 тестов и ограниченный Edge smoke. [Исправления PT-006](../PT006_REMEDIATION_2026-10-10.md) хранят собственные датированные результаты.
- **CANDIDATE:** [план следующей кодовой итерации](docs/workspace/NEXT_CODE_PLAN_CANDIDATE.md) · [SC-001@v5](../../../SC-001_desired_architecture_simulator_scenario_v5_candidate.md), [V3A r10](../../../architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md), [модель Context/Scope](docs/workspace/CANDIDATE_MODEL.md).
- **История review:** [независимая проверка контента](PT006_independent_content_review_2026-10-10.md) · [инвентаризация](CONTENT_INVENTORY_REVIEW_2026-10-10.md). Они отражают прежние версии, не выдаются за текущее измерение.

[Карта кода Shell](src/shell/README.md) · [Карта кода профиля](src/profiles/architecture-simulator/README.md).