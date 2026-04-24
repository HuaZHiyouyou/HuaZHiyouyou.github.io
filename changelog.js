// changelog.js 数据
export const changelog = [
  {
    "id": 1,
    "version": "v4.3.2",
    "date": "2026-04-19",
    "items": [
      "新增 GitHub API 三级容灾方案：镜像源切换 + localStorage 缓存 + 静态 fallback 数据",
      "新增 fetchGithubApi 函数：支持多镜像源自动切换，单源最多重试 2 次",
      "新增 3 个 GitHub API 镜像源：ghproxy.com、mirror.ghproxy.com、ghproxy.llkk.cc",
      "新增 localStorage 缓存机制：GitHub 数据缓存有效期 6 小时",
      "新增 data/github-fallback.js：API 完全不可用时的静态备用数据",
      "优化 API 调用体验：失败时自动降级，用户无感知",
      "修复贡献图模块：API 失败时支持使用缓存数据重绘"
    ],
    "tags": [
      "新功能",
      "容灾优化",
      "API 稳定性"
    ]
  },
  {
    "id": 2,
    "version": "v4.3.1",
    "date": "2026-04-18",
    "items": [
      "数据架构重构：废除 js/data.js，所有数据迁移到 data/ 目录分文件存储",
      "移除所有 localStorage 存储/读取逻辑，数据统一从 adminData 管理",
      "服务器启动时自动生成 data/index.js：从各分文件合并数据",
      "manage.html 引用改为 data/index.js，按钮提示改为「保存到 data/ 目录」",
      "js/server.js 删除废弃的 DATA_FILE/RESOURCE_FILE 引用",
      "修复删除功能失效：将 removeSkill/removeProject/removeChangelog/removeContributor 暴露到 window 全局",
      "新增媒体平台预设：微信公众号、知乎平台",
      "修复 changelog.js id 重复问题：批量修复为 1-20 顺序排列"
    ],
    "tags": [
      "修复",
      "新功能",
      "数据同步"
    ]
  },
  {
    "id": 2,
    "version": "v4.3",
    "date": "2026-04-18",
    "items": [
      "重构目录结构：分离数据存储（data/）和业务逻辑（js/），职责更清晰",
      "新增 data/ 数据中心：skills、projects、share、resources、notes 等模块独立存储",
      "迁移 moments/ 文件：topic.css → css/topic.css，topic.js → js/topic.js",
      "迁移 server.js：移动到 js/server.js 目录",
      "清理废弃文件：删除 style.css、main.js、ui.js、cache.js",
      "修复 ES Module 兼容性问题：重写 js/data.js 为传统 JS 格式",
      "修复 themeSettings 重复声明冲突",
      "修复 navbar 空引用错误",
      "修复 shareCategories 格式错误",
      "修复 notesCategories 格式错误",
      "新增 bilibili 分享项",
      "管理界面重构计划：柔和粉白风 + 左侧固定侧边栏布局"
    ],
    "tags": [
      "重构",
      "目录结构",
      "兼容性修复",
      "管理界面",
      "数据整理"
    ]
  },
  {
    "id": 3,
    "version": "v4.2",
    "date": "2026-04-18",
    "items": [
      "新增笔记模块：docs.html 笔记展示页面，支持搜索、筛选、卡片布局",
      "新增笔记管理：管理后台添加笔记管理功能，支持增删改查",
      "内容块系统：笔记支持混合内容（文字、代码、链接、图片），可拖拽排序",
      "内容块输入模态框：替代原来的 prompt，提供更友好的编辑体验",
      "代码块支持：15种编程语言选择，等宽字体显示",
      "图片上传：新增 /api/upload-image 接口，图片保存到 assets/docs/",
      "模态框动画：展开时带弹跳效果（scale + translateY）",
      "Tab 按钮动画：hover/active 时上浮 + 阴影效果",
      "筛选按钮动画：点击后上浮 + 阴影效果",
      "内容块动画：进入时浮入效果，hover 上浮",
      "模块切换动画：切换时卡片依次上浮",
      "资源页面主题：强制白色主题，与主页面保持一致",
      "资源页脚：改为与 share.html 一致的简洁风格",
      "修复 manage.js 语法错误：删除 openNoteModal 函数中重复的保存事件",
      "修复页面空白：移除资源页面多余的顶部间距"
    ],
    "tags": [
      "新功能",
      "笔记模块",
      "动画优化",
      "样式调整",
      "代码修复"
    ]
  },
  {
    "id": 4,
    "version": "v4.1.2",
    "date": "2026-04-12",
    "items": [
      "修复管理界面样式问题：统一 JS 渲染类名与 CSS 定义类名匹配",
      "技能标签：skill-item 类名修正",
      "项目仓库：project-item → project-card 类名修正",
      "贡献者列表：contributor-item → contributor-card 类名修正",
      "媒体平台：media-platform-header 等类名修正为标准格式",
      "视频列表：media-videos-list → media-video-list 类名修正",
      "修复媒体平台视频添加按钮位置错位问题",
      "新增 .media-platform-videos 和 .media-videos-header CSS 样式",
      "修复服务器启动路径问题：start.bat 修正 node server.js → node js\\server.js",
      "修复 server.js 重复声明 UPLOAD_DIR 变量错误",
      "修复静态文件路径解析错误：新增 ROOT_DIR 统一管理",
      "上传功能路径锁死方案：3个独立 API 端点直接映射对应目录",
      "上传媒体封面：/api/upload-media → assets/media/",
      "上传头像图片：/api/upload-avatar → assets/avatar/",
      "上传分享图片：/api/upload-share → assets/share/"
    ],
    "tags": [
      "修复",
      "管理界面",
      "服务器",
      "上传功能"
    ]
  },
  {
    "id": 5,
    "version": "v4.1.1",
    "date": "2026-04-11",
    "items": [
      "页面加载性能优化：所有页面添加 defer 延迟加载脚本",
      "index.html：logger/Particles/MusicPlayer/Sync/Cloud 模块延迟加载",
      "share.html：logger/Particles/Share 模块延迟加载",
      "manage.html：logger/Sync/Cloud/Resource/Manage 模块延迟加载",
      "resource.html：logger/Particles/Resource/Index 模块延迟加载",
      "topic.html：topic.js 延迟加载",
      "login.html：添加 preconnect 预连接",
      "预连接优化：所有页面添加 CDN preconnect 预连接",
      "index.html：Tailwind/Font Awesome/busuanzi/google fonts 预连接",
      "share.html：TailwindCDN/Font Awesome 预连接",
      "manage.html：TailwindCDN/Font Awesome 预连接",
      "resource.html：TailwindCDN/Font Awesome 预连接",
      "topic.html：Google Fonts/Font Awesome 预连接"
    ],
    "tags": [
      "性能",
      "优化"
    ]
  },
  {
    "id": 6,
    "version": "v4.1",
    "date": "2026-04-11",
    "items": [
      "新增网页分享模块：独立分享页面 share.html，支持搜索和分类筛选",
      "分享页面分类：实用工具、技术文章、学习资源、娱乐、其他",
      "分享卡片布局：卡片式展示，支持复制链接和跳转访问",
      "分享链接复制：一键复制到剪贴板，支持降级方案",
      "Header 动画：fade-in 效果，使用弹性 Bezier 曲线",
      "Toolbar 延迟动画：0.15s 延迟的 fade-in 效果",
      "搜索框特效：focus 时发光效果 + 上浮 transform",
      "筛选按钮动画：hover 时边框颜色、阴影、上浮效果",
      "卡片交错入场：staggered 动画，根据 index 计算延迟",
      "卡片悬停效果：hover 时上浮 + 阴影 + 边框高亮",
      "操作按钮动画：hover 时放大 + 阴影效果",
      "Toast 提示动画：slide-in 效果，显示2秒后消失",
      "页面加载动画：spinner 旋转动画",
      "Panel 切换动画：fade + translateY 效果",
      "统计卡片特效：hover 时 radial-gradient 发光效果",
      "说说发布表单：输入框 focus/hover 边框发光 + 上浮",
      "内容项动画：fadeSlideIn、slideIn 交错入场效果",
      "模态框动画：弹性缩放 cubic-bezier(0.34, 1.56, 0.64, 1)",
      "服务器状态检测：管理后台状态指示点 + 检测按钮",
      "本地服务器跳转：一键打开 localhost 管理页面",
      "协议区分处理：file:// 和 http:// 协议不同逻辑"
    ],
    "tags": [
      "新功能",
      "动画",
      "优化"
    ]
  },
  {
    "id": 7,
    "version": "v4.0",
    "date": "2026-04-06",
    "items": [
      "新增网盘资源模块：侧边栏和主界面增加资源入口",
      "侧边栏快捷入口新增网盘资源按钮",
      "顶部导航栏新增资源链接",
      "页脚快速链接新增资源入口",
      "资源管理面板：管理后台新增资源管理功能",
      "网盘类型配置：阿里云盘、百度网盘、蓝奏云、夸克网盘等",
      "网盘资源页面搜索框加大，居中显示",
      "登录密码加密保护：三重加密防止泄露",
      "密码配置文件：新增 secure-config.js 加密存储",
      "资源复制功能：一键复制链接和提取码",
      "新增说说数据持久化：说说保存到 data.js 并在 topic.html 展示",
      "修复 topic.html 不显示说说问题：优化 data.js 正则匹配逻辑",
      "修复 topic.js 重复代码：移除重复的 loadEntries 函数定义"
    ],
    "tags": [
      "新功能",
      "优化",
      "安全"
    ]
  },
  {
    "id": 8,
    "version": "v3.9",
    "date": "2026-04-06",
    "items": [
      "管理后台搜索框样式优化",
      "统一数据渲染逻辑：整合各模块数据加载方式",
      "数据存储优化：统一localStorage存储管理",
      "LocalStorage禁用兼容：添加错误处理，防止网站崩溃",
      "资源管理模块优化：修复初始化时机，防止重复加载",
      "数据导入/导出优化：修复异步时序，避免数据丢失",
      "修复清空数据报错问题",
      "子选项卡切换优化：media标签页正确渲染",
      "模态框动画优化：丝滑打开/关闭效果",
      "支持点击遮罩层关闭弹窗"
    ],
    "tags": [
      "优化",
      "修复"
    ]
  },
  {
    "id": 9,
    "version": "v3.8",
    "date": "2026-04-06",
    "items": [
      "本地服务器集成：启动后保存直接写入data.js文件",
      "服务器状态检测：实时显示连接状态",
      "服务器启动脚本：一键启动本地服务器（start.bat）",
      "新增API接口：数据获取/保存/资源管理/图片上传",
      "媒体平台数据配置：B站、抖音、快手等平台",
      "资源数据独立存储：新增resource-data.js文件"
    ],
    "tags": [
      "新功能",
      "优化"
    ]
  },
  {
    "id": 10,
    "version": "v3.7",
    "date": "2026-04-04",
    "items": [
      "卡片全透明化：所有卡片背景改为 transparent，统一视觉风格",
      "背景光斑增强：提升 bg-blob 透明度至 0.2-0.3，毛玻璃效果更明显",
      "卡片效果类名化：JS 通过类名 (.card-glass/.card-transparent/.card-shadow) 控制，不再设置内联样式",
      "访客统计系统：接入不蒜子 (busuanzi) 第三方统计，支持真实访客数",
      "管理面板数据分析：总访客数、页面浏览、平均停留时间、跳出率",
      "用户管理动态化：访客自动记录、访问次数统计、支持删除记录",
      "云端数据同步：基于 GitHub Gist API，支持上传/下载/合并",
      "自动云端同步：页面加载合并、每5分钟自动同步、关闭页面前上传",
      "侧边栏背景重构：移除蓝色渐变，改用 CSS 变量跟随主题色 + 毛玻璃",
      "侧边栏文字颜色适配：用户名、统计数字等改为主题色，确保可读性"
    ],
    "tags": [
      "新功能",
      "优化",
      "云端同步"
    ]
  },
  {
    "id": 11,
    "version": "v3.6",
    "date": "2026-04-04",
    "items": [
      "清理未使用文件：删除 style.css、main.js、ui.js、cache.js",
      "重构代码结构：将所有内联 onclick 改为事件绑定 (addEventListener)",
      "优化样式管理：将内联 style 转换为 CSS 辅助类",
      "新增 CSS 通用辅助类：文字、间距、布局等常用样式",
      "修复贡献人介绍卡片显示问题：修复 ID 类型匹配逻辑",
      "优化 index.html 交互事件绑定：邮箱复制、弹窗显示等",
      "优化 manage.html 交互事件绑定：用户管理按钮事件委托",
      "保持与 data.js 同步：贡献人介绍数据仅从 data.js 读取"
    ],
    "tags": [
      "重构",
      "优化"
    ]
  },
  {
    "id": 12,
    "version": "v3.5",
    "date": "2026-04-04",
    "items": [
      "新增说说/纸页功能：独立展示页面 (moments/topic.html)",
      "管理后台说说发布：支持发布、编辑、删除说说",
      "说说分类管理：心情(柔软/温暖/平静/热烈)、类型(说说/心理话/碎碎念)、可见性",
      "说说字数统计：实时显示已输入字数，最多360字",
      "示例数据填充：一键填充示例说说方便预览",
      "说说 localStorage 存储：独立存储键 paper-moments-v1",
      "说说展示页面美化：纸页风格、时间线布局、筛选功能",
      "详情弹窗：点击查看说说详细内容",
      "复制功能：支持复制单条说说内容"
    ],
    "tags": [
      "新功能",
      "说说"
    ]
  },
  {
    "id": 13,
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
    "id": 14,
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
    "id": 15,
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
    "id": 16,
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
    "id": 17,
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
    "id": 18,
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
    "id": 19,
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
    "id": 20,
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
];
