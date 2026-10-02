// Minimal static server (preview, Playwright, report). No dependencies.
// Usage: node scripts/serve.mjs [port=4173] [root=dist]
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.argv[2] ?? 4173);
const root = resolve(process.argv[3] ?? 'dist');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon',
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return void res.writeHead(403).end();
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    statSync(file);
  } catch {
    return void res.writeHead(404).end('Not found');
  }
  res.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} on http://127.0.0.1:${port}/`));
