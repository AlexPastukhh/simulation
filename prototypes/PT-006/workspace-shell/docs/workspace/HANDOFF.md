# Передача PT-006 в новый чат

**Срез: 2026-10-14. Рабочее дерево, не committed Git baseline.** Перед изменениями перепроверьте git status: часть исходников untracked. Старый HEAD не описывает новое поведение.

## Начало работы в новом чате

**Последняя задача завершена:** восстановлены наблюдение core/Scope-механик и корректные границы их состояния. Новый функциональный этап пока не выбран пользователем. Этот документ передаёт контекст; он не утверждает replay engine, независимые курсоры или иной новый scope.

### Доступ и состояние репозитория

- Fortis Repo: /workspace/repos/simulation/prototypes/PT-006/workspace-shell. /workspace/repos и /workspace/repo — разные каталоги; путь проверять непосредственно и по действующему get_config.
- Тот же каталог на Windows: C:\Users\alexa\Repos\simulation\prototypes\PT-006\workspace-shell. Git root: C:\Users\alexa\Repos\simulation.
- Проверенный HEAD: 85b6f343e5973bf904209bc19834a321c827792d. При передаче git status для этого каталога показал 86 записей, из них 28 untracked; это число строк status, не число файлов. Исходники и документация находятся в рабочем дереве; HEAD не содержит весь результат.
- Сначала проверь доступный путь, README и применимые AGENTS.md. Не клонируй проект повторно, не сбрасывай дерево и не перезапускай общий Tunnel/монтирования.
- На последнем этапе Fortis Repo дважды вернул timeout. Для целевых файлов, штатной Windows-сборки и изолированного Edge QA использован ранее разрешённый Туннель. Пользователь планирует ограничить его права; доступ нового чата нужно проверить, прежняя доступность не гарантирована.
- Последний проверенный просмотр: main dev http://127.0.0.1:4197/; учебный production-пример http://127.0.0.1:4212/. 4212 отдавал байты dist новой сборки. В новом чате проверить сервер; не запускать дубликаты и не останавливать общие процессы без причины. 4211 относится к предыдущему примеру.

### Что читать сначала

1. Этот HANDOFF: начальные разделы и «Механики визуализации»; дальнейшие датированные этапы — история.
2. [Виды содержимого и их источники](../architecture-simulator/CONTENT_VIEWS.md), [система Content](../architecture-simulator/CONTENT_SYSTEM.md) — действующие владельцы и назначения.
3. [Workspace](README.md) и [Templates](../templates/README.md) — стандартная композиция, рецепты, сохранение и восстановление.
4. [MECHANICS](../shell/MECHANICS.md) — core/Scope, определения, подключения, исходники, вызовы и ограничения.
5. При предметных изменениях — [Architecture Planning](../templates/content/FEATURE_DDD_ARCHITECTURE_PLANNING.md) и [Site Requirements](../templates/content/SITE_REQUIREMENTS_MODEL.md).
6. Затем реальные затронутые исходники, вызывающие места и тесты. Готовый план/review не считать доказательством полноты.

### Пользовательский замысел и границы продолжения

Пользователь хочет понимать архитектуру приложения через четыре экрана, содержательные окна, исторические факты и плановые Steps, а затем использовать эти материалы для симуляции. Конкретный replay/causal engine ещё не реализован и этим handoff не принимается. Нужна видимость действующих core и Scope-механик, влияющих на просмотр: что подключено, к каким участникам, где код и какие действия реально произошли.

Отдельный старый Architecture заменён Architecture Planning с CURRENT/Step. Один Content может иметь несколько представлений; создание окон, экранов или набора не клонирует предметные данные. Смена Event/Step меняет проекции, не исполняет Step и не переписывает History. Повторные наборы сейчас зеркальные и используют общий курсор; независимые курсоры — отдельное не принятое изменение.

При следующей работе сохраняй пользовательские данные, IDs/ключи storage, исторические снимки, пользовательскую геометрию/состав/группы, writer guards, stale check, Web Locks и read-back. Полное описание правил принадлежит связанным документам, а не этой сводке.

Работай по-русски, прямо и без лести. Доводи запрошенное действие до результата; не подменяй его планом или повторным review. Делай адресные достаточные проверки, исправляй DRY-повторы у настоящего владельца и не добавляй сложность ради неопределённого будущего. Сохраняй различия Need/FR/accepted Scenario, Finding/Proposal, candidate/committed и факт исполнения. Новые upstream решения не принимать молча. Подтверждения и сохранения заявлять только по evidence; при обрыве или ошибке записи сначала проверить фактический результат.

