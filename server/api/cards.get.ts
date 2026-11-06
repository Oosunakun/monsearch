import { getQuery } from 'h3'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'
import { prepareCardSearch, runCardSearch } from '~~/shared/cardSearch/runner'
import type { CardSearchResultPage } from '~~/shared/cardSearch/types'

export default defineEventHandler((event): CardSearchResultPage => {
  try {
    const prepared = prepareCardSearch(getQuery(event))
    return runCardSearch(getSourceCards(), prepared)
  } catch {
    throw createError({ statusCode: 500, message: 'カード検索に失敗しました', data: { statusCode: 500, code: 'CARD_SEARCH_FAILED', message: 'カード検索に失敗しました' } })
  }
})
