// ====================== 主逻辑模块 - 整合所有功能 ======================
let settings = Cache.getSettings();

// 应用设置
function applySettings() {
  // 应用CSS变量
  document.documentElement.style.setProperty('--bg-primary', settings.bgPrimary || '#ffffff');
  document.documentElement.style.setProperty('--bg-secondary', settings.bgSecondary || '#f5f5f5');
  document.documentElement.style.setProperty('--text-welcome', settings.textWelcome || '#2563eb');
  document.documentElement.style.setProperty('--text-title', settings.textTitle || '#1a1a1a');
  document.documentElement.style.setProperty('--text-content', settings.textContent || '#4a4a4a');
  document.documentElement.style.setProperty('--accent-color', settings.accentColor || '#2563eb');
  document.documentElement.style.setProperty('--bg-opacity', settings.bgOpacity || 1);
  document.documentElement.style.setProperty('--bg-blur', (settings.bgBlur || 0) + 'px');
  document.documentElement.style.setProperty('--vignette-opacity', settings.vignetteOpacity || 0);
  document.documentElement.style.setProperty('--particle-z-index', settings.particleZindex || 0);

  // 处理半透明背景的RGB值
  const bgRgb = hexToRgb(settings.bgPrimary || '#ffffff');
  const header = document.querySelector('header');
  if (header) header.style.backgroundColor = `rgba(${bgRgb}, 0.9)`;

  // 应用背景
  const bgContainer = document.getElementById('bg-container');
  if (bgContainer) {
    bgContainer.innerHTML = '';
    if (settings.bgType === 'color') {
      bgContainer.innerHTML = `<div id="bg-default"></div>`;
    } else if (settings.bgType === 'image' && settings.bgUrl) {
      // 优先从本地缓存读取
      const cachedFile = Cache.getFile(`image_${settings.bgUrl.split('/').pop()}`);
      const url = cachedFile ? cachedFile.data : settings.bgUrl;
      bgContainer.innerHTML = `<img src="${url}" class="bg-media" alt="背景图" />`;
    } else if (settings.bgType === 'video' && settings.bgUrl) {
      // 优先从本地缓存读取
      const cachedFile = Cache.getFile(`video_${settings.bgUrl.split('/').pop()}`);
      const url = cachedFile ? cachedFile.data : settings.bgUrl;
      bgContainer.innerHTML = `<video src="${url}" class="bg-media" autoplay loop muted playsinline></video>`;
    }
  }

  // 应用粒子设置
  if (Particles) {
    Particles.updateSettings({
      types: settings.particleTypes || ['snow'],
      count: settings.particleCount || 100,
      size: settings.particleSize || 3,
      opacity: settings.particleOpacity || 0.8,
      speed: settings.particleSpeed || 2,
      area: settings.particleArea || 'full',
      zIndex: settings.particleZindex || 0
    });

    if (settings.particleEnabled) {
      Particles.start();
    } else {
      Particles.stop();
    }
  }

  // 渲染音乐列表
  renderMusicList();

  // 保存设置到缓存
  Cache.saveSettings(settings);
}

