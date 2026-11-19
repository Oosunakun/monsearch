// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../.github/workflows/pages-ci-cd.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n')
// 既存analytics契約と同じテキスト方式。YAML parserや間接依存は不要。
const job = (name: string) => source.split(`\n  ${name}:\n`)[1]!.split(/\n {2}[a-z-]+:\n/)[0]!
const quality = job('quality'), deploy = job('deploy'), tag = job('release-tag')
const condition = (text: string) => text.match(/^ {4}if: (.+)$/m)![1]!
const evaluate = (text: string, change: Record<string, unknown> = {}, enabled = 'true', qualityResult = 'success', deployResult = 'success') =>
  runInNewContext(condition(text), { github: { repository: 'fork-owner/fork-project', event_name: 'push', ref: 'refs/heads/main', run_attempt: 1, event: { deleted: false }, ...change },
    needs: { quality: { result: qualityResult }, deploy: { result: deployResult } }, vars: { PRODUCTION_RELEASE_TAG_ENABLED: enabled } }, { timeout: 100 })
const deployScript = deploy.split('      - name: Deploy to Cloudflare Pages\n')[1]!.split('        run: |\n')[1]!.replace(/^ {10}/gm, '')

describe('R34 Workflowの認証・条件・Summary契約', () => {
  it('既存triggerはbranchのみ、dispatchやタグpushは追加しない', () => {
    expect(source.split('permissions:')[0]).toBe('name: Cloudflare Pages CI/CD\n\non:\n  pull_request:\n    branches: [main, develop, chore/release-preparation]\n  push:\n    branches: [chore/release-ci-cd, chore/release-pages-cd, chore/release-preparation, develop, main]\n\n')
    expect(source).not.toMatch(/workflow_dispatch|workflow_run|continue-on-error/)
  })
  it('writeはタグJobのみ、checkout認証もタグJobだけに保存', () => {
    expect(source).toContain('\npermissions:\n  contents: read\n')
    expect(quality + deploy).not.toMatch(/contents: write|persist-credentials: true/)
    expect(source.match(/contents: write/g)).toHaveLength(1)
    expect(tag).toContain('permissions:\n      contents: write')
    expect(tag).toContain('ref: ${{ github.sha }}\n          persist-credentials: true')
    expect(quality).toContain('persist-credentials: false')
    expect(deploy).toContain('persist-credentials: false')
  })
  it('タグJobは依存install・build・Wrangler・PAT・APIなし', () => {
    expect(tag).not.toMatch(/CLOUDFLARE|npm |wrangler|generate|GH_TOKEN|secrets\.|gh api|rulesets|Oosunakun/)
    expect(tag).toContain('BUILD_INFO: ${{ needs.quality.outputs.build-info }}')
    expect(tag).toContain('needs: [quality, deploy]')
    for (const match of tag.matchAll(/uses: (.+)/g)) expect(match[1]).toMatch(/@[a-f0-9]{40} # /)
    expect(deploy.match(/secrets.CLOUDFLARE_API_TOKEN/g)).toHaveLength(1)
  })
  it('Forkを含む現在Repositoryのmain成功だけ、Ruleset条件なし', () => {
    expect(evaluate(tag)).toBe(true)
    expect(evaluate(tag, { repository: 'another/fork' })).toBe(true)
    expect(condition(tag)).not.toMatch(/repository|ruleset/)
    for (const value of ['', 'false', 'TRUE']) expect(evaluate(tag, {}, value)).toBe(false)
  })
  it.each([{ event_name: 'pull_request' }, { ref: 'refs/heads/develop' }, { ref: 'refs/heads/feature/x' },
    { ref: 'refs/tags/v1.0.0' }, { run_attempt: 2 }, { event: { deleted: true } }])('非対象のタグ処理なし %j', change => expect(evaluate(tag, change)).toBe(false))
  it.each(['failure', 'cancelled', 'skipped'])('品質／配信が%sならタグなし', result => {
    expect(evaluate(tag, {}, 'true', result)).toBe(false)
    expect(evaluate(tag, {}, 'true', 'success', result)).toBe(false)
  })
  it('既存deploy条件を維持、再配信をWorkflow再実行で行わない', () => {
    expect(condition(deploy)).toBe("github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop') && github.run_attempt == 1 && !github.event.deleted && needs.quality.result == 'success'")
    expect(evaluate(deploy, { ref: 'refs/heads/develop' })).toBe(true)
    expect(evaluate(deploy, { run_attempt: 2 })).toBe(false)
    expect(deploy).toContain('group: pages-deploy-monsearch\n      cancel-in-progress: false\n      queue: max')
    expect(tag).toContain('group: pages-release-tag-monsearch\n      cancel-in-progress: false\n      queue: max')
  })
  it('照合・digest・先端guardを維持しWrangler成功後だけSummary', () => {
    expect(quality).toContain('node --experimental-strip-types dev/verifyReleaseArtifact.ts')
    expect(deploy).toContain('EXPECTED_BUILD_INFO: ${{ needs.quality.outputs.build-info }}')
    expect(deploy).toContain('digest-mismatch: error')
    expect(deploy.indexOf('Verify downloaded release artifact identity')).toBeLessThan(deploy.indexOf('Verify deployment identity and branch tip'))
    expect(deploy.indexOf('Verify deployment identity and branch tip')).toBeLessThan(deploy.indexOf('Deploy to Cloudflare Pages'))
    expect(deployScript).toContain('set -euo pipefail')
    expect(deployScript.indexOf('wrangler pages deploy')).toBeLessThan(deployScript.indexOf('production-release-tag.mjs deployment'))
    expect(deployScript).toContain('if [[ "$branch" == main ]]; then')
    expect(source).not.toMatch(/receipt|DEPLOYMENT_RECEIPT/)
  })
  it.each([
    ['main', 0, '', 'Production Success / Tag Skipped'],
    ['main', 0, 'true', 'Production Success'],
    ['main', 17, 'true', ''],
    ['develop', 0, 'true', ''],
  ] as const)('fake Wrangler branch=%s exit=%s enabled=%s', (branch, exitCode, enabled, expected) => {
    const root = mkdtempSync(join(tmpdir(), 'monsearch-wrangler-fake-'))
    try {
      mkdirSync(join(root, 'node_modules/.bin'), { recursive: true }); mkdirSync(join(root, 'scripts'))
      writeFileSync(join(root, 'node_modules/.bin/wrangler'), `#!/bin/sh\nexit ${exitCode}\n`, { mode: 0o755 })
      writeFileSync(join(root, 'scripts/production-release-tag.mjs'), readFileSync(new URL('./production-release-tag.mjs', import.meta.url)))
      const sha = 'a'.repeat(40), summary = join(root, 'summary')
      const result = spawnSync(process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash', ['-c', deployScript], { cwd: root, encoding: 'utf8',
        env: { ...process.env, CLOUDFLARE_API_TOKEN: 'fake', CLOUDFLARE_ACCOUNT_ID: 'fake', EVENT_REF: `refs/heads/${branch}`, EVENT_SHA: sha,
          GITHUB_REPOSITORY: 'fork-owner/fork-project', GITHUB_EVENT_NAME: 'push', GITHUB_REF: `refs/heads/${branch}`, GITHUB_SHA: sha,
          GITHUB_RUN_ID: '123', GITHUB_RUN_ATTEMPT: '1', ARTIFACT_ID: '456', GITHUB_STEP_SUMMARY: summary, RELEASE_TAG_ENABLED: enabled,
          BUILD_INFO: JSON.stringify({ version: 'v1.0.0', commitSha: sha, builtAtUtc: '2026-11-19T00:00:00.000Z' }) } })
      expect(result.error, result.stderr).toBeUndefined(); expect(result.status, result.stderr).toBe(exitCode)
      expect(existsSync(summary)).toBe(Boolean(expected))
      if (expected) expect(readFileSync(summary, 'utf8')).toContain(expected)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
