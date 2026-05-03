/**
 * 萌图库数据 - 表情包/图片/GIF/实况图片
 * 分类体系定义
 */

const moeCategories = {
  "emotion": {
    "name": "表情包",
    "icon": "fa-smile-o",
    "color": "#FF85A2",
    "groups": [
      {
        "id": "emotion-mood",
        "name": "情绪",
        "items": [
          {
            "id": "emotion-happy",
            "name": "开心"
          },
          {
            "id": "emotion-sad",
            "name": "伤心"
          },
          {
            "id": "emotion-angry",
            "name": "生气"
          },
          {
            "id": "emotion-cry",
            "name": "哭泣"
          },
          {
            "id": "emotion-shy",
            "name": "害羞"
          },
          {
            "id": "emotion-surprised",
            "name": "惊讶"
          },
          {
            "id": "expression-calm",
            "name": "平静"
          },
          {
            "id": "expression-helpless",
            "name": "无奈"
          }
        ]
      },
      {
        "id": "emotion-action",
        "name": "动作",
        "items": [
          {
            "id": "action-hug",
            "name": "抱抱"
          },
          {
            "id": "action-pat",
            "name": "摸摸头"
          },
          {
            "id": "action-flower",
            "name": "赠花"
          },
          {
            "id": "action-kiss",
            "name": "亲亲"
          },
          {
            "id": "action-wave",
            "name": "挥手"
          },
          {
            "id": "action-thumb",
            "name": "点赞"
          },
          {
            "id": "action-holdhand",
            "name": "牵手"
          },
          {
            "id": "action-poke",
            "name": "戳一戳"
          }
        ]
      },
      {
        "id": "emotion-expression",
        "name": "表情",
        "items": [
          {
            "id": "expr-heh",
            "name": "嘿嘿"
          },
          {
            "id": "expr-hehe",
            "name": "呵呵"
          },
          {
            "id": "expr-awa",
            "name": "啊哇"
          },
          {
            "id": "expr-awsl",
            "name": "AWSL"
          },
          {
            "id": "expr-question",
            "name": "问号"
          },
          {
            "id": "expr-sweat",
            "name": "流汗"
          },
          {
            "id": "expr-dizzy",
            "name": "头晕"
          },
          {
            "id": "expr-zzz",
            "name": "睡觉"
          }
        ]
      },
      {
        "id": "emotion-other",
        "name": "其他",
        "items": [
          {
            "id": "other-text",
            "name": "文字包"
          },
          {
            "id": "other-meme",
            "name": "沙雕梗"
          },
          {
            "id": "other-greeting",
            "name": "问候语"
          }
        ]
      }
    ]
  },
  "image": {
    "name": "图片",
    "icon": "fa-image",
    "color": "#8B5CF6",
    "groups": [
      {
        "id": "img-character",
        "name": "角色类型",
        "items": [
          {
            "id": "char-loli",
            "name": "萝莉"
          },
          {
            "id": "char-girl",
            "name": "少女"
          },
          {
            "id": "char-oneesan",
            "name": "御姐"
          },
          {
            "id": "char-shota",
            "name": "正太"
          },
          {
            "id": "char-bishoujo",
            "name": "美少女"
          },
          {
            "id": "char-animal",
            "name": "兽耳娘"
          },
          {
            "id": "char-mecha",
            "name": "机甲"
          },
          {
            "id": "char-fantasy",
            "name": "幻想系"
          }
        ]
      },
      {
        "id": "img-personality",
        "name": "性格",
        "items": [
          {
            "id": "perso-cute",
            "name": "可爱"
          },
          {
            "id": "perso-moe",
            "name": "萌"
          },
          {
            "id": "perso-sunny",
            "name": "阳光"
          },
          {
            "id": "perso-cool",
            "name": "酷"
          },
          {
            "id": "perso-gentle",
            "name": "温柔"
          },
          {
            "id": "perso-lively",
            "name": "活泼"
          },
          {
            "id": "perso-quiet",
            "name": "文静"
          },
          {
            "id": "perso-tsundere",
            "name": "傲娇"
          }
        ]
      },
      {
        "id": "img-style",
        "name": "画风",
        "items": [
          {
            "id": "style-pixel",
            "name": "像素风"
          },
          {
            "id": "style-watercolor",
            "name": "水彩风"
          },
          {
            "id": "style-sketch",
            "name": "素描风"
          },
          {
            "id": "style-flat",
            "name": "扁平风"
          },
          {
            "id": "style-realistic",
            "name": "写实风"
          },
          {
            "id": "style-chibi",
            "name": "Q版"
          }
        ]
      },
      {
        "id": "img-scene",
        "name": "场景",
        "items": [
          {
            "id": "scene-school",
            "name": "校园"
          },
          {
            "id": "scene-nature",
            "name": "自然风景"
          },
          {
            "id": "scene-city",
            "name": "城市街景"
          },
          {
            "id": "scene-indoor",
            "name": "室内"
          },
          {
            "id": "scene-fantasy",
            "name": "奇幻场景"
          },
          {
            "id": "scene-night",
            "name": "夜景"
          }
        ]
      }
    ]
  },
  "gif": {
    "name": "GIF动图",
    "icon": "fa-film",
    "color": "#10B981",
    "groups": [
      {
        "id": "gif-reaction",
        "name": "反应",
        "items": [
          {
            "id": "gifr-nod",
            "name": "点头"
          },
          {
            "id": "gifr-shake",
            "name": "摇头"
          },
          {
            "id": "gifr-clap",
            "name": "鼓掌"
          },
          {
            "id": "gifr-facepalm",
            "name": "捂脸"
          },
          {
            "id": "gifr-dance",
            "name": "跳舞"
          },
          {
            "id": "gifr-run",
            "name": "逃跑"
          }
        ]
      },
      {
        "id": "gif-daily",
        "name": "日常",
        "items": [
          {
            "id": "gife-eat",
            "name": "吃饭"
          },
          {
            "id": "gife-sleep",
            "name": "睡觉"
          },
          {
            "id": "gife-study",
            "name": "学习"
          },
          {
            "id": "gife-game",
            "name": "游戏"
          },
          {
            "id": "gife-cook",
            "name": "做饭"
          }
        ]
      },
      {
        "id": "gif-anime",
        "name": "动漫",
        "items": [
          {
            "id": "gifa-transform",
            "name": "变身"
          },
          {
            "id": "gifa-attack",
            "name": "攻击"
          },
          {
            "id": "gifa-magic",
            "name": "施法"
          },
          {
            "id": "gifa-idle",
            "name": "待机"
          }
        ]
      }
    ]
  },
  "livephoto": {
    "name": "实况图片",
    "icon": "fa-camera",
    "color": "#F59E0B",
    "groups": [
      {
        "id": "lp-moment",
        "name": "瞬间",
        "items": [
          {
            "id": "lpm-smile",
            "name": "微笑瞬间"
          },
          {
            "id": "lpm-turn",
            "name": "回头瞬间"
          },
          {
            "id": "lpm-walk",
            "name": "行走瞬间"
          },
          {
            "id": "lpm-laugh",
            "name": "大笑瞬间"
          }
        ]
      },
      {
        "id": "lp-effect",
        "name": "特效",
        "items": [
          {
            "id": "lpe-sparkle",
            "name": "闪光特效"
          },
          {
            "id": "lpe-rain",
            "name": "雨天特效"
          },
          {
            "id": "lpe-petals",
            "name": "花瓣飘落"
          },
          {
            "id": "lpe-snow",
            "name": "雪花特效"
          }
        ]
      },
      {
        "id": "lp-scene",
        "name": "场景",
        "items": [
          {
            "id": "lps-cafe",
            "name": "咖啡厅"
          },
          {
            "id": "lps-street",
            "name": "街头"
          },
          {
            "id": "lps-sea",
            "name": "海边"
          },
          {
            "id": "lps-rooftop",
            "name": "天台"
          }
        ]
      }
    ]
  }
};

// 暴露给前端页面使用（moe.js 通过 window 读取）
window.moeCategories = moeCategories;
window.moeItems = [
  {
    "type": "emotion",
    "categoryId": "emotion-shy",
    "collectionId": "col_1777770337325",
    "title": "",
    "tags": [
      "害羞"
    ],
    "file": "1777778101042_09bce35cdb664fded4f3c7bf10df37.jpg",
    "path": "assets/moe/emotion/1777778101042_09bce35cdb664fded4f3c7bf10df37.jpg",
    "date": "2026-05-03",
    "id": "moe_1777778101051"
  }
];
window.moeCollections = [
  {
    "name": "白圣女",
    "description": "萌萌萌死了喵~",
    "tags": [
      "萌系"
    ],
    "date": "2026-05-03",
    "id": "col_1777770337325"
  }
];
