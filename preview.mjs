// Dependency-free local preview. Works with a dist checkout or GitHub Pages root.
import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, relative, isAbsolute, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const base = dirname(fileURLToPath(import.meta.url));
const root = await realpath(existsSync(join(base, 'dist', 'index.html')) ? join(base, 'dist') : base);
if (!existsSync(join(root, 'index.html'))) throw new Error('index.html not found. Extract the complete project first.');
const args = process.argv.slice(2), flag = args.indexOf('--port');
const first = flag < 0 ? 8765 : Number(args[flag + 1]);
if (!Number.isInteger(first) || first < 1024 || first > 65535) throw new Error('Use --port with a number from 1024 to 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.pdf': 'application/pdf' };
const server = createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.split('/').some(p => p.startsWith('.'))) { res.writeHead(403); res.end('Forbidden'); return; }
    let path = resolve(root, '.' + pathname);
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    path = await realpath(path);
    const rel = relative(root, path);
    if (rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel)) { res.writeHead(403); res.end('Forbidden'); return; }
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path).toLowerCase()] || 'application/octet-stream', 'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) { res.writeHead(error instanceof URIError ? 400 : 404); res.end('Not found'); }
});
let port = first;
for (;;) {
  try { await new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', () => { server.removeListener('error', fail); ok(); }); }); break; }
  catch (error) { if (error.code === 'EADDRINUSE' && flag < 0 && port < Math.min(first + 9, 65535)) port++; else { console.error(`Cannot start preview: ${error.message}`); process.exit(1); } }
}
const url = `http://127.0.0.1:${port}/`;
console.log(`Local preview: ${url}\nRoot: ${root}\nEdit app.js / detail-design.js, save, then refresh. Ctrl+C stops the server.`);
if (!args.includes('--no-open')) {
  const command = process.platform === 'win32' ? ['cmd.exe', ['/d', '/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  const child = spawn(command[0], command[1], { stdio: 'ignore', windowsHide: true });
  child.on('error', () => console.log('Open the local preview URL in your browser.')); child.unref();
}
process.on('SIGINT', () => server.close(() => process.exit(0)));
