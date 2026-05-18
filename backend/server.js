const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'pedidos.json');
const PUBLIC_DIR = path.join(__dirname, '..');

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    await fs.promises.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function handleApi(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 204, {});
  }

  if (req.url === '/api/produtos' && req.method === 'GET') {
    const productsPath = path.join(PUBLIC_DIR, 'produtos.json');
    try {
      const content = await fs.promises.readFile(productsPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      return res.end(content);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Não foi possível ler produtos.' });
    }
  }

  if (req.url === '/api/pedidos' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const data = JSON.parse(body || '{}');
      await ensureDataFile();
      const current = JSON.parse(await fs.promises.readFile(DATA_FILE, 'utf8'));
      current.push({ ...data, recebidoEm: new Date().toISOString() });
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(current, null, 2), 'utf8');
      return sendJSON(res, 201, { ok: true });
    } catch (error) {
      return sendJSON(res, 400, { error: 'Dados inválidos ou falha ao salvar pedido.' });
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Rota não encontrada');
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    return handleApi(req, res);
  }

  const filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  fs.promises
    .readFile(filePath)
    .then((content) => {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css; charset=utf-8' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    })
    .catch(() => {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
    });
});

server.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
