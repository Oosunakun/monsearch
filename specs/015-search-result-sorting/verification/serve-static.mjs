import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, extname, relative } from 'node:path'

const root = resolve('.cache/015-sort-generation/output/public')
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }
createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  let path = resolve(root, `.${pathname}`)
  if (relative(root, path).startsWith('..')) { response.writeHead(403).end(); return }
  if (pathname === '/') path = resolve(root, 'index.html')
  if ((!existsSync(path) || statSync(path).isDirectory()) && existsSync(`${path}.html`)) path += '.html'
  if (!existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(readFileSync(resolve(root, '404.html')))
    return
  }
  response.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream', ...(pathname === '/data/cards.json' ? { 'Cache-Control': 'no-cache' } : {}) })
  response.end(readFileSync(path))
}).listen(3015, '127.0.0.1', () => console.log('静的確認: http://127.0.0.1:3015/cards'))
