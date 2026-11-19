import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function selectReleaseVersion(input: unknown): string {
  if (!Array.isArray(input) || input.length === 0) throw new Error('Release notes must be a non-empty array')
  const ids = new Set<number>()
  let maximum = 0
  let version = ''
  for (const [index, row] of input.entries()) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !/^\d+$/.test(row.id)
      || !Number.isSafeInteger(Number(row.id)) || Number(row.id) <= 0) {
      throw new Error(`Invalid release note id at index ${index}`)
    }
    const id = Number(row.id)
    if (ids.has(id)) throw new Error(`Duplicate release note id at index ${index}`)
    ids.add(id)
    if (typeof row.version !== 'string' || !row.version || row.version.trim() !== row.version || /[\r\n\u2028\u2029]/.test(row.version)) {
      throw new Error(`Invalid release note version at index ${index}`)
    }
    if (id > maximum) {
      maximum = id
      version = row.version
    }
  }
  return version
}

function validateSha(value: string): string {
  if (!/^[a-f\d]{40}$/i.test(value) || /^0+$/.test(value)) throw new Error('Invalid build Git SHA')
  return value.toLowerCase()
}

export function resolveCommitSha(env: NodeJS.ProcessEnv, readHead: () => string): string {
  if (env.CF_PAGES === '1' && env.GITHUB_ACTIONS === 'true') throw new Error('Ambiguous build Git environment')
  const input = env.CF_PAGES === '1' ? env.CF_PAGES_COMMIT_SHA
    : env.GITHUB_ACTIONS === 'true' ? env.GITHUB_SHA : undefined
  const candidate = input === undefined ? undefined : validateSha(input)
  let head: string | undefined
  try { head = readHead().trim() } catch { /* Git不在は配布ビルド境界で判定する。 */ }
  if (head !== undefined) head = validateSha(head)
  if (candidate && head && candidate !== head) throw new Error('Build Git SHA does not match checkout HEAD')
  return candidate ?? head ?? ''
}

export function requireDistributionSha(commitSha: string, options: { dev: boolean, _prepare?: boolean }) {
  if (!options.dev && !options._prepare) validateSha(commitSha)
}

export function createBuildInfo(root: string, env = process.env, now = () => new Date()) {
  if (Object.keys(env).some(key => key === 'NUXT_PUBLIC_BUILD_INFO' || key.startsWith('NUXT_PUBLIC_BUILD_INFO_'))) {
    throw new Error('Build info runtime overrides are not supported')
  }
  const notes: unknown = JSON.parse(readFileSync(resolve(root, 'app/utils/mockData/items/about_release_note.json'), 'utf8'))
  return {
    version: selectReleaseVersion(notes),
    commitSha: resolveCommitSha(env, () => execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    })),
    builtAtUtc: now().toISOString(),
  }
}
