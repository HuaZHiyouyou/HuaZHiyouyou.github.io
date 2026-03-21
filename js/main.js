// ====================== 主逻辑模块 - 简化版 ======================
// 全局变量挂载
window.settings = Cache.getSettings();
window.currentMusicIndex = -1;

// 应用设置
function applySettings() {
  // 检查当前是否为深色模式，如果是则不应用保存的颜色设置
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // 清除之前设置的内联样式
  document.documentElement.style.removeProperty('--bg-primary');
  document.documentElement.style.removeProperty('--bg-secondary');
  document.documentElement.style.removeProperty('--text-welcome');
  document.documentElement.style.removeProperty('--text-title');
  document.documentElement.style.removeProperty('--text-content');
  document.documentElement.style.removeProperty('--accent-color');
  
  // 应用 CSS 变量（深色模式下跳过颜色设置，让CSS选择器生效）
  if (!isDarkMode) {
    document.documentElement.style.setProperty('--bg-primary', window.settings.bgPrimary || '#EFF6FF');
    document.documentElement.style.setProperty('--bg-secondary', window.settings.bgSecondary || '#F8FAFC');
    document.documentElement.style.setProperty('--text-welcome', window.settings.textWelcome || '#1D4ED8');
    document.documentElement.style.setProperty('--text-title', window.settings.textTitle || '#1E3A8A');
    document.documentElement.style.setProperty('--text-content', window.settings.textContent || '#475569');
    document.documentElement.style.setProperty('--accent-color', window.settings.accentColor || '#3B82F6');
  }
  
  // 这些设置无论深色浅色都应用
  document.documentElement.style.setProperty('--bg-opacity', window.settings.bgOpacity || 1);
  document.documentElement.style.setProperty('--bg-blur', (window.settings.bgBlur || 0) + 'px');
  document.documentElement.style.setProperty('--vignette-opacity', window.settings.vignetteOpacity || 0.1);
  document.documentElement.style.setProperty('--particle-z-index', window.settings.particleZindex || 0);

  // 处理半透明背景的 RGB 值（深色模式下使用深色背景）
  const bgRgb = isDarkMode ? '30,41,59' : hexToRgb(window.settings.bgPrimary || '#EFF6FF');
  const header = document.querySelector('header');
  if (header) header.style.backgroundColor = `rgba(${bgRgb}, 0.9)`;

  // 应用背景
  const bgContainer = document.getElementById('bg-container');
  if (bgContainer) {
    bgContainer.innerHTML = '';
    if (window.settings.bgType === 'color') {
      bgContainer.innerHTML = `<div id="bg-default"></div>`;
    } else if (window.settings.bgType === 'image' && window.settings.bgUrl) {
      const cachedFile = Cache.getFile(`image_${window.settings.bgUrl.split('/').pop()}`);
      const url = cachedFile ? cachedFile.data : window.settings.bgUrl;
      bgContainer.innerHTML = `<img src="${url}" class="bg-media" alt="背景图" />`;
    } else if (window.settings.bgType === 'video' && window.settings.bgUrl) {
      const cachedFile = Cache.getFile(`video_${window.settings.bgUrl.split('/').pop()}`);
      const url = cachedFile ? cachedFile.data : window.settings.bgUrl;
      bgContainer.innerHTML = `<video src="${url}" class="bg-media" autoplay loop muted playsinline></video>`;
    }
  }

  // 应用粒子设置
  if (window.Particles) {
    window.Particles.updateSettings({
      types: window.settings.particleTypes || ['snow'],
      count: window.settings.particleCount || 100,
      size: window.settings.particleSize || 3,
      opacity: window.settings.particleOpacity || 0.8,
      speed: window.settings.particleSpeed || 2,
      area: window.settings.particleArea || 'full',
      zIndex: window.settings.particleZindex || 0
    });

    if (window.settings.particleEnabled) {
      window.Particles.start();
    } else {
      window.Particles.stop();
    }
  }

  // 渲染音乐列表
  renderMusicList();

  // 保存设置到缓存
  Cache.saveSettings(window.settings);
}

