import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCardsJsonHandler } from './dev/cardsJsonHandler'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServerHandlers: [{
    route: '/data/cards.json',
    handler: createCardsJsonHandler(fileURLToPath(new URL('./app/utils/mockData/items/cards.json', import.meta.url)))
  }],
  hooks: {
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
      routes: ['/', '/cards', '/about', '/cards/search', '/rules', '/restrictions', '/links']
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
        { property: 'og:site_name', content: 'モンさーち！' }
      ],
      link: [
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
