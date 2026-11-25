import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { cardSearchParityQueries } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { makeCard, makeNumericPresenceCards, makeSearchCard, makeSearchEquipmentCard, textEffect, ordinaryEffect } from '~~/tests/fixtures/cardSearch/cards'
import { historicalSources, sourcesFor } from '~~/tests/fixtures/cardSearch/sources'
import { createCardSearchMatcher, matchesCardSearch, searchCards } from './search'
import * as catalogNormalizer from '~~/shared/cardSearch/normalizeCatalogText'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { buildQuickSearchQuery } from '~~/app/utils/search/quickSearchQueryBuilder'
import catalogOracle from '~~/specs/014-search-catalog-normalization/verification/expected-catalog-results.json'
import approvedBaseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import type { Card, SearchCostComponent } from '~~/types/cards/finderCards'
let fixedSources = sourcesFor([makeSearchCard()])
beforeEach(() => {
  const reported = makeSearchCard()
  reported.reference_label = 'M20A-016'
  reported.effects = [{ ...ordinaryEffect, effect_text: '別の効果' }, { ...textEffect, effect_type_code: 'DeclareSkill', effect_text: '自軍プレイヤーは1Dする。' }]
  fixedSources = sourcesFor([makeSearchCard(), makeSearchEquipmentCard(), reported])
})
const getSourceCards = () => fixedSources

describe('019 数値能力の適用範囲', () => {
  it.each([
    ['initiative', 'itm', 'it', 'unit', 'unit', 'token-unit'],
    ['charge', 'chm', 'ch', 'unit', 'unit', 'token-unit'],
    ['defender', 'dem', 'de', 'unit', 'unit', 'token-unit'],
    ['initiative', 'aitm', 'ait', 'equip', 'item-equip', 'token-equip'],
    ['charge', 'achm', 'ach', 'equip', 'item-equip', 'token-equip'],
    ['defender', 'adem', 'ade', 'equip', 'item-equip', 'token-equip'],
  ] as const)('%s (%s) の適用・欠損・0を区別する', (field, modifier, alias, group, category, tokenId) => {
    const cards = makeNumericPresenceCards()
    const nullCard = cards.find(card => card.card_id === `${group}-null`)!
    // 不完全な受信レコードで、能力行があっても当該プロパティが欠けるケース。
    const missingValue = makeCard({ ...nullCard, card_id: `${group}-missing-value` })
    const ability = group === 'unit' ? missingValue.unit!.ability! : missingValue.item!.equip!.ability!
    Reflect.deleteProperty(ability, field)
    cards.push(missingValue)

    // 分類と詳細が食い違う入力でも、受信した比較単独の既存評価を維持する。
    const positive = cards.find(card => card.card_id === `${group}-positive`)!
    cards.push(makeCard({ ...positive, card_id: 'spell-with-ability', card_category_code: 'Spell' }))

    const matchingIds = (query: Record<string, string>) =>
      searchCards(cards, parseCardSearchQuery(query)).map(card => card.card_id)
    const absentIds = [`${group}-null`, `${group}-no-ability`, `${group}-no-detail`]
    expect(matchingIds({ [modifier]: 'exclude' })).toEqual([...absentIds, tokenId, missingValue.card_id])
    expect(matchingIds({ [modifier]: 'exclude', [alias]: 'gte:2' })).toEqual([...absentIds, tokenId, missingValue.card_id])
    expect(matchingIds({ [modifier]: 'exclude', cc: category })).toEqual([...absentIds, missingValue.card_id])
    expect(matchingIds({ [modifier]: 'exclude', cc: 'token' })).toEqual([tokenId])
    expect(matchingIds({ [modifier]: 'exclude', cc: 'spell' })).toEqual([])
    expect(matchingIds({ [modifier]: 'include' })).toEqual([`${group}-positive`, `${group}-zero`, `${group}-negative`])
    expect(matchingIds({ [modifier]: 'include', [alias]: 'gte:0' })).toEqual([`${group}-positive`, `${group}-zero`])
    expect(matchingIds({ [alias]: 'gte:2' })).toEqual([`${group}-positive`, 'spell-with-ability'])
  })

  it.each([
    [{ he: 'eq:0' }, ['unit-zero', 'unit-negative']],
    [{ hem: 'include' }, ['unit-positive', 'unit-negative']],
    [{ hem: 'include', he: 'eq:0' }, ['unit-negative']],
    [{ hem: 'exclude', he: 'gte:99' }, ['unit-zero', 'unit-null', 'unit-no-ability', 'token-unit']],
    [{ lv: 'gte:2' }, ['unit-positive', 'unit-zero', 'unit-negative', 'unit-null', 'unit-no-ability', 'token-unit']],
    [{ lvm: 'include', lv: 'gte:2' }, ['unit-positive']],
    [{ lvm: 'exclude', lv: 'gte:2' }, ['unit-zero', 'unit-negative', 'unit-null', 'unit-no-ability', 'token-unit']],
  ] as const)('%j の英雄点・レベル・即時召喚の既存判定を維持する', (query, expectedIds) => {
    const cards = makeNumericPresenceCards()
    expect(searchCards(cards, parseCardSearchQuery(query)).map(card => card.card_id)).toEqual(expectedIds)
  })

  it.each([
    ['ssm', 'unit-positive', ['unit-zero', 'unit-negative', 'unit-null', 'unit-no-ability', 'token-unit']],
    // 所持枠の none は装備品詳細の有無で判定し、分類コードの表記は参照しない。
    ['assm', 'equip-positive', ['equip-zero', 'equip-negative', 'equip-null', 'equip-no-ability', 'item-lowercase-equip', 'token-equip']],
  ] as const)('%s=none は対応詳細を要求し、正の所持枠を持つカードを除外する', (alias, positiveId, expectedIds) => {
    const cards = makeNumericPresenceCards()
    const positive = cards.find(card => card.card_id === positiveId)!
    const ability = positive.unit?.ability ?? positive.item!.equip!.ability!
    ability.ability_slots = [{
      ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火',
      ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1,
    }]
    expect(searchCards(cards, parseCardSearchQuery({ [alias]: 'none' })).map(card => card.card_id)).toEqual(expectedIds)
  })
})








