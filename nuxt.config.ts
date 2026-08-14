// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-26',
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      autoSubfolderIndex: false
    }
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
