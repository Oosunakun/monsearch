import { describe, expect, it } from 'vitest'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { cardSearchParityQueries } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { getSourceCards } from './dataSource'
import { searchCards } from './search'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'

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

  it('同一Effect Parameter内の複数Collection値はORのまま一致する', () => {
    const source = getSourceCards().map(item => item.card)
    const card = structuredClone(source.find(value => value.effects.length >= 2)!)
    card.effects[0]!.effect_type_code = 'ActionSkill'
    card.effects[1]!.effect_type_code = 'DeclareSkill'

    const criteria = parseCardSearchQuery({ eft: 'ActionSkill,DeclareSkill' })

    expect(searchCards([card], criteria)).toEqual([card])
  })
})
