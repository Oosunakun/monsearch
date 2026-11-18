import { describe, expect, it } from 'vitest'
import { formatBuildInfo } from './formatBuildInfo'

describe('ビルド情報のJST表示', () => {
  it.each([
    ['2026-11-18T14:41:04.123Z', '2026-11-18 23:41:04'],
    ['2026-11-18T15:00:00.000Z', '2026-11-19 00:00:00'],
    ['2026-01-31T15:01:02.000Z', '2026-02-01 00:01:02'],
    ['2026-12-31T15:00:00.000Z', '2027-01-01 00:00:00'],
    ['2024-02-28T15:00:00.000Z', '2024-02-29 00:00:00'],
  ])('%sを固定形式で表示する', (builtAtUtc, expected) => {
    expect(formatBuildInfo({ version: 'v1.0.0', commitSha: 'd7a6bcd' + 'a'.repeat(33), builtAtUtc })).toEqual({
      release: 'v1.0.0 (d7a6bcd)', build: `Build: ${expected} JST`,
    })
  })
})
