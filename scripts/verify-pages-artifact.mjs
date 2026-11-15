import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyAnalyticsArtifact } from './verify-analytics-artifact.mjs'

const productionOrigin = 'https://monsearch.gifumoko.net'
const indexableRoutes = ['/', '/about', '/rules', '/restrictions', '/links', '/cards/search']
const hash = bytes => createHash('sha256').update(bytes).digest('hex')

// Nuxtが生成するheadタグだけを検査する。HTML全体をDOMとして実行しない。
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, double, single]) => [key.toLowerCase(), double ?? single])))

export function verifyPagesArtifact({ sourceDir = process.cwd(), outputDir = resolve(sourceDir, '.output/public'), siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? '' } = {}) {
  const source = resolve(sourceDir)
  const output = resolve(outputDir)
  assert(siteUrl === '' || siteUrl === productionOrigin, 'siteUrlは未設定または確定Production originに限る')
  assert(existsSync(output), '生成成果物が存在しない')
  assert(!lstatSync(output).isSymbolicLink(), '出力rootのsymlinkは禁止')
  assert(!existsSync(resolve(source, 'functions')), '作業rootのfunctionsは静的Pages配信に含めない')

  const files = []
  const visit = folder => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = resolve(folder, entry.name)
      const name = relative(output, full).split(sep).join('/')
      const parts = name.split('/')
      assert(!lstatSync(full).isSymbolicLink(), `symlinkは禁止: ${name}`)
      assert(!parts.some(part => part.startsWith('.') || ['node_modules', 'server', 'functions', 'api', 'tests', 'fixtures', 'specs', 'docs', 'scripts'].includes(part)), `開発/サーバー資産: ${name}`)
      assert(!/(?:^|\/)(?:_worker\.js(?:\/|$)|_routes\.json$|package(?:-lock)?\.json$)|\.(?:map|ts|vue|md|log|pem|key|toml|ya?ml)$/i.test(name), `配信対象外: ${name}`)
      assert(name.startsWith('_nuxt/') || !/\.[cm]js$/i.test(name), `サーバーscript: ${name}`)
      if (entry.isDirectory()) visit(full)
      else {
        assert(entry.isFile(), `通常file以外: ${name}`)
        const bytes = readFileSync(full)
        assert(bytes.length > 0, `空file: ${name}`)
        files.push({ path: name, bytes: bytes.length, sha256: hash(bytes) })
      }
    }
  }
  visit(output)
  files.sort((a, b) => a.path.localeCompare(b.path))
  const read = name => readFileSync(resolve(output, name))
  const copyChecks = [
    ['app/utils/mockData/items/cards.json', 'data/cards.json'],
    ...['third-party-notices.txt', 'favicon.ico', 'images/meta/ogp.png', '_headers', 'robots.txt', 'sitemap.xml'].map(name => [`public/${name}`, name]),
  ].map(([input, name]) => {
    const expected = hash(readFileSync(resolve(source, input)))
    assert.equal(hash(read(name)), expected, `コピー不一致: ${name}`)
    return { path: name, sha256: expected }
  })
  const data = JSON.parse(read('data/cards.json').toString())
  assert(Array.isArray(data.cards) && data.cards.length > 0, 'カードJSONの形式/件数')
  const png = read('images/meta/ogp.png')
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'OGP PNG signature')
  assert.equal(png.readUInt32BE(16), 1200, 'OGP width')
  assert.equal(png.readUInt32BE(20), 630, 'OGP height')

  const config = readFileSync(resolve(source, 'nuxt.config.ts'), 'utf8')
  assert.match(config, /preset:\s*'static'/, 'Nitro static')
  assert.match(config, /autoSubfolderIndex:\s*false/, 'HTML出力形式')
  const routeBlock = config.match(/routes:\s*\[([^\]]+)\]/)?.[1]
  assert(routeBlock, '明示prerender routesがない')
  const routes = [...routeBlock.matchAll(/['"]([^'"]+)['"]/g)].map(([, route]) => route)
  assert.deepEqual([...routes].sort(), [...indexableRoutes, '/cards'].sort(), '現行7ページと監査契約の差異はReviewが必要')

  const checkAssets = (html, file) => {
    const refs = [...tags(html, 'script').map(tag => tag.src), ...tags(html, 'link').map(tag => tag.href), ...tags(html, 'img').map(tag => tag.src)].filter(Boolean)
    for (const ref of refs) {
      if (/^(?:https?:|data:|\/\/|#)/i.test(ref)) continue
      const pathname = decodeURIComponent(ref.split(/[?#]/)[0])
      const target = pathname.startsWith('/') ? resolve(output, `.${pathname}`) : resolve(dirname(resolve(output, file)), pathname)
      const local = relative(output, target)
      assert(!local.startsWith(`..${sep}`) && local !== '..' && !isAbsolute(local), `資産参照が出力外: ${file}`)
      assert(existsSync(target) && lstatSync(target).isFile(), `参照資産欠落: ${file} -> ${ref}`)
    }
    assert(refs.some(ref => ref.startsWith('/_nuxt/')), `Nuxt資産参照なし: ${file}`)
  }
  const pages = routes.map(route => {
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
    const html = read(file).toString()
    const meta = tags(html, 'meta')
    const values = key => meta.filter(tag => (tag.name ?? tag.property) === key).map(tag => tag.content)
    const links = tags(html, 'link')
    assert.match(html, /<html\b[^>]*\blang="ja"/, `${file}: lang`)
    assert.match(html, /<title>モンさーち！｜モンコレカード検索サイト<\/title>/, `${file}: title`)
    for (const key of ['description', 'og:title', 'og:description', 'og:type', 'og:locale', 'og:site_name', 'twitter:card']) {
      assert.equal(values(key).length, 1, `${file}: ${key}の重複/欠落`)
      assert(values(key)[0], `${file}: ${key}が空`)
    }
    assert.deepEqual(links.filter(tag => tag.rel === 'icon').map(tag => tag.href), ['/favicon.ico'], `${file}: favicon`)
    assert.deepEqual(links.filter(tag => tag.rel === 'canonical').map(tag => tag.href), siteUrl && route !== '/cards' ? [siteUrl + route] : [], `${file}: canonical`)
    assert.deepEqual(values('og:url'), siteUrl ? [siteUrl + route] : [], `${file}: og:url`)
    const imageMeta = { 'og:image': `${siteUrl}/images/meta/ogp.png`, 'og:image:alt': 'モンさーち！｜モンコレカード検索サイト', 'og:image:type': 'image/png', 'og:image:width': '1200', 'og:image:height': '630' }
    for (const [key, value] of Object.entries(imageMeta)) assert.deepEqual(values(key), siteUrl ? [value] : [], `${file}: ${key}`)
    assert.deepEqual(values('robots'), route === '/cards' ? ['noindex, follow'] : [], `${file}: robots`)
    checkAssets(html, file)
    return file
  })
  for (const file of ['404.html', '200.html']) {
    assert(existsSync(resolve(output, file)), `Nuxt fallback欠落: ${file}`)
  }
  for (const file of files.filter(file => file.path.endsWith('.html'))) checkAssets(read(file.path).toString(), file.path)
  for (const file of pages) verifyAnalyticsArtifact(read(file).toString())
  for (const file of files.filter(file => file.path.endsWith('/_payload.json') || file.path === '_payload.json')) JSON.parse(read(file.path).toString())
  const locs = [...read('sitemap.xml').toString().matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)
  assert.deepEqual(locs.sort(), indexableRoutes.map(route => productionOrigin + route).sort(), 'sitemap URL集合')
  assert(read('robots.txt').toString().includes(`Sitemap: ${productionOrigin}/sitemap.xml`), 'robots sitemap')
  assert.match(read('_headers').toString(), /\/data\/cards\.json\s+Cache-Control:\s*no-cache/i, 'JSON cache header')
  return { siteUrl: siteUrl || null, pages, cardCount: data.cards.length, copyChecks, files }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(process.argv.length, 2, '引数は不要。NUXT_PUBLIC_SITE_URLで生成時と同じoriginを指定する')
    console.log(JSON.stringify(verifyPagesArtifact(), null, 2))
  }
  catch (error) {
    console.error(`Pages artifact audit FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
