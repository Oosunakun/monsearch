import { getQuery } from 'h3'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { matchesCardSearch } from '~~/server/utils/cardSearch/search'
import { sortSourceCards } from '~~/server/utils/cardSearch/sort'
import { paginate } from '~~/server/utils/cardSearch/paginate'
import { projectCards } from '~~/server/utils/cardSearch/project'
import { CARD_SEARCH_PER_PAGE, CARD_SEARCH_SORT_KEYS, CARD_SEARCH_SORT_ORDERS } from '~~/server/types/cardSearch'
import type { CardSearchPerPage, CardSearchResultPage, CardSearchSortKey, CardSearchSortOrder } from '~~/server/types/cardSearch'

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

export default defineEventHandler((event): CardSearchResultPage => {
  try {
    const query = getQuery(event)
    const locationQuery = Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string | string[]] => typeof entry[1] === 'string' || (Array.isArray(entry[1]) && entry[1].every(value => typeof value === 'string'))))
    const criteria = parseCardSearchQuery(locationQuery)
    const page = positiveInteger(lastString(query.page), 1)
    const perPage = member(lastString(query.perPage), CARD_SEARCH_PER_PAGE.map(String), '20')
    const sort = member(lastString(query.sort), CARD_SEARCH_SORT_KEYS, 'id') as CardSearchSortKey
    const order = member(lastString(query.order), CARD_SEARCH_SORT_ORDERS, 'asc') as CardSearchSortOrder
    const matched = getSourceCards().filter(source => matchesCardSearch(source.card, criteria))
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
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'カード検索に失敗しました', data: { statusCode: 500, code: 'CARD_SEARCH_FAILED', message: 'カード検索に失敗しました' } })
  }
})
