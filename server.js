const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

http.createServer((request, response) => {
  const requestedPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.join(root, path.normalize(requestedPath));
  if (!filePath.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'text/plain; charset=utf-8' });
    response.end(data);
  });
}).listen(process.env.PORT || 3000, () => {
  console.log(`Farewell Fund running at http://localhost:${process.env.PORT || 3000}`);
});