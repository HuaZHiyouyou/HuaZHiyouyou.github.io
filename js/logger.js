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

    // 保存到本地
    const logger = new Logger();
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
      return `<div class="py-1 border-b border-gray-100">
        <span class="${levelColors[log.level] || ''}">[${log.level}]</span>
        <span class="text-gray-500 ml-2">${log.timestamp}</span>
        <span class="ml-2">${log.message}</span>
      </div>`;
    }).join('');

    // 滚动到底部
    container.scrollTop = container.scrollHeight;
  }
}

// 初始化全局日志记录
Logger.log('网站初始化完成', 'INFO');