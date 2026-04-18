const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOAD_DIR = path.join(ROOT_DIR, 'assets', 'share');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  console.log('Request:', req.method, pathname);

  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // API: 获取数据 - 从 data/ 目录读取
  if (pathname === '/api/data' && req.method === 'GET') {
    try {
      const DATA_DIR = path.join(ROOT_DIR, 'data');

      // 辅助函数：从 ES Module 文件中提取 export 的数据
      function extractExport(filePath) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const match = content.match(/export\s+const\s+(\w+)\s*=\s*([\s\S]*?);/);
          if (match) {
            const varName = match[1];
            const code = match[0].replace(/export\s+const/, 'const');
            const fn = new Function(code + '\n return ' + varName + ';');
            return fn();
          }
          return null;
        } catch (e) {
          console.error('Error extracting from', filePath, e);
          return null;
        }
      }

      // 读取各子模块数据
      const data = {
        skills: extractExport(path.join(DATA_DIR, 'skills.js')) || [],
        projects: extractExport(path.join(DATA_DIR, 'projects.js')) || [],
        changelog: extractExport(path.join(DATA_DIR, 'changelog.js')) || [],
        about: extractExport(path.join(DATA_DIR, 'about.js')) || {},
        growth: extractExport(path.join(DATA_DIR, 'growth.js')) || [],
        moments: extractExport(path.join(DATA_DIR, 'moments.js')) || [],
        contributors: extractExport(path.join(DATA_DIR, 'contributors', 'list.js')) || [],
        contributorsIntro: extractExport(path.join(DATA_DIR, 'contributors', 'intro.js')) || [],
        contributorGrowth: extractExport(path.join(DATA_DIR, 'contributors', 'growth.js')) || {},
        mediaPlatforms: extractExport(path.join(DATA_DIR, 'media', 'platforms.js')) || [],
        resources: extractExport(path.join(DATA_DIR, 'resources', 'list.js')) || [],
        platformTypes: extractExport(path.join(DATA_DIR, 'resources', 'categories.js')) || {},
        shares: extractExport(path.join(DATA_DIR, 'share', 'list.js')) || [],
        shareCategories: extractExport(path.join(DATA_DIR, 'share', 'categories.js')) || {},
        notes: extractExport(path.join(DATA_DIR, 'notes', 'list.js')) || [],
        notesCategories: extractExport(path.join(DATA_DIR, 'notes', 'categories.js')) || {}
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(JSON.stringify(data));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '获取数据失败: ' + e.message }));
    }
    return;
  }

  // API: 保存数据 - 写入 data/ 目录对应子模块
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newData = JSON.parse(body);
        const DATA_DIR = path.join(ROOT_DIR, 'data');

        // 保存各子模块数据到对应文件
        const fileMap = {
          'skills.js': ['skills'],
          'projects.js': ['projects'],
          'changelog.js': ['changelog'],
          'about.js': ['about'],
          'growth.js': ['growth'],
          'moments.js': ['moments'],
          'contributors/list.js': ['contributors'],
          'contributors/intro.js': ['contributorsIntro'],
          'contributors/growth.js': ['contributorGrowth'],
          'media/platforms.js': ['mediaPlatforms'],
          'resources/list.js': ['resources'],
          'resources/categories.js': ['platformTypes'],
          'share/list.js': ['shares'],
          'share/categories.js': ['shareCategories'],
          'notes/list.js': ['notes'],
          'notes/categories.js': ['notesCategories']
        };

        for (const [file, keys] of Object.entries(fileMap)) {
          const filePath = path.join(DATA_DIR, file);
          const dataToSave = keys.length === 1 ? newData[keys[0]] : keys.map(k => newData[k]);
          const varName = path.basename(file, '.js').replace(/^list$/, 'shares').replace(/^categories$/, 'platformTypes');

          // 获取正确的变量名
          let exportName = keys[0];
          if (file === 'contributors/list.js') exportName = 'contributors';
          else if (file === 'contributors/intro.js') exportName = 'contributorsIntro';
          else if (file === 'contributors/growth.js') exportName = 'contributorGrowth';
          else if (file === 'media/platforms.js') exportName = 'mediaPlatforms';
          else if (file === 'resources/list.js') exportName = 'resources';
          else if (file === 'resources/categories.js') exportName = 'platformTypes';
          else if (file === 'share/list.js') exportName = 'shares';
          else if (file === 'share/categories.js') exportName = 'shareCategories';
          else if (file === 'notes/list.js') exportName = 'notes';
          else if (file === 'notes/categories.js') exportName = 'notesCategories';

          const content = `// ${file.includes('/') ? file.split('/')[0] : file} 数据\nexport const ${exportName} = ${JSON.stringify(dataToSave, null, 2)};\n`;
          fs.writeFileSync(filePath, content, 'utf8');
        }

        // 同步更新 data/index.js（合并所有数据）
        const mergedData = {
          skills: newData.skills || [],
          projects: newData.projects || [],
          changelog: newData.changelog || [],
          about: newData.about || {},
          growth: newData.growth || [],
          contributors: newData.contributors || [],
          contributorsIntro: newData.contributorsIntro || [],
          contributorGrowth: newData.contributorGrowth || {},
          moments: newData.moments || [],
          mediaPlatforms: newData.mediaPlatforms || [],
          resources: newData.resources || [],
          platformTypes: newData.platformTypes || {},
          shares: newData.shares || [],
          shareCategories: newData.shareCategories || {},
          notes: newData.notes || [],
          notesCategories: newData.notesCategories || {}
        };

        const indexContent = `/**
 * 数据中心 - 所有模块数据的统一入口
 * 
 * 此文件由服务器自动生成，与 data/ 目录下的分文件保持同步
 * 
 * 使用方式：
 * 1. <script src="data/index.js"></script> (推荐)
 * 2. import './data/index.js'; (ES Module)
 */

var skills = ${JSON.stringify(mergedData.skills, null, 2)};

var projects = ${JSON.stringify(mergedData.projects, null, 2)};

var changelog = ${JSON.stringify(mergedData.changelog, null, 2)};

var about = ${JSON.stringify(mergedData.about, null, 2)};

var growth = ${JSON.stringify(mergedData.growth, null, 2)};

var contributors = ${JSON.stringify(mergedData.contributors, null, 2)};

var contributorsIntro = ${JSON.stringify(mergedData.contributorsIntro, null, 2)};

var contributorGrowth = ${JSON.stringify(mergedData.contributorGrowth, null, 2)};

var moments = ${JSON.stringify(mergedData.moments, null, 2)};

var mediaPlatforms = ${JSON.stringify(mergedData.mediaPlatforms, null, 2)};

var resources = ${JSON.stringify(mergedData.resources, null, 2)};

var platformTypes = ${JSON.stringify(mergedData.platformTypes, null, 2)};

var shares = ${JSON.stringify(mergedData.shares, null, 2)};

var shareCategories = ${JSON.stringify(mergedData.shareCategories, null, 2)};

var notes = ${JSON.stringify(mergedData.notes, null, 2)};

var notesCategories = ${JSON.stringify(mergedData.notesCategories, null, 2)};

var siteData = {
  skills: skills,
  projects: projects,
  changelog: changelog,
  about: about,
  growth: growth,
  contributors: contributors,
  contributorsIntro: contributorsIntro,
  contributorGrowth: contributorGrowth,
  moments: moments,
  mediaPlatforms: mediaPlatforms,
  resources: resources,
  platformTypes: platformTypes,
  shares: shares,
  shareCategories: shareCategories,
  notes: notes,
  notesCategories: notesCategories
};

if (typeof window !== 'undefined') {
  window.siteData = siteData;
  window.skills = skills;
  window.projects = projects;
  window.changelog = changelog;
  window.about = about;
  window.growth = growth;
  window.contributors = contributors;
  window.contributorsIntro = contributorsIntro;
  window.contributorGrowth = contributorGrowth;
  window.moments = moments;
  window.mediaPlatforms = mediaPlatforms;
  window.resources = resources;
  window.platformTypes = platformTypes;
  window.shares = shares;
  window.shareCategories = shareCategories;
  window.notes = notes;
  window.notesCategories = notesCategories;
  window.resourceData = resources;
  window.PLATFORM_TYPES = platformTypes;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = siteData;
}
`;
        fs.writeFileSync(path.join(DATA_DIR, 'index.js'), indexContent, 'utf8');

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(JSON.stringify({ success: true, message: '数据已保存到 data/ 目录' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: 一键导入 - 验证并返回 data/ 目录数据状态
  if (pathname === '/api/import' && req.method === 'POST') {
    try {
      const DATA_DIR = path.join(ROOT_DIR, 'data');

      // 辅助函数：从 ES Module 文件中提取 export 的数据
      function extractExport(filePath) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const match = content.match(/export\s+const\s+(\w+)\s*=\s*([\s\S]*?);/);
          if (match) {
            const varName = match[1];
            const code = match[0].replace(/export\s+const/, 'const');
            const fn = new Function(code + '\n return ' + varName + ';');
            return fn();
          }
          return null;
        } catch (e) {
          return null;
        }
      }

      // 读取各子模块数据并统计
      const stats = {
        skills: (extractExport(path.join(DATA_DIR, 'skills.js')) || []).length,
        projects: (extractExport(path.join(DATA_DIR, 'projects.js')) || []).length,
        changelog: (extractExport(path.join(DATA_DIR, 'changelog.js')) || []).length,
        about: extractExport(path.join(DATA_DIR, 'about.js')) ? true : false,
        growth: (extractExport(path.join(DATA_DIR, 'growth.js')) || []).length,
        contributors: (extractExport(path.join(DATA_DIR, 'contributors', 'list.js')) || []).length,
        moments: (extractExport(path.join(DATA_DIR, 'moments.js')) || []).length,
        mediaPlatforms: (extractExport(path.join(DATA_DIR, 'media', 'platforms.js')) || []).length,
        resources: (extractExport(path.join(DATA_DIR, 'resources', 'list.js')) || []).length,
        shares: (extractExport(path.join(DATA_DIR, 'share', 'list.js')) || []).length,
        notes: (extractExport(path.join(DATA_DIR, 'notes', 'list.js')) || []).length
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        success: true,
        message: '数据已存储在 data/ 目录',
        stats: stats
      }));
    } catch (e) {
      console.error('Import check error:', e);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // API: 打开项目文件夹
  if (pathname === '/api/open-folder' && req.method === 'POST') {
    const folderPath = __dirname;
    let cmd;
    if (process.platform === 'win32') {
      cmd = `cmd /c start "" "${folderPath.replace(/\//g, '\\')}"`;
    } else if (process.platform === 'darwin') {
      cmd = `open "${folderPath}"`;
    } else {
      cmd = `xdg-open "${folderPath}"`;
    }
    exec(cmd, (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      }
    });
    return;
  }

