const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = 3000;
const root = __dirname;

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((request, response) => {
    const requestedPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const safePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
        response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Not found');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        response.writeHead(200, {
            'Content-Type': mimeTypes[extension] || 'application/octet-stream'
        });
        response.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`VirtualExpo server running at http://${host}:${port}`);
});
