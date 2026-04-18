/**
 * 数据入口文件 - 所有模块数据的统一入口
 */

var skills = [
  {"id":1,"name":"HTML/CSS","icon":"fa-html5","category":"frontend","color":"#E34F26"},
  {"id":2,"name":"JavaScript","icon":"fa-file-code-o","category":"frontend","color":"#F7DF1E"},
  {"id":3,"name":"Vue.js","icon":"fa-leaf","category":"frontend","color":"#4FC08D"},
  {"id":4,"name":"Python","icon":"fa-terminal","category":"backend","color":"#3776AB"},
  {"id":5,"name":"AI学习","icon":"fa-android","category":"other","color":"#FF6F61"},
  {"id":6,"name":"Bot开发","icon":"fa-comments","category":"other","color":"#9B59B6"},
  {"id":7,"name":"Git","icon":"fa-git","category":"backend","color":"#F05032"}
];

var projects = [
  {"id":1,"name":"个人网站","desc":"基于HTML/CSS/JS构建的响应式个人网站，包含音乐播放器、粒子效果、主题切换等功能","link":"https://github.com/HuaZHiyouyou/huazhiyouyou.github.io"},
  {"id":2,"name":"Bot项目","desc":"多功能Bot，支持多种娱乐和管理功能","link":"#"}
];

var changelog = [
  {
    "id": 1, "version": "v4.3", "date": "2026-04-18",
    "items": ["重构目录结构","新增data/数据中心","清理废弃文件","修复兼容性问题","管理界面重构计划"],
    "tags": ["重构", "目录结构"]
  },
  {
    "id": 1, "version": "v4.2", "date": "2026-04-18",
    "items": ["新增笔记模块"],
    "tags": ["新功能"]
  },
  { "id": 1, "version": "v1.0.0", "date": "2025-12-01", "items": ["初始版本发布"], "tags": ["新功能"] }
];

var about = {
  "avatar": "assets/avatar/huazhiyou.jpg",
  "nickname": "技术力",
  "bio": "咖啡厅群主、在校学生、AI学习者，渴望被关注和认可。",
  "techStack": ["HTML/CSS","JavaScript","Vue.js","Python","AI学习","Bot开发","Git"],
  "github": "https://github.com/HuaZHiyouyou",
  "email": "nujianwudi@qq.com",
  "qq": "2410887846"
};

var growth = [
  {"id":1,"date":"现在","title":"不断进步，不断学习","desc":"积极学习新技术"},
  {"id":2,"date":"起点","title":"技术探索之旅","desc":"从零开始学习编程"},
  {"id":3,"date":"目标","title":"持续成长","desc":"期待更大的突破"}
];

var contributors = [
  {"id":1774688981342,"name":"小勿","role":"开发 审核 设计","avatar":"assets/avatar/xiaowu.jpg","link":""},
  {"id":1774692648621,"name":"Ryokuryuneko","role":"技术支持","bio":"我是WZL0813喵~","email":"2411273874@qq.com","website":"https://ryokuryuneko.top/","link":"GitHub:https://github.com/WZL0813","avatar":"assets/avatar/Ryokuryuneko.jpg"},
  {"id":1,"name":"桦知柚","role":"开发 设计","link":"https://github.com/HuaZHiyouyou","avatar":"assets/avatar/huazhiyou.jpg"}
];

var contributorsIntro = [
  {"id":1774688981342,"name":"小勿","role":"开发 审核 设计","exp":"∞","bio":"若问行踪何处是，长空雁字写东西","qq":"3690242113"},
  {"id":1774692648621,"name":"Ryokuryuneko","role":"技术支持","bio":"精通软硬件和各个编程语言","techStack":["Python","HTML/CSS","Java","JavaScript","AI","Bot","Git"],"github":"GitHub:https://github.com/WZL0813","email":"2411273874@qq.com"}
];

var contributorGrowth = {
  "1774688981342": [{"id":1,"title":"自由","desc":"不满于规则化的掌控"},{"id":2,"title":"追索","desc":"不断追求答案"},{"id":3,"title":"学习","desc":"对哲理文学拥有向上动力"}]
};

var moments = [{"id":1775446484909,"mood":"柔软","type":"心理话","visibility":"只给自己看","content":"今天其实没有发生什么特别大的事。","createdAt":"2026-04-06T03:34:44.909Z"}];

var mediaPlatforms = [
  {"id":1,"type":"bilibili","name":"Bilibili","icon":"fa-play-circle","color":"#00a1d6","url":"https://space.bilibili.com/3546734881933822","desc":"视频创作与分享"},
  {"id":1775380589700,"type":"douyin","name":"抖音","icon":"fa-music","color":"#0faea3","url":"https://www.douyin.com/user/MS4wLjABAAAAKzOwxx0-5O_0cHXNja5rJ9fG-LKgLKNcpwcjj3eohMU0SGunvIBtaAWjkGSoR-57","desc":"视频创作与分享"},
  {"id":1775380771051,"type":"kuaishou","name":"快手","icon":"fa-video-camera","color":"#ff4906","url":"https://www.kuaishou.com/profile/3x3p7ksye3273cy?source=SEARCH","desc":"视频创作与分享"}
];

var resources = [
  {"id":1,"title":"测试资源","description":"这是一个测试资源","type":"aliyun","url":"https://www.aliyundrive.com/s/xxx","password":"1234","size":"1.2GB","createdAt":"2026-04-05"},
  {"id":1775441637095,"title":"AI Agent","description":"AI 智能体集合项目","type":"lanzou","url":"https://wwbry.lanzouu.com/iGhBN3mk9l7i","password":"c8dc","createdAt":"2026-04-06"}
];

var platformTypes = {"115":{"name":"115网盘","icon":"fa-cloud"},"aliyun":{"name":"阿里云盘","icon":"fa-cloud"},"baidu":{"name":"百度网盘","icon":"fa-cloud"},"lanzou":{"name":"蓝奏云","icon":"fa-cloud"},"quark":{"name":"夸克网盘","icon":"fa-cloud"},"other":{"name":"其他","icon":"fa-link"}};

var shares = [{"id":1,"title":"哔哩哔哩","description":"国内知名的视频弹幕网站","image":"assets/share/bilibili.jpg","url":"https://www.bilibili.com","category":"entertainment"},{"id":2,"title":"示例分享","description":"这是一个示例","url":"https://example.com","category":"tool"}];

var shareCategories = {"tool":{"name":"实用工具"},"article":{"name":"技术文章"},"learning":{"name":"学习资源"},"entertainment":{"name":"娱乐"},"other":{"name":"其他"}};

var notes = [];
var notesCategories = {"learning":{"name":"学习笔记"},"docs":{"name":"技术文档"},"code":{"name":"代码片段"},"article":{"name":"文章"},"link":{"name":"链接收藏"},"image":{"name":"图片"},"other":{"name":"其他"}};

var siteData = {
  skills, projects, changelog, about, growth,
  contributors, contributorsIntro, contributorGrowth,
  moments, mediaPlatforms, resources, platformTypes,
  shares, shareCategories, notes, notesCategories
};
