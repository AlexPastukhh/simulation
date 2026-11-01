# Desired Real-Life Definitions — документация, Gendocen, Workspace, предметные сценарии

**Обновлено:** 2026-10-11. **Статус:** индекс взаимосвязанных самостоятельных сценариев, все перечисленные текущие редакции — CANDIDATE / TRANSACTION OPEN. Это не реестр автоматически принятых Fundamental Requirements.

| Desired Scenario | Отдельная фундаментальная польза |
|---|---|
| [Общий путь исследования документации](../DESIRED_SCENARIO_DOCUMENTATION_WORKSPACE_CANDIDATE.md) | Нужную информацию и связи можно понять через доступные источники и представления |
| [Создание/актуализация документации](DOCUMENTATION_AUTHORING_CANDIDATE.md) | Канонический материал пригоден для повторного использования человеком, ИИ и UI |
| [Получение объектов Gendocen](GENDOCEN_OBJECT_COMPOSITION_CANDIDATE.md) | Вычисленные поля получаются без ручного согласования с исходными данными |
| [Исследование в Workspace](WORKSPACE_VISUALIZATION_CANDIDATE.md) | Несколько уместных видов помогают читать, ориентироваться и сопоставлять данные |
| [SC-001@v6-candidate — архитектурная эволюция](../SC-001_desired_architecture_simulator_scenario_v6_candidate.md) | Обоснованное понимание различий A/B, работы и последствий архитектурных решений |

**Сквозная связь:** авторство может подготовить источник; Gendocen может построить объект; Workspace может показать материал; SC-001 определяет отдельный профильный путь исследования готовой сравнительной истории. Ни один из них не является рекурсивным под-сценарием другого, а обычный документ не обязан проходить через все стадии. Связь между DRLD не означает единый обязательный UI wizard или иерархию сущностей.

**TARGET 2026-10-12 — Template/Entity Instance:** классы Template и наполненные объектоподобные Entity Instances предполагаются на уровнях Content, Window, Screen, Screen Set. Preview с демонстрационными данными — временный экземпляр; Architecture A/B — целевые подготовленные экземпляры одного шаблона исследования архитектуры, при текущих legacy Context/DemoStore. Это не CURRENT универсального Template Engine и не автоматическое принятие FR. [Каноническая модель](../prototypes/PT-006/workspace-shell/docs/workspace/CANDIDATE_MODEL.md) · [переход](../prototypes/PT-006/workspace-shell/docs/workspace/TEMPLATE_INSTANCE_TRANSITION_CANDIDATE.md).

**TARGET 2026-10-12 — Scope-механики:** в [сценарии Workspace](WORKSPACE_VISUALIZATION_CANDIDATE.md) и [общем пути документации](../DESIRED_SCENARIO_DOCUMENTATION_WORKSPACE_CANDIDATE.md) уточнено необязательное подключение исполняемого поведения к выбранным **Entity Instances** совместимых Template, с проверкой их полей и capabilities. Каталог показывает требования механики до выбора участников; Scope Instance можно конфигурировать, отключать и отсоединять независимо от экранного представления. В [SC-001](../SC-001_desired_architecture_simulator_scenario_v6_candidate.md) Architecture Comparison приведён как первый конкретный пример. Это уточнение кандидатных DRLD, **не принятие новых N-/FR-*** и не CURRENT универсального Scope Engine.

## Нужды, требования и статус

[Карта проверки Need / FR и границ](NEED_FR_TRACE_REVIEW_CANDIDATE.md) отделяет общий пользовательский замысел от N-CODE-NEXT-01…03 и исторических архитектурных N-1…13 / FR-1…28. Не приняты новые общесистемные FR, их охват и статус ещё требуют отдельного решения. Каждый сценарий содержит **Fundamental Benefit**, **Scenario Concept**, **Detailed Desired Real-Life Scenario** и описание существенных усилий/ошибок.

**Историческая основа SC-001:** [v5 candidate](../SC-001_desired_architecture_simulator_scenario_v5_candidate.md) сохраняется отдельно. Новая [v6 DRLD candidate](../SC-001_desired_architecture_simulator_scenario_v6_candidate.md) не делает старые кандидатные N/FR автоматически committed.

## Не определено как отдельный сценарий

Финансовая/банковская и интернет/сетевая симуляции, специальное визуальное планирование разработки приложения/игры: указаны направления, но подробные пользовательские пути, ограничения и степень исполняемой логики ещё не сформулированы. Не изобретать модели и обязательные интерфейсы без пользовательского подтверждения.

**CURRENT реализация:** [PT-006](../prototypes/PT-006/workspace-shell/README.md) имеет Shell/Contexts и ограниченное профильное сравнение, но ещё не читает готовые объекты Gendocen через универсальный банк Git-ресурсов.