afterEach(() => vi.restoreAllMocks())

// JSON/表形式fixtureの省略値を除いて、実際のURL Queryと同じ形でParserへ渡す。
const parseFixtureQuery = (query: Record<string, string | string[] | undefined>) => parseCardSearchQuery(
  Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string | string[]] => entry[1] !== undefined)),
)

const makeCatalogCards = (): Card[] => catalogOracle.fixtureCards.map(fixture => {
  const card = makeSearchCard()
  card.card_id = fixture.id
  card.name = fixture.name
  card.search_support.full_text = fixture.full_text
  card.search_support.archetype_text = fixture.archetype_text
  card.unit!.races = [{ ...card.unit!.races[0]!, race_name: fixture.race }]
  const type = makeSearchCard().card_types[0]!
  card.card_types = [{ ...type, card_type_name: fixture.type }]
  return card
})

describe('未指定条件の不要処理を省く', () => {
  it.each([{}, { kw: 'catalog-only' }, { att: 'archetype-only' }])('%jで未指定facetの配列を参照しない', query => {
    const card = makeCatalogCards()[0]!
    const observe = (target: object, key: string) => {
      const value = Reflect.get(target, key)
      const read = vi.fn(() => value)
      Object.defineProperty(target, key, { configurable: true, enumerable: true, get: read })
      return read
    }
    const reads = [
      ...['card_types', 'factions', 'blocks', 'product', 'rarity_code', 'illustrator_id', 'effects'].map(key => observe(card, key)),
      ...['elements', 'races'].map(key => observe(card.unit!, key)),
      ...['ability_slots', 'affinities'].map(key => observe(card.unit!.ability!, key)),
    ]
    expect(createCardSearchMatcher(parseFixtureQuery(query))(card)).toBe(true)
    for (const read of reads) expect(read).not.toHaveBeenCalled()
  })

  it('空slot条件は通し、noneは対象能力なしを許可しない', () => {
    const card = makeCatalogCards()[0]!
    card.unit = null
    expect(matchesCardSearch(card, parseCardSearchQuery({}))).toBe(true)
    expect(matchesCardSearch(card, parseCardSearchQuery({ ssm: 'none' }))).toBe(false)
    expect(matchesCardSearch(card, parseCardSearchQuery({ assm: 'none' }))).toBe(false)
  })

  it('Cost条件をprepared matcherで準備し、カード反復でslotsを読み直さない', () => {
    const card = makeCatalogCards()[0]!
    card.effects = [{ ...card.effects[0]!, effect_cost_id: 'known', effect_cost_text: '既知コスト',
      search_cost: { alternatives: [{ costs: [{ type: 'other', value: 'trash', quantity: 1 }] }], has_other_cost: false },
    }]
    const criteria = parseCardSearchQuery({ coe: 'trash:1' })
    const slots = criteria.costOtherEntities.slots
    const read = vi.fn(() => slots)
    Object.defineProperty(criteria.costOtherEntities, 'slots', { get: read })
    const matches = createCardSearchMatcher(criteria)
    const preparedReads = read.mock.calls.length
    expect(preparedReads).toBeGreaterThan(0)
    for (let index = 0; index < 10; index++) expect(matches(card)).toBe(true)
    expect(read).toHaveBeenCalledTimes(preparedReads)
    expect(slots).toEqual({ trash: 1 })
  })
})

describe('prepared matcherの呼出構造', () => {
  it.each([
    { kw: 'CATALOG-ONLY' }, { att: 'ＡＲＣＨＥＴＹＰＥ－ＯＮＬＹ' },
    { kw: 'CATALOG-ONLY', att: 'ＡＲＣＨＥＴＹＰＥ－ＯＮＬＹ' }, {}, { kw: ' \t\n ', att: '　' },
  ])('%jを準備時だけ変換し、predicate反復では変換しない', query => {
    const criteria = parseFixtureQuery(query)
    const argumentsBeforeScan = [criteria.keyword, criteria.archetypeText].filter(Boolean)
    const normalize = vi.spyOn(catalogNormalizer, 'normalizeCatalogText')
    const card = makeCatalogCards()[0]!
    const support = card.search_support
    Object.defineProperty(card, 'search_support', { get: () => {
      expect(normalize.mock.calls).toEqual(argumentsBeforeScan.map(value => [value]))
      return support
    } })
    const matches = createCardSearchMatcher(criteria)
    expect(normalize.mock.calls).toEqual(argumentsBeforeScan.map(value => [value]))
    for (let index = 0; index < 100; index += 1) expect(matches(card)).toBe(true)
    expect(normalize.mock.calls).toEqual(argumentsBeforeScan.map(value => [value]))
  })

  it.each([0, 1, 7, 101])('%i枚のsearchCardsでも走査前に各query一回だけ変換する', count => {
    const normalize = vi.spyOn(catalogNormalizer, 'normalizeCatalogText')
    const criteria = parseCardSearchQuery({ kw: 'CATALOG-ONLY', att: 'ARCHETYPE-ONLY' })
    const card = makeCatalogCards()[0]!
    const cards = Array.from({ length: count }, () => card)
    Object.defineProperty(cards, 'filter', { value: (predicate: (card: Card) => boolean) => {
      expect(normalize.mock.calls).toEqual([['CATALOG-ONLY'], ['ARCHETYPE-ONLY']])
      return Array.prototype.filter.call(cards, predicate)
    } })
    expect(searchCards(cards, criteria)).toHaveLength(count)
    expect(normalize.mock.calls).toEqual([['CATALOG-ONLY'], ['ARCHETYPE-ONLY']])
  })

  it('単一カードwrapperの互換動作と別requestの独立性を維持する', () => {
    const cards = makeCatalogCards()
    const first = parseCardSearchQuery({ kw: 'catalog-only', att: 'archetype-only' })
    const second = parseCardSearchQuery({ kw: 'other', att: 'other' })
    const matchesFirst = createCardSearchMatcher(first)
    const matchesSecond = createCardSearchMatcher(second)
    expect(cards.map(matchesFirst)).toEqual([true, false])
    expect(cards.map(matchesSecond)).toEqual([false, true])
    expect(cards.map(matchesFirst)).toEqual(cards.map(card => matchesCardSearch(card, first)))
    expect(searchCards(cards, second).map(card => card.card_id)).toEqual(['B'])
  })
})

