import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { cardSearchParityQueries } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { getSourceCards } from './dataSource'
import { searchCards } from './search'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'
import { buildQuickSearchQuery } from '~~/app/utils/search/quickSearchQueryBuilder'

describe('searchCards', () => {
  it.each([
    ['circle', 'Basic'], ['triangle', 'Common'], ['rhombus', 'Uncommon'], ['star', 'Rare'],
    ['club', 'SuperRare'], ['spade', 'Special'], ['heart', 'Promotion'], ['crescent', 'DragonJr'], ['hexagram', 'Summoner'],
  ] as const)('rt のNatural Key %sをDatabase code %sへMappingする', (naturalKey, rarityCode) => {
    const source = getSourceCards().map(item => item.card)
    const card = structuredClone(source[0]!)
    card.rarity_code = rarityCode

    expect(searchCards([card], parseCardSearchQuery({ rt: naturalKey }))).toEqual([card])
  })

  it('rt=club はfixtureのSuperRareカードを返す', () => {
    const result = searchCards(getSourceCards().map(item => item.card), parseCardSearchQuery({ rt: 'club' }))

    expect(result.length).toBeGreaterThan(0)
    expect(result.every(card => card.rarity_code === 'SuperRare')).toBe(true)
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

  it('Keywordは実データのユーザー可視情報を検索する', () => {
    const source = getSourceCards().map(item => item.card)
    const nameCard = source.find(card => card.name === 'アーニャ')!
    const effectCard = source.find(card => card.effects.some(effect => effect.effect_text))!
    const elementCard = source.find(card => card.unit?.elements.length || card.spell?.elements.length)!
    const raceCard = source.find(card => card.unit?.races.length)!
    const cardTypeCard = source.find(card => card.card_types.length)!
    const blockCard = source.find(card => card.blocks.length)!
    const factionCard = source.find(card => card.factions.length)!
    const abilitySlotCard = source.find(card => card.unit?.ability?.ability_slots.length || card.item?.equip?.ability?.ability_slots.length)!
    const affinityCard = source.find(card => card.unit?.ability?.affinities.length || card.item?.equip?.ability?.affinities.length)!

    expect(searchCards([nameCard], parseCardSearchQuery({ kw: nameCard.name }))).toEqual([nameCard])
    expect(searchCards([nameCard], parseCardSearchQuery({ kw: nameCard.reference_label }))).toEqual([nameCard])
    expect(searchCards([nameCard], parseCardSearchQuery({ kw: nameCard.rarity_name }))).toEqual([nameCard])
    expect(searchCards([nameCard], parseCardSearchQuery({ kw: nameCard.illustrator_name }))).toEqual([nameCard])
    expect(searchCards([nameCard], parseCardSearchQuery({ kw: nameCard.product.product_name }))).toEqual([nameCard])
    expect(searchCards([effectCard], parseCardSearchQuery({ kw: effectCard.effects.find(effect => effect.effect_text)!.effect_text }))).toEqual([effectCard])
    const elementName = elementCard.unit?.elements[0]?.element_name ?? elementCard.spell!.elements[0]!.element_name
    expect(searchCards([elementCard], parseCardSearchQuery({ kw: elementName }))).toEqual([elementCard])
    expect(searchCards([raceCard], parseCardSearchQuery({ kw: raceCard.unit!.races[0]!.race_name }))).toEqual([raceCard])
    expect(searchCards([cardTypeCard], parseCardSearchQuery({ kw: cardTypeCard.card_types[0]!.card_type_name }))).toEqual([cardTypeCard])
    expect(searchCards([blockCard], parseCardSearchQuery({ kw: blockCard.blocks[0]!.block_name }))).toEqual([blockCard])
    expect(searchCards([factionCard], parseCardSearchQuery({ kw: factionCard.factions[0]!.faction_name }))).toEqual([factionCard])
    const abilitySlot = abilitySlotCard.unit?.ability?.ability_slots[0] ?? abilitySlotCard.item!.equip!.ability!.ability_slots[0]!
    expect(searchCards([abilitySlotCard], parseCardSearchQuery({ kw: abilitySlot.ability_slot_type_name }))).toEqual([abilitySlotCard])
    const affinity = affinityCard.unit?.ability?.affinities[0] ?? affinityCard.item!.equip!.ability!.affinities[0]!
    expect(searchCards([affinityCard], parseCardSearchQuery({ kw: affinity.affinity.affinity_name }))).toEqual([affinityCard])
  })

  it('KeywordはUUID・内部code・JSON property名を検索しない', () => {
    const card = getSourceCards().map(item => item.card)[0]!
    for (const value of [card.card_id, card.card_category_code, 'card_category_code', 'search_support']) {
      expect(searchCards([card], parseCardSearchQuery({ kw: value }))).toEqual([])
    }
  })

  it('KeywordにJSON.stringify fallbackを持たない', () => {
    const source = readFileSync(resolve('server/utils/cardSearch/search.ts'), 'utf8')
    expect(source).not.toContain('JSON.stringify(card)')
  })

  it('KeywordはQDSの限定的な幅・大小・カナ・空白正規化を使う', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.name = 'ガード ＡＢＣ １２'

    expect(searchCards([card], parseCardSearchQuery({ kw: 'ｶﾞｰﾄﾞ　ａｂｃ 12' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'カ\u3099ード ＡＢＣ １２' }))).toEqual([card])
  })

  it('KeywordはQDSが同一視しない文字を一致させない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.reference_label = ''
    card.name = '① Ⅰ ひらがな'
    card.rarity_name = ''
    card.illustrator_name = ''
    card.product.product_name = ''
    card.card_types = []
    card.blocks = []
    card.factions = []
    card.effects = []
    card.summoner = null

    expect(searchCards([card], parseCardSearchQuery({ kw: '1' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'I' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'カタカナ' }))).toEqual([])
  })

  it('Keywordと他条件はANDで評価する', () => {
    const card = getSourceCards().map(item => item.card).find(value => value.name === 'アーニャ')!
    expect(searchCards([card], parseCardSearchQuery({ kw: 'アーニャ', cc: 'summoner' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'アーニャ', cc: 'unit' }))).toEqual([])
  })

  it.each([undefined, '', 'catalog-only', 'card_category_code'] as const)('型で表現可能なfull_text=%sでもKeyword結果へ影響しない', fullText => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.search_support.full_text = fullText
    expect(searchCards([card], parseCardSearchQuery({ kw: card.name }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'search_support' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'catalog-only' }))).toEqual([])
  })

  it('実データのnull full_textでもKeyword結果へ影響しない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    expect(card.search_support.full_text).toBeNull()
    expect(searchCards([card], parseCardSearchQuery({ kw: card.name }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'search_support' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ kw: 'catalog-only' }))).toEqual([])
  })

  it('Keywordはfull_textにだけ存在する語を検索しない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card)[0]!)
    card.search_support.full_text = 'catalog-only'

    expect(searchCards([card], parseCardSearchQuery({ kw: 'catalog-only' }))).toEqual([])
  })

  it('Archetype Textはraceとcard typeの表示名だけを検索する', () => {
    const source = getSourceCards().map(item => item.card)
    const raceCard = source.find(card => card.unit?.races.some(race => race.race_name === 'ドラゴン'))!
    const typeCard = source.find(card => card.card_types.some(cardType => cardType.card_type_name === 'サモナー'))!

    expect(searchCards([raceCard], parseCardSearchQuery({ att: 'ドラゴン' }))).toEqual([raceCard])
    expect(searchCards([typeCard], parseCardSearchQuery({ att: 'サモナー' }))).toEqual([typeCard])
  })

  it('Quick Searchのrace-typeからattを経由してserver matcherへ到達する', () => {
    const card = getSourceCards().map(item => item.card).find(value => value.unit?.races.some(race => race.race_name === 'ドラゴン'))!
    const query = buildQuickSearchQuery({ selectedCardPool: 'open', selectedSearchType: 'race-type', searchText: 'ドラゴン' })

    expect(searchCards([card], parseCardSearchQuery(query))).toEqual([card])
  })

  it('Archetype Textは複数raceのいずれも部分一致し、未知語は非ヒットになる', () => {
    const card = getSourceCards().map(item => item.card).find(value => (value.unit?.races.length ?? 0) >= 2)!
    const races = card.unit!.races

    expect(searchCards([card], parseCardSearchQuery({ att: races[0]!.race_name }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ att: races[1]!.race_name }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ att: '存在しないarchetype' }))).toEqual([])
  })

  it('Archetype TextはQDS正規化を使うが、カード名や内部値へfallbackしない', () => {
    const card = structuredClone(getSourceCards().map(item => item.card).find(value => value.unit?.races.length)!)
    card.card_types = []
    card.unit!.races = [{ ...card.unit!.races[0]!, race_name: 'ガード ＡＢＣ １２' }]

    expect(searchCards([card], parseCardSearchQuery({ att: 'ｶﾞｰﾄﾞ　ａｂｃ 12' }))).toEqual([card])

    card.unit!.races[0]!.race_name = '① Ⅰ ひらがな'
    expect(searchCards([card], parseCardSearchQuery({ att: 'ひらがな' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ att: '1' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'I' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ヒラガナ' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: card.name }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: card.card_id }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'card_category_code' }))).toEqual([])
  })

  it('Archetype Textはrace_idとcard_type_idを検索対象にしない', () => {
    const source = getSourceCards().map(item => item.card)
    const raceCard = source.find(value => value.unit?.races.length)!
    const typeCard = source.find(value => value.card_types.length)!
    const raceId = raceCard.unit!.races[0]!.race_id
    const cardTypeId = typeCard.card_types[0]!.card_type_id

    expect(searchCards([raceCard], parseCardSearchQuery({ att: raceId }))).toEqual([])
    expect(searchCards([raceCard], parseCardSearchQuery({ att: raceId.slice(-5) }))).toEqual([])
    expect(searchCards([typeCard], parseCardSearchQuery({ att: cardTypeId }))).toEqual([])
    expect(searchCards([typeCard], parseCardSearchQuery({ att: cardTypeId.slice(-5) }))).toEqual([])
  })

  it('Archetype Textは検索語全体をliteral substringとして扱う', () => {
    const card = structuredClone(getSourceCards().map(item => item.card).find(value => value.unit?.races.length)!)
    card.card_types = []
    card.unit!.races = [{ ...card.unit!.races[0]!, race_name: 'ドラゴン 強力 パピー' }]

    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン 強力 パピー' }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン パピー' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン.*' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン*' }))).toEqual([])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン パピー 別名' }))).toEqual([])
  })

  it('Archetype Textと既存条件はANDで評価する', () => {
    const card = getSourceCards().map(item => item.card).find(value => value.unit?.races.some(race => race.race_name === 'ドラゴン'))!

    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン', cc: card.card_category_code.toLowerCase() }))).toEqual([card])
    expect(searchCards([card], parseCardSearchQuery({ att: 'ドラゴン', cc: 'spell' }))).toEqual([])
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
    const cards = getSourceCards().map(item => item.card)

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

  it('同一Effect Parameter内の複数Collection値はORのまま一致する', () => {
    const source = getSourceCards().map(item => item.card)
    const card = structuredClone(source.find(value => value.effects.length >= 2)!)
    card.effects[0]!.effect_type_code = 'ActionSkill'
    card.effects[1]!.effect_type_code = 'DeclareSkill'

    const criteria = parseCardSearchQuery({ eft: 'ActionSkill,DeclareSkill' })

    expect(searchCards([card], criteria)).toEqual([card])
  })
})
