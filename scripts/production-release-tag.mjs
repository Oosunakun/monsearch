import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const shaPattern = /^(?!0{40}$)[a-f0-9]{40}$/
export function validateVersion(version) {
  assert(typeof version === 'string' && /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version), 'invalid stable release version')
}
export function deploymentInfo(env) {
  assert.equal(env.GITHUB_EVENT_NAME, 'push')
  assert.equal(env.GITHUB_REF, 'refs/heads/main')
  assert.equal(env.GITHUB_RUN_ATTEMPT, '1')
  assert.match(env.GITHUB_REPOSITORY ?? '', /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
  assert.match(env.GITHUB_SHA ?? '', shaPattern)
  for (const key of ['GITHUB_RUN_ID', 'ARTIFACT_ID']) assert.match(env[key] ?? '', /^[1-9]\d*$/)
  const info = JSON.parse(env.BUILD_INFO)
  validateVersion(info.version)
  assert.equal(info.commitSha, env.GITHUB_SHA, 'artifact/event SHA mismatch')
  assert.match(info.builtAtUtc, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  assert.equal(new Date(info.builtAtUtc).toISOString(), info.builtAtUtc)
  return { version: info.version, commitSha: info.commitSha, builtAtUtc: info.builtAtUtc,
    repository: env.GITHUB_REPOSITORY, runId: env.GITHUB_RUN_ID, runAttempt: env.GITHUB_RUN_ATTEMPT,
    artifactId: env.ARTIFACT_ID, runUrl: `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}` }
}

class GitCommandError extends Error {
  constructor(operation, status) {
    super(`Git ${operation} failed (exit ${Number.isInteger(status) ? status : 'unknown'})`)
  }
}

// runnerは注入必須。importやテストから実Git操作を起動しない。
export function createReleaseTag(info, git) {
  validateVersion(info.version)
  assert.match(info.commitSha, shaPattern)
  const run = (args, operation) => {
    try { return git(args).trim() }
    catch (error) {
      // 資格情報を含むGit stderr/causeを通知へ伝搬しない。
      throw new GitCommandError(operation, error.status)
    }
  }
  assert.equal(run(['rev-parse', '--verify', 'HEAD'], 'verify_HEAD'), info.commitSha, 'checkout/event SHA mismatch')
  const ref = `refs/tags/${info.version}`
  // --exit-codeは使わない。成功＋空出力だけを不存在と扱い、照会エラーは失敗にする。
  const output = run(['ls-remote', '--tags', 'origin', ref, `${ref}^{}`], 'ls_remote')
  const refs = new Map()
  for (const line of output ? output.split(/\r?\n/) : []) {
    const match = line.match(/^([a-f0-9]{40})\t(.+)$/)
    assert(match && shaPattern.test(match[1]), 'invalid remote tag response')
    assert([ref, `${ref}^{}`].includes(match[2]) && !refs.has(match[2]), 'unexpected remote ref')
    refs.set(match[2], match[1])
  }
  if (refs.size) {
    assert(refs.has(ref), 'remote tag object missing')
    const commitSha = refs.get(`${ref}^{}`) ?? refs.get(ref)
    return { outcome: commitSha === info.commitSha ? 'Already Exists' : 'Warning',
      objectSha: refs.get(ref), commitSha, annotated: refs.has(`${ref}^{}`) }
  }
  run(['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com',
    'tag', '--annotate', '--no-sign', '--message', JSON.stringify(info), info.version, info.commitSha], 'tag_create')
  // 通常の単一ref pushのみ。競合・曖昧成功・失敗は自動復旧せずHumanへ返す。
  run(['push', '--no-follow-tags', 'origin', `${ref}:${ref}`], 'push')
  return { outcome: 'Created', commitSha: info.commitSha }
}

export function runReleaseCommand(mode, env, git) {
  assert(env.GITHUB_STEP_SUMMARY, 'GITHUB_STEP_SUMMARY missing')
  const record = (outcome, detail) => {
    appendFileSync(env.GITHUB_STEP_SUMMARY, `\nProduction Success / Tag ${outcome}\n\n\`\`\`json\n${JSON.stringify(detail, null, 2)}\n\`\`\`\n`)
  }
  let info
  try {
    info = deploymentInfo(env)
    if (mode === 'deployment') {
      if (env.RELEASE_TAG_ENABLED !== 'true') record('Skipped', { ...info, reason: 'disabled' })
      else appendFileSync(env.GITHUB_STEP_SUMMARY, `\nProduction Success\n\nTag result: see release-tag job. Run ${info.runId}, attempt ${info.runAttempt}, SHA ${info.commitSha}, artifact ${info.artifactId}.\n`)
      return
    }
    assert.equal(mode, 'tag')
    if (env.RELEASE_TAG_ENABLED !== 'true') { record('Skipped', info); return { outcome: 'Skipped' } }
    const result = createReleaseTag(info, git)
    record(result.outcome, { ...info, ...result })
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `outcome=${result.outcome}\n`)
    if (result.outcome === 'Warning') console.log(`::warning::Existing release tag preserved; deployed SHA=${info.commitSha}; tag SHA=${result.commitSha}`)
    return result
  } catch (error) {
    const diagnostic = error instanceof GitCommandError ? error.message : 'input validation or Summary output failure'
    record('Failed', { ...info, diagnostic, action: 'Human review required; no automatic redeployment, rollback, or retry' })
    // eslint-disable-next-line preserve-caught-error -- 未検証入力や資格情報を含むcauseを通知へ伝搬しない。
    throw new Error(`Production Success / Tag Failed: ${diagnostic}`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runReleaseCommand(process.argv[2], process.env, args => execFileSync('git', args, {
      encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    }))
  } catch (error) {
    console.error(`::error::${error.message}`)
    process.exitCode = 1
  }
}
