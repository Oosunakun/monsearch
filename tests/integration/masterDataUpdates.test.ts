// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeFile, unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'
import { createCardsJsonHandler } from '~~/dev/cardsJsonHandler'
import { makeCard, displayCard, smallFile } from '../fixtures/cardSearch/cards'
import { historicalSources, sourcesFor } from '../fixtures/cardSearch/sources'
import { productOptions, homeRows } from '../fixtures/searchOptions/products'
import baseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import { makeScenarios, originalBundle } from '../helpers/masterDataScenarios'
import { validateCards, validateOptions, validateProductRows } from '../helpers/masterDataValidation'

const masterPath = '~~/app/utils/mockData/items/cards.json'
const productModule = '~~/app/utils/constants/search/options/product'
const sortModule = '~~/shared/cardSearch/sort'
const projectModule = '~~/shared/cardSearch/project'
afterEach(() => {
  vi.doUnmock('~~/app/utils/mockData/indexPage'); vi.doUnmock('~~/app/utils/mockData/restrictions')
  for (const name of Object.keys({ ...originalBundle().options, ...originalBundle().numeric, ...originalBundle().words })) vi.doUnmock(`~~/app/utils/constants/search/items/${name}.json`)
  vi.doUnmock(masterPath); vi.doUnmock(productModule); vi.doUnmock(sortModule); vi.doUnmock(projectModule)
  vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.resetModules()
})

describe('回帰検出', () => {
  it('手書き完全DTOは正常出力を受理し、本文欠落の実行出力を拒否する', async () => {
    const normal = await import('~~/shared/cardSearch/project')
    expect(normal.projectCard(makeCard())).toEqual(displayCard())
    vi.doMock(projectModule, async importOriginal => {
      const original = await importOriginal<typeof import('~~/shared/cardSearch/project')>()
      return { ...original, projectCards: (cards: Parameters<typeof original.projectCards>[0]) => original.projectCards(cards).map(card => ({ ...card, effects: card.effects.map(effect => ({ ...effect, effect_text: '' })) })) }
    })
    vi.resetModules()
    const { runCardSearch, prepareCardSearch } = await import('~~/shared/cardSearch/runner')
    const output = runCardSearch(sourcesFor([makeCard()]), prepareCardSearch({})).items[0]
    expect(() => expect(output).toEqual(displayCard())).toThrow()
  })
  it('手書き順は正常出力を受理し、同値sourceIndex逆転の実行出力を拒否する', async () => {
    const source = sourcesFor([makeCard({ card_id: 'a' }), makeCard({ card_id: 'b' })])
    const normal = await import('~~/shared/cardSearch/runner')
    expect(normal.runCardSearch(source, normal.prepareCardSearch({ sort: 'rarity' })).items.map(card => card.card_id)).toEqual(['a', 'b'])
    vi.doMock(sortModule, async importOriginal => {
      const original = await importOriginal<typeof import('~~/shared/cardSearch/sort')>()
      return { sortSourceCards: (...args: Parameters<typeof original.sortSourceCards>) => original.sortSourceCards(...args).reverse() }
    })
    vi.resetModules()
    const { runCardSearch, prepareCardSearch } = await import('~~/shared/cardSearch/runner')
    const output = runCardSearch(source, prepareCardSearch({ sort: 'rarity' })).items.map(card => card.card_id)
    expect(() => expect(output).toEqual(['a', 'b'])).toThrow()
  })
})