// 十六进制转RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// 渲染音乐列表
function renderMusicList() {
  const musicList = document.getElementById('music-list');
  const musicTitle = document.getElementById('music-title');
  const audio = document.getElementById('audio-element');
  const musicToggle = document.getElementById('music-toggle');

  if (!musicList) return;

  if (!settings.musicList || settings.musicList.length === 0) {
    musicList.innerHTML = `<p class="text-xs opacity-70">上传的音乐将显示在这里</p>`;
    return;
  }

  musicList.innerHTML = settings.musicList.map((music, index) => `
    <div class="flex items-center gap-2 py-1 border-b border-opacity-20" style="border-color: var(--text-content);">
      <button class="music-play-btn text-sm" data-index="${index}" style="color: var(--accent-color);">
        <i class="fa fa-${index === currentMusicIndex && !audio?.paused ? 'pause' : 'play'}"></i>
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
      if (index === currentMusicIndex && !audio?.paused) {
        audio?.pause();
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
      if (index === currentMusicIndex) {
        audio?.pause();
        currentMusicIndex = -1;
        if (musicTitle) musicTitle.innerText = '暂无播放音乐';
        if (musicToggle) musicToggle.innerHTML = '<i class="fa fa-music"></i>';
      }
      settings.musicList.splice(index, 1);
      Cache.saveSettings(settings);
      renderMusicList();
      Logger.log('音乐已删除', 'INFO');
    });
  });
}

// 播放音乐
function playMusic(index) {
  const musicTitle = document.getElementById('music-title');
  const musicToggle = document.getElementById('music-toggle');
  const audio = document.getElementById('audio-element');

  if (index < 0 || !settings.musicList || index >= settings.musicList.length || !audio || !musicTitle || !musicToggle) return;

  const music = settings.musicList[index];
  // 优先从本地缓存读取
  const cachedFile = Cache.getFile(`music_${music.name}`);
  audio.src = cachedFile ? cachedFile.data : music.url;
  audio.play().catch(err => {
    console.log('播放失败：', err);
    Logger.log('音乐播放失败: ' + err.message, 'ERROR');
  });
  currentMusicIndex = index;
  musicTitle.innerText = music.name;
  musicToggle.innerHTML = '<i class="fa fa-pause"></i>';
  Logger.log(`正在播放: ${music.name}`, 'INFO');
}

// 初始化所有功能
function initAll() {
  // 应用保存的设置
  applySettings();

  // 初始化颜色输入框
  initColorInputs();

  // 初始化滑块输入框
  initRangeInputs();

  // 初始化主题按钮
  initThemeButtons();

  // 初始化背景设置
  initBgSettings();

  // 初始化设置面板
  initSettingsPanelControls();

  // 初始化内置小工具
  initBuiltInFeatures();

  // 初始化音乐播放器
  initMusicPlayerControls();

  // 获取GitHub仓库
  fetchUserRepos();

  // 初始化粒子设置
  initParticleSettingsControls();

  // 初始化缓存设置
  initCacheSettings();

  // 渲染新闻和更新
  UI.renderNews();
  UI.renderUpdates();

  // 渲染日志
  Logger.renderLogs('logs-container');

  Logger.log('网站所有功能初始化完成', 'INFO');
}

// 颜色输入框绑定
function initColorInputs() {
  const colorInputs = {
    'bg-primary-input': 'bgPrimary',
    'bg-secondary-input': 'bgSecondary',
    'text-welcome-input': 'textWelcome',
    'text-title-input': 'textTitle',
    'text-content-input': 'textContent',
    'accent-color-input': 'accentColor'
  };

  Object.keys(colorInputs).forEach(inputId => {
    const input = document.getElementById(inputId);
    const settingKey = colorInputs[inputId];
    if (!input) return;

    input.value = settings[settingKey] || (settingKey.includes('bg') ? '#ffffff' : settingKey.includes('text') ? '#1a1a1a' : '#2563eb');
    input.addEventListener('input', (e) => {
      settings[settingKey] = e.target.value;
      applySettings();
    });
  });
}

// 滑块输入框绑定
function initRangeInputs() {
  const rangeInputs = {
    'bg-opacity-input': 'bgOpacity',
    'bg-blur-input': 'bgBlur',
    'vignette-input': 'vignetteOpacity',
    'particle-count': 'particleCount',
    'particle-size': 'particleSize',
    'particle-opacity': 'particleOpacity',
    'particle-speed': 'particleSpeed'
  };

  Object.keys(rangeInputs).forEach(inputId => {
    const input = document.getElementById(inputId);
    const settingKey = rangeInputs[inputId];
    if (!input) return;

    input.value = settings[settingKey] !== undefined ? settings[settingKey] : input.defaultValue;
    input.addEventListener('input', (e) => {
      settings[settingKey] = parseFloat(e.target.value);
      applySettings();
    });
  });
}

// 主题模式切换
function initThemeButtons() {
  const lightBtn = document.getElementById('theme-light');
  const darkBtn = document.getElementById('theme-dark');
  if (!lightBtn || !darkBtn) return;

  lightBtn.addEventListener('click', () => {
    settings.theme = 'light';
    settings.bgPrimary = '#ffffff';
    settings.bgSecondary = '#f5f5f5';
    settings.textWelcome = '#2563eb';
    settings.textTitle = '#1a1a1a';
    settings.textContent = '#4a4a4a';
    applySettings();
    initColorInputs();
    Logger.log('切换到浅色主题', 'INFO');
  });

  darkBtn.addEventListener('click', () => {
    settings.theme = 'dark';
    settings.bgPrimary = '#0f172a';
    settings.bgSecondary = '#1e293b';
    settings.textWelcome = '#3b82f6';
    settings.textTitle = '#f8fafc';
    settings.textContent = '#cbd5e1';
    applySettings();
    initColorInputs();
    Logger.log('切换到深色主题', 'INFO');
  });
}

// 背景设置
function initBgSettings() {
  const bgTypeSelect = document.getElementById('bg-type');
  const bgUpload = document.getElementById('bg-upload');
  const bgUploadContainer = document.getElementById('bg-upload-container');
  if (!bgTypeSelect || !bgUpload || !bgUploadContainer) return;

  bgTypeSelect.value = settings.bgType || 'color';
  bgUploadContainer.style.display = settings.bgType === 'color' ? 'none' : 'block';

  bgTypeSelect.addEventListener('change', (e) => {
    settings.bgType = e.target.value;
    bgUploadContainer.style.display = settings.bgType === 'color' ? 'none' : 'block';
    applySettings();
  });

  bgUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 优先保存到本地缓存
    const fileType = settings.bgType === 'image' ? 'image' : 'video';
    const cachedFile = await Cache.saveFile(file, fileType);
    if (cachedFile) {
      settings.bgUrl = cachedFile.data;
      applySettings();
      Logger.log(`背景已设置: ${file.name}`, 'INFO');
    }
  });
}

// 设置面板控制
function initSettingsPanelControls() {
  const settingsReset = document.getElementById('settings-reset');
  if (settingsReset) {
    settingsReset.addEventListener('click', () => {
      if (confirm('确定要重置所有设置吗？')) {
        settings = JSON.parse(JSON.stringify(defaultSettings));
        Cache.saveSettings(settings);
        applySettings();
        initColorInputs();
        initRangeInputs();
        Logger.log('所有设置已重置', 'INFO');
      }
    });
  }
}

// 内置小功能
function initBuiltInFeatures() {
  // 今日运势
  const fortuneBtn = document.getElementById('fortune-btn');
  const fortuneContent = document.getElementById('fortune-content');
  const fortuneList = [
    '今日运势超棒，万事顺意，大胆去做你想做的事吧！',
    '今日财运亨通，可能会有意外的小收获哦~',
    '今日宜学习，效率拉满，能轻松掌握新的知识',
    '今日宜摸鱼，劳逸结合，放松身心才是王道',
    '今日贵人运在线，遇到困难会有人出手相助',
    '今日桃花运旺盛，可能会遇到心动的人',
    '今日宜出门，会遇到美好的小惊喜',
    '今日宜居家，好好休息，给自己充个电'
  ];

  const getTodayFortune = () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a,b) => {a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    return fortuneList[Math.abs(seed) % fortuneList.length];
  };

  if (fortuneBtn && fortuneContent) {
    fortuneBtn.addEventListener('click', () => {
      fortuneContent.innerHTML = `<p>${getTodayFortune()}</p>`;
      Logger.log('抽取了今日运势', 'INFO');
    });
  }

  // 吃什么
  const foodBtn = document.getElementById('food-btn');
  const foodResult = document.getElementById('food-result');
  const foodList = ['火锅', '烧烤', '麻辣烫', '螺蛳粉', '汉堡', '披萨', '拉面', '炒饭', '饺子', '包子', '炸鸡', '寿司', '烤肉', '冒菜', '香锅'];

  if (foodBtn && foodResult) {
    foodBtn.addEventListener('click', () => {
      foodResult.innerText = foodList[Math.floor(Math.random() * foodList.length)];
      Logger.log('决定了吃什么', 'INFO');
    });
  }

  // 喝什么
  const drinkBtn = document.getElementById('drink-btn');
  const drinkResult = document.getElementById('drink-result');
  const drinkList = ['奶茶', '咖啡', '可乐', '果汁', '柠檬水', '茶', '酸奶', '啤酒', '气泡水', '果茶', '牛奶', '矿泉水'];

  if (drinkBtn && drinkResult) {
    drinkBtn.addEventListener('click', () => {
      drinkResult.innerText = drinkList[Math.floor(Math.random() * drinkList.length)];
      Logger.log('决定了喝什么', 'INFO');
    });
  }
}

// 音乐播放器控制
function initMusicPlayerControls() {
  const musicToggle = document.getElementById('music-toggle');
  const audio = document.getElementById('audio-element');
  const musicTitle = document.getElementById('music-title');

  if (!musicToggle || !audio) return;

  // 播放/暂停切换
  musicToggle.addEventListener('click', () => {
    if (audio.paused) {
      if (currentMusicIndex === -1 && settings.musicList && settings.musicList.length > 0) {
        playMusic(0);
      } else {
        audio.play().catch(err => Logger.log('播放失败: ' + err.message, 'ERROR'));
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
    if (settings.musicList && currentMusicIndex < settings.musicList.length - 1) {
      playMusic(currentMusicIndex + 1);
    } else if (settings.musicList && settings.musicList.length > 0) {
      playMusic(0);
    }
  });
}

// GitHub仓库获取
function fetchUserRepos() {
  const GITHUB_USERNAME = 'HuaZHiyouyou';
  const reposContainer = document.getElementById('repos-container');
  if (!reposContainer) return;

  fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`)
    .then(res => res.json())
    .then(repos => {
      if (!Array.isArray(repos) || repos.length === 0) {
        reposContainer.innerHTML = `
          <div class="col-span-full p-6 rounded-2xl text-center card-bg">
            <p class="text-content">暂无公开仓库</p>
          </div>
        `;
        return;
      }

      reposContainer.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" target="_blank" class="p-6 rounded-2xl shadow-lg transition-all hover:scale-105 card-bg">
          <h3 class="text-xl font-bold mb-2 group-hover:underline transition-all card-title">${repo.name}</h3>
          <p class="mb-4 line-clamp-2 min-h-[40px] text-content">${repo.description || '暂无描述'}</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="flex items-center gap-1 text-content">
              <i class="fa fa-star"></i> ${repo.stargazers_count}
            </span>
            <span class="flex items-center gap-1 text-content">
              <i class="fa fa-code-fork"></i> ${repo.forks_count}
            </span>
            <span class="ml-auto icon-accent">
              <i class="fa fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </span>
          </div>
        </a>
      `).join('');

      Logger.log('GitHub仓库获取成功', 'INFO');
    })
    .catch(err => {
      reposContainer.innerHTML = `<p class="col-span-full text-center text-content">仓库获取失败</p>`;
      Logger.log('GitHub仓库获取失败: ' + err.message, 'ERROR');
    });
}

// 粒子设置控制
function initParticleSettingsControls() {
  const particleToggle = document.getElementById('particle-toggle');
  const particleTypeBtns = document.querySelectorAll('.particle-type-btn');
  const particleAreaSelect = document.getElementById('particle-area');
  const particleZindexSelect = document.getElementById('particle-zindex');

  // 粒子开关
  if (particleToggle) {
    particleToggle.innerText = settings.particleEnabled ? '关闭粒子效果' : '开启粒子效果';
    particleToggle.addEventListener('click', () => {
      settings.particleEnabled = !settings.particleEnabled;
      particleToggle.innerText = settings.particleEnabled ? '关闭粒子效果' : '开启粒子效果';
      applySettings();
    });
  }

  // 粒子类型选择
  particleTypeBtns.forEach(btn => {
    const type = btn.dataset.type;
    if (!type) return;

    if (settings.particleTypes && settings.particleTypes.includes(type)) {
      btn.classList.add('btn-accent');
      btn.style.color = 'white';
    }

    btn.addEventListener('click', () => {
      if (!settings.particleTypes) settings.particleTypes = [];

      if (settings.particleTypes.includes(type)) {
        settings.particleTypes = settings.particleTypes.filter(t => t !== type);
        btn.classList.remove('btn-accent');
        btn.style.color = 'var(--accent-color)';
      } else {
        settings.particleTypes.push(type);
        btn.classList.add('btn-accent');
        btn.style.color = 'white';
      }

      applySettings();
    });
  });

  // 粒子区域
  if (particleAreaSelect) {
    particleAreaSelect.value = settings.particleArea || 'full';
    particleAreaSelect.addEventListener('change', (e) => {
      settings.particleArea = e.target.value;
      applySettings();
    });
  }

  // 粒子层级
  if (particleZindexSelect) {
    particleZindexSelect.value = settings.particleZindex || 0;
    particleZindexSelect.addEventListener('change', (e) => {
      settings.particleZindex = e.target.value;
      applySettings();
    });
  }
}

// 缓存设置
function initCacheSettings() {
  const cacheEnabled = document.getElementById('cache-enabled');
  const historyEnabled = document.getElementById('history-enabled');
  const clearCache = document.getElementById('clear-cache');
  const clearLogs = document.getElementById('clear-logs');
  const exportLogs = document.getElementById('export-logs');

  if (cacheEnabled) {
    cacheEnabled.checked = settings.cacheEnabled !== false;
    cacheEnabled.addEventListener('change', (e) => {
      settings.cacheEnabled = e.target.checked;
      Cache.enabled = e.target.checked;
      Cache.saveSettings(settings);
      Logger.log(`缓存已${e.target.checked ? '启用' : '禁用'}`, 'INFO');
    });
  }

  if (historyEnabled) {
    historyEnabled.checked = settings.historyEnabled !== false;
    historyEnabled.addEventListener('change', (e) => {
      settings.historyEnabled = e.target.checked;
      Cache.historyEnabled = e.target.checked;
      Cache.saveSettings(settings);
      Logger.log(`浏览痕迹已${e.target.checked ? '启用' : '禁用'}`, 'INFO');
    });
  }

  if (clearCache) {
    clearCache.addEventListener('click', () => {
      if (confirm('确定要清除所有缓存吗？这将删除所有保存的设置、文件和浏览痕迹。')) {
        Cache.clearAll();
        settings = JSON.parse(JSON.stringify(defaultSettings));
        applySettings();
        initColorInputs();
        initRangeInputs();
      }
    });
  }

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
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  textWelcome: '#2563eb',
  textTitle: '#1a1a1a',
  textContent: '#4a4a4a',
  accentColor: '#2563eb',
  bgType: 'color',
  bgUrl: '',
  bgOpacity: 1,
  bgBlur: 0,
  vignetteOpacity: 0,
  particleEnabled: false,
  particleTypes: ['snow'],
  particleCount: 100,
  particleSize: 3,
  particleOpacity: 0.8,
  particleSpeed: 2,
  particleArea: 'full',
  particleZindex: 0,
  musicList: [],
  cacheEnabled: true,
  historyEnabled: true
};

// 全局变量
let currentMusicIndex = -1;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initAll);