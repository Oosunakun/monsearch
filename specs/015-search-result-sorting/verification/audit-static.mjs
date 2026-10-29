import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, relative, join } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const root = resolve('.cache/015-sort-generation/output/public')
const original = readFileSync('app/utils/mockData/items/cards.json')
const served = readFileSync(join(root, 'data/cards.json'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
assert(original.equals(served))
const routes = ['index.html', 'cards.html', 'about.html', 'cards/search.html', 'rules.html', 'restrictions.html', 'links.html', 'tournaments.html', '404.html']
for (const route of routes) assert(existsSync(join(root, route)), route)
const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})
const files = walk(root)
const forbidden = files.filter(path => /(^|\/)(_worker\.js|server|api)(\/|$)/.test(relative(root, path).replaceAll('\\', '/')))
assert.equal(forbidden.length, 0)
const { cards } = JSON.parse(original)
const embedded = []
let scanned = 0
for (const path of files.filter(path => /\.(js|html|json)$/.test(path) && relative(root, path).replaceAll('\\', '/') !== 'data/cards.json')) {
  const text = readFileSync(path, 'utf8')
  scanned++
  const count = cards.filter(card => text.includes(card.card_id)).length
  if (count) embedded.push({ path: relative(root, path), count })
  assert(!text.includes(original.toString('utf8')))
}
assert.equal(embedded.length, 0)
const headers = readFileSync(join(root, '_headers'), 'utf8')
assert.match(headers, /\/data\/cards\.json[\s\S]*?Cache-Control:\s*no-cache/i)
// ブラウザーのimport経路も確認（型importはbundle対象でない）。
const loader = readFileSync('app/utils/cardSearchDataset.ts', 'utf8')
assert.match(loader, /fetch\('\/data\/cards.json', \{ cache: 'no-cache' \}\)/)
const client = ['app/composables/useCardSearch.ts', 'app/utils/cardSearchDataset.ts', ...walk('shared/cardSearch').filter(path => path.endsWith('.ts') && !path.endsWith('.test.ts'))]
const rawImports = client.filter(path => /(?:import|require).*?(?:mockData\/items\/cards\.json|cardSearch\/dataSource)/.test(readFileSync(path, 'utf8')))
assert.deepEqual(rawImports, [])
const result = { routes, sourceBytes: original.length, servedBytes: served.length, sourceSha256: sha(original), servedSha256: sha(served), headers, scanned, embedded, forbidden, clientFiles: client, rawImports }
writeFileSync('specs/015-search-result-sorting/verification/static-audit.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ routes: routes.length, bytes: original.length, sha256: sha(original), scanned, embedded, forbidden }))
