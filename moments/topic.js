/* 说说纸页 - 主题脚本 */

const STORAGE_KEY = "paper-moments-v1";
const DEMO_TEXT = "今天其实没有发生什么特别大的事。\n只是突然很想把心里的那一点点疲惫，认真放下来。\n有些话不一定要被别人理解，但至少可以先被自己接住。";

const seedEntries = [
  {
    id: 1,
    mood: "柔软",
    type: "心理话",
    visibility: "只给自己看",
    content: "有些夜里不是难过，只是安静得太清楚了。\n所以想写一点话，让今天不要空着结束。",
    createdAt: "2026-03-27T22:18:00"
  },
  {
    id: 2,
    mood: "期待",
    type: "说说",
    visibility: "愿意公开",
    content: "最近想把生活重新摆整齐一点。\n哪怕只是把桌面收好、把话写顺，也算是在认真地喜欢今天。",
    createdAt: "2026-03-26T19:40:00"
  },
  {
    id: 3,
    mood: "深夜",
    type: "深夜碎碎念",
    visibility: "留作备忘",
    content: "希望以后再翻到这一页的时候，会记得我也曾经很努力地安慰过自己。",
    createdAt: "2026-03-25T00:32:00"
  }
];

const state = {
  mood: "柔软",
  filter: "全部",
  currentEntryId: null,
  isExpanded: false
};

const moodPicker = document.getElementById("mood-picker");
const contentInput = document.getElementById("moment-content");
const typeSelect = document.getElementById("moment-type");
const visibilitySelect = document.getElementById("moment-visibility");
const publishButton = document.getElementById("publish-button");
const fillDemoButton = document.getElementById("fill-demo");
const charCount = document.getElementById("char-count");
const timelineList = document.getElementById("timeline-list");
const filterBar = document.getElementById("filter-bar");
const todayLabel = document.getElementById("today-label");
const currentMood = document.getElementById("current-mood");
const entryCount = document.getElementById("entry-count");
const storageStatus = document.getElementById("storage-status");
const clearStorageButton = document.getElementById("clear-storage");
const detailView = document.getElementById("detail-view");
const detailContent = document.getElementById("detail-content");
const detailClose = document.getElementById("detail-close");

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
}

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...seedEntries];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...seedEntries];
    return parsed;
  } catch (error) {
    storageStatus.textContent = "本地保存读取失败";
    return [...seedEntries];
  }
}

let entries = loadEntries();

function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    storageStatus.textContent = "本地保存已开启";
  } catch (error) {
    storageStatus.textContent = "本地保存失败";
  }
}

function updateSummary() {
  entryCount.textContent = String(entries.length);
  currentMood.textContent = state.mood;
  todayLabel.textContent = formatToday();
}

function createEntryMarkup(entry, index) {
  const tilt = index % 2 === 0 ? "-0.8deg" : "0.9deg";
  return `
    <article class="entry" style="--entry-tilt:${tilt}" data-id="${entry.id}">
      <div class="entry-head">
        <div class="entry-badges">
          <span class="badge"><strong>${entry.type}</strong></span>
          <span class="badge">心情 ${entry.mood}</span>
          <span class="badge">${entry.visibility}</span>
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
          <span>写在纸上比憋着舒服一点。</span>
        </div>
        <div class="entry-actions">
          <button class="mini-button" type="button" data-copy="${entry.id}">复制</button>
          <button class="mini-button" type="button" data-delete="${entry.id}">删除</button>
        </div>
      </div>
    </article>
  `;
}

function showEntryDetail(entry, expanded = false) {
  detailContent.innerHTML = `
    <div class="detail-meta">
      <span class="badge"><strong>${entry.type}</strong></span>
      <span class="badge">心情 ${entry.mood}</span>
      <span class="badge">${entry.visibility}</span>
      <span class="badge">${formatDate(entry.createdAt)}</span>
    </div>
    <p class="detail-text ${expanded ? '' : 'truncated'}" id="detail-text-content">${escapeHtml(entry.content)}</p>
  `;

  const detailText = document.getElementById("detail-text-content");

  // 如果是展开状态，移除truncated类
  if (expanded) {
    detailText.classList.remove('truncated');
  }
}

function hideEntryDetail() {
  state.currentEntryId = null;
  state.isExpanded = false;
  detailContent.innerHTML = `
    <div class="empty-detail">
      <div class="empty-detail-icon">📖</div>
      <p>点击任意说说，在这里查看放大详情</p>
    </div>
  `;
}

