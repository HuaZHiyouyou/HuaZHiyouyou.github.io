const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'js', 'data.js');
const RESOURCE_FILE = path.join(__dirname, 'js', 'resource-data.js');
const UPLOAD_DIR = path.join(__dirname, 'assets', 'announce');

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

  // API: 获取数据
  if (pathname === '/api/data' && req.method === 'GET') {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const match = content.match(/const\s+siteData\s*=\s*({[\s\S]*});/);
      if (match) {
        const data = JSON.parse(match[1]);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(JSON.stringify(data));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '无法解析 data.js' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: 保存数据
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newData = JSON.parse(body);
        const content = `// 网站数据配置 - 修改这里即可更新网站内容\nconst siteData = ${JSON.stringify(newData, null, 2)};\n`;
        fs.writeFileSync(DATA_FILE, content, 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
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

  // API: 上传图片
  if (pathname === '/api/upload' && req.method === 'POST') {
    console.log('Upload API called, pathname:', pathname);
    let body = '';
    req.setEncoding('binary');
    
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        // 解析 multipart/form-data
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
              const dataStr = part.substring(dataStart + 4, part.length - 2);
              fileData = Buffer.from(dataStr, 'binary');
            }
            break;
          }
        }
        
        if (!fileData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'No file uploaded' }));
          return;
        }
        
        // 确保目录存在
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        
        // 生成唯一文件名
        const ext = path.extname(fileName) || '.jpg';
        const newFileName = Date.now() + ext;
        const filePath = path.join(UPLOAD_DIR, newFileName);
        
        fs.writeFileSync(filePath, fileData);
        
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
          success: true, 
          path: 'assets/announce/' + newFileName 
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: 获取资源数据 (robust)
  if (pathname === '/api/resource' && req.method === 'GET') {
    let data = { resources: [] };
    try {
      const content = fs.readFileSync(RESOURCE_FILE, 'utf8');
      const match = content.match(/const\s+resourceData\s*=\s*([\s\S]*?);/);
      if (match) {
        const code = match[0];
        const resourceData = (new Function(code + '\n return resourceData;'))();
        if (resourceData && typeof resourceData === 'object' && Array.isArray(resourceData.resources)) {
          data = resourceData;
        } else {
          console.warn('resourceData structure not as expected, falling back to empty');
        }
      } else {
        console.warn('resourceData not found in resource-data.js, falling back to empty');
      }
    } catch (err) {
      console.error('Failed to parse resource-data.js', err);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(JSON.stringify(data));
    return;
  }

  // API: 保存资源数据 (robust)
  if (pathname === '/api/resource' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newData = JSON.parse(body);
        let platformTypes = {};
        try {
          const content = fs.readFileSync(RESOURCE_FILE, 'utf8');
          const platformTypesMatch = content.match(/const\s+PLATFORM_TYPES\s*=\s*({[\s\S]*?});/);
          if (platformTypesMatch) {
            platformTypes = (new Function('return ' + platformTypesMatch[1]))();
          }
        } catch (e) {}
        const content = `// 资源数据配置 - 修改这里即可更新资源内容
const resourceData = ${JSON.stringify(newData, null, 2)};

// 网盘类型配置
const PLATFORM_TYPES = ${JSON.stringify(platformTypes, null, 2)};
`;
        fs.writeFileSync(RESOURCE_FILE, content, 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 静态文件服务（禁用缓存）
  if (pathname === '/') pathname = '/manage.html';
  
  const filePath = path.join(__dirname, pathname);
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
});
