/**
 * Minimal static file server, so `npm start` works without pulling in a
 * dependency. The app itself is plain ES modules, which browsers refuse to load
 * over file://, hence needing a server at all.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 8080;

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    const relativePath = normalize(requestPath === '/' ? '/index.html' : requestPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = join(ROOT, relativePath);

    // normalize() strips traversal, but re-check so a crafted path cannot escape.
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    try {
        const body = await readFile(filePath);
        res.writeHead(200, {
            'Content-Type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream',
            'Cache-Control': 'no-cache',
        });
        res.end(body);
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`Sudoku running at http://localhost:${PORT}`);
});
