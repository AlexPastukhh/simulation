import { createWorkspaceModel } from '../../shell/workspace.ts'

import type { Workspace, ContentDescriptor } from '../../shell/workspace.ts'

import {applicationArchitectureScreenBundle} from '../../templates/profiles/single-architecture/screen-groups/application-architecture/template.ts'

import { appendTemplateScreens } from '../../shell/screenTemplates.ts'

import type { ScreenTemplate, ScreenTemplateBundle } from '../../shell/screenTemplates.ts'

export const DESCRIPTORS: ContentDescriptor[] = [
  {
    "id": "events",
    "label": "Actual Events",
    "caption": "Факты и события по ветке, дни внутри ленты",
    "icon": "◷",
    "minWidth": 310,
    "minHeight": 400,
    "maxPerScreen": null,
    "accent": "#ed9259"
  },
  {
    "id": "plan",
    "label": "Plan",
    "caption": "CURRENT, независимые Steps и плановая работа",
    "icon": "⑂",
    "minWidth": 365,
    "minHeight": 425,
    "maxPerScreen": null,
    "accent": "#79acfc"
  },
  {
    "id": "requirements",
    "label": "Site Requirements Model",
    "caption": "Самостоятельные ненормализованные требования",
    "icon": "▤",
    "minWidth": 340,
    "minHeight": 330,
    "maxPerScreen": null,
    "accent": "#55c4ad"
  },
  {
    "id": "impact",
    "label": "Evolution Impact",
    "caption": "По выбранному Step, условной ветке и файлам",
    "icon": "↗",
    "minWidth": 330,
    "minHeight": 345,
    "maxPerScreen": null,
    "accent": "#f4bd67"
  },
  {
    "id": "implementation",
    "label": "Implementation / Files",
    "caption": "Фактическое дерево файлов и плановые эффекты",
    "icon": "⌘",
    "minWidth": 350,
    "minHeight": 350,
    "maxPerScreen": null,
    "accent": "#82cbf7"
  },
  {
    "id": "fitness",
    "label": "Evolution Fitness",
    "caption": "Контекстная оценка, миграции, классы затрат",
    "icon": "▥",
    "minWidth": 340,
    "minHeight": 340,
    "maxPerScreen": null,
    "accent": "#e9af8c"
  },
  {
    "id": "work",
    "label": "Work Dynamics",
    "caption": "Фактическая работа, затраты и исходы сроков",
    "icon": "↻",
    "minWidth": 325,
    "minHeight": 315,
    "maxPerScreen": null,
    "accent": "#ed92ad"
  },
  {
    "id": "scenario",
    "label": "Scenario / Environment",
    "caption": "Польза, путь и рабочая среда приложения",
    "icon": "◉",
    "minWidth": 330,
    "minHeight": 300,
    "maxPerScreen": null,
    "accent": "#83aedc"
  },
  {
    "id": "current",
    "label": "Current State",
    "caption": "Фактический срез: требования, архитектура, файлы",
    "icon": "▣",
    "minWidth": 370,
    "minHeight": 370,
    "maxPerScreen": null,
    "accent": "#5dba9e"
  },
  {
    "id": "architecturePlan",
    "label": "Architecture Planning",
    "caption": "Полный Feature/DDD-снимок CURRENT или выбранного Step",
    "icon": "⌁",
    "minWidth": 360,
    "minHeight": 310,
    "maxPerScreen": null,
    "accent": "#998af0"
  },
  {
    "id": "forecasts",
    "label": "Forecasts / Deadlines",
    "caption": "Ожидаемые события и требования, сроки, IF-маршруты",
    "icon": "◴",
    "minWidth": 355,
    "minHeight": 375,
    "maxPerScreen": null,
    "accent": "#d89e54"
  },
  {
    "id": "axes",
    "label": "Planned Change Axes",
    "caption": "Прогнозные направления изменений, отдельно от фактов",
    "icon": "⇢",
    "minWidth": 320,
    "minHeight": 330,
    "maxPerScreen": null,
    "accent": "#8ab1e9"
  },
  {
    "id": "hotpaths",
    "label": "Actual Hot Paths",
    "caption": "Наблюдавшиеся повторные изменения, без будущих прогнозов",
    "icon": "↯",
    "minWidth": 315,
    "minHeight": 300,
    "maxPerScreen": null,
    "accent": "#e8a184"
  },
  {
    "id": "explorer",
    "label": "Event / Entity Explorer",
    "caption": "Переход от фактического события к связанным объектам",
    "icon": "◎",
    "minWidth": 370,
    "minHeight": 355,
    "maxPerScreen": null,
    "accent": "#61afa4"
  },
  {
    "id": "trace",
    "label": "Requirement / Implementation Trace",
    "caption": "Связи потребностей с архитектурой и файлами",
    "icon": "⌘",
    "minWidth": 410,
    "minHeight": 360,
    "maxPerScreen": null,
    "accent": "#a48cce"
  },
  {
    "id": "impactHistory",
    "label": "Impact History / Future",
    "caption": "Фактические изменения CURRENT и плановые влияния по цели",
    "icon": "↶",
    "minWidth": 390,
    "minHeight": 350,
    "maxPerScreen": null,
    "accent": "#d1a76f"
  },
  {
    "id": "history",
    "label": "History",
    "caption": "Явные фактические снимки",
    "icon": "◷",
    "minWidth": 320,
    "minHeight": 310,
    "maxPerScreen": null,
    "accent": "#ed9259"
  }
]

