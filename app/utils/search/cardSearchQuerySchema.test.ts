import { describe, expect, it } from 'vitest'
import {
  SHORT_UUID_LENGTH, canonicalizeShortUuid, normalizeShortUuidCollection,
} from './cardSearchQuerySchema'
import { cardTypeItems, effectActivationTypeItems, factionItems, illustratorItems, productItems, raceItems, resistanceItems } from '~~/app/utils/constants/search/items'

describe('Short UUID schema', () => {
  it('accepts exactly five ASCII hexadecimal characters and canonicalizes case', () => {
    expect(SHORT_UUID_LENGTH).toBe(5)
    expect(canonicalizeShortUuid(' 22D7E ')).toBe('22d7e')
    expect(canonicalizeShortUuid('abcde')).toBe('abcde')
  })

  it.each(['', 'abcd', 'abcdef', '１２３４５', '12-45', 'あいうえお'])('rejects invalid value %s', value => {
    expect(canonicalizeShortUuid(value)).toBeUndefined()
  })

  it('normalizes a collection without consulting master data', () => {
    expect(normalizeShortUuidCollection(['22D7E,abcde', '22d7e', 'fffff'])).toEqual(['22d7e', 'abcde', 'fffff'])
    expect(normalizeShortUuidCollection(['22D7E,abcde', '22d7e', 'fffff'], true)).toEqual(['22d7e', 'abcde', 'fffff'])
  })

  it('keeps all target parameter data aligned with the centralized length', () => {
    const datasets = [cardTypeItems, productItems, factionItems, raceItems, effectActivationTypeItems, resistanceItems, illustratorItems]
    const values = datasets.flat().map(item => item.value)
    expect(values.every(value => value.length === SHORT_UUID_LENGTH)).toBe(true)
    expect(values.every(value => canonicalizeShortUuid(value) !== undefined)).toBe(true)
  })
})
