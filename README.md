# Simulation — сценарии документации и прототипы

## Текущий PT-006

PT-006 работает с одной новой Feature/DDD-архитектурой. Architecture Planning Content Instance содержит CURRENT и Plan с независимыми Evolution Steps. Site Requirements и Markdown — отдельные Content Instances. History хранит явно зафиксированные фактические снимки; Screen/Window управляют представлениями и размещением. Полный Workspace и его создаваемый набор состоят из четырёх экранов с 17 основными окнами (5/4/4/3); Architecture Planning заменяет отдельное Architecture и показывает CURRENT или Step. [Каталог видов и владельцев данных](prototypes/PT-006/workspace-shell/docs/architecture-simulator/CONTENT_VIEWS.md).

Активные A/B, Context и Scope Comparison удалены. Сравнение архитектур отложено; старые браузерные данные не импортируются и не удаляются.

- [PT-006: запуск и документация](prototypes/PT-006/workspace-shell/README.md)
- [Состояние реализации и ограничения проверки](prototypes/PT-006/workspace-shell/docs/workspace/HANDOFF.md)
- [Workspace и хранение](prototypes/PT-006/workspace-shell/docs/workspace/README.md)

Подробные технические определения принадлежат документации PT-006. Этот README — входная карта.

## Кандидатные направления

[Общий DRLD — документация, Gendocen и Workspace](DESIRED_SCENARIO_DOCUMENTATION_WORKSPACE_CANDIDATE.md), [индекс самостоятельных DRLD](desired_scenarios/README.md) и [Need/FR trace](desired_scenarios/NEED_FR_TRACE_REVIEW_CANDIDATE.md) имеют статус CANDIDATE. Сквозная интеграция Git/Gendocen/Workspace в PT-006 не реализована.

[SC-001@v6-candidate](SC-001_desired_architecture_simulator_scenario_v6_candidate.md) описывает самостоятельный authored comparative scenario. Он не является текущим runtime PT-006 или принятым требованием вернуть A/B. [V3A r10](architecture_simulator_proposal_composition_v3a_candidate_r10_pt006_remediation.md) и его предыдущие версии сохраняют исторический кандидатный контекст.

## История

Датированные результаты относятся к своим версиям:

- [Исправления содержимого PT-006, 2026-10-10](prototypes/PT-006/PT006_REMEDIATION_2026-10-10.md)
- [Workspace interactions, 2026-10-10](prototypes/PT-006/PT006_WORKSPACE_INTERACTIONS_2026-10-10.md)
- [Независимый content review, 2026-10-10](prototypes/PT-006/workspace-shell/PT006_independent_content_review_2026-10-10.md)
- [Индекс прототипов](prototypes/README.md)

Прежние content-v6, Context/A/B и результаты их проверок относятся к историческому runtime. Применимые виды исходного каталога восстановлены в новой одноархитектурной композиции: отдельное Architecture заменено Architecture Planning, Comparison исключён. Прежние проверки не являются доказательством проверок нового рабочего дерева. Старые Scenario/reviews сохраняются как история. В старом плане упомянут отдельный V2 baseline; его файл ранее не был найден, поэтому не считать его независимо восстановленным.

## Для следующего исполнителя

Сначала прочитайте HANDOFF PT-006 и фактический git status: рабочее дерево может содержать untracked исходники. Не используйте старый HEAD или датированный review как описание нового поведения. Не повышайте candidate, пример или технический Git commit до принятого Need/FR/Scenario.

Работайте в выбранном пользователем workspace. Перед переносом проверьте конфликты, сохраните затрагиваемые оригиналы и выполните необходимые проверки. Не меняйте монтирования, права или пользовательский Windows desktop без отдельного разрешения.
