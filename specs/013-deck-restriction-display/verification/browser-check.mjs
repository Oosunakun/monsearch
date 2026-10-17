import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const directory = fileURLToPath(new URL('.', import.meta.url))
const cards = JSON.parse(readFileSync(new URL('../../../app/utils/mockData/items/cards.json', import.meta.url), 'utf8')).cards
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []
try {
  for (const [device, viewport] of [['pc', { width: 1440, height: 1100 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport })
    const longest = cards.reduce((a, b) => a.name.length > b.name.length ? a : b)
    for (const [name, slug, expected] of [
      ['ラプラース', 'prohibited', '禁止'], ['ホーリー・フェニックス', 'limit-one', '1枚制限'],
      ['スペクター', 'limit-two', '2枚制限'], ['サラマンダー', 'no-modification', null],
      ['アーニャ', 'empty-count', null], [longest.name, 'long-name', undefined],
    ]) {
      await page.goto(`http://127.0.0.1:3013/cards?nm=${encodeURIComponent(name)}`)
      const header = page.locator('.card-item-header').first()
      await header.waitFor()
      const chips = await header.locator('.v-chip').allTextContents()
      if (expected !== undefined && JSON.stringify(chips.map(value => value.trim())) !== JSON.stringify(expected === null ? [] : [expected])) {
        throw new Error(`${device} ${name}: unexpected chips ${chips}`)
      }
      await page.screenshot({ path: `${directory}${device}-${slug}.png`, fullPage: true })
      results.push({ device, name, chips, screenshot: `${device}-${slug}.png` })
    }
    await page.goto('http://127.0.0.1:3013/cards?sort=id&order=desc&page=2&perPage=20')
    await page.locator('.card-item-header').first().waitFor()
    const before = page.url()
    await page.reload()
    await page.locator('.card-item-header').first().waitFor()
    if (before !== page.url()) throw new Error('bookmark query changed')
    results.push({ device, bookmark: page.url() })
    await page.close()
  }
  writeFileSync(`${directory}browser-results.json`, JSON.stringify(results, null, 2) + '\n')
} finally {
  await browser.close()
}
