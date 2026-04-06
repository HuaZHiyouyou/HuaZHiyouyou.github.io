(function() {
  'use strict';

  const GIST_ENDPOINT = 'https://api.github.com/gists';
  const DEFAULT_TOKEN = '';
  const DEFAULT_GIST_ID = '';

  class CloudSync {
    constructor() {
      this.token = DEFAULT_TOKEN || localStorage.getItem('gist-token') || '';
      this.gistId = DEFAULT_GIST_ID || localStorage.getItem('gist-id') || '';
      this.fileName = 'site-visitors.json';
    }

    setToken(token) {
      this.token = token;
      localStorage.setItem('gist-token', token);
    }

    setGistId(id) {
      this.gistId = id;
      localStorage.setItem('gist-id', id);
    }

    async createGist(data) {
      if (!this.token) throw new Error('未设置 Gist Token');
      const res = await fetch(GIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': 'token ' + this.token,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          description: 'Site Visitor Analytics',
          public: false,
          files: {
            [this.fileName]: { content: JSON.stringify(data, null, 2) }
          }
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('创建 Gist 失败: ' + res.status + ' ' + errText);
      }
      const json = await res.json();
      this.gistId = json.id;
      localStorage.setItem('gist-id', json.id);
      return json;
    }

    async fetchGist() {
      if (!this.gistId) throw new Error('未设置 Gist ID');
      const res = await fetch(GIST_ENDPOINT + '/' + this.gistId, {
        headers: {
          'Authorization': 'token ' + this.token,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) throw new Error('获取 Gist 失败: ' + res.status);
      const json = await res.json();
      const fileContent = json.files[this.fileName]?.content;
      return fileContent ? JSON.parse(fileContent) : {};
    }

    async pushToCloud(data) {
      if (!this.gistId) throw new Error('未设置 Gist ID');
      const res = await fetch(GIST_ENDPOINT + '/' + this.gistId, {
        method: 'PATCH',
        headers: {
          'Authorization': 'token ' + this.token,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          files: {
            [this.fileName]: { content: JSON.stringify(data, null, 2) }
          }
        })
      });
      if (!res.ok) throw new Error('更新 Gist 失败: ' + res.status);
      return await res.json();
    }

    getLocalData() {
      return {
        visitors: JSON.parse(localStorage.getItem('visitor-sessions') || '[]'),
        analytics: JSON.parse(localStorage.getItem('site-analytics') || '{"totalTime":0,"bouncedVisits":0,"totalVisits":0}'),
        adminCount: parseInt(localStorage.getItem('admin-login-count') || '0'),
        updatedAt: new Date().toISOString()
      };
    }

    setLocalData(data) {
      if (data.visitors) localStorage.setItem('visitor-sessions', JSON.stringify(data.visitors));
      if (data.analytics) localStorage.setItem('site-analytics', JSON.stringify(data.analytics));
      if (typeof data.adminCount === 'number') localStorage.setItem('admin-login-count', String(data.adminCount));
    }

    async upload() {
      const local = this.getLocalData();
      if (this.gistId) {
        try {
          return await this.pushToCloud(local);
        } catch (e) {
          this.gistId = '';
          localStorage.removeItem('gist-id');
          return this.createGist(local);
        }
      } else {
        return this.createGist(local);
      }
    }

    async download() {
      const cloud = await this.fetchGist();
      this.setLocalData(cloud);
      return cloud;
    }

    async merge() {
      if (this._merging) return;
      this._merging = true;

      try {
        const local = this.getLocalData();
        let cloud;
        try {
          cloud = await this.fetchGist();
        } catch (e) {
          this._merging = false;
          return this.upload();
        }

        const localVisitors = local.visitors || [];
        const cloudVisitors = cloud.visitors || [];
        const merged = [...cloudVisitors];

        localVisitors.forEach(lv => {
          const exist = merged.find(cv => cv.id === lv.id);
          if (exist) {
            exist.visitCount = Math.max(exist.visitCount, lv.visitCount);
            if (new Date(lv.lastVisit) > new Date(exist.lastVisit)) {
              exist.lastVisit = lv.lastVisit;
            }
          } else {
            merged.push(lv);
          }
        });

        // 分析数据取最大值（累计计数器不应相加）
        const analytics = {
          totalTime: Math.max(cloud.analytics?.totalTime || 0, local.analytics?.totalTime || 0),
          bouncedVisits: Math.max(cloud.analytics?.bouncedVisits || 0, local.analytics?.bouncedVisits || 0),
          totalVisits: Math.max(cloud.analytics?.totalVisits || 0, local.analytics?.totalVisits || 0)
        };

        const adminCount = Math.max(cloud.adminCount || 0, local.adminCount || 0);

        const result = { visitors: merged, analytics, adminCount, updatedAt: new Date().toISOString() };
        this.setLocalData(result);
        await this.pushToCloud(result);
      } finally {
        this._merging = false;
      }
    }

    isConfigured() {
      return !!this.token && !!this.gistId;
    }

    getConfig() {
      return { token: this.token, gistId: this.gistId };
    }

    autoSync() {
      if (!this.token) return;

      var self = this;

      // 1. 页面加载时：合并云端数据，完成后更新访客计数器
      this.merge().then(function() {
        self._updateVisitorCounter();
      }).catch(function() {});

      // 2. 定时同步：每 5 分钟合并一次
      this._syncInterval = setInterval(function() {
        self.merge().then(function() {
          self._updateVisitorCounter();
        }).catch(function() {});
      }, 5 * 60 * 1000);

      // 3. 页面关闭/刷新前：上传本地数据
      window.addEventListener('beforeunload', function() {
        self.upload().catch(function() {});
      });
    }

    _updateVisitorCounter() {
      var analytics = JSON.parse(localStorage.getItem('site-analytics') || '{"totalVisits":0}');
      var visitors = JSON.parse(localStorage.getItem('visitor-sessions') || '[]');
      var adminCount = parseInt(localStorage.getItem('admin-login-count') || '0');
      var count = Math.max(analytics.totalVisits || 0, visitors.length || 0) + adminCount;
      var el = document.getElementById('busuanzi_site_uv');
      if (el) {
        el.textContent = count;
        el.setAttribute('data-cloud-synced', 'true');
      }
    }

    stopAutoSync() {
      if (this._syncInterval) {
        clearInterval(this._syncInterval);
        this._syncInterval = null;
      }
    }
  }

  window.CloudSync = new CloudSync();
})();