function renderEntries() {
  const visibleEntries = state.filter === "全部"
    ? entries
    : entries.filter((entry) => entry.type === state.filter);

  if (!visibleEntries.length) {
    timelineList.innerHTML = `
      <div class="empty-state">
        这一栏暂时还是空白的。<br>
        写下第一句说说，它就会像一张新纸一样落在这里。
      </div>
    `;
    return;
  }

  timelineList.innerHTML = visibleEntries.map((entry, index) => createEntryMarkup(entry, index)).join("");

  requestAnimationFrame(() => {
    document.querySelectorAll(".entry").forEach((entry, index) => {
      setTimeout(() => entry.classList.add("visible"), index * 70);
      
      // 检查文本是否需要折叠（超过5行）
      const entryContent = entry.querySelector(".entry-content");
      const lineHeight = parseFloat(window.getComputedStyle(entryContent).lineHeight);
      const textHeight = entryContent.scrollHeight;
      const lines = textHeight / lineHeight;
      
      if (lines > 5) {
        entryContent.classList.add("truncated");
      } else {
        // 如果文本不超过5行，隐藏展开按钮容器
        const expandContainer = entry.querySelector(".entry-expand-container");
        if (expandContainer) {
          expandContainer.style.display = "none";
        }
      }
    });
  });
}

function updateCounter() {
  charCount.textContent = String(contentInput.value.length);
}

function publishEntry() {
  const content = contentInput.value.trim();
  if (!content) {
    contentInput.focus();
    return;
  }

  const entry = {
    id: Date.now(),
    mood: state.mood,
    type: typeSelect.value,
    visibility: visibilitySelect.value,
    content,
    createdAt: new Date().toISOString()
  };

  entries = [entry, ...entries];
  saveEntries();
  renderEntries();
  updateSummary();
  contentInput.value = "";
  updateCounter();
}

function deleteEntry(id) {
  const shouldDelete = window.confirm("要把这张纸页从当前浏览器里移除吗？");
  if (!shouldDelete) return;

  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  renderEntries();
  updateSummary();
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

// 事件监听器
moodPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mood]");
  if (!button) return;

  state.mood = button.dataset.mood;
  currentMood.textContent = state.mood;
  moodPicker.querySelectorAll(".mood-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  state.filter = button.dataset.filter;
  filterBar.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  renderEntries();
});

publishButton.addEventListener("click", publishEntry);

fillDemoButton.addEventListener("click", () => {
  contentInput.value = DEMO_TEXT;
  updateCounter();
  contentInput.focus();
});

contentInput.addEventListener("input", updateCounter);

timelineList.addEventListener("click", (event) => {
  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    copyEntry(Number(copyButton.dataset.copy));
    return;
  }

  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    deleteEntry(Number(deleteButton.dataset.delete));
    return;
  }

  const expandButton = event.target.closest("[data-expand]");
  if (expandButton) {
    const entryId = Number(expandButton.dataset.expand);
    const entry = entries.find(item => item.id === entryId);
    if (entry) {
      const entryElement = expandButton.closest(".entry");
      const entryContent = entryElement.querySelector(".entry-content");
      const expandText = expandButton.querySelector(".entry-expand-text");
      
      // 切换左侧卡片文本的折叠状态
      entryContent.classList.toggle("truncated");
      const isExpanded = !entryContent.classList.contains("truncated");
      
      // 添加/移除展开状态类
      expandButton.classList.toggle("expanded", isExpanded);
      
      // 更新按钮文本
      if (expandText) {
        expandText.textContent = isExpanded ? "收起文本" : "展开文本";
      }
      
      // 更新状态
      state.currentEntryId = entryId;
      state.isExpanded = isExpanded;
      
      // 同步更新右侧详情区域
      showEntryDetail(entry, isExpanded);
    }
    return;
  }

  const entryElement = event.target.closest(".entry");
  if (entryElement) {
    const entryId = Number(entryElement.dataset.id);
    const entry = entries.find(item => item.id === entryId);
    if (entry) {
      const entryContent = entryElement.querySelector(".entry-content");
      const isExpanded = !entryContent.classList.contains("truncated");
      
      state.currentEntryId = entryId;
      state.isExpanded = isExpanded;
      showEntryDetail(entry, isExpanded);
    }
  }
});

clearStorageButton.addEventListener("click", () => {
  const shouldClear = window.confirm("要清空当前浏览器里保存的所有纸页吗？");
  if (!shouldClear) return;

  entries = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  renderEntries();
  updateSummary();
});

detailClose.addEventListener("click", hideEntryDetail);

// 初始化
updateCounter();
updateSummary();
renderEntries();
