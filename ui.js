// ====================== UI交互优化模块 ======================
class UI {
  constructor() {
    this.init();
  }

  init() {
    this.initSidebar();
    this.initMusicPlayer();
    this.initSettingsPanel();
    this.initAnimations();
    this.initScrollEffects();
    Logger.log('UI模块初始化完成', 'INFO');
  }

  // 侧边栏
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');

    if (!sidebar || !toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
      Logger.log('侧边栏切换', 'DEBUG');
    });

    // 点击侧边栏链接时关闭侧边栏
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        // 保存浏览痕迹
        Cache.saveHistory(link.getAttribute('href'));
      });
    });

    // 点击页面其他地方关闭侧边栏
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // 右上角音乐播放器
  initMusicPlayer() {
    const toggle = document.getElementById('music-toggle');
    const panel = document.getElementById('music-panel');
    const upload = document.getElementById('music-upload');

    if (!toggle || !panel) return;

    // 切换音乐面板显示
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
      Logger.log('音乐面板切换', 'DEBUG');
    });

    // 点击页面其他地方关闭音乐面板
    document.addEventListener('click', () => {
      panel.classList.remove('show');
    });

    // 阻止面板内部点击事件冒泡
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 音乐上传
    if (upload) {
      upload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          // 优先保存到本地缓存
          const cachedFile = await Cache.saveFile(file, 'music');
          if (cachedFile) {
            // 添加到音乐列表
            if (!window.settings.musicList) window.settings.musicList = [];
            window.settings.musicList.push({
              name: file.name,
              url: cachedFile.data
            });
            Cache.saveSettings(window.settings);
            window.renderMusicList();
            Logger.log(`音乐已添加: ${file.name}`, 'INFO');
          }
        }
      });
    }
  }

  // 设置面板
  initSettingsPanel() {
    const toggle = document.getElementById('settings-toggle');
    const close = document.getElementById('settings-close');
    const panel = document.getElementById('settings-panel');

    if (!toggle || !close || !panel) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.add('open');
      Logger.log('设置面板打开', 'DEBUG');
    });

    close.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.remove('open');
      Logger.log('设置面板关闭', 'DEBUG');
    });

    // 点击页面其他地方关闭设置面板
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  }

  // 动画优化
  initAnimations() {
    // 应用自定义缓动函数和动画时长
    const updateAnimationSettings = () => {
      const duration = document.getElementById('animation-duration')?.value || 300;
      const easing = document.getElementById('easing-function')?.value || 'ease';

      document.documentElement.style.setProperty('--animation-duration', `${duration}ms`);
      document.documentElement.style.setProperty('--easing-function', easing);

      Logger.log(`动画设置更新: 时长=${duration}ms, 缓动=${easing}`, 'DEBUG');
    };

    // 监听动画设置变化
    const durationInput = document.getElementById('animation-duration');
    const easingSelect = document.getElementById('easing-function');

    if (durationInput) durationInput.addEventListener('input', updateAnimationSettings);
    if (easingSelect) easingSelect.addEventListener('change', updateAnimationSettings);
  }

  // 滚动效果
  initScrollEffects() {
    // 滚动时的视差效果
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      lastScrollY = currentScrollY;
    });
  }

  // 渲染新闻
  renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    // 示例新闻数据
    const news = [
      {
        title: '网站重大更新',
        date: '2026-02-17',
        content: '完成了10项功能升级，包括缓存系统、日志系统、优化的粒子效果等。',
        link: '#'
      },
      {
        title: '新功能上线',
        date: '2026-02-16',
        content: '添加了左侧边栏、右上角音乐播放器、新闻和更新模块。',
        link: '#'
      }
    ];

    container.innerHTML = news.map(item => `
      <a href="${item.link}" class="block p-6 rounded-lg shadow card-bg hover:shadow-lg transition-all">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-xl font-bold card-title">${item.title}</h3>
          <span class="text-sm text-gray-500">${item.date}</span>
        </div>
        <p class="text-content">${item.content}</p>
      </a>
    `).join('');
  }

  // 渲染更新日志
  renderUpdates() {
    const container = document.getElementById('updates-container');
    if (!container) return;

    const updates = [
      {
        version: 'v2.0',
        date: '2026-02-17',
        changes: [
          '添加了完整的缓存管理系统',
          '实现了日志记录和查看功能',
          '优化了粒子系统，解决了卡顿问题',
          '添加了左侧边栏和新闻模块',
          '将音乐播放器移到了右上角',
          '实现了本地资源优先加载',
          '添加了交互动画自定义功能',
          '背景固定不随页面滚动',
          '性能全面优化'
        ]
      },
      {
        version: 'v1.0',
        date: '2026-02-16',
        changes: [
          '初始版本发布',
          '基础页面结构',
          '简单的粒子效果',
          '音乐播放器',
          '主题颜色自定义'
        ]
      }
    ];

    container.innerHTML = updates.map(update => `
      <div class="p-6 rounded-lg shadow card-bg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold card-title">${update.version}</h3>
          <span class="text-sm text-gray-500">${update.date}</span>
        </div>
        <ul class="list-disc list-inside space-y-1 text-content">
          ${update.changes.map(change => `<li>${change}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
}

// 只实例化一次，避免重复声明
window.UI = new UI();