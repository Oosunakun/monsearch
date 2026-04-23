// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    'vuetify-nuxt-module'
  ],
  typescript: {
    shim: false,
    strict: true
  },
  devtools: { enabled: true }
})
