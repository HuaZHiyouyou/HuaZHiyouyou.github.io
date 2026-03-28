// ====================== UI 交互模块 - 简化版 ======================
class UI {
  constructor() {
    this.init();
  }

  init() {
    this.initSidebar();
    this.initMusicPlayer();
    this.initAnimations();
    this.initScrollEffects();
    Logger.log('UI 模块初始化完成', 'INFO');
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

  // 音乐播放器
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
          const cachedFile = await Cache.saveFile(file, 'music');
          if (cachedFile) {
            if (!window.settings.musicList) window.settings.musicList = [];
            window.settings.musicList.push({
              name: file.name,
              url: cachedFile.data
            });
            Cache.saveSettings(window.settings);
            window.renderMusicList();
            Logger.log(`音乐已添加：${file.name}`, 'INFO');
          }
        }
      });
    }
  }

  // 动画优化
  initAnimations() {
    const updateAnimationSettings = () => {
      const duration = document.getElementById('animation-duration')?.value || 300;
      const easing = document.getElementById('easing-function')?.value || 'ease';

      document.documentElement.style.setProperty('--animation-duration', `${duration}ms`);
      document.documentElement.style.setProperty('--easing-function', easing);

      Logger.log(`动画设置更新：时长=${duration}ms, 缓动=${easing}`, 'DEBUG');
    };

    const durationInput = document.getElementById('animation-duration');
    const easingSelect = document.getElementById('easing-function');

    if (durationInput) durationInput.addEventListener('input', updateAnimationSettings);
    if (easingSelect) easingSelect.addEventListener('change', updateAnimationSettings);
  }

  // 滚动效果
  initScrollEffects() {
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      lastScrollY = currentScrollY;
    });
  }

  // 渲染更新日志
  renderUpdates() {
    const container = document.getElementById('updates-container');
    if (!container) return;

    const updates = [
      {
        version: 'v3.0',
        date: '2026-03-14',
        changes: [
          '简化页面功能，移除小工具和相册',
          '主题色改为蓝色',
          '新增粒子切换按钮',
          '设置改为深色模式切换',
          '保留粒子效果和音乐播放功能'
        ]
      },
      {
        version: 'v2.0',
        date: '2026-02-17',
        changes: [
          '添加了完整的缓存管理系统',
          '实现了日志记录和查看功能',
          '优化了粒子系统',
          '添加了左侧边栏和新闻模块'
        ]
      },
      {
        version: 'v1.0',
        date: '2026-02-16',
        changes: [
          '初始版本发布',
          '基础页面结构',
          '简单的粒子效果',
          '音乐播放器'
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

// 实例化 UI
window.UI = new UI();
