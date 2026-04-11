    // ===== 页面加载动画 - 立即隐藏 =====
    (function() {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }
    })();

    document.addEventListener('DOMContentLoaded', function() {
      // ===== 服务器按钮事件 =====
      document.getElementById('server-check-btn')?.addEventListener('click', function() {
        checkServerStatus();
      });

      document.getElementById('server-goto-btn')?.addEventListener('click', function() {
        window.location.href = 'http://localhost:3000/manage.html';
      });

      var startServerBtn = document.getElementById('start-server-btn');
      if (startServerBtn) {
        startServerBtn.addEventListener('click', async function() {
          try {
            var res = await fetch('/api/open-folder', { method: 'POST' });
            if (res.ok) {
              showToast('正在启动服务器...');
            }
          } catch (e) {
            showToast('请手动启动服务器');
          }
        });
      }
    });

    // ===== 深色模式 =====
    let isDark = localStorage.getItem('theme') === 'dark';

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      if (window.PageSync) {
        window.PageSync.send('theme_change', { theme: isDark ? 'dark' : 'light' });
      }
    }
    applyTheme();

    // ===== 导航栏滚动效果 =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // ===== 显示提示 =====
    function showToast(msg) {
      const toast = document.getElementById('copy-toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // ===== HTML 转义 =====
    function escapeHtml(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // ===== 管理面板功能 =====
    document.addEventListener('DOMContentLoaded', function() {
      // 管理面板选项卡切换
      const adminTabs = document.querySelectorAll('.admin-tab');
      const adminPanels = document.querySelectorAll('.admin-panel');

      function activateAdminTab(tabId, updateHash = true) {
        const targetTab = Array.from(adminTabs).find(tab => tab.dataset.tab === tabId);
        if (!targetTab) return;

        adminTabs.forEach(tab => tab.classList.remove('active'));
        adminPanels.forEach(panel => panel.classList.remove('active'));

        targetTab.classList.add('active');
        const targetPanel = document.getElementById(`admin-${tabId}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        if (tabId === 'resources') {
          initResourceManagement();
        }

        if (tabId === 'shares') {
          initShareManagement();
        }

        if (updateHash) {
          if (history.replaceState) {
            try {
              history.replaceState(null, '', `#${tabId}`);
            } catch (error) {
              window.location.hash = tabId;
            }
          } else {
            window.location.hash = tabId;
          }
        }
      }

      function getTabFromHash() {
        const rawHash = window.location.hash.replace('#', '');
        if (!rawHash) return '';
        return rawHash.startsWith('admin-') ? rawHash.replace('admin-', '') : rawHash;
      }

      adminTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          activateAdminTab(this.dataset.tab);
        });
      });

      const initialTab = getTabFromHash();
      activateAdminTab(initialTab || 'settings', false);

      window.addEventListener('hashchange', function() {
        const tabId = getTabFromHash();
        if (tabId) {
          activateAdminTab(tabId, false);
        }
      });

      // 用户管理按钮事件委托
      document.querySelectorAll('.user-action-btn[data-user]').forEach(btn => {
        btn.addEventListener('click', function() {
          const user = this.dataset.user;
          const action = this.dataset.action;
          if (action === 'edit') {
            editUser(user);
          } else if (action === 'delete') {
            deleteUser(user);
          }
        });
      });

      // 设置开关事件处理
      document.getElementById('particle-toggle').addEventListener('change', function() {
        if (this.checked) {
          showToast('粒子效果已启用');
        } else {
          showToast('粒子效果已禁用');
        }

        // 通过 PageSync 通知其他页面
        if (window.PageSync) {
          window.PageSync.send('particle_toggle', { enabled: this.checked });
        }
      });

      document.getElementById('marquee-toggle').addEventListener('change', function() {
        if (this.checked) {
          showToast('跑马灯已启用');
        } else {
          showToast('跑马灯已禁用');
        }

        // 通过 PageSync 通知其他页面
        if (window.PageSync) {
          window.PageSync.send('marquee_toggle', { enabled: this.checked });
        }
      });

      document.getElementById('emo-toggle').addEventListener('change', function() {
        if (this.checked) {
          showToast('Emo模式已启用');
        } else {
          showToast('Emo模式已禁用');
        }

        // 通过 PageSync 通知其他页面
        if (window.PageSync) {
          window.PageSync.send('emo_toggle', { enabled: this.checked });
        }
      });

      // 主题选择
      document.getElementById('theme-select').addEventListener('change', function() {
        const theme = this.value;
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else if (theme === 'light') {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        } else {
          // 跟随系统
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.removeAttribute('data-theme');
          }
          localStorage.setItem('theme', 'auto');
        }

        // 通过 PageSync 通知其他页面
        if (window.PageSync) {
          window.PageSync.send('theme_change', { theme: theme });
        }

        showToast(`主题已切换为: ${this.options[this.selectedIndex].text}`);
      });

      // 强调色选择
      document.getElementById('accent-color').addEventListener('input', function() {
        document.documentElement.style.setProperty('--accent', this.value);
        document.getElementById('color-value').textContent = this.value;
        localStorage.setItem('accentColor', this.value);

        // 通过 PageSync 通知其他页面
        if (window.PageSync) {
          window.PageSync.send('accent_color_change', { color: this.value });
        }
      });

      // 刷新首页按钮
      document.getElementById('refresh-index').addEventListener('click', function() {
        // 直接刷新当前页面（如果是从首页打开的管理面板）
        // 或者使用 BroadcastChannel 发送刷新请求
        if (window.PageSync) {
          window.PageSync.send('refresh_page', {});
          showToast('已发送刷新请求');

          // 延迟后刷新自身（如果是从管理面板打开的）
          setTimeout(() => {
            showToast('管理面板将在3秒后刷新以同步设置...');
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }, 500);
        } else {
          showToast('同步模块未加载，将直接刷新页面');
          window.location.reload();
        }
      });

      // ===== 本地服务器状态检测 =====
      async function checkServerStatus() {
        var dot = document.getElementById('server-status-dot');
        var text = document.getElementById('server-status-text');
        if (!dot || !text) return;

        // 检测是否是 file:// 协议打开的
        if (window.location.protocol === 'file:') {
          dot.style.background = '#f59e0b';
          dot.style.boxShadow = '0 0 8px #f59e0b';
          text.innerHTML = '请通过服务器访问，以启用数据保存功能';
          serverReady = false;
          return;
        }

        // 使用当前页面的服务器地址
        try {
          var res = await fetch('/api/data', { method: 'GET' });
          if (res.ok) {
            dot.style.background = '#22c55e';
            dot.style.boxShadow = '0 0 8px #22c55e';
            text.textContent = '已连接 — 保存将直接写入 data.js';
            serverReady = true;
          } else {
            throw new Error('响应异常');
          }
        } catch (e) {
          dot.style.background = '#ef4444';
          dot.style.boxShadow = 'none';
          text.textContent = '服务器未响应 — 请检查服务器';
          serverReady = false;
        }
      }

      // 打开项目文件夹
      var openFolderBtn = document.getElementById('server-open-folder-btn');
      if (openFolderBtn) {
        openFolderBtn.addEventListener('click', function() {
          if (window.location.port !== '3000') {
            alert('请通过 http://localhost:3000 访问管理界面\n\n当前通过 IDE 服务器访问，无法打开文件夹。');
            return;
          }
          fetch('/api/open-folder', { method: 'POST' }).then(function() {
            showToast('已打开项目文件夹');
          }).catch(function() {
            showToast('请先启动服务器 (start.bat)');
          });
        });
      }
      // 页面加载时自动检测
      checkServerStatus();

// 监听资源数据变更并保存
window.addEventListener('resource-data-changed', function(e) {
  adminData = e.detail;
  saveAdminData(true);
});

