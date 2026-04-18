// GitHub静态数据 - API不可用时的备选数据
// 这个文件在GitHub Actions运行时会自动更新

const githubFallbackData = {
  // 用户信息
  user: {
    login: 'HuaZHiyouyou',
    name: '桦知柚',
    bio: '代码创造无限可能',
    public_repos: 0,
    followers: 0,
    following: 0,
    avatar_url: 'assets/avatar/huazhiyou.jpg'
  },

  // 仓库列表
  repos: [],

  // 贡献图数据（最近84天的活动）
  contributions: {},

  // 最后更新时间
  lastUpdated: new Date().toISOString()
};

// 如果需要手动更新数据，请访问 https://github.com/HuaZHiyouyou
