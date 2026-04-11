// 分享页面逻辑
(function() {
  'use strict';

  console.log('share.js 开始执行');

  // 检查数据是否加载
  if (typeof siteData === 'undefined') {
    console.error('siteData 未定义，请检查 data.js 是否正确加载');
    return;
  }

  console.log('siteData keys:', Object.keys(siteData));

  // 初始化缺失的字段
  if (!siteData.shareCategories) {
    siteData.shareCategories = {
      "tool": { "name": "实用工具", "icon": "fa-wrench", "color": "#3B82F6" },
      "article": { "name": "技术文章", "icon": "fa-book", "color": "#10B981" },
      "learning": { "name": "学习资源", "icon": "fa-graduation-cap", "color": "#8B5CF6" },
      "entertainment": { "name": "娱乐", "icon": "fa-gamepad", "color": "#F59E0B" },
      "other": { "name": "其他", "icon": "fa-folder", "color": "#6B7280" }
    };
  }

  if (!siteData.shares) {
    siteData.shares = [
      { "id": 1, "title": "在线工具集合", "description": "各种实用的在线工具网站集合，包含PDF转换、图片处理等多种功能", "image": "", "url": "https://tool.lu", "category": "tool", "createdAt": "2026-04-10" },
      { "id": 2, "title": "GitHub 入门教程", "description": "GitHub 使用教程，适合初学者学习版本控制", "image": "", "url": "https://docs.github.com", "category": "learning", "createdAt": "2026-04-10" },
      { "id": 3, "title": "哔哩哔哩", "description": "国内知名的视频弹幕网站，拥有大量动漫、影视、纪录片等内容", "image": "", "url": "https://www.bilibili.com", "category": "entertainment", "createdAt": "2026-04-10" },
      { "id": 4, "title": "阮一峰的网络日志", "description": "知名技术博主，分享前端、后端、算法等各类技术文章", "image": "", "url": "https://www.ruanyifeng.com/blog/", "category": "article", "createdAt": "2026-04-10" }
    ];
  }

  console.log('shareCategories:', siteData.shareCategories);
  console.log('shares:', siteData.shares);

  // 工具函数
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // DOM元素获取
  const container = document.getElementById('share-list');
  const searchInput = document.getElementById('share-search');
  const filtersContainer = document.getElementById('share-filters');

  // 分类数据
  let currentCategory = 'all';
  let currentSearch = '';

  // 渲染筛选按钮
  function renderFilters() {
    if (!filtersContainer) return;

    const categories = siteData.shareCategories || {};
    const filters = [
      { key: 'all', name: '全部', icon: 'fa-th', color: '#3B82F6' },
      ...Object.entries(categories).map(([key, val]) => ({
        key,
        name: val.name,
        icon: val.icon,
        color: val.color
      }))
    ];

    filtersContainer.innerHTML = filters.map(f => `
      <button class="share-filter-btn ${currentCategory === f.key ? 'active' : ''}"
              data-category="${f.key}"
              style="${currentCategory === f.key ? '' : f.key !== 'all' ? `border-color:${f.color}40;color:${f.color}` : ''}">
        <i class="fa ${f.icon}"></i> ${f.name}
      </button>
    `).join('');

    // 点击事件
    filtersContainer.querySelectorAll('.share-filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        currentCategory = this.dataset.category;
        renderFilters();
        renderShares();
      });
    });
  }

  // 渲染分享列表
  function renderShares() {
    if (!container) return;

    const shares = siteData.shares || [];
    const categories = siteData.shareCategories || {};

    // 过滤
    let filtered = shares;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(s => s.category === currentCategory);
    }
    if (currentSearch) {
      const keyword = currentSearch.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(keyword) ||
        (s.description && s.description.toLowerCase().includes(keyword))
      );
    }

    // 按日期排序
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="share-empty">
          <i class="fa fa-folder-open-o"></i>
          <p>暂无分享内容</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((share, index) => {
      const cat = categories[share.category] || categories.other;
      const date = share.createdAt ? new Date(share.createdAt).toLocaleDateString('zh-CN') : '';

      const imageHtml = share.image
        ? `<div class="share-card-image-wrapper"><img class="share-card-image" src="${escapeHtml(share.image)}" alt="${escapeHtml(share.title)}" onerror="this.style.display='none';this.parentElement.nextElementSibling.style.display='flex';"></div><div class="share-card-image-placeholder" style="display: none;"><i class="fa fa-image"></i></div>`
        : `<div class="share-card-image-placeholder" style="display: flex;"><i class="fa fa-image"></i></div>`;

      return `
        <div class="share-card" style="animation-delay: ${index * 0.08}s;" onclick="window.open('${escapeHtml(share.url)}', '_blank')">
          ${imageHtml}
          <div class="share-card-body">
            <span class="share-card-category" style="background: ${cat.color}20; color: ${cat.color};">
              <i class="fa ${cat.icon}"></i> ${cat.name}
            </span>
            <h3 class="share-card-title">${escapeHtml(share.title)}</h3>
            <p class="share-card-desc">${escapeHtml(share.description || '')}</p>
            <div class="share-card-footer">
              <span class="share-card-date">${date}</span>
              <div class="share-card-actions">
                <button class="share-card-action copy" onclick="event.stopPropagation(); copyShareLink('${escapeHtml(share.url)}')">
                  <i class="fa fa-copy"></i> 复制
                </button>
                <button class="share-card-action open" onclick="event.stopPropagation(); window.open('${escapeHtml(share.url)}', '_blank')">
                  <i class="fa fa-external-link"></i> 访问
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 复制链接
  window.copyShareLink = function(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('链接已复制到剪贴板');
    }).catch(() => {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('链接已复制到剪贴板');
    });
  };

  // 显示Toast
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.style.display = 'block';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // 初始化
  function init() {
    renderFilters();
    renderShares();

    // 搜索事件
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        currentSearch = this.value.trim();
        renderShares();
      });
    }
  }

  // 页面加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();