import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuickSearch } from './useQuickSearch'

const push = vi.fn()
const router = { push }

describe('useQuickSearch', () => {
  beforeEach(() => {
    push.mockReset()
    push.mockResolvedValue(undefined)
  })

  it.each([
    ['name', 'nm'],
    ['race-type', 'att'],
    ['keyword', 'kw'],
  ] as const)('navigates %s using %s', async (selectedSearchType, alias) => {
    const { quickSearchState, runQuickSearch } = useQuickSearch(router)
    quickSearchState.value.selectedSearchType = selectedSearchType
    quickSearchState.value.searchText = '  Dragon  '
    await runQuickSearch()
    expect(push).toHaveBeenCalledWith({ path: '/cards', query: { [alias]: 'Dragon' } })
  })

  it('navigates to bare /cards for an empty condition', async () => {
    const { quickSearchState, runQuickSearch } = useQuickSearch(router)
    quickSearchState.value.searchText = '   '
    await runQuickSearch()
    expect(push).toHaveBeenCalledWith({ path: '/cards' })
  })
})
