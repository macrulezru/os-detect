import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
};

// Serves dist/ (the built UMD bundle) and e2e/fixtures/ (the test page)
// over plain HTTP so Playwright can navigate to a real page that loads it.
const server = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200).end('ok');
    return;
  }

  const relativePath =
    req.url === '/' ? 'e2e/fixtures/index.html' : `e2e/fixtures${req.url}`;
  const distPath = req.url?.startsWith('/dist/') ? req.url.slice(1) : null;
  const filePath = join(root, distPath ?? relativePath);

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});

server.listen(4173, '127.0.0.1', () => {
  console.log('e2e server listening on http://127.0.0.1:4173');
});
