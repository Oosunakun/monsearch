// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createReleaseTag, deploymentInfo, runReleaseCommand, validateVersion } from './production-release-tag.mjs'

const sha = 'a'.repeat(40), objectSha = 'b'.repeat(40), otherSha = 'c'.repeat(40)
const info = { version: 'v1.0.0', commitSha: sha, builtAtUtc: '2026-11-19T00:00:00.000Z' }
const ref = 'refs/tags/v1.0.0'
const annotated = (commit = sha) => `${objectSha}\t${ref}\n${commit}\t${ref}^{}\n`
const failure = (status = 128) => Object.assign(new Error('secret-token: private stderr'), { status })
function fake(...responses: (string | Error)[]) {
  return vi.fn((_args: string[]) => {
    const response = responses.shift()
    if (response === undefined) throw new Error('unexpected Git command')
    if (response instanceof Error) throw response
    return response
  })
}
const roots: string[] = []
function env() {
  const root = mkdtempSync(join(tmpdir(), 'monsearch-git-tag-')); roots.push(root)
  return { GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/heads/main', GITHUB_RUN_ATTEMPT: '1',
    GITHUB_REPOSITORY: 'fork-owner/fork-project', GITHUB_SHA: sha, GITHUB_RUN_ID: '123', ARTIFACT_ID: '456',
    BUILD_INFO: JSON.stringify(info), RELEASE_TAG_ENABLED: 'true',
    GITHUB_STEP_SUMMARY: join(root, 'summary'), GITHUB_OUTPUT: join(root, 'output') }
}
beforeEach(() => { vi.stubGlobal('fetch', () => { throw new Error('network forbidden') }) })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

describe('Git標準コマンドによるcreate-only処理（全Git操作fake）', () => {
  it.each(['v0.0.0', 'v1.0.0', 'v123.45.6'])('安定版をそのまま許可 %s', version => expect(() => validateVersion(version)).not.toThrow())
  it.each(['1.0.0', 'v01.0.0', 'v1.00.0', 'v1.0.0-rc.1', 'v1.0.0+meta', ' v1.0.0', 'v1.0.0\n', 'v1/0/0', '$(secret)', ''])('不正version拒否 %j', version => expect(() => validateVersion(version)).toThrow())
  it('タグ不存在だけAnnotated Tagを作り対象refだけ一度Push', () => {
    const git = fake(sha, '', '', '')
    expect(createReleaseTag(info, git)).toEqual({ outcome: 'Created', commitSha: sha })
    expect(git.mock.calls.map(([args]) => args)).toEqual([
      ['rev-parse', '--verify', 'HEAD'], ['ls-remote', '--tags', 'origin', ref, `${ref}^{}`],
      ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
        'tag', '--annotate', '--no-sign', '--message', JSON.stringify(info), info.version, sha],
      ['push', '--no-follow-tags', 'origin', `${ref}:${ref}`],
    ])
  })
  it.each([[sha, 'Already Exists'], [otherSha, 'Warning']])('Annotatedのpeeled SHAを比較 %s', (commit, outcome) => {
    const git = fake(sha, annotated(commit))
    expect(createReleaseTag(info, git)).toEqual({ outcome, objectSha, commitSha: commit, annotated: true })
    expect(git).toHaveBeenCalledTimes(2)
  })
  it('object SHAが配信SHAと一致してもpeeled SHAが異なればWarning', () => {
    const git = fake(sha, `${sha}\t${ref}\n${otherSha}\t${ref}^{}\n`)
    expect(createReleaseTag(info, git).outcome).toBe('Warning')
  })
  it.each([[sha, 'Already Exists'], [otherSha, 'Warning']])('Lightweightも変更しない %s', (commit, outcome) => {
    const git = fake(sha, `${commit}\t${ref}\n`)
    expect(createReleaseTag(info, git)).toEqual({ outcome, objectSha: commit, commitSha: commit, annotated: false })
    expect(git).toHaveBeenCalledTimes(2)
  })
  it('照会失敗を不存在と扱わない', () => {
    const git = fake(sha, failure())
    expect(() => createReleaseTag(info, git)).toThrow('ls_remote failed')
    expect(git).toHaveBeenCalledTimes(2)
  })
  it('作成失敗はPushせずFailure、リトライなし', () => {
    const git = fake(sha, '', failure(1))
    expect(() => createReleaseTag(info, git)).toThrow('tag_create failed')
    expect(git).toHaveBeenCalledTimes(3)
  })
  it.each([1, 128])('Push失敗exit %sで再照会・再試行しない', status => {
    const git = fake(sha, '', '', failure(status))
    expect(() => createReleaseTag(info, git)).toThrow('push failed')
    expect(git).toHaveBeenCalledTimes(4)
  })
  it('HEAD不一致で照会しない', () => {
    const git = fake(otherSha)
    expect(() => createReleaseTag(info, git)).toThrow('checkout/event')
    expect(git).toHaveBeenCalledTimes(1)
  })
  it.each(['garbage', `${sha}\t${ref}-extra`, `${sha}\t${ref}^{}\n`, `${sha}\t${ref}\n${sha}\t${ref}`])('不正照会応答は作成しない %j', response => {
    const git = fake(sha, response)
    expect(() => createReleaseTag(info, git)).toThrow()
    expect(git).toHaveBeenCalledTimes(2)
  })
  it('同Commit再配信は無変更、別Commit再配信も既存タグ保持', () => {
    const git = fake(sha, '', '', '', sha, annotated(), otherSha, annotated())
    expect(createReleaseTag(info, git).outcome).toBe('Created')
    expect(createReleaseTag(info, git).outcome).toBe('Already Exists')
    expect(createReleaseTag({ ...info, commitSha: otherSha }, git).outcome).toBe('Warning')
    expect(git.mock.calls.filter(([args]) => args[0] === 'push')).toHaveLength(1)
    expect(git.mock.calls.filter(([args]) => args.includes('tag'))).toHaveLength(1)
    expect(git.mock.calls.flat(2)).not.toContain('--force')
  })
  it('既存v1.0.0のSHAをfixtureで保持', () => {
    const existingObject = '646c0f292029b3022aa5b9b929566020ceb82ef2', existingCommit = 'cfd6d8a2e511509b9ff87b4398ac6c8a9212fc33'
    const git = fake(sha, `${existingObject}\t${ref}\n${existingCommit}\t${ref}^{}\n`)
    expect(createReleaseTag(info, git)).toMatchObject({ objectSha: existingObject, commitSha: existingCommit, outcome: 'Warning' })
    expect(git.mock.calls.every(([args]) => ['rev-parse', 'ls-remote'].includes(args[0]!))).toBe(true)
  })
})

