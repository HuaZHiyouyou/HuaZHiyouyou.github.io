// 资源页面逻辑
(function() {
  'use strict';

  // 工具函数
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // 获取DOM元素
  const container = document.getElementById('resource-list');
  const searchInput = document.getElementById('resource-search');
  const addBtn = document.getElementById('add-resource-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');

  // 检查是否在管理页面
  const isManagePage = window.isResourceManagePage || false;

  // 渲染资源列表
  function renderResources(resources) {
    if (!container) return;

    if (!resources || resources.length === 0) {
      container.innerHTML = `
        <div class="resource-empty">
          <i class="fa fa-folder-open-o"></i>
          <p>暂无资源数据</p>
        </div>
      `;
      return;
    }

    container.innerHTML = resources.map((resource, index) => {
      const platform = siteData.platformTypes[resource.type] || siteData.platformTypes.other;
      const editBtn = isManagePage ? `
        <button class="resource-btn-edit" data-index="${index}" title="编辑">
          <i class="fa fa-edit"></i>
        </button>
      ` : '';
      const deleteBtn = isManagePage ? `
        <button class="resource-btn-delete" data-index="${index}" title="删除">
          <i class="fa fa-trash"></i>
        </button>
      ` : '';

      return `
        <div class="resource-item" data-index="${index}">
          <div class="resource-icon" style="background: ${resource.color || platform.color}">
            <i class="fa ${resource.icon || platform.icon}"></i>
          </div>
          <div class="resource-info">
            <div class="resource-info-header">
              <span class="resource-name">${escapeHtml(resource.title)}</span>
              <span class="resource-type-badge">${platform.name}</span>
            </div>
            ${resource.description ? `<div class="resource-desc">${escapeHtml(resource.description)}</div>` : ''}
            <div class="resource-meta">
              ${resource.size ? `<span><i class="fa fa-file"></i> ${escapeHtml(resource.size)}</span>` : ''}
              ${resource.password ? `<span><i class="fa fa-key"></i> 提取码: ${escapeHtml(resource.password)}</span>` : ''}
            </div>
          </div>
          <div class="resource-actions-btns">
            <button class="resource-btn resource-btn-copy" data-url="${escapeHtml(resource.url)}" data-password="${escapeHtml(resource.password || '')}" title="复制链接">
              <i class="fa fa-copy"></i> 复制
            </button>
            <a href="${escapeHtml(resource.url)}" target="_blank" class="resource-btn resource-btn-link" title="打开链接">
              <i class="fa fa-external-link"></i> 打开
            </a>
            ${editBtn}
            ${deleteBtn}
          </div>
        </div>
      `;
    }).join('');
  }

  // 过滤资源
  function filterResources() {
    const keyword = (searchInput?.value || '').toLowerCase().trim();
    const filtered = siteData.resources.filter(r => {
      if (!keyword) return true;
      return r.title.toLowerCase().includes(keyword) ||
             (r.description && r.description.toLowerCase().includes(keyword)) ||
             siteData.platformTypes[r.type]?.name.toLowerCase().includes(keyword);
    });
    renderResources(filtered);
  }

  // 显示Toast提示
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // 复制到剪贴板
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制到剪贴板');
    }).catch(() => {
      showToast('复制失败，请手动复制');
    });
  }

  // 处理按钮点击
  function handleClick(e) {
    const copyBtn = e.target.closest('.resource-btn-copy');
    const deleteBtn = e.target.closest('.resource-btn-delete');
    const editBtn = e.target.closest('.resource-btn-edit');

    if (copyBtn) {
      const url = copyBtn.dataset.url;
      const password = copyBtn.dataset.password;
      let text = url;
      if (password) {
        text += `\n提取码: ${password}`;
      }
      copyToClipboard(text);
    } else if (deleteBtn && isManagePage) {
      const index = parseInt(deleteBtn.dataset.index);
      if (confirm('确定删除此资源？')) {
        siteData.resources.splice(index, 1);
        saveResourceData();
        renderResources(siteData.resources);
        showToast('资源已删除');
      }
    } else if (editBtn && isManagePage) {
      const index = parseInt(editBtn.dataset.index);
      openResourceModal(index);
    }
  }

  // 打开添加/编辑弹窗
  function openResourceModal(editIndex = null) {
    const isEdit = editIndex !== null;
    const resource = isEdit ? siteData.resources[editIndex] : {};
    const platformOptions = Object.entries(siteData.platformTypes).map(([key, val]) => 
      `<option value="${key}" ${resource.type === key ? 'selected' : ''}>${val.name}</option>`
    ).join('');

    const modalHtml = `
      <div class="modal-overlay" id="resource-modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>${isEdit ? '编辑资源' : '添加资源'}</h3>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>资源名称 *</label>
              <input type="text" id="resource-title" placeholder="输入资源名称" value="${escapeHtml(resource.title || '')}">
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea id="resource-desc" placeholder="输入资源描述">${escapeHtml(resource.description || '')}</textarea>
            </div>
            <div class="form-group">
              <label>网盘类型 *</label>
              <select id="resource-type">
                ${platformOptions}
              </select>
            </div>
            <div class="form-group">
              <label>分享链接 *</label>
              <input type="text" id="resource-url" placeholder="https://..." value="${escapeHtml(resource.url || '')}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>提取码</label>
                <input type="text" id="resource-password" placeholder="如: abcd" value="${escapeHtml(resource.password || '')}">
              </div>
              <div class="form-group">
                <label>文件大小</label>
                <input type="text" id="resource-size" placeholder="如: 1.2GB" value="${escapeHtml(resource.size || '')}">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline modal-cancel" id="modal-cancel">取消</button>
            <button class="btn btn-fill" id="modal-save">
              <i class="fa fa-save"></i> ${isEdit ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    document.body.appendChild(tempDiv.firstElementChild);

    // 绑定事件
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', function() {
      const title = document.getElementById('resource-title').value.trim();
      const url = document.getElementById('resource-url').value.trim();
      
      if (!title || !url) {
        showToast('请填写名称和链接');
        return;
      }

      const resourceData_item = {
        id: Date.now(),
        title: title,
        description: document.getElementById('resource-desc').value.trim(),
        type: document.getElementById('resource-type').value,
        url: url,
        password: document.getElementById('resource-password').value.trim(),
        size: document.getElementById('resource-size').value.trim(),
        createdAt: new Date().toISOString().split('T')[0]
      };

      if (isEdit) {
        siteData.resources[editIndex] = resourceData_item;
        showToast('资源已更新');
      } else {
        siteData.resources.push(resourceData_item);
        showToast('资源已添加');
      }

      saveResourceData();
        renderResources(siteData.resources);
      closeModal();
    });

    // 点击遮罩关闭
    document.getElementById('resource-modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }

  function closeModal() {
    const modal = document.getElementById('resource-modal-overlay');
    if (modal) modal.remove();
  }

  // 保存数据到 data.js（仅在管理页面）
function saveResourceData() {
    if (!isManagePage) return;
    window.dispatchEvent(new CustomEvent('resource-data-changed', {
      detail: JSON.parse(JSON.stringify(siteData))
    }));
  }

  // 初始化
  function init() {
    renderResources(siteData.resources || []);

    if (searchInput) {
      searchInput.addEventListener('input', filterResources);
    }

    if (addBtn) {
      addBtn.addEventListener('click', function() {
        openResourceModal(null);
      });
    }

    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', function() {
        const allLinks = siteData.resources.map(r => {
          let text = r.url;
          if (r.password) text += ` 提取码: ${r.password}`;
          return text;
        }).join('\n\n');
        copyToClipboard(allLinks);
      });
    }

    if (container) {
      container.addEventListener('click', handleClick);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导出给外部调用
  window.siteData = siteData;
  window.renderResources = renderResources;
})();
