# PT-006 — система содержимого

Действующий набор окон и источников описан в [CONTENT_VIEWS.md](CONTENT_VIEWS.md). Он восстановлен по документации и уточнению пользователя, а не выбран из урезанного профиля.

## Три слоя

1. Content Instance владеет данными. Architecture Planning содержит один Plan, CURRENT и targets Steps; Requirements самостоятельны. Scenario, Implementation, Work, Fitness и Trace имеют отдельные экземпляры. Markdown самостоятельный.
2. Представление читает эти источники. Например, Forecasts/Axes читают Plan; Current читает только факт; Impact History сопоставляет записанные факты с отдельно обозначенными будущими effects.
3. Workspace размещает представления в 16 окнах четырёх экранов. Создание/копирование окна не клонирует источники.

## Инварианты истины

- CURRENT — фактический рабочий либо выбранный архивный снимок. Planned target с тем же ID не заменяет факт.
- Выбор Step не исполняет план. Forecast не создаёт actual требование/событие.
- History — явные checkpoints. Live-редактирование не меняет прошлые снимки.
- Plan.details хранит деятельность, маршруты, сроки/оценки и axes одного Plan. Work хранит фактические episodes, costs/outcomes и hot paths.
- Deadline, completion forecast и actual outcome различаются; unknown quantity не равна нулю.
- Fitness контекстна и не имеет общего рейтинга.
- Trace хранит собственные correspondence links; Requirements не объединяются по названию.
- Отсутствующий старый источник остаётся unknown/unrecorded; новые live-данные не подставляются в прошлое.
- A/B, Scope Comparison, старый Context/DemoStore и импорт старых предметных форматов не возвращены.

## Взаимодействия

Actual Events меняет архивный курсор; Plan и Architecture Planning — выбор CURRENT/Step. Открытие Explorer/Trace/Files/Fitness/Hot Paths через Shell меняет только размещение и активное окно. Связь источников не означает автоматическое исполнение или универсальный причинный граф.

[Состав и модели](CONTENT_VIEWS.md) · [Workspace](../workspace/README.md) · [Shell](../shell/README.md)

Навигация по Event/Step — Scope-механика связанных представлений, а не изменение предметных Content. Core openContent меняет размещение/активацию вида, не создавая копию данных. [Границы и наблюдение механик](../shell/MECHANICS.md).