describe('正常更新', () => {
  it('可変集合が空になっても操作用seedを明示し、検査を迂回しない', () => {
    const empty = originalBundle()
    empty.file.cards = []
    empty.rows.home = []; empty.rows.restrictions = []
    for (const key of Object.keys(empty.options)) empty.options[key] = []
    for (const key of Object.keys(empty.numeric)) empty.numeric[key] = []
    for (const scenario of makeScenarios(empty)) {
      expect(validateCards(scenario.input.file).issues).toEqual([])
      for (const rows of Object.values(scenario.input.rows)) expect(validateProductRows(rows, scenario.input.options.productItems).issues).toEqual([])
      if (scenario.operation !== 'add' && !scenario.input.words[scenario.targetDataset]) expect(scenario.preparation.length).toBeGreaterThan(0)
    }
    const withoutEffects = originalBundle()
    withoutEffects.file.cards = [makeCard({ unit: null, summoner: { arcana: '', secondary_name: '' }, card_category_code: 'Summoner', card_category_name: '召喚術師', effects: [] })]
    const changed = makeScenarios(withoutEffects).find(scenario => scenario.scenarioId === 'cards/change')!
    expect(validateCards(changed.input.file).issues).toEqual([])
    expect(changed.input.file.cards[0]!.effects[0]!.effect_text).toContain('R24更新')
    const collisions = originalBundle()
    collisions.file.cards = [makeCard({ card_id: 'f0000000-0000-7000-8000-000000000001' })]
    collisions.options.productItems = structuredClone(productOptions)
    collisions.rows.home = [{ ...homeRows[0]!, id: 'r24-new' }]
    collisions.rows.restrictions = []
    for (const scenario of makeScenarios(collisions).filter(scenario => scenario.operation === 'add')) {
      expect(validateCards(scenario.input.file).issues).toEqual([])
      expect(validateProductRows(scenario.input.rows.home, scenario.input.options.productItems).issues).toEqual([])
    }
  })
  it.each(makeScenarios())('$scenarioId', async scenario => {
    const bundle = scenario.input
    const target = scenario.targetDataset === 'cards' ? bundle.file.cards : scenario.targetDataset === 'homeRows' ? bundle.rows.home : scenario.targetDataset === 'restrictionsRows' ? bundle.rows.restrictions : bundle.options[scenario.targetDataset] ?? bundle.numeric[scenario.targetDataset] ?? bundle.words[scenario.targetDataset]!
    if (scenario.operation === 'change') expect(target).not.toEqual(scenario.beforeTarget)
    else expect(target.length).toBe(scenario.scenarioId.endsWith('/last-positive') ? 0 : scenario.beforeTarget.length + (scenario.operation === 'add' ? 1 : -1))
    expect(validateCards(bundle.file).issues).toEqual([])
    for (const options of Object.values(bundle.options)) expect(validateOptions(options, true).issues).toEqual([])
    for (const rows of Object.values(bundle.rows)) expect(validateProductRows(rows, bundle.options.productItems).issues).toEqual([])

    // 元の可変入力境界へ注入し、最新側が実際に更新後入力を扱うことを確認する。
    const updatedOptions = { ...bundle.options, ...bundle.numeric, ...bundle.words }
    const itemPath = `~~/app/utils/constants/search/items/${scenario.targetDataset}.json`
    if (updatedOptions[scenario.targetDataset]) vi.doMock(itemPath, () => ({ default: updatedOptions[scenario.targetDataset] }))
    vi.doMock(masterPath, () => ({ default: bundle.file }))
    vi.doMock('~~/app/utils/mockData/indexPage', () => ({ mockProductSources: bundle.rows.home }))
    vi.doMock('~~/app/utils/mockData/restrictions', () => ({ mockRestrictionAvailableProductSources: bundle.rows.restrictions }))
    vi.doMock(productModule, () => ({ PRODUCT_OPTIONS: bundle.options.productItems, PRODUCT_VALUES: new Set(bundle.options.productItems!.map(option => option.value)) }))
    vi.resetModules()
    if (updatedOptions[scenario.targetDataset]) expect((await import(itemPath)).default).toEqual(updatedOptions[scenario.targetDataset])
    if (scenario.targetDataset === 'itemSlotItems') expect(bundle.words.itemSlotItems![0]!.value).not.toBe('multi')
    expect((await import('~~/app/utils/mockData/indexPage')).mockProductSources).toEqual(bundle.rows.home)
    expect((await import('~~/app/utils/mockData/restrictions')).mockRestrictionAvailableProductSources).toEqual(bundle.rows.restrictions)
    const dataSource = await import('~~/server/utils/cardSearch/dataSource')
    const { getSourceCards } = dataSource
    const { runCardSearch, prepareCardSearch } = await import('~~/shared/cardSearch/runner')
    const latest = getSourceCards()
    expect(latest.map(row => row.card)).toEqual(bundle.file.cards)
    const collected: string[] = []
    for (let page = 1, pages = 1; page <= pages; page++) {
      const result = runCardSearch(latest, prepareCardSearch({ perPage: '100', page: String(page) }))
      expect(result.totalCount).toBe(bundle.file.cards.length)
      pages = result.totalPages
      collected.push(...result.items.map(card => card.card_id))
    }
    expect(collected).toEqual(bundle.file.cards.map(card => card.card_id).sort())
    if (scenario.scenarioId.endsWith('/last-positive')) {
      const single = makeCard({ search_support: { full_text: 'r24-last-positive', archetype_text: '', is_token: false } })
      expect(runCardSearch(sourcesFor([single]), prepareCardSearch({ kw: 'r24-last-positive' })).totalCount).toBe(1)
      expect(runCardSearch(latest, prepareCardSearch({ kw: 'r24-last-positive' })).totalCount).toBe(0)
    }
    vi.spyOn(dataSource, 'getSourceCards').mockReturnValue(latest)
    vi.stubGlobal('defineEventHandler', defineEventHandler)
    vi.stubGlobal('createError', createError)
    const apiHandler = (await import('~~/server/api/cards.get')).default
    const apiResponse = await toWebHandler(createApp().use('/api/cards', apiHandler))(new Request('http://localhost/api/cards?perPage=100'))
    expect(apiResponse.status).toBe(200)
    expect(await apiResponse.json()).toEqual(runCardSearch(latest, prepareCardSearch({ perPage: '100' })))
    const { buildProductSearchLocation } = await import('~~/app/utils/search/productSearchLocation')
    for (const rows of Object.values(bundle.rows)) for (const row of rows) expect(buildProductSearchLocation(row.searchValue)).toEqual({ path: '/cards', query: { pd: row.searchValue } })

    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(bundle.file)))
    vi.stubGlobal('fetch', fetch)
    const { loadCardSearchDataset } = await import('~~/app/utils/cardSearchDataset')
    expect((await loadCardSearchDataset()).map(row => row.card)).toEqual(bundle.file.cards)
    expect(fetch).toHaveBeenCalledTimes(1)

    // 固定A/Bの元の比較条件を同じまま再実行。変更後本番データから正解を作らない。
    const first = baseline.cases[0]!.api.pages[0]!
    const fixed = runCardSearch(historicalSources(), prepareCardSearch({}))
    expect(fixed).toEqual({ ...first.response, items: first.response.items.map(id => baseline.projectedItems[id as keyof typeof baseline.projectedItems]) })
    const { projectCard } = await import('~~/shared/cardSearch/project')
    expect(projectCard(makeCard())).toEqual(displayCard())
    const { createSearchForm } = await import('~~/app/utils/search/cardSearchFormFactory')
    const { buildCardSearchQuery } = await import('~~/app/utils/search/cardSearchQueryBuilder')
    const form = createSearchForm()
    form.abilityItemSlots = { match: 'or', slots: { multi: 1 } }
    expect(buildCardSearchQuery(form)).toEqual({ is: 'multi:1' })
    vi.doMock(productModule, () => ({ PRODUCT_OPTIONS: productOptions, PRODUCT_VALUES: new Set(productOptions.map(option => option.value)) }))
    vi.resetModules()
    const fixedProduct = await import('~~/app/utils/search/productSearchLocation')
    expect(fixedProduct.buildProductSearchLocation('22d7e')).toEqual({ path: '/cards', query: { pd: '22d7e' } })
    expect(fixedProduct.buildProductSearchLocation('unknown')).toBeUndefined()

    if (scenario.targetDataset === 'cards') {
      const filePath = resolve('specs/016-decouple-search-test-data/verification/logs', `scenario-${randomUUID()}.json`)
      const bytes = JSON.stringify(bundle.file)
      try {
        await writeFile(filePath, bytes)
        const handler = toWebHandler(createApp().use('/data/cards.json', createCardsJsonHandler(filePath)))
        expect(await (await handler(new Request('http://localhost/data/cards.json'))).text()).toBe(bytes)
      } finally { await unlink(filePath) }
    }
    expect(originalBundle()).toEqual(scenario.original)
  }, 60000)
})

describe('不正入力', () => {
  it('必須欠損・重複ID・参照先だけ削除を各規則が検出する', () => {
    expect(validateCards({ ...smallFile(), cards: [makeCard({ name: '' })] }).issues.some(issue => issue.ruleId === 'C02')).toBe(true)
    expect(validateCards({ ...smallFile(), cards: [makeCard(), makeCard()] }).issues.some(issue => issue.ruleId === 'C03')).toBe(true)
    expect(validateProductRows(homeRows, productOptions.filter(option => option.value !== '22d7e')).issues.some(issue => issue.ruleId === 'C08')).toBe(true)
  })
})
