# Content Template classes

Architecture Planning и Site Requirements сохраняют принятые независимые модели. simulation-material/model.ts задаёт пять восстановленных источников Scenario, Implementation, Work, Fitness, Trace и детали того же Plan, их schema/validation и создание экземпляров.

Проекции не получают нового владельца данных. [Каталог, источники и границы](../../docs/architecture-simulator/CONTENT_VIEWS.md).

profiles/single-architecture/screen-groups/application-architecture содержит действующее определение bundle и scope-mechanisms навигации. Специфичные механики других уровней находятся у их владельцев; общий core не копируется. [Правило хранения](../../docs/shell/MECHANICS.md).
