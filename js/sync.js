// ====================== 跨页面同步模块 ======================
class PageSync {
  constructor() {
    this.CHANNEL_NAME = 'huazhiyouyou_sync';
    this.channel = null;
    this.isManage = window.location.pathname.includes('manage.html');
    
    this.init();
  }

  init() {
    try {
      // 创建 BroadcastChannel
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
      
      // 监听消息
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      Logger.log(`跨页面同步模块已初始化 (${this.isManage ? '管理面板' : '主页面'})`, 'INFO');
    } catch (error) {
      Logger.log(`BroadcastChannel 不支持: ${error.message}`, 'WARN');
      // 降级方案：使用 storage 事件
      this.initStorageFallback();
    }
  }

  // 发送消息
  send(type, data) {
    if (this.channel) {
      this.channel.postMessage({
        type: type,
        data: data,
        timestamp: Date.now(),
        source: this.isManage ? 'manage' : 'index'
      });
    }
    
    // 同时保存到 localStorage 以支持降级方案
    this.saveToStorage(type, data);
  }

  // 处理接收到的消息
  handleMessage(message) {
    const { type, data, source } = message;
    
    // 忽略自己发送的消息
    if (source === (this.isManage ? 'manage' : 'index')) {
      return;
    }

    Logger.log(`收到同步消息: ${type} from ${source}`, 'DEBUG');

    switch (type) {
      case 'theme_change':
        this.applyTheme(data.theme);
        break;
      case 'accent_color_change':
        this.applyAccentColor(data.color);
        break;
      case 'particle_toggle':
        this.applyParticleToggle(data.enabled);
        break;
      case 'marquee_toggle':
        this.applyMarqueeToggle(data.enabled);
        break;
      case 'emo_toggle':
        this.applyEmoToggle(data.enabled);
        break;
      case 'theme_settings_change':
        this.applyThemeSettings(data);
        break;
      case 'content_data_change':
        this.applyContentData(data);
        break;
      case 'refresh_page':
        // 直接刷新页面
        window.location.reload();
        break;
    }
  }

