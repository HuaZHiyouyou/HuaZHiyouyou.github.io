/**
 * 资源数据入口文件
 * 
 * 使用方式：
 * <script src="js/resource-data.js"></script>
 * 
 * 加载后可用：
 * - window.resources     // 资源列表
 * - window.platformTypes // 平台类型
 * 
 * 兼容旧写法：
 * - window.resourceData   // 资源列表
 * - window.PLATFORM_TYPES // 平台类型
 */

var resources = [
  {
    id: 1,
    title: "测试资源",
    description: "这是一个测试资源",
    type: "aliyun",
    url: "https://www.aliyundrive.com/s/xxx",
    password: "1234",
    size: "1.2GB",
    createdAt: "2026-04-05"
  },
  {
    id: 1775441637095,
    title: "AI Agent",
    description: "AI 智能体集合项目，包含 197 个 针对不同场景和工具的专业 AI 智能体",
    type: "lanzou",
    url: "https://wwbry.lanzouu.com/iGhBN3mk9l7i",
    password: "c8dc",
    size: "",
    createdAt: "2026-04-06"
  }
];

var platformTypes = {
  "115": { name: "115网盘", icon: "fa-cloud", color: "#00A0E9" },
  "aliyun": { name: "阿里云盘", icon: "fa-cloud", color: "#FF6A00" },
  "baidu": { name: "百度网盘", icon: "fa-cloud", color: "#3300FF" },
  "lanzou": { name: "蓝奏云", icon: "fa-cloud", color: "#00A0E9" },
  "quark": { name: "夸克网盘", icon: "fa-cloud", color: "#00C1FF" },
  "tianyi": { name: "天翼云盘", icon: "fa-cloud", color: "#00A0E9" },
  "nutstore": { name: "坚果云", icon: "fa-cloud", color: "#00A0E9" },
  "nainiu": { name: "奶牛快传", icon: "fa-cloud", color: "#FF6600" },
  "unicom": { name: "联通云盘", icon: "fa-cloud", color: "#00A0E9" },
  "cmcc": { name: "移动云盘", icon: "fa-cloud", color: "#00A0E9" },
  "ctfile": { name: "城通网盘", icon: "fa-cloud", color: "#00A0E9" },
  "onedrive": { name: "OneDrive", icon: "fa-cloud", color: "#0078D4" },
  "google": { name: "Google Drive", icon: "fa-cloud", color: "#4285F4" },
  "dropbox": { name: "Dropbox", icon: "fa-cloud", color: "#0061FF" },
  "other": { name: "其他/直链", icon: "fa-link", color: "#666666" }
};

// 挂载到 window
if (typeof window !== 'undefined') {
  window.resources = resources;
  window.platformTypes = platformTypes;
  
  // 兼容旧写法
  window.resourceData = resources;
  window.PLATFORM_TYPES = platformTypes;
}
