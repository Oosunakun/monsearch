import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { chromium } from 'playwright-core'

// 本番originをPlaywrightのrouteでローカルartifactへ差し替える。外部へ送信しない。
const root = resolve('.output/public')
const origin = 'https://monsearch.gifumoko.net'
const enabled = process.env.NUXT_PUBLIC_ANALYTICS_ENABLED === 'true'
const browser = await chromium.launch({
  executablePath: process.env.ANALYTICS_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
})
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' }
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  let tagRequests = 0
  let blocked = false
  let datasetFailure = false
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.hostname === 'www.googletagmanager.com') {
      tagRequests++
      if (blocked) return route.abort()
      return route.fulfill({ contentType: 'text/javascript', body: `
        window.__tagCommands = [];
        const layer = window.dataLayer;
        const push = layer.push.bind(layer);
        for (const args of layer) window.__tagCommands.push(Array.from(args));
        layer.push = function(args) { window.__tagCommands.push(Array.from(args)); return push(args); };
      ` })
    }
    if (url.origin !== origin && url.origin !== 'https://fork.example') return route.abort()
    if (url.pathname === '/data/cards.json' && datasetFailure) return route.fulfill({ status: 503, body: 'temporary failure' })
    const path = resolve(root, '.' + decodeURIComponent(url.pathname))
    if (path !== root && !path.startsWith(root + sep)) return route.abort()
    let file
    for (const candidate of [path, path + '.html', path + '/index.html']) {
      try { if ((await stat(candidate)).isFile()) { file = candidate; break } } catch { /* 次候補 */ }
    }
    if (!file) return route.fulfill({ status: 404, body: 'missing' })
    return route.fulfill({ contentType: types[extname(file)] || 'application/octet-stream', body: await readFile(file) })
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const events = () => page.evaluate(() => (window.__tagCommands ?? []).filter(args => args[0] === 'event'))
  const waitResults = count => page.waitForFunction(count => (window.__tagCommands ?? []).filter(args => args[1] === 'search_results').length === count, count)
  const routerPush = path => page.evaluate(path => document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router.push(path), path)
  await page.goto(origin + '/cards?nm=検証用の存在しないカード名', { waitUntil: 'networkidle' })
  await page.waitForSelector('input[placeholder="簡易検索..."]')
  if (enabled) {
    await waitResults(1)
    assert.equal((await events()).filter(args => args[1] === 'page_view').length, 1, JSON.stringify(await events()))
    assert.equal((await events()).at(-1)[2].search_mode, 'direct')
    assert.equal((await events()).at(-1)[2].zero_results, 1)
    await routerPush('/about')
    await page.getByText('アクセス解析について', { exact: true }).waitFor()
    await page.evaluate(() => {
      window.__navDiagnostics = []
      window.addEventListener('popstate', () => window.__navDiagnostics.push('popstate'), { capture: true })
      const router = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router
      router.beforeEach((to, from) => { window.__navDiagnostics.push(['before', to.fullPath, from.fullPath]) })
      router.afterEach((to, from, failure) => { window.__navDiagnostics.push(['after', to.fullPath, from.fullPath, !!failure]) })
    })
    await page.goBack(); await waitResults(2)
    assert.equal((await events()).at(-1)[2].search_mode, 'history', JSON.stringify(await page.evaluate(() => window.__navDiagnostics)))
    const input = page.locator('input[placeholder="簡易検索..."]').first()
    await input.fill('簡易検索の検証用カード'); await input.press('Enter'); await waitResults(3)
    assert.equal((await events()).at(-1)[2].search_mode, 'quick')
    assert.equal(new URL((await events()).at(-1)[2].page_location).searchParams.get('nm'), '簡易検索の検証用カード')
    const before = await events()
    await input.press('Enter')
    await page.waitForTimeout(300)
    assert.equal((await events()).length, before.length + 1)
    assert.equal((await events()).at(-1)[1], 'search_submit')
    await routerPush('/cards/search?nm=詳細検索の検証用カード')
    await page.getByRole('button', { name: 'この条件で検索' }).click()
    await waitResults(4)
    assert.equal((await events()).at(-1)[2].search_mode, 'advanced')
    await routerPush('/cards'); await waitResults(5)
    const beforeControls = (await events()).length
    await page.locator('.zone-center-pagination .v-pagination__item button').filter({ hasText: /^2$/ }).click()
    await page.locator('.card-search-result-item').first().waitFor()
    await page.getByRole('button', { name: /カードNo/ }).first().click()
    await page.locator('.v-overlay--active .v-list-item').filter({ hasText: '攻撃力' }).click()
    await page.locator('.card-search-result-item').first().waitFor()
    assert.equal((await events()).length, beforeControls, 'ページ送り・sortは計測を増やさない')
    await routerPush('/cards?kw=' + 'あ'.repeat(200) + '&nm=長文条件の検証用カード')
    await waitResults(6)
    const long = (await events()).at(-1)[2]
    assert.equal(long.query_truncated, 1)
    assert(!new URL(long.page_location).searchParams.has('kw'))
    assert.equal(new URL(long.page_location).searchParams.get('nm'), '長文条件の検証用カード')
    // 別documentでdataset取得失敗→retryを再現する（成功済みcacheを使わない）。
    datasetFailure = true
    const retry = await context.newPage()
    retry.on('pageerror', error => errors.push(error.message))
    await retry.goto(origin + '/cards?nm=再試行の検証用カード', { waitUntil: 'networkidle' })
    await retry.getByRole('button', { name: '再試行' }).waitFor()
    assert.equal(await retry.evaluate(() => (window.__tagCommands ?? []).filter(args => args[1] === 'search_results').length), 0)
    datasetFailure = false
    await retry.getByRole('button', { name: '再試行' }).click()
    await retry.waitForFunction(() => (window.__tagCommands ?? []).filter(args => args[1] === 'search_results').length === 1)
    await retry.close()
    // script通信失敗は新しいdocumentで再現し、検索の0件表示を確認する。
    blocked = true
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByText('該当するカードはありません', { exact: true }).waitFor()
    assert.equal((await events()).length, 0)
  } else {
    await page.getByText('該当するカードはありません', { exact: true }).waitFor()
    await routerPush('/about')
    assert.equal(tagRequests, 0)
    assert.equal((await context.cookies()).filter(cookie => cookie.name.startsWith('_ga')).length, 0)
  }
  const requestsBeforeFork = tagRequests
  const fork = await context.newPage()
  await fork.goto('https://fork.example/cards?nm=別オリジンの検証用カード', { waitUntil: 'networkidle' })
  await fork.getByText('該当するカードはありません', { exact: true }).waitFor()
  assert.equal(tagRequests, requestsBeforeFork, '別originでは有効artifactでもtagを読まない')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ enabled, tagRequests, result: 'PASS', scope: 'local artifact + mock gtag; Google実受信・自動eventは未検証' }))
} finally { await browser.close() }
