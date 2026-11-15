// @vitest-environment node
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import baseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import catalog from '~~/specs/014-search-catalog-normalization/verification/expected-catalog-results.json'
import expected from '~~/specs/015-search-result-sorting/verification/expected-sort-results.json'
import api from '~~/server/api/fixtures/cards-response-baseline.json'
import { projectCard } from '~~/shared/cardSearch/project'
import manifest from './historical/014-015/manifest.json'
import { historicalCards, historicalSources, smallSources } from './sources'
import { makeCard, displayCard } from './cards'

describe('歴史入力と既存Oracleの対応・隔離', () => {
  it('明示入力の完全DTOが手書き独立期待値と一致する', () => {
    expect(projectCard(makeCard())).toEqual(displayCard())
  })
  it('元bytes/hash/件数と全Oracleの参照集合を保全する', () => {
    const bytes = readFileSync(resolve('tests/fixtures/cardSearch/historical/014-015/cards.json'))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest.sha256)
    expect(bytes.length).toBe(2283572)
    const file = JSON.parse(bytes.toString())
    expect(file.version).toBe('1.0.0')
    expect(file.cards).toHaveLength(482)
    const ids = historicalCards().map(card => card.card_id)
    expect(ids).toEqual(baseline.classifications.map(row => row.card_id))
    expect([...ids].sort()).toEqual(Object.keys(baseline.projectedItems).sort())
    expect(manifest.sha256).toBe(baseline.input.sha256)
    expect(manifest.sha256).toBe(catalog.input.sha256)
    expect(manifest.sha256).toBe(api.currentInput.cardsSha256)
    for (const key of Object.values(expected)) for (const idsForOrder of Object.values(key)) {
      expect([...idsForOrder].sort()).toEqual([...ids].sort())
    }
  })

  it('clone変更が原本と次回の入力へ漏れずsourceIndexが入力順になる', () => {
    const sources = historicalSources()
    const originalName = sources[0]!.card.name
    sources[0]!.card.name = '変更'
    expect(historicalSources()[0]!.card.name).toBe(originalName)
    expect(historicalSources().map(row => row.sourceIndex)).toEqual(Array.from({ length: 482 }, (_, i) => i))
    const small = smallSources()
    small[0]!.card.name = '変更'
    expect(smallSources()[0]!.card.name).not.toBe('変更')
  })
})
