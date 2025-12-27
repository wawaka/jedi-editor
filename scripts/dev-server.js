/**
 * Simple dev server with auto-reload
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { watch } from 'fs';

const PORT = 17080;
const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// SSE clients for live reload
const clients = new Set();

// Watch for file changes
function setupWatcher() {
  const dirs = ['src', 'vendor'];
  dirs.forEach(dir => {
    const fullPath = path.join(ROOT, dir);
    if (fs.existsSync(fullPath)) {
      watch(fullPath, { recursive: true }, (event, filename) => {
        console.log(`File changed: ${dir}/${filename}`);
        // Notify all clients to reload
        clients.forEach(client => {
          client.write('data: reload\n\n');
        });
      });
    }
  });

  // Watch index.html
  watch(path.join(ROOT, 'index.html'), () => {
    console.log('File changed: index.html');
    clients.forEach(client => {
      client.write('data: reload\n\n');
    });
  });
}

// Inject live reload script into HTML
function injectLiveReload(html) {
  const script = `
<script>
  const es = new EventSource('/__reload');
  es.onmessage = () => location.reload();
  es.onerror = () => setTimeout(() => location.reload(), 1000);
</script>
</head>`;
  return html.replace('</head>', script);
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];

  // SSE endpoint for live reload
  if (url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Default to index.html
  if (url === '/') url = '/index.html';

  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    let content = data;
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    // Inject live reload into HTML
    if (ext === '.html') {
      content = injectLiveReload(data.toString());
    }

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(content);
  });
});

setupWatcher();
server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}/`);
  console.log('Watching for changes...');
});
