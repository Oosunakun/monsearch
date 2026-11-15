// @vitest-environment node
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const workflow = readFileSync(new URL('../.github/workflows/pages-ci-cd.yml', import.meta.url), 'utf8')
const settings = [...workflow.matchAll(/NUXT_PUBLIC_ANALYTICS_(\w+): \$\{\{ (.+) \}\}/g)]
const evaluate = (repository: string, event_name: string, ref: string, vars: Record<string, string> = {}) =>
  Object.fromEntries(settings.slice(0, 4).map(([, key, expression]) =>
    [key, runInNewContext(expression!, { github: { repository, event_name, ref }, vars }, { timeout: 100 })]))

describe('生成時GA4設定のWorkflow条件', () => {
  it('generateとartifact監査の注入条件が同じ', () => {
    expect(settings).toHaveLength(8)
    expect(settings.slice(0, 4).map(match => match[0])).toEqual(settings.slice(4).map(match => match[0]))
  })
  it.each([
    ['Oosunakun/monsearch', 'pull_request', 'refs/pull/3/merge'],
    ['Oosunakun/monsearch', 'push', 'refs/heads/develop'],
    ['Oosunakun/monsearch', 'push', 'refs/heads/feature/ga4-analytics'],
    ['fork/monsearch', 'push', 'refs/heads/main'],
  ])('%s %s %sはVariablesを持っていても無効', (repo, event, ref) => {
    expect(evaluate(repo, event, ref, { GA4_ENABLED: 'true', GA4_MEASUREMENT_ID: 'G-TEST123456' }))
      .toEqual({ ENABLED: 'false', MEASUREMENT_ID: '', ALLOWED_ORIGIN: '', ENVIRONMENT: '' })
  })
  it('本番もVariables未登録では無効。明示有効化時だけIDを注入', () => {
    expect(evaluate('Oosunakun/monsearch', 'push', 'refs/heads/main').ENABLED).toBe('false')
    expect(evaluate('Oosunakun/monsearch', 'push', 'refs/heads/main', { GA4_ENABLED: 'false', GA4_MEASUREMENT_ID: 'G-TEST123456' }).MEASUREMENT_ID).toBe('')
    expect(evaluate('Oosunakun/monsearch', 'push', 'refs/heads/main', { GA4_ENABLED: 'true', GA4_MEASUREMENT_ID: 'G-TEST123456' }))
      .toEqual({ ENABLED: 'true', MEASUREMENT_ID: 'G-TEST123456', ALLOWED_ORIGIN: 'https://monsearch.gifumoko.net', ENVIRONMENT: 'production' })
  })
})
