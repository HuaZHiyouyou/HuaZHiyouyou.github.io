/* 说说纸页 - 展示脚本 */

const state = {
  filter: "全部",
  filterType: "type",
  currentEntryId: null
};

let entries = [];

const timelineList = document.getElementById("timeline-list");
const filterBar = document.getElementById("filter-bar");
const todayLabel = document.getElementById("today-label");
const currentMood = document.getElementById("current-mood");
const entryCount = document.getElementById("entry-count");
const storageStatus = document.getElementById("storage-status");
const detailView = document.getElementById("detail-view");
const detailContent = document.getElementById("detail-content");
const detailClose = document.getElementById("detail-close");
const jumpToTimelineButton = document.getElementById("jump-to-timeline");

// 从 window.siteData 获取说说数据（由 data/index.js 注入）
function loadEntries() {
  const moments = (window.siteData && Array.isArray(window.siteData.moments)) 
    ? window.siteData.moments 
    : [];
  return normalizeEntries(moments);
}

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(dateStr));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidDate(value) {
  return !Number.isNaN(Date.parse(value));
}

function normalizeEntries(list) {
  return list
    .filter((entry) => entry && typeof entry.content === "string" && isValidDate(entry.createdAt))
    .map((entry, index) => ({
      id: Number.isFinite(Number(entry.id)) ? Number(entry.id) : Date.parse(entry.createdAt) + index,
      mood: entry.mood || "未分类",
      type: entry.type || "说说",
      visibility: entry.visibility || "愿意公开",
      content: entry.content.trim(),
      createdAt: entry.createdAt
    }))
    .filter((entry) => entry.content.length > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateStorageStatus() {
  if (hasLoadError) {
    storageStatus.textContent = "读取发布数据失败";
    return;
  }

  storageStatus.textContent = entries.length
    ? `已同步 ${entries.length} 条纸页`
    : "等待后台发布";
}

function updateSummary() {
  const latestEntry = entries[0] || null;

  todayLabel.textContent = formatToday();
  entryCount.textContent = String(entries.length);
  currentMood.textContent = latestEntry ? latestEntry.mood : "暂无";
  updateStorageStatus();
}

function setSelectedEntry(id) {
  timelineList.querySelectorAll(".entry").forEach((item) => {
    const entryId = Number(item.dataset.id);
    item.classList.toggle("selected", id !== null && entryId === id);
  });
}

function createEntryMarkup(entry, index) {
  const tilt = index % 2 === 0 ? "-0.8deg" : "0.9deg";

  return `
    <article class="entry" style="--entry-tilt:${tilt}" data-id="${entry.id}">
      <div class="entry-head">
        <div class="entry-badges">
          <span class="badge"><strong>${escapeHtml(entry.type)}</strong></span>
          <span class="badge">心情 ${escapeHtml(entry.mood)}</span>
          <span class="badge">${escapeHtml(entry.visibility)}</span>
        </div>
        <div class="stamp">${formatDate(entry.createdAt)}</div>
      </div>
      <p class="entry-content">${escapeHtml(entry.content)}</p>
      <div class="entry-expand-container">
        <button class="detail-expand entry-expand" type="button" data-expand="${entry.id}">
          <span class="entry-expand-icon">
            <span class="entry-expand-arrow"></span>
          </span>
          <span class="entry-expand-text">展开文本</span>
        </button>
      </div>
      <div class="entry-footer">
        <div class="entry-meta">
          <span>发布入口已经统一收回后台。</span>
        </div>
        <div class="entry-actions">
          <button class="mini-button" type="button" data-copy="${entry.id}">复制</button>
          <a class="mini-button" href="../manage.html#moments">后台编辑</a>
        </div>
      </div>
    </article>
  `;
}

function showEntryDetail(entry) {
  state.currentEntryId = entry.id;
  setSelectedEntry(entry.id);

  detailContent.innerHTML = `
    <div class="detail-meta">
      <span class="badge"><strong>${escapeHtml(entry.type)}</strong></span>
      <span class="badge">心情 ${escapeHtml(entry.mood)}</span>
      <span class="badge">${escapeHtml(entry.visibility)}</span>
      <span class="badge">${formatDate(entry.createdAt)}</span>
    </div>
    <p class="detail-text">${escapeHtml(entry.content)}</p>
    <p class="detail-note">需要修改内容时，请回到 manage 页面统一维护。</p>
  `;

  detailView.classList.add("visible");
}

function hideEntryDetail() {
  state.currentEntryId = null;
  setSelectedEntry(null);
  detailView.classList.remove("visible");
  detailContent.innerHTML = `
    <div class="empty-detail">
      <div class="empty-detail-icon">📖</div>
      <p>点击任意说说，在这里查看放大详情</p>
    </div>
  `;
}

function getDateFilterFn(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return function(entry) {
    const entryDate = new Date(entry.createdAt);

    switch (filter) {
      case "today":
        return entryDate >= today;
      case "week":
        return entryDate >= weekAgo;
      case "month":
        return entryDate >= monthAgo;
      case "older":
        return entryDate < monthAgo;
      default:
        return true;
    }
  };
}

function filterEntries() {
  if (state.filter === "全部") {
    return entries;
  }

  switch (state.filterType) {
    case "type":
      return entries.filter((entry) => entry.type === state.filter);
    case "mood":
      return entries.filter((entry) => entry.mood === state.filter);
    case "visibility":
      return entries.filter((entry) => entry.visibility === state.filter);
    case "date":
      return entries.filter(getDateFilterFn(state.filter));
    default:
      return entries;
  }
}

function syncEntryClampState(entryElement) {
  const entryContent = entryElement.querySelector(".entry-content");
  const expandContainer = entryElement.querySelector(".entry-expand-container");
  const lineHeight = parseFloat(window.getComputedStyle(entryContent).lineHeight) || 30;
  const lines = entryContent.scrollHeight / lineHeight;

  if (lines > 5) {
    entryContent.classList.add("truncated", "can-truncate");
    expandContainer.style.display = "";
    return;
  }

  entryContent.classList.remove("truncated", "can-truncate");
  expandContainer.style.display = "none";
}

function renderEntries() {
  const visibleEntries = filterEntries();

  if (!visibleEntries.length) {
    timelineList.innerHTML = `
      <div class="empty-state">
        还没有已发布的纸页。<br>
        去后台 manage 里铺一张示例页，或者发布第一条说说再回来预览。
      </div>
    `;
    hideEntryDetail();
    return;
  }

  timelineList.innerHTML = visibleEntries.map((entry, index) => createEntryMarkup(entry, index)).join("");

  requestAnimationFrame(() => {
    timelineList.querySelectorAll(".entry").forEach((entryElement, index) => {
      setTimeout(() => entryElement.classList.add("visible"), index * 70);
      syncEntryClampState(entryElement);
    });

    if (state.currentEntryId !== null) {
      const currentEntry = visibleEntries.find((entry) => entry.id === state.currentEntryId);
      if (currentEntry) {
        showEntryDetail(currentEntry);
        return;
      }

      hideEntryDetail();
      return;
    }

    setSelectedEntry(null);
  });
}

function reloadEntries() {
  loadEntries().then(function(result) {
    entries = result;
    updateSummary();
    renderEntries();
  });
}

async function copyEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;

  try {
    await navigator.clipboard.writeText(entry.content);
  } catch (error) {
    const backup = document.createElement("textarea");
    backup.value = entry.content;
    document.body.appendChild(backup);
    backup.select();
    document.execCommand("copy");
    backup.remove();
  }
}

function toggleEntryExpand(button) {
  const entryElement = button.closest(".entry");
  if (!entryElement) return;

  const entryContent = entryElement.querySelector(".entry-content");
  const expandText = button.querySelector(".entry-expand-text");

  if (!entryContent.classList.contains("can-truncate")) {
    return;
  }

  entryContent.classList.toggle("truncated");
  const isExpanded = !entryContent.classList.contains("truncated");
  button.classList.toggle("expanded", isExpanded);

  if (expandText) {
    expandText.textContent = isExpanded ? "收起文本" : "展开文本";
  }
}

filterBar.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("#filter-toggle");
  if (toggleButton) {
    const filterGroups = filterBar.querySelector(".filter-groups");
    const isCollapsed = filterGroups.classList.contains("collapsed");

    if (isCollapsed) {
      filterGroups.style.height = `${filterGroups.scrollHeight}px`;
      filterGroups.classList.remove("collapsed");
      setTimeout(() => {
        filterGroups.style.height = "auto";
      }, 300);
    } else {
      filterGroups.style.height = `${filterGroups.scrollHeight}px`;
      requestAnimationFrame(() => {
        filterGroups.classList.add("collapsed");
        filterGroups.style.height = "0px";
      });
    }
    return;
  }

  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.filter = button.dataset.filter;
  state.filterType = button.dataset.filterType || "type";

  filterBar.querySelectorAll(".filter-button").forEach((item) => {
    if (item.dataset.filterType === state.filterType) {
      item.classList.remove("active");
    }
  });

  button.classList.add("active");
  renderEntries();
});

timelineList.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    copyEntry(Number(copyButton.dataset.copy));
    return;
  }

  const expandButton = event.target.closest("[data-expand]");
  if (expandButton) {
    toggleEntryExpand(expandButton);
    const entryId = Number(expandButton.dataset.expand);
    const entry = entries.find((item) => item.id === entryId);
    if (entry) {
      showEntryDetail(entry);
    }
    return;
  }

  const entryElement = event.target.closest(".entry");
  if (!entryElement) return;

  const entryId = Number(entryElement.dataset.id);
  const entry = entries.find((item) => item.id === entryId);
  if (entry) {
    showEntryDetail(entry);
  }
});

detailClose.addEventListener("click", hideEntryDetail);

if (jumpToTimelineButton) {
  jumpToTimelineButton.addEventListener("click", () => {
    const timelineSection = document.querySelector(".timeline");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    reloadEntries();
  }
});

window.addEventListener("pageshow", reloadEntries);

hideEntryDetail();
reloadEntries();

const filterGroups = filterBar.querySelector(".filter-groups");
if (filterGroups) {
  filterGroups.classList.add("collapsed");
  filterGroups.style.height = "0px";
}
