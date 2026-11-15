import { describe, expect, it } from 'vitest'
import { makeCard, displayCard } from '~~/tests/fixtures/cardSearch/cards'
import { projectCard } from './project'
import type { CardModification } from '~~/types/cards/finderCards'

describe('projectCard', () => {
  it('手書き独立期待値と完全DTOを比較する', () => { expect(projectCard(makeCard())).toEqual(displayCard()) })
  it.each(['', '  自軍ユニットが存在する場合。\n〔追加の使用条件〕  '])('使用条件の原文を変更せず投影する (%j)', condition => {
    const source = makeCard()
    source.effects[0]!.effect_condition_text = condition
    const before = structuredClone(source)
    expect(projectCard(source)?.effects[0]?.effect_condition_text).toBe(condition)
    expect(source).toEqual(before)
  })
  const cases: Array<[CardModification | null, number | null]> = [
    ...[0, 1, 2, 3, 4].map(value => [{ deck_restriction_count: value }, value] as [CardModification, number]),
    [{ deck_restriction_count: null }, null],
    [{ deck_restriction_count: '' }, null],
    [null, null],
  ]
  it.each(cases)('改訂情報 %j を %s として保持・正規化しSourceを変更しない', (modification, expected) => {
    const source = makeCard()
    source.modification = modification
    const before = structuredClone(source)
    const projected = projectCard(source)
    expect(projected).toBeDefined()
    expect(projected).toHaveProperty('deck_restriction_count', expected)
    expect(projected).not.toHaveProperty('modification')
    expect(source).toEqual(before)
  })
  it('表示fieldをcopyし内部metadataを公開しない', () => {
    const source = makeCard()
    const projected = projectCard(source)!
    expect(projected).not.toBe(source)
    expect(projected).not.toHaveProperty('search_support')
    expect(projected).not.toHaveProperty('tags')
    expect(projected).not.toHaveProperty('errata')
    expect(projected).not.toHaveProperty('flavor_text')
    expect(projected.product).toEqual({ product_name: source.product.product_name })
  })
  it('必須fieldが欠けたrecordを除外する', () => {
    const source = makeCard()
    source.name = ''
    expect(projectCard(source)).toBeUndefined()
  })
})
