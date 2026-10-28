import { describe, expect, it } from 'vitest'
import vectors from './normalizeCatalogText.fixtures.json'
import { normalizeCatalogText } from './normalizeCatalogText'
import { getSourceCards } from './dataSource'

describe('N₀固定vector', () => {
  it.each(vectors)('$idの固定期待変換と冪等性', ({ input, expected }) => {
    expect(normalizeCatalogText(input)).toBe(expected)
    expect(normalizeCatalogText(normalizeCatalogText(input))).toBe(expected)
  })

  it('指定幅対応172文字とASCII大文字26文字を全数網羅する', () => {
    const ranges = [[0xff01, 0xff5e], [0xff61, 0xff9f], [0x3000, 0x3000], [0xffe0, 0xffe6], [0xffe8, 0xffee]]
    const codePoints = ranges.flatMap(([start, end]) => Array.from({ length: end! - start! + 1 }, (_, index) => start! + index))
    expect(codePoints).toHaveLength(172)
    expect(vectors.filter(vector => vector.id.startsWith('width-'))).toHaveLength(172)
    for (const point of codePoints) expect(vectors.some(vector => vector.input === String.fromCodePoint(point))).toBe(true)
    expect(vectors.filter(vector => vector.id.startsWith('ascii-case-'))).toHaveLength(26)
    for (let point = 0x41; point <= 0x5a; point += 1) expect(vectors.some(vector => vector.input === String.fromCodePoint(point))).toBe(true)
  })
})

describe('受領catalog入力契約（正常入力と欠測fixtureは区別する）', () => {
  it('full_textは全482件存在する非空stringでN₀固定点である', () => {
    const cards = getSourceCards().map(source => source.card)
    expect(cards).toHaveLength(482)
    for (const card of cards) {
      expect(Object.hasOwn(card.search_support, 'full_text'), card.card_id).toBe(true)
      const value = card.search_support.full_text
      expect(typeof value, card.card_id).toBe('string')
      expect(value, card.card_id).not.toBe('')
      expect(normalizeCatalogText(value!), card.card_id).toBe(value)
    }
  })
  it('archetype_textは全482件存在する非空stringでN₀固定点である', () => {
    const cards = getSourceCards().map(source => source.card)
    expect(cards).toHaveLength(482)
    for (const card of cards) {
      expect(Object.hasOwn(card.search_support, 'archetype_text'), card.card_id).toBe(true)
      const value = card.search_support.archetype_text
      expect(typeof value, card.card_id).toBe('string')
      expect(value, card.card_id).not.toBe('')
      expect(normalizeCatalogText(value!), card.card_id).toBe(value)
    }
  })
})
