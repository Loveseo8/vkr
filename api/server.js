const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../vkr-main/vkr-main'); // Путь к корню вашего проекта
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

module.exports = (req, res) => {
    const requestedPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const filePath = path.join(root, safePath);

    if (!filePath.startsWith(root)) {
        res.status(403).send('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.status(404).send('Not found');
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        res.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream');
        res.send(data);
    });
};