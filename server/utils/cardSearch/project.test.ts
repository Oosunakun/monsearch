import { describe, expect, it } from 'vitest'
import { getSourceCards } from './dataSource'
import { projectCard } from './project'
import type { CardModification } from '~~/types/cards/finderCards'

describe('projectCard', () => {
  const cases: Array<[CardModification | null, number | null]> = [
    ...[0, 1, 2, 3, 4].map(value => [{ deck_restriction_count: value }, value] as [CardModification, number]),
    [{ deck_restriction_count: null }, null],
    [{ deck_restriction_count: '' }, null],
    [null, null],
  ]
  it.each(cases)('改訂情報 %j を %s として保持・正規化しSourceを変更しない', (modification, expected) => {
    const source = structuredClone(getSourceCards()[0]!.card)
    source.modification = modification
    const before = structuredClone(source)
    const projected = projectCard(source)
    expect(projected).toBeDefined()
    expect(projected).toHaveProperty('deck_restriction_count', expected)
    expect(projected).not.toHaveProperty('modification')
    expect(source).toEqual(before)
  })
  it('表示fieldをcopyし内部metadataを公開しない', () => {
    const source = getSourceCards()[0]!.card
    const projected = projectCard(source)!
    expect(projected).not.toBe(source)
    expect(projected).not.toHaveProperty('search_support')
    expect(projected).not.toHaveProperty('tags')
    expect(projected).not.toHaveProperty('errata')
    expect(projected).not.toHaveProperty('flavor_text')
    expect(projected.product).toEqual({ product_name: source.product.product_name })
  })
  it('必須fieldが欠けたrecordを除外する', () => {
    const source = structuredClone(getSourceCards()[0]!.card)
    source.name = ''
    expect(projectCard(source)).toBeUndefined()
  })
})
