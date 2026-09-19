import { describe, expect, it } from 'vitest'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { cardSearchParityQueries } from '~~/app/utils/search/cardSearchQueryTestFixtures'
import { getSourceCards } from './dataSource'
import { searchCards } from './search'
import { createSearchForm } from '~~/app/utils/search/cardSearchFormFactory'

describe('searchCards', () => {
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
})
