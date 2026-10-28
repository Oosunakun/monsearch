import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { createCardSearchMatcher } from './search'
import { sortSourceCards } from './sort'
import { paginate } from './paginate'
import { projectCards } from './project'
import { CARD_SEARCH_PER_PAGE, CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS } from './types'
import type { CardSearchPerPage, CardSearchResultPage, CardSearchSortKey, CardSearchSortOrder, SourceCard } from './types'

const lastString = (value: unknown) => {
  const candidate = Array.isArray(value) ? value.at(-1) : value
  return typeof candidate === 'string' ? candidate : undefined
}
const positiveInteger = (value: string | undefined, fallback: number) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}
const member = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T =>
  value && (allowed as readonly string[]).includes(value) ? value as T : fallback

export const prepareCardSearch = (query: Record<string, unknown>) => {
  const locationQuery = Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string | string[]] => typeof entry[1] === 'string' || (Array.isArray(entry[1]) && entry[1].every(value => typeof value === 'string'))))
  const criteria = parseCardSearchQuery(locationQuery)
  const page = positiveInteger(lastString(query.page), 1)
  const perPage = member(lastString(query.perPage), CARD_SEARCH_PER_PAGE.map(String), '20')
  const sort = member(lastString(query.sort), CARD_SEARCH_SORT_KEYS, 'id') as CardSearchSortKey
  const order = member(lastString(query.order), CARD_SEARCH_SORT_ORDERS, 'asc') as CardSearchSortOrder
  const matches = createCardSearchMatcher(criteria)
  return { page, perPage, sort, order, matches }
}

export const runCardSearch = (sources: readonly SourceCard[], prepared: ReturnType<typeof prepareCardSearch>): CardSearchResultPage => {
  const { page, perPage, sort, order, matches } = prepared
  const matched = sources.filter(source => matches(source.card))
  const sorted = sortSourceCards(matched, sort, order)
  const pagination = paginate(sorted, page, Number(perPage))
  const categoryCounts = new Map<string, number>()
  for (const source of matched) categoryCounts.set(source.card.card_category_code, (categoryCounts.get(source.card.card_category_code) ?? 0) + 1)
  return {
    items: projectCards(pagination.items.map(source => source.card)), totalCount: matched.length,
    page: pagination.page, perPage: Number(perPage) as CardSearchPerPage, totalPages: pagination.totalPages,
    sort: { key: sort, order },
    categoryBreakdown: [...categoryCounts].map(([categoryCode, count]) => ({ categoryCode, count })),
  }
}