describe('Production成功とSummary結果の分離', () => {
  it('Forkの実行Repositoryから追跡情報を得る', () => {
    expect(deploymentInfo(env())).toMatchObject({ repository: 'fork-owner/fork-project', runUrl: 'https://github.com/fork-owner/fork-project/actions/runs/123' })
  })
  it.each([{ GITHUB_EVENT_NAME: 'pull_request' }, { GITHUB_REF: 'refs/heads/develop' }, { GITHUB_RUN_ATTEMPT: '2' }, { GITHUB_SHA: otherSha }])('非Production／再実行／不正SHAはGit操作0件 %j', change => {
    const git = fake()
    expect(() => runReleaseCommand('tag', { ...env(), ...change }, git)).toThrow()
    expect(git).not.toHaveBeenCalled()
  })
  it.each(['', 'false'])('配信成功時無効ならTag Skippedを記録 %j', enabled => {
    const variables = { ...env(), RELEASE_TAG_ENABLED: enabled }, git = fake()
    runReleaseCommand('deployment', variables, git)
    expect(readFileSync(variables.GITHUB_STEP_SUMMARY, 'utf8')).toContain('Production Success / Tag Skipped')
    expect(git).not.toHaveBeenCalled()
  })
  it('無効なtagモードもGit操作しない', () => {
    const variables = { ...env(), RELEASE_TAG_ENABLED: '' }, git = fake()
    expect(runReleaseCommand('tag', variables, git)).toEqual({ outcome: 'Skipped' })
    expect(git).not.toHaveBeenCalled()
  })
  it.each([
    { replies: [sha, '', '', ''], outcome: 'Created' },
    { replies: [sha, annotated()], outcome: 'Already Exists' },
    { replies: [sha, annotated(otherSha)], outcome: 'Warning' },
  ])('$outcomeをSummaryとoutputへ明示', ({ replies, outcome }) => {
    const variables = env(), log = vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(runReleaseCommand('tag', variables, fake(...replies))).toMatchObject({ outcome })
    expect(readFileSync(variables.GITHUB_STEP_SUMMARY, 'utf8')).toContain(`Production Success / Tag ${outcome}`)
    expect(readFileSync(variables.GITHUB_OUTPUT, 'utf8')).toContain(`outcome=${outcome}`)
    expect(log.mock.calls.length).toBe(outcome === 'Warning' ? 1 : 0)
  })
  it('Push失敗でもProduction Success維持、秘密を漏らさずFailure', () => {
    const variables = env(), git = fake(sha, '', '', failure())
    expect(() => runReleaseCommand('tag', variables, git)).toThrow('Tag Failed')
    const summary = readFileSync(variables.GITHUB_STEP_SUMMARY, 'utf8')
    expect(summary).toContain('Production Success / Tag Failed')
    expect(summary).toContain('push failed')
    expect(summary).not.toContain('secret-token')
    expect(git).toHaveBeenCalledTimes(4)
  })
  it('有効時の配信記録はGit操作せず成功事実と別Job参照を記録', () => {
    const variables = env(), git = fake()
    runReleaseCommand('deployment', variables, git)
    expect(readFileSync(variables.GITHUB_STEP_SUMMARY, 'utf8')).toContain('Production Success')
    expect(readFileSync(variables.GITHUB_STEP_SUMMARY, 'utf8')).toContain('release-tag job')
    expect(git).not.toHaveBeenCalled()
  })
})
