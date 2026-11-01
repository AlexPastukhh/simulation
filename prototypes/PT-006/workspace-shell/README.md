# PT-006 — одна архитектура

В приложении открывается одна новая пустая Feature/DDD-архитектура, отдельные требования, единый Plan с CURRENT/Steps, History с ручной фиксацией снимков и Markdown-документы. Сравнение и legacy Context runtime удалены; старые данные браузера сохранены.

Стандартный Workspace содержит четыре экрана и 16 основных окон (5/4/4/3). [Виды содержимого и их источники](docs/architecture-simulator/CONTENT_VIEWS.md) описывают полный состав, CURRENT/Step, факты, планы и дополнительные вкладки. Меню «+ Экран» создаёт отдельный экран из шаблона или весь набор; Content остаётся общим. [Состав и восстановление](docs/workspace/README.md).

## Запуск

`npm install`
`npm run dev`

Проверки: `npm run build`, `npm run lint`, `npm test`; браузерный smoke: `node tests/single-architecture-ui-smoke.cjs` при dev server на порту `4197`.

[Учебная эволюция: 8 событий и 6 Steps](examples/README.md): npm run build, затем npm run example (loopback 4212). Данные вымышлены; существующий browser save не заменяется.

Проверка механик: `node tests/mechanics-ui-smoke.cjs` при работающем учебном примере на `4212` (другой URL — `PT006_MECHANICS_URL`). Smoke использует отдельный временный профиль браузера.

[Механики](docs/shell/MECHANICS.md): core и подключённые Scope, исходники текущей сборки, выбор элемента и журнал фактических вызовов. Панель открывается кнопкой «Механики» в rail или ⌁ в окне.

[Документация](docs/README.md).
