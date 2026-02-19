// ====================== 缓存管理模块 ======================
class CacheManager {
  constructor() {
    this.CACHE_KEY = 'homepage_cache';
    this.HISTORY_KEY = 'homepage_history';
    this.FILES_KEY = 'homepage_files';
    this.enabled = true;
    this.historyEnabled = true;
    this.init();
  }

  init() {
    // 从设置中读取缓存开关状态
    const settings = this.getSettings();
    this.enabled = settings.cacheEnabled !== false;
    this.historyEnabled = settings.historyEnabled !== false;
  }

  // 获取所有缓存数据
  getAllCache() {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (e) {
      console.error('读取缓存失败:', e);
      return {};
    }
  }

  // 保存缓存数据
  saveCache(data) {
    if (!this.enabled) return;
    try {
      const existingCache = this.getAllCache();
      const newCache = { ...existingCache, ...data, lastUpdated: new Date().toISOString() };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(newCache));
      Logger.log('缓存已保存', 'INFO');
    } catch (e) {
      console.error('保存缓存失败:', e);
      Logger.log('保存缓存失败: ' + e.message, 'ERROR');
    }
  }

  // 获取特定缓存项
  getCache(key) {
    const cache = this.getAllCache();
    return cache[key];
  }

  // 保存文件到本地缓存（支持图片、音乐、视频）
  saveFile(file, type) {
    if (!this.enabled) return null;
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const fileData = {
            name: file.name,
            type: file.type,
            data: e.target.result,
            lastUpdated: new Date().toISOString()
          };

          const files = this.getFiles();
          files[`${type}_${file.name}`] = fileData;
          localStorage.setItem(this.FILES_KEY, JSON.stringify(files));

          Logger.log(`文件已缓存: ${file.name}`, 'INFO');
          resolve(fileData);
        };
        reader.onerror = (e) => {
          Logger.log('文件读取失败', 'ERROR');
          reject(e);
        };
        reader.readAsDataURL(file);
      });
    } catch (e) {
      console.error('保存文件失败:', e);
      Logger.log('保存文件失败: ' + e.message, 'ERROR');
      return null;
    }
  }

  // 获取缓存的文件
  getFile(fileKey) {
    const files = this.getFiles();
    return files[fileKey];
  }

  // 获取所有缓存的文件
  getFiles() {
    try {
      const files = localStorage.getItem(this.FILES_KEY);
      return files ? JSON.parse(files) : {};
    } catch (e) {
      console.error('读取文件缓存失败:', e);
      return {};
    }
  }

  // 保存浏览痕迹
  saveHistory(page) {
    if (!this.historyEnabled) return;
    try {
      const history = this.getHistory();
      history.push({
        page: page,
        timestamp: new Date().toISOString()
      });
      // 只保留最近100条记录
      if (history.length > 100) {
        history.shift();
      }
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('保存浏览痕迹失败:', e);
    }
  }

  // 获取浏览痕迹
  getHistory() {
    try {
      const history = localStorage.getItem(this.HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (e) {
      console.error('读取浏览痕迹失败:', e);
      return [];
    }
  }

  // 清除所有缓存
  clearAll() {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
    localStorage.removeItem(this.FILES_KEY);
    Logger.log('所有缓存已清除', 'INFO');
  }

  // 获取设置
  getSettings() {
    const cache = this.getAllCache();
    return cache.settings || {};
  }

  // 保存设置
  saveSettings(settings) {
    this.saveCache({ settings: settings });
  }
}

// 初始化全局缓存管理器
const Cache = new CacheManager();

// 暴露到 window 对象以便全局访问
window.Cache = Cache;