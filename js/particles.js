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
      count: 60,
      size: 6,
      opacity: 0.8,
      speed: 1.5,
      area: 'full',
      zIndex: -1
    };

    this.particleTypes = {
      snow: { shape: 'circle', color: '#ffffff', speedY: 1, speedX: 0.5 },
      fire: { shape: 'circle', color: '#ff4500', speedY: 1.5, speedX: 0 },
      star: { shape: 'star', color: '#ffd700', speedY: 0.5, speedX: 0 },
      circle: { shape: 'circle', color: '#2563eb', speedY: 0.5, speedX: 0 },
      heart: { shape: 'heart', color: '#ff69b4', speedY: 0.8, speedX: 0.3 },
      leaf: { shape: 'leaf', color: '#228b22', speedY: 1, speedX: 0.4 },
      rain: { shape: 'rain', color: '#87ceeb', speedY: 3, speedX: 0 }
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
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
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

  // 绘制爱心粒子
  drawHeart(x, y, size, opacity, color) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color || '#ff69b4';
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    // 左上曲线
    this.ctx.bezierCurveTo(
      x, y, 
      x - size / 2, y, 
      x - size / 2, y + topCurveHeight
    );
    // 左下曲线
    this.ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2, 
      x, y + (size + topCurveHeight) / 2, 
      x, y + size
    );
    // 右下曲线
    this.ctx.bezierCurveTo(
      x, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + topCurveHeight
    );
    // 右上曲线
    this.ctx.bezierCurveTo(
      x + size / 2, y, 
      x, y, 
      x, y + topCurveHeight
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  // 绘制绿叶
  drawLeaf(x, y, size, opacity, color) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color || '#228b22';
    
    // 绿叶形状
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size);
    this.ctx.quadraticCurveTo(x + size * 0.8, y - size * 0.5, x + size * 0.6, y + size * 0.5);
    this.ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.8, x, y + size);
    this.ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.8, x - size * 0.6, y + size * 0.5);
    this.ctx.quadraticCurveTo(x - size * 0.8, y - size * 0.5, x, y - size);
    this.ctx.fill();
    
    // 叶脉
    this.ctx.strokeStyle = 'rgba(0,100,0,0.3)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size * 0.8);
    this.ctx.lineTo(x, y + size * 0.8);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  // 绘制雨滴
  drawRain(x, y, size, opacity, color) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color || '#87ceeb';
    this.ctx.strokeStyle = color || '#87ceeb';
    this.ctx.lineWidth = 1.5;
    
    // 雨滴形状
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size * 2);
    this.ctx.quadraticCurveTo(x + size * 0.5, y - size, x, y + size);
    this.ctx.quadraticCurveTo(x - size * 0.5, y - size, x, y - size * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  // 动画循环（性能优化）
  animate() {
    if (!this.enabled || !this.canvas || !this.ctx) return;

    // 更新 z-index
    if (this.settings.zIndex !== undefined) {
      this.canvas.style.zIndex = this.settings.zIndex;
    }

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
      } else if (particle.type === 'heart') {
        this.drawHeart(particle.x, particle.y, particle.size * 2, particle.opacity, particle.config.color);
      } else if (particle.type === 'leaf') {
        this.drawLeaf(particle.x, particle.y, particle.size, particle.opacity, particle.config.color);
      } else if (particle.type === 'rain') {
        this.drawRain(particle.x, particle.y, particle.size, particle.opacity, particle.config.color);
      } else {
        // 默认圆形粒子
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