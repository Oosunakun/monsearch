import assert from 'node:assert/strict'

// 生成HTML内のNuxt設定literalだけを読む。scriptやDOMは実行しない。
export function verifyAnalyticsArtifact(html, env = process.env) {
  const block = html.match(/analytics:\{([^{}]+)\}/)?.[1]
  assert(block, 'Analytics public configが生成HTMLにない')
  const value = key => {
    const literal = block.match(new RegExp(`(?:^|,)${key}:("(?:[^"\\\\]|\\\\.)*"|true|false)(?:,|$)`))?.[1]
    assert(literal !== undefined, `Analytics config欠落: ${key}`)
    return JSON.parse(literal)
  }
  const config = Object.fromEntries(['enabled', 'measurementId', 'allowedOrigin', 'environment'].map(key => [key, value(key)]))
  const enabled = env.NUXT_PUBLIC_ANALYTICS_ENABLED === 'true'
  assert.equal(config.enabled === true || config.enabled === 'true', enabled, 'Analytics enableと生成時envの不一致')
  if (enabled) {
    assert.match(env.NUXT_PUBLIC_ANALYTICS_MEASUREMENT_ID ?? '', /^G-[A-Z0-9]{4,20}$/, 'GA4測定ID不正')
    assert.equal(env.NUXT_PUBLIC_SITE_URL, 'https://monsearch.gifumoko.net', 'GA4有効化は本番origin生成のみ')
    assert.equal(env.NUXT_PUBLIC_ANALYTICS_ALLOWED_ORIGIN, 'https://monsearch.gifumoko.net', '生成時GA4許可origin不正')
    assert.equal(env.NUXT_PUBLIC_ANALYTICS_ENVIRONMENT, 'production', '生成時GA4環境不正')
    assert.equal(config.measurementId, env.NUXT_PUBLIC_ANALYTICS_MEASUREMENT_ID, 'GA4 IDの生成不一致')
    assert.equal(config.allowedOrigin, 'https://monsearch.gifumoko.net', 'GA4許可origin不正')
    assert.equal(config.environment, 'production', 'GA4環境不正')
  } else {
    assert.equal(config.measurementId, '', '無効artifactに測定IDを残さない')
  }
  // ロードはclient policy通過後のみ。生成HTMLへの外部script直挿入を禁止する。
  assert(!/<script\b[^>]*src=["'][^"']*(?:googletagmanager|google-analytics)\.com/i.test(html), 'GA scriptの静的埋め込みは禁止')
  return { enabled }
}