export const MARKDOWN_DESCRIPTOR: ContentDescriptor = {
  "id": "markdown-documents",
  "label": "Markdown",
  "caption": "Markdown Content Instances",
  "icon": "▥",
  "minWidth": 320,
  "minHeight": 310,
  "maxPerScreen": null,
  "accent": "#77cfb4"
}

export const PREVIOUS_INITIAL_WORKSPACE: Workspace = {
  "version": 3,
  "activeScreenId": "single-architecture-screen",
  "screens": [
    {
      "id": "single-architecture-screen",
      "title": "Архитектура приложения",
      "panels": [
        {
          "id": "single-plan",
          "rect": {
            "x": 20,
            "y": 24,
            "w": 345,
            "h": 680
          },
          "tabs": [
            "plan",
            "history"
          ],
          "active": "plan"
        },
        {
          "id": "single-architecture",
          "rect": {
            "x": 382,
            "y": 24,
            "w": 465,
            "h": 680
          },
          "tabs": [
            "architecturePlan"
          ],
          "active": "architecturePlan"
        },
        {
          "id": "single-requirements",
          "rect": {
            "x": 863,
            "y": 24,
            "w": 420,
            "h": 680
          },
          "tabs": [
            "requirements"
          ],
          "active": "requirements"
        }
      ]
    }
  ]
}

const PREVIOUS_SINGLE_LAYOUTS: readonly Workspace[] = [PREVIOUS_INITIAL_WORKSPACE,{
  "version": 3,
  "activeScreenId": "screen-history-facts",
  "screens": [
    {
      "id": "screen-history-facts",
      "title": "История и факты",
      "panels": [
        {
          "rect": {
            "x": 20,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "history"
          ],
          "active": "history",
          "id": "window-history-facts-1"
        },
        {
          "rect": {
            "x": 632,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "requirements"
          ],
          "active": "requirements",
          "id": "window-history-facts-2"
        }
      ]
    },
    {
      "id": "screen-application-architecture",
      "title": "Архитектура приложения",
      "panels": [
        {
          "rect": {
            "x": 20,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "architecturePlan"
          ],
          "active": "architecturePlan",
          "id": "window-application-architecture-1"
        },
        {
          "rect": {
            "x": 632,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "requirements"
          ],
          "active": "requirements",
          "id": "window-application-architecture-2"
        }
      ]
    },
    {
      "id": "screen-planning",
      "title": "Планирование",
      "panels": [
        {
          "rect": {
            "x": 20,
            "y": 24,
            "w": 345,
            "h": 680
          },
          "tabs": [
            "plan",
            "history"
          ],
          "active": "plan",
          "id": "window-planning-1"
        },
        {
          "rect": {
            "x": 382,
            "y": 24,
            "w": 465,
            "h": 680
          },
          "tabs": [
            "architecturePlan"
          ],
          "active": "architecturePlan",
          "id": "window-planning-2"
        },
        {
          "rect": {
            "x": 863,
            "y": 24,
            "w": 420,
            "h": 680
          },
          "tabs": [
            "requirements"
          ],
          "active": "requirements",
          "id": "window-planning-3"
        }
      ]
    },
    {
      "id": "screen-outcomes-documentation",
      "title": "Результаты и документация",
      "panels": [
        {
          "rect": {
            "x": 20,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "history"
          ],
          "active": "history",
          "id": "window-outcomes-documentation-1"
        },
        {
          "rect": {
            "x": 632,
            "y": 24,
            "w": 595,
            "h": 680
          },
          "tabs": [
            "markdown-documents"
          ],
          "active": "markdown-documents",
          "id": "window-outcomes-documentation-2"
        }
      ]
    }
  ]
}]

