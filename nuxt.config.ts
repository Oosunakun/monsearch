import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCardsJsonHandler } from './dev/cardsJsonHandler'
import { createBuildInfo, requireDistributionSha } from './dev/buildInfo'

const buildInfo = createBuildInfo(fileURLToPath(new URL('.', import.meta.url)))

const siteUrlInput = process.env.NUXT_PUBLIC_SITE_URL
let siteUrl = ''
if (siteUrlInput !== undefined && siteUrlInput !== '') {
  let parsed: URL
  try {
    parsed = new URL(siteUrlInput)
  } catch {
    throw new Error('NUXT_PUBLIC_SITE_URL must be an HTTPS origin')
  }
  if (!/^https:\/\/[^/]+\/?$/i.test(siteUrlInput) || siteUrlInput !== siteUrlInput.trim() || parsed.protocol !== 'https:'
    || parsed.username || parsed.password || parsed.pathname !== '/'
    || parsed.search || parsed.hash || siteUrlInput.includes('?') || siteUrlInput.includes('#')
    || siteUrlInput.includes('\\')) {
    throw new Error('NUXT_PUBLIC_SITE_URL must be an HTTPS origin without credentials, path, query or hash')
  }
  siteUrl = parsed.origin
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      buildInfo,
      siteUrl,
      analytics: {
        enabled: false,
        measurementId: '',
        allowedOrigin: '',
        environment: '',
      },
    }
  },
  devServerHandlers: [{
    route: '/data/cards.json',
    handler: createCardsJsonHandler(fileURLToPath(new URL('./app/utils/mockData/items/cards.json', import.meta.url)))
  }],
  hooks: {
    ready(nuxt) {
      nuxt.hook('build:before', () => requireDistributionSha(buildInfo.commitSha, nuxt.options))
    },
    async 'nitro:build:public-assets'(nitro) {
      const target = join(nitro.options.output.publicDir, 'data/cards.json')
      await mkdir(dirname(target), { recursive: true })
      await copyFile(fileURLToPath(new URL('./app/utils/mockData/items/cards.json', import.meta.url)), target)
    }
  },
  compatibilityDate: '2026-04-26',
  nitro: {
    preset: 'static',
    prerender: {
      autoSubfolderIndex: false,
      crawlLinks: false,
      failOnError: true,
      routes: ['/', '/cards', '/about', '/cards/search', '/rules', '/restrictions', '/links', '/tournaments']
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/cards': { prerender: true },
    '/about': { prerender: true },
    '/cards/search': { prerender: true },
    '/rules': { prerender: true },
    '/restrictions': { prerender: true },
    '/links': { prerender: true },
    '/tournaments': { prerender: true },
    '/api/**': { prerender: false }
  },
  modules: [
    'vuetify-nuxt-module',
    '@nuxt/eslint'
  ],
  ssr: true,
  typescript: {
    shim: false,
    strict: true
  },
  app: {
    head: {
      title: 'モンさーち！｜モンコレカード検索サイト',
      htmlAttrs: {
        lang: 'ja'
      },
      meta: [
        { name: 'description', content: '「モンスター・コレクション」のカード情報や関連情報をまとめた、非公式ファンサイトです。' },
        { property: 'og:title', content: 'モンさーち！｜モンコレカード検索サイト' },
        { property: 'og:description', content: '「モンスター・コレクション」のカード情報や関連情報をまとめた、非公式ファンサイトです。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ja_JP' },
        { property: 'og:site_name', content: 'モンさーち！' },
        { name: 'twitter:card', content: 'summary_large_image' },
        ...(siteUrl ? [
          { property: 'og:image', content: `${siteUrl}/images/meta/ogp.png` },
          { property: 'og:image:alt', content: 'モンさーち！｜モンコレカード検索サイト' },
          { property: 'og:image:type', content: 'image/png' },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' }
        ] : [])
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap' 
        }
      ]
    }
  },
  css: [
    '~~/assets/css/main.css'
  ],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'myCustomTheme',
        themes: {
          myCustomTheme: {
            dark: false, // 今回はライトテーマとして定義
            colors: {
              primary: '#7EBA03',
              'primary-light': '#BEDC81', // キャメルケースよりケバブケースが推奨されます
              accent: '#009DA5',
              'accent-light': '#93CACF',
              // Vuetifyの基本カラーも定義しておくと便利です
              secondary: '#BEDC81', 
              surface: '#FFFFFF',
              background: '#F5F5F5',
              'on-surface': '#333333', // textDarkの色をここに割り当て
            }
          }
        },
      },
      display: {
        mobileBreakpoint: 'md',
      },
    },
    moduleOptions: {
      prefixComposables: true,
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },
  devtools: { enabled: true }
})
