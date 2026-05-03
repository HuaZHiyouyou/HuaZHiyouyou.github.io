/**
 * 萌图库核心逻辑
 */
(function() {
  'use strict';

  // 当前状态
  let currentType = 'emotion';
  let currentCategory = null;
  let currentCollection = null; // 当前选中的合集
  let currentItems = [];
  let lightboxIndex = 0;

  // 类型图标映射
  var TYPE_ICONS = { emotion: 'fa-smile-o', image: 'fa-image', gif: 'fa-film', livephoto: 'fa-camera', collections: 'fa-folder' };

  // DOM 元素
  const sidebar = document.getElementById('moe-sidebar');
  const sidebarOverlay = document.getElementById('moe-sidebar-overlay');
  const typeTabs = document.getElementById('moe-type-tabs');
  const categoryList = document.getElementById('moe-category-list');
  const searchInput = document.getElementById('moe-search');
  const grid = document.getElementById('moe-grid');
  const countEl = document.getElementById('moe-count');
  const lightbox = document.getElementById('moe-lightbox');
  const lightboxImg = document.getElementById('moe-lightbox-img');
  const lightboxVideo = document.getElementById('moe-lightbox-video');
  const lightboxTitle = document.getElementById('moe-lightbox-title');
  const lightboxMeta = document.getElementById('moe-lightbox-meta');
  const toast = document.getElementById('moe-toast');

  // 初始化
  function init() {
    renderTypeTabs();
    renderCategories();
    renderTagSection();
    renderGrid();
    bindEvents();
  }

  // ========== 渲染引用标签模块 ==========
  function renderTagSection() {
    const tagGrid = document.getElementById('moe-tag-grid');
    if (!tagGrid) return;
    // 兼容新旧数据格式
    var items;
    if (window.getMoeItems) {
      items = window.getMoeItems(currentType, null);
    } else if (window.moeItems && Array.isArray(window.moeItems)) {
      items = window.moeItems.filter(function(i) { return i.type === currentType; });
    } else {
      items = [];
    }
    if (items.length === 0) {
      tagGrid.innerHTML = '<span class="moe-tag-chip" style="cursor:default;opacity:0.5;"><i class="fa fa-ban"></i><span>暂无标签</span></span>';
      return;
    }
    tagGrid.innerHTML = items.map(function(item) {
      return '<div class="moe-tag-chip" data-tag="@' + item.type + ':' + item.file + '" onclick="copyMoeTagChip(this)">' +
        '<i class="fa fa-copy"></i>' +
        '<span>@' + item.type + ':' + item.file + '</span>' +
      '</div>';
    }).join('');
  }

  // 复制标签芯片
  window.copyMoeTagChip = function(el) {
    var tag = el.dataset.tag;
    copyToClipboard(tag);
    el.classList.add('copied');
    el.querySelector('i').className = 'fa fa-check';
    showToast('已复制: ' + tag);
    setTimeout(function() {
      el.classList.remove('copied');
      el.querySelector('i').className = 'fa fa-copy';
    }, 1500);
  };

  // ========== 渲染类型 Tab ==========
  function renderTypeTabs() {
    if (!typeTabs) return;
    var types = [
      { key: 'emotion', name: '表情包', icon: 'fa-smile-o' },
      { key: 'image', name: '图片', icon: 'fa-image' },
      { key: 'gif', name: 'GIF', icon: 'fa-film' },
      { key: 'livephoto', name: '实况', icon: 'fa-camera' },
      { key: 'collections', name: '合集', icon: 'fa-folder' }
    ];
    typeTabs.innerHTML = types.map(function(t) {
      return '<div class="moe-type-tab' + (t.key === currentType ? ' active' : '') + '" data-type="' + t.key + '">' +
        '<i class="fa ' + t.icon + '"></i><span>' + t.name + '</span>' +
      '</div>';
    }).join('');
  }

  // ========== 渲染分类侧边栏 ==========
  function renderCategories() {
    if (!categoryList) return;
    
    // 如果是合集类型，显示合集列表
    if (currentType === 'collections') {
      var collections = window.moeCollections || [];
      if (collections.length === 0) {
        categoryList.innerHTML = '<div class="moe-empty"><p>暂无合集</p></div>';
        return;
      }
      
      categoryList.innerHTML = '<div class="moe-cat-group open">' +
        '<div class="moe-cat-header"><span>我的合集</span></div>' +
        '<div class="moe-cat-items">' +
        collections.map(function(col) {
          return '<div class="moe-cat-item' + (currentCollection === col.id ? ' active' : '') + '"' +
                 ' data-collection="' + col.id + '" onclick="selectMoeCollection(\'' + col.id + '\')">' +
                 '<span><i class="fa fa-folder-o"></i> ' + (col.name || '未命名') + '</span></div>';
        }).join('') +
        '</div></div>';
      return;
    }
    
    var cats = window.moeCategories || {};
    var typeData = cats[currentType];
    if (!typeData) {
      categoryList.innerHTML = '<div class="moe-empty"><p>暂无分类</p></div>';
      return;
    }

    categoryList.innerHTML = typeData.groups.map(function(group, gi) {
      var html = '<div class="moe-cat-group' + (gi === 0 ? ' open' : '') + '" data-group="' + group.id + '">';
      html += '<div class="moe-cat-header" onclick="toggleMoeGroup(\'' + group.id + '\')">';
      html += '<span>' + group.name + '</span>';
      html += '<i class="fa fa-chevron-right moe-cat-toggle"></i></div>';
      html += '<div class="moe-cat-items">';
      html += group.items.map(function(item) {
        return '<div class="moe-cat-item' + (item.id === currentCategory ? ' active' : '') + '"' +
               ' data-cat="' + item.id + '" onclick="selectMoeCategory(\'' + item.id + '\')">' +
               '<span>' + item.name + '</span></div>';
      }).join('');
      html += '</div></div>';
      return html;
    }).join('');
  }

  // ========== 渲染图片网格（核心改进）==========
  function renderGrid() {
    if (!grid) return;
    var allItems = window.moeItems || (window.getMoeItems ? null : []);
    if (allItems === null && window.getMoeItems) {
      allItems = window.getMoeItems(null, null); // 兼容旧格式：获取全部
    }
    if (!Array.isArray(allItems)) allItems = [];

    var items = [];
    var keyword = searchInput ? searchInput.value.trim() : '';

    // 本地过滤
    items = allItems.filter(function(item) {
      // 合集类型特殊处理
      if (currentType === 'collections') {
        if (currentCollection && item.collectionId !== currentCollection) return false;
        // 如果没有选择具体合集，但选择了合集分类，则显示所有有合集的图片
        if (!currentCollection && !item.collectionId) return false;
      } else {
        if (currentType && item.type !== currentType) return false;
        if (currentCategory && item.categoryId !== currentCategory) return false;
      }
      if (keyword) {
        var kw = keyword.toLowerCase();
        var matchTitle = (item.title || '').toLowerCase().indexOf(kw) !== -1;
        var matchTags = (item.tags || []).some(function(t) { return t.toLowerCase().indexOf(kw) !== -1; });
        var matchFile = (item.file || '').toLowerCase().indexOf(kw) !== -1;
        if (!matchTitle && !matchTags && !matchFile) return false;
      }
      return true;
    });

    currentItems = items;

    if (countEl) countEl.textContent = '共 ' + items.length + ' 项';

    if (items.length === 0) {
      grid.innerHTML =
        '<div class="moe-empty">' +
          '<div class="moe-empty-icon"><i class="fa fa-picture-o"></i></div>' +
          '<p>暂无内容，快去添加吧~</p>' +
        '</div>';
      return;
    }

    grid.innerHTML = items.map(function(item, idx) {
      return buildCard(item, idx);
    }).join('');

    // 绑定图片加载失败事件 -> 显示彩色占位符
    grid.querySelectorAll('.moe-card-img-wrap img').forEach(function(img) {
      img.addEventListener('error', function() {
        showPlaceholder(this.parentElement, this.dataset.itemType, this.dataset.itemTitle);
      });
    });

    // 实况图片悬停播放
    grid.querySelectorAll('video').forEach(function(v) {
      v.addEventListener('mouseenter', function() { v.play(); });
      v.addEventListener('mouseleave', function() { v.pause(); v.currentTime = 0; });
    });
  }

  /**
   * 构建卡片 HTML
   */
  function buildCard(item, idx) {
    var typeLabel = getTypeLabel(item.type);
    var phIcon = TYPE_ICONS[item.type] || 'fa-image';
    var gifBadge = item.type === 'gif' ? '<span class="moe-ph-gif-badge">GIF</span>' : '';
    var playBtn = item.type === 'livephoto'
      ? '<button class="moe-ph-play-btn"><i class="fa fa-play"></i></button>'
      : '';

    // 图片/视频部分
    var mediaHtml;
    if (item.type === 'livephoto') {
      mediaHtml = '<video src="' + item.path + '" muted loop preload="metadata"></video>';
    } else {
      mediaHtml = '<img src="' + item.path + '" alt="' + item.title + '" loading="lazy" ' +
                  'data-item-type="' + item.type + '" data-item-title="' + item.title + '">';
    }

    // 下载按钮
    var dlBtn = item.downloadable !== false
      ? '<button class="moe-card-download" onclick="event.stopPropagation();downloadMoeItem(\'' + item.path + '\',\'' + item.file + '\')"><i class="fa fa-download"></i></button>'
      : '';

    return '<div class="moe-card" data-idx="' + idx + '" onclick="openMoeLightbox(' + idx + ')">' +
      '<div class="moe-card-img-wrap">' +
        mediaHtml +
        '<span class="moe-card-badge ' + item.type + '">' + typeLabel + '</span>' +
        dlBtn +
        gifBadge + playBtn +
      '</div>' +
      '<div class="moe-card-info">' +
        '<div class="moe-card-title">' + item.title + '</div>' +
        '<div class="moe-card-meta">' +
          '<span>' + formatSize(item.size) + '</span><span>&middot;</span>' +
          '<span>' + item.date + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="moe-card-tag" onclick="event.stopPropagation();copyMoeTagFromCard(this,\'' + item.type + '\',\'' + item.file + '\')">@' + item.type + ':' + item.file + '</div>' +
    '</div>';
  }

  /**
   * 显示彩色占位符
   */
  function showPlaceholder(container, type, title) {
    var phIcon = TYPE_ICONS[type] || 'fa-image';
    var gifBadge = type === 'gif' ? '<span class="moe-ph-gif-badge">GIF</span>' : '';
    var playBtn = type === 'livephoto'
      ? '<button class="moe-ph-play-btn"><i class="fa fa-play"></i></button>'
      : '';

    container.innerHTML =
      '<div class="moe-placeholder ' + type + '">' +
        '<div class="moe-ph-icon ' + type + '"><i class="fa ' + phIcon + '"></i></div>' +
        '<span class="moe-ph-text">' + (title || '暂无图片') + '</span>' +
        gifBadge + playBtn +
      '</div>';
  }

  // ========== 辅助函数 ==========
  function getTypeLabel(type) {
    var map = { emotion: '表情包', image: '图片', gif: 'GIF', livephoto: '实况图' };
    return map[type] || type;
  }

  function formatSize(size) {
    if (!size) return '-';
    if (size < 1024) return size + 'KB';
    return (size / 1024).toFixed(1) + 'MB';
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)['catch'](function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2000);
  }

  // ========== 全局交互方法 ==========
  window.toggleMoeGroup = function(groupId) {
    var group = document.querySelector('.moe-cat-group[data-group="' + groupId + '"]');
    if (group) group.classList.toggle('open');
  };

  window.selectMoeCategory = function(catId) {
    currentCategory = currentCategory === catId ? null : catId;
    document.querySelectorAll('.moe-cat-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.cat === currentCategory);
    });
    renderGrid();
  };

  // 选择合集
  window.selectMoeCollection = function(colId) {
    currentCollection = currentCollection === colId ? null : colId;
    document.querySelectorAll('.moe-cat-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.collection === currentCollection);
    });
    renderGrid();
  };

  // 切换类型
  function switchType(type) {
    currentType = type;
    currentCategory = null;
    currentCollection = null;
    renderTypeTabs();
    renderCategories();
    renderTagSection();
    renderGrid();
  }

  // Lightbox
  window.openMoeLightbox = function(idx) {
    lightboxIndex = idx;
    var item = currentItems[idx];
    if (!item) return;

    if (item.type === 'livephoto') {
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'block';
      lightboxVideo.src = item.path;
      lightboxVideo.play();
    } else {
      lightboxVideo.style.display = 'none';
      lightboxImg.style.display = 'block';
      lightboxImg.src = item.path;
      // 如果图片也加载失败，显示提示
      lightboxImg.onerror = function() {
        this.style.display = 'none';
      };
    }

    lightboxTitle.textContent = item.title;
    lightboxMeta.textContent = getTypeLabel(item.type) + ' · ' + formatSize(item.size) + ' · ' + item.date;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 暴露给全局供 Lightbox 按钮使用
    window.currentItems = currentItems;
    window.lightboxIndex = idx;
  };

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxVideo.pause();
    document.body.style.overflow = '';
  }

  window.prevMoeLightbox = function() { if (lightboxIndex > 0) openMoeLightbox(lightboxIndex - 1); };
  window.nextMoeLightbox = function() { if (lightboxIndex < currentItems.length - 1) openMoeLightbox(lightboxIndex + 1); };

  // 下载
  window.downloadMoeItem = function(path, filename) {
    var a = document.createElement('a');
    a.href = path;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('已开始下载');
  };

  // 复制引用标签（从卡片底部）
  window.copyMoeTagFromCard = function(el, type, file) {
    var tag = '@' + type + ':' + file;
    copyToClipboard(tag);
    el.classList.add('copied');
    showToast('已复制: ' + tag);
    setTimeout(function() { el.classList.remove('copied'); }, 1500);
  };

  // 复制引用标签（通用）
  window.copyMoeTag = function(type, file) {
    var tag = '@' + type + ':' + file;
    copyToClipboard(tag);
    showToast('已复制: ' + tag);
  };

  // ========== 事件绑定 ==========
  function bindEvents() {
    // 类型 Tab 点击
    if (typeTabs) {
      typeTabs.addEventListener('click', function(e) {
        var tab = e.target.closest('.moe-type-tab');
        if (tab) switchType(tab.dataset.type);
      });
    }

    // 搜索防抖
    if (searchInput) {
      var searchTimer = null;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderGrid, 300);
      });
    }

    // Lightbox 关闭
    if (lightbox) {
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
      });
    }

    // 键盘导航
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevMoeLightbox();
      if (e.key === 'ArrowRight') nextMoeLightbox();
    });

    // 移动端侧边栏
    var toggleBtn = document.getElementById('moe-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
      });
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
      });
    }
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