На старте нового чата достаточно сверить дерево и документы, кратко назвать доступное состояние и продолжить конкретный пользовательский запрос. Повторять все уже прошедшие проверки без изменения объекта или нового пробела не требуется.

## Действующий результат

Ровно одна Feature/DDD-архитектура. Architecture Planning Content Instance v2 содержит CURRENT и Plan с независимыми Steps. Site Requirements, Markdown, Scenario, Implementation, Work, Fitness и Trace — отдельные Content Instances. History фиксируется явно и доступен read-only. Screen/Window/Group относятся к представлениям и размещению.

Не возвращать A/B, Context, Scope Comparison, adapters или чтение старых форматов как скрытую зависимость. Сравнение отложено. Одинаковые appearances требований имеют разные occurrence IDs; нет sameAs/canonical/contexts/auto-merge.

## Источники по коду

- App.tsx + SingleArchitectureProfile.tsx — активный профиль, редакторы и координация представлений.
- templates/content/*/model.ts — предметные типы и validators; списки kinds используются типами, UI и validation.
- state.ts + contentProjection.ts — SingleState v2, optional material sources/details, отдельная Navigation, переход прежней новой формы v1 и factual projections.
- contentStorage.ts — общий read/guarded commit архитектуры и Markdown; read-back, stale check, Web Locks и storage notifications.
- SingleMarkdown.tsx — собственные Markdown instances; никакого legacy import.
- shell/WorkspaceShell.tsx + workspace/commands/dispatch — layout, UI и общая командная поверхность Bridge.
- src/profiles/single-architecture/workspace.ts + src/shell/screenTemplates.ts + src/templates/profiles/single-architecture/screen-groups/application-architecture/template.ts — четыре экрана, 16 основных окон, набор и атомарные рецепты размещения; окна не создают дополнительных предметных владельцев.
- src/shell/mechanics/* + dev/mechanicsSourcePlugin.ts — контракты, runtime, core-каталог, Inspector, AST/source index и UI-обёртки. Отдельная библиотека или зависимость для этого не добавлялась.
- src/templates/profiles/single-architecture/screen-groups/application-architecture/scope-mechanisms/history-and-plan-navigation/* — действующая Event/Step navigation и её определение. Остальные места Scope перечислены в MECHANICS.
- dev/workspaceBridgePlugin.ts — dev-only loopback API только размещения, с session/revision. Предметные данные через него не пишутся.

Подробные [ключи и правила хранения](README.md), [Architecture Planning](../templates/content/FEATURE_DDD_ARCHITECTURE_PLANNING.md), [Site Requirements](../templates/content/SITE_REQUIREMENTS_MODEL.md) и [карта Shell](../shell/README.md) принадлежат своим документам.

## Механики визуализации

Общий Inspector core/scope восстановлен: «Механики» в rail и ⌁ в окне; подключения, определения, source index своей сборки, выбор элемента без выполнения действия и bounded opt-in trace. [MECHANICS](../shell/MECHANICS.md) описывает владельцев, размещение определений у шаблонов, реальный writer/read-back и ограничения покрытия. Группа четырёх экранов хранит специфичную Event/Step navigation в соседней scope-mechanisms; повторные наборы остаются зеркальными. Explorer/Impact History имеют отдельный view-local state.

Проверка этого среза: 82/82 unit, TypeScript production build и lint без ошибок/предупреждений. Три изолированных Edge smoke прошли без browser errors: основной Workspace, полный учебный Content и новые механики. Подтверждены четыре экрана и 16 окон (5/4/4/3), шесть Steps, восемь исторических событий, переходы без создания копий, независимость фильтров, выбор элемента без выполнения действия, trace core/Scope и отклонение invalid/stale writes без ложного saved. Проверка 81 локальной ссылки документации не выявила отсутствующих файлов; scoped git diff --check не выявил ошибок. Новый smoke и его условия запуска указаны в корневом README. Git commit/push не выполнялись.

## PR-04–09 после R-PT006-SINGLE/v2

Пользователь разрешил «исправь все». Реализованы все шесть открытых предложений этого среза:

- PR-04: Plan перенесён в Architecture Planning Instance; payload version:2, Template v2. Новые v1-данные читаются без записи; при первом предметном изменении точный исходный raw архивируется до замены.
- PR-05: Navigation отделена от domain write; архитектура и Markdown отклоняют stale writes. Web Locks сериализуют cooperating вкладки, когда API доступен. Без него действует byte comparison, без обещания атомарного simultaneous multiwriter.
- PR-06: удалены доказанно неиспользуемые CSS selectors и связанный неактивный focus-flash. Historical fixtures/backup не удалялись.
- PR-07: один список видов каждого предметного набора; write-capabilities определены в Template definitions.
- PR-08: root README показывает новую одну архитектуру; прежние A/B/content-v6 оставлены историей/candidate.
- PR-09: удалены test-only checker/parse helper, unused Instance getter/profile events и create-only group wrapper. Действующие catalog/constructors, saveScreenGroup, layout openContent и Bridge сохранены.

PR-01–03 предшествующего этапа также сохранены: сообщения об отказе записи, factual CURRENT, общая проверка Steps и закрытая форма Site Requirements. Датированные Final Reviews остаются историческими snapshots, а не текущими статусами исправлений.

## Устранение повторов и пример эволюции, 2026-10-13

После запроса пользователя о повторяющихся окнах повторно сопоставлены реальные рецепты, renderers и источники. Точное повторение: два окна Architecture Planning с одним глобальным CURRENT/Step. В стандартном наборе оставлено одно, на «Архитектура и реализация». Plan открывает его через Shell openContent. Другие основные виды различаются по назначению и сохранены. Explorer вместо повторного полного Current State теперь разбирает один выбранный фактический объект и его известные Trace-связи. History — дополнительная точка входа в ту же ленту Events, не второй источник фактов.

Действующий набор: 16 основных окон, 5/4/4/3. В Plan подробные forecasts/deadlines/axes заменены сводкой и переходами к существующим видам; исходный Plan.details остаётся один. SourceEditor инспектирует владельца данных и не создаёт новый экземпляр. Для узнавания нетронутой прежней 17-оконной композиции сохранён точный рецепт; bytes подтверждены сравнением с предыдущим сохранённым примером. Новый archive key unique-views не конфликтует с прежними архивами. Пользовательские композиции автоматически не заменяются.

[Исходный учебный пример и запуск](../../examples/README.md): 8 последовательных исторических событий, 6 независимых будущих Steps. История демонстрирует ADD/MODIFY/REMOVE, в том числе замену временного сервиса entity Comment. Каждый checkpoint хранит собственные Requirements/Plan/materials своего момента; последний совпадает с CURRENT. Targets будущих Steps: 6/8/11/14/17/20 элементов, CURRENT — 4. Даты, требования и evidence вымышлены; это заготовка данных для будущей симуляции, не реализованный replay/causal engine.

Команда npm run example запускает dev/architectureExampleServer.cjs после production build, только loopback, по умолчанию 4212. Он читает сохранённый examples/architecture-evolution.json и записывает его только в совершенно пустой browser origin. Нет API изменения данных, main-origin и предыдущий пример не перезаписываются. Для независимой копии можно выбрать другой свободный PT006_EXAMPLE_PORT. Такой helper нужен для воспроизводимого просмотра примера, не для рабочего domain storage.

### Проверка этого этапа

76/76 unit, TypeScript production build и lint без ошибок/предупреждений. Новый набор tests/evolution-example.test.mjs проверяет соответствие сохранённого примера layout/schema, раздельность CURRENT/targets/files, историческое знание, ADD/MODIFY/REMOVE и совпадение последнего факта с CURRENT.

В расширенном Edge smoke подтверждены все 6 Steps и 8 событий: правильные количества элементов/файлов, исторический Plan без live-подстановки, read-only архив и неизменность Content bytes от навигации. Проверены уникальность default-вкладок и переходы Plan → Architecture/Forecasts/Axes без добавления окон. Оба окончательных Edge smoke прошли без browser errors; основной сценарий подтвердил layout/templates/groups, сохранность Content bytes, архив и ошибки записи. Проверка viewport адресует новый стандартный набор, а не изменённые тестом экраны с добавочными окнами. История и Планирование просмотрены на итоговых снимках 1600×1000; новые selector, события и Steps читаются, длинное содержимое доступно прокруткой. Focused Explorer отдельно проверен выбором исторического файла без изменения Content.

Ни Git commit/push, ни автоматическое исполнение Step не выполнялись. Материалы более ранних этапов ниже относятся к своим срезам и не являются описанием нынешнего набора.

## Предыдущий этап: полное восстановление содержимого, 2026-10-13

После замечания пользователя о пропущенных окнах независимо прочитаны исходные CONTENT_VIEWS/CONTENT_SYSTEM из Git HEAD 85b6f343e5973bf904209bc19834a321c827792d, исторические принятые P6R-PR-01A и 02–06, доступные сообщения и поздние ограничения. Первое восстановление ниже вернуло четыре экрана, но ошибочно сократило виды содержимого; его проверки не доказывали полноту исходного каталога.

Действующий состав: История и факты — 5 окон; Архитектура и реализация — 4; Планирование — 5; Работа и результаты — 3. Всего 17 основных окон, 16 основных видов. Architecture Planning размещён дважды как представление одного экземпляра и заменяет отдельный Architecture; выбор CURRENT/Step находится в самом окне. Comparison исключён по действующему решению. Дополнительные вкладки History и Markdown сохранены. Точный состав принадлежит [каталогу видов](../architecture-simulator/CONTENT_VIEWS.md), не этой сводке.

Пять восстановленных владельцев Scenario/Implementation/Work/Fitness/Trace имеют собственные модели, validators и State / JSON Schema. Plan details остаются в единственном Architecture Planning Instance. Фактические файлы отделены от плановых effects; Work и Hot Paths используют один источник; Forecasts и Axes читают Plan. Current/Explorer/Impact History не создают копий источников. Явный checkpoint копирует sources/details по значению. Отсутствующие поля старого архивного факта не заполняются live-данными.

Это optional расширение поддерживаемого payload v2; открытие прежних v1/v2 не записывает предметные данные. Известные нетронутые одноэкранная и урезанная четырёхэкранная композиции раскрываются read-only в полный набор; смена курсора не мешает исправлению, пользовательская геометрия/состав/группы сохраняются. Перед первой записью точные исходные layout bytes архивируются отдельно; условия и ключ описаны в Workspace.

Общие N-переходы открывают существующее представление через Shell openContent либо создают новое; изменение размещения не меняет факты. Сохранены guards, stale check, Web Locks и read-back. Не добавлены Step execution, causal/replay engine, Git-сканирование, A/B или импорт прежних предметных форматов.

### Доказательства этого восстановления

- 72/72 unit: полный состав 5/4/5/3; закрытые и независимые модели sources/details; неверные даты/значения/дубли ID; совместимое чтение старого v2 без мутации; отсутствие live-подстановки в History; снимки по значению; раскрытие известных defaults с сохранением собственных раскладок.
- TypeScript app/node и lint: 0 errors/0 warnings. Штатный Windows production build прошёл; 39 modules. Dependencies, package.json, tsconfig/Vite и исходная node_modules-ссылка не менялись.
- Реальный Windows Edge, отдельные временные профили: основной native smoke на 4197 прошёл layout/templates/groups, точный архив и отказы, CURRENT/Steps/History, Markdown, неверные данные и ошибки записи; ошибок браузера нет.
- Тот же runner в режиме full-content на отдельном заполненном примере 4211 подтвердил все 17 основных окон, CURRENT/Step в Architecture Planning, ACTUAL против PLANNED Files/Trace, архив без live-подстановки, отсутствие ложного CREATE для первого факта, запись источника/reload без изменения History и N-навигацию без предметной записи. Данные, даты и события примера явно вымышленные; основной origin не перезаписывался.
- При просмотре снимка выявлен слабый контраст новых карточек; цвета приведены к светлым панелям Shell. Служебные ID окон ограничены по ширине и доступны полностью в tooltip; поля предметных редакторов используют доступную ширину. После правок повторно прошли production build, основной и full-content native smoke; lint без замечаний. Все четыре итоговых снимка Edge 1600×1000 просмотрены: контраст и названия читаются, окна не перекрываются; длинное содержимое и высота исходного Workspace доступны прокруткой.

64 локальные ссылки активной документации проверены; git diff --check прошёл. Git commit/push не выполнялись. Недоступная прежняя переписка через Personal Context не прочитана; полнота этой переписки не заявляется. Исторические обзоры не переизданы как описание нового результата.

## Первое неполное восстановление четырёх экранов, 2026-10-13

Пользователь явно потребовал вернуть шаблон архитектуры приложения из четырёх экранов, сохранив изменения контента. При прежнем удалении A/B/Context вместе с ними ошибочно исчезла композиция экранов; отказ от нескольких архитектур не означает отказ от нескольких экранов одного Workspace.

Восстановлены четыре отдельных Screen Templates и набор «Архитектура приложения · 4 экрана». Один источник рецептов строит стартовое размещение и создаваемый набор: src/profiles/single-architecture/workspace.ts. Состав и курсор описаны в [Workspace](README.md); отдельную копию требований сюда не переносить.

Shell создаёт один экран или весь набор через общий UI/Bridge createTemplateScreens. Весь набор проверяется до изменения; повторное создание получает новые Screen/Window IDs. Предметные Content Instances, Plan, History, Requirements и Markdown не клонируются.

Точное прежнее нетронутое одноэкранное размещение раскрывается при чтении без записи. Перед первым изменением сохраняются прежние layout bytes. Пользовательские изменения и группы не заменяются автоматически. Это не чтение Context/A/B или других старых предметных форматов. Кнопка ↺ по подтверждению возвращает стандартные четыре экрана; «+ Экран» добавляет набор, сохраняя текущие экраны.

Действующие документы обновлены: Workspace, Templates, Shell, Bridge, проектные README. Поиск прошлых сообщений через Personal Context отключён; использованы доступный чат, ранее записанные пользовательские ограничения, действующие документы и Git-история. Полнота недоступной переписки не заявляется.

### Проверки этого изменения

- 66/66 unit: четыре экрана и все текущие виды; повторное/отдельное создание; новые ID; отказ целого набора при ошибке последнего экрана; UI/Bridge revision; сохранность рецептов, групп и пользовательской раскладки; архив исходных bytes и отказ архива.
- TypeScript app/node и lint: 0 errors/0 warnings. Unit/type/lint использовали прежние изолированные Repo dependencies; исходные package.json, tsconfig/Vite и node_modules-ссылка не менялись.
- Штатный npm run build успешно выполнен в Windows. Docker CLI без прежнего isolated Vite config не разрешил @vitejs/plugin-react; это ограничение той проверки, не успешная обычная Docker-сборка.
- Реальный Windows Edge на http://127.0.0.1:4197, отдельный временный профиль: четыре экрана; создание набора дважды и отдельного шаблона; reload; группы и пользовательское размещение; read-only раскрытие прежнего default; exact archive и отказ при конфликте архива; заполненные Content bytes неизменны после создания и reload; все четыре экрана и меню проверены на 1600×1000; browser errors отсутствуют.
- Существующий расширенный native smoke также подтвердил CURRENT/Steps/History, независимый Markdown, отклонение неверных данных, архив предметного v1 → v2 и видимые ошибки Content/layout/settings. Двухвкладочный native тест предыдущего этапа здесь повторно не выполнялся; предметный writer и validators этим изменением не менялись.
- Активные Markdown-ссылки и git diff --check прошли. Код и документация находятся в рабочем дереве; Git commit/push не выполнялись.

## Проверки предыдущего этапа PR-04–09

60/60 unit, TypeScript app/node, lint 0 errors/0 warnings, production build и syntax check native smoke. Проверки использовали изолированные dependencies/configs в /workspace/repo/pt006-pr010203-verification: исходный node_modules в Docker является недоступной host-ссылкой. package.json, исходные tsconfig/Vite и эта ссылка не менялись.

В Chromium прошёл расширенный tests/single-architecture-ui-smoke.cjs: CURRENT/Step/History, independent Markdown, invalid saves без перезаписи, read-only v1 hydration/navigation и exact archive перед v2, Content/layout/settings write failures и status без header.

Отдельная native интеграция двух настоящих вкладок подтвердила: History navigation не пишет предметные данные; stale architecture/Markdown writes отклоняются; simultaneous cooperating writers дают один успешный commit; queued delete/edit адресует узел по ID. Проверены async inputs, каталог и status при скрытом header на 1440×1000 и 900×700; page errors отсутствуют. Снимок 900×700 просмотрен.

Chromium, необходимые shared libraries/fonts и временные probes находились только в тестовой среде; TLS/ACL не ослаблялись. Это Linux Chromium QA, не повторный HOST/Windows Edge тест и не гарантия для всех browsers/viewports. Временные helpers могут исчезнуть; основной браузерный smoke сохраняется в tests.

## Следующая работа

Штатные команды проекта: npm test; npm run build; npm run lint. Native smoke: npm run dev -- --port 4197, затем node tests/single-architecture-ui-smoke.cjs. Режим PT006_SMOKE_MODE=full-content проверяет заполненный полный состав при отдельном PT006_SMOKE_URL; PT006_CAPTURE_SCREENS=1 сохраняет временные QA-снимки. По умолчанию используется Windows Edge; PT006_BROWSER_EXECUTABLE/PT006_SMOKE_URL и при необходимости PT006_BROWSER_ARGS выбирают установленный тестовый браузер.

Не создавайте постоянную альтернативную test platform из временных обходов Docker. Не импортируйте Context/A/B. Не повышайте корневые candidate Scenario до принятой основы. Обновляйте только затронутые владельцы документации; subject storage и архив исходных bytes проверяйте при изменении формы.

[Обзор](../README.md) · [Workspace](README.md) · [Bridge](BRIDGE_COMMANDS.md)
