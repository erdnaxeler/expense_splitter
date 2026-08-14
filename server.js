// Expense Splitter — zero-dependency Node server.
// Serves the single-page app and a tiny JSON state API, persisting to a file.
// Runs anywhere Node runs (Railway, Render, a VPS, your laptop). No paywalls.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const INDEX = path.join(__dirname, 'public', 'index.html');

function emptyState() {
  return { people: [], expenses: [], payments: [], rev: 0, updatedAt: 0 };
}

function readState() {
  try {
    const s = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (s && Array.isArray(s.people)) return s;
  } catch (e) {}
  return emptyState();
}

function writeState(s) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(s));
    return true;
  } catch (e) {
    console.error('Could not write data file:', e.message);
    return false;
  }
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // --- API: read whole state ---
  if (req.url === '/api/state' && req.method === 'GET') {
    return sendJson(res, 200, readState());
  }

  // --- API: replace whole state ---
  if (req.url === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 5e6) req.destroy(); }); // 5MB guard
    req.on('end', () => {
      let incoming;
      try { incoming = JSON.parse(body); } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }
      if (!incoming || !Array.isArray(incoming.people)) return sendJson(res, 400, { error: 'bad state' });
      const cur = readState();
      const next = {
        people: incoming.people,
        expenses: Array.isArray(incoming.expenses) ? incoming.expenses : [],
        payments: Array.isArray(incoming.payments) ? incoming.payments : [],
        rev: (cur.rev || 0) + 1,
        updatedAt: Date.now()
      };
      const ok = writeState(next);
      return sendJson(res, ok ? 200 : 500, ok ? { rev: next.rev, updatedAt: next.updatedAt } : { error: 'write failed' });
    });
    return;
  }

  if (req.url === '/health') { res.writeHead(200); return res.end('ok'); }

  // --- static: the app ---
  if (req.url === '/' || req.url === '/index.html') {
    return fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); return res.end('index.html missing'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  }

  res.writeHead(404); res.end('not found');
});

server.listen(PORT, () => console.log('Expense Splitter running on port ' + PORT));