// ===== 上传通用函数 =====
function handleUpload(req, res, targetDir) {
  let body = '';
  req.setEncoding('binary');

  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const parts = body.split('--' + boundary);
      let fileData = null;
      let fileName = '';

      for (const part of parts) {
        if (part.includes('filename=')) {
          const fileMatch = part.match(/filename="([^"]+)"/);
          if (fileMatch) fileName = fileMatch[1];

          const dataStart = part.indexOf('\r\n\r\n');
          if (dataStart > -1) {
            const dataStr = part.substring(dataStart + 4);
            const lastCrlf = dataStr.lastIndexOf('\r\n');
            fileData = Buffer.from(lastCrlf > -1 ? dataStr.substring(0, lastCrlf) : dataStr, 'binary');
          }
          break;
        }
      }

      if (!fileData) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'No file uploaded' }));
        return;
      }

      const finalUploadDir = path.join(ROOT_DIR, 'assets', targetDir);
      if (!fs.existsSync(finalUploadDir)) {
        fs.mkdirSync(finalUploadDir, { recursive: true });
      }

      const ext = path.extname(fileName) || '.jpg';
      const newFileName = Date.now() + ext;
      const filePath = path.join(finalUploadDir, newFileName);

      fs.writeFileSync(filePath, fileData);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        success: true,
        path: 'assets/' + targetDir + '/' + newFileName
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
}