const PREVIOUS_FOUR_SCREEN_TEMPLATES: ScreenTemplate[] = [
  {
    "id": "history-facts",
    "title": "История и факты",
    "description": "Actual Events, Current State, Requirements, Explorer, Scenario",
    "panels": [
      {
        "rect": {
          "x": 20,
          "y": 26,
          "w": 335,
          "h": 760
        },
        "tabs": [
          "events",
          "history"
        ],
        "active": "events"
      },
      {
        "rect": {
          "x": 373,
          "y": 26,
          "w": 420,
          "h": 375
        },
        "tabs": [
          "current"
        ],
        "active": "current"
      },
      {
        "rect": {
          "x": 373,
          "y": 417,
          "w": 420,
          "h": 354
        },
        "tabs": [
          "requirements"
        ],
        "active": "requirements"
      },
      {
        "rect": {
          "x": 810,
          "y": 26,
          "w": 430,
          "h": 385
        },
        "tabs": [
          "explorer"
        ],
        "active": "explorer"
      },
      {
        "rect": {
          "x": 810,
          "y": 430,
          "w": 430,
          "h": 341
        },
        "tabs": [
          "scenario"
        ],
        "active": "scenario"
      }
    ]
  },
  {
    "id": "application-architecture",
    "title": "Архитектура и реализация",
    "description": "Architecture Planning, Files, Trace и история влияния",
    "panels": [
      {
        "rect": {
          "x": 20,
          "y": 26,
          "w": 607,
          "h": 415
        },
        "tabs": [
          "architecturePlan"
        ],
        "active": "architecturePlan"
      },
      {
        "rect": {
          "x": 645,
          "y": 26,
          "w": 610,
          "h": 415
        },
        "tabs": [
          "implementation"
        ],
        "active": "implementation"
      },
      {
        "rect": {
          "x": 20,
          "y": 462,
          "w": 607,
          "h": 372
        },
        "tabs": [
          "trace"
        ],
        "active": "trace"
      },
      {
        "rect": {
          "x": 645,
          "y": 462,
          "w": 610,
          "h": 372
        },
        "tabs": [
          "impactHistory"
        ],
        "active": "impactHistory"
      }
    ]
  },
  {
    "id": "planning",
    "title": "Планирование",
    "description": "Plan, Architecture Planning, Evolution Impact, Forecasts и Planned Axes",
    "panels": [
      {
        "rect": {
          "x": 20,
          "y": 26,
          "w": 365,
          "h": 812
        },
        "tabs": [
          "plan"
        ],
        "active": "plan"
      },
      {
        "rect": {
          "x": 390,
          "y": 26,
          "w": 450,
          "h": 390
        },
        "tabs": [
          "architecturePlan"
        ],
        "active": "architecturePlan"
      },
      {
        "rect": {
          "x": 390,
          "y": 435,
          "w": 450,
          "h": 390
        },
        "tabs": [
          "impact"
        ],
        "active": "impact"
      },
      {
        "rect": {
          "x": 857,
          "y": 26,
          "w": 405,
          "h": 390
        },
        "tabs": [
          "forecasts"
        ],
        "active": "forecasts"
      },
      {
        "rect": {
          "x": 857,
          "y": 435,
          "w": 405,
          "h": 390
        },
        "tabs": [
          "axes"
        ],
        "active": "axes"
      }
    ]
  },
  {
    "id": "outcomes-documentation",
    "title": "Работа и результаты",
    "description": "Work Dynamics, Actual Hot Paths, Fitness; Markdown доступен вкладкой",
    "panels": [
      {
        "rect": {
          "x": 20,
          "y": 26,
          "w": 602,
          "h": 392
        },
        "tabs": [
          "work",
          "markdown-documents"
        ],
        "active": "work"
      },
      {
        "rect": {
          "x": 20,
          "y": 438,
          "w": 602,
          "h": 355
        },
        "tabs": [
          "hotpaths"
        ],
        "active": "hotpaths"
      },
      {
        "rect": {
          "x": 640,
          "y": 26,
          "w": 607,
          "h": 380
        },
        "tabs": [
          "fitness"
        ],
        "active": "fitness"
      }
    ]
  }
]

// The preceding full default is retained only to recognize an untouched saved layout.
export const SCREEN_TEMPLATES: ScreenTemplate[] = PREVIOUS_FOUR_SCREEN_TEMPLATES.map(template=>{
 const current=structuredClone(template)
 if(current.id==='planning'){
  current.description='Plan, Evolution Impact, Forecasts и Planned Axes'
  current.panels=current.panels.filter(panel=>panel.active!=='architecturePlan')
  const impact=current.panels.find(panel=>panel.active==='impact')!
  impact.rect={x:390,y:26,w:450,h:812}
 }
 return current
})

export const SCREEN_BUNDLES: ScreenTemplateBundle[] = [applicationArchitectureScreenBundle(SCREEN_TEMPLATES)]

function initialWorkspace(templates:ScreenTemplate[]):Workspace {
 const initial=appendTemplateScreens({version:3,activeScreenId:'',screens:[]},templates,
  templates.map(t=>({templateId:t.id,screenId:'screen-'+t.id,panelIds:t.panels.map((_p,i)=>'window-'+t.id+'-'+(i+1))})),
  createWorkspaceModel([...DESCRIPTORS,MARKDOWN_DESCRIPTOR]))
 if(!initial)throw Error('Invalid architecture workflow templates')
 return initial
}
export const INITIAL_WORKSPACE=initialWorkspace(SCREEN_TEMPLATES)
export const PREVIOUS_INITIAL_WORKSPACES:readonly Workspace[]=[
 ...PREVIOUS_SINGLE_LAYOUTS,initialWorkspace(PREVIOUS_FOUR_SCREEN_TEMPLATES),
]
export const LAYOUT_ARCHIVE_KEY='pt006-unique-views-layout-original-v1'
