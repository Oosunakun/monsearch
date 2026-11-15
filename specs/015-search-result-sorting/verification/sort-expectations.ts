import expected from './expected-sort-results.json'
import baseline from '~~/specs/014-search-catalog-normalization/verification/baseline.json'
import type { CardSearchSortKey, CardSearchSortOrder, CardSearchResultItem } from '~~/shared/cardSearch/types'

export const projected: Record<string, Pick<CardSearchResultItem, 'rarity_code'>> = baseline.projectedItems
const rarity = ['Unknown', 'Basic', 'Common', 'Uncommon', 'Rare', 'SuperRare', 'Special', 'DragonJr', 'Promotion', 'Summoner']
const sourceIds = baseline.classifications.map(row => row.card_id)
export const expectedIds = (key: CardSearchSortKey, order: CardSearchSortOrder, ids: readonly string[] = sourceIds): string[] => {
  const allowed = new Set(ids)
  if (key !== 'id' && key !== 'rarity') return expected[key][order].filter(id => allowed.has(id))
  // 不変項目は旧oracleの値を使う。収録順を入力にすることで同値順を保つ。
  return sourceIds.filter(id => allowed.has(id)).sort((a, b) => {
    const delta = key === 'id' ? a.localeCompare(b) : rarity.indexOf(projected[a]!.rarity_code) - rarity.indexOf(projected[b]!.rarity_code)
    return delta * (order === 'asc' ? 1 : -1)
  })
}

export const revisedAtkPageIds = (query: string, ids: readonly string[]) => {
  const params = new URLSearchParams(query)
  const order = params.get('order') === 'desc' ? 'desc' : 'asc'
  const sorted = expectedIds('atk', order, ids)
  const perPage = Number(params.get('perPage') ?? 20)
  const rawPage = Number(params.get('page') ?? 1)
  const page = Math.min(Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1, Math.max(1, Math.ceil(ids.length / perPage)))
  return sorted.slice((page - 1) * perPage, page * perPage)
}
