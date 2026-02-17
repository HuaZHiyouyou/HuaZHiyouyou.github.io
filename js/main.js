// ====================== 1. 本地存储核心功能 ======================
const STORAGE_KEY = 'my-homepage-settings';
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
  musicList: []
};

let settings = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSettings;
const root = document.documentElement;
let particles = [];
let animationId = null;
let currentMusicIndex = -1;
const audioElement = document.getElementById('audio-element');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas?.getContext('2d');

// 粒子类型配置
const particleTypesMap = {
  snow: { shape: 'circle', color: '#ffffff', speedY: 1, speedX: 0.5 },
  fire: { shape: 'circle', color: '#ff4500', speedY: -1, speedX: 0 },
  star: { shape: 'star', color: '#ffd700', speedY: 0.5, speedX: 0 },
  circle: { shape: 'circle', color: '#2563eb', speedY: 0.5, speedX: 0 }
};

// ====================== 2. 工具函数 提前定义，避免调用时报错 ======================
// 保存设置到本地
function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
  if (!musicList) return;

  if (settings.musicList.length === 0) {
    musicList.innerHTML = `<p class="text-xs opacity-70">上传的音乐将显示在这里</p>`;
    return;
  }

  musicList.innerHTML = settings.musicList.map((music, index) => `
    <div class="flex items-center gap-2 py-1 border-b border-opacity-20" style="border-color: var(--text-content);">
      <button class="music-play-btn text-sm" data-index="${index}" style="color: var(--accent-color);">
        <i class="fa fa-${index === currentMusicIndex && !audioElement.paused ? 'pause' : 'play'}"></i>
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
      if (index === currentMusicIndex && !audioElement.paused) {
        audioElement.pause();
        document.getElementById('music-toggle').innerHTML = '<i class="fa fa-play"></i>';
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
        audioElement.pause();
        currentMusicIndex = -1;
        if (musicTitle) musicTitle.innerText = '暂无播放音乐';
      }
      settings.musicList.splice(index, 1);
      saveSettings();
      renderMusicList();
    });
  });
}

// 播放音乐
function playMusic(index) {
  const musicTitle = document.getElementById('music-title');
  const musicToggle = document.getElementById('music-toggle');
  if (index < 0 || index >= settings.musicList.length || !audioElement || !musicTitle || !musicToggle) return;

  const music = settings.musicList[index];
  audioElement.src = music.url;
  audioElement.play().catch(err => console.log('播放失败：', err));
  currentMusicIndex = index;
  musicTitle.innerText = music.name;
  musicToggle.innerHTML = '<i class="fa fa-pause"></i>';
}

// 绘制星型粒子
function drawStar(x, y, size, opacity) {
  if (!ctx) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5;
    const xPos = x + size * Math.cos(angle);
    const yPos = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 初始化粒子
function initParticles() {
  if (!settings.particleEnabled || !canvas || !ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = [];

  for (let i = 0; i < settings.particleCount; i++) {
    const randomType = settings.particleTypes[Math.floor(Math.random() * settings.particleTypes.length)];
    const typeConfig = particleTypesMap[randomType] || particleTypesMap.snow;

    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * settings.particleSize + 0.5,
      speedX: (Math.random() - 0.5) * settings.particleSpeed * typeConfig.speedX,
      speedY: Math.random() * settings.particleSpeed * typeConfig.speedY,
      opacity: Math.random() * settings.particleOpacity + 0.1,
      type: randomType,
      config: typeConfig
    });
  }

  animateParticles();
}

// 更新粒子参数
function updateParticles() {
  if (!settings.particleEnabled) return;
  initParticles();
}

// 停止粒子动画
function stopParticles() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 粒子动画循环
function animateParticles() {
  if (!settings.particleEnabled || !canvas || !ctx) return;

  const heroSection = document.getElementById('home');
  const areaHeight = settings.particleArea === 'hero' && heroSection
    ? heroSection.offsetHeight + heroSection.offsetTop
    : canvas.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    // 绘制粒子
    ctx.globalAlpha = particle.opacity;
    if (particle.type === 'star') {
      drawStar(particle.x, particle.y, particle.size, particle.opacity);
    } else {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.config.color;
      ctx.fill();
    }

    // 更新位置
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    // 边界循环处理
    if (particle.type === 'fire') {
      if (particle.y < 0) {
        particle.y = areaHeight;
        particle.x = Math.random() * canvas.width;
      }
    } else {
      if (particle.y > areaHeight) {
        particle.y = 0;
        particle.x = Math.random() * canvas.width;
      }
    }

    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
  });

  animationId = requestAnimationFrame(animateParticles);
}

// ====================== 3. 主题样式应用 ======================
function applySettings() {
  // 应用CSS变量
  root.style.setProperty('--bg-primary', settings.bgPrimary);
  root.style.setProperty('--bg-secondary', settings.bgSecondary);
  root.style.setProperty('--text-welcome', settings.textWelcome);
  root.style.setProperty('--text-title', settings.textTitle);
  root.style.setProperty('--text-content', settings.textContent);
  root.style.setProperty('--accent-color', settings.accentColor);
  root.style.setProperty('--bg-opacity', settings.bgOpacity);
  root.style.setProperty('--bg-blur', settings.bgBlur + 'px');
  root.style.setProperty('--vignette-opacity', settings.vignetteOpacity);
  root.style.setProperty('--particle-z-index', settings.particleZindex);

  // 处理半透明背景的RGB值
  const bgRgb = hexToRgb(settings.bgPrimary);
  const header = document.querySelector('header');
  const musicPlayer = document.getElementById('music-player');
  const settingsPanel = document.getElementById('settings-panel');

  if (header) header.style.backgroundColor = `rgba(${bgRgb}, 0.8)`;
  if (musicPlayer) musicPlayer.style.backgroundColor = `rgba(${bgRgb}, 0.9)`;
  if (settingsPanel) settingsPanel.style.backgroundColor = settings.bgPrimary;

  // 应用背景
  const bgContainer = document.getElementById('bg-container');
  if (bgContainer) {
    bgContainer.innerHTML = '';
    if (settings.bgType === 'color') {
      bgContainer.innerHTML = `<div id="bg-default"></div>`;
    } else if (settings.bgType === 'image' && settings.bgUrl) {
      bgContainer.innerHTML = `<img src="${settings.bgUrl}" class="bg-media" alt="背景图" />`;
    } else if (settings.bgType === 'video' && settings.bgUrl) {
      bgContainer.innerHTML = `<video src="${settings.bgUrl}" class="bg-media" autoplay loop muted playsinline></video>`;
    }
  }

  // 应用粒子开关
  const particleToggle = document.getElementById('particle-toggle');
  if (particleToggle) {
    particleToggle.innerText = settings.particleEnabled ? '关闭粒子效果' : '开启粒子效果';
  }
  if (settings.particleEnabled) {
    initParticles();
  } else {
    stopParticles();
  }

  // 渲染音乐列表
  renderMusicList();
}

// ====================== 4. 功能初始化函数 ======================
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

    input.value = settings[settingKey];
    input.addEventListener('input', (e) => {
      settings[settingKey] = e.target.value;
      applySettings();
      saveSettings();
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

    input.value = settings[settingKey];
    input.addEventListener('input', (e) => {
      settings[settingKey] = parseFloat(e.target.value);
      applySettings();
      saveSettings();
      if (settings.particleEnabled) updateParticles();
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
    saveSettings();
    initColorInputs();
  });

  darkBtn.addEventListener('click', () => {
    settings.theme = 'dark';
    settings.bgPrimary = '#0f172a';
    settings.bgSecondary = '#1e293b';
    settings.textWelcome = '#3b82f6';
    settings.textTitle = '#f8fafc';
    settings.textContent = '#cbd5e1';
    applySettings();
    saveSettings();
    initColorInputs();
  });
}

// 背景设置
function initBgSettings() {
  const bgTypeSelect = document.getElementById('bg-type');
  const bgUpload = document.getElementById('bg-upload');
  const bgUploadContainer = document.getElementById('bg-upload-container');
  if (!bgTypeSelect || !bgUpload || !bgUploadContainer) return;

  bgTypeSelect.value = settings.bgType;
  bgUploadContainer.style.display = settings.bgType === 'color' ? 'none' : 'block';

  bgTypeSelect.addEventListener('change', (e) => {
    settings.bgType = e.target.value;
    bgUploadContainer.style.display = settings.bgType === 'color' ? 'none' : 'block';
    applySettings();
    saveSettings();
  });

  bgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      settings.bgUrl = event.target.result;
      applySettings();
      saveSettings();
    };
    reader.readAsDataURL(file);
  });
}

// 设置面板控制
function initSettingsPanel() {
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsClose = document.getElementById('settings-close');
  const settingsPanel = document.getElementById('settings-panel');
  const settingsReset = document.getElementById('settings-reset');
  if (!settingsToggle || !settingsClose || !settingsPanel || !settingsReset) return;

  settingsToggle.addEventListener('click', () => {
    settingsPanel.style.transform = 'translateX(0)';
  });

  settingsClose.addEventListener('click', () => {
    settingsPanel.style.transform = 'translateX(100%)';
  });

  settingsReset.addEventListener('click', () => {
    if (confirm('确定要重置所有设置吗？')) {
      settings = JSON.parse(JSON.stringify(defaultSettings));
      saveSettings();
      applySettings();
      initColorInputs();
      initRangeInputs();
    }
  });
}

// 内置小功能实现
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
    });
  }

  // 吃什么
  const foodBtn = document.getElementById('food-btn');
  const foodResult = document.getElementById('food-result');
  const foodList = ['火锅', '烧烤', '麻辣烫', '螺蛳粉', '汉堡', '披萨', '拉面', '炒饭', '饺子', '包子', '炸鸡', '寿司', '烤肉', '冒菜', '香锅'];

  if (foodBtn && foodResult) {
    foodBtn.addEventListener('click', () => {
      foodResult.innerText = foodList[Math.floor(Math.random() * foodList.length)];
    });
  }

  // 喝什么
  const drinkBtn = document.getElementById('drink-btn');
  const drinkResult = document.getElementById('drink-result');
  const drinkList = ['奶茶', '咖啡', '可乐', '果汁', '柠檬水', '茶', '酸奶', '啤酒', '气泡水', '果茶', '牛奶', '矿泉水'];

  if (drinkBtn && drinkResult) {
    drinkBtn.addEventListener('click', () => {
      drinkResult.innerText = drinkList[Math.floor(Math.random() * drinkList.length)];
    });
  }
}

// 音乐播放器初始化
function initMusicPlayer() {
  const musicUpload = document.getElementById('music-upload');
  const musicToggle = document.getElementById('music-toggle');
  if (!musicUpload || !musicToggle || !audioElement) return;

  // 音乐上传
  musicUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('audio/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        settings.musicList.push({
          name: file.name,
          url: event.target.result
        });
        saveSettings();
        renderMusicList();
      };
      reader.readAsDataURL(file);
    });
  });

  // 播放/暂停切换
  musicToggle.addEventListener('click', () => {
    if (audioElement.paused) {
      if (currentMusicIndex === -1 && settings.musicList.length > 0) {
        playMusic(0);
      } else {
        audioElement.play().catch(err => console.log('播放失败：', err));
        musicToggle.innerHTML = '<i class="fa fa-pause"></i>';
      }
    } else {
      audioElement.pause();
      musicToggle.innerHTML = '<i class="fa fa-play"></i>';
    }
    renderMusicList();
  });

  // 自动播放下一首
  audioElement.addEventListener('ended', () => {
    if (currentMusicIndex < settings.musicList.length - 1) {
      playMusic(currentMusicIndex + 1);
    } else {
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
        <a href="${repo.html_url}" target="_blank" class="p-6 rounded-2xl shadow-lg transition-all hover:scale-105 group card-bg">
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
    })
    .catch(err => {
      reposContainer.innerHTML = `<p class="col-span-full text-center text-content">仓库获取失败</p>`;
    });
}

// 粒子设置初始化
function initParticleSettings() {
  const particleToggle = document.getElementById('particle-toggle');
  const particleTypeBtns = document.querySelectorAll('.particle-type-btn');
  const particleAreaSelect = document.getElementById('particle-area');
  const particleZindexSelect = document.getElementById('particle-zindex');

  // 粒子开关
  if (particleToggle) {
    particleToggle.addEventListener('click', () => {
      settings.particleEnabled = !settings.particleEnabled;
      applySettings();
      saveSettings();
    });
  }

  // 粒子类型选择
  particleTypeBtns.forEach(btn => {
    const type = btn.dataset.type;
    if (!type) return;

    if (settings.particleTypes.includes(type)) {
      btn.classList.add('btn-accent');
      btn.style.color = 'white';
    }

    btn.addEventListener('click', () => {
      if (settings.particleTypes.includes(type)) {
        settings.particleTypes = settings.particleTypes.filter(t => t !== type);
        btn.classList.remove('btn-accent');
        btn.style.color = 'var(--accent-color)';
      } else {
        settings.particleTypes.push(type);
        btn.classList.add('btn-accent');
        btn.style.color = 'white';
      }
      if (settings.particleEnabled) updateParticles();
      saveSettings();
    });
  });

  // 粒子区域
  if (particleAreaSelect) {
    particleAreaSelect.value = settings.particleArea;
    particleAreaSelect.addEventListener('change', (e) => {
      settings.particleArea = e.target.value;
      if (settings.particleEnabled) updateParticles();
      saveSettings();
    });
  }

  // 粒子层级
  if (particleZindexSelect) {
    particleZindexSelect.value = settings.particleZindex;
    particleZindexSelect.addEventListener('change', (e) => {
      settings.particleZindex = e.target.value;
      applySettings();
      saveSettings();
    });
  }

  // 窗口大小变化重置画布
  window.addEventListener('resize', () => {
    if (settings.particleEnabled && canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateParticles();
    }
  });

  // 页面隐藏时暂停动画，优化内存
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      const bgVideo = document.querySelector('.bg-media video');
      if (bgVideo) bgVideo.pause();
    } else {
      if (settings.particleEnabled) animateParticles();
      const bgVideo = document.querySelector('.bg-media video');
      if (bgVideo) bgVideo.play();
    }
  });
}

// ====================== 5. 页面加载完成后执行所有初始化 ======================
window.addEventListener('DOMContentLoaded', () => {
  // 先应用设置
  applySettings();
  // 再初始化所有功能
  initColorInputs();
  initRangeInputs();
  initThemeButtons();
  initBgSettings();
  initSettingsPanel();
  initBuiltInFeatures();
  initMusicPlayer();
  fetchUserRepos();
  initParticleSettings();
});