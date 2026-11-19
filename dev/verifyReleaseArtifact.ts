import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { selectReleaseVersion } from './buildInfo.ts'
import { verifyBuildInfoArtifact } from '../scripts/verify-build-info-artifact.mjs'
import { validateVersion } from '../scripts/production-release-tag.mjs'

export const releasePages = ['index.html', 'cards.html', 'about.html', 'cards/search.html', 'rules.html',
  'restrictions.html', 'links.html', 'tournaments.html', '200.html', '404.html']

export function verifyReleaseArtifact(root: string, eventSha: string, head: string, production: boolean, expected?: unknown) {
  assert.match(eventSha, /^[a-f0-9]{40}$/)
  assert(!/^0+$/.test(eventSha))
  assert.equal(head, eventSha, 'checkout/event SHA mismatch')
  const notes: unknown = JSON.parse(readFileSync(resolve(root, 'app/utils/mockData/items/about_release_note.json'), 'utf8'))
  const version = selectReleaseVersion(notes)
  if (production) validateVersion(version)
  const info = verifyBuildInfoArtifact(resolve(root, '.output/public'), releasePages)
  assert.equal(info.version, version, 'artifact/source version mismatch')
  assert.equal(info.commitSha, eventSha, 'artifact/event SHA mismatch')
  if (expected !== undefined) assert.deepEqual(info, expected, 'quality/deploy buildInfo mismatch')
  return info
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const info = verifyReleaseArtifact(root, process.env.GITHUB_SHA ?? '',
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: root }).trim(),
    process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_REF === 'refs/heads/main',
    process.env.EXPECTED_BUILD_INFO !== undefined ? JSON.parse(process.env.EXPECTED_BUILD_INFO) : undefined)
  assert(process.env.GITHUB_OUTPUT, 'GITHUB_OUTPUT missing')
  appendFileSync(process.env.GITHUB_OUTPUT, `build-info=${JSON.stringify(info)}\n`)
}