// 十六进制转 RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// 渲染音乐列表
function renderMusicList() {
  const musicList = document.getElementById('music-list');
  const audio = document.getElementById('audio-element');
  const musicToggle = document.getElementById('music-toggle');

  if (!musicList) return;

  if (!window.settings.musicList || window.settings.musicList.length === 0) {
    musicList.innerHTML = `<p class="text-xs opacity-70">上传的音乐将显示在这里</p>`;
    return;
  }

  musicList.innerHTML = window.settings.musicList.map((music, index) => `
    <div class="flex items-center gap-2 py-1 border-b border-opacity-20" style="border-color: var(--text-content);">
      <button class="music-play-btn text-sm" data-index="${index}" style="color: var(--accent-color);">
        <i class="fa fa-${index === window.currentMusicIndex && !audio?.paused ? 'pause' : 'play'}"></i>
      </button>
      <span class="flex-1 truncate" style="color: var(--text-title);">${music.name}</span>
      <button class="music-delete-btn text-sm text-red-500" data-index="${index}">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  `).join('');

  // 绑定播放事件
  document.querySelectorAll('.music-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      const audio = document.getElementById('audio-element');
      if (!audio) return;

      if (index === window.currentMusicIndex && !audio.paused) {
        audio.pause();
        if (musicToggle) musicToggle.innerHTML = '<i class="fa fa-music"></i>';
      } else {
        playMusic(index);
      }
      renderMusicList();
    });
  });

  // 绑定删除事件
  document.querySelectorAll('.music-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      const audio = document.getElementById('audio-element');
      const musicToggle = document.getElementById('music-toggle');

      if (index === window.currentMusicIndex) {
        audio?.pause();
        window.currentMusicIndex = -1;
        if (musicToggle) musicToggle.innerHTML = '<i class="fa fa-music"></i>';
      }
      window.settings.musicList.splice(index, 1);
      Cache.saveSettings(window.settings);
      renderMusicList();
      Logger.log('音乐已删除', 'INFO');
    });
  });
}

// 播放音乐
function playMusic(index) {
  const musicToggle = document.getElementById('music-toggle');
  const audio = document.getElementById('audio-element');

  if (index < 0 || !window.settings.musicList || index >= window.settings.musicList.length || !audio) return;

  const music = window.settings.musicList[index];
  const cachedFile = Cache.getFile(`music_${music.name}`);
  audio.src = cachedFile ? cachedFile.data : music.url;
  audio.play().catch(err => {
    console.log('播放失败：', err);
    Logger.log('音乐播放失败：' + err.message, 'ERROR');
  });
  window.currentMusicIndex = index;
  musicToggle.innerHTML = '<i class="fa fa-pause"></i>';
  Logger.log(`正在播放：${music.name}`, 'INFO');
}

// 初始化所有功能
function initAll() {
  // 应用保存的设置
  applySettings();

  // 初始化音乐播放器
  initMusicPlayerControls();

  // 初始化缓存设置
  initCacheSettings();

  // 渲染日志
  Logger.renderLogs('logs-container');

  Logger.log('网站所有功能初始化完成', 'INFO');
}

// 音乐播放器控制
function initMusicPlayerControls() {
  const musicToggle = document.getElementById('music-toggle');
  const audio = document.getElementById('audio-element');

  if (!musicToggle || !audio) return;

  // 播放/暂停切换
  musicToggle.addEventListener('click', () => {
    if (audio.paused) {
      if (window.currentMusicIndex === -1 && window.settings.musicList && window.settings.musicList.length > 0) {
        playMusic(0);
      } else {
        audio.play().catch(err => Logger.log('播放失败：' + err.message, 'ERROR'));
        musicToggle.innerHTML = '<i class="fa fa-pause"></i>';
      }
    } else {
      audio.pause();
      musicToggle.innerHTML = '<i class="fa fa-music"></i>';
    }
    renderMusicList();
  });

  // 自动播放下一首
  audio.addEventListener('ended', () => {
    if (window.settings.musicList && window.currentMusicIndex < window.settings.musicList.length - 1) {
      playMusic(window.currentMusicIndex + 1);
    } else if (window.settings.musicList && window.settings.musicList.length > 0) {
      playMusic(0);
    }
  });
}

// 缓存设置
function initCacheSettings() {
  const clearLogs = document.getElementById('clear-logs');
  const exportLogs = document.getElementById('export-logs');

  if (clearLogs) {
    clearLogs.addEventListener('click', () => {
      if (confirm('确定要清除所有日志吗？')) {
        Logger.clearLogs();
        Logger.renderLogs('logs-container');
      }
    });
  }

  if (exportLogs) {
    exportLogs.addEventListener('click', () => {
      Logger.exportLogs();
    });
  }
}

// 默认设置
const defaultSettings = {
  theme: 'light',
  bgPrimary: '#EFF6FF',
  bgSecondary: '#F8FAFC',
  textWelcome: '#1D4ED8',
  textTitle: '#1E3A8A',
  textContent: '#475569',
  accentColor: '#3B82F6',
  bgType: 'color',
  bgUrl: '',
  bgOpacity: 1,
  bgBlur: 0,
  vignetteOpacity: 0.1,
  particleEnabled: false,
  particleTypes: ['snow'],
  particleCount: 100,
  particleSize: 3,
  particleOpacity: 0.8,
  particleSpeed: 2,
  particleArea: 'full',
  particleZindex: 0,
  musicList: [
    {
      name: 'Neo Nqsi - 空のグラス (feat. Nqsi).mp3',
      url: 'assets/music/Neo Nqsi - 空のグラス (feat. Nqsi).mp3'
    }
  ],
  cacheEnabled: true,
  historyEnabled: true
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initAll);
