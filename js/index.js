﻿    // ===== 页面加载动画 - 立即隐藏 =====
    (function() {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }
    })();

    // ===== 深色模式 =====
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    let currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme() {
      // 处理主题
      if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fa fa-sun-o';
      } else if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fa fa-moon-o';
      } else if (currentTheme === 'auto') {
        // 跟随系统
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeIcon.className = 'fa fa-sun-o';
        } else {
          document.documentElement.removeAttribute('data-theme');
          themeIcon.className = 'fa fa-moon-o';
        }
      }
      
      localStorage.setItem('theme', currentTheme);
      
      // 通过 PageSync 通知其他页面
      if (window.PageSync) {
        window.PageSync.send('theme_change', { theme: currentTheme });
      }
    }
    
    // 初始化主题
    applyTheme();
    
    // 主题按钮点击事件
    themeBtn.addEventListener('click', () => {
      if (currentTheme === 'light') {
        currentTheme = 'dark';
      } else if (currentTheme === 'dark') {
        currentTheme = 'auto';
      } else {
        currentTheme = 'light';
      }
      applyTheme();
    });
    
    // ===== 跨页面数据同步 =====
    const dataChannel = new BroadcastChannel('website_data_sync');
    
    // 接收其他页面发来的数据同步消息
    dataChannel.onmessage = (event) => {
      if (event.data.type === 'data_updated' || event.data.type === 'data_update') {
        websiteData = normalizeSkillData(event.data.data);
        renderAllData();
      }
    };

    // 监听 storage 事件，以便从其他页面同步设置
    window.addEventListener('storage', (event) => {
      if (event.key === 'adminData') {
        try {
          websiteData = normalizeSkillData(JSON.parse(event.newValue));
          renderAllData();
        } catch (e) {}
      } else if (event.key === 'theme') {
        currentTheme = event.newValue || 'light';
        applyTheme();
      } else if (event.key === 'accentColor') {
        document.documentElement.style.setProperty('--accent', event.newValue);
      } else if (event.key === 'sync_particle_toggle') {
        // 处理粒子效果开关同步
        try {
          const storageData = JSON.parse(event.newValue);
          const data = storageData.data;
          if (window.Particles) {
            if (data.enabled) {
              window.Particles.start();
              const particleBtn = document.getElementById('particle-btn');
              if (particleBtn) {
                particleBtn.classList.add('active');
                particleBtn.title = '粒子效果: 雪花';
                particleBtn.style.color = '';
              }
            } else {
              window.Particles.stop();
              const particleBtn = document.getElementById('particle-btn');
              if (particleBtn) {
                particleBtn.classList.remove('active');
                particleBtn.title = '粒子效果: 已关闭';
                particleBtn.style.color = 'var(--text-muted)';
              }
            }
          }
        } catch (e) {
          console.error('处理粒子效果同步失败:', e);
        }
      } else if (event.key === 'sync_marquee_toggle') {
        // 处理跑马灯开关同步
        try {
          const storageData = JSON.parse(event.newValue);
          const data = storageData.data;
          console.log('跑马灯状态同步:', data.enabled);
        } catch (e) {
          console.error('处理跑马灯同步失败:', e);
        }
      } else if (event.key === 'sync_emo_toggle') {
        // 处理 Emo 模式开关同步
        try {
          const storageData = JSON.parse(event.newValue);
          const data = storageData.data;
          console.log('Emo模式状态同步:', data.enabled);
        } catch (e) {
          console.error('处理Emo模式同步失败:', e);
        }
      } else if (event.key === 'adminData') {
        // 不处理后台数据同步，保持仅使用data.js
      }
    });

    // ===== 导航栏滚动效果 =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // ===== 平滑滚动 =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeSidebar();
        }
      });
    });

    // ===== 返回顶部 =====
    document.getElementById('back-top').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== 侧边栏（移动端toggle） =====
    const sidebar = document.getElementById('sidebar');
    const sidebarBtn = document.getElementById('sidebar-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('active');
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
    }

    sidebarBtn.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);

    // ===== 滚动显示 =====
    function initReveal() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), index * 60);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    }

    // ===== GitHub 数据 =====
    const langColors = {
      'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
      'Java': '#b07219', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Vue': '#41b883',
      'Go': '#00ADD8', 'Rust': '#dea584', 'C++': '#f34b7d', 'C': '#555555',
      'Shell': '#89e051', 'Dockerfile': '#384d54'
    };

    // ===== 鼠标跟随光效 =====
    const cursorGlow = document.getElementById('cursor-glow');
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ===== 打字机效果 =====
    const typewriterTexts = [
      '欢迎来到桦知柚的主页',
      '代码创造无限可能',
      '技术改变未来世界',
      '开源让世界更美好'
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typewriterElement = document.getElementById('typewriter-text');

    function typeWriter() {
      const currentText = typewriterTexts[textIndex];
      
      if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        typeSpeed = 500;
      }

      setTimeout(typeWriter, typeSpeed);
    }
    typeWriter();

    // ===== 实时时钟 =====
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const time = `${hours}:${minutes}:${seconds}`;
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const date = `${year}/${month}/${day}`;
      
      const weekday = weekdays[now.getDay()];
      
      // 主页时钟
      document.getElementById('live-time').textContent = time;
      document.getElementById('live-date').textContent = date;
      document.getElementById('live-day').textContent = weekday;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ===== 快捷操作 =====
    function toggleTheme() {
      isDark = !isDark;
      applyTheme();
    }

    function copyEmail() {
      navigator.clipboard.writeText('nujianwudi@qq.com').then(() => {
        showToast('邮箱已复制');
      }).catch(() => {
        showToast('复制失败');
      });
    }

    // ===== 邮箱弹窗 =====
    function showEmailPopup(email, event) {
      const popup = document.getElementById('email-popup');
      document.getElementById('email-address').textContent = email || '未设置';
      
      if (event) {
        const x = Math.min(event.clientX, window.innerWidth - 280);
        const y = Math.min(event.clientY, window.innerHeight - 200);
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      } else {
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
      }
      
      popup.classList.add('show');
    }

    function closeEmailPopup() {
      const popup = document.getElementById('email-popup');
      popup.classList.remove('show');
      popup.style.transform = '';
    }

    // ===== 弹窗拖拽功能 =====
    function makeDraggable(popupId, headerId) {
      const popup = document.getElementById(popupId);
      const header = document.getElementById(headerId);
      
      if (!popup || !header) return;
      
      let isDragging = false;
      let offsetX, offsetY;
      
      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.getBoundingClientRect().left;
        offsetY = e.clientY - popup.getBoundingClientRect().top;
        header.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
        if (header) header.style.cursor = 'move';
      });
    }

    document.addEventListener('DOMContentLoaded', function() {
      makeDraggable('qq-popup', 'qq-popup-header');
      makeDraggable('email-popup', 'email-popup-header');
      makeDraggable('weixin-popup', 'weixin-popup-header');

      // 复制邮箱按钮
      document.querySelectorAll('.copy-email-btn').forEach(el => {
        el.addEventListener('click', copyEmail);
      });

      // 弹窗关闭按钮
      document.querySelector('.email-popup-close')?.addEventListener('click', closeEmailPopup);
      document.querySelector('.qq-popup-close')?.addEventListener('click', closeQQPopup);
      document.querySelector('.weixin-popup-close')?.addEventListener('click', closeWeixinPopup);

      // 弹窗内按钮
      document.querySelector('.email-copy-btn')?.addEventListener('click', copyEmailFromPopup);
      document.querySelector('.email-open-btn')?.addEventListener('click', openEmailClient);

      // data属性绑定 - 邮箱
      document.querySelectorAll('[data-email]').forEach(el => {
        el.addEventListener('click', (e) => showEmailPopup(el.dataset.email, e));
      });

      // data属性绑定 - QQ
      document.querySelectorAll('[data-qq]').forEach(el => {
        el.addEventListener('click', (e) => showQQPopup(el.dataset.qq, e));
      });
    });

    // ===== QQ弹窗 =====
    function showQQPopup(qqNumber, event) {
      const popup = document.getElementById('qq-popup');
      document.getElementById('qq-number').textContent = qqNumber || '未设置';
      
      if (event) {
        const x = Math.min(event.clientX, window.innerWidth - 280);
        const y = Math.min(event.clientY, window.innerHeight - 200);
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      } else {
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
      }
      
      popup.classList.add('show');
    }

    function closeQQPopup() {
      const popup = document.getElementById('qq-popup');
      popup.classList.remove('show');
      popup.style.transform = '';
    }

    function copyQQ() {
      const qq = document.getElementById('qq-number').textContent;
      if (qq === '未设置') {
        showToast('未设置QQ号');
        return;
      }
      navigator.clipboard.writeText(qq).then(() => {
        showToast('QQ号已复制');
        closeQQPopup();
      }).catch(() => {
        showToast('复制失败');
      });
    }

    // QQ弹窗事件监听
    document.getElementById('qq-popup-close').addEventListener('click', closeQQPopup);
    document.getElementById('qq-copy-btn').addEventListener('click', copyQQ);

    // ===== 微信弹窗 =====
    function showWeixinPopup(weixin, event) {
      const popup = document.getElementById('weixin-popup');
      document.getElementById('weixin-number').textContent = weixin || '未设置';
      
      if (event) {
        const x = Math.min(event.clientX, window.innerWidth - 280);
        const y = Math.min(event.clientY, window.innerHeight - 200);
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      } else {
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
      }
      
      popup.classList.add('show');
    }

    function closeWeixinPopup() {
      const popup = document.getElementById('weixin-popup');
      popup.classList.remove('show');
      popup.style.transform = '';
    }

    function copyWeixin() {
      const weixin = document.getElementById('weixin-number').textContent;
      if (weixin === '未设置') {
        showToast('未设置微信号');
        return;
      }
      navigator.clipboard.writeText(weixin).then(() => {
        showToast('微信号已复制');
        closeWeixinPopup();
      }).catch(() => {
        showToast('复制失败');
      });
    }

    // 微信弹窗事件监听
    document.getElementById('weixin-popup-close').addEventListener('click', closeWeixinPopup);
    document.getElementById('weixin-copy-btn').addEventListener('click', copyWeixin);

    function copyEmailFromPopup() {
      const email = document.getElementById('email-address').textContent;
      navigator.clipboard.writeText(email).then(() => {
        showToast('邮箱已复制');
        closeEmailPopup();
      }).catch(() => {
        showToast('复制失败');
      });
    }

    function openEmailClient() {
      const email = document.getElementById('email-address').textContent;
      window.location.href = 'mailto:' + email;
    }

    function showToast(msg) {
      const toast = document.getElementById('copy-toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // ===== 获取网站数据（优先从localStorage） =====
    const skillIconFallbacks = {
      'fa-js': 'fa-file-code-o',
      'fa-vuejs': 'fa-leaf',
      'fa-angular': 'fa-sitemap',
      'fa-react': 'fa-cube',
      'fa-sass': 'fa-paint-brush',
      'fa-node-js': 'fa-server',
      'fa-python': 'fa-terminal',
      'fa-java': 'fa-coffee',
      'fa-php': 'fa-code-fork',
      'fa-laravel': 'fa-diamond',
      'fa-docker': 'fa-ship',
      'fa-figma': 'fa-object-group',
      'fa-robot': 'fa-android',
      'fa-brain': 'fa-lightbulb-o',
      'fa-network-wired': 'fa-sitemap',
      'fa-lightbulb': 'fa-lightbulb-o',
      'fa-tools': 'fa-wrench',
      'fa-shopify': 'fa-shopping-bag',
      'fa-aws': 'fa-cloud'
    };

    function normalizeSkillIcon(icon) {
      return skillIconFallbacks[icon] || icon || 'fa-code';
    }

    function normalizeSkillData(data) {
      if (data && Array.isArray(data.skills)) {
        data.skills.forEach(skill => {
          skill.icon = normalizeSkillIcon(skill.icon);
        });
      }
      return data;
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function escapeJsString(value) {
      return String(value ?? '')
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\r', '')
        .replaceAll('\n', '\\n');
    }

    function normalizeExternalUrl(value) {
      const trimmed = String(value ?? '').trim();
      if (!trimmed) return '';

      const matchedUrl = trimmed.match(/https?:\/\/[^\s]+/i);
      if (matchedUrl) {
        return matchedUrl[0];
      }

      if (/^www\./i.test(trimmed)) {
        return `https://${trimmed}`;
      }

      return '';
    }

    // ===== 数据加载逻辑：data.js 优先，localStorage 仅用于实时同步 =====
    let websiteData = normalizeSkillData(JSON.parse(JSON.stringify(siteData)));

    function buildTimelineMarkup(items, emptyText = '暂无成长记录') {
      const timelineItems = Array.isArray(items) ? items : [];
      return timelineItems.length > 0
        ? timelineItems.map(item => `
            <div class="timeline-item">
              <div class="timeline-date">${escapeHtml(item.date || '待定')}</div>
              <div class="timeline-content">
                <h5>${escapeHtml(item.title || '未命名')}</h5>
                <p>${escapeHtml(item.desc || '')}</p>
              </div>
            </div>
          `).join('')
        : `
            <div class="timeline-item">
              <div class="timeline-date">等待更新</div>
              <div class="timeline-content">
                <h5>${emptyText}</h5>
                <p>这里暂时还没有可展示的内容。</p>
              </div>
            </div>
          `;
    }

    function renderTimelineItems(containerId, items, emptyText = '暂无成长记录') {
      const timeline = document.getElementById(containerId);
      if (!timeline) return;
      timeline.innerHTML = buildTimelineMarkup(items, emptyText);
    }

    function buildContactLinks(profile, options = {}) {
      const { includeSocialPlaceholders = false } = options;
      const links = [];
      const githubUrl = normalizeExternalUrl(profile.github);
      const websiteUrl = normalizeExternalUrl(profile.website);
      const emailValue = String(profile.email ?? '').trim();
      const qqValue = String(profile.qq ?? '').trim();
      const weixinValue = String(profile.weixin ?? '').trim();

      if (githubUrl) {
        links.push(`<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer" class="contact-link"><i class="fa fa-github"></i> GitHub</a>`);
      }
      if (emailValue) {
        links.push(`<a href="#" class="contact-link" onclick="showEmailPopup('${escapeJsString(emailValue)}', event); return false;"><i class="fa fa-envelope"></i> Email</a>`);
      }
      if (websiteUrl) {
        links.push(`<a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noopener noreferrer" class="contact-link"><i class="fa fa-globe"></i> 网站</a>`);
      }
      if (qqValue || includeSocialPlaceholders) {
        links.push(`<a href="#" class="contact-link" onclick="showQQPopup('${escapeJsString(qqValue)}', event); return false;"><i class="fa fa-qq"></i> QQ</a>`);
      }
      if (weixinValue) {
        links.push(`<a href="#" class="contact-link" onclick="showWeixinPopup('${escapeJsString(weixinValue)}', event); return false;"><i class="fa fa-weixin"></i> 微信</a>`);
      } else if (includeSocialPlaceholders) {
        links.push(`<a href="#" class="contact-link" onclick="showWeixinPopup('', event); return false;"><i class="fa fa-weixin"></i> 微信</a>`);
      }

      return links.join('');
    }

    function buildProfileCardMarkup(profile, options = {}) {
      const {
        fallbackName = '未命名',
        fallbackRole = '暂无介绍',
        fallbackBio = '这个部分还在整理中。',
        includeSocialPlaceholders = false,
        emptyMessage = '暂无贡献人介绍'
      } = options;

      const techStack = Array.isArray(profile.techStack) && profile.techStack.length > 0
        ? profile.techStack.map(item => `<span class="tech-tag">${escapeHtml(item)}</span>`).join('')
        : '<span class="tech-tag">待补充</span>';

      const contacts = buildContactLinks(profile, { includeSocialPlaceholders });

      return `
        <div class="line-left"></div>
        <div class="line-top"></div>
        <div class="about-card-header">
          <img src="${escapeHtml(profile.avatar || 'assets/avatar/huazhiyou.jpg')}" alt="个人头像" class="about-avatar">
          <div class="about-info">
            <h3>${escapeHtml(profile.name || fallbackName)}</h3>
            <p>${escapeHtml(profile.nickname || profile.role || fallbackRole)}</p>
            <div class="about-stats">
              <div class="about-stat">
                <span class="about-stat-number">${escapeHtml(profile.exp || '0')}</span>
                <span class="about-stat-label">年经验</span>
              </div>
              <div class="about-stat">
                <span class="about-stat-number">${escapeHtml(profile.projects || '0')}</span>
                <span class="about-stat-label">项目</span>
              </div>
              <div class="about-stat">
                <span class="about-stat-number">${escapeHtml(profile.passion || '∞')}</span>
                <span class="about-stat-label">热情</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="about-content">
          <h4>个人简介</h4>
          <p style="white-space: pre-line;">${escapeHtml(profile.bio || fallbackBio)}</p>
          
          <h4>技术栈</h4>
          <div class="about-tech-stack">
            ${techStack}
          </div>
          
          <h4>联系方式</h4>
          <div class="about-contact">
            ${contacts || `<span class="contact-link" style="cursor: default;">${escapeHtml(emptyMessage)}</span>`}
          </div>
        </div>
      `;
    }

    function renderProfileCard(cardId, profile, options = {}) {
      const {
        fallbackName = '未命名',
        fallbackRole = '暂无介绍',
        fallbackBio = '这个部分还在整理中。',
        includeSocialPlaceholders = false,
        emptyMessage = '暂无贡献人介绍'
      } = options;
      const card = document.getElementById(cardId);
      if (!card) return;

      const section = card.closest('section');
      if (!profile) {
        if (section && cardId !== 'about-main-card') {
          section.style.display = 'none';
        }
        return;
      }

      if (section) {
        section.style.display = '';
      }

      card.innerHTML = buildProfileCardMarkup(profile, {
        fallbackName,
        fallbackRole,
        fallbackBio,
        includeSocialPlaceholders,
        emptyMessage
      });
    }

    function getContributorProfileList() {
      const rawProfiles = Array.isArray(websiteData.contributorsIntro) && websiteData.contributorsIntro.length > 0
        ? websiteData.contributorsIntro
        : (websiteData.contributors || []).map(item => ({
        contributorId: item.id,
        avatar: item.avatar,
        name: item.name,
        role: item.role,
        bio: item.bio || '感谢这位贡献者的辛勤付出！',
        github: item.link || '',
        email: item.email || '',
        techStack: item.techStack || []
      }));

      const seen = new Set();
      return rawProfiles.filter(profile => {
        const key = profile?.contributorId || profile?.id || profile?.name;
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    function getContributorGrowthItems(profile) {
      const contributorGrowth = websiteData.contributorGrowth || {};
      const contributorId = profile?.contributorId
        || (websiteData.contributors || []).find(item => item.name === profile?.name)?.id;
      const key = String(contributorId);
      return key ? (contributorGrowth[key] || []) : [];
    }

    function renderContributorIntroSections(profiles) {
      const section = document.getElementById('contributors-intro');
      const container = document.getElementById('contributors-intro-list');
      if (!section || !container) return;

      const contributorProfiles = Array.isArray(profiles) ? profiles.filter(Boolean) : [];
      if (!contributorProfiles.length) {
        section.style.display = 'none';
        container.innerHTML = '';
        return;
      }

      section.style.display = '';
      container.innerHTML = contributorProfiles.map(profile => `
        <div class="about-grid">
          <div class="about-card reveal">
            ${buildProfileCardMarkup(profile, {
              fallbackRole: '贡献者',
              fallbackBio: '感谢这位贡献者的辛勤付出！',
              emptyMessage: '暂无联系方式'
            })}
          </div>
          <div class="about-timeline-card reveal">
            <div class="line-left"></div>
            <div class="line-top"></div>
            <h4>成长历程</h4>
            <div class="about-timeline">
              ${buildTimelineMarkup(getContributorGrowthItems(profile), '暂无这位贡献人的成长记录')}
            </div>
          </div>
        </div>
      `).join('');

      if (typeof initReveal === 'function') {
        initReveal();
      }
    }

    // 渲染所有数据
    function renderAllData() {
      // 更新版本号显示
      if (websiteData.changelog && websiteData.changelog.length > 0) {
        const latestVersion = websiteData.changelog[0].version;
        const sidebarVersion = document.getElementById('sidebar-version');
        const footerVersion = document.getElementById('footer-version');
        if (sidebarVersion) sidebarVersion.textContent = latestVersion;
        if (footerVersion) footerVersion.textContent = latestVersion + ' (当前)';
      }
      
      // 技能标签
      document.getElementById('skills-list').innerHTML = websiteData.skills.map(skill => `
        <div class="skill-item reveal">
          <div class="skill-icon"><i class="fa ${normalizeSkillIcon(skill.icon)}"></i></div>
          <div class="skill-name">${skill.name}</div>
          <div class="skill-level">${skill.category}</div>
        </div>
      `).join('');

      // 更新日志
      document.getElementById('logs-list').innerHTML = websiteData.changelog.map(log => `
        <div class="card log-card reveal">
          <div class="line-left"></div>
          <div class="line-top"></div>
          <div class="log-header">
            <div class="version-badge">${log.version}</div>
            <span class="log-date"><i class="fa fa-calendar"></i>${log.date}</span>
          </div>
          <ul class="log-items">
            ${log.items.map(item => `<li class="log-item"><i class="fa fa-check-circle"></i><span>${item}</span></li>`).join('')}
          </ul>
        </div>
      `).join('');

      const aboutData = websiteData.about || {};
      renderProfileCard('about-main-card', {
        ...aboutData,
        name: aboutData.name || '桦知柚'
      }, {
        fallbackName: '桦知柚',
        fallbackRole: '正在完善中',
        fallbackBio: '这个部分还在整理中。',
        includeSocialPlaceholders: true
      });

      const contributorProfiles = getContributorProfileList();
      renderContributorIntroSections(contributorProfiles);
      renderContributors();

      renderTimelineItems('growth-timeline', websiteData.growth, '暂无个人成长记录');

      renderMediaPlatforms();

      initReveal();
    }

    // ===== 技能标签数据 =====
    renderAllData();

    // 暴露给 sync.js 调用
    window.renderAdminData = function(data) {
      websiteData = normalizeSkillData(data);
      renderAllData();
    };

    // ===== GitHub 统计 =====
    fetch('https://api.github.com/users/HuaZHiyouyou')
      .then(r => r.json())
      .then(user => {
        document.getElementById('github-bio').textContent = user.bio || '暂无简介';
        document.getElementById('total-repos').textContent = user.public_repos || 0;
        document.getElementById('total-followers').textContent = user.followers || 0;
        // 更新侧边栏
        document.getElementById('stat-repos').textContent = user.public_repos || 0;
        document.getElementById('stat-followers').textContent = user.followers || 0;
      })
      .catch(() => {});

    // ===== GitHub 最近活动 =====
    function fetchGithubActivity() {
      fetch('https://api.github.com/users/HuaZHiyouyou/events?per_page=5')
        .then(r => r.json())
        .then(events => {
          const container = document.getElementById('sidebar-activity');
          if (!Array.isArray(events) || !events.length) {
            container.innerHTML = '<div class="activity-item"><div class="activity-dot"></div><div class="activity-content"><div class="activity-text" style="color: var(--text-muted);">暂无活动</div></div></div>';
            return;
          }

          const activityMap = {
            'CreateEvent': '创建了',
            'PushEvent': '推送了',
            'WatchEvent': '收藏了',
            'ForkEvent': '复刻了',
            'IssuesEvent': '创建了议题',
            'IssueCommentEvent': '评论了议题',
            'PullRequestEvent': '提交了拉取请求',
            'ReleaseEvent': '发布了版本',
            'GollumEvent': '更新了Wiki'
          };

          container.innerHTML = events.slice(0, 4).map(event => {
            const type = event.type || 'UnknownEvent';
            const action = activityMap[type] || '进行了操作';
            const repo = event.repo?.name || '未知仓库';
            const time = timeAgo(new Date(event.created_at));
            
            return `
              <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-text">${action} <span class="activity-repo">${repo}</span></div>
                  <div class="activity-time">${time}</div>
                </div>
              </div>
            `;
          }).join('');
        })
        .catch(() => {
          document.getElementById('sidebar-activity').innerHTML = '<div class="activity-item"><div class="activity-dot"></div><div class="activity-content"><div class="activity-text" style="color: var(--text-muted);">加载失败</div></div></div>';
        });
    }

    function timeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      const intervals = [
        { label: '年', seconds: 31536000 },
        { label: '月', seconds: 2592000 },
        { label: '天', seconds: 86400 },
        { label: '小时', seconds: 3600 },
        { label: '分钟', seconds: 60 }
      ];
      for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count}${interval.label}前`;
      }
      return '刚刚';
    }

    fetchGithubActivity();

    fetch('https://api.github.com/users/HuaZHiyouyou/repos?sort=updated&per_page=100')
      .then(r => r.json())
      .then(repos => {
        if (!Array.isArray(repos)) return;
        const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
        document.getElementById('total-stars').textContent = totalStars;
        document.getElementById('total-forks').textContent = totalForks;
        document.getElementById('stat-stars').textContent = totalStars;
      })
      .catch(() => {});

    // ===== 贡献图生成 =====
    function setContributionSyncTime(text) {
      const syncTime = document.getElementById('contribution-sync-time');
      if (!syncTime) return;
      syncTime.textContent = text;
    }

    function formatSyncTime(date = new Date()) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function formatDateKey(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function getContributionChartRange(totalDays = 84) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const since = new Date(today);
      since.setDate(today.getDate() - (totalDays - 1));

      const chartStart = new Date(since);
      chartStart.setDate(chartStart.getDate() - chartStart.getDay());

      const chartEnd = new Date(today);
      chartEnd.setDate(chartEnd.getDate() + (6 - chartEnd.getDay()));

      const dates = [];
      for (let d = new Date(chartStart); d <= chartEnd; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      const weekCount = Math.max(1, Math.ceil(dates.length / 7));
      return { today, since, chartStart, chartEnd, dates, weekCount };
    }

    function renderContributionAxes(chartRange) {
      const axis = document.getElementById('contribution-x-axis');
      const grid = document.getElementById('contribution-grid');
      if (!axis || !grid) return;

      const { chartStart, weekCount, since, today } = chartRange;
      axis.style.setProperty('--week-count', String(weekCount));
      grid.style.setProperty('--week-count', String(weekCount));

      let lastMonth = -1;
      axis.innerHTML = Array.from({ length: weekCount }, (_, week) => {
        const weekStart = new Date(chartStart);
        weekStart.setDate(chartStart.getDate() + week * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const inRangeWeek = weekEnd >= since && weekStart <= today;
        let label = '';
        if (inRangeWeek) {
          const month = weekStart.getMonth();
          if (month !== lastMonth) {
            label = `${month + 1}月`;
            lastMonth = month;
          }
        }

        return `<span class="contribution-x-label">${label}</span>`;
      }).join('');
    }

    function renderContributionPlaceholder(message, chartRange) {
      const grid = document.getElementById('contribution-grid');
      if (!grid) return;

      const { dates, since, today } = chartRange;
      grid.innerHTML = dates.map(date => {
        const inRange = date >= since && date <= today;
        const outsideClass = inRange ? '' : ' outside-range';
        return `<div class="contribution-cell${outsideClass}" title="${message}"></div>`;
      }).join('');
    }

    async function generateContributions() {
      const grid = document.getElementById('contribution-grid');
      if (!grid) return;

      const chartRange = getContributionChartRange(84);
      const { dates, since, today } = chartRange;
      renderContributionAxes(chartRange);
      renderContributionPlaceholder('同步中...', chartRange);
      setContributionSyncTime('最后同步：同步中...');

      try {
        const username = 'HuaZHiyouyou';
        const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);

        if (!response.ok) {
          throw new Error('Failed to fetch github events');
        }

        const events = (await response.json()).filter(item => item && item.created_at);

        const countsByDay = new Map();
        events.forEach(event => {
          const date = new Date(event.created_at);
          date.setHours(0, 0, 0, 0);
          if (date < since || date > today) return;

          const key = formatDateKey(date);
          countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
        });

        const inRangeValues = dates.map(date => {
          if (date < since || date > today) return 0;
          return countsByDay.get(formatDateKey(date)) || 0;
        });

        const maxCount = Math.max(...inRangeValues, 0);
        const toLevel = (value) => {
          if (value <= 0 || maxCount === 0) return 0;
          const ratio = value / maxCount;
          if (ratio >= 0.75) return 4;
          if (ratio >= 0.5) return 3;
          if (ratio >= 0.25) return 2;
          return 1;
        };

        grid.innerHTML = dates.map(date => {
          const inRange = date >= since && date <= today;
          const key = formatDateKey(date);
          const value = inRange ? (countsByDay.get(key) || 0) : 0;
          const level = inRange ? toLevel(value) : 0;
          const levelClass = level > 0 ? ` level-${level}` : '';
          const outsideClass = inRange ? '' : ' outside-range';
          const title = inRange ? `${key}：${value} 次活动` : `${key}：超出统计范围`;
          return `<div class="contribution-cell${levelClass}${outsideClass}" title="${title}"></div>`;
        }).join('');

        setContributionSyncTime(`最后同步：${formatSyncTime()}`);
      } catch (error) {
        renderContributionPlaceholder('同步失败', chartRange);
        setContributionSyncTime(`最后同步：同步失败（${formatSyncTime()}）`);
      }
    }
    generateContributions();

    // ===== 仓库搜索过滤 =====
    let allRepos = [];
    const repoSearch = document.getElementById('repo-search');
    
    repoSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allRepos.filter(repo => 
        repo.name.toLowerCase().includes(query) || 
        (repo.description && repo.description.toLowerCase().includes(query))
      );
      renderRepos(filtered);
    });

    function renderRepos(repos) {
      const container = document.getElementById('repos-list');
      if (!repos.length) {
        container.innerHTML = '<p class="col-span-full text-center" style="color: var(--text-sub);">没有找到匹配的仓库</p>';
        return;
      }
      container.innerHTML = repos.slice(0, 6).map(repo => `
        <a href="${repo.html_url}" target="_blank" class="card repo-card reveal">
          <div class="line-top"></div>
          <div class="bg-glow"></div>
          <div class="repo-icon"><i class="fa fa-github"></i></div>
          <h3 class="repo-name">${repo.name}</h3>
          <p class="repo-desc">${repo.description || '暂无描述'}</p>
          ${repo.language ? `<div class="lang-tag"><span class="lang-dot" style="background: ${langColors[repo.language] || '#60A5FA'}"></span>${repo.language}</div>` : ''}
          <div class="repo-stats">
            <span><i class="fa fa-star"></i> ${repo.stargazers_count}</span>
            <span><i class="fa fa-code-fork"></i> ${repo.forks_count}</span>
            <span class="repo-arrow"><i class="fa fa-arrow-right"></i></span>
          </div>
        </a>
      `).join('');
      initReveal();
    }

    // 修改原有的仓库获取逻辑
    fetch('https://api.github.com/users/HuaZHiyouyou/repos?sort=updated&per_page=100')
      .then(r => r.json())
      .then(repos => {
        if (!Array.isArray(repos) || !repos.length) {
          document.getElementById('repos-list').innerHTML = '<p class="col-span-full text-center" style="color: var(--text-sub);">暂无公开仓库</p>';
          return;
        }
        allRepos = repos;
        renderRepos(repos);
      })
      .catch(() => {
        document.getElementById('repos-list').innerHTML = '<p class="col-span-full text-center" style="color: var(--text-sub);">加载失败</p>';
      });

    // ===== 更新日志 =====
    function renderLogs(logs) {
      document.getElementById('logs-list').innerHTML = logs.map(log => `
        <div class="card log-card reveal">
          <div class="line-left"></div>
          <div class="line-top"></div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: relative;">
            <div class="version-badge">${log.version}</div>
            <span style="color: var(--text-muted); font-size: 0.85rem;"><i class="fa fa-calendar" style="margin-right: 0.25rem;"></i>${log.date}</span>
          </div>
          <ul style="display: flex; flex-direction: column; gap: 0.6rem; position: relative;">
            ${log.items.map(item => `<li class="log-item"><i class="fa fa-check-circle"></i><span>${item}</span></li>`).join('')}
          </ul>
        </div>
      `).join('');
      initReveal();
    }

    // ===== 粒子效果（切换类型） =====
    const particleBtn = document.getElementById('particle-btn');
    const particleTypes = ['snow', 'star', 'heart', 'circle', 'fire', 'leaf', 'rain'];
    let currentTypeIndex = 0;

    // 按钮图标映射
    const typeIcons = {
      'snow': 'fa-snowflake-o',
      'star': 'fa-star-o', 
      'heart': 'fa-heart-o',
      'circle': 'fa-circle-o',
      'fire': 'fa-fire',
      'leaf': 'fa-leaf',
      'rain': 'fa-tint'
    };

    // 类型名称映射
    const typeNames = {
      'snow': '雪花',
      'star': '星星',
      'heart': '爱心',
      'circle': '圆形',
      'fire': '火焰',
      'leaf': '绿叶',
      'rain': '雨滴'
    };

    // 页面加载后自动启动粒子（雪花类型）
    setTimeout(() => {
      if (window.Particles) {
        window.Particles.updateSettings({ types: ['snow'] });
        window.Particles.start();
        particleBtn.classList.add('active');
        particleBtn.title = '粒子效果: 雪花';
      }
    }, 1000);

    // 粒子效果开关状态
    let particleEnabled = true;
    
    // 点击切换粒子类型或开关
    particleBtn.addEventListener('click', () => {
      if (!window.Particles) return;
      
      // 右键点击或长按切换开关，左键点击切换类型
      particleEnabled = !particleEnabled;
      
      if (particleEnabled) {
        // 启用粒子
        currentTypeIndex = (currentTypeIndex + 1) % particleTypes.length;
        const newType = particleTypes[currentTypeIndex];
        
        window.Particles.updateSettings({ types: [newType] });
        window.Particles.updateParticles();
        window.Particles.start();
        
        // 更新按钮图标和提示
        particleBtn.querySelector('i').className = 'fa ' + (typeIcons[newType] || 'fa-snowflake-o');
        particleBtn.title = '粒子效果: ' + (typeNames[newType] || newType);
        particleBtn.classList.add('active');
        particleBtn.style.color = '';
        
        // 发送同步消息
        if (window.PageSync) {
          window.PageSync.send('particle_toggle', { enabled: true });
        }
        
        console.log('粒子效果已启用，类型:', newType, typeNames[newType]);
      } else {
        // 禁用粒子
        window.Particles.stop();
        
        // 更新按钮状态
        particleBtn.classList.remove('active');
        particleBtn.title = '粒子效果: 已关闭';
        particleBtn.style.color = 'var(--text-muted)';
        
        // 发送同步消息
        if (window.PageSync) {
          window.PageSync.send('particle_toggle', { enabled: false });
        }
        
        console.log('粒子效果已禁用');
      }
    });

    // ===== 音乐播放 =====
    const musicBtn = document.getElementById('music-btn');

    musicBtn.addEventListener('click', () => {
      if (window.MusicPlayer) {
        window.MusicPlayer.toggle();
        musicBtn.classList.toggle('active');
      }
    });

    // 渲染贡献人（使用websiteData，保持与manage同步）
    function renderContributors() {
      const contributorsList = document.getElementById('contributors-list');
      if (!contributorsList) return;
      
      const data = websiteData.contributors && websiteData.contributors.length > 0 ? websiteData.contributors : [{name: '桦知柚', role: '开发者', link: 'https://github.com/HuaZHiyouyou', avatar: 'assets/avatar/huazhiyou.jpg'}];
      
      contributorsList.innerHTML = data.map(item => `
        <div class="contributor-item reveal">
          <div class="line-left"></div>
          <div class="line-top"></div>
          <img src="${escapeHtml(item.avatar || 'assets/avatar/huazhiyou.jpg')}" alt="${escapeHtml(item.name || '贡献者头像')}" class="contributor-avatar">
          <div class="contributor-name">${escapeHtml(item.name || '未命名')}</div>
          <div class="contributor-role">${escapeHtml(item.role || '贡献者')}</div>
        </div>
      `).join('');
      
      initReveal();
    }

    // 从GitHub API获取贡献人数据（仅更新统计，不覆盖列表）
    async function fetchContributorsData() {
      try {
        const userResponse = await fetch('https://api.github.com/users/HuaZHiyouyou');
        const userData = await userResponse.json();
        
        const commitsResponse = await fetch('https://api.github.com/repos/HuaZHiyouyou/HuaZHiyouyou.github.io/commits?per_page=100');
        const commitsData = await commitsResponse.json();
        
        const issuesResponse = await fetch('https://api.github.com/repos/HuaZHiyouyou/HuaZHiyouyou.github.io/issues?state=all&per_page=100');
        const issuesData = await issuesResponse.json();
        
        const pullsResponse = await fetch('https://api.github.com/repos/HuaZHiyouyou/HuaZHiyouyou.github.io/pulls?state=all&per_page=100');
        const pullsData = await pullsResponse.json();
        
        // 更新websiteData中的桦知柚贡献者统计
        if (websiteData.contributors) {
          const hzy = websiteData.contributors.find(c => c.name === '桦知柚');
          if (hzy) {
            hzy.commits = commitsData.length;
            hzy.issues = issuesData.filter(issue => !issue.pull_request).length;
            hzy.pullRequests = pullsData.length;
            hzy.contributions = commitsData.length + issuesData.filter(issue => !issue.pull_request).length + pullsData.length;
            if (userData.avatar_url) {
              hzy.avatar = userData.avatar_url;
            }
          }
        }

        renderContributors();
        renderContributorIntroSections(getContributorProfileList());
        
        console.log('GitHub统计数据已更新');
      } catch (error) {
        console.error('获取GitHub数据失败:', error);
      }
    }

    // 页面加载时自动获取数据
    document.addEventListener('DOMContentLoaded', function() {
      // 延迟500ms获取数据，避免阻塞页面加载
      setTimeout(fetchContributorsData, 500);
    });

    // ===== 媒体平台 =====
    function renderMediaPlatforms() {
      console.log('renderMediaPlatforms called');
      const container = document.getElementById('media-platforms-list');
      if (!container) {
        console.log('container not found');
        return;
      }

      const platforms = websiteData.mediaPlatforms || [];
      console.log('platforms count:', platforms.length);
      
      if (!platforms.length) {
        container.innerHTML = '<p class="text-muted text-center">暂无媒体平台数据</p>';
        return;
      }

      var placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMzMzIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExNSIvPjx0ZXh0IGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJzaW1wbGUiIGZvbnQtc2l6ZT0iMTQiIHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5peg5raI5Zu+54K6PC90ZXh0Pjwvc3ZnPg==';

      let html = '';
      for (let i = 0; i < platforms.length; i++) {
        var platform = platforms[i];
        html += '<div class="media-platform reveal">';
        html += '<div class="media-platform-header">';
        html += '<div class="media-platform-icon" style="background:' + (platform.color || 'var(--accent)') + '">';
        html += '<i class="fa ' + (platform.icon || 'fa-play-circle') + '"></i>';
        html += '</div><div>';
        html += '<div class="media-platform-name">' + escapeHtml(platform.name) + '</div>';
        html += '<div class="media-platform-desc">' + escapeHtml(platform.desc || '') + '</div>';
        html += '</div>';
        if (platform.url) {
          html += '<a href="' + escapeHtml(platform.url) + '" target="_blank" class="media-platform-link"><i class="fa fa-external-link"></i> 前往主页</a>';
        }
        html += '</div><div class="media-video-grid">';
        
        var videos = platform.videos || [];
        for (var j = 0; j < videos.length; j++) {
          var video = videos[j];
          var coverUrl = video.cover || '';
          console.log('video cover url:', coverUrl);
          html += '<a href="' + escapeHtml(video.url || '#') + '" target="_blank" class="media-video-card" style="text-decoration:none;color:inherit;">';
          html += '<div class="media-video-cover-wrapper">';
          if (coverUrl) {
            html += '<img src="' + coverUrl + '" alt="' + escapeHtml(video.title) + '" class="media-video-cover" loading="lazy" onerror="this.src=\'' + placeholderImg + '\'">';
          } else {
            html += '<img src="' + placeholderImg + '" alt="无封面" class="media-video-cover" loading="lazy">';
          }
          html += '<div class="media-video-play-icon"><i class="fa fa-play"></i></div>';
          html += '</div><div class="media-video-info">';
          html += '<div class="media-video-title">' + escapeHtml(video.title) + '</div>';
          html += '<div class="media-video-meta">';
          if (video.views) html += '<span><i class="fa fa-eye"></i> ' + escapeHtml(video.views) + '</span>';
          if (video.date) html += '<span><i class="fa fa-clock-o"></i> ' + escapeHtml(video.date) + '</span>';
          html += '</div></div></a>';
        }
        
        html += '</div></div>';
      }
      
      container.innerHTML = html;
      console.log('render complete, html length:', html.length);

      initReveal();
    }

    // ===== 个人介绍增强功能 =====
    document.addEventListener('DOMContentLoaded', function() {
      // 添加个人介绍动画
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, { threshold: 0.1 });
        
        observer.observe(aboutSection);
      }
      
      // 添加联系按钮点击效果
      const contactLinks = document.querySelectorAll('.contact-link');
      contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          if (!this.href || this.href === '#') {
            e.preventDefault();
            showToast('功能开发中...');
          }
        });
      });
    });

    // ===== 更新侧边栏导航 =====
    document.addEventListener('DOMContentLoaded', function() {
      // 更新侧边栏活动状态
      const navItems = document.querySelectorAll('.nav-item');
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

      function updateActiveNavigation(current) {
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
        });

        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
      }
      
      window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
          }
        });

        updateActiveNavigation(current);
      });

      navLinks.forEach(link => {
        link.addEventListener('click', function() {
          const href = this.getAttribute('href');
          if (href && href.startsWith('#')) {
            updateActiveNavigation(href.slice(1));
          }
        });
      });

      const initialSection = window.location.hash.replace('#', '') || 'home';
      updateActiveNavigation(initialSection);
    });

    // ===== 初始化主题设置 =====
    document.addEventListener('DOMContentLoaded', function() {
      // 加载主题设置
      const savedThemeSettings = localStorage.getItem('themeSettings');
      if (savedThemeSettings) {
        try {
          const settings = JSON.parse(savedThemeSettings);
          if (window.PageSync) {
            window.PageSync.applyThemeSettings(settings);
          }
        } catch (e) {
          console.error('加载主题设置失败:', e);
        }
      }
    });

    // ===== 页脚访客计数器：本地读取 =====
    (function() {
      function updateCounter() {
        var el = document.getElementById('site-visitor-count');
        if (!el) return;
        var analytics = JSON.parse(localStorage.getItem('site-analytics') || '{"totalVisits":0}');
        var visitors = JSON.parse(localStorage.getItem('visitor-sessions') || '[]');
        var count = Math.max(analytics.totalVisits || 0, visitors.length || 0);
        el.textContent = count;
      }
      updateCounter();
      setInterval(updateCounter, 5000);
    })();
  
