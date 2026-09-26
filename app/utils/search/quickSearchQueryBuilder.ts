import type { QuickSearchState, QuickSearchTarget } from '~~/app/types/ui/layout'
import type { LogicalCardSearchQuery } from '~~/app/types/ui/search'

export type CanonicalQuickSearchQuery = Pick<LogicalCardSearchQuery, 'nm' | 'att' | 'kw'>

const TARGET_TO_ALIAS = {
  name: 'nm',
  'race-type': 'att',
  keyword: 'kw',
} as const satisfies Readonly<Record<QuickSearchTarget, keyof CanonicalQuickSearchQuery>>

const isQuickSearchTarget = (value: unknown): value is QuickSearchTarget =>
  typeof value === 'string' && Object.hasOwn(TARGET_TO_ALIAS, value)

export const buildQuickSearchQuery = (state: Readonly<QuickSearchState>): CanonicalQuickSearchQuery => {
  if (!isQuickSearchTarget(state.selectedSearchType) || typeof state.searchText !== 'string') return {}

  const value = state.searchText.trim()
  if (!value) return {}

  return { [TARGET_TO_ALIAS[state.selectedSearchType]]: value }
}
