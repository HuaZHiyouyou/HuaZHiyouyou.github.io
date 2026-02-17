// ====================== 优化后的粒子系统模块 ======================
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas?.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.enabled = false;
    this.settings = {
      types: ['snow'],
      count: 100,
      size: 3,
      opacity: 0.8,
      speed: 2,
      area: 'full',
      zIndex: 0
    };

    this.particleTypes = {
      snow: { shape: 'circle', color: '#ffffff', speedY: 1, speedX: 0.5 },
      fire: { shape: 'circle', color: '#ff4500', speedY: -1, speedX: 0 },
      star: { shape: 'star', color: '#ffd700', speedY: 0.5, speedX: 0 },
      circle: { shape: 'circle', color: '#2563eb', speedY: 0.5, speedX: 0 }
    };

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;

    // 监听窗口大小变化
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.enabled) {
      this.updateParticles();
    }
  }

  // 更新设置（实时响应控制面板，无卡顿）
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    Logger.log(`粒子设置更新: ${JSON.stringify(newSettings)}`, 'DEBUG');

    if (this.enabled) {
      this.updateParticles();
    }
  }

  // 启动粒子系统
  start() {
    if (this.enabled) return;
    this.enabled = true;
    Logger.log('粒子系统启动', 'INFO');
    this.updateParticles();
    this.animate();
  }

  // 停止粒子系统
  stop() {
    this.enabled = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    Logger.log('粒子系统停止', 'INFO');
  }

  // 更新粒子（优化性能，避免卡顿）
  updateParticles() {
    if (!this.enabled || !this.canvas || !this.ctx) return;

    this.particles = [];

    for (let i = 0; i < this.settings.count; i++) {
      const randomType = this.settings.types[Math.floor(Math.random() * this.settings.types.length)];
      const typeConfig = this.particleTypes[randomType] || this.particleTypes.snow;

      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * this.settings.size + 0.5,
        speedX: (Math.random() - 0.5) * this.settings.speed * typeConfig.speedX,
        speedY: Math.random() * this.settings.speed * typeConfig.speedY,
        opacity: Math.random() * this.settings.opacity + 0.1,
        type: randomType,
        config: typeConfig
      });
    }
  }

  // 绘制星型粒子
  drawStar(x, y, size, opacity) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const xPos = x + size * Math.cos(angle);
      const yPos = y + size * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(xPos, yPos);
      } else {
        this.ctx.lineTo(xPos, yPos);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // 动画循环（性能优化）
  animate() {
    if (!this.enabled || !this.canvas || !this.ctx) return;

    // 计算显示区域
    const heroSection = document.getElementById('home');
    const areaHeight = this.settings.area === 'hero' && heroSection
      ? heroSection.offsetHeight + heroSection.offsetTop
      : this.canvas.height;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      // 绘制粒子
      this.ctx.globalAlpha = particle.opacity;

      if (particle.type === 'star') {
        this.drawStar(particle.x, particle.y, particle.size, particle.opacity);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.config.color;
        this.ctx.fill();
      }

      // 更新位置
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // 边界循环处理
      if (particle.config.speedY < 0) { // 向上移动的粒子（如火焰）
        if (particle.y < 0) {
          particle.y = areaHeight;
          particle.x = Math.random() * this.canvas.width;
        }
      } else { // 向下移动的粒子
        if (particle.y > areaHeight) {
          particle.y = 0;
          particle.x = Math.random() * this.canvas.width;
        }
      }

      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// 挂载到window，确保全局可访问
window.Particles = new ParticleSystem();