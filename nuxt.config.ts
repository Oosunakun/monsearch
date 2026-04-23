// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      autoSubfolderIndex: false
    }
  },
  modules: [
    'vuetify-nuxt-module'
  ],
  ssr: true,
  typescript: {
    shim: false,
    strict: true
  },
  devtools: { enabled: true }
})
