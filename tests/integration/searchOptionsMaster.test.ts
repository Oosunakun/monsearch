// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { productOptions, homeRows, restrictionRows } from '../fixtures/searchOptions/products'
import { validateOptions, validateProductRows } from '../helpers/masterDataValidation'
import { cardTypeItems, productItems, factionItems, raceItems, illustratorItems, effectActivationTypeItems, resistanceItems } from '~~/app/utils/constants/search/items'
import { mockProductSources } from '~~/app/utils/mockData/indexPage'
import { mockRestrictionAvailableProductSources } from '~~/app/utils/mockData/restrictions'
import { buildProductSearchLocation } from '~~/app/utils/search/productSearchLocation'
import * as itemDatasets from '~~/app/utils/constants/search/items'

describe('選択肢・公開商品行の整合性', () => {
  it('数値候補・固定語彙の型を検査し観測件数や順序は固定しない', () => {
    for (const options of Object.values(itemDatasets)) for (const option of options) {
      expect(typeof option.label).toBe('string')
      expect(['string', 'number']).toContain(typeof option.value)
      if (typeof option.value === 'number') expect(Number.isFinite(option.value)).toBe(true)
    }
  })
  it('最新のUUID7群と両画面の全公開行を検査する', () => {
    for (const [name, options] of Object.entries({ cardTypeItems, productItems, factionItems, raceItems, illustratorItems, effectActivationTypeItems, resistanceItems })) {
      expect(validateOptions(options, true, `app/utils/constants/search/items/${name}.json`).issues).toEqual([])
    }
    for (const rows of [mockProductSources, mockRestrictionAvailableProductSources]) {
      expect(validateProductRows(rows, productItems, rows === mockProductSources ? 'indexPage.ts:mockProductSources' : 'restrictions.ts:mockRestrictionAvailableProductSources').issues).toEqual([])
      for (const row of rows) expect(buildProductSearchLocation(row.searchValue)).toEqual({ path: '/cards', query: { pd: row.searchValue } })
    }
    for (const row of mockProductSources) {
      const common = mockRestrictionAvailableProductSources.find(other => other.searchValue === row.searchValue)
      if (common) expect(buildProductSearchLocation(row.searchValue)).toEqual(buildProductSearchLocation(common.searchValue))
    }
  })
  it('未使用選択肢と片側だけの行を許容し全行を検査する', () => {
    expect(validateOptions(productOptions, true).issues).toEqual([])
    expect(validateProductRows(homeRows, productOptions).issues).toEqual([])
    expect(validateProductRows(restrictionRows, productOptions).issues).toEqual([])
    expect(validateProductRows([], productOptions).issues).toEqual([])
  })
  it('参照先だけを削除した場合はmembershipで除外せず失敗する', () => {
    const issues = validateProductRows(homeRows, productOptions.filter(option => option.value !== '22d7e')).issues
    expect(issues).toEqual(expect.arrayContaining([expect.objectContaining({ ruleId: 'C08', recordId: 'common', fieldPath: '[0].searchValue' })]))
  })
  it('重複行IDを検出し、商品名の一致を要求しない', () => {
    expect(validateProductRows([homeRows[0], homeRows[0]], productOptions).issues.some(issue => issue.ruleId === 'C08')).toBe(true)
    expect(validateProductRows(homeRows.map(row => ({ ...row, productName: '省略名' })), productOptions).issues).toEqual([])
  })
  it.each([{ label: '不正', value: '１２３４５', color: '' }, { label: 1, value: 'abcde', color: '' }])('不適合option %jを検出する', value => {
    expect(validateOptions([value], true).issues.some(issue => issue.ruleId === 'C07')).toBe(true)
  })
})
