import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

export function extractBuildInfo(html) {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).filter(script => script.startsWith('window.__NUXT__='))
  assert.equal(scripts.length, 1, 'Nuxt公開configは1件であること')
  const sandbox = { window: {} }
  runInNewContext(scripts[0], sandbox, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } })
  const info = sandbox.window.__NUXT__?.config?.public?.buildInfo
  assert(info && typeof info === 'object', '公開buildInfo欠落')
  assert.deepEqual(Object.keys(info).sort(), ['builtAtUtc', 'commitSha', 'version'])
  assert(typeof info.version === 'string' && info.version && info.version.trim() === info.version && !/[\r\n\u2028\u2029]/.test(info.version), 'version不正')
  assert.match(info.commitSha, /^[a-f\d]{40}$/)
  assert(!/^0+$/.test(info.commitSha), 'SHA全ゼロ')
  assert.match(info.builtAtUtc, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  assert.equal(new Date(info.builtAtUtc).toISOString(), info.builtAtUtc)
  return JSON.parse(JSON.stringify(info))
}

export function verifyBuildInfoArtifact(outputDir, pages) {
  const values = pages.map(page => extractBuildInfo(readFileSync(resolve(outputDir, page), 'utf8')))
  assert(values.length > 0, '監査対象ページなし')
  for (const info of values) assert.deepEqual(info, values[0], 'ページ間のbuildInfo不一致')
  return values[0]
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = resolve(dirname(fileURLToPath(import.meta.url)), '../.output/public')
  console.log(JSON.stringify(verifyBuildInfoArtifact(output, [
    'index.html', 'cards.html', 'about.html', 'cards/search.html', 'rules.html',
    'restrictions.html', 'links.html', 'tournaments.html', '200.html', '404.html',
  ]), null, 2))
}
