import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getSourceCards } from '~~/server/utils/cardSearch/dataSource'

const file = () => ({ version: 'test', generated_at: '2026-10-26', cards: getSourceCards().map(source => source.card) })
let load: typeof import('./cardSearchDataset').loadCardSearchDataset
const fetchMock = vi.fn()

beforeEach(async () => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  load = (await import('./cardSearchDataset')).loadCardSearchDataset
})
afterEach(() => vi.unstubAllGlobals())

describe('document内の静的JSON loader', () => {
  it('並行loadと後続loadでJSONを1回だけ取得、元順を維持する', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(file())))
    const first = load(), second = load()
    expect(second).toBe(first)
    const sources = await first
    expect(await load()).toBe(sources)
    expect(sources).toHaveLength(482)
    expect(sources.map(source => source.sourceIndex)).toEqual(Array.from({ length: 482 }, (_, i) => i))
    expect(sources.map(source => source.card.card_id)).toEqual(getSourceCards().map(source => source.card.card_id))
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/data/cards.json', { cache: 'no-cache' })
  })
  it.each(['network', 'http', 'html', 'schema', 'card'])('%s失敗を隠さず、次回retryで再取得する', async kind => {
    if (kind === 'network') fetchMock.mockRejectedValueOnce(new Error('offline'))
    else if (kind === 'http') fetchMock.mockResolvedValueOnce(new Response('error', { status: 500 }))
    else if (kind === 'html') fetchMock.mockResolvedValueOnce(new Response('<html>Access</html>'))
    else if (kind === 'schema') fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ cards: [] })))
    else fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ...file(), cards: [{}] })))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(file())))
    await expect(load()).rejects.toBeDefined()
    expect(await load()).toHaveLength(482)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls.every(call => call[0] === '/data/cards.json')).toBe(true)
  })
})
