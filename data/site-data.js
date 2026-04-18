/**
 * 站点配置数据
 * 定义站点的基本信息和配置
 */
var siteData = {
  // 站点名称
  name: '桦知柚',
  
  // 站点描述
  description: '个人主页',
  
  // 作者信息
  author: '桦知柚',
  
  // 导航菜单
  nav: [
    { name: '首页', url: 'index.html', icon: 'fa-home' },
    { name: '资源', url: 'resource.html', icon: 'fa-folder' },
    { name: '分享', url: 'share.html', icon: 'fa-share-alt' },
    { name: '笔记', url: 'docs.html', icon: 'fa-book' },
    { name: '管理', url: 'manage.html', icon: 'fa-cog' }
  ],
  
  // 社交链接
  social: [
    { name: 'GitHub', url: '#', icon: 'fa-github' },
    { name: '邮箱', url: 'mailto:#', icon: 'fa-envelope' }
  ],
  
  // 主题设置
  theme: {
    default: 'light',
    dark: 'dark'
  }
};