describe('US3 既存検索と原文の保持', () => {
  it.each(approvedBaseline.cases)('$nameの全ID・入力順を承認済みT002 baselineと比較する', example => {
    const cards = historicalSources().map(source => source.card)
    const criteria = parseFixtureQuery(example.locationQuery)
    const before = JSON.stringify({ cards, criteria })
    expect(searchCards(cards, criteria).map(card => card.card_id)).toEqual(example.unit.ids)
    expect(JSON.stringify({ cards, criteria })).toBe(before)
  })

  it('catalog検索後もcriteriaとカード原文を保持し、同名別カードを独立判定する', () => {
    const cards = makeCatalogCards()
    cards[0]!.name = cards[1]!.name = '同名 ＡＢＣ ｶﾞ'
    const criteria = parseCardSearchQuery({ kw: 'ＣＡＴＡＬＯＧ－ＯＮＬＹ', att: 'ＡＲＣＨＥＴＹＰＥ－ＯＮＬＹ' })
    const before = JSON.stringify({ cards, criteria })
    expect(searchCards(cards, criteria).map(card => card.card_id)).toEqual(['A'])
    expect(JSON.stringify({ cards, criteria })).toBe(before)
  })

  it('nm/rlの既存小文字化と幅を同一視しない挙動を維持する', () => {
    const card = makeCatalogCards()[0]!
    card.name = 'Name É Ａ'
    card.reference_label = 'ABC-01'
    expect(searchCards([card], parseCardSearchQuery({ nm: 'NAME é', rl: 'abc-01' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ nm: 'Name É a' }))).toEqual([])
  })

  it('etxは効果本文のみを既存のカナ合成で照合し、効果名を代用しない', () => {
    const card = makeCatalogCards()[0]!
    card.effects = [{ ...card.effects[0]!, effect_name: 'name-only', effect_text: 'ガード ＡＢＣ' }]
    expect(searchCards([card], parseCardSearchQuery({ etx: 'ｶﾞｰﾄﾞ abc' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ etx: 'name-only' }))).toEqual([])
  })

  it('is_tokenを元categoryより優先し、catalog有無によらず分類を維持する', () => {
    const normal = makeCatalogCards()[0]!
    normal.card_id = 'normal'
    const token = structuredClone(normal)
    token.card_id = 'token'
    token.search_support.is_token = true
    const tokenByCode = { ...structuredClone(normal), card_id: 'token-by-code', card_category_code: 'Token' }
    const tokenByLowercaseCode = { ...structuredClone(normal), card_id: 'token-by-lowercase-code', card_category_code: 'token' }
    const cards = [normal, token, tokenByCode, tokenByLowercaseCode]
    for (const query of [{}, { kw: 'catalog-only', att: 'archetype-only' }]) {
      expect(searchCards(cards, parseFixtureQuery({ ...query, cc: 'unit' }))).toEqual([normal])
      expect(searchCards(cards, parseFixtureQuery({ ...query, cc: 'token' }))).toEqual([token, tokenByCode, tokenByLowercaseCode])
    }
  })
})

