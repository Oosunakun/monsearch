import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const directory = fileURLToPath(new URL('.', import.meta.url))
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []
try {
  for (const [device, viewport] of [['pc', { width: 1440, height: 1100 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport })
    const query = 'cc=unit&lv=gte:3'
    await page.goto(`http://127.0.0.1:3013/cards?${query}`)
    await page.locator('.card-item-header').first().waitFor()
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/cards?') && new URL(response.url()).searchParams.get('page') === '2')
    if (device === 'pc') await page.locator('.v-pagination__next button').click()
    else await page.getByRole('button', { name: '次へ' }).click()
    const response = await responsePromise
    const params = new URL(response.url()).searchParams
    if (params.get('cc') !== 'unit' || params.get('lv') !== 'gte:3') throw new Error('search query lost')
    results.push({ device, operation: 'next page', request: response.url(), page: (await response.json()).page })
    await page.locator('.card-item-header').first().waitFor()
    if (device === 'pc') {
      await page.getByRole('button', { name: /ID順/ }).click()
      const sorted = page.waitForResponse(response => response.url().includes('/api/cards?') && new URL(response.url()).searchParams.get('sort') === 'atk')
      await page.getByText('攻撃力順', { exact: true }).click()
      const sortedResponse = await sorted
      results.push({ device, operation: 'sort', request: sortedResponse.url() })
      await page.getByRole('button', { name: /20件/ }).click()
      const limited = page.waitForResponse(response => response.url().includes('/api/cards?') && new URL(response.url()).searchParams.get('perPage') === '50')
      await page.getByText('50件', { exact: true }).click()
      const limitedResponse = await limited
      results.push({ device, operation: 'perPage', request: limitedResponse.url() })
    }
    if (new URL(page.url()).search !== `?${query}`) throw new Error('URL query changed')

    await page.route('**/api/cards*', async route => {
      const response = await route.fetch()
      const body = await response.json()
      const card = body.items[0]
      body.items = [0, 1, 2, 3, 4, null].map((count, index) => ({
        ...card, card_id: `fixture-${index}`, name: `表示fixture ${String(count)}`, deck_restriction_count: count,
      }))
      body.totalCount = 6
      body.page = 1
      body.totalPages = 1
      await route.fulfill({ response, json: body })
    })
    await page.goto('http://127.0.0.1:3013/cards?nm=ラプラース')
    await page.getByText('表示fixture null', { exact: true }).waitFor()
    const items = page.locator('.card-search-result-item')
    const chips = await items.locator('.v-chip').allTextContents()
    if (JSON.stringify(chips.map(value => value.trim())) !== JSON.stringify(['禁止', '1枚制限', '2枚制限'])) throw new Error('fixture chips mismatch')
    await page.screenshot({ path: `${directory}${device}-all-counts.png`, fullPage: true })
    results.push({ device, fixture: [0, 1, 2, 3, 4, null], chips, screenshot: `${device}-all-counts.png` })
    await page.close()
  }
  writeFileSync(`${directory}browser-operations.json`, JSON.stringify(results, null, 2) + '\n')
} finally {
  await browser.close()
}
