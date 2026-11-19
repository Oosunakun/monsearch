// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { releasePages, verifyReleaseArtifact } from './verifyReleaseArtifact'

const sha = 'a'.repeat(40)
const info = { version: 'v1.0.0', commitSha: sha, builtAtUtc: '2026-11-19T00:00:00.000Z' }
const roots: string[] = []
function fixture(notes: unknown = [{ id: '1', version: 'v1.0.0' }], value = info) {
  const root = mkdtempSync(join(tmpdir(), 'monsearch-release-'))
  roots.push(root)
  const notesFile = join(root, 'app/utils/mockData/items/about_release_note.json')
  mkdirSync(dirname(notesFile), { recursive: true })
  writeFileSync(notesFile, JSON.stringify(notes))
  for (const page of releasePages) {
    const file = join(root, '.output/public', page)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `<script>window.__NUXT__={config:{public:{buildInfo:${JSON.stringify(value)}}}}</script>`)
  }
  return root
}
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
describe('R34成果物とR42正本の照合', () => {
  it('数値最大IDを共用し元versionを変更しない', () => {
    const value = { ...info, version: 'v2.0.0' }
    const root = fixture([{ id: '10', version: value.version }, { id: '2', version: 'v9.0.0' }], value)
    expect(verifyReleaseArtifact(root, sha, sha, true, value)).toEqual(value)
  })
  it.each([{ notes: [] }, { notes: [{ id: '1', version: 'v1.0.0' }, { id: '01', version: 'v1.0.0' }] }, { notes: [{ id: 'x', version: 'v1.0.0' }] }])('正本異常を拒否 %j', ({ notes }) => {
    expect(() => verifyReleaseArtifact(fixture(notes), sha, sha, true)).toThrow()
  })
  it('配信済みversionを正本へ合わせて書き換えない', () => {
    expect(() => verifyReleaseArtifact(fixture([{ id: '1', version: 'v2.0.0' }]), sha, sha, true)).toThrow('version mismatch')
  })
  it.each(['', '0'.repeat(40), 'a'.repeat(7), 'A'.repeat(40)])('不正event SHA拒否 %s', value => {
    expect(() => verifyReleaseArtifact(fixture(), value, value, true)).toThrow()
  })
  it('HEADとevent SHA不一致', () => expect(() => verifyReleaseArtifact(fixture(), sha, 'b'.repeat(40), true)).toThrow('checkout/event'))
  it('成果物SHA不一致', () => expect(() => verifyReleaseArtifact(fixture(undefined, { ...info, commitSha: 'b'.repeat(40) }), sha, sha, true)).toThrow('artifact/event'))
  it('qualityとdeployの日時不一致', () => expect(() => verifyReleaseArtifact(fixture(), sha, sha, true, { ...info, builtAtUtc: '2026-11-19T01:00:00.000Z' })).toThrow('quality/deploy'))
  it('欠損ページを拒否', () => {
    const root = fixture()
    rmSync(join(root, '.output/public/404.html'))
    expect(() => verifyReleaseArtifact(root, sha, sha, true)).toThrow()
  })
  it('ページ間不一致を拒否', () => {
    const root = fixture()
    writeFileSync(join(root, '.output/public/about.html'), `<script>window.__NUXT__={config:{public:{buildInfo:${JSON.stringify({ ...info, version: 'v9.0.0' })}}}}</script>`)
    expect(() => verifyReleaseArtifact(root, sha, sha, true)).toThrow('不一致')
  })
  it('R42自由表示契約は維持しProductionのみ安定版Gate', () => {
    const value = { ...info, version: 'preview-release' }
    const root = fixture([{ id: '1', version: value.version }], value)
    expect(verifyReleaseArtifact(root, sha, sha, false)).toEqual(value)
    expect(() => verifyReleaseArtifact(root, sha, sha, true)).toThrow('stable release')
  })
})
