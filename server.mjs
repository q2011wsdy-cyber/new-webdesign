import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { randomUUID } from 'node:crypto';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const dataFile = join(root, 'data', 'site-content.json');
const uploadDir = join(root, 'assets', 'uploads');
const allowedExt = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif', '.mp4']);
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.jsx': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.otf': 'font/otf'
};

await mkdir(uploadDir, { recursive: true });

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req, limit = 120 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { reject(new Error('File is too large')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/content' && req.method === 'GET') {
      return json(res, 200, JSON.parse(await readFile(dataFile, 'utf8')));
    }
    if (url.pathname === '/api/content' && req.method === 'POST') {
      const content = JSON.parse(await readBody(req, 2 * 1024 * 1024));
      if (!Array.isArray(content.works) || !Array.isArray(content.play)) return json(res, 400, { error: 'Invalid content' });
      content.play = content.play.slice(0, 12);
      await writeFile(dataFile, `${JSON.stringify(content, null, 2)}\n`);
      return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/upload' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const originalExt = extname(body.name || '').toLowerCase();
      if (!allowedExt.has(originalExt) || typeof body.data !== 'string') return json(res, 400, { error: 'Unsupported file format' });
      const base64 = body.data.replace(/^data:[^;]+;base64,/, '');
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${originalExt}`;
      await writeFile(join(uploadDir, filename), Buffer.from(base64, 'base64'));
      return json(res, 200, { src: `assets/uploads/${filename}`, type: originalExt === '.mp4' ? 'video' : 'image' });
    }
    const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const relative = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
    const filePath = join(root, relative);
    if (!filePath.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
    const stat = await import('node:fs/promises').then(fs => fs.stat(filePath));
    if (!stat.isFile()) throw new Error('Not found');
    res.writeHead(200, { 'content-type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      if (req.url && req.url.startsWith('/api/')) return json(res, 500, { error: error.message });
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    }
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio and admin running at http://127.0.0.1:${port}`);
  console.log(`Admin: http://127.0.0.1:${port}/admin.html`);
});