// API: 上传媒体视频封面 -> assets/media/
if (pathname === '/api/upload-media' && req.method === 'POST') {
  handleUpload(req, res, 'media');
  return;
}

// API: 上传头像 -> assets/avatar/
if (pathname === '/api/upload-avatar' && req.method === 'POST') {
  handleUpload(req, res, 'avatar');
  return;
}

// API: 上传分享图片 -> assets/share/
if (pathname === '/api/upload-share' && req.method === 'POST') {
  handleUpload(req, res, 'share');
  return;
}

// API: 上传笔记图片 -> assets/docs/
if (pathname === '/api/upload-image' && req.method === 'POST') {
  handleUpload(req, res, 'docs');
  return;
}

// 兼容旧版 /api/upload
if (pathname === '/api/upload' && req.method === 'POST') {
  handleUpload(req, res, 'share');
  return;
}

// 静态文件服务（禁用缓存）
  if (pathname === '/') pathname = '/manage.html';

  const filePath = path.join(ROOT_DIR, pathname);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  本地管理服务器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log(`  按 Ctrl+C 停止服务器`);
  console.log(`========================================\n`);
  
  // 启动时自动生成 data/index.js（从各分文件合并）
  try {
    const DATA_DIR = path.join(ROOT_DIR, 'data');
    
    function extractExport(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/export\s+const\s+(\w+)\s*=\s*([\s\S]*?);/);
        if (match) {
          const varName = match[1];
          const code = match[0].replace(/export\s+const/, 'const');
          const fn = new Function(code + '\n return ' + varName + ';');
          return fn();
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    
    const data = {
      skills: extractExport(path.join(DATA_DIR, 'skills.js')) || [],
      projects: extractExport(path.join(DATA_DIR, 'projects.js')) || [],
      changelog: extractExport(path.join(DATA_DIR, 'changelog.js')) || [],
      about: extractExport(path.join(DATA_DIR, 'about.js')) || {},
      growth: extractExport(path.join(DATA_DIR, 'growth.js')) || [],
      moments: extractExport(path.join(DATA_DIR, 'moments.js')) || [],
      contributors: extractExport(path.join(DATA_DIR, 'contributors', 'list.js')) || [],
      contributorsIntro: extractExport(path.join(DATA_DIR, 'contributors', 'intro.js')) || [],
      contributorGrowth: extractExport(path.join(DATA_DIR, 'contributors', 'growth.js')) || {},
      mediaPlatforms: extractExport(path.join(DATA_DIR, 'media', 'platforms.js')) || [],
      resources: extractExport(path.join(DATA_DIR, 'resources', 'list.js')) || [],
      platformTypes: extractExport(path.join(DATA_DIR, 'resources', 'categories.js')) || {},
      shares: extractExport(path.join(DATA_DIR, 'share', 'list.js')) || [],
      shareCategories: extractExport(path.join(DATA_DIR, 'share', 'categories.js')) || {},
      notes: extractExport(path.join(DATA_DIR, 'notes', 'list.js')) || [],
      notesCategories: extractExport(path.join(DATA_DIR, 'notes', 'categories.js')) || {}
    };
    
    const indexContent = `/**
 * 数据中心 - 所有模块数据的统一入口
 * 
 * 此文件由服务器自动生成，与 data/ 目录下的分文件保持同步
 * 
 * 使用方式：
 * 1. <script src="data/index.js"></script> (推荐)
 * 2. import './data/index.js'; (ES Module)
 */

var skills = ${JSON.stringify(data.skills, null, 2)};

var projects = ${JSON.stringify(data.projects, null, 2)};

var changelog = ${JSON.stringify(data.changelog, null, 2)};

var about = ${JSON.stringify(data.about, null, 2)};

var growth = ${JSON.stringify(data.growth, null, 2)};

var contributors = ${JSON.stringify(data.contributors, null, 2)};

var contributorsIntro = ${JSON.stringify(data.contributorsIntro, null, 2)};

var contributorGrowth = ${JSON.stringify(data.contributorGrowth, null, 2)};

var moments = ${JSON.stringify(data.moments, null, 2)};

var mediaPlatforms = ${JSON.stringify(data.mediaPlatforms, null, 2)};

var resources = ${JSON.stringify(data.resources, null, 2)};

var platformTypes = ${JSON.stringify(data.platformTypes, null, 2)};

var shares = ${JSON.stringify(data.shares, null, 2)};

var shareCategories = ${JSON.stringify(data.shareCategories, null, 2)};

var notes = ${JSON.stringify(data.notes, null, 2)};

var notesCategories = ${JSON.stringify(data.notesCategories, null, 2)};

var siteData = {
  skills: skills,
  projects: projects,
  changelog: changelog,
  about: about,
  growth: growth,
  contributors: contributors,
  contributorsIntro: contributorsIntro,
  contributorGrowth: contributorGrowth,
  moments: moments,
  mediaPlatforms: mediaPlatforms,
  resources: resources,
  platformTypes: platformTypes,
  shares: shares,
  shareCategories: shareCategories,
  notes: notes,
  notesCategories: notesCategories
};

if (typeof window !== 'undefined') {
  window.siteData = siteData;
  window.skills = skills;
  window.projects = projects;
  window.changelog = changelog;
  window.about = about;
  window.growth = growth;
  window.contributors = contributors;
  window.contributorsIntro = contributorsIntro;
  window.contributorGrowth = contributorGrowth;
  window.moments = moments;
  window.mediaPlatforms = mediaPlatforms;
  window.resources = resources;
  window.platformTypes = platformTypes;
  window.shares = shares;
  window.shareCategories = shareCategories;
  window.notes = notes;
  window.notesCategories = notesCategories;
  window.resourceData = resources;
  window.PLATFORM_TYPES = platformTypes;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = siteData;
}
`;
    
    fs.writeFileSync(path.join(DATA_DIR, 'index.js'), indexContent, 'utf8');
    console.log('✓ data/index.js 已从 data/ 分文件自动生成');
  } catch (e) {
    console.error('生成 data/index.js 失败:', e.message);
  }
});