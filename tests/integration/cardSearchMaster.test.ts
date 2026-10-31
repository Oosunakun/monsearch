// @vitest-environment node
import { describe, expect, it } from 'vitest'
import file from '~~/app/utils/mockData/items/cards.json'
import { smallFile, makeCard, textEffect } from '../fixtures/cardSearch/cards'
import { validateCards } from '../helpers/masterDataValidation'

describe('最新カードマスターと検査器の正負例', () => {
  it('最新全件の既存契約を検査し件数・本文を固定しない', () => {
    const report = validateCards(file)
    expect(report.issues).toEqual([])
    expect(report.recordCount).toBe(file.cards.length)
  })

  it.each([
    ['C01', () => ({ cards: [] })],
    ['C02', () => ({ ...smallFile(), cards: [makeCard({ name: '' })] })],
    ['C03', () => ({ ...smallFile(), cards: [makeCard(), makeCard()] })],
    ['C03', () => ({ ...smallFile(), cards: [{ ...makeCard(), product: { product_name: 'ID欠損' } }] })],
    ['C04', () => ({ ...smallFile(), cards: [makeCard({ search_support: { is_token: false, full_text: 'Ａ', archetype_text: '' } })] })],
    ['C04', () => ({ ...smallFile(), cards: [makeCard({ search_support: { is_token: false } })] })],
    ['C05', () => ({ ...smallFile(), cards: [{ ...makeCard(), effects: 'invalid' }] })],
    ['C06', () => ({ ...smallFile(), cards: [makeCard({ effects: [{ ...textEffect, effect_cost_text: '不明コスト' }] })] })],
  ] as const)('%s違反を対象fieldとともに診断する', (rule, input) => {
    const issues = validateCards(input()).issues
    expect(issues.some(issue => issue.ruleId === rule)).toBe(true)
    expect(issues.every(issue => issue.dataset && issue.fieldPath && issue.reason && issue.basis)).toBe(true)
  })

  it.each([
    { quantity: 0 }, { quantity: -1 }, { quantity: 1.5 },
    { min: 3, max: 2 }, { min: 0, max: 2 }, { min: 1 }, { quantity: 1, min: 1, max: 2 },
  ])('不正な数量・range %jを検出する', invalid => {
    const data = smallFile()
    const card = { ...makeCard(), effects: [{ ...textEffect, search_cost: { alternatives: [{ costs: [{ type: 'spell', value: 'any', ...invalid }] }], has_other_cost: false } }] }
    expect(validateCards({ ...data, cards: [card] }).issues.some(issue => issue.ruleId === 'C06')).toBe(true)
  })

  it('空catalog・空/null効果属性・既知cost-free・any rangeは許容する', () => {
    const data = smallFile()
    data.cards[0]!.search_support = { full_text: '', archetype_text: '', is_token: false }
    data.cards[0]!.effects = [textEffect, { ...textEffect, search_cost: { alternatives: [{ costs: [{ type: 'spell', value: 'any', min: 1, max: 3 }] }], has_other_cost: false } }]
    const report = validateCards(data)
    expect(report.issues).toEqual([])
    expect(report.emptyCatalogCount).toBe(2)
  })
})
