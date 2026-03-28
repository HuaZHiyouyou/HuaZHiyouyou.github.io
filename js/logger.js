// ====================== 日志系统模块 ======================
class Logger {
  constructor() {
    this.LOGS_KEY = 'homepage_logs';
    this.logs = this.loadLogs();
    this.maxLogs = 500;
  }

  // 记录日志
  static log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp: timestamp,
      level: level,
      message: message
    };

    // 使用单例 Logger 保存，避免每次创建新实例
    const logger = window.AppLogger || (window.AppLogger = new Logger());
    logger.logs.push(logEntry);

    // 限制日志数量
    if (logger.logs.length > logger.maxLogs) {
      logger.logs.shift();
    }

    logger.saveLogs();

    // 同时输出到控制台
    const consoleColors = {
      'INFO': 'color: blue',
      'WARN': 'color: orange',
      'ERROR': 'color: red',
      'DEBUG': 'color: gray'
    };
    console.log(`%c[${level}] ${timestamp} - ${message}`, consoleColors[level] || '');
  }

  // 加载日志
  loadLogs() {
    try {
      const logs = localStorage.getItem(this.LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      console.error('加载日志失败:', e);
      return [];
    }
  }

  // 保存日志
  saveLogs() {
    try {
      localStorage.setItem(this.LOGS_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('保存日志失败:', e);
    }
  }

  // 获取所有日志
  getAllLogs() {
    return this.logs;
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.LOGS_KEY);
    Logger.log('日志已清除', 'INFO');
  }

  // 导出日志
  exportLogs() {
    const logText = this.logs.map(log =>
      `[${log.level}] ${log.timestamp} - ${log.message}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homepage_logs_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    Logger.log('日志已导出', 'INFO');
  }

  // 在网页中显示日志
  renderLogs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = this.logs.map(log => {
      const levelColors = {
        'INFO': 'text-blue-600',
        'WARN': 'text-orange-600',
        'ERROR': 'text-red-600',
        'DEBUG': 'text-gray-600'
      };
      return `<div class="py-2 border-b border-gray-100 flex flex-col items-center">
        <span class="${levelColors[log.level] || ''} font-medium">[${log.level}]</span>
        <span class="text-gray-500 text-xs mt-1">${log.timestamp}</span>
        <span class="mt-1">${log.message}</span>
      </div>`;
    }).join('');

    // 滚动到底部
    container.scrollTop = container.scrollHeight;
  }
}

// 静态代理方法，方便以类方式调用实例方法
Logger.renderLogs = function(containerId) {
  const logger = window.AppLogger || (window.AppLogger = new Logger());
  return logger.renderLogs(containerId);
};

Logger.clearLogs = function() {
  const logger = window.AppLogger || (window.AppLogger = new Logger());
  return logger.clearLogs();
};

Logger.exportLogs = function() {
  const logger = window.AppLogger || (window.AppLogger = new Logger());
  return logger.exportLogs();
};

Logger.getAllLogs = function() {
  const logger = window.AppLogger || (window.AppLogger = new Logger());
  return logger.getAllLogs();
};

// 初始化全局单例
window.AppLogger = window.AppLogger || new Logger();

// 同时暴露为 window.Logger 以便兼容
window.Logger = Logger;

// 初始日志
Logger.log('网站初始化完成', 'INFO');

// 写入示例启动日志（仅作为初始演示条目）
Logger.log('缓存管理器初始化完成', 'INFO');
Logger.log('粒子系统模块已加载', 'INFO');
Logger.log('音乐播放器准备就绪（若有本地音乐会优先加载）', 'INFO');
Logger.log('UI 与 设置面板已准备', 'INFO');