  // 保存到 localStorage（降级方案）
  saveToStorage(type, data) {
    const storageKey = `sync_${type}`;
    localStorage.setItem(storageKey, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
  }

  // 初始化降级方案（监听 storage 事件）
  initStorageFallback() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('sync_')) {
        try {
          const type = event.key.replace('sync_', '');
          const { data } = JSON.parse(event.newValue);
          this.handleMessage({ type, data, source: 'storage' });
        } catch (error) {
          Logger.log(`处理 storage 事件失败: ${error.message}`, 'ERROR');
        }
      }
    });
  }

  // 应用主题
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
    localStorage.setItem('theme', theme);
    Logger.log(`主题已同步为: ${theme}`, 'INFO');
  }

  // 应用强调色
  applyAccentColor(color) {
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('accentColor', color);
    
    // 更新颜色值显示
    const colorValueElement = document.getElementById('color-value');
    if (colorValueElement) {
      colorValueElement.textContent = color;
    }
    Logger.log(`强调色已同步为: ${color}`, 'INFO');
  }

  // 应用粒子效果开关
  applyParticleToggle(enabled) {
    if (window.Particles) {
      if (enabled) {
        window.Particles.start();
        Logger.log('粒子系统已启动', 'INFO');
      } else {
        window.Particles.stop();
        Logger.log('粒子系统已停止', 'INFO');
      }
    }
    
    // 更新粒子按钮状态（在index.html中）
    const particleBtn = document.getElementById('particle-btn');
    if (particleBtn) {
      if (enabled) {
        particleBtn.classList.add('active');
        particleBtn.title = '粒子效果: 雪花';
        particleBtn.style.color = '';
        // 更新图标为雪花
        const icon = particleBtn.querySelector('i');
        if (icon) {
          icon.className = 'fa fa-snowflake-o';
        }
      } else {
        particleBtn.classList.remove('active');
        particleBtn.title = '粒子效果: 已关闭';
        particleBtn.style.color = 'var(--text-muted)';
      }
    }
    
    // 更新粒子开关状态（在manage.html中）
    const particleToggle = document.getElementById('particle-toggle');
    if (particleToggle) {
      particleToggle.checked = enabled;
    }
    
    Logger.log(`粒子效果已同步为: ${enabled ? '启用' : '禁用'}`, 'INFO');
  }

  // 应用跑马灯开关
  applyMarqueeToggle(enabled) {
    // 更新跑马灯开关状态（在manage.html中）
    const marqueeToggle = document.getElementById('marquee-toggle');
    if (marqueeToggle) {
      marqueeToggle.checked = enabled;
    }
    Logger.log(`跑马灯已同步为: ${enabled ? '启用' : '禁用'}`, 'INFO');
  }

  // 应用 Emo 模式开关
  applyEmoToggle(enabled) {
    // 更新Emo模式开关状态（在manage.html中）
    const emoToggle = document.getElementById('emo-toggle');
    if (emoToggle) {
      emoToggle.checked = enabled;
    }
    Logger.log(`Emo模式已同步为: ${enabled ? '启用' : '禁用'}`, 'INFO');
  }

  // 应用完整主题设置
  applyThemeSettings(settings) {
    // 应用全局主题（黑白主题）
    if (settings.globalTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('theme-image', 'theme-pink', 'theme-paper');
    } else if (settings.globalTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('theme-image', 'theme-pink', 'theme-paper');
    } else if (settings.globalTheme === 'image') {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.add('theme-image');
      document.body.classList.remove('theme-pink', 'theme-paper');
    } else if (settings.globalTheme === 'pink') {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.add('theme-pink');
      document.body.classList.remove('theme-image', 'theme-paper');
    } else if (settings.globalTheme === 'paper') {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.add('theme-paper');
      document.body.classList.remove('theme-image', 'theme-pink');
    }

    // 应用强调色
    if (settings.customColor) {
      document.documentElement.style.setProperty('--accent', settings.customColor);
      document.documentElement.style.setProperty('--accent-light', this.adjustColorOpacity(settings.customColor, 0.6));
      document.documentElement.style.setProperty('--accent-glow', this.adjustColorOpacity(settings.customColor, 0.25));
    }

    // 应用毛玻璃效果
    const glassIntensity = settings.glassIntensity || 6;
    document.documentElement.style.setProperty('--glass-blur', `${glassIntensity}px`);

    // 获取卡片效果设置
    const cardEffects = settings.cardEffects || {
      github: { glass: true, shadow: true },
      about: { glass: true, shadow: true },
      repo: { glass: true, shadow: true },
      log: { glass: true, shadow: true },
      contributor: { glass: true, shadow: true }
    };

    // 应用GitHub统计卡片效果
    const githubCards = document.querySelectorAll('.github-stats-card');
    githubCards.forEach(card => {
      this.applyCardEffect(card, cardEffects.github, settings, glassIntensity);
    });

    // 应用关于卡片效果
    const aboutCards = document.querySelectorAll('.about-card, .about-timeline-card');
    aboutCards.forEach(card => {
      this.applyCardEffect(card, cardEffects.about, settings, glassIntensity);
    });

    // 应用项目卡片效果
    const repoCards = document.querySelectorAll('.repo-card');
    repoCards.forEach(card => {
      this.applyCardEffect(card, cardEffects.repo, settings, glassIntensity);
    });

    // 应用日志卡片效果
    const logCards = document.querySelectorAll('.log-card');
    logCards.forEach(card => {
      this.applyCardEffect(card, cardEffects.log, settings, glassIntensity);
    });

    // 应用贡献者卡片效果
    const contributorCards = document.querySelectorAll('.contributor-card');
    contributorCards.forEach(card => {
      this.applyCardEffect(card, cardEffects.contributor, settings, glassIntensity);
    });

    // 应用粒子效果
    if (window.Particles) {
      if (settings.particleEffect) {
        window.Particles.start();
      } else {
        window.Particles.stop();
      }
    }

    // 应用动画
    if (!settings.animations) {
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
      });
    } else {
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.transition = '';
      });
    }

    // 保存到本地存储
    localStorage.setItem('themeSettings', JSON.stringify(settings));
    Logger.log(`主题设置已同步: ${JSON.stringify(settings).substring(0, 50)}...`, 'INFO');
  }

  // 应用单个卡片效果
  applyCardEffect(card, cardEffect, globalSettings, glassIntensity) {
    if (!cardEffect) return;
    
    // 毛玻璃效果（通过类名控制）
    card.classList.toggle('card-glass', globalSettings.glassEffect && cardEffect.glass);
    
    // 透明背景（通过类名控制）
    card.classList.toggle('card-transparent', globalSettings.transparentCards);
    
    // 阴影效果（通过类名控制）
    card.classList.toggle('card-shadow', globalSettings.shadowEffect && cardEffect.shadow);
  }

  // 调整颜色透明度
  adjustColorOpacity(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // 应用内容数据（从管理面板同步到首页）
  applyContentData(data) {
    // 保存到本地存储
    localStorage.setItem('adminData', JSON.stringify(data));

    // 调用页面上的渲染函数
    if (typeof window.renderAdminData === 'function') {
      window.renderAdminData(data);
    }

    Logger.log('内容数据已同步更新', 'INFO');
  }

  // 十六进制转RGB
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // 通知其他页面刷新
  notifyRefresh() {
    this.send('refresh_page', {});
  }
}

// 创建全局单例
window.PageSync = new PageSync();