import { describe, expect, it } from 'vitest'
import { extractBuildInfo, verifyBuildInfoArtifact } from './verify-build-info-artifact.mjs'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const info = { version: 'v1.0.0', commitSha: 'a'.repeat(40), builtAtUtc: '2026-11-18T14:41:04.000Z' }
const html = (value: unknown) => `<script>window.__NUXT__={config:{public:{buildInfo:${JSON.stringify(value)}}}}</script>`
describe('静的公開buildInfo監査', () => {
  it('Nuxtの公開configから3値を抽出する', () => expect(extractBuildInfo(html(info))).toEqual(info))
  it.each([undefined, { ...info, commitSha: '' }, { ...info, builtAtUtc: 'invalid' }, { ...info, branch: 'main' }])('欠落・不正を拒否する', value => {
    expect(() => extractBuildInfo(html(value))).toThrow()
  })
  it('ページ間の日時差異を検出する', () => {
    const directory = mkdtempSync(join(tmpdir(), 'monsearch-build-info-'))
    try {
      writeFileSync(join(directory, 'a.html'), html(info))
      writeFileSync(join(directory, 'b.html'), html({ ...info, builtAtUtc: '2026-11-18T14:41:05.000Z' }))
      expect(() => verifyBuildInfoArtifact(directory, ['a.html', 'b.html'])).toThrow('不一致')
    } finally {
      rmSync(directory, { recursive: true })
    }
  })
})
