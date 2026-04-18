const Notes = (function() {
  let currentCategory = 'all';
  let searchQuery = '';
  let notesData = [];

  function init() {
    loadData();
    renderFilters();
    renderNotes();
    bindEvents();
  }

  function loadData() {
    notesData = (siteData.notes || []).map(note => ({
      ...note,
      createdAt: note.createdAt || new Date().toISOString().split('T')[0]
    }));
  }

  function renderFilters() {
    const categories = siteData.notesCategories || {};
    let html = '<button class="filter-btn active" data-category="all">全部</button>';
    
    for (const [key, cat] of Object.entries(categories)) {
      html += '<button class="filter-btn" data-category="' + key + '"><i class="fa ' + cat.icon + '"></i> ' + cat.name + '</button>';
    }
    
    document.getElementById('docs-filters').innerHTML = html;
  }

  function renderNotes() {
    const filtered = getFilteredNotes();
    const container = document.getElementById('docs-list');
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="docs-empty"><i class="fa fa-file-text"></i><p>暂无笔记</p></div>';
      return;
    }
    
    let html = '';
    filtered.forEach((note, index) => {
      const cat = siteData.notesCategories?.[note.category] || {};
      const isLinkOnly = isLinkOnlyNote(note);
      const summary = escapeHtml(getBlockSummary(note));
      
      html += '<div class="docs-card" data-id="' + note.id + '" style="animation-delay: ' + (index * 0.05) + 's">';
      html += '<div class="docs-card-header"><h3 class="docs-card-title">' + escapeHtml(note.title) + '</h3></div>';
      html += '<div class="docs-card-meta">';
      html += '<span class="docs-card-category" style="background: ' + cat.color + '20; color: ' + cat.color + '">' + (cat.name || note.category) + '</span>';
      html += '<span class="docs-card-date">' + note.createdAt + '</span></div>';
      
      if (note.tags && note.tags.length) {
        html += '<div class="docs-card-tags">';
        note.tags.forEach(tag => {
          html += '<span class="docs-tag">' + escapeHtml(tag) + '</span>';
        });
        html += '</div>';
      }
      
      if (isLinkOnly) {
        html += renderLinkList(note);
      } else {
        html += '<div class="docs-card-desc">' + summary + '</div>';
      }
      
      html += '</div>';
    });
    
    container.innerHTML = html;
  }

  function isLinkOnlyNote(note) {
    if (!note.blocks || !note.blocks.length) return false;
    return note.blocks.every(b => b.type === 'link');
  }

  function renderLinkList(note) {
    let html = '<div class="docs-link-list">';
    note.blocks.forEach(block => {
      let linkUrl = block.content.replace('https://', '').replace('http://', '');
      if (linkUrl.endsWith('/')) linkUrl = linkUrl.slice(0, -1);
      html += '<div class="docs-link-box"><i class="fa fa-link"></i> ' + escapeHtml(linkUrl) + '</div>';
    });
    html += '</div>';
    return html;
  }

  function getBlockSummary(note) {
    if (!note.blocks || !note.blocks.length) return '';
    const firstBlock = note.blocks[0];
    if (firstBlock.type === 'text') return firstBlock.content.slice(0, 80);
    return firstBlock.content.slice(0, 80);
  }

  function getFilteredNotes() {
    return notesData.filter(note => {
      const matchCategory = currentCategory === 'all' || note.category === currentCategory;
      const query = searchQuery.toLowerCase();
      const matchSearch = !query || 
        note.title?.toLowerCase().includes(query) ||
        (note.tags || []).some(t => t.toLowerCase().includes(query)) ||
        (note.blocks || []).some(b => b.content?.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;');
  }

  function showDetail(note) {
    const modal = document.getElementById('detail-modal');
    const overlay = document.getElementById('detail-overlay');
    const titleEl = document.getElementById('detail-title');
    const bodyEl = document.getElementById('detail-body');
    
    titleEl.textContent = note.title;
    const cat = siteData.notesCategories?.[note.category] || {};
    
    let metaHtml = '<span class="detail-category" style="background: ' + cat.color + '20; color: ' + cat.color + '">' + (cat.name || note.category) + '</span>';
    metaHtml += '<span class="detail-date">' + note.createdAt + '</span>';
    if (note.tags && note.tags.length) {
      note.tags.forEach(tag => {
        metaHtml += '<span class="detail-tag">' + escapeHtml(tag) + '</span>';
      });
    }
    
    let contentHtml = '';
    if (note.blocks && note.blocks.length) {
      note.blocks.forEach(block => {
        if (block.type === 'text') {
          contentHtml += '<div class="detail-text">' + escapeHtml(block.content) + '</div>';
        } else if (block.type === 'code') {
          contentHtml += '<div class="detail-code-wrapper"><pre class="detail-code"><code>' + escapeHtml(block.content) + '</code></pre>';
          contentHtml += '<button class="detail-copy-code-btn" data-code="' + escapeHtml(block.content) + '"><i class="fa fa-copy"></i> 复制</button></div>';
        } else if (block.type === 'link') {
          contentHtml += '<a href="' + escapeHtml(block.content) + '" target="_blank" class="detail-link-item"><i class="fa fa-link"></i> ' + escapeHtml(block.content) + '</a>';
        } else if (block.type === 'image') {
          contentHtml += '<img src="' + escapeHtml(block.content) + '" alt="图片" class="detail-image">';
        }
      });
    }
    
    bodyEl.innerHTML = '<div class="detail-meta">' + metaHtml + '</div>' + contentHtml;
    modal.classList.add('show');
    overlay.classList.add('show');
  }

  function hideDetail() {
    document.getElementById('detail-modal').classList.remove('show');
    document.getElementById('detail-overlay').classList.remove('show');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板')).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('已复制到剪贴板');
    } catch (e) {
      showToast('复制失败');
    }
    document.body.removeChild(textarea);
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function bindEvents() {
    document.getElementById('docs-filters').addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderNotes();
    });

    document.getElementById('docs-search').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderNotes();
    });

    document.getElementById('docs-list').addEventListener('click', e => {
      const card = e.target.closest('.docs-card');
      if (!card) return;
      const note = notesData.find(n => n.id == card.dataset.id);
      if (note) showDetail(note);
    });

    document.getElementById('detail-close').addEventListener('click', hideDetail);
    document.getElementById('detail-overlay').addEventListener('click', hideDetail);

    document.getElementById('detail-body').addEventListener('click', e => {
      const copyBtn = e.target.closest('.detail-copy-code-btn');
      if (copyBtn) {
        copyToClipboard(copyBtn.dataset.code);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideDetail();
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', Notes.init);