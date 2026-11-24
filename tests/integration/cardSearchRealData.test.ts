// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, createError, defineEventHandler, toWebHandler } from 'h3'
import type { EventHandler } from 'h3'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { prepareCardSearch, runCardSearch } from '~~/shared/cardSearch/runner'
import { CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS, CARD_SEARCH_PER_PAGE } from '~~/shared/cardSearch/types'
import type { CardSearchResultPage } from '~~/shared/cardSearch/types'
import latest from '~~/app/utils/mockData/items/cards.json'
import { normalizeCatalogText } from '~~/shared/cardSearch/normalizeCatalogText'

let handler: EventHandler
beforeAll(async () => {
  vi.stubGlobal('defineEventHandler', defineEventHandler)
  vi.stubGlobal('createError', createError)
  handler = (await import('~~/server/api/cards.get')).default
})
afterAll(() => vi.unstubAllGlobals())
const request = (query: Record<string, string>) => toWebHandler(createApp().use('/api/cards', handler))(new Request(`http://localhost/api/cards?${new URLSearchParams(query)}`))

describe('最新入力の検索・DTO・API統合（固定全文Oracleなし）', () => {
  for (const sort of CARD_SEARCH_SORT_KEYS) for (const order of CARD_SEARCH_SORT_ORDERS) {
    it.each(CARD_SEARCH_PER_PAGE)(`${sort}/${order}/%i 全ページの集合・集計・原文・HTTP parity`, async perPage => {
      const sources = getSourceCards()
      const before = JSON.stringify(sources)
      const expectedIds = sources.map(source => source.card.card_id).sort()
      const counts = new Map<string, number>()
      for (const { card } of sources) counts.set(card.card_category_code, (counts.get(card.card_category_code) ?? 0) + 1)
      const breakdown = [...counts].map(([categoryCode, count]) => ({ categoryCode, count }))
      const pages = Math.max(1, Math.ceil(sources.length / perPage))
      const actual: string[] = []
      for (let page = 1; page <= pages; page++) {
        const query = { sort, order, perPage: String(perPage), page: String(page) }
        const result = runCardSearch(sources, prepareCardSearch(query))
        const response = await request(query)
        expect(response.status).toBe(200)
        expect(await response.json()).toEqual(result)
        expect(result).toMatchObject({ totalCount: sources.length, categoryBreakdown: breakdown, totalPages: pages, page, perPage, sort: { key: sort, order } })
        for (const item of result.items) {
          const source = sources.find(row => row.card.card_id === item.card_id)!.card
          expect(Object.keys(item).sort()).toEqual(['deck_restriction_count', 'card_id', 'reference_label', 'name', 'card_category_code', 'card_category_name', 'unit', 'spell', 'item', 'land', 'ritual', 'summoner', 'card_types', 'blocks', 'factions', 'effects', 'rarity_code', 'rarity_name', 'illustrator_name', 'product'].sort())
          expect(item.effects.map(effect => effect.effect_text)).toEqual(source.effects.map(effect => effect.effect_text))
          expect(item.name).toBe(source.name)
          expect(item.deck_restriction_count).toBe(typeof source.modification?.deck_restriction_count === 'number' ? source.modification.deck_restriction_count : null)
          expect(item).not.toHaveProperty('search_support')
          actual.push(item.card_id)
        }
      }
      expect([...actual].sort()).toEqual(expectedIds)
      expect(new Set(actual).size).toBe(sources.length)
      // 全順序Oracleは固定Aで保持。最新側ではgroup・値の単調性・同値収録順を別に確認する。
      const cards = actual.map(id => sources.find(row => row.card.card_id === id)!)
      const rarity = ['Unknown', 'Basic', 'Common', 'Uncommon', 'Rare', 'SuperRare', 'Special', 'DragonJr', 'Promotion', 'Summoner']
      const entries = cards.map(row => {
        const card = row.card
        if (sort === 'id') return { group: 0, value: card.card_id, index: row.sourceIndex }
        if (sort === 'rarity') return { group: 0, value: Math.max(0, rarity.indexOf(card.rarity_code)), index: row.sourceIndex }
        const unit = { level: card.unit?.level, atk: card.unit?.attack, defense: card.unit?.defense, initiative: card.unit?.ability?.initiative }[sort]
        const equip = { level: undefined, atk: card.item?.equip?.attack, defense: card.item?.equip?.defense, initiative: card.item?.equip?.ability?.initiative }[sort]
        return { group: unit != null ? 0 : equip != null ? 1 : 2, value: unit ?? equip ?? 0, index: row.sourceIndex }
      })
      for (let i = 1; i < entries.length; i++) {
        const prev = entries[i - 1]!, curr = entries[i]!
        expect(prev.group).toBeLessThanOrEqual(curr.group)
        if (prev.group === curr.group) {
          const delta = typeof prev.value === 'string' && typeof curr.value === 'string' ? prev.value.localeCompare(curr.value) : Number(prev.value) - Number(curr.value)
          expect(order === 'asc' ? delta : -delta).toBeLessThanOrEqual(0)
          if (delta === 0) expect(prev.index).toBeLessThan(curr.index)
        }
      }
      expect(runCardSearch(sources, prepareCardSearch({ sort, order, perPage: String(perPage), page: '999' })).page).toBe(pages)
      expect(runCardSearch([], prepareCardSearch({ sort, order, page: '999' }))).toMatchObject({ totalCount: 0, totalPages: 1, page: 1, items: [] })
      expect(JSON.stringify(sources)).toBe(before)
    }, 60000)
  }

  it.each(['nm', 'rl', 'kw', 'att'] as const)('%sは元fieldの独立predicateと全ID集合が一致する', key => {
    const sources = getSourceCards()
    const rawValue = (card: typeof sources[number]['card']) => key === 'nm' ? card.name : key === 'rl' ? card.reference_label : key === 'kw' ? card.search_support.full_text : card.search_support.archetype_text
    const value = sources.map(row => rawValue(row.card)).find(text => typeof text === 'string' && text.length) ?? 'R24-NO-MATCH'
    const term = key === 'kw' || key === 'att' ? normalizeCatalogText(value.trim()) : value.trim().toLocaleLowerCase()
    const ids = sources.filter(row => {
      const raw = rawValue(row.card)
      return typeof raw === 'string' && (key === 'kw' || key === 'att' ? raw : raw.toLocaleLowerCase()).includes(term)
    }).map(row => row.card.card_id).sort()
    const actual: string[] = []
    for (let page = 1, pages = 1; page <= pages; page++) {
      const result = runCardSearch(sources, prepareCardSearch({ [key]: value, perPage: '100', page: String(page) }))
      expect(result.totalCount).toBe(ids.length)
      pages = result.totalPages
      actual.push(...result.items.map(card => card.card_id))
    }
    expect(actual).toEqual(ids)
  })

  it.each([
    ['triangle', 'Common'],
    ['star', 'Rare'],
  ] as const)('rt=%sは配信用データの%sだけを全ページで返す', async (rt, rarityCode) => {
    const sources = getSourceCards()
    const expectedIds = latest.cards.filter(card => card.rarity_code === rarityCode).map(card => card.card_id).sort()
    const perPage = 100
    const totalPages = Math.max(1, Math.ceil(expectedIds.length / perPage))
    const runnerIds: string[] = []
    const apiIds: string[] = []

    for (let page = 1; page <= totalPages; page++) {
      const query = { rt, perPage: String(perPage), page: String(page) }
      const result = runCardSearch(sources, prepareCardSearch(query))
      const response = await request(query)
      expect(response.status).toBe(200)
      const body = await response.json() as CardSearchResultPage

      expect(result).toMatchObject({ totalCount: expectedIds.length, totalPages, page, perPage })
      expect(body).toEqual(result)
      expect(result.items.every(card => card.rarity_code === rarityCode)).toBe(true)
      runnerIds.push(...result.items.map(card => card.card_id))
      apiIds.push(...body.items.map(card => card.card_id))
    }

    expect(runnerIds.sort()).toEqual(expectedIds)
    expect(apiIds.sort()).toEqual(expectedIds)
  })

  it('cc=tokenは配信用データでTokenフラグまたはToken分類を持つカードを返す', () => {
    const expectedIds = latest.cards.filter(card => card.search_support.is_token || card.card_category_code.toLowerCase() === 'token')
      .map(card => card.card_id)
    const { matches } = prepareCardSearch({ cc: 'token' })
    expect(getSourceCards().filter(({ card }) => matches(card)).map(({ card }) => card.card_id)).toEqual(expectedIds)
  })

  it('実loaderは最新JSONを受理し、失敗後retryと共有Promiseを維持する', async () => {
    vi.resetModules()
    const fetch = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(new Response(JSON.stringify(latest)))
    vi.stubGlobal('fetch', fetch)
    try {
      const { loadCardSearchDataset } = await import('~~/app/utils/cardSearchDataset')
      await expect(loadCardSearchDataset()).rejects.toThrow('network')
      const first = loadCardSearchDataset()
      expect(loadCardSearchDataset()).toBe(first)
      const loaded = await first
      expect(loaded.map(row => row.card.card_id)).toEqual(latest.cards.map(card => card.card_id))
      expect(loaded.map(row => row.sourceIndex)).toEqual(latest.cards.map((_, index) => index))
      expect(await loadCardSearchDataset()).toBe(loaded)
      expect(fetch).toHaveBeenCalledTimes(2)
      expect(fetch.mock.calls.every(([url]) => url === '/data/cards.json')).toBe(true)
    } finally { vi.unstubAllGlobals() }
  })
})
