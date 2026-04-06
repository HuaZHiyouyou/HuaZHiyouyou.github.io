// 资源数据配置 - 修改这里即可更新资源内容
const resourceData = {
  resources: [
    {
      id: 1,
      title: "测试资源",
      description: "这是一个测试资源",
      type: "aliyun",
      url: "https://www.aliyundrive.com/s/xxx",
      password: "1234",
      size: "1.2GB",
      createdAt: "2026-04-05"
    }
  ]
};

// 网盘类型配置
const PLATFORM_TYPES = {
  aliyun: { name: "阿里云盘", icon: "fa-cloud", color: "#FF6A00" },
  baidu: { name: "百度网盘", icon: "fa-cloud", color: "#3300FF" },
  lanzou: { name: "蓝奏云", icon: "fa-cloud", color: "#00A0E9" },
  quark: { name: "夸克网盘", icon: "fa-cloud", color: "#00C1FF" },
  tianyi: { name: "天翼云盘", icon: "fa-cloud", color: "#00A0E9" },
  nutstore: { name: "坚果云", icon: "fa-cloud", color: "#00A0E9" },
  nainiu: { name: "奶牛快传", icon: "fa-cloud", color: "#FF6600" },
  unicom: { name: "联通云盘", icon: "fa-cloud", color: "#00A0E9" },
  cmcc: { name: "移动云盘", icon: "fa-cloud", color: "#00A0E9" },
  ctfile: { name: "城通网盘", icon: "fa-cloud", color: "#00A0E9" },
  115: { name: "115网盘", icon: "fa-cloud", color: "#00A0E9" },
  onedrive: { name: "OneDrive", icon: "fa-cloud", color: "#0078D4" },
  google: { name: "Google Drive", icon: "fa-cloud", color: "#4285F4" },
  dropbox: { name: "Dropbox", icon: "fa-cloud", color: "#0061FF" },
  other: { name: "其他/直链", icon: "fa-link", color: "#666666" }
};
