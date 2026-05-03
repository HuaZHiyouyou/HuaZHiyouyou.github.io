/* 见闻纸页 - 展示脚本 */

(function() {
  'use strict';

  // ---- 数据加载 ----
  if (typeof siteData === 'undefined') {
    console.error('siteData 未定义，请检查 data/index.js 是否正确加载');
    return;
  }

  // 初始化缺失字段
  if (!siteData.insightsCategories) {
    siteData.insightsCategories = {
      "experience": { "name": "经历", "icon": "fa-road", "color": "#3B82F6" },
      "quote":      { "name": "好词好句", "icon": "", "color": "#8B5CF6" },
      "inspiration":{ "name": "启迪", "icon": "fa-lightbulb-o", "color": "#F59E0B" },
      "story":      { "name": "故事", "icon": "fa-book", "color": "#10B981" },
      "wisdom":     { "name": "哲理", "icon": "fa-yin-yang", "color": "#EC4899" },
      "other":      { "name": "其他", "icon": "fa-folder-o", "color": "#6B7280" }
    };
  }

  if (!siteData.insights) {
    siteData.insights = [];
  }

  // ---- 工具函数 ----
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateStr));
  }

  function formatToday() {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(new Date());
  }

  // ---- DOM 引用 ----
  var container = document.getElementById('insights-list');
  var searchInput = document.getElementById('insights-search');
  var filterBar = document.getElementById('filter-bar');
  var filterToggle = document.getElementById('filter-toggle');
  var filterGroups = document.getElementById('filter-groups');
  var detailView = document.getElementById('detail-view');
  var detailContent = document.getElementById('detail-content');
  var detailClose = document.getElementById('detail-close');
  var todayLabel = document.getElementById('today-label');
  var entryCount = document.getElementById('entry-count');
  var latestType = document.getElementById('latest-type');
  var storageStatus = document.getElementById('storage-status');
  var jumpButton = document.getElementById('jump-to-gallery');

  // ---- 状态 ----
  var currentCategory = 'all';
  var currentSearch = '';

  // ---- 更新摘要信息 ----
  function updateSummary() {
    var insights = siteData.insights || [];

    if (todayLabel) {
      todayLabel.textContent = formatToday();
    }

    if (entryCount) {
      entryCount.textContent = String(insights.length);
    }

    if (latestType) {
      var categories = siteData.insightsCategories || {};
      if (insights.length > 0) {
        var latest = insights.sort(function(a, b) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })[0];
        var cat = categories[latest.category];
        latestType.textContent = cat ? cat.name : '其他';
      } else {
        latestType.textContent = '暂无';
      }
    }

    if (storageStatus) {
      storageStatus.textContent = insights.length
        ? '已同步 ' + insights.length + ' 条纸笺'
        : '等待后台发布';
    }
  }

  // ---- 渲染筛选按钮 ----
  function renderFilters() {
    if (!filterGroups) return;

    var categories = siteData.insightsCategories || {};
    var buttons = [
      { key: 'all', name: '全部', icon: 'fa-th' }
    ];

    Object.keys(categories).forEach(function(key) {
      var val = categories[key];
      buttons.push({ key: key, name: val.name, icon: val.icon });
    });

    filterGroups.innerHTML = buttons.map(function(b) {
      var isActive = currentCategory === b.key;
      return '<button class="filter-button ' + (isActive ? 'active' : '') + '" ' +
        'data-filter="' + b.key + '">' + b.name +
      '</button>';
    }).join('');
  }

  // ---- 渲染见闻列表 ----
  function renderInsights() {
    if (!container) return;

    var insights = siteData.insights || [];
    var categories = siteData.insightsCategories || {};

    // 过滤
    var filtered = insights;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(function(item) { return item.category === currentCategory; });
    }
    if (currentSearch) {
      var keyword = currentSearch.toLowerCase();
      filtered = filtered.filter(function(item) {
        return (item.content && item.content.toLowerCase().indexOf(keyword) !== -1) ||
               (item.author && item.author.toLowerCase().indexOf(keyword) !== -1) ||
               (item.source && item.source.toLowerCase().indexOf(keyword) !== -1);
      });
    }

    // 排序：日期降序
    filtered.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<i class="fa fa-binoculars"></i>' +
          '<p>暂无见闻内容<br>去后台 manage 页面发布第一条见闻吧</p>' +
        '</div>';
      return;
    }

    container.innerHTML = filtered.map(function(item, index) {
      var cat = categories[item.category] || categories.other || { name: '其他', icon: 'fa-folder-o', color: '#6B7280' };
      var date = formatDate(item.createdAt);

      // 图片
      var imageHtml = '';
      if (item.image) {
        imageHtml = '<div class="entry-images entry-images-single">' +
          '<img src="' + escapeHtml(item.image) + '" alt="见闻配图" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
        '</div>';
      }

      // 头部标签（与说说卡片一致的布局）
      var badgesHtml = '<div class="entry-badges">' +
        '<span class="badge"><i class="fa ' + cat.icon + '"></i> <strong>' + escapeHtml(cat.name) + '</strong></span>' +
        (item.author ? '<span class="badge">' + escapeHtml(item.author) + '</span>' : '') +
        (item.source ? '<span class="badge">' + escapeHtml(item.source) + '</span>' : '') +
      '</div>';

      // 内容（保留换行）
      var contentText = item.content || '';
      var displayContent = contentText.length > 150 ? contentText.substring(0, 150) + '...' : contentText;

      return '<article class="insight-card entry" data-id="' + item.id + '">' +
        '<div class="entry-head">' +
          badgesHtml +
          '<div class="stamp">' + date + '</div>' +
        '</div>' +
        '<p class="entry-content' + (contentText.length > 150 ? ' truncated' : '') + '">' + escapeHtml(displayContent).replace(/\n/g, '<br>') + '</p>' +
        imageHtml +
        '<div class="entry-expand-container">' +
          '<button class="detail-expand entry-expand" type="button" data-expand="' + item.id + '">' +
            '<span class="entry-expand-icon"><span class="entry-expand-arrow"></span></span>' +
            '<span class="entry-expand-text">展开文本</span>' +
          '</button>' +
        '</div>' +
        '<div class="entry-footer">' +
          '<div class="entry-meta"><span>发布入口已经统一收回后台。</span></div>' +
          '<div class="entry-actions">' +
            '<button class="mini-button" type="button" data-copy="' + item.id + '">复制</button>' +
            '<a class="mini-button" href="manage.html#insights">后台编辑</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    // 入场动画 + 折叠状态同步
    requestAnimationFrame(function() {
      container.querySelectorAll('.insight-card').forEach(function(card, idx) {
        setTimeout(function() { card.classList.add('visible'); }, idx * 70);
        syncInsightClampState(card);
      });
    });
  }

  // 同步折叠状态（与说说页逻辑一致）
  function syncInsightClampState(entryElement) {
    var entryContent = entryElement.querySelector('.entry-content');
    var expandContainer = entryElement.querySelector('.entry-expand-container');
    if (!entryContent || !expandContainer) return;
    var lineHeight = parseFloat(window.getComputedStyle(entryContent).lineHeight) || 30;
    var lines = entryContent.scrollHeight / lineHeight;
    if (lines > 5) {
      entryContent.classList.add('truncated', 'can-truncate');
      expandContainer.style.display = '';
    } else {
      entryContent.classList.remove('truncated', 'can-truncate');
      expandContainer.style.display = 'none';
    }
  }

  // ---- 详情侧栏 ----
  function showDetail(id) {
    var item = (siteData.insights || []).find(function(i) { return i.id === id; });
    if (!item) return;

    var categories = siteData.insightsCategories || {};
    var cat = categories[item.category] || categories.other || { name: '其他', icon: 'fa-folder-o', color: '#6B7280' };
    var date = formatDate(item.createdAt);

    var html = '';

    // 类型徽章（与说说详情一致的 badge 风格）
    html += '<div class="detail-meta">';
    html += '<span class="badge"><i class="fa ' + cat.icon + '"></i> <strong>' + escapeHtml(cat.name) + '</strong></span>';
    if (item.author) {
      html += '<span class="badge">' + escapeHtml(item.author) + '</span>';
    }
    if (item.source) {
      html += '<span class="badge">' + escapeHtml(item.source) + '</span>';
    }
    html += '<span class="badge">' + date + '</span>';
    html += '</div>';

    // 图片
    if (item.image) {
      html += '<div class="entry-images entry-images-single">' +
        '<img src="' + escapeHtml(item.image) + '" alt="" onerror="this.parentElement.style.display=\'none\'">' +
      '</div>';
    }

    // 内容
    html += '<p class="detail-text">' + escapeHtml(item.content || '').replace(/\n/g, '<br>') + '</p>';

    html += '<p class="detail-note">需要修改内容时，请回到 manage 页面统一维护。</p>';

    detailContent.innerHTML = html;
    detailView.classList.add('visible');
  }

  function hideDetail() {
    if (detailView) {
      detailView.classList.remove('visible');
    }
  }

  // ---- 展开/收起卡片内容 ----
  function toggleExpand(button) {
    var card = button.closest('.insight-card');
    if (!card) return;

    var content = card.querySelector('.entry-content');
    var expandText = button.querySelector('.entry-expand-text');
    if (!content || !content.classList.contains('can-truncate')) return;

    var id = parseInt(card.dataset.id);
    var item = (siteData.insights || []).find(function(i) { return i.id === id; });
    if (!item) return;

    var isTruncated = content.classList.contains('truncated');
    if (isTruncated) {
      content.innerHTML = escapeHtml(item.content || '').replace(/\n/g, '<br>');
      content.classList.remove('truncated');
      button.classList.add('expanded');
      if (expandText) expandText.textContent = '收起文本';
      // 同时更新详情
      showDetail(id);
    } else {
      var text = item.content || '';
      var displayText = text.length > 150 ? text.substring(0, 150) + '...' : text;
      content.innerHTML = escapeHtml(displayText).replace(/\n/g, '<br>');
      content.classList.add('truncated');
      button.classList.remove('expanded');
      if (expandText) expandText.textContent = '展开文本';
    }
  }

  // ---- 复制功能 ----
  async function copyInsight(id) {
    var item = (siteData.insights || []).find(function(i) { return i.id === id; });
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.content || '');
    } catch (error) {
      var backup = document.createElement('textarea');
      backup.value = item.content || '';
      document.body.appendChild(backup);
      backup.select();
      document.execCommand('copy');
      backup.remove();
    }
  }

  // ---- 筛选面板折叠 ----
  function setupFilterToggle() {
    if (!filterToggle || !filterGroups) return;

    // 默认收起
    filterGroups.classList.add('collapsed');
    filterGroups.style.maxHeight = '0px';

    filterToggle.addEventListener('click', function() {
      var isCollapsed = filterGroups.classList.contains('collapsed');
      if (isCollapsed) {
        filterGroups.style.maxHeight = filterGroups.scrollHeight + 'px';
        filterGroups.classList.remove('collapsed');
        setTimeout(function() {
          filterGroups.style.maxHeight = 'none';
        }, 300);
      } else {
        filterGroups.style.maxHeight = filterGroups.scrollHeight + 'px';
        requestAnimationFrame(function() {
          filterGroups.classList.add('collapsed');
          filterGroups.style.maxHeight = '0px';
        });
      }
    });
  }

  // ---- 事件绑定 ----
  function bindEvents() {
    // 搜索
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        currentSearch = this.value.trim();
        renderInsights();
      });
    }

    // 筛选按钮（事件委托）
    if (filterBar) {
      filterBar.addEventListener('click', function(e) {
        var btn = e.target.closest('.filter-button');
        if (!btn) return;

        var filter = btn.dataset.filter;
        if (!filter) return;

        currentCategory = filter;
        renderFilters();
        renderInsights();
      });
    }

    // 卡片点击（事件委托）—— 支持复制、展开、详情
    if (container) {
      container.addEventListener('click', function(e) {
        // 复制按钮
        var copyBtn = e.target.closest('[data-copy]');
        if (copyBtn) {
          e.stopPropagation();
          copyInsight(parseInt(copyBtn.dataset.copy, 10));
          return;
        }

        // 展开按钮
        var expandBtn = e.target.closest('[data-expand]');
        if (expandBtn) {
          e.stopPropagation();
          toggleExpand(expandBtn);
          return;
        }

        // 点击卡片打开详情
        var card = e.target.closest('.insight-card');
        if (card) {
          var id = parseInt(card.dataset.id);
          showDetail(id);
        }
      });
    }

    // 关闭详情
    if (detailClose) {
      detailClose.addEventListener('click', hideDetail);
    }

    if (detailView) {
      detailView.addEventListener('click', function(e) {
        if (e.target === detailView) {
          hideDetail();
        }
      });
    }

    // 跳转到画廊
    if (jumpButton) {
      jumpButton.addEventListener('click', function() {
        var gallerySection = document.querySelector('.gallery');
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // ESC 关闭详情
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideDetail();
      }
    });

    // 监听页面显示（从缓存恢复时重新加载）
    window.addEventListener('pageshow', function() {
      renderInsights();
    });
  }

  // ---- 初始化 ----
  function init() {
    updateSummary();
    renderFilters();
    setupFilterToggle();
    renderInsights();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
