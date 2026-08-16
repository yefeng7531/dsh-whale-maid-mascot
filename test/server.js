// Tiny static server for local QA of the mascot client bundle.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PORT = Number(process.env.PORT || 8123)
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css; charset=utf-8', '.json': 'application/json' }

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    let path = decodeURIComponent(url.pathname)
    if (path === '/') path = '/test/test.html'
    if (path === '/whale-maid-mascot/a.png') path = '/assets/mascot_a.png'
    if (path === '/whale-maid-mascot/b.png') path = '/assets/mascot_b.png'
    if (path === '/whale-maid-mascot/c.png') path = '/assets/mascot_c.png'
    const file = normalize(join(ROOT, path))
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return }
    const data = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(data)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`))
