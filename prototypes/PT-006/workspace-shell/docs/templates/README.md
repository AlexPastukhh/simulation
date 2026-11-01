# Content Templates и размещение

Действующие Content classes: Architecture Planning v2, Site Requirements v1, Markdown Document v1; восстановленные Scenario, Implementation, Work, Fitness и Trace v1. Каждый имеет metadata и данные; проекции не клонируют владельцев.

Plan/Forecasts/Axes используют один Architecture Planning Instance; Files/Impact — один Implementation; Work/Hot Paths — один Work. Current State, Explorer и Impact History читают выбранные фактические/плановые источники.

Четыре Screen Templates — рецепты размещения 16 основных окон, не новые Content classes или обязательные Screen Set Instances. Набор создаётся через «+ Экран»; источник один для шаблонов и стартового размещения.

[Полный каталог и источники](../architecture-simulator/CONTENT_VIEWS.md) · [Размещение](../workspace/README.md) · [Architecture Planning](content/FEATURE_DDD_ARCHITECTURE_PLANNING.md) · [Site Requirements](content/SITE_REQUIREMENTS_MODEL.md) · [Модели остальных классов](../../src/templates/content/simulation-material/model.ts)

Scope-механики размещаются у владельца соответствующего шаблона. [Определение группы четырёх экранов](../../src/templates/profiles/single-architecture/screen-groups/application-architecture/template.ts) имеет соседнюю папку scope-mechanisms для Event/Step navigation. Определение, подключение с участниками и runtime-настройки различаются. [Правило хранения и действующие подключения](../shell/MECHANICS.md).