describe('searchCards', () => {
  it.each([
    ['circle', 'Basic'], ['triangle', 'Common'], ['rhombus', 'Uncommon'], ['star', 'Rare'],
    ['club', 'SuperRare'], ['spade', 'Special'], ['heart', 'Promotion'], ['crescent', 'DragonJr'], ['hexagram', 'Summoner'],
  ] as const)('rt のNatural Key %sをDatabase code %sへMappingする', (naturalKey, rarityCode) => {
    const criteria = createSearchForm()
    criteria.rarities = [naturalKey]
    const card = makeCard({ rarity_code: rarityCode })
    const suffixOnly = makeCard({ rarity_code: `Other${rarityCode}` })
    const lowercaseOnly = makeCard({ rarity_code: rarityCode.toLowerCase() })

    expect(searchCards([card, suffixOnly, lowercaseOnly], criteria)).toEqual([card])
  })

  it.each([
    ['triangle', 'Common', 'Uncommon'],
    ['star', 'Rare', 'SuperRare'],
  ] as const)('rt=%sは%sだけを返し%sを除外する', (rt, expectedCode, suffixCode) => {
    const exact = makeCard({ rarity_code: expectedCode })
    const suffixOnly = makeCard({ rarity_code: suffixCode })
    expect(searchCards([exact, suffixOnly], parseCardSearchQuery({ rt }))).toEqual([exact])
  })

  it.each([
    ['item-consume', 'Consume'], ['item-equip', 'Equip'], ['item-bullet', 'Bullet'],
  ] as const)('cc=%sはItemかつアイテム分類%sの場合に一致する', (cc, itemCode) => {
    const item = { item_category_code: itemCode, item_category_name: '', consume: null, equip: null, bullet: null }
    const exact = makeCard({ card_category_code: 'Item', item })
    const wrongCardCategory = makeCard({ card_category_code: 'Unit', item })
    const wrongItemCategory = makeCard({ card_category_code: 'Item', item: { ...item, item_category_code: itemCode.toLowerCase() } })
    const missingItem = makeCard({ card_category_code: 'Item' })
    expect(searchCards([exact, wrongCardCategory, wrongItemCategory, missingItem], parseCardSearchQuery({ cc }))).toEqual([exact])
  })

  it('rtとelは各Collection内がOR、異なる項目間がANDになる', () => {
    const element = (code: string) => ({ element_code: code, element_name: '' })
    const commonFire = makeCard({ rarity_code: 'Common' })
    commonFire.unit!.elements = [element('Fire')]
    const rareWater = makeCard({ rarity_code: 'Rare', card_category_code: 'Spell', unit: null, spell: { elements: [element('Water')] } })
    const uncommonFire = makeCard({ ...commonFire, rarity_code: 'Uncommon' })
    const rareSuffixFire = makeCard({ ...rareWater, spell: { elements: [element('SpellFire')] } })

    const criteria = parseCardSearchQuery({ rt: 'triangle,star', el: 'fire,water' })
    expect(searchCards([commonFire, rareWater, uncommonFire, rareSuffixFire], criteria)).toEqual([commonFire, rareWater])
  })

  it('mt=FlyはLongFlyと進軍データがないカードを除外する', () => {
    const fly = makeCard()
    fly.unit!.move_type_code = 'Fly'
    const longFly = makeCard()
    longFly.unit!.move_type_code = 'LongFly'
    const missingUnit = makeCard({ unit: null })
    const cards = [fly, longFly, missingUnit]
    expect(searchCards(cards, parseCardSearchQuery({ mt: 'Fly' }))).toEqual([fly])

    const criteria = createSearchForm()
    criteria.moveTypes = ['LongFly']
    expect(searchCards(cards, criteria)).toEqual([longFly])
  })

  it('blは表示名や末尾が一致するブロックを除外する', () => {
    const exact = makeCard({ blocks: [{ block_code: 'Deus', block_name: 'DE' }] })
    const nameOnly = makeCard({ blocks: [{ block_code: 'Anniversary', block_name: 'Deus' }] })
    const suffixOnly = makeCard({ blocks: [{ block_code: 'OtherDeus', block_name: '別ブロック' }] })
    expect(searchCards([exact, nameOnly, suffixOnly], parseCardSearchQuery({ bl: 'Deus' }))).toEqual([exact])
  })

  it.each([['none', 'None'], ['ritual', 'Ritual']] as const)('lc=%sは地形分類コード%sで絞り込む', (lc, code) => {
    const exact = makeCard({ land: { land_category_code: code, land_category_name: '地形', land_limit: 8 } })
    const nameOnly = makeCard({ land: { ...exact.land!, land_category_code: 'Other', land_category_name: code } })
    const cards = [exact, nameOnly, makeCard()]
    expect(searchCards(cards, parseCardSearchQuery({ lc }))).toEqual([exact])
    expect(searchCards(cards, parseCardSearchQuery({ lc: 'all' }))).toEqual(cards)
  })

  it.each([
    ['eft', 'effect_type_code', 'ActionSkill'],
    ['eac', 'effect_activation_category_code', 'Battle'],
  ] as const)('%sは末尾だけが一致する効果と効果がないカードを除外する', (alias, field, code) => {
    const exact = makeCard({ effects: [{ ...ordinaryEffect, [field]: code }] })
    const suffixOnly = makeCard({ effects: [{ ...ordinaryEffect, [field]: `Other${code}` }] })
    const noEffects = makeCard({ effects: [] })
    expect(searchCards([exact, suffixOnly, noEffects], parseCardSearchQuery({ [alias]: code }))).toEqual([exact])
  })

  it('rt=club はfixtureのSuperRareカードを返す', () => {
    const result = searchCards(getSourceCards().map(item => item.card), parseCardSearchQuery({ rt: 'club' }))

    expect(result.length).toBeGreaterThan(0)
    expect(result.every(card => card.rarity_code === 'SuperRare')).toBe(true)
  })

  it('Item・Spell・Otherのsearch_costを実際に支払える数量で検索する', () => {
    const template = structuredClone(getSourceCards()[0]!.card)
    const make = (type: 'item' | 'spell' | 'other', value: string, quantity: number) => {
      const card = structuredClone(template)
      card.effects = [{ ...card.effects[0]!, search_cost: { alternatives: [{ costs: [{ type, value, quantity }] }], has_other_cost: false } }]
      return card
    }
    const cases = [
      { type: 'item' as const, value: 'consume', alias: 'cis', key: 'consume' },
      { type: 'spell' as const, value: 'fire', alias: 'css', key: 'fire' },
      { type: 'other' as const, value: 'trash', alias: 'coe', key: 'trash' },
    ]
    for (const item of cases) {
      const payable = make(item.type, item.value, 2)
      const insufficient = make(item.type, item.value, 1)
      const criteria = parseCardSearchQuery({ [item.alias]: `${item.key}:2` })
      expect(searchCards([payable, insufficient], criteria)).toEqual([payable])
    }
  })

  it('異なるEffectに分散したItem条件とSpell条件は同時指定しても一致しない', () => {
    const template = structuredClone(getSourceCards()[0]!.card)
    const card = structuredClone(template)
    const makeEffect = (name: string, costs: SearchCostComponent[]) => ({
      ...template.effects[0]!,
      effect_name: name,
      effect_cost_id: 'known',
      effect_cost_text: 'known cost',
      search_cost: { alternatives: [{ costs }], has_other_cost: false },
    })
    card.effects = [
      makeEffect('Item only', [{ type: 'item', value: 'consume', quantity: 1 }]),
      makeEffect('Spell only', [{ type: 'spell', value: 'fire', quantity: 2 }]),
    ]

    expect(searchCards([card], parseCardSearchQuery({ cis: 'consume:1', css: 'fire:2' }))).toEqual([])
  })

  it('Item・Spell・Otherは同一Effect・同一alternativeでAND評価し、各不足を除外する', () => {
    const template = structuredClone(getSourceCards()[0]!.card)
    const makeCard = (name: string, costs: SearchCostComponent[]) => {
      const card = structuredClone(template)
      card.effects = [{
        ...template.effects[0]!,
        effect_name: name,
        effect_cost_id: 'known',
        effect_cost_text: 'known cost',
        search_cost: { alternatives: [{ costs }], has_other_cost: false },
      }]
      return card
    }
    const complete = makeCard('Complete', [
      { type: 'item', value: 'consume', quantity: 1 },
      { type: 'spell', value: 'fire', quantity: 2 },
      { type: 'other', value: 'power', quantity: 1 },
    ])
    const missingItem = makeCard('Missing Item', [
      { type: 'spell', value: 'fire', quantity: 2 },
      { type: 'other', value: 'power', quantity: 1 },
    ])
    const missingSpell = makeCard('Missing Spell', [
      { type: 'item', value: 'consume', quantity: 1 },
      { type: 'other', value: 'power', quantity: 1 },
    ])
    const missingOther = makeCard('Missing Other', [
      { type: 'item', value: 'consume', quantity: 1 },
      { type: 'spell', value: 'fire', quantity: 2 },
    ])

    expect(searchCards(
      [complete, missingItem, missingSpell, missingOther],
      parseCardSearchQuery({ cis: 'consume:1', css: 'fire:2', coe: 'power:1' }),
    )).toEqual([complete])
  })

  it('同一alternativeのAND条件、共有any容量、選択肢をまたぐ数量、noneとunknownを区別する', () => {
    const template = structuredClone(getSourceCards()[0]!.card)
    const make = (alternatives: NonNullable<typeof template.effects[number]['search_cost']>['alternatives'], hasOther = false) => {
      const card = structuredClone(template)
      card.effects = [{ ...card.effects[0]!, effect_cost_id: 'known', effect_cost_text: 'cost', search_cost: { alternatives, has_other_cost: hasOther } }]
      return card
    }
    const capacity = make([{ costs: [{ type: 'spell', value: 'any', min: 1, max: 3 }] }])
    const split = make([{ costs: [{ type: 'spell', value: 'fire', quantity: 2 }] }, { costs: [{ type: 'spell', value: 'water', quantity: 1 }] }])
    const criteria = parseCardSearchQuery({ css: 'fire:2,water:1', cssm: 'and' })
    expect(searchCards([capacity], criteria)).toEqual([capacity])
    expect(searchCards([make([{ costs: [{ type: 'spell', value: 'any', min: 1, max: 3 }] }])], parseCardSearchQuery({ css: 'fire:2,water:2', cssm: 'and' }))).toEqual([])
    expect(searchCards([split], criteria)).toEqual([])

    const noCost = structuredClone(template)
    noCost.effects = [{ ...noCost.effects[0]!, effect_cost_id: '', effect_cost_text: '', search_cost: null }]
    const unknown = structuredClone(template)
    unknown.effects = [{ ...unknown.effects[0]!, effect_cost_id: 'unknown', effect_cost_text: 'unknown', search_cost: undefined }]
    const absent = structuredClone(template)
    absent.effects = []
    const none = parseCardSearchQuery({ coe: 'trash:1', coem: 'none' })
    expect(searchCards([noCost, unknown, make([], true), absent], none)).toEqual([noCost])
  })

  it('Short UUIDは既存IDの末尾5桁を照合し、未知の形式有効値は非ヒットにする', () => {
    const source = getSourceCards().map(item => item.card)
    const known = searchCards(source, parseCardSearchQuery({ pd: '22D7E' }))
    const unknown = searchCards(source, parseCardSearchQuery({ pd: 'abcde' }))
    const or = searchCards(source, parseCardSearchQuery({ pd: 'abcde,22d7e' }))

    expect(known.length).toBeGreaterThan(0)
    expect(unknown).toEqual([])
    expect(or).toEqual(known)
  })

  it('ct/fa/raの名称fallbackとre/areのAffinity ID照合を維持する', () => {
    const source = getSourceCards().map(item => item.card)
    const cardTypeCard = source.find(card => card.card_types.length > 0)
    const factionCard = source.find(card => card.factions.length > 0)
    const raceCard = source.find(card => (card.unit?.races.length ?? 0) > 0)
    const resistanceCard = source.find(card => card.unit?.ability?.affinities.some(x => x.affinity.affinity_id.endsWith('41e89')))
    const additionalResistanceCard = source.find(card => card.item?.equip?.ability?.affinities.some(x => x.affinity.affinity_id.endsWith('41e89')))

    expect(cardTypeCard).toBeDefined()
    expect(factionCard).toBeDefined()
    expect(raceCard).toBeDefined()
    expect(resistanceCard).toBeDefined()
    expect(additionalResistanceCard).toBeDefined()

    const cardTypeCriteria = createSearchForm(); cardTypeCriteria.cardTypes = [cardTypeCard!.card_types[0]!.card_type_name]
    const factionCriteria = createSearchForm(); factionCriteria.factions = [factionCard!.factions[0]!.faction_name]
    const raceCriteria = createSearchForm(); raceCriteria.races = [raceCard!.unit!.races[0]!.race_name]
    const resistance = resistanceCard!.unit!.ability!.affinities.find(x => x.affinity.affinity_id.endsWith('41e89'))!
    const resistanceCriteria = parseCardSearchQuery({ re: resistance.affinity.affinity_id.slice(-5) })
    const additionalResistance = additionalResistanceCard!.item!.equip!.ability!.affinities.find(x => x.affinity.affinity_id.endsWith('41e89'))!
    const additionalResistanceCriteria = parseCardSearchQuery({ are: additionalResistance.affinity.affinity_id.slice(-5) })

    expect(searchCards([cardTypeCard!], cardTypeCriteria)).toEqual([cardTypeCard])
    expect(searchCards([factionCard!], factionCriteria)).toEqual([factionCard])
    expect(searchCards([raceCard!], raceCriteria)).toEqual([raceCard])
    expect(searchCards([resistanceCard!], resistanceCriteria)).toEqual([resistanceCard])
    expect(searchCards([additionalResistanceCard!], additionalResistanceCriteria)).toEqual([additionalResistanceCard])
  })

  it('re/areは名称・categoryだけでは一致しない', () => {
    const source = getSourceCards().map(item => item.card)
    const resistanceCard = source.find(card => card.unit?.ability?.affinities.some(x => x.affinity.affinity_id.endsWith('41e89')))
    const additionalResistanceCard = source.find(card => card.item?.equip?.ability?.affinities.some(x => x.affinity.affinity_id.endsWith('41e89')))
    expect(resistanceCard).toBeDefined()
    expect(additionalResistanceCard).toBeDefined()

    const resistance = resistanceCard!.unit!.ability!.affinities.find(x => x.affinity.affinity_id.endsWith('41e89'))!
    const additionalResistance = additionalResistanceCard!.item!.equip!.ability!.affinities.find(x => x.affinity.affinity_id.endsWith('41e89'))!
    const fallbackValues = [resistance.affinity.damage_source_name, resistance.affinity.damage_attribute_name, resistance.affinity.affinity_category_code].filter(Boolean)
    const additionalFallbackValues = [additionalResistance.affinity.damage_source_name, additionalResistance.affinity.damage_attribute_name, additionalResistance.affinity.affinity_category_code].filter(Boolean)

    for (const value of fallbackValues) {
      const criteria = createSearchForm(); criteria.resistances = [value]
      expect(searchCards([resistanceCard!], criteria)).toEqual([])
    }
    for (const value of additionalFallbackValues) {
      const criteria = createSearchForm(); criteria.additionalResistances = [value]
      expect(searchCards([additionalResistanceCard!], criteria)).toEqual([])
    }
  })

  it.each(cardSearchParityQueries)('$name を入力変更なしで評価する', ({ query }) => {
    const criteria = parseCardSearchQuery(query)
    const snapshot = structuredClone(criteria)
    const result = searchCards(getSourceCards().map(item => item.card), criteria)
    expect(result.every(card => typeof card.card_id === 'string')).toBe(true)
    expect(criteria).toEqual(snapshot)
  })
  it('条件なしでは全件を返す', () => {
    const source = getSourceCards()
    expect(searchCards(source.map(item => item.card), parseCardSearchQuery({}))).toHaveLength(source.length)
  })

  describe('kw catalog契約', () => {
    it.each(catalogOracle.realCases.filter(example => 'kw' in example.query && !('att' in example.query)))('$idの実データ全IDを固定oracleと比較する', example => {
      expect(searchCards(historicalSources().map(source => source.card), parseFixtureQuery(example.query)).map(card => card.card_id)).toEqual(example.ids)
    })
    it.each(catalogOracle.fixtureCases.filter(example => 'kw' in example.query && !('att' in example.query)))('$idはcatalogだけを検索する', example => {
      expect(searchCards(makeCatalogCards(), parseFixtureQuery(example.query)).map(card => card.card_id)).toEqual(example.ids)
    })
    it.each(catalogOracle.boundaries)('$idの欠測・literal・N₀境界', example => {
      const card = structuredClone(getSourceCards()[0]!.card)
      card.card_id = 'boundary'
      card.name = example.query ?? '表示原文'
      card.search_support.full_text = example.target
      expect(searchCards([card], parseCardSearchQuery(example.query === undefined ? {} : { kw: example.query })).map(card => card.card_id)).toEqual(example.ids)
    })
    it('JSON全文や表示情報を検索対象として代用しない', () => {
      const card = makeCatalogCards()[0]!
      card.card_id = '00000000-0000-0000-0000-000000000000'
      for (const kw of [card.name, card.card_id, 'search_support', '表示種族Ａ', '表示種別Ａ']) {
        expect(searchCards([card], parseCardSearchQuery({ kw }))).toEqual([])
      }
      expect(readFileSync(resolve('server/utils/cardSearch/search.ts'), 'utf8')).not.toContain('JSON.stringify(card)')
    })
  })

  describe('att catalog契約', () => {
    it.each(catalogOracle.realCases.filter(example => 'att' in example.query))('$idの実データ全IDを固定oracleと比較する', example => {
      expect(searchCards(historicalSources().map(source => source.card), parseFixtureQuery(example.query)).map(card => card.card_id)).toEqual(example.ids)
    })
    it.each(catalogOracle.fixtureCases.filter(example => 'att' in example.query))('$idは専用値と表示値を区別する', example => {
      expect(searchCards(makeCatalogCards(), parseFixtureQuery(example.query)).map(card => card.card_id)).toEqual(example.ids)
    })
    it.each(catalogOracle.boundaries)('$idの欠測・literal・N₀境界', example => {
      const card = makeCatalogCards()[0]!
      card.card_id = 'boundary'
      card.name = example.query ?? '表示原文'
      card.unit!.races[0]!.race_name = example.query ?? '表示種族'
      card.card_types[0]!.card_type_name = example.query ?? '表示種別'
      card.search_support.archetype_text = example.target
      expect(searchCards([card], parseCardSearchQuery(example.query === undefined ? {} : { att: example.query })).map(card => card.card_id)).toEqual(example.ids)
    })
    it('Quick Searchのrace-typeからattを経由して専用catalogに到達する', () => {
      const query = buildQuickSearchQuery({ selectedCardPool: 'open', selectedSearchType: 'race-type', searchText: 'archetype-only' })
      expect(searchCards(makeCatalogCards(), parseCardSearchQuery(query)).map(card => card.card_id)).toEqual(['A'])
    })
    it('kw/attと数値・枠・コストをカード単位でANDする', () => {
      const card = makeCatalogCards()[0]!
      card.unit!.attack = 2
      card.unit!.ability!.ability_slots = [{ ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'スペル', slot_count: 1 }]
      card.effects = [{ ...card.effects[0]!, effect_cost_id: 'known', effect_cost_text: '既知コスト', search_cost: { alternatives: [{ costs: [{ type: 'other', value: 'trash', quantity: 1 }] }], has_other_cost: false } }]
      const query = { kw: 'catalog-only', att: 'archetype-only', cc: 'unit', at: 'gte:2', ss: 'fire:1', coe: 'trash:1' }
      expect(searchCards([card], parseCardSearchQuery(query)).map(card => card.card_id)).toEqual(['A'])
      for (const extra of [{ cc: 'spell' }, { at: 'gte:3' }, { ss: 'water:1' }, { coe: 'trash:2' }]) {
        expect(searchCards([card], parseCardSearchQuery({ ...query, ...extra }))).toEqual([])
      }
    })
  })

  it('数値能力の include/exclude は 0 と NULL を区別する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const present = structuredClone(template)
    const zero = structuredClone(template)
    const absent = structuredClone(template)
    present.unit!.ability!.initiative = 2
    zero.unit!.ability!.initiative = 0
    absent.unit!.ability = null

    const include = createSearchForm()
    include.initiative = { filterType: 'include', operator: 'gte', value: null }
    expect(searchCards([present, zero, absent], include)).toHaveLength(2)

    const exclude = createSearchForm()
    exclude.initiative = { filterType: 'exclude', operator: 'gte', value: 2 }
    expect(searchCards([present, zero, absent], exclude)).toHaveLength(1)
    expect(searchCards([present, zero, absent], { ...exclude, initiative: { ...exclude.initiative, value: null } })).toHaveLength(1)
  })

  it('include の Comparison は 0 を評価し、exclude は Comparison を無視する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const zero = structuredClone(template)
    const two = structuredClone(template)
    zero.unit!.ability!.charge = 0
    two.unit!.ability!.charge = 2

    const criteria = createSearchForm()
    criteria.charge = { filterType: 'include', operator: 'gte', value: 0 }
    expect(searchCards([zero, two], criteria)).toHaveLength(2)

    criteria.charge = { filterType: 'exclude', operator: 'gte', value: 999 }
    expect(searchCards([zero, two], criteria)).toHaveLength(0)
  })

  it('Hero Point は is_hero、Level は即時召喚と Comparison を独立評価する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const hero = structuredClone(template)
    const nonHero = structuredClone(template)
    hero.unit!.is_hero = true
    hero.unit!.hero_point = 0
    nonHero.unit!.is_hero = false
    nonHero.unit!.hero_point = null

    const heroCriteria = createSearchForm()
    heroCriteria.heroPoint = { filterType: 'exclude', operator: 'gte', value: 0 }
    expect(searchCards([hero, nonHero], heroCriteria)).toHaveLength(1)

    const levelCriteria = createSearchForm()
    levelCriteria.level = { filterType: 'exclude', operator: 'gte', value: 1 }
    hero.unit!.is_instant_summon = false
    nonHero.unit!.is_instant_summon = true
    expect(searchCards([hero, nonHero], levelCriteria)).toHaveLength(1)
  })

  it('所持枠 none は対象能力の正の数量がない場合だけ一致する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const noSlots = structuredClone(template)
    const zeroSlot = structuredClone(template)
    const positiveSlot = structuredClone(template)
    noSlots.unit!.ability!.ability_slots = []
    zeroSlot.unit!.ability!.ability_slots = [{
      ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 0,
    }]
    positiveSlot.unit!.ability!.ability_slots = [{
      ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1,
    }]
    const criteria = createSearchForm()
    criteria.abilitySpellSlots = { match: 'none', slots: {} }
    expect(searchCards([noSlots, zeroSlot, positiveSlot], criteria)).toEqual([noSlots, zeroSlot])
  })

  it('所持枠の同種複数行を合算せず、各行を個別に判定する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const splitSlots = structuredClone(template)
    const oneLargeRow = structuredClone(template)
    splitSlots.unit!.ability!.ability_slots = [
      { ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1 },
      { ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1 },
    ]
    oneLargeRow.unit!.ability!.ability_slots = [
      { ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 2 },
    ]
    const criteria = createSearchForm()
    criteria.abilitySpellSlots = { match: 'or', slots: { fire: 2 } }
    expect(searchCards([splitSlots, oneLargeRow], criteria)).toEqual([oneLargeRow])
  })

  it('所持枠の or / and は Pairごとの行判定を使う', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.unit?.ability)!
    const fireOnly = structuredClone(template)
    const both = structuredClone(template)
    fireOnly.unit!.ability!.ability_slots = [{
      ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1,
    }]
    both.unit!.ability!.ability_slots = [
      { ability_slot_type_code: 'SpellFire', ability_slot_type_name: '火', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1 },
      { ability_slot_type_code: 'SpellWater', ability_slot_type_name: '水', ability_slot_category_code: 'Spell', ability_slot_category_name: 'Spell', slot_count: 1 },
    ]
    const orCriteria = createSearchForm()
    orCriteria.abilitySpellSlots = { match: 'or', slots: { fire: 1, water: 1 } }
    expect(searchCards([fireOnly, both], orCriteria)).toEqual([fireOnly, both])
    const andCriteria = createSearchForm()
    andCriteria.abilitySpellSlots = { match: 'and', slots: { fire: 1, water: 1 } }
    expect(searchCards([fireOnly, both], andCriteria)).toEqual([both])
  })

  it('Effectの複数Parameterは同一Effectで全条件を満たす場合だけ一致する', () => {
    const source = getSourceCards().map(item => item.card)
    const template = source.find(card => card.effects.length >= 2)!
    const distributed = structuredClone(template)
    const sameEffect = structuredClone(template)

    for (const card of [distributed, sameEffect]) {
      card.effects[0]!.effect_type_code = 'ActionSkill'
      card.effects[0]!.effect_text = '別Effectのテキスト'
      card.effects[1]!.effect_type_code = 'DeclareSkill'
      card.effects[1]!.effect_text = '同一Effectのテキスト'
    }
    sameEffect.effects[1]!.effect_type_code = 'ActionSkill'
    sameEffect.effects[1]!.effect_text = '同一Effectのテキスト'

    const criteria = parseCardSearchQuery({ eft: 'ActionSkill', etx: '同一Effectのテキスト' })

    expect(searchCards([distributed], criteria)).toEqual([])
    expect(searchCards([sameEffect], criteria)).toEqual([sameEffect])

    const reportedCard = source.find(card => card.reference_label === 'M20A-016')!
    const reportedCriteria = parseCardSearchQuery({ eft: 'ActionSkill', etx: '自軍プレイヤーは1Dする。' })
    expect(searchCards([reportedCard], reportedCriteria)).toEqual([])
  })

  it.each([
    ['eft + eat', { eft: 'ActionSkill', eat: 'bbbbb' }],
    ['eft + eac', { eft: 'ActionSkill', eac: 'Battle' }],
    ['eft + etx', { eft: 'ActionSkill', etx: '分散条件のテキスト' }],
    ['eat + eac', { eat: 'aaaaa', eac: 'Battle' }],
    ['eat + etx', { eat: 'aaaaa', etx: '分散条件のテキスト' }],
    ['eac + etx', { eac: 'Field', etx: '分散条件のテキスト' }],
  ] as const)('Effectの%sが異なるEffectに分散している場合は非ヒットにする', (_name, query) => {
    const source = getSourceCards().map(item => item.card)
    const card = structuredClone(source.find(value => value.effects.length >= 2)!)
    card.effects[0]!.effect_type_code = 'ActionSkill'
    card.effects[0]!.effect_activation_type_id = '019d81a0-7987-75eb-9d86-aaaaaaaaaaaa'
    card.effects[0]!.effect_activation_category_code = 'Field'
    card.effects[0]!.effect_text = '別の条件のテキスト'
    card.effects[1]!.effect_type_code = 'DeclareSkill'
    card.effects[1]!.effect_activation_type_id = '019d81a0-7987-75eb-9d86-bbbbbbbbbbbb'
    card.effects[1]!.effect_activation_category_code = 'Battle'
    card.effects[1]!.effect_text = '分散条件のテキスト'

    expect(searchCards([card], parseCardSearchQuery(query))).toEqual([])
  })

  it('Effectの3条件以上は同一Effectならヒットし、分散していれば非ヒットにする', () => {
    const source = getSourceCards().map(item => item.card)
    const sameEffect = structuredClone(source.find(value => value.effects.length >= 2)!)
    const distributed = structuredClone(sameEffect)
    const configure = (card: typeof sameEffect, text0: string, text1: string) => {
      card.effects[0]!.effect_type_code = 'ActionSkill'
      card.effects[0]!.effect_activation_type_id = '019d81a0-7987-75eb-9d86-aaaaaaaaaaaa'
      card.effects[0]!.effect_activation_category_code = 'Field'
      card.effects[0]!.effect_text = text0
      card.effects[1]!.effect_type_code = 'DeclareSkill'
      card.effects[1]!.effect_activation_type_id = '019d81a0-7987-75eb-9d86-bbbbbbbbbbbb'
      card.effects[1]!.effect_activation_category_code = 'Battle'
      card.effects[1]!.effect_text = text1
    }
    configure(sameEffect, '同一Effectの全条件', '別Effectのテキスト')
    configure(distributed, '別Effectのテキスト', '同一Effectの全条件')

    const query = { eft: 'ActionSkill', eat: 'aaaaa', eac: 'Field', etx: '同一Effectの全条件' }
    expect(searchCards([sameEffect], parseCardSearchQuery(query))).toEqual([sameEffect])
    expect(searchCards([distributed], parseCardSearchQuery(query))).toEqual([])
  })

  it.each([
    ['ＡＬＬ', 'M20A-010'], ['＋２', 'M20A-007'], ['１Ｄ', 'M20A-016'], ['弱点:ALL', 'M20A-010'],
  ] as const)('QDSの幅正規化により%sは実データ%sへ一致する', (query, referenceLabel) => {
    const cards = historicalSources().map(item => item.card)

    expect(searchCards(cards, parseCardSearchQuery({ etx: query })).some(card => card.reference_label === referenceLabel)).toBe(true)
  })

  it('QDSの半角カナ、濁点、全角空白を正規化する', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.effects = [{ ...card.effects[0]!, effect_text: 'ガード ＡＢＣ' }]

    expect(searchCards([card], parseCardSearchQuery({ etx: 'ｶﾞｰﾄﾞ　ａｂｃ' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ etx: 'カ\u3099ード ＡＢＣ' }))).toEqual([card])
  })

  it('QDSで指定されていないLatin文字のcanonical compositionは行わない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.effects = [{ ...card.effects[0]!, effect_text: 'é' }]

    expect(searchCards([card], parseCardSearchQuery({ etx: 'e\u0301' }))).toEqual([])
  })

  it('QDSが同一視しない文字は正規化で一致させない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.effects = [{ ...card.effects[0]!, effect_text: '① Ⅰ ひらがな' }]

    expect(searchCards([card], parseCardSearchQuery({ etx: '1' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ etx: 'I' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ etx: 'カタカナ' }))).toEqual([])
  })

  it('eftとeacの各CollectionはORで、本文・Short UUID・コストも同一Effectで満たす', () => {
    const effect: Card['effects'][number] = {
      ...ordinaryEffect,
      effect_type_code: 'DeclareSkill',
      effect_activation_category_code: 'Field',
      effect_activation_type_id: '019d81a0-7987-75eb-9d86-aaaaaaaaaaaa',
      effect_text: '同一Effectの本文',
      effect_cost_id: 'known',
      effect_cost_text: 'コスト',
      search_cost: { alternatives: [{ costs: [{ type: 'other', value: 'trash', quantity: 1 }] }], has_other_cost: false },
    }
    const matching = makeCard({ effects: [effect] })
    const distributed = makeCard({ effects: [{ ...effect, search_cost: null }, { ...textEffect, search_cost: effect.search_cost }] })
    const criteria = parseCardSearchQuery({ eft: 'ActionSkill,DeclareSkill', eac: 'Battle,Field', eat: 'AAAAA', etx: '同一Effectの本文', coe: 'trash:1' })
    expect(searchCards([matching, distributed], criteria)).toEqual([matching])
  })
})
