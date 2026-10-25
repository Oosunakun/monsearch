// T002専用の観測スクリプト。既存ソースを読み込み、実handlerをメモリ内で実行する。
// npm・依存取得・ネットワークserver・テスト設定の変更は使用しない。
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { createJiti } from 'jiti'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'

const root = process.cwd()
const output = resolve(root, 'specs/014-search-catalog-normalization/verification')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const inputPath = 'app/utils/mockData/items/cards.json'
const bytes = readFileSync(resolve(root, inputPath))
const data = JSON.parse(bytes)
const audit = JSON.parse(readFileSync(resolve(output, 'data-audit.json'), 'utf8'))
assert.equal(sha256(bytes), audit.sha256, 'T001と同一入力であること')
const jiti = createJiti(import.meta.url, { alias: { '~~': root, '~': resolve(root, 'app') }, fsCache: false })
const previousGlobals = ['defineEventHandler', 'createError'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)])
try {
  globalThis.defineEventHandler = defineEventHandler
  globalThis.createError = createError
  const handler = (await jiti.import(resolve(root, 'server/api/cards.get.ts'))).default
  const { getSourceCards } = await jiti.import(resolve(root, 'server/utils/cardSearch/dataSource.ts'))
  const { searchCards } = await jiti.import(resolve(root, 'server/utils/cardSearch/search.ts'))
  const { parseCardSearchQuery } = await jiti.import(resolve(root, 'app/utils/search/cardSearchQueryParser.ts'))
  const source = getSourceCards()
  const sourceSnapshot = JSON.stringify(source)
  const webHandler = toWebHandler(createApp().use('/api/cards', handler))
  const readResponse = async query => {
    // RequestはURL情報だけを渡す。toWebHandlerはfetch/socketを使わず直接handlerを呼ぶ。
    const response = await webHandler(new Request(`http://localhost/api/cards?${query}`))
    assert.equal(response.status, 200, query)
    return { status: response.status, body: await response.json() }
  }
  const projectedItems = {}
  const definitions = [
    ['default', ''], ['name', 'nm=ドラゴン'], ['name-case', 'nm=AN'],
    ['reference', 'rl=m20a-001'], ['effect', 'etx=対象'],
    ['elements', 'el=fire&el=water,fire'], ['zero', 'at=eq:0'],
    ['slots', 'ssm=and&ss=fire:1,water:1'], ['unit-level', 'cc=unit&lv=gte:1'],
    ['invalid-mixed', 'lv=broken&rt=Rare'], ['cost-other', 'coe=trash:1'],
    ['cost-item', 'cis=consume:1'], ['cost-spell', 'css=fire:1'],
    ['none-slots', 'cc=unit&ism=none'], ['token', 'cc=token'],
    ['item-equip', 'cc=item-equip'], ['spell', 'cc=spell'],
    ['combined', 'cc=unit&el=fire&at=gte:2&lv=lte:5'],
    ['effect-combined', 'etx=対象&eft=ActionSkill&eac=Battle'],
    ['no-result', 'nm=T002-NO-SUCH-CARD'],
  ]
  for (const sort of ['id', 'rarity', 'atk']) {
    for (const order of ['asc', 'desc']) {
      for (const perPage of [20, 50, 100]) {
        definitions.push([`${sort}-${order}-${perPage}`, `sort=${sort}&order=${order}&perPage=${perPage}`])
      }
    }
  }
  const cases = []
  for (const [name, query] of definitions) {
    const params = new URLSearchParams(query)
    assert(!params.has('kw') && !params.has('att'))
    const locationQuery = {}
    for (const key of new Set(params.keys())) {
      const values = params.getAll(key)
      locationQuery[key] = values.length === 1 ? values[0] : values
    }
    const criteria = parseCardSearchQuery(locationQuery)
    const criteriaSnapshot = JSON.stringify(criteria)
    const unitIds = searchCards(source.map(item => item.card), criteria).map(card => card.card_id)
    const first = await readResponse(query)
    const pages = []
    const record = ({ status, body }, requestQuery) => {
      for (const item of body.items) {
        if (projectedItems[item.card_id]) assert.deepEqual(projectedItems[item.card_id], item)
        projectedItems[item.card_id] = item
      }
      pages.push({ requestQuery, status, responseFields: Object.keys(body), responseSha256: sha256(JSON.stringify(body)),
        response: { ...body, items: body.items.map(item => item.card_id) } })
    }
    record(first, query)
    for (let page = 2; page <= first.body.totalPages; page++) {
      record(await readResponse(`${query}${query ? '&' : ''}page=${page}`), `${query}${query ? '&' : ''}page=${page}`)
    }
    const allIds = pages.flatMap(page => page.response.items)
    assert.equal(allIds.length, first.body.totalCount)
    assert.equal(new Set(allIds).size, allIds.length)
    assert.deepEqual([...allIds].sort(), [...unitIds].sort(), `${name}: Unit/APIの全ID集合`)
    assert.equal(JSON.stringify(criteria), criteriaSnapshot)
    const boundaries = []
    for (const requestedPage of ['0', '999999', 'broken']) {
      const requestQuery = `${query}${query ? '&' : ''}page=${requestedPage}`
      const { status, body } = await readResponse(requestQuery)
      const actualPage = pages.find(page => page.response.page === body.page)
      assert(actualPage)
      assert.deepEqual(body.items.map(item => item.card_id), actualPage.response.items)
      boundaries.push({ requestQuery, status, response: { ...body, items: body.items.map(item => item.card_id) } })
    }
    cases.push({ name, query, locationQuery, unit: { ids: unitIds, totalCount: unitIds.length },
      api: { allIds, totalCount: first.body.totalCount, categoryBreakdown: first.body.categoryBreakdown, pages, boundaries } })
  }
  assert.equal(JSON.stringify(source), sourceSnapshot, '入力原文を変更しないこと')
  assert.equal(sha256(readFileSync(resolve(root, inputPath))), audit.sha256)
  const result = {
    status: 'complete', capturedAt: new Date().toISOString(),
    input: { path: inputPath, version: data.version, count: data.cards.length, sha256: audit.sha256 },
    testRun: { command: 'node node_modules/vitest/vitest.mjs --run server/utils/cardSearch server/api/cards.get.test.ts app/utils/search app/composables/useCardSearchForm.test.ts app/pages/cards/search.test.ts',
      exitCode: 1, files: { total: 30, failed: 5, passed: 25 }, tests: { total: 424, failed: 16, passed: 408 }, log: 'baseline-local-output.log' },
    capture: { command: 'node specs/014-search-catalog-normalization/verification/capture-baseline.mjs',
      method: 'ローカルjitiで既存TSと~~ aliasを解決し、h3 toWebHandlerで既存実handlerを直接呼ぶ。HTTP通信なし。単独scriptでVitestの代用はしない。',
      responseEncoding: '各response.itemsはcard_id参照。projectedItems[id]を代入すれば完全な応答を復元できる。responseSha256は復元したJSON.stringify(body)のSHA-256。',
      catalogConditions: false, sourceUnchanged: true, criteriaUnchanged: true },
    classifications: source.map(({ card, sourceIndex }) => ({ card_id: card.card_id, sourceIndex, card_category_code: card.card_category_code,
      is_token: card.search_support.is_token, searchCategory: card.search_support.is_token ? 'token' : card.card_category_code.toLowerCase() === 'item' ? `item-${card.item?.item_category_code.toLowerCase()}` : card.card_category_code.toLowerCase() })),
    projectedItems, cases,
  }
  writeFileSync(resolve(output, 'baseline.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ status: result.status, cases: cases.length, projectedItems: Object.keys(projectedItems).length,
    pages: cases.reduce((n, item) => n + item.api.pages.length, 0), boundaries: cases.reduce((n, item) => n + item.api.boundaries.length, 0), inputSha256: audit.sha256 }))
} finally {
  for (const [key, descriptor] of previousGlobals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else delete globalThis[key]
  }
}
