import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createBuildInfo, requireDistributionSha, resolveCommitSha, selectReleaseVersion } from './buildInfo'

const sha = 'a'.repeat(40)
const missing = () => { throw new Error('Git unavailable') }
describe('ビルド情報の取得', () => {
  it('入力順とSemVerに依存せず最大数値IDを選択し原表記と配列を保持する', () => {
    const rows = Object.freeze([Object.freeze({ id: '10', version: 'release-next' }), Object.freeze({ id: '2', version: 'v99.0.0' })])
    expect(selectReleaseVersion(rows)).toBe('release-next')
    expect(selectReleaseVersion([...rows].reverse())).toBe('release-next')
    expect(rows[0]?.id).toBe('10')
  })
  it.each(['', '0', '-1', '1.1', '1e2', ' 1', '9007199254740992', null, true, 1])('不正ID %sを拒否', id => {
    expect(() => selectReleaseVersion([{ id, version: 'v1' }])).toThrow('id')
  })
  it.each(['', ' v1', 'v1 ', 'v1\nx', 'v1\rx', null])('不正version %sを拒否', version => {
    expect(() => selectReleaseVersion([{ id: '1', version }])).toThrow('version')
  })
  it('全件の重複・空配列・形式を検証する', () => {
    for (const value of [[], {}, null, [null], [{ id: '1', version: 'v1' }, { id: '01', version: 'v2' }, { id: '9', version: 'v9' }]]) {
      expect(() => selectReleaseVersion(value)).toThrow()
    }
  })
  it.each([
    {}, { GITHUB_ACTIONS: 'true', GITHUB_SHA: sha }, { CF_PAGES: '1', CF_PAGES_COMMIT_SHA: sha },
    { GITHUB_ACTIONS: 'true' }, { CF_PAGES: '1' },
  ])('環境ごとのSHAとcheckout HEADを照合する %j', env => {
    expect(resolveCommitSha(env, () => sha.toUpperCase() + '\n')).toBe(sha)
  })
  it('Git不在でもCI SHAを使い、双方取得不能なら開発用に空値を返す', () => {
    expect(resolveCommitSha({ GITHUB_ACTIONS: 'true', GITHUB_SHA: sha }, missing)).toBe(sha)
    expect(resolveCommitSha({}, missing)).toBe('')
  })
  it('不正値・不一致・環境の曖昧さを拒否する', () => {
    for (const value of ['', 'unknown', '0'.repeat(40)]) {
      expect(() => resolveCommitSha({ GITHUB_ACTIONS: 'true', GITHUB_SHA: value }, () => sha)).toThrow()
    }
    expect(() => resolveCommitSha({ GITHUB_ACTIONS: 'true', GITHUB_SHA: sha }, () => 'b'.repeat(40))).toThrow('HEAD')
    expect(() => resolveCommitSha({ GITHUB_ACTIONS: 'true', CF_PAGES: '1' }, () => sha)).toThrow('Ambiguous')
  })
  it('dev・prepareはGitなしを許容し配布用buildのみ拒否する', () => {
    expect(() => requireDistributionSha('', { dev: true })).not.toThrow()
    expect(() => requireDistributionSha('', { dev: false, _prepare: true })).not.toThrow()
    expect(() => requireDistributionSha('', { dev: false })).toThrow()
    expect(() => requireDistributionSha(sha, { dev: false })).not.toThrow()
  })
  it('公開configの上書きを拒否する', () => {
    expect(() => createBuildInfo('.', { NUXT_PUBLIC_BUILD_INFO_VERSION: 'other' })).toThrow('overrides')
  })
  it('同じ時計入力をUTC ISOとして一度だけ取得する', () => {
    const root = mkdtempSync(join(tmpdir(), 'monsearch-build-info-'))
    try {
      const items = join(root, 'app/utils/mockData/items')
      mkdirSync(items, { recursive: true })
      writeFileSync(join(items, 'about_release_note.json'), JSON.stringify([
        { id: '1', version: 'v1.0.0' },
      ]))
      let calls = 0
      const result = createBuildInfo(root, {}, () => {
        calls++
        return new Date('2026-11-18T14:41:04.123Z')
      })
      expect(result.builtAtUtc).toBe('2026-11-18T14:41:04.123Z')
      expect(result.version).toBe('v1.0.0')
      expect(calls).toBe(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
