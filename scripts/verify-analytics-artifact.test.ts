// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { verifyAnalyticsArtifact } from './verify-analytics-artifact.mjs'

const html = (enabled: boolean, id = '', origin = '', environment = '') =>
  `<script>window.__NUXT__.config={public:{analytics:{enabled:${enabled},measurementId:${JSON.stringify(id)},allowedOrigin:${JSON.stringify(origin)},environment:${JSON.stringify(environment)}}}}</script>`
const env = {
  NUXT_PUBLIC_ANALYTICS_ENABLED: 'true', NUXT_PUBLIC_ANALYTICS_MEASUREMENT_ID: 'G-TEST123456',
  NUXT_PUBLIC_SITE_URL: 'https://monsearch.gifumoko.net',
  NUXT_PUBLIC_ANALYTICS_ALLOWED_ORIGIN: 'https://monsearch.gifumoko.net', NUXT_PUBLIC_ANALYTICS_ENVIRONMENT: 'production',
}
describe('GA4 artifact監査', () => {
  it('Preview / 無設定はIDなし・無効。本番は生成時設定と照合', () => {
    expect(verifyAnalyticsArtifact(html(false), {})).toEqual({ enabled: false })
    expect(verifyAnalyticsArtifact(html(true, 'G-TEST123456', env.NUXT_PUBLIC_SITE_URL, 'production'), env)).toEqual({ enabled: true })
  })
  it('無効artifactに残るID、設定不一致、外部script直挿入は拒否', () => {
    expect(() => verifyAnalyticsArtifact(html(false, 'G-TEST123456'), {})).toThrow()
    expect(() => verifyAnalyticsArtifact(html(true, 'G-OTHER12345', env.NUXT_PUBLIC_SITE_URL, 'production'), env)).toThrow()
    expect(() => verifyAnalyticsArtifact(html(true, 'G-TEST123456', 'https://fork.example', 'production'), env)).toThrow()
    expect(() => verifyAnalyticsArtifact(html(false) + '<script src="https://www.googletagmanager.com/gtag/js"></script>', {})).toThrow()
  })
})
