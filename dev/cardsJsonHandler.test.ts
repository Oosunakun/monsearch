import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { createApp, defineEventHandler, toWebHandler } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCardsJsonHandler } from './cardsJsonHandler'

// 既存APIテストと同じrepository cwd。実配信はconfig側のimport.meta.urlで固定する。
const sourcePath = resolve('app/utils/mockData/items/cards.json')
let readFileMock: ReturnType<typeof vi.spyOn<typeof fs, 'readFile'>>
const sha = (body: Uint8Array) => createHash('sha256').update(body).digest('hex')
const app = () => toWebHandler(createApp()
  .use('/data/cards.json', createCardsJsonHandler(sourcePath))
  .use(defineEventHandler(() => 'next handler')))

beforeEach(() => { readFileMock = vi.spyOn(fs, 'readFile') })
afterEach(() => vi.restoreAllMocks())

describe('開発専用cards.json配信', () => {
  it.each(['/data/cards.json', '/data/cards.json?cache=ignored'])('%sを正本のbytesで返す', async (path) => {
    const expected = await fs.readFile(sourcePath)
    readFileMock.mockClear()
    const response = await app()(new Request(`http://localhost${path}`))
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8')
    expect(response.headers.get('cache-control')).toBe('no-cache')
    const body = Buffer.from(await response.arrayBuffer())
    expect(body.equals(expected)).toBe(true)
    expect(sha(body)).toBe(sha(expected))
    expect(readFileMock).toHaveBeenCalledExactlyOnceWith(sourcePath)
  })

  it.each(['HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('%sは読み込まず405にする', async (method) => {
    const response = await app()(new Request('http://localhost/data/cards.json', { method }))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET')
    expect(await response.text()).not.toContain('card_id')
    expect(readFileMock).not.toHaveBeenCalled()
  })

  it.each(['/data/cards.json.bak', '/data/cards.json/extra', '/data/cards.json/', '/data/other.json'])('%sへカードを配信しない', async (path) => {
    const response = await app()(new Request(`http://localhost${path}`))
    expect(await response.text()).toBe('next handler')
    expect(readFileMock).not.toHaveBeenCalled()
  })

  it('読込失敗は500とし、同じhandlerで次のGET時に回復する', async () => {
    readFileMock.mockRejectedValueOnce(new Error('read failed'))
    const request = app()
    const failed = await request(new Request('http://localhost/data/cards.json'))
    expect(failed.status).toBe(500)
    expect(await failed.text()).not.toContain('card_id')
    const recovered = await request(new Request('http://localhost/data/cards.json'))
    expect(recovered.status).toBe(200)
    expect(Buffer.from(await recovered.arrayBuffer()).equals(await fs.readFile(sourcePath))).toBe(true)
  })

  it('永続cacheを持たず、GETごとに正本を読み込む', async () => {
    const request = app()
    await request(new Request('http://localhost/data/cards.json'))
    await request(new Request('http://localhost/data/cards.json'))
    expect(readFileMock).toHaveBeenCalledTimes(2)
    expect(readFileMock.mock.calls.every(([path]) => path === sourcePath)).toBe(true)
  })
})
