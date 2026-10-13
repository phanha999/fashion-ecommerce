import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = resolve('dist');
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8', '.png':'image/png', '.ico':'image/x-icon' };
await stat(resolve(root, 'app.html')).catch(() => { throw new Error('Run npm run build:optimized before production preview.'); });
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    if (pathname === '/') file = resolve(root, 'index.html');
    else if (pathname === '/shop' || pathname === '/shop/') file = resolve(root, 'shop.html');
    else if (!(await stat(file).catch(() => null))?.isFile()) {
      if (extname(pathname)) { response.writeHead(404); response.end(); return; }
      file = resolve(root, 'app.html');
    }
    let body = await readFile(file);
    const type = mime[extname(file)] || 'application/octet-stream';
    response.setHeader('Content-Type', type);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
    if (/gzip/.test(request.headers['accept-encoding'] || '') && /text|javascript|xml|svg/.test(type)) {
      body = gzipSync(body); response.setHeader('Content-Encoding', 'gzip'); response.setHeader('Vary', 'Accept-Encoding');
    }
    response.setHeader('Content-Length', body.length);
    response.writeHead(200); response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(500); response.end('Could not load the page.'); }
}).listen(port, '127.0.0.1', () => console.log(`Production preview: http://127.0.0.1:${port}`));
