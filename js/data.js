// 网站数据配置 - 修改这里即可更新网站内容
const siteData = {
  "skills": [
    {
      "id": 1,
      "name": "HTML/CSS",
      "icon": "fa-html5",
      "category": "frontend",
      "color": "#E34F26"
    },
    {
      "id": 2,
      "name": "JavaScript",
      "icon": "fa-file-code-o",
      "category": "frontend",
      "color": "#F7DF1E"
    },
    {
      "id": 3,
      "name": "Vue.js",
      "icon": "fa-leaf",
      "category": "frontend",
      "color": "#4FC08D"
    },
    {
      "id": 4,
      "name": "Python",
      "icon": "fa-terminal",
      "category": "backend",
      "color": "#3776AB"
    },
    {
      "id": 5,
      "name": "AI学习",
      "icon": "fa-android",
      "category": "other",
      "color": "#FF6F61"
    },
    {
      "id": 6,
      "name": "Bot开发",
      "icon": "fa-comments",
      "category": "other",
      "color": "#9B59B6"
    },
    {
      "id": 7,
      "name": "Git",
      "icon": "fa-git",
      "category": "backend",
      "color": "#F05032"
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "个人网站",
      "desc": "基于HTML/CSS/JS构建的响应式个人网站，包含音乐播放器、粒子效果、主题切换等功能",
      "link": "https://github.com/HuaZHiyouyou/huazhiyouyou.github.io"
    },
    {
      "id": 2,
      "name": "Bot项目",
      "desc": "多功能Bot，支持多种娱乐和管理功能",
      "link": "#"
    }
  ],
  "changelog": [
    {
      "id": 1,
      "version": "v3.4",
      "date": "2026-03-29",
      "items": [
        "全新管理后台系统：独立管理面板页面",
        "新增管理员登录验证机制",
        "管理后台支持数据导入导出",
        "支持直接导入 data.js 文件并自动填充到各模块",
        "新增系统设置：主题、强调色、功能开关",
        "内容管理：技能标签、项目仓库、更新日志、贡献者",
        "新增成长历程管理模块",
        "介绍管理：个人信息和贡献人介绍",
        "引入 BroadcastChannel API 实现跨页面实时数据同步"
      ],
      "tags": [
        "新功能",
        "管理后台"
      ]
    },
    {
      "id": 2,
      "version": "v3.3",
      "date": "2026-03-29",
      "items": [
        "修复弹窗拖拽功能报错问题",
        "优化数据加载优先级逻辑",
        "data.js 改为主要数据源，localStorage 用于实时同步",
        "使用 BroadcastChannel 实现 manage.html 与 index.html 数据实时同步",
        "修复侧边栏和页脚版本号显示问题",
        "优化联系弹窗拖拽交互体验",
        "添加弹窗header拖拽区域标识"
      ],
      "tags": [
        "修复",
        "优化"
      ]
    },
    {
      "id": 3,
      "version": "v3.2",
      "date": "2026-03-21",
      "items": [
        "全新音乐播放器：横屏布局，支持搜索、播放、进度控制",
        "集成网易云音乐API，自动切换可用音源",
        "支持专辑封面同步显示",
        "新增歌词显示功能：内嵌模式和侧边模式",
        "歌词实时高亮，自动滚动",
        "播放器和歌词界面独立运行，可分别拖动",
        "支持播放模式切换：列表循环、随机播放、单曲循环",
        "音量控制、搜索过滤、主题切换"
      ],
      "tags": [
        "新功能",
        "音乐"
      ]
    },
    {
      "id": 2,
      "version": "v3.1",
      "date": "2026-03-21",
      "items": [
        "全面采用透明卡片设计风格",
        "导航栏改为透明背景，移除毛玻璃效果",
        "侧边栏改为淡蓝色渐变背景，适配深色主题",
        "页脚改为透明背景，统一视觉风格",
        "所有卡片、按钮、图标统一透明+边框设计",
        "侧边栏美化：头像渐变、状态标签、统计卡片、快捷入口、社交图标",
        "搜索框、浮动按钮、访客计数器透明化",
        "深色模式全面适配优化"
      ],
      "tags": [
        "优化"
      ]
    },
    {
      "id": 3,
      "version": "v3.0",
      "date": "2026-03-21",
      "items": [
        "卡片样式全面升级：光晕效果、玻璃拟态增强",
        "新增打字机效果欢迎标题",
        "新增技能标签展示区域",
        "新增 GitHub 统计与贡献图",
        "日志卡片改为时间轴样式",
        "新增仓库搜索过滤功能",
        "新增实时时钟与访客计数器",
        "添加鼠标跟随光效",
        "添加页面加载动画"
      ],
      "tags": [
        "新功能",
        "重构"
      ]
    },
    {
      "id": 4,
      "version": "v2.1",
      "date": "2026-03-21",
      "items": [
        "改进侧边栏设计：添加用户头像区和统计数据",
        "改进底部 Footer：多列布局、波浪装饰、返回顶部",
        "侧边栏增加快速入口和社交媒体链接",
        "优化整体视觉效果和交互细节"
      ],
      "tags": [
        "优化"
      ]
    },
    {
      "id": 5,
      "version": "v2.0",
      "date": "2026-03-14",
      "items": [
        "简化页面功能，移除小工具和相册",
        "主题色改为蓝色",
        "新增粒子切换按钮",
        "设置改为深色模式切换"
      ],
      "tags": [
        "重构"
      ]
    },
    {
      "id": 6,
      "version": "v1.0",
      "date": "2026-02-16",
      "items": [
        "初始版本发布",
        "基础页面结构",
        "简单的粒子效果",
        "音乐播放器"
      ],
      "tags": [
        "初始"
      ]
    }
  ],
  "contributors": [
    {
      "id": 1774688981342,
      "name": "小勿",
      "role": "开发  审核  设计",
      "link": "",
      "avatar": "assets/avatar/xiaowu.jpg"
    },
    {
      "id": 1774692648621,
      "name": "Ryokuryuneko",
      "role": "技术支持",
      "bio": "我是WZL0813你也可以叫我Ryokuryuneko喵~详细请查看Ryokuryuneko.top喵\n曾获得：\n2006年美国周刊年度风云人物\n2008年感动中国组委会特别大奖\n2019年年度地球卫士奖\n2022年奥林匹克杯获得者\n第六届中国国际进口博览会伊朗展台特邀嘉宾\n图灵奖获得者\n我精通：各个语言，熟读计算机网络，数据结构与算法，数据库原理，操作系统各种书，熟练使用人工智能辅助编写程序",
      "email": "2411273874@qq.com",
      "website": "https://ryokuryuneko.top/",
      "link": "GitHub:https://github.com/WZL0813",
      "avatar": "assets/avatar/Ryokuryuneko.jpg"
    },
    {
      "id": 1,
      "name": "桦知柚",
      "role": "开发  设计",
      "link": "https://github.com/HuaZHiyouyou",
"avatar": "assets/avatar/huazhiyou.jpg"
    }
  ],
  "growth": [
    {
      "id": 1,
      "date": "现在",
      "title": "不断进步，不断学习",
      "desc": "积极学习新技术，努力成长，渴望被关注和认可"
    },
    {
      "id": 2,
      "date": "起点",
      "title": "技术探索之旅",
      "desc": "从零开始学习编程，接触Web开发、AI和Bot制作"
    },
    {
      "id": 3,
      "date": "目标",
      "title": "持续成长",
      "desc": "努力学习，不断进步，期待更大的突破"
    }
  ],
  "about": {
    "avatar": "assets/avatar/huazhiyou.jpg",
    "nickname": "技术力",
    "exp": "1",
    "projects": "1",
    "passion": "∞",
    "bio": "咖啡厅群主、在校学生、mmder、bot人、AI学习者、文学爱好者，音乐爱好人，二次元一枚。渴望被怜爱、关注，积极听取心声和意见，努力成长中。",
    "techStack": [
      "HTML/CSS",
      "javaScript",
      "Vue.js",
      "Python",
      "AI学习",
      "Bot开发",
      "Git"
    ],
    "github": "https://github.com/HuaZHiyouyo",
    "email": "nujianwudi@qq.com",
    "qq": "2410887846",
    "weixin": ""
  },
  "contributorsIntro": [
    {
      "id": 1774688981342,
      "contributorId": 1774688981342,
      "avatar": "assets/avatar/xiaowu.jpg",
      "name": "小勿",
      "role": "开发  审核  设计",
      "exp": "∞",
      "projects": "∞",
      "passion": "∞",
      "bio": "若问行踪何处是，长空雁字写西东",
      "techStack": [],
      "github": "",
      "email": "",
      "qq": "3690242113",
      "weixin": ""
    },
    {
      "id": 1774692648621,
      "contributorId": 1774692648621,
      "avatar": "assets/avatar/Ryokuryuneko.jpg",
      "name": "Ryokuryuneko",
      "role": "技术支持",
      "exp": "∞",
      "projects": "∞",
      "passion": "∞",
      "bio": "我是WZL0813你也可以叫我Ryokuryuneko喵~详细请查看Ryokuryuneko.top喵\n曾获得：\n2006年美国周刊年度风云人物\n2008年感动中国组委会特别大奖\n2019年年度地球卫士奖\n2022年奥林匹克杯获得者\n第六届中国国际进口博览会伊朗展台特邀嘉宾\n图灵奖获得者\n精通：软硬件，各个编程语言，熟读计算机网络，数据结构与算法，数据库原理，操作系统各种书，熟练使用人工智能辅助编写程序",
      "techStack": [
        "Python",
        "HTML/CSS",
        "Java",
        "JavaScript",
        "AI",
        "Bot",
        "Git",
        "C/C++",
        "易语言"
      ],
      "github": "GitHub:https://github.com/WZL0813",
      "email": "2411273874@qq.com",
      "qq": "2411273874",
      "weixin": ""
    }
  ],
  "contributorGrowth": {
    "1774688981342": [
      {
        "id": 1774709278721,
        "date": "",
        "title": "自由",
        "desc": "不满于规则化的掌控，喜欢遨游自在"
      },
      {
        "id": 1774709257344,
        "date": "",
        "title": "追索",
        "desc": "不断追求答案，了解事情真相"
      },
      {
        "id": 1774709300520,
        "date": "",
        "title": "学习",
        "desc": "对哲理，文学拥有不断向上的学习动力"
      }
    ]
  }
};