window.addEventListener('storage', (event) => {
    if (event.key === 'sync_particle_toggle') {
        try {
            const storageData = JSON.parse(event.newValue);
            const data = storageData.data;
            const particleToggle = document.getElementById('particle-toggle');
            if (particleToggle) {
                particleToggle.checked = data.enabled;
                showToast(`粒子效果已${data.enabled ? '启用' : '禁用'}`);
            }
        } catch (e) {
            console.error('处理粒子效果同步失败:', e);
        }
    } else if (event.key === 'sync_marquee_toggle') {
        try {
            const storageData = JSON.parse(event.newValue);
            const data = storageData.data;
            const marqueeToggle = document.getElementById('marquee-toggle');
            if (marqueeToggle) {
                marqueeToggle.checked = data.enabled;
                showToast(`跑马灯已${data.enabled ? '启用' : '禁用'}`);
            }
        } catch (e) {
            console.error('处理跑马灯同步失败:', e);
        }
    } else if (event.key === 'sync_emo_toggle') {
        try {
            const storageData = JSON.parse(event.newValue);
            const data = storageData.data;
            const emoToggle = document.getElementById('emo-toggle');
            if (emoToggle) {
                emoToggle.checked = data.enabled;
                showToast(`Emo模式已${data.enabled ? '启用' : '禁用'}`);
            }
        } catch (e) {
            console.error('处理Emo模式同步失败:', e);
        }
    } else if (event.key === 'theme') {
        const theme = event.newValue || 'light';
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
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    } else if (event.key === 'accentColor') {
        document.documentElement.style.setProperty('--accent', event.newValue);
        const colorValueElement = document.getElementById('color-value');
        if (colorValueElement) {
            colorValueElement.textContent = event.newValue;
        }
        const accentColorInput = document.getElementById('accent-color');
        if (accentColorInput) {
            accentColorInput.value = event.newValue;
        }
    }
});
    });

    // ===== 编辑用户函数 =====
    function editUser(userName) {
      showToast(`正在编辑用户: ${userName}`);
    }

    // ===== 删除用户函数 =====
    function deleteUser(userName) {
      if (confirm(`确定要删除用户 ${userName} 吗？`)) {
        showToast(`已删除用户: ${userName}`);
      }
    }

    // ===== 内容管理子选项卡切换 =====
    const contentSubTabs = document.querySelectorAll('.content-sub-tab');
    const contentSubPanels = document.querySelectorAll('.content-sub-panel');

    contentSubTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const subtabId = this.dataset.subtab;
        contentSubTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        contentSubPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === `subpanel-${subtabId}`) {
            panel.classList.add('active');
          }
        });
        // 切换到介绍管理时渲染
        if (subtabId === 'intro') {
          renderIntro();
        }
        // 切换到媒体平台时渲染
        if (subtabId === 'media' && window.renderMediaPlatforms) {
          window.renderMediaPlatforms();
        }
      });
    });

    // ===== 鏁版嵁瀛樺偍 =====
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
      // 初始化新字段
      if (!data.about) data.about = {};
      if (!data.contributorsIntro) data.contributorsIntro = [];
      if (!data.contributorGrowth) data.contributorGrowth = {};
      if (!data.shares) data.shares = [];
      if (!data.shareCategories) data.shareCategories = {
        tool: { name: '工具', icon: 'fa-wrench', color: '#3B82F6' },
        article: { name: '文章', icon: 'fa-file-text', color: '#10B981' },
        learning: { name: '学习', icon: 'fa-graduation-cap', color: '#8B5CF6' },
        entertainment: { name: '娱乐', icon: 'fa-gamepad', color: '#F59E0B' },
        other: { name: '其他', icon: 'fa-folder', color: '#6B7280' }
      };
      return data;
    }

    // 优先使用本地服务器 /api/data
    let adminData = normalizeSkillData({});
    let serverReady = false;

    // 自动保存到本地服务器（直接写入 data.js）
    let saveTimeout;
    const dataChannel = new BroadcastChannel('website_data_sync');

    async function saveAdminData(showMessage = false) {
      try {
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminData)
        });
        if (res.ok) {
          dataChannel.postMessage({ type: 'data_updated', data: adminData });
          serverReady = true;
          if (showMessage) {
            showToast('已保存到 data.js 文件，页面将刷新...');
            setTimeout(function() {
              window.location.href = window.location.pathname + '?_t=' + Date.now();
            }, 1000);
          }
        } else {
          serverReady = false;
          if (showMessage) showToast('服务器异常，请检查本地服务器');
        }
      } catch (e) {
        serverReady = false;
        if (showMessage) showToast('保存失败：服务器未启动');
      }
    }

    // 导出 data.js 文件（回退方案）
    function exportData() {
      const dataStr = `// 网站数据配置 - 修改这里即可更新网站内容
const siteData = ${JSON.stringify(adminData, null, 2)};`;

      const blob = new Blob([dataStr], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.js';
      a.click();
      URL.revokeObjectURL(url);
    }

    // 保存到data.js按钮事件
    function addSaveButtonHandler(btnId, dataType, renderFunc) {
      document.getElementById(btnId).addEventListener('click', function() {
        saveAdminData(true);

        const btn = this;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-check"></i> 已保存';
        btn.style.background = '#10B981';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
        }, 2000);
      });
    }

    addSaveButtonHandler('save-skills-btn', '技能标签', renderSkills);
    addSaveButtonHandler('save-projects-btn', '项目仓库', renderProjects);
    addSaveButtonHandler('save-changelog-btn', '更新日志', renderChangelog);
    addSaveButtonHandler('save-contributors-btn', '贡献者', renderContributors);
    addSaveButtonHandler('save-intro-btn', '介绍管理', renderIntro);
    addSaveButtonHandler('save-growth-btn', '成长历程', renderGrowth);

    // 说说保存按钮
    document.getElementById('save-moments-btn').addEventListener('click', function() {
      const moments = loadMoments();
      adminData.moments = moments;
      saveAdminData(true);
    });

    // ===== 介绍管理 =====
    function renderIntro() {
      // 自动从贡献者生成贡献人介绍数据（如果为空）
      if (!adminData.contributorsIntro || adminData.contributorsIntro.length === 0) {
        const contributors = adminData.contributors || [];
        adminData.contributorsIntro = contributors.map(c => ({
          id: c.id,
          contributorId: c.id,
          name: c.name,
          role: c.role || '贡献者',
          avatar: c.avatar || '',
          bio: c.bio || '',
          email: c.email || '',
          github: c.link || '',
          exp: '1',
          projects: '1',
          passion: '∞',
          techStack: []
        }));
      }

      // 渲染贡献人介绍列表
      const introList = document.getElementById('contributors-intro-list');
      const contributorsIntro = adminData.contributorsIntro || [];
      introList.innerHTML = contributorsIntro.map((item, index) => `
        <div class="contributor-intro-card" style="animation-delay: ${index * 0.05}s;" data-id="${item.id}">
          <div class="contributor-intro-card-info">
            ${item.avatar ? `<img src="${item.avatar}" alt="${item.name}">` : `<div style="width:48px;height:48px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:white;">${item.name ? item.name.charAt(0) : '?'}</div>`}
            <div>
              <div style="font-weight:600;">${item.name || '未命名'}</div>
              <div style="font-size:0.85rem;color:var(--text-sub);">${item.role || '贡献者'}</div>
            </div>
          </div>
          <div class="contributor-intro-card-actions">
            <button class="btn btn-outline btn-sm" onclick="editContributorIntroById(${item.id})">
              <i class="fa fa-edit"></i> 编辑
            </button>
            <button class="btn btn-outline btn-sm" style="color:#ef4444;border-color:#ef4444;" onclick="deleteContributorIntro(${item.id})">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    // 编辑个人介绍按钮
    document.getElementById('edit-intro-btn').addEventListener('click', function() {
      const aboutData = adminData.about || {};
      document.getElementById('intro-avatar').value = aboutData.avatar || 'assets/avatar/huazhiyou.jpg';
      document.getElementById('intro-nickname').value = aboutData.nickname || '';
      document.getElementById('intro-exp').value = aboutData.exp || '1';
      document.getElementById('intro-projects').value = aboutData.projects || '1';
      document.getElementById('intro-passion').value = aboutData.passion || '∞';
      document.getElementById('intro-bio').value = aboutData.bio || '';
      document.getElementById('intro-tech').value = (aboutData.techStack || []).join(', ');
      document.getElementById('intro-github').value = aboutData.github || '';
      document.getElementById('intro-email').value = aboutData.email || '';
      document.getElementById('intro-qq').value = aboutData.qq || '';
      document.getElementById('intro-weixin').value = aboutData.weixin || '';
      openModal('intro-modal');
    });

    // 保存个人介绍（模态框）
    document.getElementById('intro-form').addEventListener('submit', function(e) {
      e.preventDefault();
      adminData.about = {
        avatar: document.getElementById('intro-avatar').value,
        nickname: document.getElementById('intro-nickname').value,
        exp: document.getElementById('intro-exp').value,
        projects: document.getElementById('intro-projects').value,
        passion: document.getElementById('intro-passion').value,
        bio: document.getElementById('intro-bio').value,
        techStack: document.getElementById('intro-tech').value.split(',').map(s => s.trim()).filter(s => s),
        github: document.getElementById('intro-github').value,
        email: document.getElementById('intro-email').value,
        qq: document.getElementById('intro-qq').value,
        weixin: document.getElementById('intro-weixin').value
      };
      closeModal('intro-modal');
      saveAdminData(true);
      showToast('个人介绍已保存');
    });

    // 添加贡献人介绍按钮
    function populateContributorOptions(selectId, options = {}) {
      const {
        includeManual = false,
        manualLabel = '手动填写',
        selectedId = ''
      } = options;
      const select = document.getElementById(selectId);
      if (!select) return;

      const html = [];
      if (includeManual) {
        html.push(`<option value="">${manualLabel}</option>`);
      }

      (adminData.contributors || []).forEach(contributor => {
        const selected = String(contributor.id) === String(selectedId) ? ' selected' : '';
        html.push(`<option value="${contributor.id}"${selected}>${contributor.name}</option>`);
      });

      select.innerHTML = html.join('');
    }

    function updateAvatarPicker(inputId, previewId, placeholderId, value) {
      const input = document.getElementById(inputId);
      const preview = document.getElementById(previewId);
      const placeholder = document.getElementById(placeholderId);
      if (!input || !preview || !placeholder) return;

      const nextValue = typeof value === 'string' ? value : input.value;
      if (typeof value === 'string') {
        input.value = value;
      }

      if (nextValue) {
        preview.src = nextValue;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
      } else {
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
      }
    }

function bindAvatarPicker(inputId, previewId, placeholderId, uploadId) {
  const input = document.getElementById(inputId);
  const upload = document.getElementById(uploadId);
  if (!input) return;

  input.addEventListener('input', function() {
    updateAvatarPicker(inputId, previewId, placeholderId);
  });

  if (upload) {
    upload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const preview = document.getElementById(previewId);
      const placeholder = document.getElementById(placeholderId);
      if (preview) {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 上传中...';
      }

      const formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          updateAvatarPicker(inputId, previewId, placeholderId, data.path);
          showToast('头像上传成功');
        } else {
          placeholder.innerHTML = '<i class="fa fa-user"></i> 上传失败';
          showToast('头像上传失败');
        }
      })
      .catch(err => {
        placeholder.innerHTML = '<i class="fa fa-user"></i> 上传失败';
        showToast('上传失败: ' + err.message);
      });
    });
  }

updateAvatarPicker(inputId, previewId, placeholderId);
}

function fillContributorIntroFromContributor(contributorId) {
      const contributor = (adminData.contributors || []).find(item => String(item.id) === String(contributorId));
      if (!contributor) return;

      document.getElementById('contributor-intro-name').value = contributor.name || '';
      updateAvatarPicker(
        'contributor-intro-avatar',
        'contributor-intro-avatar-preview',
        'contributor-intro-avatar-placeholder',
        contributor.avatar || ''
      );
    }

    document.getElementById('add-contributor-intro-btn').addEventListener('click', function() {
      document.getElementById('contributor-intro-id').value = '';
      document.getElementById('contributor-intro-form').reset();
      populateContributorOptions('contributor-intro-contributor', { includeManual: true });
      updateAvatarPicker('contributor-intro-avatar', 'contributor-intro-avatar-preview', 'contributor-intro-avatar-placeholder', '');
      openModal('contributor-intro-modal');
    });

    document.getElementById('quick-add-contributor-btn').addEventListener('click', function() {
      resetContributorForm();
      openModal('contributor-modal');
    });

    document.getElementById('contributor-intro-contributor').addEventListener('change', function() {
      if (this.value) {
        fillContributorIntroFromContributor(this.value);
      }
    });

    // 编辑贡献人介绍（通过列表编辑按钮）
    window.editContributorIntro = function(id) {
      const intro = (adminData.contributorsIntro || []).find(i => i.id === id);
      if (intro) {
        editContributorIntroById(id);
      }
    };

    // 编辑贡献人介绍（通用）
    window.editContributorIntroById = function(id) {
      const intro = (adminData.contributorsIntro || []).find(i => i.id === id);
      if (intro) {
        document.getElementById('contributor-intro-id').value = intro.id || '';
        document.getElementById('contributor-intro-contributor').value = intro.contributorId || '';
        document.getElementById('contributor-intro-avatar').value = intro.avatar || '';
        document.getElementById('contributor-intro-name').value = intro.name || '';
        document.getElementById('contributor-intro-exp').value = intro.exp || '1';
        document.getElementById('contributor-intro-projects').value = intro.projects || '1';
        document.getElementById('contributor-intro-passion').value = intro.passion || '∞';
        document.getElementById('contributor-intro-bio').value = intro.bio || '';
        document.getElementById('contributor-intro-tech').value = (intro.techStack || []).join(', ');
        document.getElementById('contributor-intro-github').value = intro.github || '';
        document.getElementById('contributor-intro-email').value = intro.email || '';
        document.getElementById('contributor-intro-qq').value = intro.qq || '';
        document.getElementById('contributor-intro-weixin').value = intro.weixin || '';
        updateAvatarPicker('contributor-intro-avatar', 'contributor-intro-avatar-preview', 'contributor-intro-avatar-placeholder');
        document.getElementById('contributor-intro-form').dataset.contributorId = intro.contributorId || '';
        openModal('contributor-intro-modal');
      }
    };

    // 删除贡献人介绍
    window.deleteContributorIntro = function(id) {
      if (confirm('确定要删除这个贡献人介绍吗？')) {
        adminData.contributorsIntro = (adminData.contributorsIntro || []).filter(i => i.id !== id);
        renderIntro();
        saveAdminData(true);
      }
    };

    // 提交贡献人介绍表单
    document.getElementById('contributor-intro-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const id = parseInt(document.getElementById('contributor-intro-id').value) || Date.now();
      const contributorIdValue = document.getElementById('contributor-intro-contributor').value;
      const linkedContributor = (adminData.contributors || []).find(item => String(item.id) === contributorIdValue);
      const introData = {
        id: id,
        contributorId: contributorIdValue ? parseInt(contributorIdValue, 10) : null,
        avatar: document.getElementById('contributor-intro-avatar').value,
        name: document.getElementById('contributor-intro-name').value,
        role: linkedContributor?.role || '贡献者',
        exp: document.getElementById('contributor-intro-exp').value,
        projects: document.getElementById('contributor-intro-projects').value,
        passion: document.getElementById('contributor-intro-passion').value,
        bio: document.getElementById('contributor-intro-bio').value,
        techStack: document.getElementById('contributor-intro-tech').value.split(',').map(s => s.trim()).filter(s => s),
        github: document.getElementById('contributor-intro-github').value,
        email: document.getElementById('contributor-intro-email').value,
        qq: document.getElementById('contributor-intro-qq').value,
        weixin: document.getElementById('contributor-intro-weixin').value
      };

      if (!adminData.contributorsIntro) adminData.contributorsIntro = [];
      const index = adminData.contributorsIntro.findIndex(i => i.id === id);
      if (index > -1) {
        adminData.contributorsIntro[index] = introData;
      } else {
        adminData.contributorsIntro.push(introData);
      }

      closeModal('contributor-intro-modal');
      renderIntro();
      saveAdminData(true);
    });

    // ===== 主题设置 =====
    let themeSettings = (siteData.themeSettings && Object.keys(siteData.themeSettings).length > 0) ? JSON.parse(JSON.stringify(siteData.themeSettings)) : {
      globalTheme: 'light',
      glassEffect: true,
      transparentCards: true,
      particleEffect: true,
      animations: true,
      shadowEffect: true,
      colorTheme: 'blue',
      customColor: '#3B82F6',
      glassIntensity: 6,
      cardEffects: {
        github: { glass: true, shadow: true },
        about: { glass: true, shadow: true },
        repo: { glass: true, shadow: true },
        log: { glass: true, shadow: true },
        contributor: { glass: true, shadow: true }
      }
    };

    function saveThemeSettings() {
      if (!adminData.themeSettings) adminData.themeSettings = {};
      Object.assign(adminData.themeSettings, themeSettings);
      siteData.themeSettings = JSON.parse(JSON.stringify(themeSettings));
      saveAdminData(true);
      if (window.PageSync) {
        window.PageSync.send('theme_settings_change', themeSettings);
      }
    }

    function applyThemeSettings() {
      if (!adminData.themeSettings) adminData.themeSettings = {};
      Object.assign(adminData.themeSettings, themeSettings);
      siteData.themeSettings = JSON.parse(JSON.stringify(themeSettings));
      saveAdminData(true);
      if (window.PageSync) {
        window.PageSync.send('theme_settings_change', themeSettings);
      }
      showToast('主题设置已应用');
    }

    // 主题设置 DOM 操作需要等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      // 全局主题选择 - 直接绑定到每个卡片
      document.querySelectorAll('.theme-card').forEach(function(card) {
        card.addEventListener('click', function() {
          document.querySelectorAll('.theme-card').forEach(function(c) { c.classList.remove('active'); });
          this.classList.add('active');
          themeSettings.globalTheme = this.dataset.globalTheme;
          saveThemeSettings();
        });
      });

      // 加载主题设置
      loadThemeSettings();
    });

    // 效果开关
    document.getElementById('glass-effect-toggle').addEventListener('change', function() {
      themeSettings.glassEffect = this.checked;
      saveThemeSettings();
    });

    document.getElementById('glass-card-toggle').addEventListener('change', function() {
      themeSettings.transparentCards = this.checked;
      saveThemeSettings();
    });

    document.getElementById('particle-effect-toggle').addEventListener('change', function() {
      themeSettings.particleEffect = this.checked;
      saveThemeSettings();
    });

    document.getElementById('animations-toggle').addEventListener('change', function() {
      themeSettings.animations = this.checked;
      saveThemeSettings();
    });

    document.getElementById('shadow-effect-toggle').addEventListener('change', function() {
      themeSettings.shadowEffect = this.checked;
      saveThemeSettings();
    });

    // 颜色主题
    document.querySelectorAll('.color-theme-item').forEach(item => {
      item.addEventListener('click', function() {
        document.querySelectorAll('.color-theme-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        themeSettings.colorTheme = this.dataset.colorTheme;
        themeSettings.customColor = getComputedStyle(this).getPropertyValue('--theme-color');
        saveThemeSettings();
      });
    });

    // 自定义颜色
    document.getElementById('custom-theme-color').addEventListener('input', function() {
      themeSettings.customColor = this.value;
      document.querySelectorAll('.color-theme-item').forEach(i => i.classList.remove('active'));
      saveThemeSettings();
    });

    // 毛玻璃强度
    document.getElementById('glass-intensity').addEventListener('input', function() {
      themeSettings.glassIntensity = parseInt(this.value);
      document.getElementById('glass-intensity-value').textContent = this.value + 'px';
      saveThemeSettings();
    });

    // 重置主题
    document.getElementById('reset-theme-settings').addEventListener('click', function() {
      themeSettings = {
        globalTheme: 'light',
        glassEffect: true,
        transparentCards: true,
        particleEffect: true,
        animations: true,
        shadowEffect: true,
        colorTheme: 'blue',
        customColor: '#3B82F6',
        glassIntensity: 6,
        cardEffects: {
          github: { glass: true, shadow: true },
          about: { glass: true, shadow: true },
          repo: { glass: true, shadow: true },
          log: { glass: true, shadow: true },
          contributor: { glass: true, shadow: true }
        }
      };
      saveThemeSettings();
      loadThemeSettings();
      showToast('主题设置已重置');
    });

    // 应用主题
    document.getElementById('apply-theme-settings').addEventListener('click', applyThemeSettings);

    function loadThemeSettings() {
      if (!adminData.themeSettings) adminData.themeSettings = {};
      Object.assign(adminData.themeSettings, themeSettings);

      document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.globalTheme === themeSettings.globalTheme);
      });
      document.getElementById('glass-effect-toggle').checked = themeSettings.glassEffect;
      document.getElementById('glass-card-toggle').checked = themeSettings.transparentCards;
      document.getElementById('particle-effect-toggle').checked = themeSettings.particleEffect;
      document.getElementById('animations-toggle').checked = themeSettings.animations;
      document.getElementById('shadow-effect-toggle').checked = themeSettings.shadowEffect;
      document.querySelectorAll('.color-theme-item').forEach(item => {
        item.classList.toggle('active', item.dataset.colorTheme === themeSettings.colorTheme);
      });
      document.getElementById('custom-theme-color').value = themeSettings.customColor;
      document.getElementById('glass-intensity').value = themeSettings.glassIntensity;
      document.getElementById('glass-intensity-value').textContent = themeSettings.glassIntensity + 'px';

      // 加载单独卡片效果设置
      if (!themeSettings.cardEffects) {
        themeSettings.cardEffects = {
          github: { glass: true, shadow: true },
          about: { glass: true, shadow: true },
          repo: { glass: true, shadow: true },
          log: { glass: true, shadow: true },
          contributor: { glass: true, shadow: true }
        };
      }
      document.querySelectorAll('.card-glass-toggle').forEach(toggle => {
        const card = toggle.dataset.card;
        if (themeSettings.cardEffects[card]) {
          toggle.checked = themeSettings.cardEffects[card].glass;
        }
      });
      document.querySelectorAll('.card-shadow-toggle').forEach(toggle => {
        const card = toggle.dataset.card;
        if (themeSettings.cardEffects[card]) {
          toggle.checked = themeSettings.cardEffects[card].shadow;
        }
      });
    }

    // 单独卡片效果开关
    document.querySelectorAll('.card-glass-toggle').forEach(toggle => {
      toggle.addEventListener('change', function() {
        const card = this.dataset.card;
        if (!themeSettings.cardEffects) {
          themeSettings.cardEffects = {};
        }
        if (!themeSettings.cardEffects[card]) {
          themeSettings.cardEffects[card] = { glass: true, shadow: true };
        }
        themeSettings.cardEffects[card].glass = this.checked;
        saveThemeSettings();
      });
    });

    document.querySelectorAll('.card-shadow-toggle').forEach(toggle => {
      toggle.addEventListener('change', function() {
        const card = this.dataset.card;
        if (!themeSettings.cardEffects) {
          themeSettings.cardEffects = {};
        }
        if (!themeSettings.cardEffects[card]) {
          themeSettings.cardEffects[card] = { glass: true, shadow: true };
        }
        themeSettings.cardEffects[card].shadow = this.checked;
        saveThemeSettings();
      });
    });

    // ===== 技能标签管理 =====
    function renderSkills(filter = 'all') {
      const grid = document.getElementById('skills-grid');
      const filteredSkills = filter === 'all' ? adminData.skills : adminData.skills.filter(s => s.category === filter);
      const currentFilter = filter === 'all' ? adminData.skills : filteredSkills;
      grid.innerHTML = filteredSkills.map((skill, index) => `
        <div class="skill-tag" style="animation-delay: ${index * 0.03}s;" data-id="${skill.id}">
          <i class="fa ${normalizeSkillIcon(skill.icon)}" style="color: ${skill.color}"></i>
          <span>${skill.name}</span>
          <span class="skill-category">${skill.category}</span>
          ${index > 0 ? `<span class="skill-move" onclick="moveSkill(${skill.id}, -1)"><i class="fa fa-chevron-up"></i></span>` : ''}
          ${index < currentFilter.length - 1 ? `<span class="skill-move" onclick="moveSkill(${skill.id}, 1)"><i class="fa fa-chevron-down"></i></span>` : ''}
          <span class="skill-edit" onclick="editSkill(${skill.id})"><i class="fa fa-edit"></i></span>
          <span class="skill-remove" onclick="removeSkill(${skill.id})">&times;</span>
        </div>
      `).join('');
    }

    function moveSkill(id, direction) {
      const index = adminData.skills.findIndex(s => s.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < adminData.skills.length - 1))) {
        const temp = adminData.skills[index];
        adminData.skills[index] = adminData.skills[index + direction];
        adminData.skills[index + direction] = temp;
        saveAdminData();
        const currentFilter = document.querySelector('.skill-filter-btn.active')?.dataset.filter || 'all';
        renderSkills(currentFilter);
        showToast('顺序已更新');
      }
    }

    window.moveSkill = moveSkill;

    function editSkill(id) {
      const skill = adminData.skills.find(s => s.id === id);
      if (skill) {
        document.getElementById('skill-name').value = skill.name;
        const normalizedIcon = normalizeSkillIcon(skill.icon);
        document.getElementById('skill-icon').value = normalizedIcon;
        document.getElementById('skill-category').value = skill.category;
        document.getElementById('skill-color').value = skill.color;
        document.getElementById('skill-id').value = id;
        // 选中图标
        document.querySelectorAll('.icon-picker-btn').forEach(btn => {
          btn.classList.toggle('selected', btn.dataset.icon === normalizedIcon);
        });
        openModal('skill-modal');
      }
    }

    window.editSkill = editSkill;

    function removeSkill(id) {
      adminData.skills = adminData.skills.filter(s => s.id !== id);
      saveAdminData();
      const currentFilter = document.querySelector('.skill-filter-btn.active')?.dataset.filter || 'all';
      renderSkills(currentFilter);
      showToast('标签已删除');
    }

    document.querySelectorAll('.skill-filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.skill-filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderSkills(this.dataset.filter);
      });
    });

    function resetSkillForm() {
      const form = document.getElementById('skill-form');
      form.reset();
      document.getElementById('skill-id').value = '';
      document.getElementById('skill-icon').value = 'fa-code';
      document.querySelectorAll('.icon-picker-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.icon === 'fa-code');
      });
    }

    document.getElementById('add-skill-btn').addEventListener('click', () => {
      resetSkillForm();
      openModal('skill-modal');
    });

    // ===== 项目管理 =====
    function renderProjects() {
      const list = document.getElementById('projects-list');
      list.innerHTML = adminData.projects.map((proj, index) => `
        <div class="project-card" style="animation-delay: ${index * 0.05}s;" data-id="${proj.id}">
          <div class="project-info">
            <div class="project-name">${proj.name}</div>
            <div class="project-desc">${proj.desc}</div>
            <a href="${proj.link}" class="project-link" target="_blank">查看项目 &rarr;</a>
          </div>
          <div class="project-actions" style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; gap: 5px;">
              ${index > 0 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveProject(${proj.id}, -1)"><i class="fa fa-chevron-up"></i></button>` : ''}
              ${index < adminData.projects.length - 1 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveProject(${proj.id}, 1)"><i class="fa fa-chevron-down"></i></button>` : ''}
            </div>
            <div style="display: flex; gap: 5px;">
              <button class="project-action-btn" onclick="editProject(${proj.id})">编辑</button>
              <button class="project-action-btn danger" onclick="removeProject(${proj.id})">删除</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    function moveProject(id, direction) {
      const index = adminData.projects.findIndex(p => p.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < adminData.projects.length - 1))) {
        const temp = adminData.projects[index];
        adminData.projects[index] = adminData.projects[index + direction];
        adminData.projects[index + direction] = temp;
        saveAdminData();
        renderProjects();
        showToast('顺序已更新');
      }
    }

    window.moveProject = moveProject;

    function removeProject(id) {
      adminData.projects = adminData.projects.filter(p => p.id !== id);
      saveAdminData();
      renderProjects();
      showToast('项目已删除');
    }

    function editProject(id) {
      const proj = adminData.projects.find(p => p.id === id);
      if (proj) {
        document.getElementById('project-name').value = proj.name;
        document.getElementById('project-desc').value = proj.desc;
        document.getElementById('project-link').value = proj.link;
        document.getElementById('project-id').value = id;
        openModal('project-modal');
      }
    }

    document.getElementById('add-project-btn').addEventListener('click', () => {
      document.getElementById('project-name').value = '';
      document.getElementById('project-desc').value = '';
      document.getElementById('project-link').value = '';
      document.getElementById('project-id').value = '';
      openModal('project-modal');
    });

    // ===== 更新日志 =====
    function renderChangelog() {
      const list = document.getElementById('changelog-list');
      list.innerHTML = adminData.changelog.map((item, index) => `
        <div class="changelog-item" style="animation-delay: ${index * 0.05}s;" data-id="${item.id}">
          <div class="changelog-version">${item.version}</div>
          <div class="changelog-date">${item.date}</div>
          <ul style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${item.items.map(i => `<li class="log-item"><i class="fa fa-check-circle"></i><span>${i}</span></li>`).join('')}
          </ul>
          <div class="changelog-tags">
            ${item.tags.map(tag => `<span class="changelog-tag">${tag}</span>`).join('')}
          </div>
          <div class="project-actions" style="margin-top: 0.75rem; display: flex; gap: 5px;">
            ${index > 0 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveChangelog(${item.id}, -1)"><i class="fa fa-chevron-up"></i></button>` : ''}
            ${index < adminData.changelog.length - 1 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveChangelog(${item.id}, 1)"><i class="fa fa-chevron-down"></i></button>` : ''}
            <button class="project-action-btn" onclick="editChangelog(${item.id})">编辑</button>
            <button class="project-action-btn danger" onclick="removeChangelog(${item.id})">删除</button>
          </div>
        </div>
      `).join('');
    }

    function moveChangelog(id, direction) {
      const index = adminData.changelog.findIndex(c => c.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < adminData.changelog.length - 1))) {
        const temp = adminData.changelog[index];
        adminData.changelog[index] = adminData.changelog[index + direction];
        adminData.changelog[index + direction] = temp;
        saveAdminData();
        renderChangelog();
        showToast('顺序已更新');
      }
    }

    window.moveChangelog = moveChangelog;

    function removeChangelog(id) {
      adminData.changelog = adminData.changelog.filter(c => c.id !== id);
      saveAdminData();
      renderChangelog();
      showToast('更新日志已删除');
    }

    function editChangelog(id) {
      const item = adminData.changelog.find(c => c.id === id);
      if (item) {
        document.getElementById('changelog-version').value = item.version;
        document.getElementById('changelog-date').value = item.date;
        document.getElementById('changelog-items').value = item.items.join('\n');
        document.getElementById('changelog-tags').value = item.tags ? item.tags.join(', ') : '';
        document.getElementById('changelog-id').value = id;
        openModal('changelog-modal');
      }
    }

    document.getElementById('add-changelog-btn').addEventListener('click', () => {
      document.getElementById('changelog-version').value = '';
      document.getElementById('changelog-date').value = '';
      document.getElementById('changelog-items').value = '';
      document.getElementById('changelog-tags').value = '';
      document.getElementById('changelog-id').value = '';
      openModal('changelog-modal');
    });

    // ===== 贡献者 =====
    function renderContributors() {
      const list = document.getElementById('contributors-list');
      list.innerHTML = adminData.contributors.map((c, index) => `
        <div class="contributor-card" style="animation-delay: ${index * 0.05}s; display: flex; justify-content: space-between; align-items: center;" data-id="${c.id}">
          <div class="contributor-info">
            ${c.avatar ? `<img src="${c.avatar}" class="contributor-avatar-img" alt="${c.name}">` : `<div class="contributor-avatar">${c.name.charAt(0)}</div>`}
            <div class="contributor-details">
              <h5>${c.name}</h5>
              <div class="contributor-role">${c.role}</div>
              ${c.link ? `<a href="${c.link}" class="contributor-link" target="_blank">查看主页 &rarr;</a>` : ''}
            </div>
          </div>
          <div class="project-actions" style="display: flex; gap: 5px; flex-shrink: 0;">
            <div style="display: flex; gap: 3px;">
              ${index > 0 ? `<button class="project-action-btn" style="padding: 4px 6px;" onclick="moveContributor(${c.id}, -1)"><i class="fa fa-chevron-up"></i></button>` : ''}
              ${index < adminData.contributors.length - 1 ? `<button class="project-action-btn" style="padding: 4px 6px;" onclick="moveContributor(${c.id}, 1)"><i class="fa fa-chevron-down"></i></button>` : ''}
            </div>
            <button class="project-action-btn" onclick="editContributor(${c.id})"><i class="fa fa-edit"></i></button>
            <button class="project-action-btn danger" onclick="removeContributor(${c.id})"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      `).join('');
    }

    function moveContributor(id, direction) {
      const index = adminData.contributors.findIndex(c => c.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < adminData.contributors.length - 1))) {
        const temp = adminData.contributors[index];
        adminData.contributors[index] = adminData.contributors[index + direction];
        adminData.contributors[index + direction] = temp;
        saveAdminData();
        renderContributors();
        showToast('顺序已更新');
      }
    }

    window.moveContributor = moveContributor;

    function editContributor(id) {
      const c = adminData.contributors.find(c => c.id === id);
      if (c) {
        document.getElementById('contributor-name').value = c.name;
        document.getElementById('contributor-role').value = c.role || '';
        document.getElementById('contributor-link').value = c.link || '';
        document.getElementById('contributor-id').value = id;
        updateAvatarPicker('contributor-avatar-url', 'contributor-avatar-preview', 'contributor-avatar-placeholder', c.avatar || '');
        openModal('contributor-modal');
      }
    }

    window.editContributor = editContributor;

    function removeContributor(id) {
      adminData.contributors = adminData.contributors.filter(c => c.id !== id);
      if (adminData.contributorGrowth) {
        delete adminData.contributorGrowth[id];
      }
      if (adminData.contributorsIntro) {
        adminData.contributorsIntro = adminData.contributorsIntro.map(item => {
          if (item.contributorId !== id) return item;
          return { ...item, contributorId: null };
        });
      }
      saveAdminData();
      renderContributors();
      renderIntro();
      renderGrowth();
      showToast('贡献者已删除');
    }

    function resetContributorForm() {
      const form = document.getElementById('contributor-form');
      form.reset();
      document.getElementById('contributor-id').value = '';
      updateAvatarPicker('contributor-avatar-url', 'contributor-avatar-preview', 'contributor-avatar-placeholder', '');
    }
    document.getElementById('add-contributor-btn').addEventListener('click', () => {
      resetContributorForm();
      openModal('contributor-modal');
    });

    // ===== 成长历程 =====
    function renderGrowth() {
      const timeline = document.getElementById('growth-timeline');
      timeline.innerHTML = adminData.growth.map((item, index) => `
        <div class="growth-item" style="animation-delay: ${index * 0.05}s;" data-id="${item.id}">
          <div class="growth-date">${item.date}</div>
          <div class="growth-title">${item.title}</div>
          <div class="growth-desc">${item.desc}</div>
          <div class="growth-actions" style="display: flex; gap: 5px; margin-top: 10px;">
            ${index > 0 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveGrowth(${item.id}, -1)"><i class="fa fa-chevron-up"></i></button>` : ''}
            ${index < adminData.growth.length - 1 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveGrowth(${item.id}, 1)"><i class="fa fa-chevron-down"></i></button>` : ''}
            <button class="project-action-btn" onclick="editGrowth(${item.id})">编辑</button>
            <button class="project-action-btn danger" onclick="removeGrowth(${item.id})">删除</button>
          </div>
        </div>
      `).join('');

      // 渲染贡献人成长历程
      const contributorTimeline = document.getElementById('contributor-growth-timeline');
      const contributorGrowth = adminData.contributorGrowth || {};
      let html = '';

      // 按贡献人分组显示
      const contributors = adminData.contributors || [];
      contributors.forEach(contributor => {
        const items = contributorGrowth[contributor.id] || [];
        if (items.length > 0) {
          html += `<div style="margin-bottom: 1.5rem;">
            <h5 style="font-size: 0.9rem; color: var(--accent); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              ${contributor.avatar ? `<img src="${contributor.avatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;">` : ''}
              ${contributor.name} 的成长历程
            </h5>`;
          html += items.map((item, index) => `
            <div class="growth-item" data-id="${item.id}" data-contributor="${contributor.id}">
              <div class="growth-date">${item.date}</div>
              <div class="growth-title">${item.title}</div>
              <div class="growth-desc">${item.desc}</div>
              <div class="growth-actions" style="display: flex; gap: 5px; margin-top: 10px;">
                ${index > 0 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveContributorGrowth(${contributor.id}, ${item.id}, -1)"><i class="fa fa-chevron-up"></i></button>` : ''}
                ${index < items.length - 1 ? `<button class="project-action-btn" style="padding: 4px 8px;" onclick="moveContributorGrowth(${contributor.id}, ${item.id}, 1)"><i class="fa fa-chevron-down"></i></button>` : ''}
                <button class="project-action-btn" onclick="editContributorGrowth(${contributor.id}, ${item.id})">编辑</button>
                <button class="project-action-btn danger" onclick="removeContributorGrowth(${contributor.id}, ${item.id})">删除</button>
              </div>
            </div>
          `).join('');
          html += '</div>';
        }
      });

      if (!html) {
        html = '<p style="color: var(--text-sub); font-size: 0.9rem;">暂无贡献人成长历程，请先添加贡献者后再添加</p>';
      }
      contributorTimeline.innerHTML = html;
    }

    function moveGrowth(id, direction) {
      const index = adminData.growth.findIndex(g => g.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < adminData.growth.length - 1))) {
        const temp = adminData.growth[index];
        adminData.growth[index] = adminData.growth[index + direction];
        adminData.growth[index + direction] = temp;
        saveAdminData();
        renderGrowth();
        showToast('顺序已更新');
      }
    }

    window.moveGrowth = moveGrowth;

    function removeGrowth(id) {
      adminData.growth = adminData.growth.filter(g => g.id !== id);
      saveAdminData();
      renderGrowth();
      showToast('里程碑已删除');
    }

    function editGrowth(id) {
      const item = adminData.growth.find(g => g.id === id);
      if (item) {
        document.getElementById('growth-date').value = item.date;
        document.getElementById('growth-title').value = item.title;
        document.getElementById('growth-desc').value = item.desc;
        document.getElementById('growth-id').value = id;
        openModal('growth-modal');
      }
    }

    document.getElementById('add-growth-btn').addEventListener('click', () => {
      document.getElementById('growth-date').value = '';
      document.getElementById('growth-title').value = '';
      document.getElementById('growth-desc').value = '';
      document.getElementById('growth-id').value = '';
      openModal('growth-modal');
    });

    // ===== 贡献人成长历程 =====
    document.getElementById('add-contributor-growth-btn').addEventListener('click', () => {
      const contributors = adminData.contributors || [];
      if (contributors.length === 0) {
        showToast('请先添加贡献者');
        return;
      }
      populateContributorOptions('contributor-growth-contributor');
      document.getElementById('contributor-growth-contributor').value = contributors[0]?.id || '';
      document.getElementById('contributor-growth-date').value = '';
      document.getElementById('contributor-growth-title').value = '';
      document.getElementById('contributor-growth-desc').value = '';
      document.getElementById('contributor-growth-id').value = '';
      document.getElementById('contributor-growth-original-contributor').value = '';
      openModal('contributor-growth-modal');
    });

    window.moveContributorGrowth = function(contributorId, id, direction) {
      const contributorGrowth = adminData.contributorGrowth || {};
      const items = contributorGrowth[contributorId] || [];
      const index = items.findIndex(g => g.id === id);
      if (index > -1 && ((direction === -1 && index > 0) || (direction === 1 && index < items.length - 1))) {
        const temp = items[index];
        items[index] = items[index + direction];
        items[index + direction] = temp;
        adminData.contributorGrowth[contributorId] = items;
        saveAdminData();
        renderGrowth();
        showToast('顺序已更新');
      }
    };

    window.removeContributorGrowth = function(contributorId, id) {
      const contributorGrowth = adminData.contributorGrowth || {};
      const items = contributorGrowth[contributorId] || [];
      adminData.contributorGrowth[contributorId] = items.filter(g => g.id !== id);
      saveAdminData();
      renderGrowth();
      showToast('里程碑已删除');
    };

    window.editContributorGrowth = function(contributorId, id) {
      const contributorGrowth = adminData.contributorGrowth || {};
      const items = contributorGrowth[contributorId] || [];
      const item = items.find(g => g.id === id);
      if (item) {
        populateContributorOptions('contributor-growth-contributor', { selectedId: contributorId });
        document.getElementById('contributor-growth-date').value = item.date;
        document.getElementById('contributor-growth-title').value = item.title;
        document.getElementById('contributor-growth-desc').value = item.desc;
        document.getElementById('contributor-growth-id').value = id;
        document.getElementById('contributor-growth-original-contributor').value = contributorId;
        openModal('contributor-growth-modal');
      }
    };

    document.getElementById('contributor-growth-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const contributorId = parseInt(document.getElementById('contributor-growth-contributor').value);
      const id = parseInt(document.getElementById('contributor-growth-id').value) || Date.now();
      const originalContributorId = parseInt(document.getElementById('contributor-growth-original-contributor').value);
      const newItem = {
        id: id,
        date: document.getElementById('contributor-growth-date').value,
        title: document.getElementById('contributor-growth-title').value,
        desc: document.getElementById('contributor-growth-desc').value
      };

      if (!adminData.contributorGrowth) adminData.contributorGrowth = {};
      if (originalContributorId && originalContributorId !== contributorId) {
        adminData.contributorGrowth[originalContributorId] = (adminData.contributorGrowth[originalContributorId] || []).filter(g => g.id !== id);
      }
      const items = adminData.contributorGrowth[contributorId] || [];
      const index = items.findIndex(g => g.id === id);
      if (index > -1) {
        items[index] = newItem;
      } else {
        items.push(newItem);
      }
      adminData.contributorGrowth[contributorId] = items;

      closeModal('contributor-growth-modal');
      renderGrowth();
      this.reset();
      document.getElementById('contributor-growth-original-contributor').value = '';
      saveAdminData(true);
    });

    // ===== 模态框 =====
    function openModal(modalId) {
      document.getElementById(modalId).classList.add('active');
    }

    function closeModal(modalId) {
      document.getElementById(modalId).classList.remove('active');
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', function() {
        this.closest('.modal-overlay').classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('.modal-cancel').forEach(btn => {
      btn.addEventListener('click', function() {
        this.closest('.modal-overlay').classList.remove('active');
      });
    });

    // ===== 表单提交处理 =====
    // 图标选择器交互
    document.querySelectorAll('.icon-picker-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.icon-picker-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('skill-icon').value = this.dataset.icon;
      });
    });

    document.getElementById('skill-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('skill-name').value;
      const icon = normalizeSkillIcon(document.getElementById('skill-icon').value);
      const category = document.getElementById('skill-category').value;
      const color = document.getElementById('skill-color').value;
      const id = parseInt(document.getElementById('skill-id').value) || Date.now();

      if (document.getElementById('skill-id').value) {
        const skill = adminData.skills.find(s => s.id === parseInt(document.getElementById('skill-id').value));
        if (skill) {
          skill.name = name;
          skill.icon = icon;
          skill.category = category;
          skill.color = color;
        }
      } else {
        adminData.skills.push({ id, name, icon, category, color });
      }

      saveAdminData();
      renderSkills();
      closeModal('skill-modal');
      resetSkillForm();
      showToast('标签已保存');
    });

    document.getElementById('project-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('project-name').value;
      const desc = document.getElementById('project-desc').value;
      const link = document.getElementById('project-link').value;
      const id = parseInt(document.getElementById('project-id').value) || Date.now();

      if (document.getElementById('project-id').value) {
        const proj = adminData.projects.find(p => p.id === parseInt(document.getElementById('project-id').value));
        if (proj) {
          proj.name = name;
          proj.desc = desc;
          proj.link = link;
        }
      } else {
        adminData.projects.push({ id, name, desc, link });
      }

      saveAdminData();
      renderProjects();
      closeModal('project-modal');
      this.reset();
      showToast('项目已保存');
    });

    document.getElementById('changelog-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const version = document.getElementById('changelog-version').value;
      const date = document.getElementById('changelog-date').value;
      const items = document.getElementById('changelog-items').value.split('\n').map(t => t.trim()).filter(t => t);
      const tags = document.getElementById('changelog-tags').value.split(',').map(t => t.trim()).filter(t => t);
      const id = parseInt(document.getElementById('changelog-id').value) || Date.now();

      if (document.getElementById('changelog-id').value) {
        const item = adminData.changelog.find(c => c.id === parseInt(document.getElementById('changelog-id').value));
        if (item) {
          item.version = version;
          item.date = date;
          item.items = items;
          item.tags = tags;
        }
      } else {
        adminData.changelog.push({ id, version, date, items, tags });
      }

      saveAdminData();
      renderChangelog();
      closeModal('changelog-modal');
      this.reset();
      showToast('更新日志已保存');
    });

    bindAvatarPicker('contributor-avatar-url', 'contributor-avatar-preview', 'contributor-avatar-placeholder', 'contributor-avatar-upload');
    bindAvatarPicker('contributor-intro-avatar', 'contributor-intro-avatar-preview', 'contributor-intro-avatar-placeholder', 'contributor-intro-avatar-upload');
    bindAvatarPicker('intro-avatar', 'intro-avatar-preview', 'intro-avatar-placeholder', 'intro-avatar-upload');

    document.getElementById('contributor-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('contributor-name').value;
      const role = document.getElementById('contributor-role').value;
      const link = document.getElementById('contributor-link').value.trim();
      const avatar = document.getElementById('contributor-avatar-url').value;
      const id = parseInt(document.getElementById('contributor-id').value) || Date.now();

      if (document.getElementById('contributor-id').value) {
        const c = adminData.contributors.find(c => c.id === parseInt(document.getElementById('contributor-id').value));
        if (c) {
          c.name = name;
          c.role = role;
          c.link = link;
          c.avatar = avatar;
        }
      } else {
        adminData.contributors.push({ id, name, role, link, avatar });
      }

      saveAdminData();
      renderContributors();
      renderIntro();
      renderGrowth();
      closeModal('contributor-modal');
      resetContributorForm();
      showToast('贡献者已保存');
    });

    document.getElementById('growth-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const date = document.getElementById('growth-date').value;
      const title = document.getElementById('growth-title').value;
      const desc = document.getElementById('growth-desc').value;
      const id = parseInt(document.getElementById('growth-id').value) || Date.now();

      if (document.getElementById('growth-id').value) {
        const item = adminData.growth.find(g => g.id === parseInt(document.getElementById('growth-id').value));
        if (item) {
          item.date = date;
          item.title = title;
          item.desc = desc;
        }
      } else {
        adminData.growth.push({ id, date, title, desc });
      }

      saveAdminData();
      renderGrowth();
      closeModal('growth-modal');
      this.reset();
      showToast('里程碑已保存');
    });

    // ===== 数据导入导出 =====
    document.getElementById('export-data-btn').addEventListener('click', function() {
      const dataStr = `// 网站数据配置 - 修改这里即可更新网站内容\nconst siteData = ${JSON.stringify(adminData, null, 2)};`;
      const blob = new Blob([dataStr], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.js';
      a.click();
      URL.revokeObjectURL(url);
      showToast('已导出 data.js，请替换 js/data.js');
    });

    document.getElementById('import-data-input').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            let importedData;
            const content = event.target.result;

            if (file.name.endsWith('.js')) {
              const startMatch = content.indexOf('const siteData = {');
              if (startMatch === -1) {
                throw new Error('未找到 siteData 对象');
              }
              const jsonStr = content.substring(startMatch + 'const siteData = '.length);
              let braceCount = 0;
              let endPos = -1;
              for (let i = 0; i < jsonStr.length; i++) {
                if (jsonStr[i] === '{') braceCount++;
                else if (jsonStr[i] === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    endPos = i + 1;
                    break;
                  }
                }
              }
              if (endPos > 0) {
                importedData = JSON.parse(jsonStr.substring(0, endPos));
              } else {
                throw new Error('无法解析siteData对象');
              }
            } else {
              importedData = JSON.parse(content);
            }

            if (confirm('导入将覆盖现有数据，确定继续吗？')) {
              if (importedData.skills) adminData.skills = importedData.skills;
              if (importedData.projects) adminData.projects = importedData.projects;
              if (importedData.changelog) adminData.changelog = importedData.changelog;
              if (importedData.contributors) adminData.contributors = importedData.contributors;
              if (importedData.about) adminData.about = importedData.about;
              if (importedData.contributorsIntro) adminData.contributorsIntro = importedData.contributorsIntro;
              if (importedData.contributorGrowth) adminData.contributorGrowth = importedData.contributorGrowth;
              if (importedData.resources) adminData.resources = importedData.resources;
              if (importedData.mediaPlatforms) adminData.mediaPlatforms = importedData.mediaPlatforms;
              if (importedData.platformTypes) adminData.platformTypes = importedData.platformTypes;

              // 等待保存完成后再加载
              (async () => {
                await saveAdminData();
                await loadAllContent();
                showToast('数据已从 ' + file.name + ' 导入并更新到各个模块');
              })();
            }
          } catch (err) {
            console.error(err);
            showToast('导入失败：无效的文件格式，请确保是data.js或标准JSON文件');
          }
        };
        reader.readAsText(file);
      }
      e.target.value = '';
    });

    document.getElementById('clear-all-data-btn').addEventListener('click', function() {
      if (confirm('确定要清空所有内容数据吗？此操作不可恢复！')) {
        adminData = normalizeSkillData(JSON.parse(JSON.stringify(siteData)));
        (async () => {
          await saveAdminData();
          await loadAllContent();
          showToast('数据已清空');
        })();
      }
    });

    // ===== 初始化加载：优先从本地服务器读取 =====
    async function loadAllContent() {
      // file:// 协议直接用默认数据
      if (window.location.protocol === 'file:') {
        adminData = normalizeSkillData(JSON.parse(JSON.stringify(siteData)));
        serverReady = false;
      } else {
        try {
          const res = await fetch('/api/data');
          if (res.ok) {
            const serverData = await res.json();
            adminData = normalizeSkillData(serverData);
            serverReady = true;
          } else {
            adminData = normalizeSkillData(JSON.parse(JSON.stringify(siteData)));
            serverReady = false;
          }
        } catch (e) {
          adminData = normalizeSkillData(JSON.parse(JSON.stringify(siteData)));
          serverReady = false;
        }
      }

      loadThemeSettings();
      renderSkills();
      renderProjects();
      renderChangelog();
      renderContributors();
      renderGrowth();
      renderIntro();
      if (window.renderMediaPlatforms) {
        mediaData = adminData[MEDIA_KEY] ? JSON.parse(JSON.stringify(adminData[MEDIA_KEY])) : [];
        window.renderMediaPlatforms();
      }
    }

    loadAllContent();

    // ===== 说说发布功能 =====
    const MOMENTS_STORAGE_KEY = "paper-moments-v1";
    const MOMENT_DEMO_ENTRY = {
      mood: '柔软',
      type: '心理话',
      visibility: '只给自己看',
      content: '今天其实没有发生什么特别大的事。\n只是突然很想把心里的那一点点疲惫，认真放下来。\n有些话不一定要被别人理解，但至少可以先被自己接住。'
    };

    function loadMoments() {
      try {
        // 优先从 adminData 读取（data.js）
        if (adminData && adminData.moments && Array.isArray(adminData.moments)) {
          return adminData.moments;
        }
        // 降级到 localStorage
        const raw = localStorage.getItem(MOMENTS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch (error) {
        return [];
      }
    }

    function saveMoments(moments) {
      try {
        // 保存到 adminData
        if (adminData) {
          adminData.moments = moments;
          saveAdminData(true);
        }
        // 同时保存到 localStorage 作为备份
        localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(moments));
      } catch (error) {
        console.error('保存说说失败:', error);
      }
    }

    function escapeMomentHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function formatMomentContent(value) {
      return escapeMomentHtml(value).replace(/\n/g, '<br>');
    }

    function resetMomentForm() {
      document.getElementById('moment-mood').value = '柔软';
      document.getElementById('moment-type').value = '说说';
      document.getElementById('moment-visibility').value = '只给自己看';
      document.getElementById('moment-content').value = '';
      document.getElementById('moment-char-count').textContent = '0';
      document.getElementById('publish-moment-btn').removeAttribute('data-edit-id');
      document.getElementById('publish-moment-btn').innerHTML = '<i class="fa fa-paper-plane"></i> 发布说说';
    }

    function fillMomentDemo() {
      document.getElementById('moment-mood').value = MOMENT_DEMO_ENTRY.mood;
      document.getElementById('moment-type').value = MOMENT_DEMO_ENTRY.type;
      document.getElementById('moment-visibility').value = MOMENT_DEMO_ENTRY.visibility;
      document.getElementById('moment-content').value = MOMENT_DEMO_ENTRY.content;
      document.getElementById('moment-char-count').textContent = MOMENT_DEMO_ENTRY.content.length;
      document.getElementById('publish-moment-btn').removeAttribute('data-edit-id');
      document.getElementById('publish-moment-btn').innerHTML = '<i class="fa fa-paper-plane"></i> 发布说说';
    }

    function renderMomentsList() {
      const moments = loadMoments();
      const container = document.getElementById('moments-list');

      if (!moments.length) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">暂无发布的说说</p>';
        return;
      }

      container.innerHTML = moments.map((moment, index) => `
        <div class="moment-item" style="margin-bottom: 0.75rem; animation-delay: ${index * 0.05}s;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div class="changelog-version">
                <span class="badge" style="margin-right: 0.5rem; background: rgba(59, 130, 246, 0.1); color: var(--accent); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${moment.type}</span>
                ${moment.mood}
              </div>
              <div class="changelog-date">${moment.visibility} · ${new Date(moment.createdAt).toLocaleString('zh-CN')}</div>
              <div class="changelog-content" style="margin-top: 0.5rem;">${formatMomentContent(moment.content)}</div>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-shrink: 0; margin-left: 1rem;">
              <button class="btn btn-outline btn-sm" onclick="editMoment(${moment.id})">
                <i class="fa fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteMoment(${moment.id})">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    window.editMoment = function(id) {
      const moments = loadMoments();
      const moment = moments.find(m => m.id === id);
      if (!moment) return;

      document.getElementById('moment-mood').value = moment.mood;
      document.getElementById('moment-type').value = moment.type;
      document.getElementById('moment-visibility').value = moment.visibility;
      document.getElementById('moment-content').value = moment.content;
      document.getElementById('moment-char-count').textContent = moment.content.length;
      document.getElementById('publish-moment-btn').dataset.editId = id;
      document.getElementById('publish-moment-btn').innerHTML = '<i class="fa fa-save"></i> 保存修改';
      showToast('已加载说说内容，请修改后保存');
    };

    window.deleteMoment = function(id) {
      if (!confirm('确定要删除这条说说吗？')) return;

      let moments = loadMoments();
      moments = moments.filter(m => m.id !== id);
      saveMoments(moments);
      renderMomentsList();
      showToast('说说已删除');
    };

    document.getElementById('moment-content').addEventListener('input', function() {
      document.getElementById('moment-char-count').textContent = this.value.length;
    });

    document.getElementById('publish-moment-btn').addEventListener('click', function() {
      const content = document.getElementById('moment-content').value.trim();
      if (!content) {
        showToast('请输入说说内容');
        return;
      }

      let moments = loadMoments();
      const editId = this.dataset.editId ? parseInt(this.dataset.editId, 10) : null;
      const existingMoment = editId ? moments.find(m => m.id === editId) : null;

      const moment = {
        id: existingMoment ? existingMoment.id : Date.now(),
        mood: document.getElementById('moment-mood').value,
        type: document.getElementById('moment-type').value,
        visibility: document.getElementById('moment-visibility').value,
        content: content,
        createdAt: existingMoment ? existingMoment.createdAt : new Date().toISOString()
      };

      if (editId) {
        const index = moments.findIndex(m => m.id === editId);
        if (index !== -1) {
          moments[index] = moment;
        }
      } else {
        moments = [moment, ...moments];
      }

      saveMoments(moments);
      renderMomentsList();
      resetMomentForm();
      showToast(editId ? '说说已更新' : '说说已发布');
    });

    document.getElementById('clear-moment-form-btn').addEventListener('click', function() {
      resetMomentForm();
    });

    document.getElementById('fill-demo-moment-btn').addEventListener('click', function() {
      fillMomentDemo();
      showToast('示例页已铺好，可以直接发布或继续改');
    });

    // 初始化说说列表
    renderMomentsList();

    // Make edit functions global
    window.editProject = editProject;
    window.editChangelog = editChangelog;
    window.editGrowth = editGrowth;

    // ===== 访客统计：停留时间与跳出率 =====
    (function() {
      const entryTime = Date.now();
      const storageKey = 'site-analytics';
      let analytics = JSON.parse(localStorage.getItem(storageKey) || '{"totalTime":0,"bouncedVisits":0,"totalVisits":0}');
      analytics.totalVisits++;

      window.addEventListener('beforeunload', function() {
        const stayTime = Math.floor((Date.now() - entryTime) / 1000);
        analytics.totalTime += stayTime;
        if (stayTime < 10) analytics.bouncedVisits++;
        localStorage.setItem(storageKey, JSON.stringify(analytics));
      });

      function updateStats() {
        const avgStay = analytics.totalVisits > 0 ? Math.floor(analytics.totalTime / analytics.totalVisits) : 0;
        const bounceRate = analytics.totalVisits > 0 ? Math.round((analytics.bouncedVisits / analytics.totalVisits) * 100) : 0;

        const stayEl = document.getElementById('page-stay-time');
        if (stayEl) {
          const m = Math.floor(avgStay / 60);
          const s = avgStay % 60;
          stayEl.textContent = m + ':' + String(s).padStart(2, '0');
        }

        const bounceEl = document.getElementById('page-bounce-rate');
        if (bounceEl) {
          bounceEl.textContent = bounceRate + '%';
        }
      }

      setTimeout(updateStats, 1500);
      setInterval(updateStats, 5000);
    })();

    // ===== 用户管理：动态渲染访客列表 =====
    (function() {
      const storageKey = 'visitor-sessions';
      const adminKey = 'admin-login-count';

      function getSessions() {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
      }

      function saveSessions(sessions) {
        localStorage.setItem(storageKey, JSON.stringify(sessions));
      }

      function recordVisit() {
        let sessions = getSessions();
        let visitorId = sessionStorage.getItem('visitor-id');

        if (!visitorId) {
          visitorId = 'visitor-' + Date.now();
          sessionStorage.setItem('visitor-id', visitorId);
        }

        const now = new Date().toISOString();
        const existing = sessions.find(s => s.id === visitorId);

        if (existing) {
          existing.visitCount++;
          existing.lastVisit = now;
        } else {
          sessions.push({
            id: visitorId,
            role: 'guest',
            visitCount: 1,
            firstVisit: now,
            lastVisit: now
          });
        }

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        sessions = sessions.filter(s => new Date(s.lastVisit) > cutoff);

        saveSessions(sessions);
      }

      function formatTime(isoStr) {
        if (!isoStr) return '-';
        const d = new Date(isoStr);
        const Y = d.getFullYear();
        const M = String(d.getMonth() + 1).padStart(2, '0');
        const D = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `${Y}-${M}-${D} ${h}:${m}`;
      }

      function renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        let sessions = getSessions();
        sessions.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

        let adminCount = parseInt(localStorage.getItem(adminKey) || '0');

        let html = '';

let rowIndex = 0;
        html += '<tr style="animation-delay: ' + (rowIndex * 0.05) + 's;">' +
            '<td><div class="user-info"><img src="assets/avatar/huazhiyou.jpg" alt="用户头像"><span>管理员</span></div></td>' +
            '<td><span class="user-role admin">管理员</span></td>' +
            '<td>' + adminCount + '</td>' +
            '<td>' + formatTime(new Date().toISOString()) + '</td>' +
            '<td>' +
              '<button class="user-action-btn" data-user="admin" data-action="edit">编辑</button>' +
            '</td>' +
        '</tr>';

        sessions.forEach(function(s) {
          rowIndex++;
          html += '<tr style="animation-delay: ' + (rowIndex * 0.05) + 's;">' +
            '<td><div class="user-info"><div class="user-avatar-default">访</div><span>' + s.id.substring(0, 16) + '</span></div></td>' +
            '<td><span class="user-role guest">访客</span></td>' +
            '<td>' + s.visitCount + '</td>' +
            '<td>' + formatTime(s.lastVisit) + '</td>' +
            '<td>' +
              '<button class="user-action-btn danger" data-user="' + s.id + '" data-action="delete">删除</button>' +
            '</td>' +
          '</tr>';
        });

        tbody.innerHTML = html;
      }

      recordVisit();
      setTimeout(renderUsersTable, 500);

      document.addEventListener('click', function(e) {
        const btn = e.target.closest('.user-action-btn');
        if (!btn) return;

        const action = btn.dataset.action;
        const userId = btn.dataset.user;

        if (action === 'delete') {
          let sessions = getSessions();
          sessions = sessions.filter(s => s.id !== userId);
          saveSessions(sessions);
          renderUsersTable();
        }
      });
    })();

    // ===== 云端数据同步（Gist） =====
    (function() {
      const tokenInput = document.getElementById('cloud-token');
      const gistInput = document.getElementById('cloud-gist-id');
      const uploadBtn = document.getElementById('cloud-upload-btn');
      const downloadBtn = document.getElementById('cloud-download-btn');
      const mergeBtn = document.getElementById('cloud-merge-btn');
      const msgEl = document.getElementById('cloud-msg');
      const statusEl = document.getElementById('cloud-gist-status');

      if (!tokenInput || !uploadBtn) return;

      function showMsg(text, isError) {
        msgEl.textContent = text;
        msgEl.style.color = isError ? '#ef4444' : '#22c55e';
        setTimeout(function() { msgEl.textContent = ''; }, 4000);
      }

      function loadConfig() {
        if (!window.CloudSync) return;
        const cfg = window.CloudSync.getConfig();
        if (cfg.token) tokenInput.value = cfg.token;
        if (cfg.gistId) {
          gistInput.value = cfg.gistId;
          statusEl.textContent = '(已配置)';
        }
      }

      function saveConfig() {
        const token = tokenInput.value.trim();
        const gistId = gistInput.value.trim();
        if (token && window.CloudSync) window.CloudSync.setToken(token);
        if (gistId && window.CloudSync) {
          window.CloudSync.setGistId(gistId);
          statusEl.textContent = '(已配置)';
        }
      }

      tokenInput.addEventListener('change', saveConfig);
      gistInput.addEventListener('change', saveConfig);

      uploadBtn.addEventListener('click', async function() {
        saveConfig();
        try {
          uploadBtn.disabled = true;
          uploadBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 上传中...';
          await window.CloudSync.upload();
          showMsg('上传成功！');
        } catch (e) {
          showMsg('上传失败: ' + e.message, true);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = '<i class="fa fa-upload"></i> 上传';
        }
      });

      downloadBtn.addEventListener('click', async function() {
        saveConfig();
        try {
          downloadBtn.disabled = true;
          downloadBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 下载中...';
          await window.CloudSync.download();
          showMsg('下载成功！');
          location.reload();
        } catch (e) {
          showMsg('下载失败: ' + e.message, true);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = '<i class="fa fa-download"></i> 下载';
        }
      });

      mergeBtn.addEventListener('click', async function() {
        saveConfig();
        try {
          mergeBtn.disabled = true;
          mergeBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 合并中...';
          await window.CloudSync.merge();
          showMsg('合并成功！');
          location.reload();
        } catch (e) {
          showMsg('合并失败: ' + e.message, true);
        } finally {
          mergeBtn.disabled = false;
          mergeBtn.innerHTML = '<i class="fa fa-refresh"></i> 合并';
        }
      });

      loadConfig();
    })();

    // ===== 媒体平台管理全局变量 =====
    const MEDIA_KEY = 'mediaPlatforms';
    let mediaData = [];

    // ===== 媒体平台管理 =====
    document.addEventListener('DOMContentLoaded', function() {
      mediaData = adminData[MEDIA_KEY] ? JSON.parse(JSON.stringify(adminData[MEDIA_KEY])) : [];

      const PLATFORM_PRESETS = {
        bilibili: { name: 'Bilibili', icon: 'fa-play-circle', color: '#00A1D6', urlTpl: 'https://space.bilibili.com/{uid}' },
        youtube: { name: 'YouTube', icon: 'fa-youtube-play', color: '#FF0000', urlTpl: 'https://www.youtube.com/channel/{uid}' },
        douyin: { name: '抖音', icon: 'fa-music', color: '#000000', urlTpl: 'https://www.douyin.com/user/{uid}' },
        kuaishou: { name: '快手', icon: 'fa-video-camera', color: '#FF4906', urlTpl: 'https://www.kuaishou.com/profile/{uid}' },
        xiaohongshu: { name: '小红书', icon: 'fa-book', color: '#FE2C55', urlTpl: 'https://www.xiaohongshu.com/user/profile/{uid}' },
        weibo: { name: '微博', icon: 'fa-weibo', color: '#E6162D', urlTpl: 'https://weibo.com/u/{uid}' },
        custom: { name: '自定义', icon: 'fa-link', color: '#3B82F6', urlTpl: '{uid}' }
      };

      function renderMediaPlatforms() {
      const container = document.getElementById('media-platforms-list');
      if (!container) return;

      if (!mediaData || !mediaData.length) {
        container.innerHTML = '<p class="text-muted text-center" style="padding:2rem;">暂无媒体平台，点击下方按钮添加</p>';
        return;
      }

      container.innerHTML = mediaData.map(function(platform, pIdx) {
        var preset = PLATFORM_PRESETS[platform.type] || PLATFORM_PRESETS.custom;
        var icon = platform.icon || preset.icon;
        var color = platform.color || preset.color;
        var url = platform.url || (preset.urlTpl ? preset.urlTpl.replace('{uid}', platform.uid || '') : '');

        var videosHtml = (platform.videos || []).map(function(v, vIdx) {
          var coverHtml = v.cover ? '<img src="' + escapeHtml(v.cover) + '" class="media-video-item-cover" alt="" onerror="this.style.display=\'none\'">' : '';
          return '<div class="media-video-item" style="animation-delay: ' + (vIdx * 0.05) + 's;">' +
            coverHtml +
            '<div class="media-video-item-title">' + escapeHtml(v.title) + '</div>' +
            '<div class="media-video-item-meta">' +
              (v.views ? '<i class="fa fa-eye"></i> ' + escapeHtml(v.views) + ' ' : '') +
              (v.date ? '<i class="fa fa-clock-o"></i> ' + escapeHtml(v.date) : '') +
            '</div>' +
            '<button class="media-video-item-edit" data-platform="' + pIdx + '" data-video="' + vIdx + '" title="编辑"><i class="fa fa-edit"></i></button>' +
            '<button class="media-video-item-remove" data-platform="' + pIdx + '" data-video="' + vIdx + '" title="删除"><i class="fa fa-times"></i></button>' +
          '</div>';
        }).join('');

        return '<div class="media-platform-item" style="animation-delay: ' + (pIdx * 0.1) + 's;">' +
          '<div class="media-platform-item-header">' +
            '<div class="media-platform-item-icon" style="background:' + color + ';"><i class="fa ' + icon + '"></i></div>' +
            '<div class="media-platform-item-info">' +
              '<div class="media-platform-item-name">' + escapeHtml(platform.name || preset.name) + '</div>' +
              '<div class="media-platform-item-url">' + preset.name + '</div>' +
            '</div>' +
            '<div class="media-platform-item-actions">' +
              '<button class="btn btn-outline btn-sm media-edit-btn" data-index="' + pIdx + '"><i class="fa fa-edit"></i></button>' +
              '<button class="btn btn-outline btn-sm media-remove-btn" data-index="' + pIdx + '"><i class="fa fa-trash"></i></button>' +
            '</div>' +
          '</div>' +

          '<div class="media-platform-videos">' +
            '<div class="media-videos-header">' +
              '<span>视频列表</span>' +
              '<button class="btn btn-outline btn-sm media-add-video-btn" data-index="' + pIdx + '"><i class="fa fa-plus"></i> 添加视频</button>' +
            '</div>' +
            '<div class="media-video-list">' +
              videosHtml +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      }

      window.renderMediaPlatforms = renderMediaPlatforms;

      function saveMediaData() {
        adminData[MEDIA_KEY] = mediaData;
        saveAdminData(true);
      }

      function openMediaModal(platformIdx) {
        var platform = platformIdx !== null ? mediaData[platformIdx] : {};
        var preset = PLATFORM_PRESETS[platform.type] || {};

        var html = '<div class="media-config-header"><h4>' + (platformIdx !== null ? '编辑平台' : '添加平台') + '</h4><button class="modal-close" id="media-modal-close">&times;</button></div>' +
          '<div class="form-group"><label>平台类型</label><select id="media-modal-type">' +
            Object.keys(PLATFORM_PRESETS).map(function(key) {
              var p = PLATFORM_PRESETS[key];
              return '<option value="' + key + '"' + (platform.type === key ? ' selected' : '') + '>' + p.name + '</option>';
            }).join('') +
          '</select></div>' +
          '<div class="form-group"><label>UID / Channel ID</label><input type="text" id="media-modal-uid" value="' + escapeHtml(platform.uid || '') + '" placeholder="输入UID"></div>' +
          '<div class="form-group"><label>主页链接（可选，留空自动生成）</label><input type="text" id="media-modal-url" value="' + escapeHtml(platform.url || '') + '" placeholder="https://..."></div>' +
          '<div class="form-group"><label>描述</label><input type="text" id="media-modal-desc" value="' + escapeHtml(platform.desc || '') + '" placeholder="例如：视频创作与分享"></div>' +
          '<div class="form-group"><label>自定义图标 class（可选）</label><input type="text" id="media-modal-icon" value="' + escapeHtml(platform.icon || '') + '" placeholder="fa-play-circle"></div>' +
          '<div class="form-group"><label>自定义颜色（可选）</label><input type="color" id="media-modal-color" value="' + (platform.color || '#3B82F6') + '"></div>' +
          '<div style="display:flex;gap:0.5rem;margin-top:1rem;">' +
            '<button class="btn btn-fill btn-sm" id="media-modal-save"><i class="fa fa-save"></i> 保存</button>' +
          '</div>';

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'media-modal-overlay';
        overlay.innerHTML = '<div class="modal">' + html + '</div>';
        document.body.appendChild(overlay);

        requestAnimationFrame(function() {
          overlay.classList.add('active');
        });

        document.getElementById('media-modal-close').addEventListener('click', function() {
          overlay.classList.remove('active');
          setTimeout(function() {
            overlay.remove();
          }, 250);
        });

        document.getElementById('media-modal-type').addEventListener('change', function() {
          var preset = PLATFORM_PRESETS[this.value] || PLATFORM_PRESETS.custom;
          document.getElementById('media-modal-icon').placeholder = preset.icon;
          document.getElementById('media-modal-color').value = preset.color;
        });

        document.getElementById('media-modal-save').addEventListener('click', function() {
          var type = document.getElementById('media-modal-type').value;
          var preset = PLATFORM_PRESETS[type] || PLATFORM_PRESETS.custom;
          var uid = document.getElementById('media-modal-uid').value.trim();
          var url = document.getElementById('media-modal-url').value.trim();
          var desc = document.getElementById('media-modal-desc').value.trim();
          var icon = document.getElementById('media-modal-icon').value.trim();
          var color = document.getElementById('media-modal-color').value;

          if (!uid) { showToast('请输入UID'); return; }

          var entry = {
            id: platform.id || Date.now(),
            type: type,
            name: preset.name,
            icon: icon || preset.icon,
            color: color || preset.color,
            uid: uid,
            url: url || (preset.urlTpl ? preset.urlTpl.replace('{uid}', uid) : ''),
            desc: desc,
            videos: platform.videos || []
          };

          if (platformIdx !== null) {
            mediaData[platformIdx] = entry;
          } else {
            mediaData.push(entry);
          }

          renderMediaPlatforms();
          overlay.classList.remove('active');
          setTimeout(function() {
            overlay.remove();
            showToast('平台已保存');
          }, 250);
        });
      }

      function openVideoModal(platformIdx, videoIdx) {
        var platform = mediaData[platformIdx];
        if (!platform) return;

        var isEdit = videoIdx !== null && videoIdx !== undefined;
        var video = isEdit ? platform.videos[videoIdx] : null;

        var html = '<div class="media-config-header"><h4>' + (isEdit ? '编辑视频' : '添加视频') + ' - ' + escapeHtml(platform.name) + '</h4><button class="modal-close" id="video-modal-close">&times;</button></div>' +
          '<div class="form-group"><label>视频标题</label><input type="text" id="video-modal-title" placeholder="输入视频标题" value="' + (video ? escapeHtml(video.title) : '') + '"></div>' +
          '<div class="form-group"><label>封面图片</label>' +
            '<div class="cover-upload-box">' +
              '<input type="file" id="video-modal-cover-file" accept="image/*" class="cover-file-input">' +
              '<div class="cover-preview" id="cover-preview">' +
                (video && video.cover ? '<img src="' + escapeHtml(video.cover) + '" alt="封面预览">' : '<span>点击选择图片或拖拽到此处</span>') +
              '</div>' +
              '<input type="text" id="video-modal-cover" placeholder="封面链接" value="' + (video ? escapeHtml(video.cover || '') : '') + '">' +
              '<button type="button" id="clear-cover-btn" class="btn btn-outline btn-sm"' + (video && video.cover ? '' : ' style="display:none"') + '>清除封面</button>' +
            '</div></div>' +
          '<div class="form-group"><label>视频链接</label><input type="text" id="video-modal-url" placeholder="https://..." value="' + (video ? escapeHtml(video.url || '') : '') + '"></div>' +
          '<div class="form-group"><label>播放量（可选）</label><input type="text" id="video-modal-views" placeholder="例如：1.2万" value="' + (video ? escapeHtml(video.views || '') : '') + '"></div>' +
          '<div class="form-group"><label>发布日期（可选）</label><input type="date" id="video-modal-date" value="' + (video ? video.date || '' : '') + '"></div>' +
          '<div style="display:flex;gap:0.5rem;margin-top:1rem;">' +
            '<button class="btn btn-fill btn-sm" id="video-modal-save"><i class="fa fa-save"></i> ' + (isEdit ? '保存' : '添加') + '</button>' +
          '</div>';

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'video-modal-overlay';
        overlay.innerHTML = '<div class="modal">' + html + '</div>';
        document.body.appendChild(overlay);

        requestAnimationFrame(function() {
          overlay.classList.add('active');
        });

        document.getElementById('video-modal-close').addEventListener('click', function() {
          overlay.classList.remove('active');
          setTimeout(function() {
            overlay.remove();
          }, 250);
        });

        var coverInput = document.getElementById('video-modal-cover');
        var coverFileInput = document.getElementById('video-modal-cover-file');
        var coverPreview = document.getElementById('cover-preview');
        var clearCoverBtn = document.getElementById('clear-cover-btn');

        coverPreview.addEventListener('click', function() {
          coverFileInput.click();
        });

        coverFileInput.addEventListener('change', function(e) {
          var file = e.target.files[0];
          if (!file) return;

          // 显示加载状态
          coverPreview.innerHTML = '<span>上传中...</span>';

// 上传到服务器
      var formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload-media', {
            method: 'POST',
            body: formData
          })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              coverInput.value = data.path;
              coverPreview.innerHTML = '<img src="' + data.path + '" alt="封面预览">';
              clearCoverBtn.style.display = 'inline-block';
              showToast('封面上传成功');
            } else {
              coverPreview.innerHTML = '<span>上传失败，点击重试</span>';
              showToast('封面上传失败: ' + (data.error || ''));
            }
          })
          .catch(err => {
            coverPreview.innerHTML = '<span>上传失败，点击重试</span>';
            showToast('上传失败: ' + err.message);
          });
        });

        clearCoverBtn.addEventListener('click', function() {
          coverInput.value = '';
          coverPreview.innerHTML = '<span>点击选择图片或拖拽到此处</span>';
          clearCoverBtn.style.display = 'none';
        });

        document.getElementById('video-modal-save').addEventListener('click', function() {
          var title = document.getElementById('video-modal-title').value.trim();
          if (!title) { showToast('请输入视频标题'); return; }

          var videoData = {
            title: title,
            cover: document.getElementById('video-modal-cover').value.trim(),
            url: document.getElementById('video-modal-url').value.trim(),
            views: document.getElementById('video-modal-views').value.trim(),
            date: document.getElementById('video-modal-date').value
          };

          if (isEdit) {
            mediaData[platformIdx].videos[videoIdx] = videoData;
            showToast('视频已更新');
          } else {
            mediaData[platformIdx].videos.push(videoData);
            showToast('视频已添加');
          }
          renderMediaPlatforms();
          overlay.remove();
        });
      }

      // 添加平台
      document.getElementById('add-media-platform-btn').addEventListener('click', function() {
        openMediaModal(null);
      });

      // 编辑 / 删除（事件委托）
      document.getElementById('media-platforms-list').addEventListener('click', function(e) {
        var editBtn = e.target.closest('.media-edit-btn');
        var removeBtn = e.target.closest('.media-remove-btn');
        var editVideoBtn = e.target.closest('.media-video-item-edit');
        var removeVideoBtn = e.target.closest('.media-video-item-remove');
        var addVideoBtn = e.target.closest('.media-add-video-btn');

        if (addVideoBtn) {
          openVideoModal(parseInt(addVideoBtn.dataset.index));
        } else if (editBtn) {
          openMediaModal(parseInt(editBtn.dataset.index));
        } else if (editVideoBtn) {
          var pIdx = parseInt(editVideoBtn.dataset.platform);
          var vIdx = parseInt(editVideoBtn.dataset.video);
          openVideoModal(pIdx, vIdx);
        } else if (removeBtn) {
          var idx = parseInt(removeBtn.dataset.index);
          if (confirm('确定删除此平台？')) {
            mediaData.splice(idx, 1);
            renderMediaPlatforms();
          }
        } else if (removeVideoBtn) {
          var pIdx = parseInt(removeVideoBtn.dataset.platform);
          var vIdx = parseInt(removeVideoBtn.dataset.video);
          mediaData[pIdx].videos.splice(vIdx, 1);
          renderMediaPlatforms();
        }
      });

      // 保存到 data.js
      document.getElementById('save-media-btn').addEventListener('click', function() {
        saveMediaData();
      });
    });

    // 资源管理初始化
    function initResourceManagement() {
      // 防止重复初始化
      if (window._resourceManagementInitialized) return;
      window._resourceManagementInitialized = true;

      // 渲染资源列表（直接使用 adminData.resources）
      function renderResourceList(resources) {
        const container = document.getElementById('resource-list-top');
        if (!container) return;

        const searchKeyword = (document.getElementById('resource-search-top')?.value || '').toLowerCase();
        const filtered = searchKeyword
          ? resources.filter(r =>
              r.title.toLowerCase().includes(searchKeyword) ||
              (r.description && r.description.toLowerCase().includes(searchKeyword))
            )
          : resources;

        if (!filtered || filtered.length === 0) {
          container.innerHTML = '<p style="color: var(--text-muted); padding: 2rem; text-align: center;">暂无资源，点击添加按钮创建</p>';
          return;
        }

        container.innerHTML = filtered.map((resource, index) => {
          const platform = siteData.platformTypes[resource.type] || siteData.platformTypes.other;
          return `
            <div class="resource-item" style="padding: 1rem; margin-bottom: 0.75rem; background: var(--bg-secondary); border-radius: 8px; display: flex; gap: 1rem; align-items: flex-start; animation-delay: ${index * 0.05}s;">
              <div style="width: 40px; height: 40px; border-radius: 8px; background: ${platform.color}; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                <i class="fa ${platform.icon}"></i>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${escapeHtml(resource.title)}</div>
                <div style="font-size: 0.85rem; color: var(--text-sub); margin-bottom: 0.25rem;">${platform.name}</div>
                ${resource.description ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">${escapeHtml(resource.description)}</div>` : ''}
                <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; gap: 1rem;">
                  ${resource.size ? `<span><i class="fa fa-file"></i> ${escapeHtml(resource.size)}</span>` : ''}
                  ${resource.password ? `<span><i class="fa fa-key"></i> 提取码: ${escapeHtml(resource.password)}</span>` : ''}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                <button class="btn btn-outline btn-sm" style="padding:0.4rem 0.6rem;" onclick="editResource(${resource.id})"><i class="fa fa-edit"></i></button>
                <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #ef4444; padding:0.4rem 0.6rem;" onclick="deleteResource(${resource.id})"><i class="fa fa-trash"></i></button>
              </div>
            </div>
          `;
        }).join('');
      }

      // 过滤资源
      document.getElementById('resource-search-top')?.addEventListener('input', function() {
        renderResourceList(adminData.resources);
      });

      // 添加资源
      document.getElementById('add-resource-btn-top')?.addEventListener('click', function() {
        openResourceModalTop(null);
      });

      // 保存资源（统一通过 saveAdminData 保存到 data.js）
      document.getElementById('save-resource-btn-top')?.addEventListener('click', function() {
        saveAdminData(true);
      });

      // 打开资源编辑弹窗
      function openResourceModalTop(editId = null) {
        const isEdit = editId !== null;
        const resource = isEdit ? adminData.resources.find(r => r.id === editId) : {};

        const platformOptions = Object.entries(siteData.platformTypes).map(([key, val]) =>
          `<option value="${key}" ${resource.type === key ? 'selected' : ''}>${val.name}</option>`
        ).join('');

        const modalHtml = `
          <div class="modal-overlay" id="resource-modal-top">
            <div class="modal">
              <div class="modal-header">
                <h3>${isEdit ? '编辑资源' : '添加资源'}</h3>
                <button class="modal-close" id="modal-close-top">&times;</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>资源名称 *</label>
                  <input type="text" id="resource-title-top" placeholder="输入资源名称" value="${escapeHtml(resource.title || '')}">
                </div>
                <div class="form-group">
                  <label>描述</label>
                  <textarea id="resource-desc-top" placeholder="输入资源描述">${escapeHtml(resource.description || '')}</textarea>
                </div>
                <div class="form-group">
                  <label>网盘类型 *</label>
                  <select id="resource-type-top">
                    ${platformOptions}
                  </select>
                </div>
                <div class="form-group">
                  <label>分享链接 *</label>
                  <input type="text" id="resource-url-top" placeholder="https://..." value="${escapeHtml(resource.url || '')}">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>提取码</label>
                    <input type="text" id="resource-password-top" placeholder="如: abcd" value="${escapeHtml(resource.password || '')}">
                  </div>
                  <div class="form-group">
                    <label>文件大小</label>
                    <input type="text" id="resource-size-top" placeholder="如: 1.2GB" value="${escapeHtml(resource.size || '')}">
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline modal-cancel" id="modal-cancel-top">取消</button>
                <button class="btn btn-fill" id="modal-save-top">
                  <i class="fa fa-save"></i> ${isEdit ? '保存' : '添加'}
                </button>
              </div>
            </div>
          </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        const modalElement = tempDiv.firstElementChild;
        document.body.appendChild(modalElement);

        requestAnimationFrame(() => {
          modalElement.classList.add('active');
        });

        const closeModal = () => {
          const modal = document.getElementById('resource-modal-top');
          if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
          }
        };

        document.getElementById('modal-close-top').addEventListener('click', closeModal);
        document.getElementById('modal-cancel-top').addEventListener('click', closeModal);
        document.getElementById('resource-modal-top').addEventListener('click', function(e) {
          if (e.target === this) closeModal();
        });
        document.getElementById('modal-save-top').addEventListener('click', function() {
          const title = document.getElementById('resource-title-top').value.trim();
          const url = document.getElementById('resource-url-top').value.trim();

          if (!title || !url) {
            showToast('请填写名称和链接');
            return;
          }

          const newResource = {
            id: isEdit ? editId : Date.now(),
            title: title,
            description: document.getElementById('resource-desc-top').value.trim(),
            type: document.getElementById('resource-type-top').value,
            url: url,
            password: document.getElementById('resource-password-top').value.trim(),
            size: document.getElementById('resource-size-top').value.trim(),
            createdAt: isEdit ? resource.createdAt : new Date().toISOString().split('T')[0]
          };

          if (isEdit) {
            const idx = adminData.resources.findIndex(r => r.id === editId);
            if (idx > -1) adminData.resources[idx] = newResource;
            showToast('资源已更新');
          } else {
            adminData.resources.push(newResource);
            showToast('资源已添加');
          }

          renderResourceList(adminData.resources);
          saveAdminData(true);
          document.getElementById('resource-modal-top')?.remove();
        });

        document.getElementById('resource-modal-top').addEventListener('click', function(e) {
          if (e.target === this) this.remove();
        });
      }

      // 编辑资源（全局函数）
      window.editResource = function(id) {
        openResourceModalTop(id);
      };

      // 删除资源（全局函数）
      window.deleteResource = function(id) {
        if (confirm('确定删除此资源？')) {
          adminData.resources = adminData.resources.filter(r => r.id !== id);
          renderResourceList(adminData.resources);
          saveAdminData(true);
          showToast('资源已删除');
        }
      };

      // 初始化渲染
      renderResourceList(adminData.resources);
    }

    // ===== 分享管理 =====
    function initShareManagement() {
      if (window._shareManagementInitialized) return;
      window._shareManagementInitialized = true;

      // 渲染分享列表
      function renderShareList(shares) {
        const container = document.getElementById('share-list');
        if (!container) return;

        const searchKeyword = (document.getElementById('share-search')?.value || '').toLowerCase();

        // 获取选中的分类筛选
        const activeFilterBtn = document.querySelector('#admin-shares .skill-filter-btn.active');
        const activeFilter = activeFilterBtn?.dataset.filter || 'all';

        let filtered = shares;
        if (searchKeyword) {
          filtered = filtered.filter(s =>
            s.title.toLowerCase().includes(searchKeyword) ||
            (s.description && s.description.toLowerCase().includes(searchKeyword))
          );
        }
        if (activeFilter !== 'all') {
          filtered = filtered.filter(s => s.category === activeFilter);
        }

        if (!filtered || filtered.length === 0) {
          container.innerHTML = '<p style="color: var(--text-muted); padding: 2rem; text-align: center;">暂无分享，点击添加按钮创建</p>';
          return;
        }

        const categories = adminData.shareCategories || {};

        container.innerHTML = filtered.map((share, index) => {
          const cat = categories[share.category] || categories.other;
          return `
            <div class="share-item" style="padding: 1rem; margin-bottom: 0.75rem; background: var(--bg-secondary); border-radius: 8px; display: flex; gap: 1rem; align-items: flex-start; animation-delay: ${index * 0.05}s;">
              <div style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-tertiary);">
                ${share.image
                  ? `<img src="${escapeHtml(share.image)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<i class=\\'fa fa-image\\' style=\\'font-size:1.5rem;color:var(--text-muted);\\'></i>'">`
                  : `<i class="fa fa-image" style="font-size:1.5rem;color:var(--text-muted);display:flex;align-items:center;justify-content:center;height:100%;"></i>`
                }
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${escapeHtml(share.title)}</div>
                <div style="font-size: 0.85rem; color: ${cat.color}; margin-bottom: 0.25rem;">
                  <i class="fa ${cat.icon}"></i> ${cat.name}
                </div>
                ${share.description ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">${escapeHtml(share.description)}</div>` : ''}
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  <i class="fa fa-link"></i> ${escapeHtml(share.url || '')}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                <button class="btn btn-outline btn-sm" style="padding:0.4rem 0.6rem;" onclick="editShare(${share.id})"><i class="fa fa-edit"></i></button>
                <button class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #ef4444; padding:0.4rem 0.6rem;" onclick="deleteShare(${share.id})"><i class="fa fa-trash"></i></button>
              </div>
            </div>
          `;
        }).join('');
      }

      // 搜索功能
      document.getElementById('share-search')?.addEventListener('input', function() {
        renderShareList(adminData.shares);
      });

      // 分类筛选
      document.querySelectorAll('#admin-shares .skill-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('#admin-shares .skill-filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          renderShareList(adminData.shares);
        });
      });

      // 添加分享
      document.getElementById('add-share-btn')?.addEventListener('click', function() {
        openShareModal(null);
      });

      // 保存分享
      document.getElementById('save-share-btn')?.addEventListener('click', function() {
        saveAdminData(true);
      });

      // 打开分享编辑弹窗
      function openShareModal(editId = null) {
        const isEdit = editId !== null;
        const share = isEdit ? adminData.shares.find(s => s.id === editId) : {};

        const categoryOptions = Object.entries(adminData.shareCategories || {}).map(([key, val]) =>
          `<option value="${key}" ${share.category === key ? 'selected' : ''}>${val.name}</option>`
        ).join('');

        const modalHtml = `
<div class="modal-overlay" id="share-modal">
  <div class="modal" style="max-width: 600px;">
    <div class="modal-header">
      <h3>${isEdit ? '编辑分享' : '添加分享'}</h3>
      <button class="modal-close" id="share-modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>标题 *</label>
        <input type="text" id="share-title" placeholder="输入分享标题" value="${escapeHtml(share.title || '')}">
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea id="share-description" placeholder="输入分享描述" rows="3">${escapeHtml(share.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label>封面图片</label>
        <div class="avatar-picker">
          <img id="share-image-preview" class="avatar-preview" src="${escapeHtml(share.image || '')}" style="${share.image ? '' : 'display:none'}">
          <div id="share-image-placeholder" class="avatar-preview-placeholder" style="${share.image ? 'display:none' : ''}">
            <i class="fa fa-image"></i>
          </div>
          <div class="avatar-actions">
            <input type="text" id="share-image-url" placeholder="assets/share/xxx.jpg" class="avatar-url-input" value="${escapeHtml(share.image || '')}">
            <label class="btn btn-outline btn-upload">
              <i class="fa fa-upload"></i> 上传
              <input type="file" id="share-image-upload" accept="image/*" style="display: none;">
            </label>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>分类 *</label>
        <select id="share-category">
          ${categoryOptions}
        </select>
      </div>
      <div class="form-group">
        <label>链接 *</label>
        <input type="text" id="share-url" placeholder="https://..." value="${escapeHtml(share.url || '')}">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline modal-cancel" id="share-modal-cancel">取消</button>
      <button class="btn btn-fill" id="share-modal-save">
        <i class="fa fa-save"></i> ${isEdit ? '保存' : '添加'}
      </button>
    </div>
  </div>
</div>
`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml;
        const modalElement = tempDiv.firstElementChild;
        document.body.appendChild(modalElement);

        requestAnimationFrame(() => {
          modalElement.classList.add('active');
        });

        // 图片上传处理
        const imageUpload = document.getElementById('share-image-upload');
        const imageUrlInput = document.getElementById('share-image-url');
        const imagePreview = document.getElementById('share-image-preview');
        const imagePlaceholder = document.getElementById('share-image-placeholder');

        imageUpload?.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;

          // 显示上传中
          imagePlaceholder.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 上传中...';
          imagePlaceholder.style.display = 'flex';

const formData = new FormData();
      formData.append('image', file);

      fetch('/api/upload-share', {
            method: 'POST',
            body: formData
          })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
                const imagePath = data.path || 'assets/share/' + file.name;
              imagePreview.src = imagePath;
              imagePreview.style.display = 'block';
              imagePlaceholder.style.display = 'none';
              imageUrlInput.value = imagePath;
              showToast('封面上传成功');
            } else {
              imagePlaceholder.innerHTML = '<i class="fa fa-image"></i> 上传失败';
              showToast('上传失败: ' + (data.error || '未知错误'));
            }
          })
          .catch(err => {
            imagePlaceholder.innerHTML = '<i class="fa fa-image"></i> 上传失败';
            showToast('上传失败: ' + err.message);
          });
        });

        // URL 输入变化时更新预览
        imageUrlInput?.addEventListener('input', function() {
          const url = this.value;
          if (url && !url.startsWith('[BASE64]')) {
            imagePreview.src = url;
            imagePreview.style.display = 'block';
            imagePlaceholder.style.display = 'none';
          } else if (url === '[BASE64]') {
            imagePreview.style.display = 'block';
            imagePlaceholder.style.display = 'none';
          } else {
            imagePreview.style.display = 'none';
            imagePlaceholder.style.display = 'flex';
          }
        });

        const closeModal = () => {
          const modal = document.getElementById('share-modal');
          if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
          }
        };

        document.getElementById('share-modal-close').addEventListener('click', closeModal);
        document.getElementById('share-modal-cancel').addEventListener('click', closeModal);
        document.getElementById('share-modal').addEventListener('click', function(e) {
          if (e.target === this) closeModal();
        });

        document.getElementById('share-modal-save').addEventListener('click', function() {
          const title = document.getElementById('share-title').value.trim();
          const url = document.getElementById('share-url').value.trim();

          if (!title || !url) {
            showToast('请填写标题和链接');
            return;
          }

          const imageValue = document.getElementById('share-image-url').value.trim();
          const imagePath = imageValue === '[BASE64]' ? '' : imageValue;

          const newShare = {
            id: isEdit ? editId : Date.now(),
            title: title,
            description: document.getElementById('share-description').value.trim(),
            image: imagePath,
            url: url,
            category: document.getElementById('share-category').value,
            createdAt: isEdit ? share.createdAt : new Date().toISOString().split('T')[0]
          };

          if (isEdit) {
            const idx = adminData.shares.findIndex(s => s.id === editId);
            if (idx > -1) adminData.shares[idx] = newShare;
            showToast('分享已更新');
          } else {
            adminData.shares.push(newShare);
            showToast('分享已添加');
          }

          renderShareList(adminData.shares);
          saveAdminData(true);
          document.getElementById('share-modal')?.remove();
        });
      }

      // 编辑分享（全局函数）
      window.editShare = function(id) {
        openShareModal(id);
      };

      // 删除分享（全局函数）
      window.deleteShare = function(id) {
        if (confirm('确定删除此分享？')) {
          adminData.shares = adminData.shares.filter(s => s.id !== id);
          renderShareList(adminData.shares);
          saveAdminData(true);
          showToast('分享已删除');
        }
      };

      // 初始化渲染
      renderShareList(adminData.shares || []);
    }