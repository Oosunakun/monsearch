import { describe, expect, it } from 'vitest'
import { getSourceCards } from './dataSource'
import { projectCard } from './project'

describe('projectCard', () => {
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
