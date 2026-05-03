/**
 * 萌图库管理 - manage.html 中的 CRUD 操作
 * 数据存入 data/moe/ 目录，图片存入 assets/moe/
 */

(function() {
  'use strict';

  // ===== 默认分类数据（内嵌 fallback，不依赖 server/API） =====
  var DEFAULT_MOE_CATEGORIES = {
    emotion: {
      name: '表情包', icon: 'fa-smile-o', color: '#FF85A2',
      groups: [
        {
          id: 'emotion-mood', name: '情绪',
          items: [
            { id: 'emotion-happy', name: '开心' },
            { id: 'emotion-sad', name: '伤心' },
            { id: 'emotion-angry', name: '生气' },
            { id: 'emotion-cry', name: '哭泣' },
            { id: 'emotion-shy', name: '害羞' },
            { id: 'emotion-surprised', name: '惊讶' },
            { id: 'expression-calm', name: '平静' },
            { id: 'expression-helpless', name: '无奈' }
          ]
        },
        {
          id: 'emotion-action', name: '动作',
          items: [
            { id: 'action-hug', name: '抱抱' },
            { id: 'action-pat', name: '摸摸头' },
            { id: 'action-flower', name: '赠花' },
            { id: 'action-kiss', name: '亲亲' },
            { id: 'action-wave', name: '挥手' },
            { id: 'action-thumb', name: '点赞' },
            { id: 'action-holdhand', name: '牵手' },
            { id: 'action-poke', name: '戳一戳' }
          ]
        },
        {
          id: 'emotion-expression', name: '表情',
          items: [
            { id: 'expr-heh', name: '嘿嘿' },
            { id: 'expr-hehe', name: '呵呵' },
            { id: 'expr-awa', name: '啊哇' },
            { id: 'expr-awsl', name: 'AWSL' },
            { id: 'expr-question', name: '问号' },
            { id: 'expr-sweat', name: '流汗' },
            { id: 'expr-dizzy', name: '头晕' },
            { id: 'expr-zzz', name: '睡觉' }
          ]
        },
        {
          id: 'emotion-other', name: '其他',
          items: [
            { id: 'other-text', name: '文字包' },
            { id: 'other-meme', name: '沙雕梗' },
            { id: 'other-greeting', name: '问候语' }
          ]
        }
      ]
    },
    image: {
      name: '图片', icon: 'fa-image', color: '#8B5CF6',
      groups: [
        {
          id: 'img-character', name: '角色类型',
          items: [
            { id: 'char-loli', name: '萝莉' },
            { id: 'char-girl', name: '少女' },
            { id: 'char-oneesan', name: '御姐' },
            { id: 'char-shota', name: '正太' },
            { id: 'char-bishoujo', name: '美少女' },
            { id: 'char-animal', name: '兽耳娘' },
            { id: 'char-mecha', name: '机甲' },
            { id: 'char-fantasy', name: '幻想系' }
          ]
        },
        {
          id: 'img-personality', name: '性格',
          items: [
            { id: 'perso-cute', name: '可爱' },
            { id: 'perso-moe', name: '萌' },
            { id: 'perso-sunny', name: '阳光' },
            { id: 'perso-cool', name: '酷' },
            { id: 'perso-gentle', name: '温柔' },
            { id: 'perso-lively', name: '活泼' },
            { id: 'perso-quiet', name: '文静' },
            { id: 'perso-tsundere', name: '傲娇' }
          ]
        },
        {
          id: 'img-style', name: '画风',
          items: [
            { id: 'style-pixel', name: '像素风' },
            { id: 'style-watercolor', name: '水彩风' },
            { id: 'style-sketch', name: '素描风' },
            { id: 'style-flat', name: '扁平风' },
            { id: 'style-realistic', name: '写实风' },
            { id: 'style-chibi', name: 'Q版' }
          ]
        },
        {
          id: 'img-scene', name: '场景',
          items: [
            { id: 'scene-school', name: '校园' },
            { id: 'scene-nature', name: '自然风景' },
            { id: 'scene-city', name: '城市街景' },
            { id: 'scene-indoor', name: '室内' },
            { id: 'scene-fantasy', name: '奇幻场景' },
            { id: 'scene-night', name: '夜景' }
          ]
        }
      ]
    },
    gif: {
      name: 'GIF动图', icon: 'fa-film', color: '#10B981',
      groups: [
        {
          id: 'gif-reaction', name: '反应',
          items: [
            { id: 'gifr-nod', name: '点头' },
            { id: 'gifr-shake', name: '摇头' },
            { id: 'gifr-clap', name: '鼓掌' },
            { id: 'gifr-facepalm', name: '捂脸' },
            { id: 'gifr-dance', name: '跳舞' },
            { id: 'gifr-run', name: '逃跑' }
          ]
        },
        {
          id: 'gif-daily', name: '日常',
          items: [
            { id: 'gife-eat', name: '吃饭' },
            { id: 'gife-sleep', name: '睡觉' },
            { id: 'gife-study', name: '学习' },
            { id: 'gife-game', name: '游戏' },
            { id: 'gife-cook', name: '做饭' }
          ]
        },
        {
          id: 'gif-anime', name: '动漫',
          items: [
            { id: 'gifa-transform', name: '变身' },
            { id: 'gifa-attack', name: '攻击' },
            { id: 'gifa-magic', name: '施法' },
            { id: 'gifa-idle', name: '待机' }
          ]
        }
      ]
    },
    livephoto: {
      name: '实况图片', icon: 'fa-camera', color: '#F59E0B',
      groups: [
        {
          id: 'lp-moment', name: '瞬间',
          items: [
            { id: 'lpm-smile', name: '微笑瞬间' },
            { id: 'lpm-turn', name: '回头瞬间' },
            { id: 'lpm-walk', name: '行走瞬间' },
            { id: 'lpm-laugh', name: '大笑瞬间' }
          ]
        },
        {
          id: 'lp-effect', name: '特效',
          items: [
            { id: 'lpe-sparkle', name: '闪光特效' },
            { id: 'lpe-rain', name: '雨天特效' },
            { id: 'lpe-petals', name: '花瓣飘落' },
            { id: 'lpe-snow', name: '雪花特效' }
          ]
        },
        {
          id: 'lp-scene', name: '场景',
          items: [
            { id: 'lps-cafe', name: '咖啡厅' },
            { id: 'lps-street', name: '街头' },
            { id: 'lps-sea', name: '海边' },
            { id: 'lps-rooftop', name: '天台' }
          ]
        }
      ]
    }
  };

  // ===== 状态 =====
  let moeDataItems = [];       // 当前编辑中的 items
  let moeDataCategories = null; // 分类数据
  let moeCollections = [];     // 合集数据
  let currentMoeFilter = 'all';
  let currentMoeSearch = '';
  let pendingMoeImage = null;   // 待上传的图片信息
  let pendingCollectionCover = null; // 合集封面待上传

  // ===== 初始化 =====
  document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件 - 萌图库
    document.getElementById('add-moe-btn')?.addEventListener('click', openAddMoeModal);
    document.getElementById('save-moe-btn')?.addEventListener('click', saveMoeToServer);
    document.getElementById('moe-form')?.addEventListener('submit', handleMoeFormSubmit);
    document.getElementById('add-moe-image-btn')?.addEventListener('click', function() {
      document.getElementById('moe-image-input')?.click();
    });
    document.getElementById('moe-image-input')?.addEventListener('change', handleMoeImageSelect);
    document.getElementById('moe-modal-type')?.addEventListener('change', refreshMoeCategoryOptions);
    document.getElementById('moe-search-input')?.addEventListener('input', function(e) {
      currentMoeSearch = e.target.value;
      renderMoeManageList();
    });

    // 类型筛选按钮
    document.querySelectorAll('[data-moefilter]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('[data-moefilter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMoeFilter = btn.dataset.moefilter;
        renderMoeManageList();
      });
    });

    // 模态框关闭时清理预览
    var moeModal = document.getElementById('moe-modal');
    if (moeModal) {
      moeModal.querySelector('.modal-close')?.addEventListener('click', clearMoePreview);
      moeModal.querySelector('.modal-cancel')?.addEventListener('click', clearMoePreview);
    }

    // ===== 合集事件绑定 =====
    document.getElementById('toggle-collections-btn')?.addEventListener('click', showCollectionsPanel);
    document.getElementById('toggle-moe-btn')?.addEventListener('click', showMoePanel);

    document.getElementById('add-collection-btn')?.addEventListener('click', openAddCollectionModal);
    document.getElementById('save-collections-btn')?.addEventListener('click', saveCollectionsToServer);
    document.getElementById('collection-form')?.addEventListener('submit', handleCollectionFormSubmit);
    document.getElementById('add-collection-cover-btn')?.addEventListener('click', function() {
      document.getElementById('collection-cover-input')?.click();
    });
    document.getElementById('collection-cover-input')?.addEventListener('change', handleCollectionCoverSelect);

    // 合集详情模态框
    document.getElementById('detail-add-item-btn')?.addEventListener('click', function() {
      closeModal('collection-detail-modal');
      openAddMoeModal();
    });
    document.getElementById('detail-edit-collection-btn')?.addEventListener('click', editCurrentDetailCollection);
    document.getElementById('detail-delete-collection-btn')?.addEventListener('click', deleteCurrentDetailCollection);
  });

  // ===== 从 server 加载数据（切换到萌图库面板时调用）=====
  window.loadMoeManageData = function() {
    fetch('/api/data')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        moeDataItems = data.moeItems || [];
        moeDataCategories = data.moeCategories || null;
        moeCollections = data.moeCollections || [];
        // 如果 API 返回的分类为空，使用默认分类
        if (!moeDataCategories || Object.keys(moeDataCategories).length === 0) {
          moeDataCategories = DEFAULT_MOE_CATEGORIES;
        }
        renderMoeManageList();
        refreshCollectionDropdown();
      })
      .catch(function(err) {
        console.error('加载萌图库数据失败:', err);
        // fallback: 尝试从全局变量读取
        if (window.moeItems) moeDataItems = window.moeItems;
        if (window.moeCategories) moeDataCategories = window.moeCategories;
        if (window.moeCollections) moeCollections = window.moeCollections;
        // 最终 fallback: 使用内置默认分类
        if (!moeDataCategories) moeDataCategories = DEFAULT_MOE_CATEGORIES;
        if (!moeDataItems) moeDataItems = [];
        if (!moeCollections) moeCollections = [];
        renderMoeManageList();
        refreshCollectionDropdown();
      });
  };

  // ===== 渲染管理列表 =====
  function renderMoeManageList() {
    var container = document.getElementById('moe-manage-list');
    if (!container) return;

    var filtered = moeDataItems.filter(function(item) {
      if (currentMoeFilter !== 'all' && item.type !== currentMoeFilter) return false;
      if (currentMoeSearch) {
        var kw = currentMoeSearch.toLowerCase();
        var matchTitle = (item.title || '').toLowerCase().indexOf(kw) !== -1;
        var matchTags = (item.tags || []).some(function(t) { return t.toLowerCase().indexOf(kw) !== -1; });
        var matchFile = (item.file || '').toLowerCase().indexOf(kw) !== -1;
        if (!matchTitle && !matchTags && !matchFile) return false;
      }
      return true;
    });

    document.getElementById('moe-total-count').textContent = '共 ' + filtered.length + ' 项';

    if (filtered.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-4" style="color:#aaa;padding:3rem;">暂无数据，点击"添加图片"开始</div>';
      return;
    }

    var typeLabels = { emotion: '表情包', image: '图片', gif: 'GIF', livephoto: '实况' };
    var typeColors = { emotion: '#FF85A2', image: '#8B5CF6', gif: '#10B981', livephoto: '#F59E0B' };

    var html = '';
    filtered.forEach(function(item) {
      var tag = item.type + ':' + item.file;
      html += '<div class="moe-manage-item" data-id="' + item.id + '">' +
        '<div class="moe-item-preview">' +
          (item.path ? '<img src="' + escapeHtml(item.path) + '" alt="" onerror="this.style.display=\'none\'">' :
           '<div class="moe-placeholder" style="background:' + (typeColors[item.type] || '#ccc') + '20">' +
             '<i class="fa fa-image" style="color:' + (typeColors[item.type] || '#ccc') + '"></i></div>') +
        '</div>' +
        '<div class="moe-item-info">' +
          '<div class="moe-item-title">' + escapeHtml(item.title || '未命名') + '</div>' +
          '<div class="moe-item-meta">' +
            '<span class="moe-type-badge" style="background:' + (typeColors[item.type] || '#ccc') + '15;color:' + (typeColors[item.type] || '#ccc') + '">' +
              (typeLabels[item.type] || item.type) + '</span>' +
            '<span class="moe-file-name">' + escapeHtml(item.file || '') + '</span>' +
          '</div>' +
          '<div class="moe-item-tags">' + (item.tags || []).map(function(t) { return '<span class="tag-pill">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
          '<code class="moe-ref-code">@' + tag + '</code>' +
        '</div>' +
        '<div class="moe-item-actions">' +
          '<button class="btn btn-outline btn-sm moe-edit-btn" data-id="' + item.id + '" title="编辑"><i class="fa fa-edit"></i></button>' +
          '<button class="btn btn-danger btn-sm moe-delete-btn" data-id="' + item.id + '" title="删除"><i class="fa fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;

    // 绑定编辑和删除事件
    container.querySelectorAll('.moe-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { openEditMoeModal(btn.dataset.id); });
    });
    container.querySelectorAll('.moe-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { deleteMoeItem(btn.dataset.id); });
    });
  }

  // ===== 打开添加模态框 =====
  function openAddMoeModal() {
    document.getElementById('moe-modal-title').innerHTML = '<i class="fa fa-picture-o"></i> 添加图片';
    document.getElementById('moe-edit-id').value = '';
    document.getElementById('moe-form').reset();
    clearMoePreview();
    pendingMoeImage = null;
    refreshMoeCategoryOptions();
    refreshCollectionDropdown();
    openModal('moe-modal');
  }

  // ===== 打开编辑模态框 =====
  function openEditMoeModal(id) {
    var item = moeDataItems.find(function(i) { return i.id === id; });
    if (!item) return;

    document.getElementById('moe-modal-title').innerHTML = '<i class="fa fa-edit"></i> 编辑图片';
    document.getElementById('moe-edit-id').value = id;
    document.getElementById('moe-modal-type').value = item.type;
    refreshMoeCategoryOptions();
    document.getElementById('moe-modal-category').value = item.categoryId;
    document.getElementById('moe-modal-title-input').value = item.title || '';
    document.getElementById('moe-modal-tags').value = (item.tags || []).join(', ');
    // 回填合集选择
    refreshCollectionDropdown();
    var colSel = document.getElementById('moe-modal-collection');
    if (colSel && item.collectionId) colSel.value = item.collectionId;

    // 显示当前图片
    var preview = document.getElementById('moe-images-preview');
    if (preview && item.path) {
      preview.innerHTML = '<div class="moment-img-thumb"><img src="' + item.path + '" alt=""><button type="button" class="img-remove-btn">&times;</button></div>';
      preview.querySelector('.img-remove-btn')?.addEventListener('click', clearMoePreview);
      pendingMoeImage = { path: item.path, file: item.file };
    } else {
      clearMoePreview();
    }

    openModal('moe-modal');
  }

  // ===== 刷新分类下拉选项 =====
  function refreshMoeCategoryOptions() {
    var typeSel = document.getElementById('moe-modal-type');
    var catSel = document.getElementById('moe-modal-category');
    if (!typeSel || !catSel) return;
    // 优先使用加载的数据，否则使用内置默认分类
    var cats = moeDataCategories || DEFAULT_MOE_CATEGORIES;

    var typeKey = typeSel.value;
    var typeData = cats[typeKey];
    catSel.innerHTML = '';

    if (typeData && typeData.groups) {
      typeData.groups.forEach(function(g) {
        // 如果分组下没有子项，则直接把分组本身作为选项
        if (g.items && g.items.length > 0) {
          g.items.forEach(function(subItem) {
            var opt = document.createElement('option');
            opt.value = subItem.id;
            opt.textContent = g.name + ' > ' + subItem.name;
            catSel.appendChild(opt);
          });
        } else {
          // 分组无子项时，用分组 id 和 name 作为选项
          var opt = document.createElement('option');
          opt.value = g.id;
          opt.textContent = g.name;
          catSel.appendChild(opt);
        }
      });
    }

    if (catSel.options.length === 0) {
      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '暂无分类';
      catSel.appendChild(opt);
    }
  }

  // ===== 图片选择处理 =====
  function handleMoeImageSelect(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(ev) {
      var preview = document.getElementById('moe-images-preview');
      preview.innerHTML = '<div class="moment-img-thumb"><img src="' + ev.target.result + '" alt=""><button type="button" class="img-remove-btn">&times;</button></div>';
      preview.querySelector('.img-remove-btn')?.addEventListener('click', clearMoePreview);
      pendingMoeImage = { file: file, name: file.name };
    };
    reader.readAsDataURL(file);
  }

  // ===== 清理图片预览 =====
  function clearMoePreview() {
    var preview = document.getElementById('moe-images-preview');
    if (preview) preview.innerHTML = '';
    var input = document.getElementById('moe-image-input');
    if (input) input.value = '';
    pendingMoeImage = null;
  }

  // ===== 表单提交（先上传图片再保存数据） =====
  function handleMoeFormSubmit(e) {
    e.preventDefault();

    var editId = document.getElementById('moe-edit-id').value;
    var type = document.getElementById('moe-modal-type').value;
    var categoryId = document.getElementById('moe-modal-category').value;
    var title = document.getElementById('moe-modal-title-input').value.trim();
    var tagsStr = document.getElementById('moe-modal-tags').value.trim();
    var collectionId = document.getElementById('moe-modal-collection')?.value || '';

    // 标题不再是必填项
    if (!categoryId) { showToast('请选择分类'); return; }

    var tags = tagsStr ? tagsStr.split(/[,，]/).map(function(t) { return t.trim(); }).filter(Boolean) : [];

    // 检查是否有新选择的图片文件（File 对象）
    var hasNewFile = pendingMoeImage && pendingMoeImage.file && pendingMoeImage.file instanceof File;
    
    if (hasNewFile) {
      // 需要先上传新图片
      uploadMoeImage(pendingMoeImage.file, type, function(result) {
        saveMoeItemData(editId, {
          type: type,
          categoryId: categoryId,
          collectionId: collectionId,
          title: title,
          tags: tags,
          file: result.fileName,
          path: result.path,
          date: new Date().toISOString().slice(0, 10)
        });
      });
    } else {
      // 无新图片或使用已有路径（编辑时保留原图片）
      var existingPath = pendingMoeImage ? pendingMoeImage.path : '';
      var existingFile = pendingMoeImage && typeof pendingMoeImage.file === 'string' ? pendingMoeImage.file : '';
      saveMoeItemData(editId, {
        type: type,
        categoryId: categoryId,
        collectionId: collectionId,
        title: title,
        tags: tags,
        file: existingFile || '',
        path: existingPath || '',
        date: new Date().toISOString().slice(0, 10)
      });
    }
  }

  // ===== 上传图片到服务器 =====
  function uploadMoeImage(file, type, callback) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    showToast('正在上传...');

    fetch('/api/upload-moe', { method: 'POST', body: formData })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          callback({ fileName: data.fileName, path: data.path });
        } else {
          showToast('上传失败: ' + (data.error || '未知错误'));
        }
      })
      .catch(function(err) {
        showToast('上传出错: ' + err.message);
      });
  }

  // ===== 保存项目数据到本地状态 =====
  function saveMoeItemData(editId, data) {
    if (editId) {
      // 编辑
      var idx = moeDataItems.findIndex(function(i) { return i.id === editId; });
      if (idx !== -1) {
        Object.assign(moeDataItems[idx], data);
      }
    } else {
      // 新增
      data.id = 'moe_' + Date.now();
      moeDataItems.push(data);
    }

    closeModal('moe-modal');
    renderMoeManageList();
    showToast(editId ? '已更新' : '已添加（记得点保存）');
  }

  // ===== 删除条目 =====
  function deleteMoeItem(id) {
    if (!confirm('确定要删除这个图片吗？')) return;
    moeDataItems = moeDataItems.filter(function(i) { return i.id !== id; });
    renderMoeManageList();
    showToast('已删除（记得点保存）');
  }

  // ===== 保存到服务器 data/ 目录 =====
  function saveMoeToServer() {
    var dataToSend = {
      moeItems: moeDataItems,
      moeCategories: moeDataCategories,
      moeCollections: moeCollections
    };

    showToast('正在保存...');

    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result.success) {
        showToast('已保存到 data/ 目录，即将刷新...');
        // 保存成功后刷新页面重新加载数据
        setTimeout(function() {
          window.location.reload();
        }, 500);
      } else {
        showToast('保存失败: ' + (result.error || ''));
      }
    })
    .catch(function(err) {
      showToast('网络错误: ' + err.message);
    });
  }

  // ===== ===== 合集管理功能 ===== =====

  // --- 面板切换 ---
  function showCollectionsPanel() {
    var moePanel = document.getElementById('admin-moe');
    var colPanel = document.getElementById('admin-collections');
    if (moePanel) { moePanel.classList.remove('active'); moePanel.style.display = 'none'; }
    if (colPanel) { colPanel.classList.add('active'); colPanel.style.display = ''; }
    renderCollectionsList();
  }
  function showMoePanel() {
    var colPanel = document.getElementById('admin-collections');
    var moePanel = document.getElementById('admin-moe');
    if (colPanel) { colPanel.classList.remove('active'); colPanel.style.display = 'none'; }
    if (moePanel) { moePanel.classList.add('active'); moePanel.style.display = ''; }
    renderMoeManageList();
  }
  window.showCollectionsPanel = showCollectionsPanel;
  window.showMoePanel = showMoePanel;

  // --- 渲染合集列表（显示所有合集，有封面优先用封面，无封面则用第一张图片）---
  function renderCollectionsList() {
    var container = document.getElementById('collections-list');
    if (!container) return;

    // 显示所有合集（包括没有图片的）
    if (moeCollections.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-4" style="color:#aaa;padding:3rem;">暂无合集，点击"新建合集"开始整理图片</div>';
      return;
    }

    var html = '';
    moeCollections.forEach(function(col) {
      // 获取该合集下的所有图片
      var collectionItems = moeDataItems.filter(function(item) { return item.collectionId === col.id; });
      var itemCount = collectionItems.length;
      
      // 确定封面图：优先使用设置的封面，其次使用第一张图片
      var coverPath = col.coverPath || '';
      if (!coverPath && collectionItems.length > 0) {
        coverPath = collectionItems[0].path;
      }
      
      var coverHtml = coverPath
        ? '<img src="' + escapeHtml(coverPath) + '" alt="" onerror="this.outerHTML=\'<div class=\\\'collection-placeholder\\\'><i class=\\\'fa fa-folder-o\\\'></i></div>\'">'
        : '<div class="collection-placeholder"><i class="fa fa-folder-o"></i></div>';
        
      html += '<div class="collection-card" data-id="' + col.id + '">' +
        '<div class="collection-cover" onclick="window.openCollectionDetail(\'' + col.id + '\')">' + coverHtml + '</div>' +
        '<div class="collection-info">' +
          '<div class="collection-name">' + escapeHtml(col.name || '未命名') + '</div>' +
          '<div class="collection-meta"><span><i class="fa fa-image"></i> ' + itemCount + ' 张</span>' +
          (col.date ? '<span><i class="fa fa-clock-o"></i> ' + col.date + '</span>' : '') + '</div>' +
          (col.description ? '<p class="collection-desc">' + escapeHtml(col.description) + '</p>' : '') +
          (col.tags && col.tags.length ? '<div class="collection-tags">' + col.tags.map(function(t) { return '<span class="tag-pill">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="collection-actions">' +
          '<button class="btn btn-outline btn-sm collection-view-btn" data-id="' + col.id + '" title="查看详情"><i class="fa fa-eye"></i></button>' +
          '<button class="btn btn-outline btn-sm collection-edit-btn" data-id="' + col.id + '" title="编辑"><i class="fa fa-edit"></i></button>' +
          '<button class="btn btn-danger btn-sm collection-delete-btn" data-id="' + col.id + '" title="删除"><i class="fa fa-trash"></i></button>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll('.collection-view-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { openCollectionDetail(btn.dataset.id); });
    });
    container.querySelectorAll('.collection-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { openEditCollectionModal(btn.dataset.id); });
    });
    container.querySelectorAll('.collection-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { deleteCollection(btn.dataset.id); });
    });
  }

  // --- 打开新建合集模态框 ---
  function openAddCollectionModal() {
    document.getElementById('collection-modal-title').innerHTML = '<i class="fa fa-folder-o"></i> 新建合集';
    document.getElementById('collection-edit-id').value = '';
    document.getElementById('collection-form').reset();
    clearCollectionCoverPreview();
    pendingCollectionCover = null;
    openModal('collection-modal');
  }

  // --- 打开编辑合集模态框 ---
  function openEditCollectionModal(id) {
    var col = moeCollections.find(function(c) { return c.id === id; });
    if (!col) return;

    document.getElementById('collection-modal-title').innerHTML = '<i class="fa fa-edit"></i> 编辑合集';
    document.getElementById('collection-edit-id').value = id;
    document.getElementById('collection-name-input').value = col.name || '';
    document.getElementById('collection-desc-input').value = col.description || '';
    document.getElementById('collection-tags-input').value = (col.tags || []).join(', ');

    // 显示当前封面
    var preview = document.getElementById('collection-cover-preview');
    if (preview && col.coverPath) {
      preview.innerHTML = '<div class="moment-img-thumb"><img src="' + col.coverPath + '" alt=""><button type="button" class="img-remove-btn">&times;</button></div>';
      preview.querySelector('.img-remove-btn')?.addEventListener('click', clearCollectionCoverPreview);
      pendingCollectionCover = { path: col.coverPath, file: col.coverFile };
    } else {
      clearCollectionCoverPreview();
    }

    openModal('collection-modal');
  }

  // --- 封面图选择处理 ---
  function handleCollectionCoverSelect(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(ev) {
      var preview = document.getElementById('collection-cover-preview');
      preview.innerHTML = '<div class="moment-img-thumb collection-cover-thumb"><img src="' + ev.target.result + '" alt=""><button type="button" class="img-remove-btn">&times;</button></div>';
      preview.querySelector('.img-remove-btn')?.addEventListener('click', clearCollectionCoverPreview);
      pendingCollectionCover = { file: file, name: file.name };
    };
    reader.readAsDataURL(file);
  }

  function clearCollectionCoverPreview() {
    var preview = document.getElementById('collection-cover-preview');
    if (preview) preview.innerHTML = '';
    var input = document.getElementById('collection-cover-input');
    if (input) input.value = '';
    pendingCollectionCover = null;
  }

  // --- 合集表单提交 ---
  function handleCollectionFormSubmit(e) {
    e.preventDefault();

    var editId = document.getElementById('collection-edit-id').value;
    var name = document.getElementById('collection-name-input').value.trim();
    if (!name) { showToast('请输入合集名称'); return; }

    var desc = document.getElementById('collection-desc-input').value.trim();
    var tagsStr = document.getElementById('collection-tags-input').value.trim();
    var tags = tagsStr ? tagsStr.split(/[,，]/).map(function(t) { return t.trim(); }).filter(Boolean) : [];

    function finishSave(coverData) {
      var data = {
        name: name,
        description: desc,
        tags: tags,
        date: new Date().toISOString().slice(0, 10)
      };
      if (coverData) {
        data.coverFile = coverData.fileName;
        data.coverPath = coverData.path;
      } else if (pendingCollectionCover && pendingCollectionCover.path) {
        data.coverFile = pendingCollectionCover.file || '';
        data.coverPath = pendingCollectionCover.path;
      }

      if (editId) {
        var idx = moeCollections.findIndex(function(c) { return c.id === editId; });
        if (idx !== -1) Object.assign(moeCollections[idx], data);
      } else {
        data.id = 'col_' + Date.now();
        moeCollections.push(data);
      }

      closeModal('collection-modal');
      renderCollectionsList();
      refreshCollectionDropdown();
      showToast(editId ? '合集已更新' : '合集已创建（记得点保存）');
    }

    if (pendingCollectionCover && pendingCollectionCover.file) {
      uploadCollectionCover(pendingCollectionCover.file, function(result) {
        finishSave({ fileName: result.fileName, path: result.path });
      });
    } else {
      finishSave(null);
    }
  }

  // --- 上传合集封面 ---
  function uploadCollectionCover(file, callback) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'collection');

    showToast('正在上传封面...');
    fetch('/api/upload-moe', { method: 'POST', body: formData })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) callback({ fileName: data.fileName, path: data.path });
        else showToast('上传失败: ' + (data.error || '未知错误'));
      })
      .catch(function(err) { showToast('上传出错: ' + err.message); });
  }

  // --- 删除合集 ---
  function deleteCollection(id) {
    if (!confirm('确定要删除这个合集吗？图片不会被删除。')) return;
    // 清除关联图片的 collectionId
    moeDataItems.forEach(function(item) {
      if (item.collectionId === id) item.collectionId = '';
    });
    moeCollections = moeCollections.filter(function(c) { return c.id !== id; });
    renderCollectionsList();
    refreshCollectionDropdown();
    showToast('已删除（记得点保存）');
  }

  // --- 打开合集详情 ---
  function openCollectionDetail(id) {
    var col = moeCollections.find(function(c) { return c.id === id; });
    if (!col) return;

    document.getElementById('detail-collection-id').value = id;
    document.getElementById('collection-detail-title').innerHTML =
      '<i class="fa fa-folder-o"></i> ' + escapeHtml(col.name || '合集详情');

    // 渲染该合集中的图片
    var itemsContainer = document.getElementById('collection-detail-items');
    var items = moeDataItems.filter(function(item) { return item.collectionId === id; });

    var typeLabels = { emotion: '表情包', image: '图片', gif: 'GIF', livephoto: '实况' };
    var typeColors = { emotion: '#FF85A2', image: '#8B5CF6', gif: '#10B981', livephoto: '#F59E0B' };

    if (items.length === 0) {
      itemsContainer.innerHTML = '<div style="color:#999;padding:1.5rem;text-align:center;">该合集暂无图片，点击上方"添加图片到合集"按钮</div>';
    } else {
      var html = '';
      items.forEach(function(item) {
        html += '<div class="moe-manage-item" data-id="' + item.id + '">' +
          '<div class="moe-item-preview">' +
            (item.path ? '<img src="' + escapeHtml(item.path) + '" alt="" onerror="this.style.display=\'none\'">' :
             '<div class="moe-placeholder" style="background:' + (typeColors[item.type] || '#ccc') + '20"><i class="fa fa-image" style="color:' + (typeColors[item.type] || '#ccc') + '"></i></div>') +
          '</div>' +
          '<div class="moe-item-info">' +
            '<div class="moe-item-title">' + escapeHtml(item.title || '未命名') + '</div>' +
            '<span class="moe-type-badge" style="background:' + (typeColors[item.type] || '#ccc') + '15;color:' + (typeColors[item.type] || '#ccc') + '">' +
              (typeLabels[item.type] || item.type) + '</span>' +
          '</div>' +
          '<div class="moe-item-actions">' +
            '<button class="btn btn-outline btn-sm detail-remove-item-btn" data-id="' + item.id + '" title="从合集中移除"><i class="fa fa-times"></i> 移出</button>' +
          '</div>' +
        '</div>';
      });
      itemsContainer.innerHTML = html;

      itemsContainer.querySelectorAll('.detail-remove-item-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var itemId = btn.dataset.id;
          var item = moeDataItems.find(function(i) { return i.id === itemId; });
          if (item) { item.collectionId = ''; }
          openCollectionDetail(id); // 刷新
          showToast('已移出合集');
        });
      });
    }

    openModal('collection-detail-modal');
  }
  window.openCollectionDetail = openCollectionDetail;

  // --- 详情中的编辑/删除合集 ---
  function editCurrentDetailCollection() {
    var id = document.getElementById('detail-collection-id').value;
    closeModal('collection-detail-modal');
    openEditCollectionModal(id);
  }

  function deleteCurrentDetailCollection() {
    var id = document.getElementById('detail-collection-id').value;
    if (!confirm('确定要删除这个合集吗？')) return;
    closeModal('collection-detail-modal');
    deleteCollection(id);
    renderCollectionsList();
  }

  // --- 刷新图片表单中的「所属合集」下拉 ---
  function refreshCollectionDropdown() {
    var sel = document.getElementById('moe-modal-collection');
    if (!sel) return;
    sel.innerHTML = '<option value="">（不归入任何合集）</option>';
    moeCollections.forEach(function(c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name || '未命名';
      sel.appendChild(opt);
    });
  }

  // --- 保存合集数据到服务器 ---
  function saveCollectionsToServer() {
    var dataToSend = {
      moeItems: moeDataItems,
      moeCategories: moeDataCategories,
      moeCollections: moeCollections
    };

    showToast('正在保存合集...');
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result.success) {
        showToast('合集数据已保存，即将刷新...');
        setTimeout(function() {
          window.location.reload();
        }, 500);
      }
      else { showToast('保存失败: ' + (result.error || '')); }
    })
    .catch(function(err) { showToast('网络错误: ' + err.message); });
  }

  // ===== 工具函数 =====
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  }
  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // 暴露给外部调用
  window.renderMoeManageList = renderMoeManageList;
})();
